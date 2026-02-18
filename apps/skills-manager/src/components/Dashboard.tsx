'use client';

import { useState, useTransition } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Loader2, Globe, Monitor, Box } from 'lucide-react';
import { useLanguage } from '@/hooks/useLanguage';
import { installSkill, uninstallSkill } from '@/app/actions';

type Skill = {
    id: string;
    name: string;
    description: string;
    installed: Record<string, {
        global: boolean;
        workspace: boolean;
    }>
};

type Provider = 'antigravity' | 'anthropic' | 'openai';

export function Dashboard({
    initialSkills
}: {
    initialSkills: Skill[]
}) {
    const [skills, setSkills] = useState(initialSkills);
    const [query, setQuery] = useState('');
    const [provider, setProvider] = useState<Provider>('antigravity');
    const [isPending, startTransition] = useTransition();
    const { t } = useLanguage();

    const filtered = skills.filter(s =>
        s.name.toLowerCase().includes(query.toLowerCase()) ||
        s.description.toLowerCase().includes(query.toLowerCase())
    );

    async function toggleInstall(skillId: string, scope: 'global' | 'workspace') {
        const isInstalled = skills.find(s => s.id === skillId)?.installed[provider]?.[scope];

        // Optimistic Update
        setSkills(prev => prev.map(s => {
            if (s.id === skillId) {
                return {
                    ...s,
                    installed: {
                        ...s.installed,
                        [provider]: {
                            ...s.installed[provider],
                            [scope]: !isInstalled
                        }
                    }
                };
            }
            return s;
        }));

        startTransition(async () => {
            try {
                if (isInstalled) {
                    await uninstallSkill(skillId, scope, provider);
                } else {
                    await installSkill(skillId, scope, provider);
                }
            } catch (err) {
                // Rollback
                setSkills(prev => prev.map(s => {
                    if (s.id === skillId) {
                        return {
                            ...s,
                            installed: {
                                ...s.installed,
                                [provider]: {
                                    ...s.installed[provider],
                                    [scope]: isInstalled
                                }
                            }
                        };
                    }
                    return s;
                }));
                console.error('Failed to change install state:', err);
            }
        });
    }

    return (
        <div className="space-y-8">
            {/* Provider Selector */}
            <div className="flex justify-center gap-4 mb-8">
                {(['antigravity', 'anthropic', 'openai'] as const).map((p) => (
                    <button
                        key={p}
                        onClick={() => setProvider(p)}
                        className={`px-6 py-2 rounded-full text-sm font-medium transition-all ${provider === p
                                ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg scale-105'
                                : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700'
                            }`}
                    >
                        {t.providers?.[p] || p}
                    </button>
                ))}
            </div>

            {/* Search Filter */}
            <div className="relative max-w-lg mx-auto">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search className="h-5 w-5 text-slate-400 dark:text-slate-500" />
                </div>
                <input
                    type="text"
                    className="block w-full pl-10 pr-3 py-4 border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 sm:text-lg transition-colors shadow-sm"
                    placeholder={t.filterPlaceholder}
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                />
                {isPending && (
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                        <Loader2 className="h-5 w-5 text-cyan-500 animate-spin" />
                    </div>
                )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <AnimatePresence mode='popLayout'>
                    {filtered.map(skill => (
                        <motion.div
                            key={skill.id}
                            layout
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            className="bg-white/50 dark:bg-slate-900/50 backdrop-blur border border-slate-200 dark:border-slate-800 rounded-2xl p-6 hover:border-slate-400 dark:hover:border-slate-600 transition-colors flex flex-col justify-between shadow-sm dark:shadow-none"
                        >
                            <div>
                                <div className="flex justify-between items-start mb-4">
                                    <h3 className="text-xl font-bold text-slate-800 dark:text-white pr-4">{skill.name}</h3>
                                </div>
                                <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed mb-6 line-clamp-3">
                                    {skill.description}
                                </p>
                            </div>

                            <div className="space-y-3 pt-4 border-t border-slate-200 dark:border-slate-800">
                                {/* Global Toggle */}
                                <div className="flex items-center justify-between group">
                                    <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 group-hover:text-slate-800 dark:group-hover:text-white transition-colors">
                                        <Globe className="w-4 h-4" />
                                        <span className="text-sm font-medium">{t.global}</span>
                                    </div>
                                    <button
                                        onClick={() => toggleInstall(skill.id, 'global')}
                                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-slate-900 ${skill.installed[provider]?.global ? "bg-cyan-600" : "bg-slate-300 dark:bg-slate-700"
                                            }`}
                                    >
                                        <span
                                            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${skill.installed[provider]?.global ? "translate-x-6" : "translate-x-1"
                                                }`}
                                        />
                                    </button>
                                </div>

                                {/* Workspace Toggle */}
                                <div className="flex items-center justify-between group">
                                    <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 group-hover:text-slate-800 dark:group-hover:text-white transition-colors">
                                        <Monitor className="w-4 h-4" />
                                        <span className="text-sm font-medium">{t.workspace}</span>
                                    </div>
                                    <button
                                        onClick={() => toggleInstall(skill.id, 'workspace')}
                                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-slate-900 ${skill.installed[provider]?.workspace ? "bg-purple-600" : "bg-slate-300 dark:bg-slate-700"
                                            }`}
                                    >
                                        <span
                                            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${skill.installed[provider]?.workspace ? "translate-x-6" : "translate-x-1"
                                                }`}
                                        />
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>

            {filtered.length === 0 && (
                <div className="text-center py-20 text-slate-400 dark:text-slate-500">
                    {t.noSkills} "{query}"
                </div>
            )}
        </div>
    );
}
