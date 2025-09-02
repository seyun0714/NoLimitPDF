import { useEffect, useMemo, useRef, useState } from 'react';
import { toast } from 'sonner';
import { FileUpload } from '@/components/FileUpload';
import { Button } from '@/components/ui/button';
import { FileText, X } from 'lucide-react';
import { PDFDocument } from 'pdf-lib';
import { DndContext, closestCenter, DragEndEvent, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { SortableContext, rectSortingStrategy, useSortable, arrayMove } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

// pdfjs-dist (Vite) — 워커를 import 해서 지정
import * as pdfjsLib from 'pdfjs-dist';
import { useI18n } from '@/i18n/i18n';

pdfjsLib.GlobalWorkerOptions.workerSrc = new URL('pdfjs-dist/build/pdf.worker.min.mjs', import.meta.url).toString();
type PdfThumb = { url: string; revoke: () => void };

function usePdfThumbnail(file: File): PdfThumb | null {
    const [thumb, setThumb] = useState<PdfThumb | null>(null);

    useEffect(() => {
        let revokedUrl: string | null = null;
        let cancelled = false;

        (async () => {
            try {
                const arrayBuffer = await file.arrayBuffer();
                const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
                const page = await pdf.getPage(1);

                const viewport = page.getViewport({ scale: 0.3 }); // 썸네일 크기
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d')!;
                canvas.width = viewport.width;
                canvas.height = viewport.height;
                await page.render({
                    canvasContext: ctx,
                    viewport,
                    canvas, // ← 이 한 줄이 핵심
                }).promise;

                const blob = await new Promise<Blob | null>((res) => canvas.toBlob(res, 'image/png'));
                if (!blob) throw new Error('thumbnail toBlob failed');
                const url = URL.createObjectURL(blob);
                revokedUrl = url;
                if (!cancelled) setThumb({ url, revoke: () => URL.revokeObjectURL(url) });
            } catch {
                // 썸네일 실패 시 null 유지
            }
        })();

        return () => {
            cancelled = true;
            if (revokedUrl) URL.revokeObjectURL(revokedUrl);
        };
    }, [file]);

    return thumb;
}

function SortablePdfItem({ file, index, onRemove }: { file: File; index: number; onRemove: (i: number) => void }) {
    const id = useMemo(() => file.name + index, [file, index]);
    const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id });
    const style = { transform: CSS.Transform.toString(transform), transition };
    const thumb = usePdfThumbnail(file);

    return (
        <div ref={setNodeRef} style={style} {...attributes} className="relative group touch-none">
            <div {...listeners} className="cursor-grab active:cursor-grabbing">
                <div className="rounded-md overflow-hidden border bg-card">
                    {thumb ? (
                        <img src={thumb.url} alt={file.name} className="w-full h-auto object-cover aspect-[3/4]" />
                    ) : (
                        <div className="flex items-center justify-center aspect-[3/4] bg-muted">
                            <FileText className="h-10 w-10 text-muted-foreground" />
                        </div>
                    )}
                </div>
            </div>
            <div className="mt-2 text-sm truncate">{file.name}</div>
            <Button
                variant="ghost"
                size="icon"
                className="absolute top-1 right-1 h-6 w-6 opacity-0 group-hover:opacity-100"
                onClick={() => onRemove(index)}
            >
                <X className="h-4 w-4" />
            </Button>
        </div>
    );
}

export function PdfMerger() {
    const [pdfFiles, setPdfFiles] = useState<File[]>([]);
    const [isMerging, setIsMerging] = useState(false);
    const sensors = useSensors(useSensor(PointerSensor));
    const hiddenInputRef = useRef<HTMLInputElement | null>(null);
    const { t } = useI18n();

    const handleFilesAccepted = (files: File[]) => {
        const accepted = files.filter((f) => f.type === 'application/pdf');
        if (accepted.length !== files.length) toast.warning('PDF 파일만 업로드할 수 있습니다.');
        setPdfFiles((prev) => [...prev, ...accepted]);
    };

    const handleRemovePdf = (indexToRemove: number) => {
        setPdfFiles((prev) => prev.filter((_, i) => i !== indexToRemove));
    };

    const handleDragEnd = (e: DragEndEvent) => {
        const { active, over } = e;
        if (over && active.id !== over.id) {
            setPdfFiles((items) => {
                const oldIndex = items.findIndex((item, i) => item.name + i === String(active.id));
                const newIndex = items.findIndex((item, i) => item.name + i === String(over.id));
                return arrayMove(items, oldIndex, newIndex);
            });
        }
    };

    const handleMergePdfs = async () => {
        if (pdfFiles.length < 2) {
            toast.error('병합하려면 최소 2개 이상의 PDF 파일이 필요합니다.');
            return;
        }
        setIsMerging(true);
        try {
            const mergedPdf = await PDFDocument.create();
            for (const file of pdfFiles) {
                const fileBuffer = await file.arrayBuffer();
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

            toast.success('PDF 병합이 완료되었습니다!');
            setPdfFiles([]);
        } catch (err) {
            console.error(err);
            toast.error('PDF 병합 중 오류가 발생했습니다.');
        } finally {
            setIsMerging(false);
        }
    };

    const openFilePicker = () => hiddenInputRef.current?.click();

    return (
        <div>
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
                    <h3 className="text-xl font-semibold">병합할 PDF 목록 (드래그하여 순서 변경)</h3>

                    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                        <SortableContext
                            items={pdfFiles.map((f, i) => ({ id: f.name + i }))}
                            strategy={rectSortingStrategy}
                        >
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                {pdfFiles.map((file, index) => (
                                    <SortablePdfItem
                                        key={file.name + index}
                                        file={file}
                                        index={index}
                                        onRemove={handleRemovePdf}
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
                        <Button variant="outline" onClick={openFilePicker}>
                            파일 추가
                        </Button>
                        <Button onClick={handleMergePdfs} disabled={isMerging}>
                            {isMerging ? '병합 중...' : `${pdfFiles.length}개 PDF 병합하기`}
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
}
