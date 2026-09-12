/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useVeterinary } from '../../context/VeterinaryContext';
import { FileEdit, PlusCircle, Printer, Search, Star, Sparkles, CheckCircle2, AlertCircle, XCircle } from 'lucide-react';
import { Prescription, PrescriptionStatus } from '../../types';

export const PrescriptionsView: React.FC = () => {
  const {
    prescriptions,
    addPrescription,
    updatePrescription,
    pets,
    users,
    currentUser
  } = useVeterinary();

  const [searchTerm, setSearchTerm] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [printingPres, setPrintingPres] = useState<Prescription | null>(null);

  // New Prescription Fields
  const [newPetId, setNewPetId] = useState('');
  const [newMedName, setNewMedName] = useState('Amoxicillin Trihydrate Oral Suspension 50ml');
  const [newDosage, setNewDosage] = useState('1.5ml');
  const [newFreq, setNewFreq] = useState('Twice daily');
  const [newDur, setNewDur] = useState('7 Days');
  const [newInst, setNewInst] = useState('');
  const [newStart, setNewStart] = useState(new Date().toISOString().split('T')[0]);
  const [newEnd, setNewEnd] = useState('');

  const filteredPrescriptions = prescriptions.filter(pres => {
    const pet = pets.find(p => p.id === pres.petId);
    return pet?.name.toLowerCase().includes(searchTerm.toLowerCase()) || pres.medicationName.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const handleCreatePrescription = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPetId || !newMedName || !newDosage || !newFreq || !newDur || !newEnd) return;

    addPrescription({
      petId: newPetId,
      vetId: currentUser?.id || 'USR-ADMIN',
      medicationName: newMedName,
      dosage: newDosage,
      frequency: newFreq,
      duration: newDur,
      instructions: newInst || 'Take orally as prescribed.',
      startDate: newStart,
      endDate: newEnd,
      status: 'Active'
    });

    // Reset
    setNewPetId('');
    setNewInst('');
    setNewEnd('');
    setShowAddForm(false);
  };

  const handleToggleStatus = (pres: Prescription, status: PrescriptionStatus) => {
    updatePrescription({
      ...pres,
      status
    });
  };

  return (
    <div className="space-y-6 text-left animate-in fade-in duration-200" id="prescriptions-view-container">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-slate-800">Prescription Registry & Dosage Suite</h2>
          <p className="text-xs text-slate-500">Formulate precise drug dosages, dispense active prescriptions and generate legal slips.</p>
        </div>
        {currentUser?.role !== 'Receptionist' && (
          <button
            onClick={() => setShowAddForm(true)}
            className="flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-xs font-semibold text-white hover:bg-emerald-700 shadow-md shadow-emerald-500/15 cursor-pointer self-start"
            id="write-prescription-btn"
          >
            <PlusCircle className="h-4 w-4" />
            <span>Write Prescription Slip</span>
          </button>
        )}
      </div>

      {printingPres ? (
        /* PRINTABLE RX PRESCRIPTION SLIP SLAT */
        <div className="rounded-2xl border-4 border-dashed border-indigo-100 bg-white p-8 shadow-xl max-w-xl mx-auto space-y-6 animate-in slide-in-from-bottom duration-200">
          <div className="flex justify-between items-start border-b border-indigo-50 pb-5">
            <div>
              <span className="text-emerald-600 bg-emerald-50 px-2.5 py-1 text-[10px] font-extrabold uppercase rounded-lg">Legal Rx Prescriber Slip</span>
              <h3 className="font-sans font-black tracking-tight text-slate-800 text-sm mt-3 uppercase">WellPet CRM Dispensing Unit</h3>
              <p className="text-[9px] text-slate-400 mt-1 font-mono">RX ID: {printingPres.id}</p>
            </div>
            <div className="text-right">
              <span className="text-[11px] font-bold text-indigo-700">Abigail Vance DVM</span>
              <p className="text-[10px] text-slate-400 mt-0.5">Start: {printingPres.startDate}</p>
              <p className="text-[10px] text-slate-400">End: {printingPres.endDate}</p>
            </div>
          </div>

          <div className="space-y-2 text-xs">
            <span className="text-[10px] text-slate-400 uppercase font-bold tracking-widest block mb-1">Recipient Patient Profile</span>
            <div className="bg-slate-50 rounded-xl p-3 flex justify-between border border-slate-100">
              <div>
                <span className="text-slate-400">Pet Name:</span>
                <strong className="text-slate-800 ml-1 font-bold">{pets.find(p => p.id === printingPres.petId)?.name}</strong>
              </div>
              <div>
                <span className="text-slate-400">Breed / Spec:</span>
                <strong className="text-slate-700 ml-1">{pets.find(p => p.id === printingPres.petId)?.breed}</strong>
              </div>
            </div>
          </div>

          <div className="space-y-4 text-xs leading-relaxed">
            <div className="rounded-2xl p-4 bg-indigo-50/20 border border-indigo-100/50">
              <span className="text-[10px] uppercase font-bold text-indigo-700 block mb-1">Medication Specification</span>
              <p className="text-sm font-extrabold text-slate-800 leading-snug">{printingPres.medicationName}</p>
            </div>

            <div className="grid grid-cols-3 gap-2 text-center text-xs border-y border-slate-100 py-3">
              <div>
                <span className="text-slate-400 block text-[10px] uppercase">Dosage Size</span>
                <strong className="text-slate-800">{printingPres.dosage}</strong>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] uppercase">Frequency Rate</span>
                <strong className="text-slate-800">{printingPres.frequency}</strong>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] uppercase">Duration Intake</span>
                <strong className="text-slate-800">{printingPres.duration}</strong>
              </div>
            </div>

            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Clinical Intake Instructions:</span>
              <p className="bg-slate-50 rounded-xl p-3 border border-slate-100 text-slate-700 italic">"{printingPres.instructions}"</p>
            </div>
          </div>

          <div className="flex gap-2 justify-end border-t border-slate-100 pt-5 text-xs">
            <button
              onClick={() => setPrintingPres(null)}
              className="rounded-xl border border-slate-200 px-4 py-2 text-slate-500 hover:bg-slate-50 font-semibold cursor-pointer"
            >
              Close Prescription
            </button>
            <button
              onClick={() => window.print()}
              className="flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 font-semibold text-white hover:bg-indigo-700 cursor-pointer"
            >
              <Printer className="h-4 w-4" /> Print Rx Slip
            </button>
          </div>
        </div>
      ) : (
        /* DYNAMIC LEDGER LIST */
        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search active prescriptions by pet or drug..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-xl border border-slate-200 py-2.5 pl-10 pr-4 text-xs font-medium focus:border-emerald-500 focus:outline-none"
            />
          </div>

          <div className="rounded-2xl border border-slate-100 bg-white shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/50 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                    <th className="px-6 py-3 text-left">Pat Recipient</th>
                    <th className="px-6 py-3 text-left">Prescribed Drug</th>
                    <th className="px-6 py-3 text-left">Dosage</th>
                    <th className="px-6 py-3 text-left">Intake Rate</th>
                    <th className="px-6 py-3 text-left">Cycle Duration</th>
                    <th className="px-6 py-3 text-left">Status</th>
                    <th className="px-6 py-3 text-right">Settings</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs">
                  {filteredPrescriptions.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-12 text-center text-slate-400 font-medium">No prescription slips logged for search query.</td>
                    </tr>
                  ) : (
                    filteredPrescriptions.map((pres) => {
                      const pet = pets.find(p => p.id === pres.petId);
                      return (
                        <tr key={pres.id} className="hover:bg-slate-50/40 transition-colors">
                          <td className="px-6 py-4 font-bold text-slate-800">{pet?.name}</td>
                          <td className="px-6 py-4 font-semibold text-indigo-700 truncate max-w-[150px]">{pres.medicationName}</td>
                          <td className="px-6 py-4 font-mono text-slate-600">{pres.dosage}</td>
                          <td className="px-6 py-4 text-slate-600">{pres.frequency}</td>
                          <td className="px-6 py-4 font-mono text-slate-500">{pres.duration}</td>
                          <td className="px-6 py-4">
                            <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-bold ${
                              pres.status === 'Active' ? 'bg-emerald-100 text-emerald-800' :
                              pres.status === 'Expired' ? 'bg-rose-100 text-rose-800' :
                              'bg-slate-100 text-slate-600'
                            }`}>
                              {pres.status === 'Active' && <CheckCircle2 className="h-3 w-3 text-emerald-500" />}
                              {pres.status === 'Expired' && <XCircle className="h-3 w-3 text-rose-500" />}
                              {pres.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-right flex items-center justify-end gap-2.5">
                            <button
                              onClick={() => setPrintingPres(pres)}
                              className="rounded bg-indigo-50 px-2.5 py-1 text-[11px] font-bold text-indigo-700 hover:bg-indigo-100 transition-colors cursor-pointer"
                            >
                              Show RX Slip
                            </button>

                            {currentUser?.role !== 'Receptionist' && pres.status === 'Active' && (
                              <button
                                onClick={() => handleToggleStatus(pres, 'Completed')}
                                className="text-[10px] font-semibold text-slate-400 hover:text-slate-700 cursor-pointer"
                              >
                                Mark Completed
                              </button>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* NEW DISPENSION SLIP SLIDER MODAL */}
      {showAddForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-xl rounded-2xl bg-white p-6 shadow-2xl border border-slate-100 max-h-[85vh] overflow-y-auto">
            <h3 className="text-sm font-bold text-slate-800 border-b border-slate-100 pb-3">Formulate Legal Rx Prescription</h3>
            <form onSubmit={handleCreatePrescription} className="mt-4 space-y-4">
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
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">Medication Formulation</label>
                <select
                  value={newMedName}
                  onChange={(e) => setNewMedName(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs bg-white focus:border-emerald-500 focus:outline-none"
                >
                  <option value="Amoxicillin Trihydrate Oral Suspension 50ml">Amoxicillin Oral Liquid Suspension 50ml</option>
                  <option value="NexGard Chews for Large Dogs 25-50kg">NexGard Flea/Tick Chews (68mg tablet)</option>
                  <option value="Surolan Topical Ear Suspension Drop">Surolan Antifungal/Antibacterial Drops 15ml</option>
                  <option value="Gabapentin 100mg Capsules">Gabapentin Nerve Comforting (100mg capsule)</option>
                  <option value="Prednisolone 5mg tablets">Prednisolone Anti-inflammatory (5mg tablet)</option>
                </select>
              </div>

              <div className="grid gap-3 sm:grid-cols-3">
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">Dosage size (e.g. 1.5ml / 1 pill)</label>
                  <input
                    type="text"
                    required
                    value={newDosage}
                    placeholder="e.g. 1.5ml"
                    onChange={(e) => setNewDosage(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs focus:border-emerald-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">Frequency Rate</label>
                  <input
                    type="text"
                    required
                    value={newFreq}
                    placeholder="e.g. Twice daily"
                    onChange={(e) => setNewFreq(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs focus:border-emerald-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">Cycle Duration</label>
                  <input
                    type="text"
                    required
                    value={newDur}
                    placeholder="e.g. 7 Days"
                    onChange={(e) => setNewDur(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs focus:border-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">Intake Cycle Start Date</label>
                  <input
                    type="date"
                    required
                    value={newStart}
                    onChange={(e) => setNewStart(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs focus:border-emerald-500 focus:outline-none font-mono"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">Cycle Terminus Date</label>
                  <input
                    type="date"
                    required
                    value={newEnd}
                    onChange={(e) => setNewEnd(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs focus:border-emerald-500 focus:outline-none font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">Clinical Intake Instructions</label>
                <textarea
                  rows={2}
                  value={newInst}
                  placeholder="Give with or after food. Keep refrigerated. Direct oral application."
                  onChange={(e) => setNewInst(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div className="flex gap-2 justify-end border-t border-slate-50 pt-4">
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="rounded-xl border border-slate-200 px-4 py-2 text-xs text-slate-500 hover:bg-slate-50 cursor-pointer"
                >
                  Discard Rx
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-emerald-600 px-4 py-2 text-xs font-semibold text-white hover:bg-emerald-700 cursor-pointer"
                >
                  Commit & Authorize Refill
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
