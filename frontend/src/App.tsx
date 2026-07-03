import { Routes, Route } from 'react-router-dom';
import { Layout } from './components/Layout';
import { Dashboard } from './pages/Dashboard';
import { Snippets } from './pages/Snippets';
import { AiDebug } from './pages/AiDebug';
import { ExplainCode } from './pages/ExplainCode';
import { Github } from './pages/Github';
import { Leetcode } from './pages/Leetcode';
import { Goals } from './pages/Goals';
import { Portfolio } from './pages/Portfolio';
import { Notes } from './pages/Notes';

const titled = (title: string, node: React.ReactNode) => <Layout title={title}>{node}</Layout>;

export default function App() {
  return (
    <Routes>
      <Route path="/" element={titled('Dashboard', <Dashboard />)} />
      <Route path="/snippets" element={titled('Code Snippets', <Snippets />)} />
      <Route path="/debug" element={titled('AI Debugging', <AiDebug />)} />
      <Route path="/explain" element={titled('Explain Code', <ExplainCode />)} />
      <Route path="/github" element={titled('GitHub', <Github />)} />
      <Route path="/leetcode" element={titled('LeetCode Tracker', <Leetcode />)} />
      <Route path="/goals" element={titled('Daily Coding Goals', <Goals />)} />
      <Route path="/portfolio" element={titled('Portfolio Generator', <Portfolio />)} />
      <Route path="/notes" element={titled('Notes', <Notes />)} />
    </Routes>
  );
}
