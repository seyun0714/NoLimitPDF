import { defineConfig } from 'vite';
import path from 'path';
import react from '@vitejs/plugin-react';

// https://vite.dev/config/
export default defineConfig({
    plugins: [react()],
    resolve: {
        alias: {
            '@': path.resolve(__dirname, './src'),
            '@components': path.resolve(__dirname, './src/components'),
        },
    },
    build: {
        rollupOptions: {
            output: {
                manualChunks(id) {
                    // node_modules에 있는 거대 라이브러리를 별도 청크로 분리합니다.
                    if (id.includes('node_modules')) {
                        if (id.includes('pdf-lib')) {
                            return 'vendor-pdf-lib';
                        }
                        if (id.includes('pdfjs-dist')) {
                            return 'vendor-pdfjs-dist';
                        }
                    }
                },
            },
        },
    },
});
