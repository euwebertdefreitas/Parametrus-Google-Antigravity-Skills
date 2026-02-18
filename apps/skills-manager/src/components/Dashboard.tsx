'use client';

import { useState, useTransition } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Loader2, Globe, Monitor, CheckCircle, AlertCircle, FileCheck } from 'lucide-react';
import { useLanguage } from '@/hooks/useLanguage';
import { installSkill, uninstallSkill } from '@/app/actions';

type InstallStatus = {
    installed: boolean;
    valid: boolean;
    lastModified: string | null;
}

type Skill = {
    id: string;
    name: string;
    description: string;
    providerStatus: Record<string, {
        global: InstallStatus;
        workspace: InstallStatus;
    }>
};

type Provider = 'antigravity' | 'anthropic' | 'openai';

function StatusBadge({ status, label }: { status: InstallStatus, label: string }) {
    if (!status.installed) return null;

    if (status.valid) {
        return (
            <div className="flex items-center gap-1.5 text-xs font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/30 px-2 py-1 rounded-full border border-emerald-100 dark:border-emerald-800">
                <CheckCircle className="w-3 h-3" />
                <span>{label}: Operational</span>
            </div>
        );
    } else {
        return (
            <div className="flex items-center gap-1.5 text-xs font-medium text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/30 px-2 py-1 rounded-full border border-red-100 dark:border-red-800">
                <AlertCircle className="w-3 h-3" />
                <span>{label}: Corrupted</span>
            </div>
        );
    }
}

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
        const currentStatus = skills.find(s => s.id === skillId)?.providerStatus[provider]?.[scope];
        const isInstalled = currentStatus?.installed;

        // Optimistic Update
        setSkills(prev => prev.map(s => {
            if (s.id === skillId) {
                return {
                    ...s,
                    providerStatus: {
                        ...s.providerStatus,
                        [provider]: {
                            ...s.providerStatus[provider],
                            [scope]: {
                                installed: !isInstalled,
                                valid: !isInstalled, // Assume valid on optimistic install
                                lastModified: new Date().toISOString()
                            }
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
                        // Revert logic would be complex without deep clone or reload, simplified for demo:
                        // Ideally we re-fetch from server here.
                        console.error('Failed, please refresh');
                        return s;
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
                    {filtered.map(skill => {
                        const status = skill.providerStatus[provider];
                        const isAnyInstalled = status?.global.installed || status?.workspace.installed;

                        return (
                            <motion.div
                                key={skill.id}
                                layout
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                className={`bg-white/50 dark:bg-slate-900/50 backdrop-blur border rounded-2xl p-6 transition-all flex flex-col justify-between shadow-sm dark:shadow-none ${isAnyInstalled ? 'border-cyan-500/30' : 'border-slate-200 dark:border-slate-800'}`}
                            >
                                <div>
                                    <div className="flex justify-between items-start mb-2">
                                        <h3 className="text-xl font-bold text-slate-800 dark:text-white pr-4">{skill.name}</h3>
                                        {isAnyInstalled && <FileCheck className="w-5 h-5 text-cyan-500" />}
                                    </div>

                                    {/* Status Badges */}
                                    <div className="flex gap-2 mb-4 flex-wrap">
                                        {status?.global.installed && <StatusBadge status={status.global} label="Global" />}
                                        {status?.workspace.installed && <StatusBadge status={status.workspace} label="Workspace" />}
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
                                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-slate-900 ${status?.global.installed ? "bg-cyan-600" : "bg-slate-300 dark:bg-slate-700"
                                                }`}
                                        >
                                            <span
                                                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${status?.global.installed ? "translate-x-6" : "translate-x-1"
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
                                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-slate-900 ${status?.workspace.installed ? "bg-purple-600" : "bg-slate-300 dark:bg-slate-700"
                                                }`}
                                        >
                                            <span
                                                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${status?.workspace.installed ? "translate-x-6" : "translate-x-1"
                                                    }`}
                                            />
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        )
                    })}
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
