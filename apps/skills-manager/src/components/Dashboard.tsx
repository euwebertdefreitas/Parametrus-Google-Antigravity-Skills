'use client';

import { useState, useTransition } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Loader2, Check, X, Download, Monitor, Globe } from 'lucide-react';
import { cn } from '@/lib/utils'; // Assuming standard setup or I'll implement it inline to be safe.

// Since I didn't create utils:
function classNames(...classes: string[]) {
    return classes.filter(Boolean).join(' ');
}

type Skill = {
    id: string;
    name: string;
    description: string;
    installed: {
        global: boolean;
        workspace: boolean;
    };
};

export function Dashboard({
    initialSkills,
    onInstall,
    onUninstall
}: {
    initialSkills: Skill[],
    onInstall: (id: string, scope: 'global' | 'workspace') => Promise<any>,
    onUninstall: (id: string, scope: 'global' | 'workspace') => Promise<any>
}) {
    const [skills, setSkills] = useState(initialSkills);
    const [query, setQuery] = useState('');
    const [isPending, startTransition] = useTransition();

    const filtered = skills.filter(s =>
        s.name.toLowerCase().includes(query.toLowerCase()) ||
        s.description.toLowerCase().includes(query.toLowerCase())
    );

    async function toggleInstall(skillId: string, scope: 'global' | 'workspace') {
        const isInstalled = skills.find(s => s.id === skillId)?.installed[scope];

        // Optimistic Update
        setSkills(prev => prev.map(s => {
            if (s.id === skillId) {
                return {
                    ...s,
                    installed: { ...s.installed, [scope]: !isInstalled }
                };
            }
            return s;
        }));

        startTransition(async () => {
            try {
                if (isInstalled) {
                    await onUninstall(skillId, scope);
                } else {
                    await onInstall(skillId, scope);
                }
            } catch (err) {
                // Rollback
                setSkills(prev => prev.map(s => {
                    if (s.id === skillId) {
                        return {
                            ...s,
                            installed: { ...s.installed, [scope]: isInstalled }
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
            {/* Search Filter */}
            <div className="relative max-w-lg mx-auto">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search className="h-5 w-5 text-slate-500" />
                </div>
                <input
                    type="text"
                    className="block w-full pl-10 pr-3 py-4 border border-slate-700 rounded-xl bg-slate-900 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 sm:text-lg transition-colors"
                    placeholder="Filter skills..."
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
                <AnimatePresence>
                    {filtered.map(skill => (
                        <motion.div
                            key={skill.id}
                            layout
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            className="bg-slate-900/50 backdrop-blur border border-slate-800 rounded-2xl p-6 hover:border-slate-600 transition-colors flex flex-col justify-between"
                        >
                            <div>
                                <div className="flex justify-between items-start mb-4">
                                    <h3 className="text-xl font-bold text-white pr-4">{skill.name}</h3>
                                    <div className="flex gap-1 md:hidden lg:hidden">
                                        {/* Tiny indicators for mobile */}
                                    </div>
                                </div>
                                <p className="text-slate-400 text-sm leading-relaxed mb-6 line-clamp-3">
                                    {skill.description}
                                </p>
                            </div>

                            <div className="space-y-3 pt-4 border-t border-slate-800">
                                {/* Global Toggle */}
                                <div className="flex items-center justify-between group">
                                    <div className="flex items-center gap-2 text-slate-400 group-hover:text-white transition-colors">
                                        <Globe className="w-4 h-4" />
                                        <span className="text-sm font-medium">Global</span>
                                    </div>
                                    <button
                                        onClick={() => toggleInstall(skill.id, 'global')}
                                        className={classNames(
                                            "relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2 focus:ring-offset-slate-900",
                                            skill.installed.global ? "bg-cyan-600" : "bg-slate-700"
                                        )}
                                    >
                                        <span
                                            className={classNames(
                                                "inline-block h-4 w-4 transform rounded-full bg-white transition-transform",
                                                skill.installed.global ? "translate-x-6" : "translate-x-1"
                                            )}
                                        />
                                    </button>
                                </div>

                                {/* Workspace Toggle */}
                                <div className="flex items-center justify-between group">
                                    <div className="flex items-center gap-2 text-slate-400 group-hover:text-white transition-colors">
                                        <Monitor className="w-4 h-4" />
                                        <span className="text-sm font-medium">Workspace</span>
                                    </div>
                                    <button
                                        onClick={() => toggleInstall(skill.id, 'workspace')}
                                        className={classNames(
                                            "relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-slate-900",
                                            skill.installed.workspace ? "bg-purple-600" : "bg-slate-700"
                                        )}
                                    >
                                        <span
                                            className={classNames(
                                                "inline-block h-4 w-4 transform rounded-full bg-white transition-transform",
                                                skill.installed.workspace ? "translate-x-6" : "translate-x-1"
                                            )}
                                        />
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>

            {filtered.length === 0 && (
                <div className="text-center py-20 text-slate-500">
                    No skills found matching "{query}"
                </div>
            )}
        </div>
    );
}
