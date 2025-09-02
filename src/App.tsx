// src/App.tsx

import { Toaster } from '@/components/ui/sonner';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ImageToPdfConverter } from './features/ImageToPdfConverter';
import { PdfMerger } from './features/PdfMerger';
import { I18nProvider, useI18n } from '@/i18n/i18n';
import { TopBar } from '@/components/TopBar';
import { Card, CardContent } from './components/ui/card';

function AppInner() {
    const { t } = useI18n();

    return (
        <div className="container mx-auto max-w-5xl py-6">
            <TopBar />

            <Card className="mt-2">
                <CardContent className="p-0">
                    <Tabs defaultValue="image" className="w-full">
                        <div className="sticky top-[64px] z-20 bg-background/80 rounded-md backdrop-blur supports-[backdrop-filter]:bg-background/50">
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
                                <ImageToPdfConverter />
                            </TabsContent>

                            <TabsContent value="merge" className="m-0">
                                <PdfMerger />
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
