import { useState } from 'react';
import { toast } from 'sonner';
import { DndContext, closestCenter } from '@dnd-kit/core';
import { SortableContext, rectSortingStrategy } from '@dnd-kit/sortable';
import jsPDF from 'jspdf';

import { FileUpload } from '@/components/FileUpload';
import { Button } from '@/components/ui/button';
import { SortableCard } from '@/components/SortableCard';
import { LoadingOverlay } from '@/components/LoadingOverlay';
import { useDndReorder } from '@/hooks/useDndReorder';
import { useHiddenFileInput } from '@/hooks/useHiddenFileInput';
import { useI18n } from '@/i18n/i18n';
import { AppFile } from '@/App';
import { useAppendDropzone } from '@/hooks/useAppendDropzone';

interface ImageToPdfConverterProps {
    imageFiles: AppFile[];
    setImageFiles: React.Dispatch<React.SetStateAction<AppFile[]>>;
}

/** Blob URL로 이미지 로드 */
function loadImageFromBlobUrl(url: string): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve(img);
        img.onerror = reject;
        img.src = url; // createObjectURL 자원은 호출부에서 정리
    });
}

/** 캔버스로 표준 포맷으로 변환 (알파/미지원 포맷 대비) */
function imageToDataURL(img: HTMLImageElement, prefer: 'jpeg' | 'png'): string {
    const canvas = document.createElement('canvas');
    canvas.width = img.naturalWidth || img.width;
    canvas.height = img.naturalHeight || img.height;
    const ctx = canvas.getContext('2d')!;
    // jpeg 선택 시, 흰 배경으로 알파 제거
    if (prefer === 'jpeg') {
        ctx.fillStyle = '#fff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
    ctx.drawImage(img, 0, 0);
    return prefer === 'png' ? canvas.toDataURL('image/png') : canvas.toDataURL('image/jpeg', 0.92);
}

async function fileToDataURL(file: File, img: HTMLImageElement): Promise<{ dataUrl: string; format: 'JPEG' | 'PNG' }> {
    const mime = (file.type || '').toLowerCase();
    if (mime.includes('png')) return { dataUrl: imageToDataURL(img, 'png'), format: 'PNG' };
    return { dataUrl: imageToDataURL(img, 'jpeg'), format: 'JPEG' }; // webp/heic 등은 JPEG로
}

export default function ImageToPdfConverter({ imageFiles, setImageFiles }: ImageToPdfConverterProps) {
    const [isConverting, setIsConverting] = useState(false);
    const { t } = useI18n();

    // ✅ 공통 DnD 훅
    const { sensors, onDragEnd } = useDndReorder(setImageFiles);

    // ✅ 이미지 objectURL 캐시 (재정렬 시 재로딩 방지)
    const [imgUrlCache] = useState<Map<string, string>>(() => new Map());

    // ✅ 공통 파일 입력 훅
    const { open, inputProps } = useHiddenFileInput((files) => {
        const newFiles: AppFile[] = files.map((file) => ({
            id: crypto.randomUUID(),
            file,
            name: file.name,
        }));
        setImageFiles((prev) => [...prev, ...newFiles]);
    });

    // 파일 제거 시 캐시 정리
    const removeItem = (id: string) => {
        setImageFiles((prev) => prev.filter((it) => it.id !== id));
        const url = imgUrlCache.get(id);
        if (url) {
            URL.revokeObjectURL(url);
            imgUrlCache.delete(id);
        }
    };

    // 변환 완료 시 전체 캐시 정리
    const clearAllCache = () => {
        for (const [, url] of imgUrlCache) URL.revokeObjectURL(url);
        imgUrlCache.clear();
    };

    const handleReset = () => {
        setImageFiles([]);
        clearAllCache();
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
                const blobUrl = URL.createObjectURL(file); // 변환용 별도 URL

                try {
                    const img = await loadImageFromBlobUrl(blobUrl);
                    const { dataUrl, format } = await fileToDataURL(file, img);

                    if (i > 0) doc.addPage();

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
            clearAllCache();
        } catch (e) {
            console.error(e);
            toast.error(t('toastErrorPdfConversion'));
        } finally {
            setIsConverting(false);
        }
    };

    const addImages = (files: File[]) => {
        const newFiles = files.map((file) => ({ id: crypto.randomUUID(), file, name: file.name }));
        setImageFiles((prev) => [...prev, ...newFiles]);
    };

    // ✅ 파일이 있을 때만, 섹션 전체를 dropzone으로 활성
    const {
        getRootProps: getAppendRootProps,
        getInputProps: getAppendInputProps,
        isDragActive,
    } = useAppendDropzone({
        onFiles: addImages,
        accept: { 'image/*': [] },
    });

    return (
        <div className="relative">
            {isConverting && <LoadingOverlay isBlur={true} />}
            {imageFiles.length === 0 ? (
                <>
                    <div className="text-center mb-6 space-y-2">
                        <h2 className="text-xl font-semibold">{t('imageToPdfInfoTitle')}</h2>
                        <p className="text-muted-foreground">{t('imageToPdfInfoP1')}</p>
                        <p className="text-muted-foreground">{t('imageToPdfInfoP2')}</p>
                    </div>
                    <FileUpload
                        onFilesAccepted={(files) => inputProps.onChange({ target: { files } } as any)}
                        title={t('fileUploadImageTitle')}
                        description={t('fileUploadImageDescription')}
                        accept={{ 'image/*': [] }}
                    />
                </>
            ) : (
                <div {...getAppendRootProps({ className: 'relative' })}>
                    <input {...getAppendInputProps()} /> {/* 보이지 않는 drop 입력 */}
                    {/* 드래그 중 시각 피드백(얇은 오버레이) */}
                    {isDragActive && (
                        <div
                            className="
      pointer-events-none absolute inset-0 z-40
      grid place-items-center
      rounded-lg
      border-2 border-dashed border-accent/60
      ring-4 ring-accent/20
      bg-background/60
      backdrop-blur-sm backdrop-saturate-150 backdrop-brightness-90
      transition-all
    "
                        >
                            <span
                                className="
        px-3 py-1 rounded-md
        text-foreground
        shadow-sm
        text-sm md:text-base font-semibold tracking-tight
      "
                            >
                                {t('dropHere')}
                            </span>
                        </div>
                    )}
                    <div className="space-y-6">
                        <h3 className="text-xl font-semibold">{t('imageListTitle')}</h3>

                        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
                            <SortableContext items={imageFiles.map((i) => i.id)} strategy={rectSortingStrategy}>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    {imageFiles.map((item, index) => {
                                        // 캐시에서 먼저 조회, 없으면 생성 후 캐시
                                        let url = imgUrlCache.get(item.id);
                                        if (!url) {
                                            url = URL.createObjectURL(item.file);
                                            imgUrlCache.set(item.id, url);
                                        }

                                        return (
                                            <SortableCard
                                                key={item.id}
                                                id={item.id}
                                                index={index}
                                                title={item.name}
                                                onRemove={removeItem}
                                                aspect="1/1.414" // ✅ 문제 1: 카드 프레임 고정 (A4)
                                            >
                                                {/* ✅ 문제 2: 프레임(부모)이 고정이라 로딩 중에도 높이 유지 */}
                                                {url ? (
                                                    <img
                                                        src={url}
                                                        alt={item.name}
                                                        className="w-full h-full object-contain"
                                                    />
                                                ) : (
                                                    // 방어적 스켈레톤 (사실상 url이 항상 즉시 있음)
                                                    <div className="flex items-center justify-center h-full bg-muted animate-pulse" />
                                                )}
                                            </SortableCard>
                                        );
                                    })}
                                </div>
                            </SortableContext>
                        </DndContext>

                        <div className="flex justify-center gap-4">
                            <input {...inputProps} accept="image/*" multiple />
                            <Button variant="destructive" onClick={handleReset}>
                                {t('reset')}
                            </Button>
                            <Button variant="outline" onClick={open}>
                                {t('addFile')}
                            </Button>
                            <Button onClick={handleConvertToPdf} disabled={isConverting}>
                                {isConverting ? t('converting') : t('convertToPdf', { count: imageFiles.length })}
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
