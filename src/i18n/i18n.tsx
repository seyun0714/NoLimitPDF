import { createContext, useContext, useEffect, useMemo, useState } from 'react';

type Lang = 'ko' | 'en';
type Dict = Record<string, string>;

const ko: Dict = {
    appTitle: 'PDF 유틸리티',
    tabImageToPdf: 'Image → PDF',
    tabPdfMerge: 'PDF 병합',
    themeLight: 'Light',
    themeDark: 'Dark',
    language: '언어',
};

const en: Dict = {
    appTitle: 'PDF Utility',
    tabImageToPdf: 'Image → PDF',
    tabPdfMerge: 'Merge PDF',
    themeLight: 'Light',
    themeDark: 'Dark',
    language: 'Language',
};

const tables: Record<Lang, Dict> = { ko, en };

const I18nCtx = createContext<{
    lang: Lang;
    t: (k: keyof typeof ko) => string;
    setLang: (l: Lang) => void;
} | null>(null);

export function I18nProvider({ children }: { children: React.ReactNode }) {
    const [lang, setLang] = useState<Lang>(() => (localStorage.getItem('lang') === 'en' ? 'en' : 'ko'));

    useEffect(() => {
        localStorage.setItem('lang', lang);
    }, [lang]);

    const value = useMemo(
        () => ({
            lang,
            setLang,
            t: (k: keyof typeof ko) => tables[lang][k] ?? k,
        }),
        [lang]
    );

    return <I18nCtx.Provider value={value}>{children}</I18nCtx.Provider>;
}

export function useI18n() {
    const ctx = useContext(I18nCtx);
    if (!ctx) throw new Error('useI18n must be used within I18nProvider');
    return ctx;
}
