/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useVeterinary } from '../../context/VeterinaryContext';
import { ShieldCheck, PlusCircle, Printer, Download, Search, Heart, Sparkles, User, BadgeAlert } from 'lucide-react';
import { Vaccination } from '../../types';

export const VaccinationsView: React.FC = () => {
  const {
    vaccinations,
    addVaccination,
    updateVaccination,
    pets,
    clients,
    users,
    currentUser
  } = useVeterinary();

  const [searchTerm, setSearchTerm] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [certVaccination, setCertVaccination] = useState<Vaccination | null>(null);

  // New Vaccination fields
  const [newPetId, setNewPetId] = useState('');
  const [newVaccineName, setNewVaccineName] = useState('Rabies Booster');
  const [newBatchNumber, setNewBatchNumber] = useState('');
  const [newDateAdministered, setNewDateAdministered] = useState(new Date().toISOString().split('T')[0]);
  const [newNextDueDate, setNewNextDueDate] = useState('');
  const [newNotes, setNewNotes] = useState('');

  const vetsList = users.filter(u => u.role === 'Veterinarian' || u.role === 'Admin');

  const filteredVaccinations = vaccinations.filter(vac => {
    const pet = pets.find(p => p.id === vac.petId);
    return pet?.name.toLowerCase().includes(searchTerm.toLowerCase()) || vac.vaccineName.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const handleCreateVaccination = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPetId || !newVaccineName || !newBatchNumber || !newNextDueDate) return;

    addVaccination({
      petId: newPetId,
      vaccineName: newVaccineName,
      batchNumber: newBatchNumber,
      dateAdministered: newDateAdministered,
      nextDueDate: newNextDueDate,
      vetId: currentUser?.id || 'USR-ADMIN',
      notes: newNotes || undefined
    });

    // Reset
    setNewPetId('');
    setNewBatchNumber('');
    setNewNotes('');
    setShowAddForm(false);
  };

  return (
    <div className="space-y-6 text-left animate-in fade-in duration-200" id="vaccinations-view-container">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-slate-800">Immunization Registry & Booster Control</h2>
          <p className="text-xs text-slate-500">Record direct vaccine administrations, batch codes, generate printable digital certificates.</p>
        </div>
        {currentUser?.role !== 'Receptionist' && (
          <button
            onClick={() => setShowAddForm(true)}
            className="flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-xs font-semibold text-white hover:bg-emerald-700 shadow-md shadow-emerald-500/15 cursor-pointer self-start"
            id="administer-vaccine-btn"
          >
            <PlusCircle className="h-4 w-4" />
            <span>Administer Immunization</span>
          </button>
        )}
      </div>

      {certVaccination ? (
        /* VACCINATION CERTIFICATE DESIGN */
        <div className="rounded-2xl border-4 border-double border-emerald-100 bg-white p-8 shadow-xl text-left max-w-2xl mx-auto space-y-6 animate-in zoom-in-95 duration-200">
          <div className="text-center space-y-2 border-b border-slate-100 pb-5">
            <ShieldCheck className="h-10 w-10 text-emerald-600 mx-auto stroke-[1.5]" />
            <h3 className="font-sans font-black tracking-tight text-slate-800 text-lg uppercase">Official Vaccination Certification</h3>
            <p className="text-[10px] uppercase font-bold tracking-widest text-slate-400 font-mono">WellPet Veterinary Clinic CRM</p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 text-xs">
            <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 space-y-2">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Patient Bio Description</span>
              <div>
                <span className="text-[10px] text-slate-400 block">Name:</span>
                <strong className="text-sm font-extrabold text-slate-800">
                  {pets.find(p => p.id === certVaccination.petId)?.name}
                </strong>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block">Breed / Gender:</span>
                <strong className="font-semibold text-slate-700">
                  {pets.find(p => p.id === certVaccination.petId)?.breed} ({pets.find(p => p.id === certVaccination.petId)?.gender})
                </strong>
              </div>
            </div>

            <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 space-y-2">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Registrant Owner Info</span>
              <div>
                <span className="text-[10px] text-slate-400 block">Full Name:</span>
                <strong className="text-sm font-semibold text-slate-800">
                  {(() => {
                    const pet = pets.find(p => p.id === certVaccination.petId);
                    const client = clients.find(c => c.id === pet?.clientId);
                    return client ? `${client.firstName} ${client.lastName}` : 'Unregistered client';
                  })()}
                </strong>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block">Cell Phone:</span>
                <strong className="font-semibold text-slate-600">
                  {(() => {
                    const pet = pets.find(p => p.id === certVaccination.petId);
                    const client = clients.find(c => c.id === pet?.clientId);
                    return client ? client.phone : '';
                  })()}
                </strong>
              </div>
            </div>
          </div>

          {/* Vaccine details */}
          <div className="rounded-2xl border border-slate-100 p-5 space-y-3.5 text-xs">
            <div className="flex justify-between border-b border-slate-50 pb-2.5">
              <span className="text-slate-400">Vaccine administered:</span>
              <strong className="text-emerald-700 font-extrabold">{certVaccination.vaccineName}</strong>
            </div>
            <div className="flex justify-between border-b border-slate-50 pb-2.5">
              <span className="text-slate-400">Formulated Batch Log / Serial:</span>
              <strong className="text-slate-700 font-mono font-bold uppercase">{certVaccination.batchNumber}</strong>
            </div>
            <div className="flex justify-between border-b border-slate-50 pb-2.5">
              <span className="text-slate-400">Immunization Inoculation date:</span>
              <strong className="text-slate-700 font-mono font-semibold">{certVaccination.dateAdministered}</strong>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400 font-bold text-amber-700">Next Booster schedule due:</span>
              <strong className="text-amber-800 font-mono font-black uppercase tracking-wider">{certVaccination.nextDueDate}</strong>
            </div>
          </div>

          <div className="flex gap-2 justify-end border-t border-slate-100 pt-5">
            <button
              onClick={() => setCertVaccination(null)}
              className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50 cursor-pointer"
            >
              Back to Inoculation ledger
            </button>
            <button
              onClick={() => window.print()}
              className="flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2 text-xs font-semibold text-white hover:bg-emerald-700 cursor-pointer"
            >
              <Download className="h-4 w-4" /> Print Certificate
            </button>
          </div>
        </div>
      ) : (
        /* DYNAMIC HISTORIC LIST */
        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Filter vaccination history by pet, vaccine name..."
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
                    <th className="px-6 py-3 text-left">Recipient Pet</th>
                    <th className="px-6 py-3 text-left">Vaccine Administered</th>
                    <th className="px-6 py-3 text-left">Batch Code</th>
                    <th className="px-6 py-3 text-left">Inoculation Date</th>
                    <th className="px-6 py-3 text-left font-bold text-amber-700">Next Due Date</th>
                    <th className="px-6 py-3 text-right">Certificate</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs">
                  {filteredVaccinations.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-12 text-center text-slate-400">No vaccination record files matched.</td>
                    </tr>
                  ) : (
                    filteredVaccinations.map((vac) => {
                      const pet = pets.find(p => p.id === vac.petId);
                      const isOverdue = new Date(vac.nextDueDate) < new Date();
                      return (
                        <tr key={vac.id} className="hover:bg-slate-50/50 transition-colors">
                          <td className="px-6 py-4 font-bold text-slate-800">{pet?.name}</td>
                          <td className="px-6 py-4 text-slate-700 font-medium">{vac.vaccineName}</td>
                          <td className="px-6 py-4 font-mono text-slate-500 uppercase">{vac.batchNumber}</td>
                          <td className="px-6 py-4 font-mono text-slate-600">{vac.dateAdministered}</td>
                          <td className="px-6 py-4 font-mono">
                            <span className={`inline-flex items-center gap-1 font-bold ${isOverdue ? 'text-red-600 font-black' : 'text-slate-700'}`}>
                              {vac.nextDueDate}
                              {isOverdue && <BadgeAlert className="h-3 w-3 text-red-500 inline" />}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <button
                              onClick={() => setCertVaccination(vac)}
                              className="rounded bg-emerald-50 px-2.5 py-1 text-[11px] font-bold text-emerald-700 hover:bg-emerald-100 transition-colors cursor-pointer"
                            >
                              Show Certificate
                            </button>
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

      {/* CREATE NEW VACCINATION ENTRY */}
      {showAddForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-xl rounded-2xl bg-white p-6 shadow-2xl border border-slate-100 max-h-[85vh] overflow-y-auto">
            <h3 className="text-sm font-bold text-slate-800 border-b border-slate-100 pb-3">Record Inoculation / Immunization File</h3>
            <form onSubmit={handleCreateVaccination} className="mt-4 space-y-4">
              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">Recipient Patient</label>
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
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">Select Vaccine Type Pattern</label>
                <select
                  value={newVaccineName}
                  onChange={(e) => setNewVaccineName(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs bg-white focus:border-emerald-500 focus:outline-none"
                >
                  <option value="Rabies Booster">Rabies Booster (Feline/Canine core)</option>
                  <option value="FVRCP Triple">FVRCP Cat Triple (Distemper, Herpes, Calici)</option>
                  <option value="DHPP Combo">DHPP Canine Combo Core (Puppy / 1-Year booster)</option>
                  <option value="Bordetella Bronchiseptica">Bordetella Non-core (Canine Kennel Cough)</option>
                  <option value="Leptospirosis Vaccine">Leptospirosis Bacterial Non-core</option>
                </select>
              </div>

              <div className="grid gap-3 sm:grid-cols-3">
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">Batch Code / Serial</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. RAB-991A"
                    value={newBatchNumber}
                    onChange={(e) => setNewBatchNumber(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs focus:border-emerald-500 focus:outline-none font-mono"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">Administered Date</label>
                  <input
                    type="date"
                    required
                    value={newDateAdministered}
                    onChange={(e) => setNewDateAdministered(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs focus:border-emerald-500 focus:outline-none font-mono"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">Next Due Booster</label>
                  <input
                    type="date"
                    required
                    value={newNextDueDate}
                    onChange={(e) => setNewNextDueDate(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs focus:border-emerald-500 focus:outline-none font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">Clinic Practitioner Notes</label>
                <textarea
                  rows={2}
                  value={newNotes}
                  onChange={(e) => setNewNotes(e.target.value)}
                  placeholder="Administered standard sub-Q injection right rear thigh. Normal local reaction monitored."
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div className="flex gap-2 justify-end border-t border-slate-50 pt-4">
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="rounded-xl border border-slate-200 px-4 py-2 text-xs text-slate-500 hover:bg-slate-50 cursor-pointer"
                >
                  Discard Inoculation
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-emerald-600 px-4 py-2 text-xs font-semibold text-white hover:bg-emerald-700 cursor-pointer"
                >
                  Apply and File Vaccine
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
