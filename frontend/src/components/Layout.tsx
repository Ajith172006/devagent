import { useState, type ReactNode } from 'react';
import { useLocation } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { TopBar } from './TopBar';

export function Layout({ title, children }: { title: string; children: ReactNode }) {
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const getBgImage = (path: string) => {
    switch (path) {
      case '/':
        return '/bg-developers-server.jpg';
      case '/explain':
        return '/bg-hologram-code.jpg';
      case '/debug':
      case '/snippets':
        return '/bg-editor-code.jpg';
      case '/github':
      case '/portfolio':
        return '/bg-cloud-network.jpg';
      case '/leetcode':
      case '/goals':
      case '/notes':
      case '/profile':
        return '/bg-waves.jpg';
      default:
        return '/bg-developers-server.jpg';
    }
  };

  const bgImage = getBgImage(location.pathname);

  return (
    <div className="flex h-screen text-[var(--color-text)] relative overflow-hidden bg-[var(--color-ink)]">
      {/* Animated dynamic background container */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-animate-flow pointer-events-none transition-all duration-700 ease-in-out"
        style={{
          backgroundImage: `linear-gradient(to bottom, rgba(14, 16, 23, 0.58), rgba(14, 16, 23, 0.75)), url('${bgImage}')`,
          backgroundSize: '120% 120%'
        }}
      />
      
      {/* Background ambient glowing blobs */}
      <div className="absolute top-[-10%] left-[-10%] w-[350px] h-[350px] rounded-full bg-[rgba(232,179,57,0.06)] blur-[100px] pointer-events-none animate-pulse duration-[8000ms]" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[400px] h-[400px] rounded-full bg-[rgba(79,174,132,0.06)] blur-[110px] pointer-events-none animate-pulse duration-[12000ms]" />
      
      <Sidebar isOpen={isMobileMenuOpen} onClose={() => setIsMobileMenuOpen(false)} />
      <div className="flex min-w-0 flex-1 flex-col relative z-10">
        <TopBar title={title} onMenuClick={() => setIsMobileMenuOpen(true)} />
        <main key={location.pathname} className="scrollbar-thin flex-1 overflow-y-auto px-4 py-4 md:px-6 md:py-6 fade-in-slide">{children}</main>
      </div>
    </div>
  );
}
