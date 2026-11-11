import React, { useState } from 'react';
import {
  LayoutGrid,
  PlusCircle,
  FolderKanban,
  Layers,
  Settings,
  Lightbulb,
  Quote,
  LogOut,
  Phone,
  Menu,
  X,
} from 'lucide-react';
import { useStudioStore } from '../../store/useStudioStore';
import { ViewMode } from '../../types/studio';

function useNavConfig() {
  const { currentView, setCurrentView, createNewDesign } = useStudioStore();

  const navItems = [
    {
      id: 'dashboard' as ViewMode,
      label: 'Dashboard',
      shortLabel: 'Home',
      url: '/dashboard',
      icon: LayoutGrid,
      action: () => setCurrentView('dashboard'),
    },
    {
      id: 'create' as const,
      label: 'Create design',
      shortLabel: 'Create',
      url: '/editor/template-1',
      icon: PlusCircle,
      action: () => createNewDesign('template-1'),
    },
    {
      id: 'designs' as ViewMode,
      label: 'My projects',
      shortLabel: 'Projects',
      url: '/designs',
      icon: FolderKanban,
      action: () => setCurrentView('designs'),
    },
    {
      id: 'templates' as ViewMode,
      label: 'Templates',
      shortLabel: 'Templates',
      url: '/templates',
      icon: Layers,
      action: () => setCurrentView('templates'),
    },
    {
      id: 'settings' as ViewMode,
      label: 'Settings',
      shortLabel: 'Settings',
      url: '/settings',
      icon: Settings,
      action: () => setCurrentView('settings'),
    },
  ];

  const isItemActive = (id: ViewMode | 'create') => id !== 'create' && currentView === id;

  return { navItems, isItemActive, setCurrentView };
}

