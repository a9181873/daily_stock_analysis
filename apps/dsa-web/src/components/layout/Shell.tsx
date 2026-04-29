import type React from 'react';
import { useEffect, useState } from 'react';
import { Menu } from 'lucide-react';
import { Outlet } from 'react-router-dom';
import { Drawer } from '../common/Drawer';
import { SidebarNav } from './SidebarNav';
import { ThemeToggle } from '../theme/ThemeToggle';

type ShellProps = {
  children?: React.ReactNode;
};

export const Shell: React.FC<ShellProps> = ({ children }) => {
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    if (!mobileOpen) {
      return undefined;
    }

    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setMobileOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [mobileOpen]);

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* 桌面側邊欄（lg+ 顯示） */}
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 flex-col border-r border-border/60 bg-background px-3 py-4 lg:flex">
        <SidebarNav layoutIdPrefix="desktop" />
      </aside>

      {/* 行動版頂部列（lg 以下顯示） */}
      <div className="pointer-events-none fixed inset-x-0 top-3 z-40 flex items-start justify-between px-3 lg:hidden">
        <button
          type="button"
          onClick={() => setMobileOpen(true)}
          className="pointer-events-auto inline-flex h-10 w-10 items-center justify-center rounded-xl border border-border/70 bg-card/85 text-secondary-text shadow-soft-card backdrop-blur-md transition-colors hover:bg-hover hover:text-foreground"
          aria-label="開啟導覽選單"
        >
          <Menu className="h-5 w-5" />
        </button>
        <div className="pointer-events-auto ml-auto">
          <ThemeToggle />
        </div>
      </div>

      {/* 主要內容區（桌面向右偏移以容納側邊欄） */}
      <div className="lg:pl-64">
        <div className="mx-auto min-h-screen w-full max-w-[1000px] px-3 py-3 sm:px-4 sm:py-4 lg:px-5">
          <main className="min-h-0 min-w-0 flex-1 pt-14 lg:pt-0 touch-pan-y">
            {children ?? <Outlet />}
          </main>
        </div>
      </div>

      {/* 行動版導覽抽屜 */}
      <Drawer
        isOpen={mobileOpen}
        onClose={() => setMobileOpen(false)}
        title="導覽選單"
        width="max-w-xs"
        zIndex={90}
        side="left"
      >
        <SidebarNav layoutIdPrefix="mobile" onNavigate={() => setMobileOpen(false)} />
      </Drawer>
    </div>
  );
};
