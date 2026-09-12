/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useVeterinary } from '../../context/VeterinaryContext';
import {
  FileText,
  PlusCircle,
  Eye,
  EyeOff,
  User,
  Heart,
  FileCheck,
  Search,
  Check,
  Printer,
  ChevronDown,
  Sparkles,
  Loader2,
  CheckCircle2
} from 'lucide-react';
import { MedicalRecord } from '../../types';
import { generateSoapConsultation } from '../../services/geminiService';

export const MedicalRecordsView: React.FC = () => {
  const {
    medicalRecords,
    addMedicalRecord,
    updateMedicalRecord,
    pets,
    clients,
    users,
    currentUser
  } = useVeterinary();

  const [searchTerm, setSearchTerm] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<MedicalRecord | null>(null);

  // Form Fields
  const [newPetId, setNewPetId] = useState('');
  const [newChiefComplaint, setNewChiefComplaint] = useState('');
  const [newHistory, setNewHistory] = useState('');
  const [newPhysicalExam, setNewPhysicalExam] = useState('');
  const [newDiagnosis, setNewDiagnosis] = useState('');
  const [newTreatmentPlan, setNewTreatmentPlan] = useState('');
  const [newNotes, setNewNotes] = useState('');
  const [newIsVisibleToOwner, setNewIsVisibleToOwner] = useState(true);

  // Printing/Report state simulation
  const [printingRecord, setPrintingRecord] = useState<MedicalRecord | null>(null);

  // AI SOAP Generator state
  const [isGeneratingAiSoap, setIsGeneratingAiSoap] = useState(false);
  const [aiSuccessMessage, setAiSuccessMessage] = useState<string | null>(null);

  const handleAiGenerateSoap = async () => {
    if (!newPetId || !newChiefComplaint.trim()) {
      alert('Please select a patient pet and enter a chief complaint first.');
      return;
    }

    const pet = pets.find(p => p.id === newPetId);
    if (!pet) return;

    setIsGeneratingAiSoap(true);
    setAiSuccessMessage(null);

    try {
      const suggestion = await generateSoapConsultation({
        species: pet.species,
        breed: pet.breed,
        weightKg: pet.weight,
        chiefComplaint: newChiefComplaint,
        preliminaryNotes: newNotes
      });

      if (!newHistory.trim()) setNewHistory(suggestion.subjective);
      if (!newPhysicalExam.trim()) setNewPhysicalExam(suggestion.objective);
      if (!newDiagnosis.trim()) setNewDiagnosis(suggestion.assessment);
      if (!newTreatmentPlan.trim()) setNewTreatmentPlan(suggestion.plan);
      if (suggestion.preventativeCare) {
        setNewNotes(prev => prev ? `${prev}\n\nPreventative Advice: ${suggestion.preventativeCare}` : `Preventative Advice: ${suggestion.preventativeCare}`);
      }

      setAiSuccessMessage('Clinical SOAP draft generated! Review and edit any field as needed.');
      setTimeout(() => setAiSuccessMessage(null), 5000);
    } catch (err) {
      console.error('Failed to generate AI SOAP', err);
    } finally {
      setIsGeneratingAiSoap(false);
    }
  };

  const filteredRecords = medicalRecords.filter(rec => {
    const pet = pets.find(p => p.id === rec.petId);
    const client = clients.find(c => c.id === pet?.clientId);
    const searchString = `${pet?.name || ''} ${client?.firstName || ''} ${client?.lastName || ''} ${rec.diagnosis}`.toLowerCase();
    return searchString.includes(searchTerm.toLowerCase());
  });

  const handleCreateRecord = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPetId || !newChiefComplaint || !newDiagnosis || !newTreatmentPlan) return;

    addMedicalRecord({
      petId: newPetId,
      vetId: currentUser?.id || 'USR-ADMIN',
      visitDate: new Date().toISOString().split('T')[0],
      chiefComplaint: newChiefComplaint,
      history: newHistory,
      physicalExamination: newPhysicalExam,
      diagnosis: newDiagnosis,
      treatmentPlan: newTreatmentPlan,
      notes: newNotes,
      isVisibleToOwner: newIsVisibleToOwner,
      attachments: []
    });

    // Reset Form
    setNewPetId('');
    setNewChiefComplaint('');
    setNewHistory('');
    setNewPhysicalExam('');
    setNewDiagnosis('');
    setNewTreatmentPlan('');
    setNewNotes('');
    setNewIsVisibleToOwner(true);
    setShowAddForm(false);
  };

  const handleToggleVisibility = (rec: MedicalRecord) => {
    updateMedicalRecord({
      ...rec,
      isVisibleToOwner: !rec.isVisibleToOwner
    });
  };

  return (
    <div className="space-y-6 text-left animate-in fade-in duration-200" id="medical-records-container">
      {/* Upper header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-slate-800">Veterinary SOAP Consultations</h2>
          <p className="text-xs text-slate-500">Record and review subjective observations, clinical exams, treatments and owner visibility rules.</p>
        </div>
        {currentUser?.role !== 'Receptionist' && (
          <button
            onClick={() => setShowAddForm(true)}
            className="flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-xs font-semibold text-white hover:bg-emerald-700 shadow-md shadow-emerald-500/15 cursor-pointer self-start"
            id="add-medical-record-btn"
          >
            <PlusCircle className="h-4 w-4" />
            <span>Formulate SOAP Record</span>
          </button>
        )}
      </div>

      {/* Main content frame */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left Side: Records List */}
        <div className="lg:col-span-1 space-y-4">
          <div className="relative">
            <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search records by pet, diagnosis..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-xl border border-slate-200 py-2.5 pl-10 pr-4 text-xs font-medium focus:border-emerald-500 focus:outline-none"
            />
          </div>

          <div className="rounded-2xl border border-slate-100 bg-white p-2 shadow-sm max-h-[60vh] overflow-y-auto space-y-1">
            {filteredRecords.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-8">No clinical SOAP cards indexed.</p>
            ) : (
              filteredRecords.map((rec) => {
                const pet = pets.find(p => p.id === rec.petId);
                const isSelected = selectedRecord?.id === rec.id;
                return (
                  <button
                    key={rec.id}
                    onClick={() => {
                      setSelectedRecord(rec);
                      setPrintingRecord(null);
                    }}
                    className={`w-full text-left p-3.5 rounded-xl transition-all cursor-pointer flex justify-between items-start ${
                      isSelected ? 'bg-emerald-50 border border-emerald-100/30' : 'hover:bg-slate-50'
                    }`}
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-xs text-slate-800">{pet?.name}</span>
                        <span className="text-[10px] text-slate-400 font-mono">({rec.visitDate})</span>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-1 truncate max-w-[170px]">
                        Diag: <strong className="font-semibold text-emerald-800">{rec.diagnosis}</strong>
                      </p>
                    </div>

                    {rec.isVisibleToOwner ? (
                      <Eye className="h-3.5 w-3.5 text-slate-400" title="Visible to owner" />
                    ) : (
                      <EyeOff className="h-3.5 w-3.5 text-rose-400" title="Hidden from owner" />
                    )}
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Right Side: SOAP file view / print */}
        <div className="lg:col-span-2">
          {printingRecord ? (
            /* Printable Clinical PDF Report Simulation */
            <div className="rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 p-6 shadow-md text-left font-sans text-slate-800 max-w-xl mx-auto space-y-6">
              <div className="flex justify-between items-start border-b border-slate-200 pb-4">
                <div>
                  <h3 className="font-extrabold text-base uppercase text-slate-900 leading-none">Diagnostic Visit Record</h3>
                  <span className="text-[10px] text-slate-400 font-mono block mt-1">Record ID: {printingRecord.id}</span>
                </div>
                <div className="text-right">
                  <span className="text-xs font-bold text-emerald-700">WellPet Veterinary CRM</span>
                  <p className="text-[10px] text-slate-400 font-mono mt-0.5">Date: {printingRecord.visitDate}</p>
                </div>
              </div>

              {/* Patient spec card */}
              <div className="bg-white rounded-xl p-4 border border-slate-100 grid grid-cols-2 gap-4 text-xs">
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Patient Details</span>
                  <p className="font-bold mt-1">
                    {pets.find(p => p.id === printingRecord.petId)?.name} (Breed: {pets.find(p => p.id === printingRecord.petId)?.breed})
                  </p>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Examiner Staff</span>
                  <p className="font-bold mt-1">
                    {users.find(u => u.id === printingRecord.vetId)?.name || 'Clinical Practitioner'}
                  </p>
                </div>
              </div>

              {/* Record block */}
              <div className="space-y-4 text-xs leading-relaxed">
                <div>
                  <strong className="text-[11px] uppercase text-slate-400 block mb-1">Subjective Complaint:</strong>
                  <p className="bg-white rounded-xl p-3 border border-slate-100">"{printingRecord.chiefComplaint}"</p>
                </div>
                <div>
                  <strong className="text-[11px] uppercase text-slate-400 block mb-1">History & Context:</strong>
                  <p className="bg-white rounded-xl p-3 border border-slate-100">{printingRecord.history || 'Not reported.'}</p>
                </div>
                <div>
                  <strong className="text-[11px] uppercase text-slate-400 block mb-1">Objective Physical Exam:</strong>
                  <p className="bg-white rounded-xl p-3 border border-slate-100">{printingRecord.physicalExamination || 'Standard biometrics registered.'}</p>
                </div>
                <div>
                  <strong className="text-[11px] uppercase text-slate-400 block mb-1">Clinical Diagnosis:</strong>
                  <p className="bg-emerald-50 text-emerald-950 font-bold rounded-xl p-3 border border-emerald-100">{printingRecord.diagnosis}</p>
                </div>
                <div>
                  <strong className="text-[11px] uppercase text-slate-400 block mb-1">Treatment Regimen Plan:</strong>
                  <p className="bg-indigo-50 text-indigo-950 font-semibold rounded-xl p-3 border border-indigo-100">{printingRecord.treatmentPlan}</p>
                </div>
              </div>

              <div className="flex gap-2 justify-end border-t border-slate-200 pt-4">
                <button
                  onClick={() => setPrintingRecord(null)}
                  className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50 cursor-pointer"
                >
                  Return to Dashboard
                </button>
                <button
                  onClick={() => window.print()}
                  className="flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2 text-xs font-semibold text-white hover:bg-emerald-700 cursor-pointer"
                >
                  <Printer className="h-4 w-4" />
                  Print Record
                </button>
              </div>
            </div>
          ) : selectedRecord ? (
            /* Detailed SOAP Card representation */
            <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm text-left space-y-6">
              <div className="flex justify-between items-center border-b border-slate-50 pb-4">
                <div>
                  <h3 className="text-sm font-extrabold text-slate-800 flex items-center gap-2">
                    <FileCheck className="h-4.5 w-4.5 text-emerald-600" />
                    Medical Assessment Detail Card
                  </h3>
                  <span className="text-[10px] text-slate-400">Record #{selectedRecord.id}</span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setPrintingRecord(selectedRecord)}
                    className="flex items-center gap-1 bg-slate-50 border border-slate-150 rounded-lg px-2.5 py-1 text-[11px] font-semibold text-slate-600 hover:bg-slate-100 cursor-pointer"
                  >
                    <Printer className="h-3.5 w-3.5" />
                    <span>Report Doc</span>
                  </button>
                  <button
                    onClick={() => handleToggleVisibility(selectedRecord)}
                    className={`flex items-center gap-1 rounded-lg px-2.5 py-1 text-[11px] font-semibold transition-all cursor-pointer ${
                      selectedRecord.isVisibleToOwner
                        ? 'bg-emerald-50 text-emerald-800'
                        : 'bg-rose-50 text-rose-800'
                    }`}
                  >
                    {selectedRecord.isVisibleToOwner ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5" />}
                    <span>{selectedRecord.isVisibleToOwner ? 'Visible to owner' : 'Private SOAP'}</span>
                  </button>
                </div>
              </div>

              {/* Main specifications layout */}
              <div className="grid gap-4 sm:grid-cols-2 text-xs">
                <div className="bg-slate-50 rounded-xl p-3.5 text-left border border-slate-100">
                  <span className="text-slate-400">Patient Pet Species</span>
                  <p className="font-bold text-slate-800 mt-1">
                    {pets.find(p => p.id === selectedRecord.petId)?.name} (Species: {pets.find(p => p.id === selectedRecord.petId)?.species})
                  </p>
                </div>
                <div className="bg-slate-50 rounded-xl p-3.5 text-left border border-slate-100">
                  <span className="text-slate-400">Examining Vet Nurse</span>
                  <p className="font-bold text-slate-800 mt-1">
                    {users.find(u => u.id === selectedRecord.vetId)?.name || 'Default Vet Practitioner'}
                  </p>
                </div>
              </div>

              <div className="space-y-4 text-xs">
                <div>
                  <strong className="text-slate-400">Chief Complaint Subjective:</strong>
                  <p className="mt-1 text-slate-700 italic border-l-2 border-emerald-500 pl-3 py-1.5 leading-relaxed bg-slate-50/20 rounded-r-xl pr-3">
                    "{selectedRecord.chiefComplaint}"
                  </p>
                </div>
                <div>
                  <strong className="text-slate-400">Anamnesis Patient History:</strong>
                  <p className="mt-1 text-slate-700 leading-relaxed">{selectedRecord.history || 'No historical parameters provided.'}</p>
                </div>
                <div>
                  <strong className="text-slate-400">Objective Biometric Physical Exam:</strong>
                  <p className="mt-1 text-slate-700 leading-relaxed">{selectedRecord.physicalExamination || 'Standard diagnostics cleared.'}</p>
                </div>
                <div className="p-3 bg-emerald-50/30 rounded-xl border border-emerald-100/20">
                  <strong className="text-emerald-800 font-extrabold text-[12px]">Clinical Diagnosis Assessment:</strong>
                  <p className="mt-1 text-slate-800 font-semibold">{selectedRecord.diagnosis}</p>
                </div>
                <div className="p-3 bg-indigo-50/30 rounded-xl border border-indigo-100/20">
                  <strong className="text-indigo-800 font-bold block mb-1 text-[11px]">Treatment Plan Protocol:</strong>
                  <p className="text-slate-700 leading-relaxed">{selectedRecord.treatmentPlan}</p>
                </div>

                {selectedRecord.notes && (
                  <div className="p-3 bg-amber-50/20 rounded-xl border border-amber-100/30">
                    <strong className="text-amber-800 font-semibold block mb-1">Staff Internal Clinic Notes (Private):</strong>
                    <p className="text-slate-600 italic leading-relaxed">"{selectedRecord.notes}"</p>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-12 text-center text-slate-400 text-xs flex flex-col items-center justify-center">
              <FileCheck className="h-10 w-10 text-slate-300 stroke-[1.5] mb-2" />
              <p>Select a consultation SOAP card to inspect clinical logs or verify owner permissions.</p>
            </div>
          )}
        </div>
      </div>

      {/* CREATE NEW SOAP FORM (MODAL) */}
      {showAddForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-xl rounded-2xl bg-white p-6 shadow-2xl border border-slate-100 max-h-[85vh] overflow-y-auto">
            <h3 className="text-sm font-bold text-slate-800 border-b border-slate-100 pb-3">Formulate Subjective Objective Assessment (SOAP)</h3>
            <form onSubmit={handleCreateRecord} className="mt-4 space-y-4">
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
                    <option key={pet.id} value={pet.id}>{pet.name} ({pet.species} | {pet.breed})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">Chief Complaint (Subjective)</label>
                <textarea
                  required
                  rows={2}
                  value={newChiefComplaint}
                  onChange={(e) => setNewChiefComplaint(e.target.value)}
                  placeholder="Owner states lethargy, minor vomiting, limping on leg..."
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs focus:border-emerald-500 focus:outline-none"
                />

                <div className="flex items-center justify-between pt-1.5">
                  <span className="text-[10px] text-slate-400">Need diagnostic assistance?</span>
                  <button
                    type="button"
                    onClick={handleAiGenerateSoap}
                    disabled={isGeneratingAiSoap || !newPetId || !newChiefComplaint.trim()}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 px-2.5 py-1 text-[11px] font-bold text-white shadow-xs hover:from-emerald-700 hover:to-teal-700 transition-all cursor-pointer disabled:opacity-40"
                    title="Generate clinical SOAP draft using Gemini AI"
                  >
                    {isGeneratingAiSoap ? (
                      <>
                        <Loader2 className="h-3 w-3 animate-spin" />
                        <span>Drafting SOAP...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="h-3 w-3" />
                        <span>AI SOAP Assistant (Gemini)</span>
                      </>
                    )}
                  </button>
                </div>

                {aiSuccessMessage && (
                  <div className="mt-2 rounded-xl border border-emerald-200 bg-emerald-50 p-2 text-[11px] text-emerald-800 flex items-center gap-2 animate-in fade-in duration-200">
                    <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-emerald-600" />
                    <span>{aiSuccessMessage}</span>
                  </div>
                )}
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">Medical Anamnesis History</label>
                  <textarea
                    rows={2}
                    value={newHistory}
                    onChange={(e) => setNewHistory(e.target.value)}
                    placeholder="Fed diet of raw fish, previously had ear infection..."
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs focus:border-emerald-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">Biometric Physical Exam (Objective)</label>
                  <textarea
                    rows={2}
                    value={newPhysicalExam}
                    onChange={(e) => setNewPhysicalExam(e.target.value)}
                    placeholder="Temp 101.5F, BPM 130, mucous membranes pink, hydration adequate."
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs focus:border-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">Assessment / Diagnosis</label>
                  <input
                    type="text"
                    required
                    value={newDiagnosis}
                    placeholder="e.g. Feline Infectious Bordetella / Mild Osteoclasts"
                    onChange={(e) => setNewDiagnosis(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs focus:border-emerald-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">Treatment Regimen Plan</label>
                  <input
                    type="text"
                    required
                    value={newTreatmentPlan}
                    placeholder="e.g. Prescribe Amoxicillin Liquid suspension 1.5ml BID / hydrotherapy"
                    onChange={(e) => setNewTreatmentPlan(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs focus:border-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">Internal Staff Notes (Hidden from Pet Owners)</label>
                <textarea
                  rows={2}
                  value={newNotes}
                  onChange={(e) => setNewNotes(e.target.value)}
                  placeholder="Behavior slightly aggressive when tail is touched. Recommend double staff handling."
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div className="flex items-center gap-2 bg-slate-50 rounded-xl p-3 border border-slate-100">
                <input
                  type="checkbox"
                  id="isVisibleToOwner"
                  checked={newIsVisibleToOwner}
                  onChange={(e) => setNewIsVisibleToOwner(e.target.checked)}
                  className="rounded border-slate-200 text-emerald-600 focus:ring-emerald-500 h-4 w-4"
                />
                <label htmlFor="isVisibleToOwner" className="text-xs font-semibold text-slate-700 select-none cursor-pointer">
                  Approve and publish this record for Owner view in their Client Portal
                </label>
              </div>

              <div className="flex gap-2 justify-end border-t border-slate-50 pt-4">
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="rounded-xl border border-slate-200 px-4 py-2 text-xs text-slate-500 hover:bg-slate-50 cursor-pointer"
                >
                  Discard Draft
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-emerald-600 px-4 py-2 text-xs font-semibold text-white hover:bg-emerald-700 cursor-pointer"
                >
                  Commit SOAP Record
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
