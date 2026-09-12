/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useVeterinary } from '../../context/VeterinaryContext';
import { Scissors, PlusCircle, Search, Sparkles, Check, Download } from 'lucide-react';
import { Surgery } from '../../types';

export const SurgeriesView: React.FC = () => {
  const {
    surgeries,
    addSurgery,
    updateSurgery,
    pets,
    users,
    currentUser
  } = useVeterinary();

  const [searchTerm, setSearchTerm] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedSurgery, setSelectedSurgery] = useState<Surgery | null>(null);

  // New Surgery fields
  const [newPetId, setNewPetId] = useState('');
  const [newSurgeryType, setNewSurgeryType] = useState('Spaying (Ovariohysterectomy)');
  const [newDate, setNewDate] = useState(new Date().toISOString().split('T')[0]);
  const [newNotes, setNewNotes] = useState('');
  const [newInstructions, setNewInstructions] = useState('');
  const [newOutcome, setNewOutcome] = useState('Pending Surgical Procedure');

  const vetsList = users.filter(u => u.role === 'Veterinarian' || u.role === 'Admin');

  const filteredSurgeries = surgeries.filter(surg => {
    const pet = pets.find(p => p.id === surg.petId);
    return pet?.name.toLowerCase().includes(searchTerm.toLowerCase()) || surg.surgeryType.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const handleCreateSurgery = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPetId || !newSurgeryType || !newDate) return;

    addSurgery({
      petId: newPetId,
      surgeryType: newSurgeryType,
      surgeonId: currentUser?.id || 'USR-ADMIN',
      date: newDate,
      notes: newNotes || undefined,
      outcome: newOutcome,
      followUpInstructions: newInstructions || undefined
    });

    // Reset
    setNewPetId('');
    setNewNotes('');
    setNewInstructions('');
    setNewOutcome('Pending Surgical Procedure');
    setShowAddForm(false);
  };

  const handlePostOpCompletion = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSurgery || !newOutcome) return;

    updateSurgery({
      ...selectedSurgery,
      outcome: newOutcome,
      followUpInstructions: newInstructions
    });

    setSelectedSurgery(null);
    setNewOutcome('Pending Surgical Procedure');
    setNewInstructions('');
  };

  return (
    <div className="space-y-6 text-left animate-in fade-in duration-200" id="surgeries-view-container">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-slate-800">Surgical Operations Registry</h2>
          <p className="text-xs text-slate-500">Plan intricate anesthesia procedures, log physical surgery outcomes and postoperative home instructions.</p>
        </div>
        {currentUser?.role !== 'Receptionist' && (
          <button
            onClick={() => setShowAddForm(true)}
            className="flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-xs font-semibold text-white hover:bg-emerald-700 shadow-md shadow-emerald-500/15 cursor-pointer self-start"
            id="schedule-surgery-btn"
          >
            <PlusCircle className="h-4 w-4" />
            <span>Schedule Surgical Operation</span>
          </button>
        )}
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Left List */}
        <div className="space-y-4 md:col-span-1">
          <div className="relative">
            <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search surgery schedules..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-xl border border-slate-200 py-2.5 pl-10 pr-4 text-xs font-medium focus:border-emerald-500 focus:outline-none"
            />
          </div>

          <div className="rounded-2xl border border-slate-100 bg-white p-2 shadow-sm max-h-[55vh] overflow-y-auto space-y-1">
            {filteredSurgeries.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-6">No scheduled operations available.</p>
            ) : (
              filteredSurgeries.map((surg) => {
                const pet = pets.find(p => p.id === surg.petId);
                const isSelected = selectedSurgery?.id === surg.id;
                return (
                  <button
                    key={surg.id}
                    onClick={() => {
                      setSelectedSurgery(surg);
                      setNewOutcome(surg.outcome);
                      setNewInstructions(surg.followUpInstructions || '');
                    }}
                    className={`w-full text-left p-3.5 rounded-xl transition-all cursor-pointer flex justify-between items-center ${
                      isSelected ? 'bg-emerald-50 border border-emerald-100/30' : 'hover:bg-slate-50'
                    }`}
                  >
                    <div>
                      <span className="font-bold text-xs text-slate-800">{pet?.name}</span>
                      <p className="text-[11px] text-slate-500 mt-1 truncate max-w-[170px]">
                        Op: <strong className="font-semibold text-slate-700">{surg.surgeryType}</strong>
                      </p>
                    </div>

                    <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                      surg.outcome.toLowerCase().includes('pending') ? 'bg-amber-50 text-amber-700' : 'bg-emerald-50 text-emerald-700'
                    }`}>
                      {surg.date}
                    </span>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Right Details */}
        <div className="md:col-span-2">
          {selectedSurgery ? (
            <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm space-y-6">
              <div className="flex justify-between items-center border-b border-slate-50 pb-3">
                <div>
                  <h3 className="text-sm font-extrabold text-slate-800">Surgical Record ID #{selectedSurgery.id}</h3>
                  <span className="text-[10px] text-slate-400">Date Checklist: {selectedSurgery.date}</span>
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-2 text-xs">
                <div className="bg-slate-50 rounded-xl p-3 border border-slate-100">
                  <span className="text-slate-400">Biological Patient</span>
                  <p className="font-bold text-slate-700 mt-1">
                    {pets.find(p => p.id === selectedSurgery.petId)?.name}
                  </p>
                </div>
                <div className="bg-slate-50 rounded-xl p-3 border border-slate-100">
                  <span className="text-slate-400">Lead Surgeon Doctor</span>
                  <p className="font-bold text-slate-700 mt-1">
                    {users.find(u => u.id === selectedSurgery.surgeonId)?.name || 'Dr. Abigail Vance'}
                  </p>
                </div>
              </div>

              <div className="text-xs space-y-4">
                <div>
                  <strong className="text-slate-400 uppercase tracking-widest text-[9px]">Surgical Procedure Type</strong>
                  <p className="text-sm font-bold text-slate-800 mt-0.5">{selectedSurgery.surgeryType}</p>
                </div>

                <div>
                  <strong className="text-slate-400 uppercase tracking-widest text-[9px]">Anesthesia & Intubation Notes</strong>
                  <p className="bg-slate-50 border border-slate-100 p-3.5 rounded-lg text-slate-700 mt-1 italic leading-relaxed">
                    "{selectedSurgery.notes || 'No surgical caveats filed.'}"
                  </p>
                </div>

                {/* Outcome checks */}
                {!selectedSurgery.outcome.toLowerCase().includes('pending') ? (
                  <div className="space-y-4">
                    <div>
                      <strong className="text-emerald-700 block font-bold text-[10px] uppercase">Validated Outcome Status</strong>
                      <p className="bg-emerald-50 text-emerald-950 font-semibold rounded-lg p-3 mt-1">{selectedSurgery.outcome}</p>
                    </div>

                    {selectedSurgery.followUpInstructions && (
                      <div>
                        <strong className="text-slate-400 block font-semibold">Post-Operation Discharge Home Guide:</strong>
                        <p className="bg-indigo-50 text-indigo-950 rounded-lg p-3.5 mt-1 leading-relaxed border border-indigo-150 font-medium">
                          {selectedSurgery.followUpInstructions}
                        </p>
                      </div>
                    )}

                    <button
                      onClick={() => window.print()}
                      className="flex items-center gap-1.5 text-xs text-emerald-600 hover:text-emerald-700 font-bold font-sans cursor-pointer"
                    >
                      <Download className="h-4.5 w-4.5" /> Print Surgical Report
                    </button>
                  </div>
                ) : (
                  currentUser?.role !== 'Receptionist' && (
                    <form onSubmit={handlePostOpCompletion} className="space-y-4 border-t border-slate-50 pt-4 text-left">
                      <span className="text-[11px] font-bold text-slate-500 block">Close Surgery Case File:</span>

                      <div>
                        <label className="text-[10px] text-slate-400 block mb-1">Detailed Outcome Context</label>
                        <input
                          type="text"
                          required
                          value={newOutcome}
                          placeholder="e.g. Cleared general anesthesia. Fully active. Incision closed subQ."
                          onChange={(e) => setNewOutcome(e.target.value)}
                          className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs focus:border-emerald-500 focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="text-[10px] text-slate-400 block mb-1">Home Follow-Up Instructions for Owner</label>
                        <textarea
                          rows={2}
                          value={newInstructions}
                          placeholder="Cage rest for 7 days. Give prescribed Gabapentin daily. Do not allow licking."
                          onChange={(e) => setNewInstructions(e.target.value)}
                          className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs focus:border-emerald-500 focus:outline-none"
                        />
                      </div>

                      <button
                        type="submit"
                        className="rounded-xl bg-emerald-600 py-2 px-4 text-xs font-semibold text-white hover:bg-emerald-700"
                      >
                        Publish Post-Op Outcome Report
                      </button>
                    </form>
                  )
                )}
              </div>
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-12 text-center text-slate-400 text-xs flex flex-col items-center justify-center">
              <Scissors className="h-10 w-10 text-slate-300 stroke-[1.5] mb-2" />
              <p>Select scheduled surgery to record intubation notes, outcome logs, or post-operative guides.</p>
            </div>
          )}
        </div>
      </div>

      {/* SCHEDULE ACTION MODAL */}
      {showAddForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-xl rounded-2xl bg-white p-6 shadow-2xl border border-slate-100 max-h-[85vh] overflow-y-auto">
            <h3 className="text-sm font-bold text-slate-800 border-b border-slate-100 pb-3">Schedule Surgical Procedure</h3>
            <form onSubmit={handleCreateSurgery} className="mt-4 space-y-4">
              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">Biological Patient</label>
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

              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">Surgery Procedure Type</label>
                  <select
                    value={newSurgeryType}
                    onChange={(e) => setNewSurgeryType(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs bg-white focus:border-emerald-500 focus:outline-none"
                  >
                    <option value="Spaying (Ovariohysterectomy)">Spaying (Routine Ovariohysterectomy)</option>
                    <option value="Neutering (Orchiectomy)">Neutering (Routine Orchiectomy)</option>
                    <option value="Severe Dental Scale & Extraction">Surgical Dental Scale & Extraction</option>
                    <option value="Mass Biopsy Tumors Removal">Soft Tissue Mass Tumor Removal</option>
                  </select>
                </div>

                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">Target Operating Date</label>
                  <input
                    type="date"
                    required
                    value={newDate}
                    onChange={(e) => setNewDate(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs focus:border-emerald-500 focus:outline-none font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">Surgical / Anesthesia notes</label>
                <textarea
                  rows={2}
                  value={newNotes}
                  onChange={(e) => setNewNotes(e.target.value)}
                  placeholder="Pre-anesthetic blood parameters normal. Intubation planned standard catheter 22G."
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div className="flex gap-2 justify-end border-t border-slate-50 pt-4">
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="rounded-xl border border-slate-200 px-4 py-2 text-xs text-slate-500 hover:bg-slate-50 cursor-pointer"
                >
                  Discard Schedule
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-emerald-600 px-4 py-2 text-xs font-semibold text-white hover:bg-emerald-700 cursor-pointer"
                >
                  Dispatch Surgery Order
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
