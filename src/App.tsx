// src/App.tsx

import { useState } from 'react';
import { Toaster } from '@/components/ui/sonner';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ImageToPdfConverter } from './features/ImageToPdfConverter';
import { PdfMerger } from './features/PdfMerger';
import { I18nProvider, useI18n } from '@/i18n/i18n';
import { TopBar } from '@/components/TopBar';
import { Card, CardContent } from './components/ui/card';

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
        <div className="container mx-auto max-w-5xl py-6">
            <TopBar />

            <Card className="mt-2">
                <CardContent className="p-0">
                    <Tabs defaultValue="image" className="w-full">
                        <div className=" top-[64px] z-20 bg-background/80 rounded-md backdrop-blur supports-[backdrop-filter]:bg-background/50">
                            <TabsList className="w-full justify-start gap-2 rounded-md border-b px-4 py-3">
                                <TabsTrigger value="image" className="data-[state=active]:font-semibold cursor-pointer">
                                    {t('tabImageToPdf')}
                                </TabsTrigger>
                                <TabsTrigger value="merge" className="data-[state=active]:font-semibold cursor-pointer">
                                    {t('tabPdfMerge')}
                                </TabsTrigger>
                            </TabsList>
                        </div>

                        <div className="p-6">
                            <TabsContent value="image" className="m-0">
                                {/* 상태와 상태 변경 함수를 props로 전달 */}
                                <ImageToPdfConverter imageFiles={imageFiles} setImageFiles={setImageFiles} />
                            </TabsContent>

                            <TabsContent value="merge" className="m-0">
                                {/* 상태와 상태 변경 함수를 props로 전달 */}
                                <PdfMerger pdfFiles={pdfFiles} setPdfFiles={setPdfFiles} />
                            </TabsContent>
                        </div>
                    </Tabs>
                </CardContent>
            </Card>
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
