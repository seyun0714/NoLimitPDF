// src/components/TopBar.tsx

import { Button } from '@/components/ui/button';
import { useTheme } from '@/hooks/useTheme';
import { useI18n } from '@/i18n/i18n';
import { Globe, Moon, Sun } from 'lucide-react';

export function Header() {
    const { theme, toggle } = useTheme();
    const { lang, setLang, t } = useI18n();

    return (
        <header className="w-full border-b border-border bg-background px-6 py-4">
            <div className="flex items-center justify-between">
                {/* Logo */}
                <div>
                    <img src="/nolimitpdf-logo.svg" alt="nolimitpdf-logo" className="h-8 dark:invert" />{' '}
                </div>

                {/* Controls */}
                <div className="flex items-center gap-2">
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
                </div>
            </div>
        </header>
    );
}
