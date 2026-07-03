import { useState } from 'react';
import { AdminLayout } from './components/AdminLayout';
import { Overview } from './panels/Overview';
import { Snippets } from './panels/Snippets';
import { Notes } from './panels/Notes';
import { Goals } from './panels/Goals';
import { Leetcode } from './panels/Leetcode';

const PANELS: Record<string, React.ReactNode> = {
  overview: <Overview />,
  snippets: <Snippets />,
  notes: <Notes />,
  goals: <Goals />,
  leetcode: <Leetcode />,
};

export function AdminPanel() {
  const [active, setActive] = useState('overview');
  return (
    <AdminLayout active={active} onNav={setActive}>
      {PANELS[active]}
    </AdminLayout>
  );
}
