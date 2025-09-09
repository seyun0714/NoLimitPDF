// src/App.tsx
import React, { Suspense, useState } from 'react';
import { Routes, Route, NavLink, Navigate, Outlet } from 'react-router-dom';
import { Toaster } from '@/components/ui/sonner';
import { I18nProvider, useI18n } from '@/i18n/i18n';
import { Header } from '@/components/Header';
import { Card, CardContent } from './components/ui/card';
import { Footer } from './components/Footer';
import { Benefits } from './components/Benefits';
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/react';
import { LoadingOverlay } from './components/LoadingOverlay';

const ImageToPdfConverter = React.lazy(() => import('./features/ImageToPdfConverter'));
const PdfMerger = React.lazy(() => import('./features/PdfMerger'));
const NotFound = React.lazy(() => import('./features/NotFound'));
const About = React.lazy(() => import('./features/About'));
const Contact = React.lazy(() => import('./features/Contact'));
const PrivacyPolicy = React.lazy(() => import('./features/PrivacyPolicy'));

export type AppFile = {
    id: string;
    file: File;
    name: string;
};

function ToolTabsLayout() {
    const { t } = useI18n();
    return (
        <Card className="mt-2 bg-background">
            <CardContent className="p-0">
                {/* 탭 내비게이션 */}
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
                    {/* 탭 컨텐츠 위치 */}
                    <Outlet />
                </div>
            </CardContent>
        </Card>
    );
}

function AppInner() {
    const [imageFiles, setImageFiles] = useState<AppFile[]>([]);
    const [pdfFiles, setPdfFiles] = useState<AppFile[]>([]);

    return (
        <div className="min-h-screen flex flex-col bg-background">
            <Header />
            <main className="container flex-1 mx-auto px-4 py-8">
                <div className="max-w-4xl mx-auto">
                    <Benefits />
                    <Suspense fallback={<LoadingOverlay isBlur={false} />}>
                        <Routes>
                            {/* 루트 → 이미지 변환으로 리다이렉트 */}
                            <Route path="/" element={<Navigate to="/image-to-pdf" replace />} />

                            {/* 탭 레이아웃 안에 두 기능 페이지만 배치 */}
                            <Route element={<ToolTabsLayout />}>
                                <Route
                                    path="/image-to-pdf"
                                    element={
                                        <ImageToPdfConverter imageFiles={imageFiles} setImageFiles={setImageFiles} />
                                    }
                                />
                                <Route
                                    path="/merge-pdf"
                                    element={<PdfMerger pdfFiles={pdfFiles} setPdfFiles={setPdfFiles} />}
                                />
                            </Route>

                            {/* 그 외 모든 경로는 Card 바깥에서 NotFound 전체 화면 */}
                            <Route path="/about" element={<About />} />
                            <Route path="/contact" element={<Contact />} />
                            <Route path="/privacy-policy" element={<PrivacyPolicy />} />
                            <Route path="*" element={<NotFound />} />
                        </Routes>
                    </Suspense>
                </div>
            </main>
            <Footer />
            <Toaster richColors position="top-center" />
        </div>
    );
}

function App() {
    return (
        <I18nProvider>
            <AppInner />
            <Analytics />
            <SpeedInsights />
        </I18nProvider>
    );
}

export default App;
