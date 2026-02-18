'use client';

import { useState, useTransition, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Loader2, Globe, Monitor, CheckCircle, AlertCircle, FileCheck, Layers, Trash2, Cpu, Zap, Code, Database, LineChart, Briefcase, Activity, Sparkles, Filter } from 'lucide-react';
import { useLanguage } from '@/hooks/useLanguage';
import { installSkill, uninstallSkill, installAllSkills, uninstallAllSkills } from '@/app/actions';

// --- Types ---
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

// --- Helper Components ---

function getSkillIcon(name: string) {
    const n = name.toLowerCase();
    if (n.includes('frontend') || n.includes('react') || n.includes('ui')) return <Zap className="w-5 h-5 text-amber-500" />;
    if (n.includes('backend') || n.includes('api') || n.includes('server')) return <Cpu className="w-5 h-5 text-blue-500" />;
    if (n.includes('data') || n.includes('sql') || n.includes('analytics')) return <Database className="w-5 h-5 text-emerald-500" />;
    if (n.includes('manager') || n.includes('product') || n.includes('agile')) return <Briefcase className="w-5 h-5 text-purple-500" />;
    if (n.includes('medical') || n.includes('health') || n.includes('nursing')) return <Activity className="w-5 h-5 text-red-500" />;
    if (n.includes('orchestrator')) return <Sparkles className="w-5 h-5 text-cyan-500" />;
    if (n.includes('chart') || n.includes('seo') || n.includes('traffic')) return <LineChart className="w-5 h-5 text-pink-500" />;
    return <Code className="w-5 h-5 text-slate-500" />;
}

function StatusIndicator({ status, label, t }: { status: InstallStatus, label: string, t: any }) {
    if (!status.installed) return (
        <div className="flex items-center gap-2 text-xs text-slate-400 dark:text-slate-600 opacity-60">
            <div className="w-2 h-2 rounded-full bg-slate-300 dark:bg-slate-700" />
            <span>{label}</span>
        </div>
    );

    const color = status.valid ? 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]' : 'bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]';
    const text = status.valid ? t.status.operational : t.status.corrupted;
    const textColor = status.valid ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-500';

    return (
        <div className="flex items-center gap-2 text-xs font-medium transition-all duration-300 group">
            <div className={`w-2 h-2 rounded-full ${color} animate-pulse`} />
            <span className={`${textColor}`}>{label}</span>
        </div>
    );
}

// --- Main Component ---

