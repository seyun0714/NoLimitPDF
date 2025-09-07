import { useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import { FileUpload } from '@/components/FileUpload';
import { Button } from '@/components/ui/button';
import { FileText, X } from 'lucide-react';
import { PDFDocument } from 'pdf-lib';
import { DndContext, closestCenter, DragEndEvent, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { SortableContext, rectSortingStrategy, useSortable, arrayMove } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { AppFile } from '@/App';

// pdfjs-dist (Vite) — 워커를 import 해서 지정
import * as pdfjsLib from 'pdfjs-dist';
import { useI18n } from '@/i18n/i18n';

pdfjsLib.GlobalWorkerOptions.workerSrc = new URL('pdfjs-dist/build/pdf.worker.min.mjs', import.meta.url).toString();

type ThumbnailCache = Map<string, { url: string; revoke: () => void }>;

function usePdfThumbnail(id: string, file: File, cache: ThumbnailCache): { url: string; revoke: () => void } | null {
    const [thumb, setThumb] = useState<{ url: string; revoke: () => void } | null>(() => cache.get(id) || null);
    useEffect(() => {
        if (cache.has(id)) {
            setThumb(cache.get(id)!);
            return;
        }

        let revokedUrl: string | null = null;
        let cancelled = false;

        (async () => {
            try {
                const arrayBuffer = await file.arrayBuffer();
                const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
                const page = await pdf.getPage(1);

                const viewport = page.getViewport({ scale: 0.3 });
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d')!;
                canvas.width = viewport.width;
                canvas.height = viewport.height;
                await page.render({ canvasContext: ctx, viewport, canvas }).promise;

                const blob = await new Promise<Blob | null>((res) => canvas.toBlob(res, 'image/png'));
                if (!blob) throw new Error('thumbnail toBlob failed');
                const url = URL.createObjectURL(blob);
                revokedUrl = url;

                const newThumb = { url, revoke: () => URL.revokeObjectURL(url) };
                if (!cancelled) {
                    cache.set(id, newThumb);
                    setThumb(newThumb);
                }
            } catch {
                // 썸네일 생성 실패
            }
        })();

        return () => {
            cancelled = true;
            if (revokedUrl) URL.revokeObjectURL(revokedUrl);
        };
    }, [id, file, cache]);

    return thumb;
}

interface SortablePdfItemProps {
    item: AppFile;
    index: number;
    onRemove: (id: string) => void;
    cache: ThumbnailCache;
}

function SortablePdfItem({ item, onRemove, index, cache }: SortablePdfItemProps) {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging, isSorting } = useSortable({
        id: item.id,
    });
    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        zIndex: isDragging ? 999 : isSorting ? 2 : 1, // 드래그 중 최상단
    };
    const thumb = usePdfThumbnail(item.id, item.file, cache);

    return (
        <div ref={setNodeRef} style={style} {...attributes} className="relative group touch-none">
            <div {...listeners} className="cursor-grab active:cursor-grabbing">
                <div className="rounded-md overflow-hidden border bg-card aspect-[1/1.414]">
                    <span className="absolute top-1 left-1 bg-black/60 text-white text-xs px-2 py-0.5 rounded">
                        {index + 1}
                    </span>
                    {thumb ? (
                        <img src={thumb.url} alt={item.id} className="w-full h-full object-contain" />
                    ) : (
                        <div className="flex items-center justify-center h-full bg-muted">
                            <FileText className="h-10 w-10 text-muted-foreground" />
                        </div>
                    )}
                </div>
            </div>
            <div className="mt-2 text-sm truncate">{item.name}</div>
            <Button
                variant="destructive"
                size="icon"
                className="absolute top-1 right-1 h-6 w-6 opacity-0 group-hover:opacity-100 cursor-pointer"
                onClick={() => onRemove(item.id)}
            >
                <X className="h-4 w-4" />
            </Button>
        </div>
    );
}

interface PdfMergerProps {
    pdfFiles: AppFile[];
    setPdfFiles: React.Dispatch<React.SetStateAction<AppFile[]>>;
}