export const Sidebar: React.FC = () => {
  const { user, signOut } = useStudioStore();
  const { navItems, isItemActive, setCurrentView } = useNavConfig();
  const [drawerOpen, setDrawerOpen] = useState(false);

  const renderSidebarContent = (onAfterNav?: () => void) => (
    <>
      <div className="space-y-6">
        {/* Brand Logo Header */}
        <div className="flex items-center justify-between px-2">
          <a
            href="/dashboard"
            onClick={(e) => {
              e.preventDefault();
              setCurrentView('dashboard');
              onAfterNav?.();
            }}
            className="flex items-center space-x-3 cursor-pointer group"
          >
            <div className="w-8 h-8 rounded-xl bg-[#E5B54F] flex items-center justify-center text-slate-950 shadow-md shadow-amber-500/20 group-hover:scale-105 transition-transform">
              <Quote className="w-4 h-4 fill-slate-950 text-slate-950 -scale-x-100" />
            </div>
            <div className="leading-none">
              <h1 className="font-bold text-[15px] text-white tracking-tight">Testimonial</h1>
              <p className="text-[10px] font-bold text-[#E5B54F] tracking-[0.22em] mt-0.5">STUDIO</p>
            </div>
          </a>

          {onAfterNav && (
            <button
              type="button"
              onClick={onAfterNav}
              className="md:hidden p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-[#192742]"
              aria-label="Close navigation menu"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Navigation List */}
        <nav className="space-y-1.5 pt-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = isItemActive(item.id);

            return (
              <a
                key={item.label}
                href={item.url}
                onClick={(e) => {
                  e.preventDefault();
                  item.action();
                  onAfterNav?.();
                }}
                className={`w-full flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-[13.5px] font-medium transition-all ${
                  isActive
                    ? 'bg-[#192742] text-white font-semibold shadow-sm'
                    : 'text-slate-300 hover:text-white hover:bg-[#132038]'
                }`}
              >
                <span className={isActive ? 'text-amber-400' : 'text-slate-400'}>
                  <Icon className="w-[18px] h-[18px]" />
                </span>
                <span>{item.label}</span>
              </a>
            );
          })}
        </nav>
      </div>

      <div className="space-y-3">
        {/* Design Tip Box */}
        <div className="rounded-xl border border-slate-800/80 bg-[#0E1A30]/80 p-3.5 space-y-1">
          <div className="flex items-center space-x-2 text-[#E5B54F]">
            <Lightbulb className="w-4 h-4" />
            <span className="text-xs font-bold text-white">Design tip</span>
          </div>
          <p className="text-[11px] text-slate-400 leading-snug">
            Choose a template that matches the tone of your customer's testimonial.
          </p>
        </div>

        {/* User Account & Sign Out */}
        {user && (
          <div className="rounded-xl border border-slate-800/80 bg-[#0E1A30] p-3 flex items-center justify-between gap-2">
            <div className="min-w-0">
              <p className="text-xs font-bold text-white truncate">{user.name}</p>
              <p className="text-[10px] text-slate-400 flex items-center space-x-1 truncate mt-0.5">
                <Phone className="w-2.5 h-2.5 shrink-0 text-[#E5B54F]" />
                <span>{user.mobileNumber}</span>
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                onAfterNav?.();
                signOut();
              }}
              title="Sign out"
              className="p-2 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors shrink-0"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </>
  );

  return (
    <>
      {/* Mobile Top App Bar (< md) */}
      <header className="md:hidden h-14 bg-[#0B1528] text-white px-4 flex items-center justify-between border-b border-[#15243E] shrink-0 z-30 select-none">
        <a
          href="/dashboard"
          onClick={(e) => {
            e.preventDefault();
            setCurrentView('dashboard');
          }}
          className="flex items-center space-x-2.5"
        >
          <div className="w-8 h-8 rounded-xl bg-[#E5B54F] flex items-center justify-center text-slate-950 shadow-sm">
            <Quote className="w-4 h-4 fill-slate-950 text-slate-950 -scale-x-100" />
          </div>
          <div className="leading-none">
            <span className="font-bold text-sm text-white tracking-tight block">Testimonial</span>
            <span className="text-[9px] font-bold text-[#E5B54F] tracking-[0.2em] block mt-0.5">STUDIO</span>
          </div>
        </a>

        <button
          type="button"
          onClick={() => setDrawerOpen(true)}
          className="p-2 rounded-xl bg-[#132038] text-slate-200 hover:text-white border border-slate-700/60"
          aria-label="Open navigation menu"
        >
          <Menu className="w-5 h-5" />
        </button>
      </header>

      {/* Mobile Slide-Over Navigation Drawer (< md) */}
      {drawerOpen && (
        <div
          className="md:hidden fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex"
          onClick={() => setDrawerOpen(false)}
        >
          <aside
            onClick={(e) => e.stopPropagation()}
            className="w-64 max-w-[82vw] bg-[#0B1528] text-white flex flex-col justify-between select-none h-full py-5 px-4 border-r border-[#15243E] shadow-2xl overflow-y-auto"
          >
            {renderSidebarContent(() => setDrawerOpen(false))}
          </aside>
        </div>
      )}

      {/* Tablet & Desktop Persistent Sidebar (>= md) */}
      <aside className="hidden md:flex md:w-52 lg:w-56 bg-[#0B1528] text-white flex-col justify-between select-none z-30 shrink-0 border-r border-[#15243E] h-full py-5 px-3.5 overflow-y-auto">
        {renderSidebarContent()}
      </aside>
    </>
  );
};

export const MobileBottomNav: React.FC = () => {
  const { navItems, isItemActive } = useNavConfig();

  return (
    <nav className="md:hidden bg-white border-t border-slate-200 px-1 py-1.5 flex items-center justify-around shrink-0 z-20 select-none">
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = isItemActive(item.id);
        return (
          <a
            key={item.id}
            href={item.url}
            onClick={(e) => {
              e.preventDefault();
              item.action();
            }}
            className={`flex flex-col items-center justify-center px-2 py-1 rounded-xl text-[10px] font-semibold transition-colors min-w-[54px] ${
              isActive
                ? 'text-[#0F2D6B] bg-blue-50/80 font-bold'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Icon className={`w-4 h-4 mb-0.5 ${isActive ? 'text-[#0F2D6B]' : 'text-slate-500'}`} />
            <span>{item.shortLabel}</span>
          </a>
        );
      })}
    </nav>
  );
};

export default Sidebar;
