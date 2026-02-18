'use client';

import { useLanguage } from '@/hooks/useLanguage';
import { SettingsBar } from '@/components/SettingsBar';
import { Dashboard } from '@/components/Dashboard';

export function ManagerApp({ initialSkills }: { initialSkills: any[] }) {
    const { t } = useLanguage();

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 p-8 transition-colors duration-300">
            <div className="max-w-7xl mx-auto">
                <header className="mb-12 flex flex-col items-center text-center relative">
                    <div className="absolute top-0 right-0">
                        <SettingsBar />
                    </div>

                    <h1 className="text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-cyan-500 to-purple-600 mb-4 mt-12 md:mt-0">
                        {t.title}
                    </h1>
                    <p className="text-slate-600 dark:text-slate-400 text-lg max-w-2xl">
                        {t.subtitle}
                    </p>
                </header>

                <Dashboard
                    initialSkills={initialSkills}
                // We pass server actions as props from parent page usually, or direct import if allowed in client components (which it is for Server Actions)
                />
            </div>
        </div>
    );
}
