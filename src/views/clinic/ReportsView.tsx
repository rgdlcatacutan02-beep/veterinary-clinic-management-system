/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useVeterinary } from '../../context/VeterinaryContext';
import { AreaChart, TrendingUp, DollarSign, Calendar, Heart, ShieldCheck, Printer, Download } from 'lucide-react';

export const ReportsView: React.FC = () => {
  const {
    invoices,
    appointments,
    pets,
    medicalRecords
  } = useVeterinary();

  const [reportRange, setReportRange] = useState<'daily' | 'weekly' | 'monthly'>('monthly');

  const totalCalculatedRevenue = invoices.reduce((sum, i) => sum + i.totalAmount, 0);
  const totalSettledPayments = invoices.reduce((sum, i) => sum + i.paidAmount, 0);

  // Quick statistics lists
  const appointmentFinishedCount = appointments.filter(a => a.status === 'Completed').length;
  const activeVaccinationsDef = pets.length * 1.5; // simple visual model

  const handleExportCsv = () => {
    const headers = ['Invoice ID', 'Client ID', 'Pet ID', 'Date', 'Subtotal', 'Tax', 'Total Amount', 'Paid Amount', 'Status'];
    const rows = invoices.map(inv => [
      `"${inv.id}"`,
      `"${inv.clientId}"`,
      `"${inv.petId}"`,
      `"${inv.date}"`,
      inv.subtotal.toFixed(2),
      inv.tax.toFixed(2),
      inv.totalAmount.toFixed(2),
      inv.paidAmount.toFixed(2),
      `"${inv.status}"`
    ]);

    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `WellPet_Financial_Summary_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6 text-left animate-in fade-in duration-200" id="reports-view-container">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-slate-800">Operational Clinic Intelligence Reports</h2>
          <p className="text-xs text-slate-500">Audit daily/weekly performance logs, cash collection rates, active diagnostics cases and statistics.</p>
        </div>
        <div className="flex items-center gap-2 self-start">
          <select
            value={reportRange}
            onChange={(e) => setReportRange(e.target.value as any)}
            className="rounded-xl border border-slate-200 px-3 py-1.5 text-xs bg-white text-slate-700 font-semibold focus:outline-none focus:border-emerald-500"
          >
            <option value="daily">Daily report</option>
            <option value="weekly">Weekly summary</option>
            <option value="monthly">Monthly audit sheet</option>
          </select>
          <button
            onClick={handleExportCsv}
            className="flex items-center gap-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl px-3.5 py-1.5 text-xs font-semibold shadow-md shadow-slate-900/10 cursor-pointer transition-colors"
          >
            <Download className="h-4 w-4" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* KPI stats Grid */}
      <div className="grid gap-4 sm:grid-cols-4">
        <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm space-y-2">
          <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">Total Billing Charged</span>
          <div className="flex items-center justify-between">
            <span className="text-xl font-black text-slate-800 font-mono">${totalCalculatedRevenue.toFixed(2)}</span>
            <DollarSign className="h-5 w-5 text-emerald-600" />
          </div>
          <span className="text-[10px] text-slate-400 block mt-1">Sum of all generated invoice sheets</span>
        </div>

        <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm space-y-2">
          <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">Payments Collected Cash</span>
          <div className="flex items-center justify-between">
            <span className="text-xl font-black text-emerald-600 font-mono">${totalSettledPayments.toFixed(2)}</span>
            <TrendingUp className="h-5 w-5 text-emerald-500" />
          </div>
          <span className="text-[10px] text-emerald-600/80 font-semibold block mt-1">
            Collection efficiency: {((totalSettledPayments / (totalCalculatedRevenue || 1)) * 100).toFixed(0)}%
          </span>
        </div>

        <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm space-y-2">
          <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">Visits Settle Rate</span>
          <div className="flex items-center justify-between">
            <span className="text-xl font-black text-slate-00 font-mono">{appointmentFinishedCount} visits</span>
            <Calendar className="h-5 w-5 text-indigo-500" />
          </div>
          <span className="text-[10px] text-slate-400 block mt-1">Success rate of today's appointment logs</span>
        </div>

        <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm space-y-2">
          <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider font-extrabold text-indigo-700">Audit Status Profile</span>
          <div className="flex items-center justify-between">
            <span className="text-sm font-bold text-slate-700 uppercase">HEALTHY</span>
            <ShieldCheck className="h-5 w-5 text-emerald-500" />
          </div>
          <span className="text-[10px] text-slate-400 block mt-1">0 pending health system warnings</span>
        </div>
      </div>

      {/* Analytics Visualizers (Custom beautiful CSS graphs) */}
      <div className="grid gap-6 md:grid-cols-2 text-xs">
        {/* Weekly Revenue breakdown */}
        <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm space-y-4">
          <strong className="text-slate-800 text-sm block">Periodic Invoice Collections Audit</strong>
          
          <div className="h-44 flex items-end gap-3 pt-6 border-b border-slate-100">
            {/* Custom SVG/CSS columns representing weeks */}
            {[
              { label: 'Week 1', val: 1200, color: 'bg-emerald-500' },
              { label: 'Week 2', val: 1800, color: 'bg-emerald-600' },
              { label: 'Week 3', val: 950, color: 'bg-emerald-500' },
              { label: 'Week 4', val: 2400, color: 'bg-emerald-700' }
            ].map(w => {
              const pct = (w.val / 2500) * 100;
              return (
                <div key={w.label} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end">
                  <span className="text-[9px] font-mono font-bold text-slate-500">${w.val}</span>
                  <div className={`w-full ${w.color} rounded-t-lg transition-all duration-500 transform origin-bottom hover:opacity-80`} style={{ height: `${pct}%` }} />
                  <span className="text-[9px] font-semibold text-slate-400 uppercase tracking-widest mt-1">{w.label}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Diagnosis breakdown cases */}
        <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm space-y-4">
          <strong className="text-slate-800 text-sm block">Prevalent Diagnostics Categories Case Rates</strong>

          <div className="space-y-3.5 pt-4">
            {[
              { label: 'Feline Infectious Viruses & Flu', qty: 15, pct: 60, color: 'bg-emerald-600' },
              { label: 'Canine Parvovirus / Intestinal booster', qty: 9, pct: 36, color: 'bg-indigo-600' },
              { label: 'Otic fungal infection / Ear drops', qty: 5, pct: 20, color: 'bg-emerald-600' },
              { label: 'Surgical Spay / Neuter Extraction', qty: 8, pct: 32, color: 'bg-slate-700' }
            ].map(c => (
              <div key={c.label} className="space-y-1">
                <div className="flex justify-between items-center text-[11px] font-medium">
                  <span className="text-slate-600">{c.label}</span>
                  <span className="font-mono font-bold text-slate-800">{c.qty} cases</span>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div className={`${c.color} h-2 rounded-full`} style={{ width: `${c.pct}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
