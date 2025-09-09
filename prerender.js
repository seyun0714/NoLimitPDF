// prerender.js

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const distPath = path.resolve(__dirname, 'dist');
const template = fs.readFileSync(path.join(distPath, 'index.html'), 'utf-8');

const siteUrl = 'https://www.nolimitpdf.com'; // 👈 실제 배포 도메인

const i18nData = {
    ko: {
        ogLocale: 'ko_KR',
        '/': {
            title: 'NoLimitPDF - 무제한 무료 PDF 변환 및 병합',
            description: '회원가입 없이 무료로 이미지를 PDF로 변환하고 여러 PDF 파일을 하나로 병합하세요.',
            ogImage: `${siteUrl}/og-main.png`,
        },
        '/image-to-pdf': {
            title: '이미지 PDF 변환 | NoLimitPDF',
            description: 'JPG, PNG 등 다양한 이미지를 PDF 파일로 쉽고 빠르게 변환하세요.',
            ogImage: `${siteUrl}/og-main.png`,
        },
        '/merge-pdf': {
            title: 'PDF 병합 | NoLimitPDF',
            description:
                '여러 개의 PDF 파일을 하나로 합칩니다. 순서 변경도 자유롭게 가능하며, 모든 작업은 브라우저에서 안전하게 처리됩니다.',
            ogImage: `${siteUrl}/og-main.png`,
        },
        404: {
            title: '404: 페이지를 찾을 수 없습니다 | NoLimitPDF',
            description: '요청하신 페이지를 찾을 수 없습니다. URL을 확인하거나 홈페이지로 이동해주세요.',
        },
    },
    en: {
        ogLocale: 'en_US',
        '/': {
            title: 'NoLimitPDF - Unlimited Free PDF Converter & Merger',
            description:
                'Convert images to PDF and merge multiple PDF files for free without signing up. All operations are securely processed in your browser.',
            ogImage: `${siteUrl}/og-main.png`,
        },
        '/image-to-pdf': {
            title: 'Image to PDF Converter | NoLimitPDF',
            description:
                'Quickly and easily convert various images like JPG, PNG into PDF files. Free, unlimited, and no registration required.',
            ogImage: `${siteUrl}/og-main.png`,
        },
        '/merge-pdf': {
            title: 'Merge PDF | NoLimitPDF',
            description:
                'Combine multiple PDF files into one. You can freely change the order, and all tasks are processed securely in your browser.',
            ogImage: `${siteUrl}/og-main.png`,
        },
        404: {
            title: '404: Page Not Found | NoLimitPDF',
            description: 'The page you requested could not be found. Please check the URL or return to the homepage.',
        },
    },
};

const routes = ['/', '/image-to-pdf', '/merge-pdf'];
const languages = ['ko', 'en'];

console.log('Starting multi-language prerendering with OG tags...');

for (const lang of languages) {
    const langPath = path.join(distPath, lang);
    if (!fs.existsSync(langPath)) {
        fs.mkdirSync(langPath, { recursive: true });
    }

    for (const route of routes) {
        const meta = i18nData[lang][route];
        const canonicalUrl = `${siteUrl}/${lang}${route === '/' ? '' : route}`;

        // hreflang 태그 생성
        let hreflangTags = '';
        for (const otherLang of languages) {
            const otherRoute = `${siteUrl}/${otherLang}${route === '/' ? '' : route}`;
            hreflangTags += `<link rel="alternate" hreflang="${otherLang}" href="${otherRoute}" />\n`;
        }
        hreflangTags += `<link rel="alternate" hreflang="x-default" href="${siteUrl}${
            route === '/' ? '' : route.replace('.html', '')
        }" />`;

        // ✅ 웹사이트 및 웹앱 스키마 추가
        const schema = {
            '@context': 'https://schema.org',
            '@type': 'WebSite',
            url: canonicalUrl,
            name: meta.title,
            description: meta.description,
            potentialAction: {
                '@type': 'SearchAction',
                target: `${canonicalUrl}#search-{search_term_string}`,
                'query-input': 'required name=search_term_string',
            },
        };

        const webAppSchema = {
            '@context': 'https://schema.org',
            '@type': 'WebApplication',
            name: 'NoLimitPDF',
            url: canonicalUrl,
            applicationCategory: 'ProductivityApplication',
            operatingSystem: 'All',
            offers: {
                '@type': 'Offer',
                price: '0',
                priceCurrency: 'USD',
            },
        };

        // 👈 OG 태그를 포함한 전체 메타 태그 생성
        const metaTags = `
            <title>${meta.title}</title>
            <meta name="description" content="${meta.description}" />
            <link rel="canonical" href="${canonicalUrl}" />
            ${hreflangTags}
            <meta property="og:title" content="${meta.title}" />
            <meta property="og:description" content="${meta.description}" />
            <meta property="og:url" content="${canonicalUrl}" />
            <meta property="og:image" content="${meta.ogImage}" />
            <meta property="og:locale" content="${i18nData[lang].ogLocale}" />
            <meta property="og:type" content="website" />
            <meta property="og:site_name" content="NoLimitPDF" />
            <meta name="twitter:card" content="summary_large_image" />
            <meta name="twitter:title" content="${meta.title}" />
            <meta name="twitter:description" content="${meta.description}" />
            <meta name="twitter:image" content="${meta.ogImage}" />
            <script type="application/ld+json">${JSON.stringify(schema)}</script>
            <script type="application/ld+json">${JSON.stringify(webAppSchema)}</script>
        `;

        let html = template.replace(/(.|\n)*?/, metaTags);
        html = html.replace(/<html lang=".*">/, `<html lang="${lang}">`);

        const filePath = path.join(langPath, route === '/' ? 'index.html' : `${route.substring(1)}.html`);
        fs.writeFileSync(filePath, html);
        console.log(`Prerendered: ${filePath}`);
    }

    const meta404 = i18nData[lang]['404'];
    const metaTags404 = `<title>${meta404.title}</title><meta name="description" content="${meta404.description}" />`;
    let html404 = template.replace(/(.|\n)*?/, metaTags404);
    html404 = html404.replace(/<html lang=".*">/, `<html lang="${lang}">`);
    fs.writeFileSync(path.join(langPath, '404.html'), html404);
    console.log(`Prerendered: ${path.join(langPath, '404.html')}`);
}

console.log('Generating sitemap.xml...');

const sitemapContent = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">
${routes
    .map(
        (route) => `
<url>
  <loc>${siteUrl}/en${route === '/' ? '' : route}</loc>
  <xhtml:link rel="alternate" hreflang="ko" href="${siteUrl}/ko${route === '/' ? '' : route}"/>
  <xhtml:link rel="alternate" hreflang="en" href="${siteUrl}/en${route === '/' ? '' : route}"/>
  <xhtml:link rel="alternate" hreflang="x-default" href="${siteUrl}${route === '/' ? '' : route}"/>
</url>
`
    )
    .join('')}
</urlset>`;

fs.writeFileSync(path.join(distPath, 'sitemap.xml'), sitemapContent.trim());
console.log('Generated sitemap.xml');
