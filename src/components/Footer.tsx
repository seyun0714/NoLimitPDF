export function Footer() {
    return (
        <footer className="w-full border-t bg-background py-4">
            <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
                © {new Date().getFullYear()} NoLimitPDF. All rights reserved.
            </div>
        </footer>
    );
}
