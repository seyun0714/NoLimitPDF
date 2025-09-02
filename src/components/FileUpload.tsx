import { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { UploadCloud } from 'lucide-react';

interface FileUploadProps {
    onFilesAccepted: (files: File[]) => void;
    title?: string;
    description?: string;
    accept?: { [mime: string]: string[] };
    compact?: boolean; // 🔸 목록 위에 작게 쓰고 싶을 때 true
    noClick?: boolean; // 🔸 카드 클릭으로 안 열리게(버튼만) 하고 싶으면 true
}

export function FileUpload({
    onFilesAccepted,
    title = '파일 업로드',
    description = '파일을 드래그 앤 드롭하거나 클릭하여 선택하세요.',
    accept,
    compact = false,
    noClick = true,
}: FileUploadProps) {
    const onDrop = useCallback((acceptedFiles: File[]) => onFilesAccepted(acceptedFiles), [onFilesAccepted]);

    const { getRootProps, getInputProps, isDragActive, open } = useDropzone({
        onDrop,
        accept,
        noClick,
        noDragEventsBubbling: true, // 🔸 내부 DnD와 충돌 최소화
        multiple: true,
    });

    return (
        <Card
            {...getRootProps()}
            className={[
                'transition-all border-2 border-dashed bg-gradient-to-b from-background to-muted/40',
                isDragActive ? 'border-accent ring-2 ring-accent/40' : 'border-border hover:border-accent/50',
                compact ? 'min-h-[120px] p-4' : 'min-h-[260px] p-6',
                'focus-within:outline-none focus-within:ring-2 focus-within:ring-accent/50',
            ].join(' ')}
            onClick={(e) => {
                if (noClick) return; // 카드 클릭으로 여는 모드면 open()
                e.stopPropagation();
                open();
            }}
        >
            <input {...getInputProps()} />
            {!compact && (
                <CardHeader className="text-center p-0 pb-4">
                    <CardTitle className="text-lg md:text-xl">{title}</CardTitle>
                </CardHeader>
            )}
            <CardContent className="h-full flex flex-col items-center justify-center gap-3 text-center">
                <div
                    className={[
                        'flex items-center justify-center rounded-2xl',
                        compact ? 'h-12 w-12' : 'h-20 w-20',
                        isDragActive ? 'bg-accent/20 ring-1 ring-accent' : 'bg-muted',
                    ].join(' ')}
                >
                    <UploadCloud
                        className={compact ? 'h-6 w-6 text-accent-foreground' : 'h-10 w-10 text-accent-foreground'}
                    />
                </div>
                {isDragActive ? (
                    <p className="font-medium text-accent-foreground">여기에 파일을 놓으세요…</p>
                ) : (
                    <>
                        <p className="text-muted-foreground text-sm md:text-base">
                            {compact ? '여기에 드래그하여 파일 추가' : description}
                        </p>
                        {noClick && (
                            <button
                                type="button"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    open(); // 🔸 dropzone 내부 input.click()
                                }}
                                className="inline-flex items-center gap-2 px-3 py-2 rounded-xl border text-sm font-medium
                           hover:bg-accent hover:text-accent-foreground transition-colors cursor-pointer"
                            >
                                파일 선택
                            </button>
                        )}
                    </>
                )}
            </CardContent>
        </Card>
    );
}
