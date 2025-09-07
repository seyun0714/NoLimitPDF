// components/shared/LoadingOverlay.tsx
export function LoadingOverlay() {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            <div className="h-12 w-12 border-4 border-white border-t-transparent rounded-full animate-spin" />
        </div>
    );
}
