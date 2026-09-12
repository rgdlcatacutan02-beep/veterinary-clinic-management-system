/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { VeterinaryProvider, useVeterinary } from './context/VeterinaryContext';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';

// Import Clinic Views
import { ClinicDashboard } from './views/clinic/ClinicDashboard';
import { ClientsPetsView } from './views/clinic/ClientsPetsView';
import { SchedulerView } from './views/clinic/SchedulerView';
import { MedicalRecordsView } from './views/clinic/MedicalRecordsView';
import { VaccinationsView } from './views/clinic/VaccinationsView';
import { PrescriptionsView } from './views/clinic/PrescriptionsView';
import { LabsView } from './views/clinic/LabsView';
import { SurgeriesView } from './views/clinic/SurgeriesView';
import { BillingView } from './views/clinic/BillingView';
import { InventoryView } from './views/clinic/InventoryView';
import { StaffView } from './views/clinic/StaffView';
import { AuditLogsView } from './views/clinic/AuditLogsView';
import { ReportsView } from './views/clinic/ReportsView';

// Import Pet Owner views
import { PetOwnerPortal } from './views/portal/PetOwnerPortal';
import { LoginView } from './components/LoginView';

function AppContent() {
  const { currentUser } = useVeterinary();
  const [currentTab, setCurrentTab] = useState('clinic-dashboard');

  // Detect desktop (>= 1024px) vs mobile/tablet screens
  const [isDesktop, setIsDesktop] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.innerWidth >= 1024;
    }
    return true;
  });

  // On PC: sidebar stays visible by default (desktopSidebarHidden = false), but can be hidden when desired
  const [desktopSidebarHidden, setDesktopSidebarHidden] = useState(false);

  // On mobile/small screens: sidebar is hidden when opening the system and when not in use (mobileSidebarOpen = false)
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  // Track responsive screen resize
  useEffect(() => {
    const handleResize = () => {
      const desktop = window.innerWidth >= 1024;
      setIsDesktop(desktop);
      if (desktop) {
        setMobileSidebarOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Close mobile sidebar on Escape key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !isDesktop && mobileSidebarOpen) {
        setMobileSidebarOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isDesktop, mobileSidebarOpen]);

  // Prevent background scroll when mobile sidebar drawer is active
  useEffect(() => {
    if (!isDesktop && mobileSidebarOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isDesktop, mobileSidebarOpen]);

  // Derived state: whether sidebar is currently collapsed/hidden
  const isSidebarHidden = isDesktop ? desktopSidebarHidden : !mobileSidebarOpen;

  const handleToggleSidebar = () => {
    if (isDesktop) {
      setDesktopSidebarHidden(prev => !prev);
    } else {
      setMobileSidebarOpen(prev => !prev);
    }
  };

  const handleCloseMobile = () => {
    setMobileSidebarOpen(false);
  };

  const handleTabChange = (tab: string) => {
    setCurrentTab(tab);
    // On mobile/small screen, automatically hide sidebar after selecting a tab so it's not staying in the way
    if (!isDesktop) {
      setMobileSidebarOpen(false);
    }
  };

  // Automatically update tab context when client logs in or changes roles
  useEffect(() => {
    if (currentUser) {
      if (currentUser.role === 'Pet Owner') {
        setCurrentTab('owner-dashboard');
      } else {
        setCurrentTab('clinic-dashboard');
      }
    }
  }, [currentUser?.role, currentUser?.id]);

  if (!currentUser) {
    return <LoginView />;
  }

  // Active Workspace layout with double splits
  const renderTabContent = () => {
    switch (currentTab) {
      case 'clinic-dashboard':
        return <ClinicDashboard />;
      case 'clinic-clients':
        return <ClientsPetsView />;
      case 'clinic-scheduler':
        return <SchedulerView />;
      case 'clinic-records':
        return <MedicalRecordsView />;
      case 'clinic-vaccinations':
        return <VaccinationsView />;
      case 'clinic-prescriptions':
        return <PrescriptionsView />;
      case 'clinic-labs':
        return <LabsView />;
      case 'clinic-surgeries':
        return <SurgeriesView />;
      case 'clinic-billing':
        return <BillingView />;
      case 'clinic-inventory':
        return <InventoryView />;
      case 'clinic-staff':
        return <StaffView />;
      case 'clinic-reports':
        return <ReportsView />;
      case 'clinic-audit':
        return <AuditLogsView />;

      // Owner Portals
      case 'owner-dashboard':
      case 'owner-pets':
      case 'owner-history':
      case 'owner-prescriptions':
      case 'owner-vaccinations':
      case 'owner-appointments':
      case 'owner-billing':
        return <PetOwnerPortal currentTab={currentTab} onTabChange={handleTabChange} />;

      default:
        return <ClinicDashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col" id="app-workspace-root">
      <Header onToggleSidebar={handleToggleSidebar} isSidebarHidden={isSidebarHidden} />
      <div className="flex flex-1 relative overflow-hidden">
        <Sidebar
          currentTab={currentTab}
          onTabChange={handleTabChange}
          isSidebarHidden={isSidebarHidden}
          onCloseMobile={handleCloseMobile}
        />
        <main className="flex-1 p-4 sm:p-6 md:p-8 bg-slate-50/50 h-[calc(100vh-4rem)] overflow-y-auto w-full">
          <div className="max-w-7xl mx-auto">
            {renderTabContent()}
          </div>
        </main>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <VeterinaryProvider>
      <AppContent />
    </VeterinaryProvider>
  );
}