export function Dashboard({ initialSkills }: { initialSkills: Skill[] }) {
    const [skills, setSkills] = useState(initialSkills);
    const [query, setQuery] = useState('');
    const [provider, setProvider] = useState<Provider>('antigravity');
    const [filterState, setFilterState] = useState<'all' | 'installed' | 'missing'>('all');
    const [isPending, startTransition] = useTransition();
    const { t } = useLanguage();

    // Compute Stats
    const stats = useMemo(() => {
        let installed = 0;
        let total = skills.length;
        skills.forEach(s => {
            if (s.providerStatus[provider]?.global.installed || s.providerStatus[provider]?.workspace.installed) {
                installed++;
            }
        });
        return { installed, total, percentage: Math.round((installed / total) * 100) || 0 };
    }, [skills, provider]);

    const filtered = skills.filter(s => {
        const matchesQuery = s.name.toLowerCase().includes(query.toLowerCase()) ||
            s.description.toLowerCase().includes(query.toLowerCase());

        const status = s.providerStatus[provider];
        const isInstalled = status?.global.installed || status?.workspace.installed;

        if (filterState === 'installed') return matchesQuery && isInstalled;
        if (filterState === 'missing') return matchesQuery && !isInstalled;
        return matchesQuery;
    });

    // --- Actions ---

    async function toggleInstall(skillId: string, scope: 'global' | 'workspace') {
        const currentStatus = skills.find(s => s.id === skillId)?.providerStatus[provider]?.[scope];
        const isInstalled = currentStatus?.installed;

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
                                valid: !isInstalled,
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
                if (isInstalled) await uninstallSkill(skillId, scope, provider);
                else await installSkill(skillId, scope, provider);
            } catch (err) {
                // Simplified rollback logic
                console.error('Failed, please refresh', err);
            }
        });
    }

    async function handleInstallAll() {
        if (!confirm(`${t.installAll}: ${t.confirmAction}`)) return;
        setSkills(prev => prev.map(s => ({
            ...s,
            providerStatus: {
                ...s.providerStatus,
                [provider]: {
                    ...s.providerStatus[provider],
                    global: { ...s.providerStatus[provider].global, installed: true, valid: true }
                }
            }
        })));
        startTransition(async () => { await installAllSkills('global', provider); });
    }

    async function handleUninstallAll() {
        if (!confirm(`${t.uninstallAll}: ${t.confirmAction}`)) return;
        setSkills(prev => prev.map(s => ({
            ...s,
            providerStatus: {
                ...s.providerStatus,
                [provider]: {
                    ...s.providerStatus[provider],
                    global: { ...s.providerStatus[provider].global, installed: false },
                    workspace: { ...s.providerStatus[provider].workspace, installed: false }
                }
            }
        })));
        startTransition(async () => {
            await uninstallAllSkills('global', provider);
            await uninstallAllSkills('workspace', provider);
        });
    }

    return (
        <div className="space-y-10 pb-20">
            {/* Header Control Panel */}
            <div className="glass-panel p-6 rounded-3xl space-y-6">

                {/* Top Row: Provider & Stats */}
                <div className="flex flex-col md:flex-row justify-between items-center gap-6">
                    {/* Provider Tabs */}
                    <div className="flex bg-slate-100 dark:bg-slate-800/50 p-1 rounded-full relative">
                        {(['antigravity', 'anthropic', 'openai'] as const).map((p) => (
                            <button
                                key={p}
                                onClick={() => setProvider(p)}
                                className={`relative z-10 px-6 py-2 rounded-full text-xs font-bold uppercase tracking-wider transition-all duration-300 ${provider === p
                                        ? 'text-white shadow-lg'
                                        : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
                                    }`}
                            >
                                {provider === p && (
                                    <motion.div
                                        layoutId="provider-bg"
                                        className="absolute inset-0 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-full"
                                        transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                                    />
                                )}
                                <span className="relative z-10">{t.providers?.[p] || p}</span>
                            </button>
                        ))}
                    </div>

                    {/* Quick Stats */}
                    <div className="flex items-center gap-4 text-sm font-medium text-slate-600 dark:text-slate-300">
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-cyan-500" />
                            {stats.installed} / {stats.total} Active
                        </div>
                        <div className="w-px h-4 bg-slate-300 dark:bg-slate-700" />
                        <div className="flex items-center gap-2">
                            <Activity className="w-4 h-4 text-emerald-500" />
                            {stats.percentage}% Coverage
                        </div>
                    </div>
                </div>

                {/* Bottom Row: Search & Actions */}
                <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                    <div className="relative w-full md:w-96 group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-cyan-500 transition-colors" />
                        <input
                            type="text"
                            className="w-full bg-transparent border-b-2 border-slate-200 dark:border-slate-700 py-3 pl-10 pr-4 text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none focus:border-cyan-500 transition-all font-medium"
                            placeholder={t.filterPlaceholder}
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                        />
                        {isPending && (
                            <Loader2 className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-cyan-500 animate-spin" />
                        )}
                    </div>

                    <div className="flex items-center gap-3">
                        {/* Filter Button */}
                        <div className="flex bg-slate-100 dark:bg-slate-800/50 rounded-lg p-1">
                            {(['all', 'installed', 'missing'] as const).map(f => (
                                <button
                                    key={f}
                                    onClick={() => setFilterState(f)}
                                    className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-colors ${filterState === f ? 'bg-white dark:bg-slate-700 shadow-sm text-cyan-600 dark:text-cyan-400' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
                                >
                                    {f.charAt(0).toUpperCase() + f.slice(1)}
                                </button>
                            ))}
                        </div>

                        <div className="w-px h-8 bg-slate-200 dark:bg-slate-700 mx-2" />

                        <button
                            onClick={handleInstallAll}
                            className="bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 p-2 rounded-xl transition-colors"
                            title={t.installAll}
                        >
                            <Layers className="w-5 h-5" />
                        </button>
                        <button
                            onClick={handleUninstallAll}
                            className="bg-red-500/10 hover:bg-red-500/20 text-red-600 dark:text-red-400 p-2 rounded-xl transition-colors"
                            title={t.uninstallAll}
                        >
                            <Trash2 className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            </div>

            {/* Grid */}
            <motion.div layout className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                <AnimatePresence mode='popLayout'>
                    {filtered.map((skill, index) => {
                        const status = skill.providerStatus[provider];
                        const isAnyInstalled = status?.global.installed || status?.workspace.installed;

                        return (
                            <motion.div
                                key={skill.id}
                                layout
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                transition={{ duration: 0.3, delay: index * 0.05 }}
                                className={`glass-card rounded-2xl p-5 flex flex-col justify-between group h-full relative overflow-hidden`}
                            >
                                {/* Decorative Gradient Blur */}
                                {isAnyInstalled && (
                                    <div className="absolute -top-10 -right-10 w-32 h-32 bg-cyan-500/10 blur-3xl rounded-full pointer-events-none" />
                                )}

                                <div>
                                    <div className="flex justify-between items-start mb-4 relative z-10">
                                        <div className="p-2.5 bg-slate-50 dark:bg-slate-800/80 rounded-xl shadow-inner">
                                            {getSkillIcon(skill.name)}
                                        </div>
                                        {isAnyInstalled && (
                                            <div className="bg-cyan-50 dark:bg-cyan-900/20 p-1.5 rounded-full">
                                                <FileCheck className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
                                            </div>
                                        )}
                                    </div>

                                    <h3 className="font-bold text-slate-800 dark:text-slate-100 mb-2 truncate group-hover:text-cyan-600 dark:group-hover:text-cyan-400 transition-colors">
                                        {skill.name}
                                    </h3>
                                    <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed line-clamp-3 mb-6 min-h-[3rem]">
                                        {skill.description}
                                    </p>
                                </div>

                                <div className="space-y-3 relative z-10">
                                    {/* Action Row: Global */}
                                    <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800/50">
                                        <div className="flex flex-col">
                                            <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 dark:text-slate-300">
                                                <Globe className="w-3 h-3" /> {t.global}
                                            </div>
                                            <StatusIndicator status={status?.global} label={t.global} t={t} />
                                        </div>
                                        <ToggleSwitch
                                            isOn={status?.global.installed}
                                            onToggle={() => toggleInstall(skill.id, 'global')}
                                            activeColor="bg-cyan-500"
                                        />
                                    </div>

                                    {/* Action Row: Workspace */}
                                    <div className="flex items-center justify-between">
                                        <div className="flex flex-col">
                                            <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 dark:text-slate-300">
                                                <Monitor className="w-3 h-3" /> {t.workspace}
                                            </div>
                                            <StatusIndicator status={status?.workspace} label={t.workspace} t={t} />
                                        </div>
                                        <ToggleSwitch
                                            isOn={status?.workspace.installed}
                                            onToggle={() => toggleInstall(skill.id, 'workspace')}
                                            activeColor="bg-purple-500"
                                        />
                                    </div>
                                </div>
                            </motion.div>
                        );
                    })}
                </AnimatePresence>
            </motion.div>

            {filtered.length === 0 && (
                <div className="flex flex-col items-center justify-center py-32 text-slate-400">
                    <div className="p-6 bg-slate-100 dark:bg-slate-800 rounded-full mb-4 animate-pulse">
                        <Search className="w-8 h-8 opacity-50" />
                    </div>
                    <p className="text-lg font-medium">{t.noSkills} "{query}"</p>
                    <button onClick={() => { setQuery(''); setFilterState('all') }} className="mt-4 text-cyan-500 hover:underline text-sm font-bold">
                        Clear Filters
                    </button>
                </div>
            )}
        </div>
    );
}

function ToggleSwitch({ isOn, onToggle, activeColor }: { isOn: boolean, onToggle: () => void, activeColor: string }) {
    return (
        <button
            onClick={onToggle}
            className={`w-10 h-6 flex items-center rounded-full p-1 cursor-pointer transition-colors duration-300 ${isOn ? activeColor : 'bg-slate-300 dark:bg-slate-700'}`}
        >
            <motion.div
                className="bg-white w-4 h-4 rounded-full shadow-sm"
                layout
                transition={{ type: "spring", stiffness: 700, damping: 30 }}
                style={{ marginLeft: isOn ? '16px' : '0px' }}
            />
        </button>
    );
}
