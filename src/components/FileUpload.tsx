// src/components/FileUpload.tsx

import { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { UploadCloud } from 'lucide-react';
import { useI18n } from '@/i18n/i18n';

interface FileUploadProps {
    onFilesAccepted: (files: File[]) => void;
    title?: string;
    description?: string;
    accept?: { [mime: string]: string[] };
    compact?: boolean;
}

export function FileUpload({ onFilesAccepted, title, description, accept, compact = false }: FileUploadProps) {
    const { t } = useI18n();
    const onDrop = useCallback((acceptedFiles: File[]) => onFilesAccepted(acceptedFiles), [onFilesAccepted]);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept,
        multiple: true,
    });

    return (
        <Card
            {...getRootProps()}
            className={[
                'group relative transition-all duration-300 ease-in-out',
                'border-2 border-dashed bg-background hover:bg-muted/50 cursor-pointer',
                isDragActive ? 'border-accent ring-4 ring-accent/20 scale-105' : 'border-border hover:border-accent',
                compact ? 'min-h-[120px] p-4' : 'min-h-[260px] p-6',
                'focus-within:outline-none focus-within:ring-2 focus-within:ring-accent/50',
            ].join(' ')}
        >
            <input {...getInputProps()} />

            <div className="flex flex-col items-center justify-center h-full text-center">
                {!compact && (
                    <CardHeader className="p-0 pb-4">
                        <CardTitle className="text-lg md:text-xl">{title || t('fileUploadTitle')}</CardTitle>
                    </CardHeader>
                )}
                <CardContent className="flex flex-col items-center justify-center gap-4 p-0">
                    <div
                        className={[
                            'flex items-center justify-center rounded-full transition-all duration-300 ease-in-out',
                            compact ? 'h-16 w-16' : 'h-24 w-24',
                            isDragActive ? 'bg-accent/20 scale-110' : 'bg-muted group-hover:bg-accent/10',
                        ].join(' ')}
                    >
                        <UploadCloud
                            className={[
                                'text-muted-foreground transition-all duration-300 ease-in-out',
                                compact ? 'h-8 w-8' : 'h-12 w-12',
                                'group-hover:text-accent', // 항상 accent 색상으로 보이도록 수정
                                isDragActive ? 'text-accent' : '',
                            ].join(' ')}
                        />
                    </div>
                    <p className={`font-semibold ${isDragActive ? 'text-accent' : 'text-muted-foreground'}`}>
                        {isDragActive
                            ? t('dropHere')
                            : compact
                            ? t('addFiles')
                            : description || t('fileUploadDescription')}
                    </p>
                </CardContent>
            </div>
        </Card>
    );
}
