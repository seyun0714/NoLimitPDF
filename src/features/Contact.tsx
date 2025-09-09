// src/features/Contact.tsx
import { useI18n } from '@/i18n/i18n';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function Contact() {
    const { t } = useI18n();

    return (
        <div className="w-full max-w-2xl mx-auto">
            <Card>
                <CardHeader>
                    <CardTitle className="text-center text-2xl">{t('contactTitle')}</CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                    <p className="text-muted-foreground mb-4">{t('contactText')}</p>
                    <a href="mailto:contact@nolimitpdf.com" className="text-primary font-semibold hover:underline">
                        contact@nolimitpdf.com
                    </a>
                </CardContent>
            </Card>
        </div>
    );
}
