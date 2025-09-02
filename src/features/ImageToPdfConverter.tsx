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
    onRemove: (index: string) => void;
}

function SortableImageItem({ item, onRemove }: SortableImageItemProps) {
    const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: item.id });
    const style = { transform: CSS.Transform.toString(transform), transition };

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
            const doc = new jsPDF();
            for (const item of imageFiles) {
                const image = new Image();
                const imageUrl = URL.createObjectURL(item.file);

                await new Promise<void>((resolve) => {
                    image.src = imageUrl;
                    image.onload = () => {
                        const pageWidth = doc.internal.pageSize.getWidth();
                        const pageHeight = doc.internal.pageSize.getHeight();

                        const widthRatio = pageWidth / image.width;
                        const heightRatio = pageHeight / image.height;
                        const ratio = Math.min(widthRatio, heightRatio);

                        const imgWidth = image.width * ratio;
                        const imgHeight = image.height * ratio;

                        const x = (pageWidth - imgWidth) / 2;
                        const y = (pageHeight - imgHeight) / 2;
                        // 파일 형식에 맞춰 자동 인식: PNG/JPEG 모두 처리
                        doc.addImage(image, undefined as any, x, y, imgWidth, imgHeight);
                        URL.revokeObjectURL(imageUrl);
                        resolve();
                    };
                });
            }

            // ✅ 저장은 루프가 끝난 다음 한 번만
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
        <div>
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
                                {imageFiles.map((item) => (
                                    <SortableImageItem key={item.id} item={item} onRemove={handleRemoveImage} />
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
