import { useCallback, useEffect, useState } from 'react';

export type Appearance = 'light' | 'dark' | 'system';

const applyTheme = (_appearance: Appearance) => {
    // Force light mode across all pages as requested
    if (typeof document !== 'undefined') {
        document.documentElement.classList.remove('dark');
        document.documentElement.classList.add('light');
    }
};

export function initializeTheme() {
    applyTheme('light');
}

export function useAppearance() {
    const [appearance, setAppearance] = useState<Appearance>('light');

    const updateAppearance = useCallback((mode: Appearance) => {
        setAppearance('light');
        if (typeof localStorage !== 'undefined') {
            localStorage.setItem('appearance', 'light');
        }
        applyTheme('light');
    }, []);

    useEffect(() => {
        applyTheme('light');
    }, []);

    return { appearance: 'light' as Appearance, updateAppearance } as const;
}
