// src/App.tsx

import { useState } from 'react';
import { Routes, Route, NavLink, Navigate } from 'react-router-dom';
import { Toaster } from '@/components/ui/sonner';
import { ImageToPdfConverter } from './features/ImageToPdfConverter';
import { PdfMerger } from './features/PdfMerger';
import { I18nProvider, useI18n } from '@/i18n/i18n';
import { Header } from '@/components/Header';
import { Card, CardContent } from './components/ui/card';
import { Footer } from './components/Footer';
import { Benefits } from './components/Benefits';
import { Analytics } from '@vercel/analytics/react';
import { NotFound } from './features/NotFound';

export type AppFile = {
    id: string;
    file: File;
    name: string;
};

function AppInner() {
    const { t } = useI18n();
    // 2. 파일 상태 관리를 각 페이지 컴포넌트로 이동시켰으므로 여기서는 삭제합니다.
    const [imageFiles, setImageFiles] = useState<AppFile[]>([]);
    const [pdfFiles, setPdfFiles] = useState<AppFile[]>([]);

    return (
        <div className="min-h-screen flex flex-col bg-background">
            <Header />
            <main className="container flex-1 mx-auto px-4 py-8">
                <div className="max-w-4xl mx-auto">
                    <Benefits />

                    <Card className="mt-2 bg-background">
                        <CardContent className="p-0">
                            {/* 3. Tabs 컴포넌트 대신 NavLink를 사용한 내비게이션 UI를 만듭니다. */}
                            <div className="grid w-full grid-cols-2 p-1 bg-muted rounded-t-xl">
                                <NavLink
                                    to="/image-to-pdf"
                                    className={({ isActive }) =>
                                        `inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1.5 text-sm font-medium transition-all ${
                                            isActive ? 'bg-background text-foreground shadow' : 'text-muted-foreground'
                                        }`
                                    }
                                >
                                    {t('tabImageToPdf')}
                                </NavLink>
                                <NavLink
                                    to="/merge-pdf"
                                    className={({ isActive }) =>
                                        `inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1.5 text-sm font-medium transition-all ${
                                            isActive ? 'bg-background text-foreground shadow' : 'text-muted-foreground'
                                        }`
                                    }
                                >
                                    {t('tabPdfMerge')}
                                </NavLink>
                            </div>

                            <div className="p-6">
                                {/* 4. URL 경로에 따라 렌더링할 컴포넌트를 정의합니다. */}
                                <Routes>
                                    <Route path="/" element={<Navigate to="/image-to-pdf" replace />} />
                                    <Route
                                        path="/image-to-pdf"
                                        element={
                                            <ImageToPdfConverter
                                                imageFiles={imageFiles}
                                                setImageFiles={setImageFiles}
                                            />
                                        }
                                    />
                                    <Route
                                        path="/merge-pdf"
                                        element={<PdfMerger pdfFiles={pdfFiles} setPdfFiles={setPdfFiles} />}
                                    />
                                    <Route path="*" element={<NotFound />} />
                                </Routes>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </main>
            <Footer />
            <Analytics />
            <Toaster richColors position="top-center" />
        </div>
    );
}

function App() {
    const initialLang = navigator.language.startsWith('ko') ? 'ko' : 'en';

    return (
        <I18nProvider initialLang={initialLang}>
            <AppInner />
        </I18nProvider>
    );
}

export default App;
