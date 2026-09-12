/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { useVeterinary } from '../context/VeterinaryContext';
import {
  LayoutDashboard,
  Users,
  Calendar,
  FileText,
  ShieldAlert,
  FileSpreadsheet,
  Layers,
  Scissors,
  DollarSign,
  Package,
  Shield,
  History,
  Activity,
  HeartPulse,
  BarChart3,
  X
} from 'lucide-react';

interface SidebarProps {
  currentTab: string;
  onTabChange: (tab: string) => void;
  isSidebarHidden: boolean;
  onCloseMobile?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onTabChange,
  isSidebarHidden,
  onCloseMobile
}) => {
  const { currentUser } = useVeterinary();

  if (!currentUser) return null;

  // Determine navigation items by role
  const getNavItems = () => {
    const role = currentUser.role;

    if (role === 'Pet Owner') {
      return [
        { id: 'owner-dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { id: 'owner-pets', label: 'My Registered Pets', icon: Users },
        { id: 'owner-appointments', label: 'Book Appointments', icon: Calendar },
        { id: 'owner-history', label: 'Medical Timeline', icon: Activity },
        { id: 'owner-prescriptions', label: 'Prescriptions (RX)', icon: FileSpreadsheet },
        { id: 'owner-vaccinations', label: 'Booster Certs', icon: Shield },
        { id: 'owner-billing', label: 'Billing & Receipts', icon: DollarSign },
        { id: 'owner-advisor', label: 'AI Health Advisor', icon: HeartPulse }
      ];
    }

    // Clinic Staff (Admin, Veterinarian, Receptionist)
    const baseItems = [
      { id: 'clinic-dashboard', label: 'Clinic Dashboard', icon: LayoutDashboard },
      { id: 'clinic-clients', label: 'Clients & Pets Registry', icon: Users },
      { id: 'clinic-scheduler', label: 'Appointments Scheduler', icon: Calendar }
    ];

    const medicalItems = [
      { id: 'clinic-records', label: 'Medical Visits Hub', icon: FileText },
      { id: 'clinic-vaccinations', label: 'Vaccination Boosters', icon: ShieldAlert },
      { id: 'clinic-prescriptions', label: 'Prescriptions Tracker', icon: FileSpreadsheet },
      { id: 'clinic-labs', label: 'Laboratory Orders', icon: Layers },
      { id: 'clinic-surgeries', label: 'Surgeries Database', icon: Scissors }
    ];

    const operationsItems = [
      { id: 'clinic-billing', label: 'Invoicing & Payments', icon: DollarSign },
      { id: 'clinic-inventory', label: 'Inventory & Supplies', icon: Package },
      { id: 'clinic-reports', label: 'Intelligence Reports', icon: BarChart3 }
    ];

    const adminItems = [
      { id: 'clinic-staff', label: 'Staff Roster Settings', icon: HeartPulse },
      { id: 'clinic-audit', label: 'Global Audit Logs', icon: History }
    ];

    if (role === 'Admin') {
      return [...baseItems, ...medicalItems, ...operationsItems, ...adminItems];
    } else if (role === 'Veterinarian' || role === 'Veterinary Assistant') {
      return [...baseItems, ...medicalItems, ...operationsItems];
    } else if (role === 'Receptionist') {
      return [...baseItems, ...operationsItems];
    }

    return baseItems;
  };

  const navItems = getNavItems();

  return (
    <>
      {/* Mobile Backdrop Overlay - closes mobile sidebar when tapping outside */}
      {!isSidebarHidden && (
        <div
          className="fixed inset-0 z-40 bg-slate-950/60 backdrop-blur-xs transition-opacity duration-300 lg:hidden"
          onClick={onCloseMobile}
          aria-hidden="true"
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex flex-col justify-between bg-slate-900 border-slate-800 shadow-2xl transition-all duration-300 ease-in-out lg:static lg:z-auto lg:h-[calc(100vh-4rem)] lg:shadow-none ${
          isSidebarHidden
            ? '-translate-x-full opacity-0 pointer-events-none lg:w-0 lg:translate-x-0 lg:border-r-0 lg:px-0 lg:py-0 lg:overflow-hidden'
            : 'translate-x-0 opacity-100 pointer-events-auto w-72 max-w-[85vw] border-r py-5 lg:w-64'
        }`}
        id="app-sidebar"
        aria-label="Navigation Sidebar"
      >
        <div className="w-full flex flex-col justify-between h-full select-none overflow-y-auto">
          <div className="flex flex-col gap-4">
            {/* Mobile Drawer Header with Close Button */}
            <div className="flex items-center justify-between px-5 pb-1 lg:hidden">
              <div className="flex items-center gap-2 text-white font-bold text-xs">
                <Activity className="h-4 w-4 text-emerald-400" />
                <span>Navigation Menu</span>
              </div>
              <button
                type="button"
                onClick={onCloseMobile}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white transition-colors cursor-pointer"
                title="Close Navigation"
                aria-label="Close navigation"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Workspace banner details */}
            <div className="px-5">
              <div className="rounded-xl bg-slate-800/60 p-3.5 border border-slate-800 flex flex-col gap-1 text-left">
                <span className="text-[9px] font-bold uppercase tracking-widest text-slate-500">Workspace Context</span>
                <span className="text-xs font-semibold text-white">{currentUser.role} Control</span>
                <span className="text-[10px] font-mono text-slate-400 truncate">{currentUser.email}</span>
              </div>
            </div>

            {/* Dynamic Navigation Group */}
            <nav className="flex-1 px-3 space-y-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = currentTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      onTabChange(item.id);
                      onCloseMobile?.();
                    }}
                    className={`flex w-full items-center gap-3 rounded-lg px-4 py-2.5 text-xs font-medium transition-all duration-150 cursor-pointer ${
                      isActive
                        ? 'bg-slate-800 text-white font-semibold border-l-2 border-emerald-500'
                        : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200'
                    }`}
                    id={`sidebar-tab-${item.id}`}
                  >
                    <Icon className={`h-4.5 w-4.5 transition-colors ${isActive ? 'text-emerald-400' : 'text-slate-500'}`} />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>

          <div className="px-5 border-t border-slate-800 pt-4 mt-4">
            <p className="text-[10px] font-mono text-slate-500 text-left leading-relaxed">
              System Online: <span className="text-emerald-500 inline-flex items-center gap-1 font-bold">● Active</span> <br />
              Version: 4.2 Stable
            </p>
          </div>
        </div>
      </aside>
    </>
  );
};
