// src/features/PdfMerger.tsx
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { DndContext, closestCenter } from '@dnd-kit/core';
import { SortableContext, rectSortingStrategy } from '@dnd-kit/sortable';
import { PDFDocument } from 'pdf-lib';
import * as pdfjsLib from 'pdfjs-dist';

import { FileUpload } from '@/components/FileUpload';
import { Button } from '@/components/ui/button';
import { SortableCard } from '@/components/SortableCard';
import { LoadingOverlay } from '@/components/LoadingOverlay';
import { useDndReorder } from '@/hooks/useDndReorder';
import { useHiddenFileInput } from '@/hooks/useHiddenFileInput';
import { useI18n } from '@/i18n/i18n';
import { AppFile } from '@/App';
import { useAppendDropzone } from '@/hooks/useAppendDropzone';

// ✅ Vite/ESM 환경: .mjs 워커를 명시적으로 지정
pdfjsLib.GlobalWorkerOptions.workerSrc = new URL('pdfjs-dist/build/pdf.worker.min.mjs', import.meta.url).toString();

interface PdfMergerProps {
    pdfFiles: AppFile[];
    setPdfFiles: React.Dispatch<React.SetStateAction<AppFile[]>>;
}

type ThumbnailCache = Map<string, string>; // id -> objectURL

/** 첫 페이지를 그려 objectURL로 반환 (pdf.js v4 호환) */
async function renderPdfFirstPageThumbnail(file: File, scale = 0.35): Promise<string> {
    const buf = await file.arrayBuffer();
    const loadingTask = pdfjsLib.getDocument({ data: buf });
    const pdf = await loadingTask.promise;
    const page = await pdf.getPage(1);

    const dpr = window.devicePixelRatio || 1;
    const viewport = page.getViewport({ scale: scale * dpr });

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d')!;
    canvas.width = Math.floor(viewport.width);
    canvas.height = Math.floor(viewport.height);

    // ✅ v4: canvas 필수
    await page.render({
        canvasContext: ctx,
        viewport,
        canvas,
    }).promise;

    const blob: Blob = await new Promise((resolve, reject) =>
        canvas.toBlob((b) => (b ? resolve(b) : reject(new Error('toBlob failed'))), 'image/png')
    );
    return URL.createObjectURL(blob);
}

/** 여러 PDF 병합 */
async function mergePdfFiles(files: File[]): Promise<Uint8Array> {
    const merged = await PDFDocument.create();
    for (const file of files) {
        const bytes = new Uint8Array(await file.arrayBuffer());
        const src = await PDFDocument.load(bytes);
        const pages = await merged.copyPages(src, src.getPageIndices());
        pages.forEach((p) => merged.addPage(p));
    }
    return merged.save();
}

/** 각 항목 썸네일을 독립적으로 생성/표시하는 자식 컴포넌트 */
function PdfThumbCard({
    item,
    index,
    cache,
    onRemove,
}: {
    item: AppFile;
    index: number;
    cache: ThumbnailCache;
    onRemove: (id: string) => void;
}) {
    const [thumbUrl, setThumbUrl] = useState<string | null>(() => cache.get(item.id) ?? null);
    const [error, setError] = useState<string | null>(null);

    // 썸네일 생성 (캐시 우선)
    useEffect(() => {
        let alive = true;

        (async () => {
            try {
                if (cache.has(item.id)) {
                    if (alive) setThumbUrl(cache.get(item.id)!);
                    return;
                }
                const url = await renderPdfFirstPageThumbnail(item.file, 0.35);
                if (!alive) {
                    URL.revokeObjectURL(url);
                    return;
                }
                cache.set(item.id, url);
                setThumbUrl(url);
            } catch (e: any) {
                console.error('thumbnail error', e);
                if (alive) setError(e?.message || 'Thumbnail error');
            }
        })();

        return () => {
            alive = false;
        };
    }, [item.id, item.file, cache]);

    return (
        <SortableCard id={item.id} index={index} onRemove={onRemove} title={item.name} aspect="1/1.414">
            {error ? (
                <div className="flex h-full w-full items-center justify-center bg-muted text-xs text-destructive px-2 text-center">
                    {error}
                </div>
            ) : thumbUrl ? (
                <img src={thumbUrl} alt={item.name} className="w-full h-full object-contain" />
            ) : (
                // ✅ 문제 2: 로딩 중에도 프레임 유지 + 스켈레톤
                <div className="flex items-center justify-center h-full w-full bg-muted animate-pulse" />
            )}
        </SortableCard>
    );
}

