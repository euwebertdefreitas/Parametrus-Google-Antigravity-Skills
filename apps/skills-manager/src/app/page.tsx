
import { ManagerApp } from '@/components/ManagerApp';
import { getSkills } from './actions';

export default async function Home() {
  const skills = await getSkills();
  // We cannot pass getSkills result directly if it has non-serializable data, but here it's simple JSON-like.

  return <ManagerApp initialSkills={skills} />;
}
