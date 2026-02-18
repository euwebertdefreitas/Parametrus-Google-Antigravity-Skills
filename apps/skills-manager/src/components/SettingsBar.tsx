'use client';

import { useTheme } from 'next-themes';
import { useLanguage } from '@/hooks/useLanguage';
import { Moon, Sun, Monitor, Globe } from 'lucide-react';
import { useState, useEffect } from 'react';

export function SettingsBar() {
    const { theme, setTheme } = useTheme();
    const { language, setLanguage, t } = useLanguage();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) return null;

    return (
        <div className="flex items-center gap-4 bg-white/10 backdrop-blur border border-white/20 rounded-full px-4 py-2 shadow-sm">
            {/* Language Switcher */}
            <div className="flex items-center gap-2 border-r border-slate-500/30 pr-4">
                <Globe className="w-4 h-4 text-slate-400" />
                <select
                    value={language}
                    onChange={(e) => setLanguage(e.target.value as any)}
                    className="bg-transparent text-sm font-medium text-slate-200 focus:outline-none cursor-pointer appearance-none pl-1 pr-6" // Custom styling for select
                    style={{ backgroundImage: 'none' }}
                >
                    <option className="text-slate-900" value="en">English</option>
                    <option className="text-slate-900" value="pt">Português</option>
                    <option className="text-slate-900" value="es">Español</option>
                </select>
            </div>

            {/* Theme Switcher */}
            <div className="flex items-center gap-2">
                <button
                    onClick={() => setTheme('light')}
                    className={`p-1.5 rounded-full transition-colors ${theme === 'light' ? 'bg-cyan-500 text-white' : 'text-slate-400 hover:text-white'}`}
                    title={t.light}
                >
                    <Sun className="w-4 h-4" />
                </button>
                <button
                    onClick={() => setTheme('dark')}
                    className={`p-1.5 rounded-full transition-colors ${theme === 'dark' ? 'bg-purple-600 text-white' : 'text-slate-400 hover:text-white'}`}
                    title={t.dark}
                >
                    <Moon className="w-4 h-4" />
                </button>
                <button
                    onClick={() => setTheme('system')}
                    className={`p-1.5 rounded-full transition-colors ${theme === 'system' ? 'bg-slate-700 text-white' : 'text-slate-400 hover:text-white'}`}
                    title={t.system}
                >
                    <Monitor className="w-4 h-4" />
                </button>
            </div>
        </div>
    );
}
