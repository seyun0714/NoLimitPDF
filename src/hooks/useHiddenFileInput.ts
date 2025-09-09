// hooks/useHiddenFileInput.ts
import { useRef } from 'react';

export function useHiddenFileInput(onFiles: (files: File[]) => void) {
    const ref = useRef<HTMLInputElement | null>(null);

    const open = () => ref.current?.click();

    const bind = {
        ref,
        type: 'file',
        className: 'hidden',
        onChange: (e: React.ChangeEvent<HTMLInputElement>) => {
            const files = Array.from(e.target.files ?? []);
            if (files.length) onFiles(files);
            // e.currentTarget이 존재할 때만 value를 초기화합니다.
            if (e.currentTarget) {
                e.currentTarget.value = '';
            }
        },
    } as const;

    return { open, inputProps: bind };
}
