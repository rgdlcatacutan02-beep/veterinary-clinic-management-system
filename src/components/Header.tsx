/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useVeterinary } from '../context/VeterinaryContext';
import { Bell, User, LogOut, ShieldAlert, HelpCircle, Activity, Menu, ShieldCheck, RotateCcw } from 'lucide-react';
import { UserRole } from '../types';

interface HeaderProps {
  onToggleSidebar: () => void;
  isSidebarHidden: boolean;
}

export const Header: React.FC<HeaderProps> = ({ onToggleSidebar, isSidebarHidden }) => {
  const { currentUser, logout, notifications, markNotificationRead, resetToDemoData } = useVeterinary();
  const [showNotifications, setShowNotifications] = useState(false);

  // Filter notifications based on role
  const roleNotifications = notifications.filter(n => {
    if (n.read) return false;
    if (!currentUser) return false;
    if (currentUser.role === 'Pet Owner') {
      return n.targetRole === 'Pet Owner' && n.targetClientId === currentUser.clientId;
    }
    // Clinic staff see relevant alerts
    if (n.targetRole) {
      return n.targetRole === currentUser.role;
    }
    return true; // General system notifications
  });

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-slate-200 bg-white/95 px-6 backdrop-blur-md" id="app-header">
      {/* Brand Launcher and Toggle */}
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleSidebar}
          className="flex h-9 w-9 items-center justify-center rounded-lg hover:bg-slate-100 text-slate-500 hover:text-slate-800 transition-colors cursor-pointer mr-1"
          title={isSidebarHidden ? "Show Navigation" : "Hide Navigation"}
          id="sidebar-toggle-btn"
          aria-label={isSidebarHidden ? "Show navigation sidebar" : "Hide navigation sidebar"}
        >
          <Menu className={`h-5 w-5 transition-transform duration-200 ${isSidebarHidden ? 'rotate-0 text-slate-500' : 'rotate-90 text-emerald-600'}`} />
        </button>

        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-600 text-white shadow-sm shadow-emerald-500/10">
            <Activity className="h-4.5 w-4.5 stroke-[2.5]" />
          </div>
          <div>
            <h1 className="font-display font-bold tracking-tight text-slate-900 text-sm md:text-base leading-none">WellPet VetCore Pro</h1>
            <p className="font-mono text-[9px] uppercase tracking-widest text-slate-400 font-semibold mt-1">Clinical CRM System</p>
          </div>
        </div>
      </div>

      {/* Global Controls */}
      <div className="flex items-center gap-4">
        {/* Authenticated Session Role Badge (Read-Only) */}
        <div
          className="flex items-center gap-2 rounded-lg bg-emerald-50/80 border border-emerald-200/70 px-3 py-1.5 text-xs text-emerald-900 select-none shadow-2xs"
          id="active-role-badge"
          title={`Active Session: ${currentUser?.name} (${currentUser?.role})`}
        >
          <ShieldCheck className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
          <span>Role: <strong className="font-bold">{currentUser?.role || 'Guest'}</strong></span>
        </div>

        {/* Reset Demo Data Button */}
        <button
          onClick={() => {
            if (window.confirm('Reset database to default complete sample records?')) {
              resetToDemoData();
            }
          }}
          className="hidden sm:flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 px-2.5 py-1.5 text-xs font-medium text-slate-600 hover:text-slate-900 transition-colors cursor-pointer"
          title="Reset database to initial demo state"
        >
          <RotateCcw className="h-3.5 w-3.5 text-slate-400" />
          <span className="text-[11px]">Reset Demo</span>
        </button>

        {/* Notifications Bell */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative rounded-lg p-2 text-slate-500 hover:bg-slate-50 transition-colors cursor-pointer"
            id="notification-bell-btn"
          >
            <Bell className="h-5 w-5" />
            {roleNotifications.length > 0 && (
              <span className="absolute top-1.5 right-1.5 flex h-2 w-2 rounded-full bg-red-500 ring-2 ring-white"></span>
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 rounded-xl border border-slate-200 bg-white shadow-xl ring-1 ring-black/5 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200 z-50">
              <div className="flex items-center justify-between bg-slate-50/50 px-4 py-3 border-b border-slate-100">
                <span className="text-xs font-semibold text-slate-700">Notifications ({roleNotifications.length})</span>
                {roleNotifications.length > 0 && <span className="text-[10px] font-medium text-amber-600">Pending Actions</span>}
              </div>
              <div className="max-h-72 overflow-y-auto divide-y divide-slate-50">
                {roleNotifications.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-8 px-4 text-center">
                    <HelpCircle className="h-8 w-8 text-slate-300 stroke-[1.5] mb-2" />
                    <p className="text-xs text-slate-500">All caught up! No active warnings.</p>
                  </div>
                ) : (
                  roleNotifications.map((n) => (
                    <div key={n.id} className="p-3 hover:bg-slate-50/80 transition-colors flex gap-2 w-full text-left">
                      <div className="mt-0.5">
                        <ShieldAlert className="h-3.5 w-3.5 text-amber-500" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-slate-700 truncate">{n.title}</p>
                        <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-2">{n.message}</p>
                        <div className="flex items-center justify-between mt-2">
                          <span className="text-[9px] font-mono text-slate-400">{n.date}</span>
                          <button
                            onClick={() => markNotificationRead(n.id)}
                            className="text-[10px] font-semibold text-emerald-600 hover:text-emerald-700 cursor-pointer"
                          >
                            Mark Read
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* User Card */}
        <div className="flex items-center gap-2 border-l border-slate-100 pl-4">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 text-slate-600">
            <User className="h-4.5 w-4.5" />
          </div>
          <div className="hidden flex-col text-left md:flex">
            <span className="text-xs font-semibold text-slate-700 leading-none">{currentUser?.name}</span>
            <span className="text-[10px] text-slate-400 mt-1">{currentUser?.role}</span>
          </div>
          <button
            onClick={logout}
            title="Sign Out"
            className="rounded-lg p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-500 transition-colors cursor-pointer"
          >
            <LogOut className="h-4.5 w-4.5" />
          </button>
        </div>
      </div>
    </header>
  );
};
