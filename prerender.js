// prerender.js - 단일 URL 구조에 맞게 재작성된 버전

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const distPath = path.resolve(__dirname, 'dist');
const template = fs.readFileSync(path.join(distPath, 'index.html'), 'utf-8');

const siteUrl = 'https://www.nolimitpdf.com';

// SEO 메타 태그에 사용할 한국어 기준 정보
const koData = {
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
    '/about': {
        title: '소개 | NoLimitPDF',
        description:
            'NoLimitPDF는 누구나 쉽고 빠르게 PDF 파일을 다룰 수 있도록 돕기 위해 만들어졌습니다. 모든 기능은 무료이며, 데이터는 서버에 저장되지 않습니다.',
        ogImage: `${siteUrl}/og-main.png`,
    },
    '/contact': {
        title: '문의하기 | NoLimitPDF',
        description: '서비스에 대한 질문이나 제안이 있으시면 언제든지 이메일로 연락해주세요.',
        ogImage: `${siteUrl}/og-main.png`,
    },
    '/privacy-policy': {
        title: '개인정보처리방침 | NoLimitPDF',
        description:
            'NoLimitPDF의 개인정보처리방침입니다. 서비스 이용 시 수집하는 정보와 그 처리 방법에 대해 안내합니다.',
        ogImage: `${siteUrl}/og-main.png`,
    },
    '/about': {
        title: '소개 | NoLimitPDF',
        description:
            'NoLimitPDF는 누구나 쉽고 빠르게 PDF 파일을 다룰 수 있도록 돕기 위해 만들어졌습니다. 모든 기능은 무료이며, 데이터는 서버에 저장되지 않습니다.',
        ogImage: `${siteUrl}/og-main.png`,
    },
    '/contact': {
        title: '문의하기 | NoLimitPDF',
        description: '서비스에 대한 질문이나 제안이 있으시면 언제든지 이메일로 연락해주세요.',
        ogImage: `${siteUrl}/og-main.png`,
    },
    '/privacy-policy': {
        title: '개인정보처리방침 | NoLimitPDF',
        description:
            'NoLimitPDF의 개인정보처리방침입니다. 서비스 이용 시 수집하는 정보와 그 처리 방법에 대해 안내합니다.',
        ogImage: `${siteUrl}/og-main.png`,
    },
    '/about': {
        title: '소개 | NoLimitPDF',
        description:
            'NoLimitPDF는 누구나 쉽고 빠르게 PDF 파일을 다룰 수 있도록 돕기 위해 만들어졌습니다. 모든 기능은 무료이며, 데이터는 서버에 저장되지 않습니다.',
        ogImage: `${siteUrl}/og-main.png`,
    },
    '/contact': {
        title: '문의하기 | NoLimitPDF',
        description: '서비스에 대한 질문이나 제안이 있으시면 언제든지 이메일로 연락해주세요.',
        ogImage: `${siteUrl}/og-main.png`,
    },
    '/privacy-policy': {
        title: '개인정보처리방침 | NoLimitPDF',
        description:
            'NoLimitPDF의 개인정보처리방침입니다. 서비스 이용 시 수집하는 정보와 그 처리 방법에 대해 안내합니다.',
        ogImage: `${siteUrl}/og-main.png`,
    },
    404: {
        title: '404: 페이지를 찾을 수 없습니다 | NoLimitPDF',
        description: '요청하신 페이지를 찾을 수 없습니다. URL을 확인하거나 홈페이지로 이동해주세요.',
    },
};

const routes = ['/', '/image-to-pdf', '/merge-pdf', '/about', '/contact', '/privacy-policy'];
console.log('Starting prerendering...');

for (const route of routes) {
    const meta = koData[route];
    const canonicalUrl = `${siteUrl}${route === '/' ? '' : route}`;

    // 다국어 지원을 명시하는 hreflang 태그 (URL은 언어 코드 없이 동일)
    const hreflangTags = `
<link rel="alternate" hreflang="ko" href="${canonicalUrl}" />
<link rel="alternate" hreflang="en" href="${canonicalUrl}" />
<link rel="alternate" hreflang="x-default" href="${canonicalUrl}" />
    `.trim();

    // 웹사이트 및 웹앱 스키마
    const schema = {
        '@context': 'https://schema.org',
        '@type': 'WebSite',
        url: canonicalUrl,
        name: meta.title,
        description: meta.description,
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

    // 최종 메타 태그 생성
    const metaTags = `
<title>${meta.title}</title>
<meta name="description" content="${meta.description}" />
<link rel="canonical" href="${canonicalUrl}" />
${hreflangTags}
<meta property="og:title" content="${meta.title}" />
<meta property="og:description" content="${meta.description}" />
<meta property="og:url" content="${canonicalUrl}" />
<meta property="og:image" content="${meta.ogImage}" />
<meta property="og:locale" content="ko_KR" />
<meta property="og:type" content="website" />
<meta property="og:site_name" content="NoLimitPDF" />
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:title" content="${meta.title}" />
<meta name="twitter:description" content="${meta.description}" />
<meta name="twitter:image" content="${meta.ogImage}" />
<script type="application/ld+json">${JSON.stringify(schema)}</script>
<script type="application/ld+json">${JSON.stringify(webAppSchema)}</script>
    `.trim();

    let html = template.replace(/<head>/, `<head>\n${metaTags}`);
    html = html.replace(/<html lang=".*">/, `<html lang="ko">`);

    // 'dist' 폴더 최상위에 바로 파일을 생성
    const filePath = path.join(distPath, route === '/' ? 'index.html' : `${route.substring(1)}.html`);
    fs.writeFileSync(filePath, html);
    console.log(`Prerendered: ${filePath}`);
}

// 404.html도 dist 최상위에 생성
const meta404 = koData['404'];
const metaTags404 = `<title>${meta404.title}</title><meta name="description" content="${meta404.description}" />`;
let html404 = template.replace(/<head>/, `<head>\n${metaTags404}`);
html404 = html404.replace(/<html lang=".*">/, `<html lang="ko">`);
fs.writeFileSync(path.join(distPath, '404.html'), html404);
console.log(`Prerendered: ${path.join(distPath, '404.html')}`);

// 사이트맵 생성 (언어 경로 없음)
console.log('Generating sitemap.xml...');
const sitemapContent = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">
${routes
    .map(
        (route) => `
<url>
  <loc>${siteUrl}${route === '/' ? '' : route}</loc>
  <xhtml:link rel="alternate" hreflang="ko" href="${siteUrl}${route === '/' ? '' : route}"/>
  <xhtml:link rel="alternate" hreflang="en" href="${siteUrl}${route === '/' ? '' : route}"/>
  <xhtml:link rel="alternate" hreflang="x-default" href="${siteUrl}${route === '/' ? '' : route}"/>
</url>
`
    )
    .join('')}
</urlset>`.trim();

fs.writeFileSync(path.join(distPath, 'sitemap.xml'), sitemapContent);
console.log('Generated sitemap.xml');
