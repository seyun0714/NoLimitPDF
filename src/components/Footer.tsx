// src/components/Footer.tsx
import { Link } from 'react-router-dom';
import { useI18n } from '@/i18n/i18n';

export function Footer() {
    const { t } = useI18n();

    return (
        <footer className="w-full border-t bg-background py-4">
            <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
                <div className="flex justify-center gap-4 mb-2">
                    <Link to="/about" className="hover:underline">
                        {t('footerAbout')}
                    </Link>
                    <Link to="/contact" className="hover:underline">
                        {t('footerContact')}
                    </Link>
                    <Link to="/privacy-policy" className="hover:underline">
                        {t('footerPrivacyPolicy')}
                    </Link>
                </div>
                © {new Date().getFullYear()} NoLimitPDF. All rights reserved.
            </div>
        </footer>
    );
}
