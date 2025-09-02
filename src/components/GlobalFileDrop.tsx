// src/components/GlobalFileDrop.tsx
import { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';

interface GlobalFileDropProps {
    onFilesAccepted: (files: File[]) => void;
    accept?: { [mime: string]: string[] };
    multiple?: boolean;
}

export function GlobalFileDrop({ onFilesAccepted, accept, multiple = true }: GlobalFileDropProps) {
    const onDrop = useCallback((acceptedFiles: File[]) => onFilesAccepted(acceptedFiles), [onFilesAccepted]);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept,
        multiple,
        noClick: true,
        noKeyboard: true,
        noDragEventsBubbling: true, // dnd-kit 내부 드래그와 충돌 최소화
    });

    return (
        <div
            {...getRootProps({
                onClick: (e) => e.preventDefault(), // 우발 클릭 차단
            })}
            // 화면 전체에 깔리지만, 시각적으로 투명. 파일 드래그 중일 때만 반투명 오버레이로 보임.
            className={[
                'fixed inset-0 z-40',
                isDragActive ? 'bg-black/30 backdrop-blur-[1px]' : 'pointer-events-none', // 평소엔 이벤트도 막아 UX 영향 없음
            ].join(' ')}
            aria-hidden={!isDragActive}
        >
            <input {...getInputProps()} />
            {isDragActive && (
                <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                    <div className="rounded-2xl border-2 border-dashed border-accent bg-background/80 px-6 py-4 text-accent-foreground shadow-lg">
                        여기에 파일을 놓아 추가하기
                    </div>
                </div>
            )}
        </div>
    );
}
