import { useState } from 'react';
import { AdminLayout } from './components/AdminLayout';
import { Overview } from './panels/Overview';
import { Users } from './panels/Users';
import { Snippets } from './panels/Snippets';
import { Notes } from './panels/Notes';
import { Goals } from './panels/Goals';
import { Leetcode } from './panels/Leetcode';

type PanelId = 'overview' | 'users' | 'snippets' | 'notes' | 'goals' | 'leetcode';

const PANELS: Record<PanelId, React.ReactNode> = {
  overview: <Overview />,
  users:    <Users />,
  snippets: <Snippets />,
  notes:    <Notes />,
  goals:    <Goals />,
  leetcode: <Leetcode />,
};

export function AdminPanel() {
  const [active, setActive] = useState<PanelId>('overview');
  return (
    <AdminLayout active={active} onNav={id => setActive(id as PanelId)}>
      {PANELS[active]}
    </AdminLayout>
  );
}
