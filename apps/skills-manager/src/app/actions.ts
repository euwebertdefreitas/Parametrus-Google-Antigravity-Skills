"use server";

import fs from 'fs-extra';
import path from 'path';
import matter from 'gray-matter';
import os from 'os';

// This is likely running server-side, so process.cwd is good.
const SKILLS_ROOT = path.join(process.cwd(), '../../skills');
const WORKSPACE_AGENTS_ROOT = path.join(process.cwd(), '../../.agent/skills');
const GLOBAL_HOME_ROOT = path.join(os.homedir(), '.antigravity/skills');

export async function getSkills() {
    const dirs = await fs.readdir(SKILLS_ROOT);

    const results = [];
    for (const dir of dirs) {
        const skillPath = path.join(SKILLS_ROOT, dir, 'SKILL.md');
        if (!fs.existsSync(skillPath)) continue;

        const content = await fs.readFile(skillPath, 'utf8');
        const { data } = matter(content);

        const isWorkspaceInstalled = fs.existsSync(path.join(WORKSPACE_AGENTS_ROOT, dir));
        const isGlobalInstalled = fs.existsSync(path.join(GLOBAL_HOME_ROOT, dir));

        results.push({
            id: dir,
            name: data.name || dir,
            description: data.description || 'No description.',
            installed: {
                workspace: isWorkspaceInstalled,
                global: isGlobalInstalled,
            }
        });
    }
    return results;
}

export async function installSkill(skillId: string, location: 'global' | 'workspace') {
    const source = path.join(SKILLS_ROOT, skillId);
    if (!fs.existsSync(source)) throw new Error('Skill not found');

    let target = '';
    if (location === 'global') {
        target = path.join(GLOBAL_HOME_ROOT, skillId);
    } else {
        target = path.join(WORKSPACE_AGENTS_ROOT, skillId);
    }

    await fs.ensureDir(target);
    await fs.copy(source, target);
    return { success: true };
}

export async function uninstallSkill(skillId: string, location: 'global' | 'workspace') {
    let target = '';
    if (location === 'global') {
        target = path.join(GLOBAL_HOME_ROOT, skillId);
    } else {
        target = path.join(WORKSPACE_AGENTS_ROOT, skillId);
    }

    if (fs.existsSync(target)) {
        await fs.remove(target);
    }
    return { success: true };
}
