// components/shared/LoadingOverlay.tsx

interface LoadingProps {
    isBlur: boolean;
}

export function LoadingOverlay({ isBlur }: LoadingProps) {
    return (
        <div className={`fixed inset-0 z-50 flex items-center justify-center ${isBlur && 'bg-black/50'}`}>
            <div
                className={`h-12 w-12 border-4 ${
                    isBlur ? 'border-white' : 'border-stone-900'
                } border-t-transparent rounded-full animate-spin`}
            />
        </div>
    );
}
