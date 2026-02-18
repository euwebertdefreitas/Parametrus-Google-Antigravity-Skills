'use client';

import { ThemeProvider } from 'next-themes';
import { LanguageProvider as LangProvider } from '@/hooks/useLanguage'; // renamed to avoid conflict

export function Providers({ children }: { children: React.ReactNode }) {
    return (
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
            <LangProvider>
                {children}
            </LangProvider>
        </ThemeProvider>
    );
}