export function PdfMerger({ pdfFiles, setPdfFiles }: PdfMergerProps) {
    const [thumbnailCache] = useState<ThumbnailCache>(() => new Map());
    const [isMerging, setIsMerging] = useState(false);
    const sensors = useSensors(useSensor(PointerSensor));
    const hiddenInputRef = useRef<HTMLInputElement | null>(null);
    const { t } = useI18n();

    const handleFilesAccepted = (acceptedFiles: File[]) => {
        const newFiles: AppFile[] = acceptedFiles
            .filter((f) => f.type === 'application/pdf')
            .map((file) => ({
                id: crypto.randomUUID(), // ✅ 고유 ID 생성
                file,
                name: file.name,
            }));
        if (newFiles.length !== acceptedFiles.length) {
            toast.warning('toastWarnTypePdf');
        }
        setPdfFiles((prev) => [...prev, ...newFiles]);
    };

    const handleRemovePdf = (idToRemove: string) => {
        setPdfFiles((prev) => prev.filter((item) => item.id !== idToRemove));
    };

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;
        if (over && active.id !== over.id) {
            setPdfFiles((items) => {
                const oldIndex = items.findIndex((item) => item.id === active.id);
                const newIndex = items.findIndex((item) => item.id === over.id);
                return arrayMove(items, oldIndex, newIndex);
            });
        }
    };

    const handleMergePdfs = async () => {
        if (pdfFiles.length < 2) {
            toast.error(t('toastErrorMergeMinFiles'));
            return;
        }
        setIsMerging(true);
        try {
            const mergedPdf = await PDFDocument.create();
            for (const item of pdfFiles) {
                const fileBuffer = await item.file.arrayBuffer();
                const pdfToMerge = await PDFDocument.load(fileBuffer);
                const copiedPages = await mergedPdf.copyPages(pdfToMerge, pdfToMerge.getPageIndices());
                copiedPages.forEach((page) => mergedPdf.addPage(page));
            }
            const mergedPdfBytes = await mergedPdf.save();
            const blob = new Blob([mergedPdfBytes.buffer as ArrayBuffer], { type: 'application/pdf' });
            const url = URL.createObjectURL(blob);
            const a = Object.assign(document.createElement('a'), { href: url, download: 'merged.pdf' });
            document.body.appendChild(a);
            a.click();
            a.remove();
            URL.revokeObjectURL(url);

            toast.success(t('toastSuccessMerge'));
            setPdfFiles([]);
        } catch (err) {
            console.error(err);
            toast.error(t('toastErrorMerge'));
        } finally {
            setIsMerging(false);
        }
    };

    const openFilePicker = () => hiddenInputRef.current?.click();

    return (
        <div className="relative">
            {isMerging && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
                    <div className="h-12 w-12 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
                </div>
            )}
            {pdfFiles.length === 0 && (
                <FileUpload
                    onFilesAccepted={handleFilesAccepted}
                    title={t('fileUploadPdfTitle')}
                    description={t('fileUploadPdfDescription')}
                    accept={{ 'application/pdf': ['.pdf'] }}
                />
            )}

            {pdfFiles.length > 0 && (
                <div className="space-y-6">
                    <h3 className="text-xl font-semibold">{t('pdfListTitle')}</h3>

                    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                        <SortableContext items={pdfFiles.map((item) => item.id)} strategy={rectSortingStrategy}>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                {pdfFiles.map((item, index) => (
                                    <SortablePdfItem
                                        key={item.id} // ✅ key를 고유 ID로 사용
                                        index={index}
                                        item={item}
                                        onRemove={handleRemovePdf}
                                        cache={thumbnailCache}
                                    />
                                ))}
                            </div>
                        </SortableContext>
                    </DndContext>

                    <div className="flex justify-center gap-4">
                        <input
                            ref={hiddenInputRef}
                            type="file"
                            accept="application/pdf"
                            multiple
                            className="hidden"
                            onChange={(e) => {
                                const files = Array.from(e.target.files ?? []);
                                if (files.length) handleFilesAccepted(files);
                            }}
                        />
                        <Button className="cursor-pointer" variant="outline" onClick={() => openFilePicker()}>
                            {t('addFile')}
                        </Button>
                        <Button className="cursor-pointer" onClick={handleMergePdfs} disabled={isMerging}>
                            {isMerging ? t('merging') : t('mergePdfs', { count: pdfFiles.length })}
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
}
