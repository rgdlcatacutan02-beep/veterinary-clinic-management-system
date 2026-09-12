/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { useVeterinary } from '../../context/VeterinaryContext';
import {
  Users,
  Activity,
  DollarSign,
  AlertTriangle,
  FolderDot,
  CalendarCheck2,
  Clock,
  Printer,
  ChevronRight,
  TrendingUp,
  PackageX
} from 'lucide-react';

export const ClinicDashboard: React.FC = () => {
  const {
    clients,
    pets,
    appointments,
    inventoryItems,
    invoices,
    vaccinations,
    currentUser,
    updateAppointment
  } = useVeterinary();

  const totalClients = clients.length;
  const totalPets = pets.length;

  // Revenue computations
  const todayStr = new Date().toISOString().split('T')[0];
  const invoicesReceivedToday = invoices.filter(inv => inv.date === todayStr);
  const revenueToday = invoicesReceivedToday.reduce((sum, inv) => sum + inv.paidAmount, 0);

  const totalRevenueThisMonth = invoices.reduce((sum, inv) => sum + inv.paidAmount, 0);

  // Inventory & Vaccines limits
  const lowStockItems = inventoryItems.filter(item => item.quantity <= item.minStockLevel);

  // Today's scheduled/checked in visits
  const todaysAppointments = appointments.filter(app => app.date === todayStr);

  // Upcoming vaccinations due soon
  const overdueVaccinations = vaccinations.filter(vac => {
    return new Date(vac.nextDueDate) < new Date();
  });

  const checkIn = (id: string) => {
    const app = appointments.find(a => a.id === id);
    if (app) {
      updateAppointment({ ...app, status: 'Checked In' });
    }
  };

  const completeVisit = (id: string) => {
    const app = appointments.find(a => a.id === id);
    if (app) {
      updateAppointment({ ...app, status: 'Completed' });
    }
  };

  return (
    <div className="space-y-6 text-left animate-in fade-in duration-200 font-sans" id="clinic-dashboard-container">
      {/* Greetings Block */}
      <div className="flex flex-col gap-1 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-xl sm:text-2xl font-display font-bold tracking-tight text-slate-900">
            Welcome back, {currentUser?.name || 'Doctor'}
          </h2>
          <p className="text-xs text-slate-500">
            Here is your clinic's operative overview for today, <strong className="font-mono">{todayStr}</strong>.
          </p>
        </div>
        <div className="flex items-center gap-2 rounded-xl bg-slate-105/40 p-2 text-xs font-semibold text-slate-700 border border-slate-200">
          <Clock className="h-4 w-4 text-emerald-600" />
          <span>System Status: <strong className="text-emerald-600 font-bold">ALL SERVICES LOGGED</strong></span>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Metric 1 */}
        <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm transition-all hover:shadow-md flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Clients</p>
            <h3 className="text-2xl font-bold text-slate-800">{totalClients}</h3>
            <p className="text-[10px] text-emerald-600 font-medium">Registered Owners</p>
          </div>
          <div className="rounded-xl bg-emerald-50 p-3 text-emerald-600">
            <Users className="h-6 w-6" />
          </div>
        </div>

        {/* Metric 2 */}
        <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm transition-all hover:shadow-md flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Active Patients</p>
            <h3 className="text-2xl font-bold text-slate-800">{totalPets}</h3>
            <p className="text-[10px] text-emerald-600 font-medium">Small & Medium Pets</p>
          </div>
          <div className="rounded-xl bg-emerald-50 p-3 text-emerald-600">
            <Activity className="h-6 w-6" />
          </div>
        </div>

        {/* Metric 3 */}
        <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm transition-all hover:shadow-md flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Revenue Today</p>
            <h3 className="text-2xl font-bold text-slate-800">${revenueToday.toFixed(2)}</h3>
            <p className="text-[10px] text-emerald-600 font-medium">+8% vs Yesterday</p>
          </div>
          <div className="rounded-xl bg-emerald-50 p-3 text-emerald-600">
            <DollarSign className="h-6 w-6" />
          </div>
        </div>

        {/* Metric 4 */}
        <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm transition-all hover:shadow-md flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Low Stock Items</p>
            <h3 className="text-2xl font-bold text-slate-800">{lowStockItems.length}</h3>
            <p className="text-[10px] text-amber-600 font-medium">Requires Restock</p>
          </div>
          <div className="rounded-xl bg-amber-50 p-3 text-amber-600">
            <AlertTriangle className="h-6 w-6" />
          </div>
        </div>
      </div>

      {/* Main Body Grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left column: Scheduled appointments */}
        <div className="lg:col-span-2 space-y-4">
          <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
            <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4 bg-slate-50/50">
              <div className="flex items-center gap-2">
                <CalendarCheck2 className="h-4.5 w-4.5 text-emerald-600" />
                <h4 className="font-display font-bold text-slate-900 text-sm">Today's Operating Schedule ({todaysAppointments.length})</h4>
              </div>
              <span className="text-[10px] font-mono text-slate-400 uppercase font-bold tracking-wider">Live Queue</span>
            </div>

            <div className="divide-y divide-slate-100">
              {todaysAppointments.length === 0 ? (
                <div className="p-8 text-center text-slate-400 text-xs">
                  No appointments scheduled for today. Have a beautiful paperwork-free day!
                </div>
              ) : (
                todaysAppointments.map((app) => {
                  const petDetails = pets.find(p => p.id === app.petId);
                  const clientDetails = clients.find(c => c.id === app.clientId);
                  return (
                    <div key={app.id} className="flex flex-col gap-3 p-5 md:flex-row md:items-center md:justify-between hover:bg-slate-55/30 transition-colors">
                      <div className="flex items-center gap-4">
                        <img
                          src={petDetails?.photoUrl}
                          alt={petDetails?.name}
                          referrerPolicy="no-referrer"
                          className="h-11 w-11 rounded-xl object-cover ring-2 ring-slate-100"
                        />
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-slate-850">{petDetails?.name}</span>
                            <span className="rounded bg-emerald-50 px-1.5 py-0.5 text-[9px] font-bold text-emerald-700 uppercase">
                              {petDetails?.species}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-500 mt-0.5">
                            Owner: {clientDetails?.firstName} {clientDetails?.lastName} | Phone: {clientDetails?.phone}
                          </p>
                          <div className="flex items-center gap-2 mt-1.5">
                            <span className="text-[10px] font-mono text-slate-400 bg-slate-50 px-1.5 py-0.5 rounded border border-slate-150">
                              {app.time}
                            </span>
                            <span className="text-[11px] text-slate-600 italic">
                              "{app.notes || 'Routine consult'}"
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 self-end md:self-center">
                        {/* Interactive Queue Controls */}
                        {app.status === 'Scheduled' && (
                          <button
                            onClick={() => checkIn(app.id)}
                            className="rounded-lg bg-emerald-50 px-2.5 py-1 text-[11px] font-bold text-emerald-800 hover:bg-emerald-100 transition-colors cursor-pointer"
                          >
                            Check In
                          </button>
                        )}
                        {app.status === 'Checked In' && (
                          <button
                            onClick={() => completeVisit(app.id)}
                            className="rounded-lg bg-indigo-50 px-2.5 py-1 text-[11px] font-semibold text-indigo-700 hover:bg-indigo-100 transition-colors cursor-pointer"
                          >
                            Mark Completed
                          </button>
                        )}

                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium ${
                          app.status === 'Checked In' ? 'bg-amber-100 text-amber-800' :
                          app.status === 'Completed' ? 'bg-emerald-100 text-emerald-800' :
                          app.status === 'Cancelled' ? 'bg-rose-100 text-rose-800' :
                          'bg-sky-100 text-sky-800'
                        }`}>
                          {app.status}
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Quick Stats Grid */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm text-left">
              <div className="flex items-center gap-2 text-slate-600 mb-3 font-semibold text-xs text-slate-805">
                <TrendingUp className="h-4.5 w-4.5 text-emerald-600" />
                <span>Operational Breakdown</span>
              </div>
              <div className="space-y-2.5 mt-1">
                <div>
                  <div className="flex justify-between text-[11px] text-slate-500 mb-1">
                    <span>Consultations & Checkups</span>
                    <span className="font-semibold">{appointments.filter(a => a.type === 'Consultation').length} visits</span>
                  </div>
                  <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-500 rounded-full" style={{ width: '60%' }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-[11px] text-slate-500 mb-1">
                    <span>Surgical Operations</span>
                    <span className="font-semibold">{appointments.filter(a => a.type === 'Surgery').length} sessions</span>
                  </div>
                  <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-indigo-500 rounded-full" style={{ width: '15%' }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-[11px] text-slate-500 mb-1">
                    <span>Immunizations / Bio</span>
                    <span className="font-semibold">{appointments.filter(a => a.type === 'Vaccination').length} cases</span>
                  </div>
                  <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-amber-500 rounded-full" style={{ width: '25%' }}></div>
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm flex flex-col justify-between">
              <div>
                <span className="text-xs font-semibold text-slate-800 flex items-center gap-2">
                  <FolderDot className="h-4.5 w-4.5 text-indigo-600" /> Clinic Billing Summary
                </span>
                <p className="text-[11px] text-slate-500 mt-1">
                  Billing cycle performance based on invoices stored of current year:
                </p>
              </div>

              <div className="grid grid-cols-2 gap-2 mt-4">
                <div className="bg-slate-50 rounded-xl p-2.5 text-left border border-slate-200">
                  <span className="text-[10px] font-medium text-slate-400 uppercase">Paid Settled</span>
                  <p className="text-sm font-bold text-slate-850 font-display">${totalRevenueThisMonth.toFixed(2)}</p>
                </div>
                <div className="bg-slate-50 rounded-xl p-2.5 text-left border border-slate-200">
                  <span className="text-[10px] font-medium text-slate-400 uppercase">Outstanding</span>
                  <p className="text-sm font-bold text-amber-700 font-display">
                    ${invoices.filter(i => i.status !== 'Paid').reduce((sum, i) => sum + (i.totalAmount - i.paidAmount), 0).toFixed(2)}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right column: Inventory warnings, Expired/Overdue booster alarms */}
        <div className="space-y-6">
          {/* Inventory warnings card */}
          <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden text-left">
            <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3.5 bg-slate-50/50">
              <span className="text-xs font-semibold text-slate-800 flex items-center gap-1.5">
                <PackageX className="h-4 w-4 text-amber-600" />
                Critical Inventory Limits
              </span>
              <span className="rounded-full bg-amber-50 px-2 py-0.5 text-[9px] font-bold text-amber-850 uppercase">
                {lowStockItems.length} Warnings
              </span>
            </div>

            <div className="p-4 space-y-3">
              {lowStockItems.length === 0 ? (
                <p className="text-xs text-slate-400 text-center py-4">All core pharmaceutical stock levels exceed parameters.</p>
              ) : (
                lowStockItems.map((item) => (
                  <div key={item.id} className="rounded-xl border border-slate-250 p-3 h-full flex flex-col justify-between bg-slate-50/20">
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-850 truncate max-w-[150px]">{item.name}</span>
                        <span className="text-[9px] font-mono text-slate-400 uppercase bg-slate-100 px-1 py-0.5 rounded font-bold">
                          {item.id}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-550 mt-1 font-semibold">Category: {item.category}</p>
                    </div>

                    <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-2 text-[11px]">
                      <div>
                        <span className="text-slate-450 font-medium">Remaining: </span>
                        <strong className="text-amber-700 font-bold">{item.quantity} {item.unit}</strong>
                      </div>
                      <div className="text-[10px] bg-rose-50 text-rose-700 font-bold px-1.5 py-0.5 rounded">
                        Min: {item.minStockLevel}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Overdue immunizations warning logs */}
          <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden text-left">
            <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3.5 bg-slate-50/50">
              <span className="text-xs font-semibold text-slate-800 flex items-center gap-1.5">
                <AlertTriangle className="h-4 w-4 text-indigo-650" />
                Overdue Booster Warnings
              </span>
            </div>

            <div className="p-4 divide-y divide-slate-50 max-h-56 overflow-y-auto">
              {overdueVaccinations.length === 0 ? (
                <p className="text-xs text-slate-400 text-center py-4">All registered immunizations are up to date.</p>
              ) : (
                overdueVaccinations.map((vac) => {
                  const pet = pets.find(p => p.id === vac.petId);
                  return (
                    <div key={vac.id} className="py-2.5 flex items-center justify-between">
                      <div>
                        <span className="text-xs font-semibold text-slate-700">{pet?.name}</span>
                        <p className="text-[11px] text-slate-500 truncate max-w-[170px]">{vac.vaccineName}</p>
                      </div>
                      <span className="text-[10px] font-mono font-semibold text-rose-500 bg-rose-50 px-1.5 rounded">
                        Due {vac.nextDueDate}
                      </span>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
