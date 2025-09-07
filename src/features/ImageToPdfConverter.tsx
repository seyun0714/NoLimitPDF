import { useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import { FileUpload } from '@/components/FileUpload';
import { Button } from '@/components/ui/button';
import { FileImage, X } from 'lucide-react';
import jsPDF from 'jspdf';
import { DndContext, closestCenter, PointerSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core';
import { arrayMove, SortableContext, useSortable, rectSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useI18n } from '@/i18n/i18n';
import { AppFile } from '@/App';

interface SortableImageItemProps {
    item: AppFile;
    index: number;
    onRemove: (index: string) => void;
}

function SortableImageItem({ item, index, onRemove }: SortableImageItemProps) {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging, isSorting } = useSortable({
        id: item.id,
    });
    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        zIndex: isDragging ? 999 : isSorting ? 2 : 1, // 드래그 중 최상단
    };

    const [imageUrl, setImageUrl] = useState<string | null>(null);
    useEffect(() => {
        const url = URL.createObjectURL(item.file);
        setImageUrl(url);
        return () => URL.revokeObjectURL(url);
    }, [item.file]);

    return (
        <div ref={setNodeRef} style={style} {...attributes} className="relative group touch-none">
            <div {...listeners} className="cursor-grab active:cursor-grabbing">
                {/* ✅ A4 비율과 고정된 레이아웃을 위한 스타일 수정 */}
                <div className="w-full rounded-md overflow-hidden border bg-card aspect-[1/1.414] flex items-center justify-center">
                    <span className="absolute top-1 left-1 bg-black/60 text-white text-xs px-2 py-0.5 rounded">
                        {index + 1}
                    </span>

                    {imageUrl ? (
                        <img src={imageUrl} alt={item.id} className="w-full h-full object-contain" />
                    ) : (
                        <div className="flex items-center justify-center h-full bg-muted">
                            <FileImage className="h-10 w-10 text-muted-foreground" />
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

interface ImageToPdfConverterProps {
    imageFiles: AppFile[];
    setImageFiles: React.Dispatch<React.SetStateAction<AppFile[]>>;
}

// utils
function loadImageFromBlobUrl(url: string): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve(img);
        img.onerror = reject;
        // createObjectURL 자원은 호출부에서 정리
        img.src = url;
    });
}

// 알파채널/미지원 포맷 대비용: 캔버스로 표준 포맷으로 변환
function imageToDataURL(img: HTMLImageElement, prefer: 'jpeg' | 'png'): string {
    const canvas = document.createElement('canvas');
    canvas.width = img.naturalWidth || img.width;
    canvas.height = img.naturalHeight || img.height;
    const ctx = canvas.getContext('2d')!;
    ctx.drawImage(img, 0, 0);
    if (prefer === 'png') {
        return canvas.toDataURL('image/png'); // 무손실, 알파 유지
    }
    // jpeg은 알파 제거(흰 배경) + 용량↓
    // 필요하면 흰 배경으로 깔아주는 단계 추가 가능
    return canvas.toDataURL('image/jpeg', 0.92);
}

async function fileToDataURL(file: File, img: HTMLImageElement): Promise<{ dataUrl: string; format: 'JPEG' | 'PNG' }> {
    // 파일 mime에 따라 기본 포맷 선택
    const mime = (file.type || '').toLowerCase();
    if (mime.includes('png')) {
        return { dataUrl: imageToDataURL(img, 'png'), format: 'PNG' };
    }
    // jsPDF의 JPEG 호환이 가장 넓음. webp/heic 등은 jpeg로 재인코드
    return { dataUrl: imageToDataURL(img, 'jpeg'), format: 'JPEG' };
}

export function ImageToPdfConverter({ imageFiles, setImageFiles }: ImageToPdfConverterProps) {
    const [isConverting, setIsConverting] = useState(false);
    const sensors = useSensors(useSensor(PointerSensor));
    const hiddenInputRef = useRef<HTMLInputElement | null>(null);
    const { t } = useI18n();

    const handleFilesAccepted = (acceptedFiles: File[]) => {
        const newFiles: AppFile[] = acceptedFiles.map((file) => ({
            id: crypto.randomUUID(), // ✅ 고유 ID 생성
            file,
            name: file.name,
        }));
        setImageFiles((prev) => [...prev, ...newFiles]);
    };

    const handleRemoveImage = (idToRemove: string) => {
        setImageFiles((prev) => prev.filter((item) => item.id !== idToRemove));
    };

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;
        if (over && active.id !== over.id) {
            setImageFiles((items) => {
                const oldIndex = items.findIndex((item) => item.id === active.id);
                const newIndex = items.findIndex((item) => item.id === over.id);
                return arrayMove(items, oldIndex, newIndex);
            });
        }
    };

    const handleConvertToPdf = async () => {
        if (imageFiles.length === 0) {
            toast.warning(t('toastWarnAddImages'));
            return;
        }
        setIsConverting(true);

        try {
            const doc = new jsPDF({
                unit: 'mm',
                format: 'a4',
                orientation: 'p',
                compress: true,
            });

            const pageWidth = doc.internal.pageSize.getWidth();
            const pageHeight = doc.internal.pageSize.getHeight();

            for (let i = 0; i < imageFiles.length; i++) {
                const file = imageFiles[i].file;
                const blobUrl = URL.createObjectURL(file);

                try {
                    const img = await loadImageFromBlobUrl(blobUrl);
                    const { dataUrl, format } = await fileToDataURL(file, img);

                    if (i > 0) doc.addPage(); // ✅ 그냥 새 페이지 추가

                    const widthRatio = pageWidth / img.width;
                    const heightRatio = pageHeight / img.height;
                    const ratio = Math.min(widthRatio, heightRatio);

                    const drawW = img.width * ratio;
                    const drawH = img.height * ratio;
                    const x = (pageWidth - drawW) / 2;
                    const y = (pageHeight - drawH) / 2;

                    doc.addImage(dataUrl, format, x, y, drawW, drawH);
                } finally {
                    URL.revokeObjectURL(blobUrl);
                }
            }

            doc.save('converted.pdf');
            toast.success(t('toastSuccessPdfConversion'));
            setImageFiles([]);
        } catch (e) {
            console.error(e);
            toast.error(t('toastErrorPdfConversion'));
        } finally {
            setIsConverting(false);
        }
    };

    const openFilePicker = () => hiddenInputRef.current?.click();

    return (
        <div className="relative">
            {isConverting && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
                    <div className="h-12 w-12 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
                </div>
            )}

            {imageFiles.length === 0 && (
                <FileUpload
                    onFilesAccepted={handleFilesAccepted}
                    title={t('fileUploadImageTitle')}
                    description={t('fileUploadImageDescription')}
                    accept={{ 'image/*': [] }}
                />
            )}

            {imageFiles.length > 0 && (
                <div className="space-y-6">
                    <h3 className="text-xl font-semibold">{t('imageListTitle')}</h3>

                    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                        <SortableContext items={imageFiles.map((item) => item.id)} strategy={rectSortingStrategy}>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                {imageFiles.map((item, index) => (
                                    <SortableImageItem
                                        key={item.id}
                                        index={index}
                                        item={item}
                                        onRemove={handleRemoveImage}
                                    />
                                ))}
                            </div>
                        </SortableContext>
                    </DndContext>

                    <div className="flex justify-center gap-4">
                        <input
                            ref={hiddenInputRef}
                            type="file"
                            accept="image/*"
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
                        <Button className="cursor-pointer" onClick={handleConvertToPdf} disabled={isConverting}>
                            {isConverting ? t('converting') : t('convertToPdf', { count: imageFiles.length })}
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
}
