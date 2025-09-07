// src/hooks/useAppendDropzone.ts
import { useCallback, useEffect } from 'react';
import { useDropzone, Accept } from 'react-dropzone';

export function useAppendDropzone(opts: { onFiles: (files: File[]) => void; accept?: Accept }) {
    const onDrop = useCallback(
        (accepted: File[]) => {
            if (accepted?.length) opts.onFiles(accepted);
        },
        [opts]
    );

    const dz = useDropzone({
        onDrop,
        accept: opts.accept,
        multiple: true,
        noClick: true, // 🔒 클릭은 막고(버튼 충돌 방지)
        noKeyboard: true, // 🔒 키보드도 막음
    });

    // 브라우저가 파일 드롭 시 페이지 네비게이션 되는 것 방지(바깥 영역)
    useEffect(() => {
        const prevent = (e: DragEvent) => {
            e.preventDefault();
        };
        window.addEventListener('dragover', prevent);
        window.addEventListener('drop', prevent);
        return () => {
            window.removeEventListener('dragover', prevent);
            window.removeEventListener('drop', prevent);
        };
    }, []);

    return dz; // {getRootProps, getInputProps, isDragActive, ...}
}
