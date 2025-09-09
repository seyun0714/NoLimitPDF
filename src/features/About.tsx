// src/features/About.tsx
import { useI18n } from '@/i18n/i18n';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function About() {
    const { t } = useI18n();

    return (
        <div className="w-full max-w-2xl mx-auto">
            <Card>
                <CardHeader>
                    <CardTitle className="text-center text-2xl">{t('aboutTitle')}</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-center text-muted-foreground leading-relaxed">{t('aboutText')}</p>
                </CardContent>
            </Card>
        </div>
    );
}
