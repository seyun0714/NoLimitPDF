import { useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import { FileUpload } from '@/components/FileUpload';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';
import jsPDF from 'jspdf';
import { DndContext, closestCenter, PointerSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core';
import { arrayMove, SortableContext, useSortable, rectSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface SortableImageItemProps {
    file: File;
    index: number;
    onRemove: (index: number) => void;
}

function SortableImageItem({ file, index, onRemove }: SortableImageItemProps) {
    const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: file.name + index });
    const style = { transform: CSS.Transform.toString(transform), transition };

    const [imageUrl, setImageUrl] = useState('');
    useEffect(() => {
        const url = URL.createObjectURL(file);
        setImageUrl(url);
        return () => URL.revokeObjectURL(url);
    }, [file]);

    return (
        <div ref={setNodeRef} style={style} {...attributes} className="relative group touch-none">
            <div {...listeners} className="cursor-grab active:cursor-grabbing">
                <img src={imageUrl} alt={file.name} className="w-full h-auto rounded-md object-cover aspect-square" />
            </div>
            <Button
                variant="destructive"
                size="icon"
                className="absolute top-1 right-1 h-6 w-6 opacity-0 group-hover:opacity-100"
                onClick={() => onRemove(index)}
            >
                <X className="h-4 w-4" />
            </Button>
        </div>
    );
}

export function ImageToPdfConverter() {
    const [imageFiles, setImageFiles] = useState<File[]>([]);
    const [isConverting, setIsConverting] = useState(false);
    const sensors = useSensors(useSensor(PointerSensor));
    const hiddenInputRef = useRef<HTMLInputElement | null>(null);

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;
        if (over && active.id !== over.id) {
            setImageFiles((items) => {
                const oldIndex = items.findIndex((item, i) => item.name + i === String(active.id));
                const newIndex = items.findIndex((item, i) => item.name + i === String(over.id));
                return arrayMove(items, oldIndex, newIndex);
            });
        }
    };

    const handleFilesAccepted = (files: File[]) => {
        setImageFiles((prev) => [...prev, ...files]);
    };

    const handleRemoveImage = (indexToRemove: number) => {
        setImageFiles((prev) => prev.filter((_, i) => i !== indexToRemove));
    };

    const handleConvertToPdf = async () => {
        if (imageFiles.length === 0) {
            toast.warning('PDF로 변환할 이미지를 추가해주세요.');
            return;
        }
        setIsConverting(true);
        try {
            const doc = new jsPDF();
            for (let i = 0; i < imageFiles.length; i++) {
                const file = imageFiles[i];
                const image = new Image();
                const imageUrl = URL.createObjectURL(file);

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

                        if (i > 0) doc.addPage();
                        // 파일 형식에 맞춰 자동 인식: PNG/JPEG 모두 처리
                        doc.addImage(image, undefined as any, x, y, imgWidth, imgHeight);
                        URL.revokeObjectURL(imageUrl);
                        resolve();
                    };
                });
            }

            // ✅ 저장은 루프가 끝난 다음 한 번만
            doc.save('converted.pdf');

            toast.success('PDF 변환이 완료되었습니다!');
            setImageFiles([]);
        } catch (e) {
            console.error(e);
            toast.error('PDF 변환 중 오류가 발생했습니다.');
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
                    title="이미지 파일 업로드"
                    description="PDF로 변환할 이미지 파일을 드래그 앤 드롭하거나 클릭하여 선택하세요."
                    accept={{ 'image/*': [] }}
                />
            )}

            {imageFiles.length > 0 && (
                <div className="space-y-6">
                    <h3 className="text-xl font-semibold">변환할 이미지 목록 (드래그하여 순서 변경)</h3>

                    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                        <SortableContext
                            items={imageFiles.map((f, i) => ({ id: f.name + i }))}
                            strategy={rectSortingStrategy}
                        >
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                {imageFiles.map((file, index) => (
                                    <SortableImageItem
                                        key={file.name + index}
                                        file={file}
                                        index={index}
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
                        <Button variant="outline" onClick={openFilePicker}>
                            파일 추가
                        </Button>
                        <Button onClick={handleConvertToPdf} disabled={isConverting}>
                            {isConverting ? '변환 중...' : `${imageFiles.length}개 이미지 PDF로 변환`}
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
}
