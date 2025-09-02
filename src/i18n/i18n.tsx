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
    fileUploadTitle: '파일 업로드',
    fileUploadDescription: '파일을 드래그 앤 드롭하거나 클릭하여 선택하세요.',
    fileUploadImageTitle: '이미지 파일 업로드',
    fileUploadImageDescription: 'PDF로 변환할 이미지 파일을 드래그 앤 드롭하거나 클릭하여 선택하세요.',
    fileUploadPdfTitle: 'PDF 파일 업로드',
    fileUploadPdfDescription: '병합할 PDF 파일을 드래그 앤 드롭하거나 클릭하여 선택하세요.',
    dropHere: '여기에 파일을 놓으세요…',
    addFiles: '여기에 드래그하여 파일 추가',
    selectFiles: '파일 선택',
    dropAnywhere: '파일을 아무 곳에나 놓아주세요',
};

const en: Dict = {
    appTitle: 'PDF Utility',
    tabImageToPdf: 'Image → PDF',
    tabPdfMerge: 'Merge PDF',
    themeLight: 'Light',
    themeDark: 'Dark',
    language: 'Language',
    fileUploadTitle: 'File Upload',
    fileUploadDescription: 'Drag and drop files here, or click to select files',
    fileUploadImageTitle: 'Image File Upload',
    fileUploadImageDescription: 'Drag and drop image files to convert to PDF, or click to select files.',
    fileUploadPdfTitle: 'PDF File Upload',
    fileUploadPdfDescription: 'Drag and drop PDF files to merge, or click to select files.',
    dropHere: 'Drop the files here...',
    addFiles: 'Drag here to add files',
    selectFiles: 'Select Files',
    dropAnywhere: 'Drop your files anywhere',
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
