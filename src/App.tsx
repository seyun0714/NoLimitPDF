// src/App.tsx

import { useState } from 'react';
import { Toaster } from '@/components/ui/sonner';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ImageToPdfConverter } from './features/ImageToPdfConverter';
import { PdfMerger } from './features/PdfMerger';
import { I18nProvider, useI18n } from '@/i18n/i18n';
import { Header } from '@/components/Header';
import { Card, CardContent } from './components/ui/card';
import { Footer } from './components/Footer';
import { Benefits } from './components/Benefits';

export type AppFile = {
    id: string;
    file: File;
    name: string;
};

function AppInner() {
    const { t } = useI18n();
    // 파일 상태를 여기서 통합 관리합니다.
    const [imageFiles, setImageFiles] = useState<AppFile[]>([]);
    const [pdfFiles, setPdfFiles] = useState<AppFile[]>([]);

    return (
        <div className="min-h-screen flex flex-col bg-background">
            <Header />
            <main className="container flex-1 mx-auto px-4 py-8">
                <div className="max-w-4xl mx-auto">
                    <Benefits />

                    <Card className="mt-2 bg-background">
                        <CardContent className="p-6 ">
                            <Tabs defaultValue="imageToPdf" className="w-full">
                                <div className=" top-[64px] z-20 bg-background/80 rounded-md backdrop-blur supports-[backdrop-filter]:bg-background/50">
                                    <TabsList className="grid w-full grid-cols-2 mb-6">
                                        <TabsTrigger
                                            value="imageToPdf"
                                            className="data-[state=active]:font-semibold cursor-pointer gap-2"
                                        >
                                            {t('tabImageToPdf')}
                                        </TabsTrigger>
                                        <TabsTrigger
                                            value="mergePdf"
                                            className="data-[state=active]:font-semibold cursor-pointer gap-2"
                                        >
                                            {t('tabPdfMerge')}
                                        </TabsTrigger>
                                    </TabsList>
                                </div>

                                <div className="p-6">
                                    <TabsContent value="imageToPdf" className="m-0">
                                        {/* 상태와 상태 변경 함수를 props로 전달 */}
                                        <ImageToPdfConverter imageFiles={imageFiles} setImageFiles={setImageFiles} />
                                    </TabsContent>

                                    <TabsContent value="mergePdf" className="m-0">
                                        {/* 상태와 상태 변경 함수를 props로 전달 */}
                                        <PdfMerger pdfFiles={pdfFiles} setPdfFiles={setPdfFiles} />
                                    </TabsContent>
                                </div>
                            </Tabs>
                        </CardContent>
                    </Card>
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
        </I18nProvider>
    );
}

export default App;
