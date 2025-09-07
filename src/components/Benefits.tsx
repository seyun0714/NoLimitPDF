// src/components/Benefits.tsx
import { useI18n } from '@/i18n/i18n';
import { Infinity, Images, Merge, Shield } from 'lucide-react';

export function Benefits() {
    const { t } = useI18n();

    return (
        <section className="mb-6 text-center">
            <h2 className="text-2xl md:text-3xl font-bold tracking-tight">{t('benefit.title')}</h2>
            <p className="mt-2 text-muted-foreground">{t('benefit.subtitle')}</p>

            <div className="mt-4 flex flex-col sm:flex-row items-center justify-center gap-6 text-sm">
                <div className="flex items-center gap-2">
                    <Images className="h-4 w-4" />
                    {t('benefit.point.imageToPdf')}
                </div>
                <div className="flex items-center gap-2">
                    <Merge className="h-4 w-4" />
                    {t('benefit.point.mergePdf')}
                </div>
                <div className="flex items-center gap-2">
                    <Infinity className="h-4 w-4" />
                    {t('benefit.point.unlimited')}
                </div>
                <div className="flex items-center gap-2">
                    <Shield className="h-4 w-4" />
                    {t('benefit.point.localProcessing')}
                </div>
            </div>
        </section>
    );
}
