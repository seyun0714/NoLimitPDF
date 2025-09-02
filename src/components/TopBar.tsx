import { Button } from '@/components/ui/button';
import { useTheme } from '@/hooks/useTheme';
import { useI18n } from '@/i18n/i18n';
import { Globe, Moon, Sun } from 'lucide-react';

export function TopBar() {
    const { theme, toggle } = useTheme();
    const { lang, setLang, t } = useI18n();

    return (
        <div className="sticky top-0 z-30 mb-6 rounded-2xl border bg-gradient-to-b from-transparent to-muted/30 p-3">
            <div className="mx-auto flex max-w-5xl items-center justify-between gap-3">
                <div className="text-lg font-semibold">{t('appTitle')}</div>

                <div className="flex items-center gap-2">
                    {/* Theme toggle */}
                    <Button
                        type="button"
                        variant="outline"
                        onClick={toggle}
                        className="flex items-center gap-2 cursor-pointer"
                        title={theme === 'dark' ? t('themeLight') : t('themeDark')}
                    >
                        {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                        <span className="hidden sm:inline">{theme === 'dark' ? t('themeLight') : t('themeDark')}</span>
                    </Button>

                    {/* Language toggle */}
                    <Button
                        type="button"
                        variant="outline"
                        className="flex items-center gap-2 cursor-pointer"
                        onClick={() => setLang(lang === 'ko' ? 'en' : 'ko')}
                        title={t('language')}
                    >
                        <Globe className="h-4 w-4" />
                        <span className="hidden sm:inline">{lang.toUpperCase()}</span>
                    </Button>
                </div>
            </div>
        </div>
    );
}
