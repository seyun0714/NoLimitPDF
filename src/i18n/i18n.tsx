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
    imageListTitle: '변환할 이미지 목록',
    pdfListTitle: '병합할 PDF 목록',
    addFile: '파일 추가',
    convertToPdf: '{count}개 이미지 PDF로 변환',
    mergePdfs: '{count}개 PDF 병합하기',
    converting: '변환 중...',
    merging: '병합 중...',
    toastWarnAddImages: 'PDF로 변환할 이미지를 추가해주세요.',
    toastWarnTypePdf: 'PDF 파일만 업로드할 수 있습니다.',
    toastSuccessPdfConversion: 'PDF 변환이 완료되었습니다!',
    toastErrorPdfConversion: 'PDF 변환 중 오류가 발생했습니다.',
    toastErrorMergeMinFiles: '병합하려면 최소 2개 이상의 PDF 파일이 필요합니다.',
    toastSuccessPdfMerge: 'PDF 병합이 완료되었습니다!',
    toastErrorMerge: 'PDF 병합 중 오류가 발생했습니다.',
    'benefit.title': '제한 없는 PDF 변환과 병합',
    'benefit.subtitle': '빠르고 간단하게, 가입 없이 사용하세요.',
    'benefit.point.imageToPdf': '이미지를 PDF로',
    'benefit.point.mergePdf': 'PDF 병합 지원',
    'benefit.point.unlimited': '무료 · 무제한',
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
    fileUploadImageTitle: 'Upload Image File',
    fileUploadImageDescription: 'Drag and drop image files to convert to PDF, or click to select files.',
    fileUploadPdfTitle: 'Upload PDF File',
    fileUploadPdfDescription: 'Drag and drop PDF files to merge, or click to select files.',
    dropHere: 'Drop the files here...',
    addFiles: 'Drag here to add files',
    selectFiles: 'Select Files',
    dropAnywhere: 'Drop your files anywhere',
    imageListTitle: 'List of images to convert',
    pdfListTitle: 'List of PDFs to merge',
    addFile: 'Add Files',
    convertToPdf: 'Convert {count} images to PDF',
    mergePdfs: 'Merge {count} PDFs',
    converting: 'Converting...',
    merging: 'Merging...',
    toastWarnAddImages: 'Please add images to convert to PDF.',
    toastWarnTypePdf: 'Only PDF files can be uploaded.',
    toastSuccessPdfConversion: 'PDF conversion complete!',
    toastErrorPdfConversion: 'An error occurred during PDF conversion.',
    toastErrorMergeMinFiles: 'You need at least 2 PDF files to merge.',
    toastSuccessPdfMerge: 'PDF merge complete!',
    toastErrorMerge: 'An error occurred during PDF merge.',
    'benefit.title': 'Unlimited PDF Conversion & Merge',
    'benefit.subtitle': 'Fast and simple. No sign-up required.',
    'benefit.point.imageToPdf': 'Image to PDF',
    'benefit.point.mergePdf': 'Merge PDFs',
    'benefit.point.unlimited': 'Free & Unlimited',
};

const tables: Record<Lang, Dict> = { ko, en };

const I18nCtx = createContext<{
    lang: Lang;
    t: (k: keyof typeof ko, params?: Record<string, string | number>) => string;
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
            // ✅ 2. t 함수 구현부에 params 처리 로직 추가
            t: (k: keyof typeof ko, params?: Record<string, string | number>) => {
                let str = tables[lang][k] ?? k;
                if (params) {
                    Object.entries(params).forEach(([key, value]) => {
                        str = str.replace(new RegExp(`\\{${key}\\}`, 'g'), String(value));
                    });
                }
                return str;
            },
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
