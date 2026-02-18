import fs from 'fs-extra';
import path from 'path';
import matter from 'gray-matter';
import os from 'os';

const SKILLS_ROOT = path.resolve(process.cwd(), '../../skills');
const WORKSPACE_ROOT = path.resolve(process.cwd(), '../../'); // The repo root

export interface Skill {
  id: string;
  name: string;
  description: string;
  installedGlobal: boolean;
  installedWorkspace: boolean;
}

export async function getSkills(): Promise<Skill[]> {
  if (!fs.existsSync(SKILLS_ROOT)) return [];
  
  const skillFolders = await fs.readdir(SKILLS_ROOT);
  const skills: Skill[] = [];

  const homeDir = os.homedir();
  
  // Define installation paths
  const globalSkillsDir = path.join(homeDir, '.antigravity', 'skills');
  const workspaceSkillsDir = path.join(WORKSPACE_ROOT, '.agent', 'skills');

  for (const folder of skillFolders) {
    const skillPath = path.join(SKILLS_ROOT, folder, 'SKILL.md');
    if (fs.existsSync(skillPath)) {
      const content = await fs.readFile(skillPath, 'utf-8');
      const { data } = matter(content);
      
      const isGlobal = fs.existsSync(path.join(globalSkillsDir, folder, 'SKILL.md'));
      const isWorkspace = fs.existsSync(path.join(workspaceSkillsDir, folder, 'SKILL.md'));

      skills.push({
        id: folder,
        name: data.name || folder,
        description: data.description || 'No description available.',
        installedGlobal: isGlobal,
        installedWorkspace: isWorkspace,
      });
    }
  }
  return skills;
}

export async function installSkill(skillId: string, type: 'global' | 'workspace') {
  const sourceDir = path.join(SKILLS_ROOT, skillId);
  if (!fs.existsSync(sourceDir)) throw new Error('Skill not found');

  let targetDir = '';
  if (type === 'global') {
    targetDir = path.join(os.homedir(), '.antigravity', 'skills', skillId);
  } else {
    targetDir = path.join(WORKSPACE_ROOT, '.agent', 'skills', skillId);
  }

  await fs.ensureDir(targetDir);
  await fs.copy(sourceDir, targetDir, { overwrite: true });
}

export async function uninstallSkill(skillId: string, type: 'global' | 'workspace') {
  let targetDir = '';
  if (type === 'global') {
    targetDir = path.join(os.homedir(), '.antigravity', 'skills', skillId);
  } else {
    targetDir = path.join(WORKSPACE_ROOT, '.agent', 'skills', skillId);
  }

  if (fs.existsSync(targetDir)) {
    await fs.remove(targetDir);
  }
}
