/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useVeterinary } from '../../context/VeterinaryContext';
import { Layers, PlusCircle, Search, HelpCircle, Eye, FileSpreadsheet, Download } from 'lucide-react';
import { LabRecord } from '../../types';

export const LabsView: React.FC = () => {
  const {
    labRecords,
    addLabRecord,
    updateLabRecord,
    pets,
    users,
    currentUser
  } = useVeterinary();

  const [searchTerm, setSearchTerm] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedLab, setSelectedLab] = useState<LabRecord | null>(null);

  // New Lab Fields
  const [newPetId, setNewPetId] = useState('');
  const [newTestName, setNewTestName] = useState('Senior Canine Comprehensive Chemistry & CBC');
  const [newResults, setNewResults] = useState('');

  const filteredLabs = labRecords.filter(lab => {
    const pet = pets.find(p => p.id === lab.petId);
    return pet?.name.toLowerCase().includes(searchTerm.toLowerCase()) || lab.testName.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const handleCreateLab = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPetId || !newTestName) return;

    addLabRecord({
      petId: newPetId,
      testName: newTestName,
      requestedBy: currentUser?.id || 'USR-ADMIN',
      dateRequested: new Date().toISOString().split('T')[0],
      dateCompleted: newResults ? new Date().toISOString().split('T')[0] : undefined,
      results: newResults || undefined,
      attachments: []
    });

    // Reset
    setNewPetId('');
    setNewResults('');
    setShowAddForm(false);
  };

  const handleUpdateResults = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLab || !newResults) return;

    updateLabRecord({
      ...selectedLab,
      dateCompleted: new Date().toISOString().split('T')[0],
      results: newResults
    });

    setSelectedLab(null);
    setNewResults('');
  };

  return (
    <div className="space-y-6 text-left animate-in fade-in duration-200" id="labs-view-container">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-slate-800">Laboratory & Diagnostic Audit Database</h2>
          <p className="text-xs text-slate-500">Order comprehensive biochemistry panels, trace pathology records, and file test findings.</p>
        </div>
        {currentUser?.role !== 'Receptionist' && (
          <button
            onClick={() => setShowAddForm(true)}
            className="flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-xs font-semibold text-white hover:bg-emerald-700 shadow-md shadow-emerald-500/15 cursor-pointer self-start"
            id="new-lab-request-btn"
          >
            <PlusCircle className="h-4 w-4" />
            <span>Order Lab Diagnostics</span>
          </button>
        )}
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Left Side List */}
        <div className="space-y-4 md:col-span-1">
          <div className="relative">
            <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search test panel index..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-xl border border-slate-200 py-2.5 pl-10 pr-4 text-xs font-medium focus:border-emerald-500 focus:outline-none"
            />
          </div>

          <div className="rounded-2xl border border-slate-100 bg-white p-2 shadow-sm max-h-[55vh] overflow-y-auto space-y-1">
            {filteredLabs.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-6">No diagnostic labs recorded.</p>
            ) : (
              filteredLabs.map((lab) => {
                const pet = pets.find(p => p.id === lab.petId);
                const isSelected = selectedLab?.id === lab.id;
                return (
                  <button
                    key={lab.id}
                    onClick={() => {
                      setSelectedLab(lab);
                      setNewResults(lab.results || '');
                    }}
                    className={`w-full text-left p-3.5 rounded-xl transition-all cursor-pointer flex justify-between items-center ${
                      isSelected ? 'bg-emerald-50 border border-emerald-100/30' : 'hover:bg-slate-50'
                    }`}
                  >
                    <div>
                      <span className="font-bold text-xs text-slate-800">{pet?.name}</span>
                      <p className="text-[11px] text-slate-500 mt-1 truncate max-w-[170px]">
                        Test: <strong className="font-semibold text-slate-700">{lab.testName}</strong>
                      </p>
                    </div>

                    <span className={`text-[9px] font-bold font-mono px-1.5 py-0.5 rounded ${
                      lab.results ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'
                    }`}>
                      {lab.results ? 'Filer Ready' : 'Pending Lab'}
                    </span>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Right Side Detail */}
        <div className="md:col-span-2">
          {selectedLab ? (
            <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm space-y-6">
              <div className="flex justify-between items-center border-b border-slate-50 pb-3">
                <div>
                  <h3 className="text-sm font-extrabold text-slate-800">Diagnostics Case #{selectedLab.id}</h3>
                  <span className="text-[10px] text-slate-400">Date Requested: {selectedLab.dateRequested}</span>
                </div>
                {selectedLab.dateCompleted && (
                  <span className="text-[10px] font-mono text-slate-500">Completed: {selectedLab.dateCompleted}</span>
                )}
              </div>

              <div className="grid gap-3 sm:grid-cols-2 text-xs">
                <div className="bg-slate-50 rounded-xl p-3 border border-slate-100">
                  <span className="text-slate-400">Patient / Recipient</span>
                  <p className="font-bold text-slate-700 mt-1">
                    {pets.find(p => p.id === selectedLab.petId)?.name}
                  </p>
                </div>
                <div className="bg-slate-50 rounded-xl p-3 border border-slate-100">
                  <span className="text-slate-400">Requested By</span>
                  <p className="font-bold text-slate-700 mt-1">
                    {users.find(u => u.id === selectedLab.requestedBy)?.name || 'Clinic Vet Nurse'}
                  </p>
                </div>
              </div>

              <div className="text-xs space-y-4">
                <div>
                  <strong className="text-slate-400 uppercase tracking-widest text-[9px]">Test Description Ordered</strong>
                  <p className="text-sm font-bold text-slate-800 mt-0.5">{selectedLab.testName}</p>
                </div>

                {selectedLab.results ? (
                  <div className="space-y-3">
                    <strong className="text-slate-400 uppercase tracking-widest text-[9px]">Validated Pathology Results</strong>
                    <div className="p-4 bg-emerald-50/20 border border-emerald-100/30 rounded-xl font-mono text-xs text-slate-700 leading-relaxed">
                      {selectedLab.results}
                    </div>

                    <button
                      onClick={() => window.print()}
                      className="flex items-center gap-1.5 text-xs text-emerald-600 hover:text-emerald-700 font-semibold cursor-pointer"
                    >
                      <Download className="h-4.5 w-4.5" /> Print Laboratory Report
                    </button>
                  </div>
                ) : (
                  currentUser?.role !== 'Receptionist' && (
                    <form onSubmit={handleUpdateResults} className="space-y-3 border-t border-slate-50 pt-4">
                      <label className="text-[11px] font-bold text-slate-500 block">Record Diagnostic Results / Findings:</label>
                      <textarea
                        required
                        rows={3}
                        value={newResults}
                        onChange={(e) => setNewResults(e.target.value)}
                        placeholder="Urinalysis results, BUN, Creatinine metrics details..."
                        className="w-full rounded-xl border border-slate-200 p-3 text-xs focus:border-emerald-500 focus:outline-none"
                      />
                      <button
                        type="submit"
                        className="rounded-xl bg-emerald-600 py-2 px-4 text-xs font-semibold text-white hover:bg-emerald-700"
                      >
                        Publish Test Findings
                      </button>
                    </form>
                  )
                )}
              </div>
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-12 text-center text-slate-400 text-xs flex flex-col items-center justify-center">
              <Layers className="h-10 w-10 text-slate-300 stroke-[1.5] mb-2" />
              <p>Select diagnostic order sheet to write results or inspect biological panels.</p>
            </div>
          )}
        </div>
      </div>

      {/* REQUEST MODAL LAYER */}
      {showAddForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-xl rounded-2xl bg-white p-6 shadow-2xl border border-slate-100 max-h-[85vh] overflow-y-auto">
            <h3 className="text-sm font-bold text-slate-800 border-b border-slate-100 pb-3">Initiate Laboratory Pathology Order</h3>
            <form onSubmit={handleCreateLab} className="mt-4 space-y-4">
              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">Select Patient Pet</label>
                <select
                  required
                  value={newPetId}
                  onChange={(e) => setNewPetId(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs bg-white focus:border-emerald-500 focus:outline-none"
                >
                  <option value="">-- Choose registered pet --</option>
                  {pets.map(pet => (
                    <option key={pet.id} value={pet.id}>{pet.name} ({pet.species})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">Pathology Test Type</label>
                <select
                  value={newTestName}
                  onChange={(e) => setNewTestName(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs bg-white focus:border-emerald-500 focus:outline-none"
                >
                  <option value="Senior Canine Comprehensive Chemistry & CBC">Senior Canine Chemistry & CBC Bloodwork</option>
                  <option value="Feline Fecal Panel & Giardia">Feline Fecal flotation & Giardia diagnostics</option>
                  <option value="Urinalysis & Specific Gravity">Urinalysis Sedimentation, Ph & Specific Gravity</option>
                  <option value="Fine Needle Aspirate (FNA) Pathology">FNA cytology cytology biopsy</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">Results (If already formulated by lab, otherwise leave blank for pending)</label>
                <textarea
                  rows={2}
                  value={newResults}
                  onChange={(e) => setNewResults(e.target.value)}
                  placeholder="Leave empty or fill details..."
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div className="flex gap-2 justify-end border-t border-slate-50 pt-4">
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="rounded-xl border border-slate-200 px-4 py-2 text-xs text-slate-500 hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-emerald-600 px-4 py-2 text-xs font-semibold text-white hover:bg-emerald-700 cursor-pointer"
                >
                  Dispatch Lab Order
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
