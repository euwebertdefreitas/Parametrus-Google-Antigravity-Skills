'use client';

import { createContext, useContext, useState, useEffect } from 'react';
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
    return useContext(LanguageContext);
}

// Re-export translations for convenience
export { translations };

export function LanguageProvider({ children }: { children: React.ReactNode }) {
    const [language, setLanguageState] = useState<Language>('en');

    useEffect(() => {
        // Only access localStorage on client mount
        try {
            const saved = localStorage.getItem('skill-manager-lang') as Language;
            if (saved && ['en', 'pt', 'es'].includes(saved)) {
                setLanguageState(saved);
            } else {
                // Simple browser language check
                const browserLang = navigator.language.split("-")[0];
                if (browserLang === 'pt') setLanguageState('pt');
                else if (browserLang === 'es') setLanguageState('es');
            }
        } catch (e) {
            console.error(e);
        }
    }, []);

    const setLanguage = (lang: Language) => {
        setLanguageState(lang);
        localStorage.setItem('skill-manager-lang', lang);
    };

    return (
        <LanguageContext.Provider value={{ language, setLanguage, t: translations[language] }}>
            {children}
        </LanguageContext.Provider>
    );
}
