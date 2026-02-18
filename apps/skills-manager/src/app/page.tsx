
import { Dashboard } from '@/components/Dashboard';
import { getSkills, installSkill, uninstallSkill } from './actions';

export default async function Home() {
  const skills = await getSkills();

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 p-8">
      <div className="max-w-7xl mx-auto">
        <header className="mb-12 text-center">
          <h1 className="text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-purple-600 mb-4">
            Antigravity Skill Manager
          </h1>
          <p className="text-slate-400 text-lg">
            Manage your AI agent's capabilities across global and workspace scopes.
          </p>
        </header>

        <Dashboard
          initialSkills={skills}
          onInstall={installSkill}
          onUninstall={uninstallSkill}
        />
      </div>
    </main>
  );
}
