"use server";

import fs from 'fs-extra';
import path from 'path';
import matter from 'gray-matter';
import os from 'os';

const SKILLS_ROOT = path.join(process.cwd(), '../../skills');
const WORKSPACE_ROOT = path.join(process.cwd(), '../../.agent'); // Base for workspace specific skills
const HOME_DIR = os.homedir();

// Maps for provider paths (Global and Workspace)
// For simplicity, we assume consistent naming:
const PROVIDER_PATHS: Record<string, { global: string; workspace: string }> = {
    antigravity: {
        global: path.join(HOME_DIR, '.antigravity/skills'),
        workspace: path.join(WORKSPACE_ROOT, 'skills/antigravity'),
    },
    anthropic: {
        global: path.join(HOME_DIR, '.anthropic/skills'),
        workspace: path.join(WORKSPACE_ROOT, 'skills/anthropic'),
    },
    openai: {
        global: path.join(HOME_DIR, '.openai/skills'),
        workspace: path.join(WORKSPACE_ROOT, 'skills/openai'),
    }
};

// Default fallback for legacy compatibility (Antigravity assumes .agent/skills directly without subfolder usually, but let's standardize)
// Actually, to not break existing Antigravity installation, let's map it correctly based on previous setup:
PROVIDER_PATHS.antigravity.workspace = path.join(process.cwd(), '../../.agent/skills');

export async function getSkills() {
    const dirs = await fs.readdir(SKILLS_ROOT);

    const results = [];
    for (const dir of dirs) {
        const skillPath = path.join(SKILLS_ROOT, dir, 'SKILL.md');
        if (!fs.existsSync(skillPath)) continue;

        const content = await fs.readFile(skillPath, 'utf8');
        const { data } = matter(content);

        // Check installation status for ALL providers
        const installedStatus: Record<string, { global: boolean; workspace: boolean }> = {};

        for (const [provider, paths] of Object.entries(PROVIDER_PATHS)) {
            installedStatus[provider] = {
                global: fs.existsSync(path.join(paths.global, dir)),
                workspace: fs.existsSync(path.join(paths.workspace, dir)),
            };
        }

        results.push({
            id: dir,
            name: data.name || dir,
            description: data.description || 'No description.',
            installed: installedStatus
        });
    }
    return results;
}

export async function installSkill(skillId: string, location: 'global' | 'workspace', provider: string) {
    const source = path.join(SKILLS_ROOT, skillId);
    if (!fs.existsSync(source)) throw new Error('Skill not found');

    const providerPath = PROVIDER_PATHS[provider];
    if (!providerPath) throw new Error('Invalid provider');

    const targetRoot = location === 'global' ? providerPath.global : providerPath.workspace;
    const target = path.join(targetRoot, skillId);

    await fs.ensureDir(target);
    await fs.copy(source, target);
    return { success: true };
}

export async function uninstallSkill(skillId: string, location: 'global' | 'workspace', provider: string) {
    const providerPath = PROVIDER_PATHS[provider];
    if (!providerPath) throw new Error('Invalid provider');

    const targetRoot = location === 'global' ? providerPath.global : providerPath.workspace;
    const target = path.join(targetRoot, skillId);

    if (fs.existsSync(target)) {
        await fs.remove(target);
    }
    return { success: true };
}
