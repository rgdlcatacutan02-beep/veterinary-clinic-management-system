/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useVeterinary } from '../../context/VeterinaryContext';
import { ShieldAlert, Search, Terminal, Download, Sparkles, Filter } from 'lucide-react';

export const AuditLogsView: React.FC = () => {
  const { auditLogs, users } = useVeterinary();
  const [searchTerm, setSearchTerm] = useState('');

  const filteredLogs = auditLogs.filter(log => {
    const fullStr = `${log.action} ${log.entityType || ''} ${log.entityId || ''} ${log.details || ''} ${log.userName}`.toLowerCase();
    return fullStr.includes(searchTerm.toLowerCase());
  });

  const handleExportAuditLogs = () => {
    const headers = ['Log ID', 'Timestamp', 'User Name', 'User Role', 'Action', 'Entity Type', 'Details'];
    const rows = auditLogs.map(log => [
      `"${log.id}"`,
      `"${log.timestamp}"`,
      `"${log.userName}"`,
      `"${log.userRole}"`,
      `"${(log.action || '').replace(/"/g, '""')}"`,
      `"${(log.entityType || '').replace(/"/g, '""')}"`,
      `"${(log.details || '').replace(/"/g, '""')}"`
    ]);
    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `WellPet_Audit_Logs_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6 text-left animate-in fade-in duration-200" id="audit-logs-view-container">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-slate-800">Security Audit Logs & Trace</h2>
          <p className="text-xs text-slate-500">Review strict historic changes, record adjustments, drug dispensing logs and authorization actions.</p>
        </div>
        <button
          onClick={handleExportAuditLogs}
          className="flex items-center gap-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl px-4 py-2 text-xs font-semibold shadow-md shadow-slate-900/10 cursor-pointer self-start transition-colors"
        >
          <Download className="h-4 w-4" />
          <span>Export Audit Log (CSV)</span>
        </button>
      </div>

      <div className="relative">
        <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
        <input
          type="text"
          placeholder="Filter security events by entity, action, context details..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full rounded-xl border border-slate-200 py-2.5 pl-10 pr-4 text-xs font-medium focus:border-emerald-500 focus:outline-none"
        />
      </div>

      <div className="rounded-2xl border border-slate-100 bg-white shadow-sm overflow-hidden text-left font-mono text-[11px]">
        <div className="bg-slate-900 px-5 py-3 text-slate-400 flex items-center justify-between border-b border-slate-800">
          <span className="flex items-center gap-1.5 text-xs text-emerald-400 font-bold">
            <Terminal className="h-4 w-4" /> SECURE CONSOLE LOGS TRACE
          </span>
          <span className="text-[10px] text-slate-500">Live Socket Active</span>
        </div>

        <div className="divide-y divide-slate-100 max-h-[60vh] overflow-y-auto">
          {filteredLogs.length === 0 ? (
            <div className="p-8 text-center text-slate-400">No matching security events.</div>
          ) : (
            filteredLogs
              .sort((a,b) => b.timestamp.localeCompare(a.timestamp))
              .map((log) => {
                const userObj = users.find(u => u.id === log.userId);
                return (
                  <div key={log.id} className="p-4 bg-slate-50/20 hover:bg-slate-50/50 transition-colors flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-slate-700">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] text-slate-400 font-mono font-normal">[{log.timestamp}]</span>
                        <span className="bg-emerald-50 text-emerald-800 font-bold px-1.5 rounded">{log.entityType}</span>
                        <span className="font-extrabold text-slate-900">{log.action}</span>
                      </div>
                      <p className="text-slate-500 italic">Details: "{log.details}"</p>
                    </div>

                    <div className="flex items-center gap-1.5 self-end sm:self-center font-bold">
                      <span className="text-[10px] text-emerald-800 uppercase bg-emerald-50/40 rounded px-1.5">
                        By: {userObj?.name || 'Administrator System'}
                      </span>
                    </div>
                  </div>
                );
              })
          )}
        </div>
      </div>
    </div>
  );
};
