import { useEffect, useState } from 'react';

type Theme = 'light' | 'dark' | 'system';

function getInitialTheme(): Exclude<Theme, 'system'> {
    const saved = localStorage.getItem('theme');
    if (saved === 'light' || saved === 'dark') return saved;
    const prefersDark = window.matchMedia?.('(prefers-color-scheme: dark)').matches;
    return prefersDark ? 'dark' : 'light';
}

export function useTheme() {
    const [theme, setTheme] = useState<Exclude<Theme, 'system'>>(getInitialTheme);

    useEffect(() => {
        localStorage.setItem('theme', theme);
        const root = document.documentElement; // <html>
        if (theme === 'dark') root.classList.add('dark');
        else root.classList.remove('dark');
    }, [theme]);

    const toggle = () => setTheme((t) => (t === 'dark' ? 'light' : 'dark'));
    return { theme, setTheme, toggle };
}
