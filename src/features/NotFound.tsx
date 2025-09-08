import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useI18n } from '@/i18n/i18n';

export function NotFound() {
    const { t, lang } = useI18n();

    const title = lang === 'ko' ? '404: 페이지를 찾을 수 없습니다 | NoLimitPDF' : '404: Page Not Found | NoLimitPDF';

    const description =
        lang === 'ko'
            ? '요청하신 페이지를 찾을 수 없습니다. 주소가 올바른지 확인하시거나 홈페이지로 이동해주세요.'
            : 'The page you requested could not be found. Please check the URL or return to the homepage.';

    return (
        <div className="flex flex-col items-center justify-center text-center">
            <title>{title}</title>
            <meta name="description" content={description} />

            <h1 className="text-9xl font-bold text-primary/20">404</h1>
            {/* 👈 2. t 함수를 사용하여 텍스트를 렌더링합니다. */}
            <h2 className="mt-4 text-2xl font-semibold">{t('404.title')}</h2>
            <p className="mt-2 text-muted-foreground">{t('404.description')}</p>
            <Button asChild className="mt-6">
                <Link to="/">{t('404.button')}</Link>
            </Button>
        </div>
    );
}
