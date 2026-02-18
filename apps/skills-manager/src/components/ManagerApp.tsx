'use client';

import { useLanguage } from '@/hooks/useLanguage';
import { Dashboard } from '@/components/Dashboard';
import { useTheme } from 'next-themes';
import { Sun, Moon, Monitor, Globe, Command } from 'lucide-react';
import { motion } from 'framer-motion';

export function ManagerApp({ initialSkills }: { initialSkills: any[] }) {
    const { t, language, setLanguage } = useLanguage();
    const { theme, setTheme } = useTheme();

    return (
        <div className="min-h-screen bg-slate-50/50 dark:bg-slate-950/50 transition-colors duration-500 selection:bg-cyan-500/30">

            {/* Nav Header */}
            <nav className="fixed top-0 inset-x-0 z-50 glass-panel border-b-0 rounded-none px-8 py-4 flex justify-between items-center backdrop-blur-md bg-white/70 dark:bg-slate-900/80 sticky">
                <div className="flex items-center gap-3">
                    <div className="bg-gradient-to-tr from-cyan-500 to-blue-600 p-2 rounded-xl shadow-lg shadow-cyan-500/20">
                        <Command className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-slate-900 via-slate-700 to-slate-900 dark:from-white dark:via-slate-200 dark:to-slate-400">
                            {t.title}
                        </h1>
                        <p className="text-xs text-slate-500 font-medium tracking-wide">PARAMETRUS // ANTIGRAVITY</p>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    {/* Settings Group */}
                    <div className="flex bg-slate-100 dark:bg-slate-800 rounded-full p-1 border border-slate-200 dark:border-slate-700">
                        {/* Language */}
                        <div className="relative group px-3 flex items-center cursor-pointer border-r border-slate-300 dark:border-slate-600 pr-3 mr-1">
                            <Globe className="w-4 h-4 text-slate-500 dark:text-slate-400 mr-2" />
                            <select
                                value={language}
                                onChange={(e) => setLanguage(e.target.value as any)}
                                className="bg-transparent text-xs font-bold text-slate-700 dark:text-slate-200 appearance-none focus:outline-none cursor-pointer pr-4"
                            >
                                <option value="en">EN</option>
                                <option value="pt">PT</option>
                                <option value="es">ES</option>
                            </select>
                        </div>

                        {/* Theme */}
                        <div className="flex gap-1">
                            <button onClick={() => setTheme('light')} className={`p-1.5 rounded-full transition-all ${theme === 'light' ? 'bg-white shadow text-amber-500' : 'text-slate-400 hover:text-slate-600'}`}>
                                <Sun className="w-3.5 h-3.5" />
                            </button>
                            <button onClick={() => setTheme('dark')} className={`p-1.5 rounded-full transition-all ${theme === 'dark' ? 'bg-slate-700 shadow text-purple-400' : 'text-slate-400 hover:text-slate-600'}`}>
                                <Moon className="w-3.5 h-3.5" />
                            </button>
                            <button onClick={() => setTheme('system')} className={`p-1.5 rounded-full transition-all ${theme === 'system' ? 'bg-slate-600 shadow text-white' : 'text-slate-400 hover:text-slate-600'}`}>
                                <Monitor className="w-3.5 h-3.5" />
                            </button>
                        </div>
                    </div>
                </div>
            </nav>

            <main className="max-w-7xl mx-auto px-6 py-12 pt-24">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                >
                    <header className="mb-12 text-center relative max-w-3xl mx-auto">
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[300px] bg-cyan-500/20 blur-[120px] rounded-full pointer-events-none" />

                        <h2 className="text-4xl md:text-6xl font-black text-slate-900 dark:text-white mb-6 relative z-10 tracking-tight">
                            Command Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-600">Digital Squad</span>
                        </h2>
                        <p className="text-lg md:text-xl text-slate-600 dark:text-slate-400 relative z-10 font-light leading-relaxed">
                            {t.subtitle} Elevate your workflow with enterprise-grade autonomous agents.
                        </p>
                    </header>
                </motion.div>

                <Dashboard initialSkills={initialSkills} />
            </main>
        </div>
    );
}
