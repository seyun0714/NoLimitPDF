// useTheme.ts
import { useEffect, useState } from 'react';

type Theme = 'light' | 'dark' | 'system';

function getInitialTheme(): Exclude<Theme, 'system'> {
    if (typeof window === 'undefined') return 'light';
    const saved = localStorage.getItem('theme');
    if (saved === 'light' || saved === 'dark') return saved;
    const prefersDark = window.matchMedia?.('(prefers-color-scheme: dark)').matches;
    return prefersDark ? 'dark' : 'light';
}

export function useTheme() {
    const [theme, setTheme] = useState<Exclude<Theme, 'system'>>(getInitialTheme);

    useEffect(() => {
        if (typeof document === 'undefined') return;
        localStorage.setItem('theme', theme);
        const root = document.documentElement;
        if (theme === 'dark') root.classList.add('dark');
        else root.classList.remove('dark');
    }, [theme]);

    // ✅ 버튼 클릭 지점에서 퍼지는 애니메이션
    const toggle = (ev?: { clientX?: number; clientY?: number }) => {
        const next = theme === 'dark' ? 'light' : 'dark';

        // 접근성 고려: 모션 축소 / 브라우저 지원 체크
        const reduce =
            typeof window !== 'undefined' ? window.matchMedia?.('(prefers-reduced-motion: reduce)').matches : true;

        const doc = document as any;
        const supportsVT = typeof doc?.startViewTransition === 'function';

        const apply = () => setTheme(next);

        if (!supportsVT || reduce) {
            // 폴백: 그냥 색 전환 (index.css의 transition-colors로도 충분히 부드러움)
            apply();
            return;
        }

        // 클릭 좌표(없으면 화면 중앙)
        const x = ev?.clientX ?? window.innerWidth / 2;
        const y = ev?.clientY ?? window.innerHeight / 2;

        // 화면 모서리까지의 최대 반경
        const endRadius = Math.hypot(Math.max(x, window.innerWidth - x), Math.max(y, window.innerHeight - y));

        const vt = doc.startViewTransition(() => {
            apply();
        });

        vt.ready.then(() => {
            // 새 화면 레이어만 원형으로 드러나게
            document.documentElement.animate(
                {
                    clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${endRadius}px at ${x}px ${y}px)`],
                },
                {
                    duration: 800,
                    easing: 'cubic-bezier(.2,.7,0,1)',
                    pseudoElement: '::view-transition-new(root)',
                }
            );
        });
    };

    return { theme, setTheme, toggle };
}
