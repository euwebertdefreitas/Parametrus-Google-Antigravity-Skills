'use client';

import { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { translations, Language } from '@/lib/translations';

type LanguageContextType = {
    language: Language;
    setLanguage: (lang: Language) => void;
    t: typeof translations['en'];
};

const LanguageContext = createContext<LanguageContextType>({
    language: 'en',
    setLanguage: () => { },
    t: translations.en
});

export function useLanguage() {
    const context = useContext(LanguageContext);
    if (!context) {
        throw new Error('useLanguage must be used within a LanguageProvider');
    }
    return context;
}

export { translations };

export function LanguageProvider({ children }: { children: React.ReactNode }) {
    // Default to 'en', but we'll try to hydrate from localStorage
    const [language, setLanguageState] = useState<Language>('en');
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        try {
            const saved = localStorage.getItem('skill-manager-lang') as Language;
            if (saved && ['en', 'pt', 'es'].includes(saved)) {
                setLanguageState(saved);
            } else {
                const browserLang = navigator.language.split("-")[0];
                if (browserLang === 'pt') setLanguageState('pt');
                else if (browserLang === 'es') setLanguageState('es');
            }
        } catch (e) {
            console.error('Failed to load language preference', e);
        }
    }, []);

    const setLanguage = (lang: Language) => {
        setLanguageState(lang);
        if (typeof window !== 'undefined') {
            localStorage.setItem('skill-manager-lang', lang);
        }
    };

    const value = useMemo(() => ({
        language,
        setLanguage,
        t: translations[language] || translations.en
    }), [language]);

    if (!mounted) {
        // Avoid hydration mismatch by rendering same as server initially (en) or null
        // But for a client app like this, we can return children with default 'en' state
        // to avoid flickering, or just null. Let's return children to be safe with SEO.
    }

    return (
        <LanguageContext.Provider value={value}>
            {children}
        </LanguageContext.Provider>
    );
}
