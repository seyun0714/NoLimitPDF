// src/features/PrivacyPolicy.tsx
import { useI18n } from '@/i18n/i18n';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function PrivacyPolicy() {
    const { t } = useI18n();

    return (
        <div className="w-full max-w-3xl mx-auto whitespace-pre-line">
            <Card>
                <CardHeader className="text-center">
                    <CardTitle className="text-2xl">{t('privacyPolicyTitle')}</CardTitle>
                    <p className="text-sm text-muted-foreground pt-1">{t('privacyPolicyLastUpdated')}</p>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div>
                        <h2 className="text-lg font-semibold">{t('privacyPolicyIntroTitle')}</h2>
                        <p className="text-muted-foreground leading-relaxed">{t('privacyPolicyIntroText')}</p>
                    </div>
                    <div>
                        <h2 className="text-lg font-semibold">{t('privacyPolicyAnalyticsTitle')}</h2>
                        <p className="text-muted-foreground leading-relaxed">
                            {t('privacyPolicyAnalyticsText')}{' '}
                            <a
                                href="https://vercel.com/legal/privacy-policy"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-primary hover:underline"
                            >
                                Vercel PrivacyPolicy
                            </a>
                        </p>
                    </div>
                    <div>
                        <h2 className="text-lg font-semibold">{t('privacyPolicyCollectionTitle')}</h2>
                        <p className="text-muted-foreground leading-relaxed">{t('privacyPolicyCollectionText')}</p>
                    </div>
                    <div>
                        <h2 className="text-lg font-semibold">{t('privacyPolicyCookiesTitle')}</h2>
                        <p className="text-muted-foreground leading-relaxed">{t('privacyPolicyCookiesText1')}</p>
                        <p className="text-muted-foreground leading-relaxed">
                            {t('privacyPolicyCookiesText2')}
                            <a
                                href="https://www.google.com/settings/ads"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-primary hover:underline"
                            >
                                Google Ads Settings
                            </a>
                            .
                        </p>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
