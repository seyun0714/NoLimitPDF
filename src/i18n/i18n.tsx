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
    imageToPdfInfoTitle: '간편한 이미지 PDF 변환',
    imageToPdfInfoP1: 'JPG, PNG 등 다양한 형식의 이미지 파일을 드래그 한 번으로 PDF 문서로 변환할 수 있습니다.',
    imageToPdfInfoP2:
        '여러 이미지를 추가하고 순서를 자유롭게 조정한 뒤, 단 한 번의 클릭으로 하나의 PDF 파일을 만드세요.',
    pdfMergeInfoTitle: '여러 PDF 파일을 하나로',
    pdfMergeInfoP1: '분산된 PDF 문서들을 간편하게 하나로 합칠 수 있습니다.',
    pdfMergeInfoP2: '파일을 추가하고, 드래그하여 원하는 순서대로 배치한 후 병합 버튼을 누르면 작업이 완료됩니다.',
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
    reset: '초기화',
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
    'benefit.point.localProcessing': '로컬 내 처리',
    '404.title': '페이지를 찾을 수 없습니다',
    '404.description': '죄송합니다, 요청하신 페이지를 찾을 수 없습니다.',
    '404.button': '홈페이지로 돌아가기',
    aboutTitle: '소개',
    aboutText:
        'NoLimitPDF는 누구나 쉽고 빠르게 PDF 파일을 다룰 수 있도록 돕기 위해 만들어졌습니다. \n모든 기능은 무료이며, 여러분의 소중한 데이터는 서버에 저장되지 않고 \n오직 여러분의 컴퓨터에서만 처리됩니다.',
    contactTitle: '문의하기',
    contactText: '서비스에 대한 질문이나 제안이 있으시면 아래 이메일로 연락해주세요.',
    privacyPolicyTitle: '개인정보처리방침',
    privacyPolicyLastUpdated: '최종 업데이트: 2025년 9월 9일',
    privacyPolicyIntroTitle: '소개',
    privacyPolicyIntroText:
        'NoLimitPDF("회사", "저희")는 귀하의 개인정보를 중요하게 생각합니다. \n본 개인정보처리방침은 저희가 귀하의 정보를 수집, 이용, 공개하는 방법에 대해 설명합니다.',
    privacyPolicyCollectionTitle: '정보 수집',
    privacyPolicyCollectionText:
        '저희 서비스는 서버에 파일을 저장하지 않으며, 모든 PDF 변환 및 병합 과정은 사용자의 브라우저 내에서 로컬로 처리됩니다. 따라서 저희는 귀하가 업로드한 파일이나 개인 식별 정보를 수집하거나 저장하지 않습니다.',
    privacyPolicyCookiesTitle: '쿠키 및 광고',
    privacyPolicyCookiesText1:
        '본 사이트는 Google AdSense를 통해 광고를 게재합니다. Google을 포함한 제3자 공급업체는 쿠키를 사용하여 사용자의 이전 웹사이트 방문 기록을 기반으로 광고를 제공합니다.',
    privacyPolicyCookiesText2: '사용자는 다음 링크에서 맞춤 광고를 선택 해제할 수 있습니다: ',
    footerAbout: '소개',
    footerContact: '문의',
    footerPrivacyPolicy: '개인정보처리방침',
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
    imageToPdfInfoTitle: 'Easy Image to PDF Conversion',
    imageToPdfInfoP1:
        'Convert various image formats like JPG, PNG, etc., to a PDF document with a simple drag and drop.',
    imageToPdfInfoP2:
        'Add multiple images, freely adjust their order, and create a single PDF file with just one click.',
    pdfMergeInfoTitle: 'Combine Multiple PDF Files into One',
    pdfMergeInfoP1: 'Easily merge scattered PDF documents into a single file.',
    pdfMergeInfoP2:
        'Add your files, arrange them in the desired order by dragging, and press the merge button to complete the task.',
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
    reset: 'Reset',

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
    'benefit.point.localProcessing': 'Local Processing',
    '404.title': 'Page Not Found',
    '404.description': 'Sorry, we couldn’t find the page you’re looking for.',
    '404.button': 'Go back home',
    aboutTitle: 'About Us',
    aboutText:
        'NoLimitPDF was created to help everyone handle PDF files easily and quickly. All features are free, and your valuable data is processed only on your computer, not stored on our servers.',
    contactTitle: 'Contact Us',
    contactText: 'If you have any questions or suggestions about our service, please contact us at the email below.',
    privacyPolicyTitle: 'Privacy Policy',
    privacyPolicyLastUpdated: 'Last Updated: September 9, 2025',
    privacyPolicyIntroTitle: 'Introduction',
    privacyPolicyIntroText:
        'NoLimitPDF ("Company", "we", "us") values your privacy. This Privacy Policy explains how we collect, use, and disclose your information.',
    privacyPolicyCollectionTitle: 'Information Collection',
    privacyPolicyCollectionText:
        'Our service does not store your files on a server. All PDF conversion and merging processes are handled locally within your browser. Therefore, we do not collect or store the files you upload or any personally identifiable information.',
    privacyPolicyCookiesTitle: 'Cookies and Advertising',
    privacyPolicyCookiesText1:
        "This site displays ads through Google AdSense. Third-party vendors, including Google, use cookies to serve ads based on a user's prior visits to your website or other websites.",
    privacyPolicyCookiesText2: 'Users may opt out of personalized advertising by visiting: ',
    footerAbout: 'About',
    footerContact: 'Contact',
    footerPrivacyPolicy: 'Privacy Policy',
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