export default function PdfMerger({ pdfFiles, setPdfFiles }: PdfMergerProps) {
    const [isMerging, setIsMerging] = useState(false);
    const [thumbCache] = useState<ThumbnailCache>(() => new Map());
    const { t } = useI18n();

    // 공통 DnD 훅
    const { sensors, onDragEnd } = useDndReorder(setPdfFiles);

    // 공통 파일 입력 훅
    const { open, inputProps } = useHiddenFileInput((files) => {
        const picked = files.filter((f) => f.type === 'application/pdf');
        if (picked.length !== files.length) {
            toast.warning(t('toastWarnTypePdf') || 'Only PDF is allowed.');
        }
        const newFiles: AppFile[] = picked.map((file) => ({
            id: crypto.randomUUID(),
            file,
            name: file.name,
        }));
        setPdfFiles((prev) => [...prev, ...newFiles]);
    });

    const handleReset = () => {
        setPdfFiles([]);
        for (const [, url] of thumbCache) {
            URL.revokeObjectURL(url);
        }
        thumbCache.clear();
    };

    const handleMerge = async () => {
        if (pdfFiles.length === 0) {
            toast.warning(t('toastWarnAddPdfs') || 'Add PDFs first.');
            return;
        }
        setIsMerging(true);
        try {
            const bytes = await mergePdfFiles(pdfFiles.map((f) => f.file));
            const blob = new Blob([bytes.buffer as ArrayBuffer], { type: 'application/pdf' });
            const url = URL.createObjectURL(blob);

            const a = document.createElement('a');
            a.href = url;
            a.download = 'merged.pdf';
            document.body.appendChild(a);
            a.click();
            a.remove();
            URL.revokeObjectURL(url);

            toast.success(t('toastSuccessPdfMerge') || 'Merged!');
            setPdfFiles([]);
            // (선택) 썸네일 캐시 정리하고 싶다면 여기서 loop 돌며 revoke
            // for (const [, u] of thumbCache) URL.revokeObjectURL(u); thumbCache.clear();
        } catch (e) {
            console.error(e);
            toast.error(t('toastErrorPdfMerge') || 'Merge failed.');
        } finally {
            setIsMerging(false);
        }
    };

    const addPdfs = (files: File[]) => {
        const picked = files.filter((f) => f.type === 'application/pdf');
        if (picked.length !== files.length) toast.warning(t('toastWarnTypePdf'));
        const newFiles = picked.map((file) => ({ id: crypto.randomUUID(), file, name: file.name }));
        setPdfFiles((prev) => [...prev, ...newFiles]);
    };

    const {
        getRootProps: getAppendRootProps,
        getInputProps: getAppendInputProps,
        isDragActive,
    } = useAppendDropzone({
        onFiles: addPdfs,
        accept: { 'application/pdf': ['.pdf'] },
    });

    return (
        <div className="relative">
            {isMerging && <LoadingOverlay isBlur={true} />}

            {pdfFiles.length === 0 ? (
                <>
                    <div className="text-center mb-6 space-y-2">
                        <h2 className="text-xl font-semibold">{t('pdfMergeInfoTitle')}</h2>
                        <p className="text-muted-foreground">{t('pdfMergeInfoP1')}</p>
                        <p className="text-muted-foreground">{t('pdfMergeInfoP2')}</p>
                    </div>
                    <FileUpload
                        onFilesAccepted={(files) => inputProps.onChange({ target: { files } } as any)}
                        title={t('fileUploadPdfTitle')}
                        description={t('fileUploadPdfDescription')}
                        accept={{ 'application/pdf': ['.pdf'] }}
                    />
                </>
            ) : (
                <div {...getAppendRootProps({ className: 'relative' })}>
                    <input {...getAppendInputProps()} />

                    {isDragActive && (
                        <div className="pointer-events-none absolute inset-2 md:inset-4 z-40">
                            <div
                                className="
        h-full w-full rounded-2xl
        border-2 border-dashed border-accent/60
        ring-4 ring-accent/20
        bg-background/60
        backdrop-blur-sm backdrop-saturate-150 backdrop-brightness-90
        grid place-items-center
        transition-all
      "
                            >
                                <span
                                    className="
          px-3 py-1 rounded-md
          bg-card/85 text-foreground shadow-sm
          text-sm md:text-base font-semibold tracking-tight
        "
                                >
                                    {t('dropHere')}
                                </span>
                            </div>
                        </div>
                    )}

                    <div className="space-y-6">
                        <h3 className="text-xl font-semibold">{t('pdfListTitle')}</h3>

                        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
                            <SortableContext items={pdfFiles.map((i) => i.id)} strategy={rectSortingStrategy}>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    {pdfFiles.map((item, index) => (
                                        <PdfThumbCard
                                            key={item.id}
                                            item={item}
                                            index={index}
                                            cache={thumbCache}
                                            onRemove={(id) => setPdfFiles((prev) => prev.filter((it) => it.id !== id))}
                                        />
                                    ))}
                                </div>
                            </SortableContext>
                        </DndContext>

                        <div className="flex justify-center gap-4">
                            <input {...inputProps} accept="application/pdf" multiple />
                            <Button variant="destructive" onClick={handleReset}>
                                {t('reset')}
                            </Button>
                            <Button variant="outline" onClick={open} className="cursor-pointer">
                                {t('addFile')}
                            </Button>
                            <Button onClick={handleMerge} disabled={isMerging} className="cursor-pointer">
                                {isMerging ? t('merging') : t('mergePdfs', { count: pdfFiles.length })}
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
