import React from 'react';
import { useAuth } from '../../context/AuthContext';

export default function Header({ onMenuClick }) {
  const { user, logout } = useAuth();

  return (
    <header className="sticky top-0 z-20 h-16 bg-white border-b border-surface-border px-6 flex items-center justify-between">
      <div className="flex items-center gap-4">
        <button onClick={onMenuClick} className="lg:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100">
          <i className="fa-solid fa-bars text-lg"></i>
        </button>
        <div>
          <h2 className="text-sm font-bold text-brand-900 tracking-tight">WeGrow Skill Campus & B-School</h2>
          <p className="text-[11px] text-slate-500">Unified Management Enterprise System</p>
        </div>
      </div>

      <div className="flex items-center gap-4">
        {/* User Badge */}
        <div className="flex items-center gap-3 px-3 py-1.5 rounded-lg bg-surface-ground border border-surface-border">
          <div className="w-8 h-8 rounded-full bg-accent-500 text-white flex items-center justify-center font-bold text-xs">
            {(user?.name || user?.username || 'A').charAt(0).toUpperCase()}
          </div>
          <div className="hidden sm:block text-left">
            <p className="text-xs font-bold text-brand-950 leading-tight">{user?.name || user?.username || 'Admin'}</p>
            <p className="text-[10px] text-accent-600 font-semibold uppercase">{user?.role || 'Administrator'}</p>
          </div>
        </div>

        {/* Logout */}
        <button
          onClick={logout}
          title="Sign Out"
          className="p-2 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
        >
          <i className="fa-solid fa-arrow-right-from-bracket text-base"></i>
        </button>
      </div>
    </header>
  );
}
