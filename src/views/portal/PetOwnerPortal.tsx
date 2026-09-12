/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useVeterinary } from '../../context/VeterinaryContext';
import {
  Heart,
  Calendar,
  Receipt,
  FileCheck,
  PlusCircle,
  Eye,
  ShieldAlert,
  Sparkles,
  ClipboardList,
  Clock,
  ExternalLink,
  Download,
  Loader2,
  AlertTriangle,
  CheckCircle2,
  ShieldCheck,
  Printer,
  ArrowRight,
  MessageSquare
} from 'lucide-react';
import { AppointmentType } from '../../types';
import { generatePetOwnerAdvice, AIPetAdvice } from '../../services/geminiService';

export const PetOwnerPortal: React.FC = () => {
  const {
    currentUser,
    users,
    pets,
    appointments,
    addAppointment,
    medicalRecords,
    vaccinations,
    prescriptions,
    invoices,
    addPaymentToInvoice
  } = useVeterinary();

  const [activeTab, setActiveTab] = useState<'my-pets' | 'appointments' | 'health-checks' | 'billing' | 'ai-advisor'>('my-pets');

  // Appointment scheduling for own pets in portal self service
  const [showBookModal, setShowBookModal] = useState(false);
  const [selectedPetId, setSelectedPetId] = useState('');
  const [bookType, setBookType] = useState<AppointmentType>('Consultation');
  const [bookDate, setBookDate] = useState(new Date().toISOString().split('T')[0]);
  const [bookTime, setBookTime] = useState('10:00');
  const [bookNotes, setBookNotes] = useState('');

  // Payment feedback
  const [payingBillId, setPayingBillId] = useState<string | null>(null);
  const [paymentNotice, setPaymentNotice] = useState<string | null>(null);

  // AI Pet Health Advisor state
  const [advisorPetId, setAdvisorPetId] = useState('');
  const [advisorSymptoms, setAdvisorSymptoms] = useState('');
  const [isConsultingAi, setIsConsultingAi] = useState(false);
  const [aiAdvice, setAiAdvice] = useState<AIPetAdvice | null>(null);

  // Filter entities to current logged-in client
  const clientOwnerId = currentUser?.clientId || currentUser?.id || '';

  const myPetsList = pets.filter(p => p.clientId === clientOwnerId);
  const myPetIds = myPetsList.map(p => p.id);

  const myAppointments = appointments.filter(a => myPetIds.includes(a.petId));
  const mySOAPRecords = medicalRecords.filter(r => myPetIds.includes(r.petId) && r.isVisibleToOwner);
  const myVaccines = vaccinations.filter(v => myPetIds.includes(v.petId));
  const myPrescriptions = prescriptions.filter(p => myPetIds.includes(p.petId));
  const myInvoices = invoices.filter(i => i.clientId === clientOwnerId);

  const handleBookAppointment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPetId || !bookDate || !bookTime) return;

    const availableVet = users.find(u => u.role === 'Veterinarian' || u.role === 'Admin');

    addAppointment({
      petId: selectedPetId,
      clientId: clientOwnerId,
      vetId: availableVet?.id || 'USR-ADMIN',
      date: bookDate,
      time: bookTime,
      type: bookType,
      notes: bookNotes || 'Self-service client appointment',
      status: 'Scheduled'
    });

    setSelectedPetId('');
    setBookNotes('');
    setShowBookModal(false);
  };

  const handlePortalQuickPayment = (invId: string) => {
    const billObj = invoices.find(i => i.id === invId);
    if (!billObj) return;
    const balance = billObj.totalAmount - billObj.paidAmount;
    addPaymentToInvoice(invId, balance, 'Credit Card', `AUTH-PORTAL-${Date.now().toString().slice(-6)}`);
    setPaymentNotice(`Payment of $${balance.toFixed(2)} for ${invId} successfully completed via secure online portal!`);
    setTimeout(() => setPaymentNotice(null), 5000);
  };

  const handleAskAiAdvisor = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!advisorSymptoms.trim()) return;

    const petObj = myPetsList.find(p => p.id === advisorPetId) || myPetsList[0];
    const petName = petObj ? petObj.name : 'Your Pet';
    const petSpecies = petObj ? petObj.species : 'Pet';

    setIsConsultingAi(true);
    try {
      const advice = await generatePetOwnerAdvice({
        petName,
        species: petSpecies,
        symptoms: advisorSymptoms
      });
      setAiAdvice(advice);
    } catch (err) {
      console.error(err);
    } finally {
      setIsConsultingAi(false);
    }
  };

  return (
    <div className="space-y-6 text-left animate-in fade-in duration-200 font-sans" id="pet-owner-portal-frame">
      {/* Payment Success Toast */}
      {paymentNotice && (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50/90 p-4 text-xs text-emerald-800 flex items-center gap-3 animate-in fade-in slide-in-from-top-2 duration-200 shadow-sm">
          <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />
          <span className="font-semibold">{paymentNotice}</span>
        </div>
      )}

      {/* Top Banner */}
      <div className="rounded-3xl bg-slate-900 border border-slate-800 p-6 sm:p-8 text-white relative overflow-hidden shadow-xl shadow-slate-900/10 animate-pulse-once">
        <div className="absolute top-0 right-0 h-44 w-44 rounded-full bg-emerald-500/10 blur-3xl -z-0" />
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="space-y-1.5">
            <span className="text-[9px] uppercase font-bold tracking-widest text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full font-mono">WellPet Client Self-Service Gateway</span>
            <h2 className="text-xl sm:text-2xl font-black font-display tracking-tight leading-none mt-2">Welcome Back, {currentUser?.name || 'Pet Owner'}!</h2>
            <p className="text-xs text-slate-400">Conveniently access immunization booster sheets, clinical diagnostics files, and payments.</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setActiveTab('ai-advisor')}
              className="flex items-center gap-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 px-3.5 py-2.5 text-xs font-bold text-white transition-colors cursor-pointer"
            >
              <Sparkles className="h-3.5 w-3.5 text-emerald-400" />
              <span>AI Health Advisor</span>
            </button>
            <button
              onClick={() => setShowBookModal(true)}
              className="flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-xs font-bold text-white hover:bg-emerald-500 shadow-md shadow-emerald-550/10 transition-colors cursor-pointer"
              id="portal-book-btn"
            >
              <PlusCircle className="h-4 w-4 stroke-[2.5]" />
              <span>Book Visit Online</span>
            </button>
          </div>
        </div>
      </div>

      {/* Tabs list slider */}
      <div className="flex border-b border-slate-200 overflow-x-auto gap-4">
        {[
          { key: 'my-pets', title: 'My Family Pets', icon: Heart },
          { key: 'appointments', title: 'Visits Schedule', icon: Calendar },
          { key: 'health-checks', title: 'Health Logs & SOAP', icon: FileCheck },
          { key: 'billing', title: 'Bills & Payments', icon: Receipt },
          { key: 'ai-advisor', title: 'AI Pet Health Advisor', icon: Sparkles }
        ].map((t) => {
          const isActive = activeTab === t.key;
          const Icon = t.icon;
          return (
            <button
              key={t.key}
              onClick={() => setActiveTab(t.key as any)}
              className={`flex items-center gap-2 pb-3.5 text-xs font-bold px-2 border-b-2 transition-all cursor-pointer ${
                isActive
                  ? 'border-emerald-600 text-emerald-800 font-bold'
                  : 'border-transparent text-slate-400 hover:text-slate-600'
              }`}
            >
              <Icon className="h-4 w-4" />
              <span>{t.title}</span>
            </button>
          );
        })}
      </div>

      {/* Content panes splits */}
      <div className="space-y-6">
        {activeTab === 'my-pets' && (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {myPetsList.length === 0 ? (
              <p className="col-span-full py-12 text-center text-slate-400 text-xs">No registered pets filed in WellPet systems.</p>
            ) : (
              myPetsList.map((pet) => (
                <div key={pet.id} className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm space-y-4">
                  <div className="flex justify-between items-start border-b border-slate-100 pb-3">
                    <div>
                      <h4 className="font-bold text-slate-900 text-sm">{pet.name}</h4>
                      <p className="text-[11px] text-slate-400 italic font-medium">{pet.species} | {pet.breed}</p>
                    </div>
                    <span className="rounded-md bg-emerald-50 text-emerald-700 font-mono text-[9px] font-bold px-1.5 uppercase">
                      ID: {pet.id}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-xs text-slate-600">
                    <div>
                      <span className="text-slate-400 uppercase text-[9px]">Gender</span>
                      <p className="font-semibold text-slate-700 mt-0.5">{pet.gender}</p>
                    </div>
                    <div>
                      <span className="text-slate-400 uppercase text-[9px]">Term / Age</span>
                      <p className="font-semibold text-slate-700 mt-0.5">{pet.age} Years</p>
                    </div>
                    <div>
                      <span className="text-slate-400 uppercase text-[9px]">Weight Record</span>
                      <p className="font-semibold text-slate-700 mt-0.5">{pet.weight} Kg</p>
                    </div>
                    <div>
                      <span className="text-slate-400 uppercase text-[9px]">Inoculation Count</span>
                      <p className="font-semibold text-slate-700 mt-0.5">
                        {myVaccines.filter(v => v.petId === pet.id).length} booster files
                      </p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === 'appointments' && (
          <div className="rounded-2xl border border-slate-100 bg-white shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/50 text-[10px] font-bold uppercase text-slate-400 tracking-wider">
                    <th className="px-5 py-3">Patient Pet</th>
                    <th className="px-5 py-3">Inbound date</th>
                    <th className="px-5 py-3">Time slot</th>
                    <th className="px-5 py-3">Visit Type</th>
                    <th className="px-5 py-3">Reason</th>
                    <th className="px-5 py-3 text-right">Queue status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-150">
                  {myAppointments.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-12 text-center text-slate-400">No scheduled appointments registered. Click "Book Visit Online" to schedule.</td>
                    </tr>
                  ) : (
                    myAppointments
                      .sort((a,b) => b.date.localeCompare(a.date))
                      .map((app) => (
                        <tr key={app.id} className="hover:bg-slate-50/40 transition-colors">
                          <td className="px-5 py-4 font-bold text-slate-800">
                            {pets.find(p => p.id === app.petId)?.name}
                          </td>
                          <td className="px-5 py-4 font-mono font-medium text-slate-700">{app.date}</td>
                          <td className="px-5 py-4 font-mono text-slate-600">{app.time}</td>
                          <td className="px-5 py-4 font-semibold text-slate-600">{app.type}</td>
                          <td className="px-5 py-4 italic text-slate-500">"{app.notes}"</td>
                          <td className="px-5 py-4 text-right">
                            <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider font-mono ${
                              app.status === 'Completed' ? 'bg-emerald-100 text-emerald-800' :
                              app.status === 'Cancelled' ? 'bg-rose-100 text-rose-800' :
                              'bg-indigo-100 text-indigo-800'
                            }`}>
                              {app.status}
                            </span>
                          </td>
                        </tr>
                      ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'health-checks' && (
          <div className="grid gap-6 md:grid-cols-2">
            {/* Active Immunization Boosters */}
            <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm space-y-4">
              <span className="text-xs font-bold text-slate-700 block border-b border-slate-50 pb-2">Immunization Record files</span>
              <div className="space-y-2.5">
                {myVaccines.length === 0 ? (
                  <p className="text-xs text-slate-400 text-center py-6">No booster files found.</p>
                ) : (
                  myVaccines.map(vac => (
                    <div key={vac.id} className="flex justify-between items-center p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs">
                      <div>
                        <strong className="text-slate-800 font-bold block">{pets.find(p => p.id === vac.petId)?.name} - {vac.vaccineName}</strong>
                        <span className="text-[10px] text-slate-400 block mt-0.5">Administered: {vac.dateAdministered} | Batch: {vac.batchNumber}</span>
                      </div>
                      <div className="text-right">
                        <span className="text-[9px] uppercase font-bold text-amber-700 block">Next Due:</span>
                        <strong className="text-amber-800 font-mono text-xs">{vac.nextDueDate}</strong>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Active prescriptions */}
            <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm space-y-4">
              <span className="text-xs font-bold text-slate-700 block border-b border-slate-50 pb-2">Active Prescriptions medication Rx</span>
              <div className="space-y-2.5">
                {myPrescriptions.length === 0 ? (
                  <p className="text-xs text-slate-400 text-center py-6">No active medication cycles.</p>
                ) : (
                  myPrescriptions.map(pres => (
                    <div key={pres.id} className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 text-xs text-left space-y-1">
                      <div className="flex justify-between items-start border-b border-slate-100 pb-1.5">
                        <strong className="font-bold text-slate-800">{pres.medicationName}</strong>
                        <span className={`inline-block text-[9px] font-bold px-1.5 py-0.5 rounded ${
                          pres.status === 'Active' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-600'
                        }`}>
                          {pres.status}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-1">Dosage instructions: <strong className="font-semibold text-slate-700">"{pres.dosage} {pres.frequency}"</strong></p>
                      <p className="text-[10px] text-slate-400 mt-0.5">Valid cycle period: {pres.startDate} to {pres.endDate}</p>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Shared Diagnoses SOAP Records */}
            <div className="col-span-full rounded-2xl border border-slate-100 bg-white p-5 shadow-sm space-y-4">
              <span className="text-xs font-bold text-slate-700 block border-b border-slate-50 pb-2">Released Medical Consultations Summaries</span>
              <div className="space-y-4">
                {mySOAPRecords.length === 0 ? (
                  <p className="text-xs text-slate-400 text-center py-8">No clinical cards published to owner portal view yet.</p>
                ) : (
                  mySOAPRecords.map(rec => (
                    <div key={rec.id} className="rounded-2xl border border-slate-150 p-4 space-y-3.5 text-xs text-left">
                      <div className="flex justify-between items-center border-b border-slate-50 pb-2">
                        <div>
                          <strong className="font-bold text-slate-800 text-sm">{pets.find(p => p.id === rec.petId)?.name}</strong>
                          <span className="text-[10px] text-slate-400 block mt-0.5 font-mono">Date: {rec.visitDate} | SOAP #{rec.id}</span>
                        </div>
                      </div>

                      <div className="grid gap-3 sm:grid-cols-2">
                        <div>
                          <span className="text-slate-400 block uppercase text-[9px]">Subjective Symptoms / Complaint</span>
                          <p className="text-slate-700 italic mt-0.5">"{rec.chiefComplaint}"</p>
                        </div>
                        <div>
                          <span className="text-slate-400 block uppercase text-[9px]">Diagnosed Clinical Assessment</span>
                          <p className="font-bold text-emerald-800 mt-0.5">{rec.diagnosis}</p>
                        </div>
                      </div>

                      <div className="bg-indigo-50/20 rounded-xl p-3 border border-indigo-100/30">
                        <span className="text-indigo-800 font-bold block mb-1 text-[10px] uppercase">Treatment Action Regulations Plan:</span>
                        <p className="text-slate-700 leading-relaxed font-semibold">{rec.treatmentPlan}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'billing' && (
          <div className="rounded-2xl border border-slate-100 bg-white shadow-sm overflow-hidden text-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/50 text-[10px] font-bold uppercase text-slate-400 tracking-wider">
                    <th className="px-5 py-3">Billing Invoice ID</th>
                    <th className="px-5 py-3">Date billing issued</th>
                    <th className="px-5 py-3">Total Cost ($)</th>
                    <th className="px-5 py-3">Paid Balance</th>
                    <th className="px-5 py-3">Term state</th>
                    <th className="px-5 py-3 text-right">Actions / settlements</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {myInvoices.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-12 text-center text-slate-400">No billing invoices filed.</td>
                    </tr>
                  ) : (
                    myInvoices.map((inv) => {
                      const balance = inv.totalAmount - inv.paidAmount;
                      const hasBalance = balance > 0;
                      return (
                        <tr key={inv.id} className="hover:bg-slate-50/40 transition-colors">
                          <td className="px-5 py-4 font-mono font-bold text-slate-800">{inv.id}</td>
                          <td className="px-5 py-4 font-mono text-slate-500">{inv.date}</td>
                          <td className="px-5 py-4 font-mono font-bold text-slate-700">${inv.totalAmount.toFixed(2)}</td>
                          <td className="px-5 py-4 font-mono text-slate-500">${inv.paidAmount.toFixed(2)}</td>
                          <td className="px-5 py-4">
                            <span className={`inline-block px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider font-mono ${
                              inv.status === 'Paid' ? 'bg-emerald-100 text-emerald-800 font-extrabold' : 'bg-amber-100 text-amber-800'
                            }`}>
                              {inv.status}
                            </span>
                          </td>
                          <td className="px-5 py-4 text-right">
                            {hasBalance ? (
                              <button
                                onClick={() => handlePortalQuickPayment(inv.id)}
                                className="rounded-xl bg-emerald-600 hover:bg-emerald-700 font-bold text-white px-3 py-1.5 text-xs cursor-pointer shadow-sm shadow-emerald-500/10"
                              >
                                Pay outstanding (${balance.toFixed(2)})
                              </button>
                            ) : (
                              <button
                                onClick={() => window.print()}
                                className="flex items-center gap-1 bg-slate-50 border border-slate-150 rounded px-2 py-1 text-slate-500 text-[11px] font-medium ml-auto cursor-pointer hover:bg-slate-100"
                              >
                                <Printer className="h-3 w-3" /> Print Receipt
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
        )}

        {activeTab === 'ai-advisor' && (
          <div className="space-y-6">
            <div className="rounded-2xl border border-slate-100 bg-white p-6 sm:p-7 shadow-sm space-y-5">
              <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
                <div className="h-10 w-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <Sparkles className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">AI Pet Health Advisor & Symptom Checker</h3>
                  <p className="text-xs text-slate-400">Powered by Gemini AI • Instant preliminary wellness guidance and triage instructions</p>
                </div>
              </div>

              <form onSubmit={handleAskAiAdvisor} className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                      Select Patient Pet
                    </label>
                    <select
                      value={advisorPetId}
                      onChange={(e) => setAdvisorPetId(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs bg-white focus:border-emerald-500 focus:outline-none"
                    >
                      <option value="">-- All / General Pet Inquiry --</option>
                      {myPetsList.map((pet) => (
                        <option key={pet.id} value={pet.id}>
                          {pet.name} ({pet.species} - {pet.breed})
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                      Quick Symptom Examples
                    </label>
                    <div className="flex flex-wrap gap-1.5 pt-0.5">
                      {[
                        'Persistent ear scratching',
                        'Mild loss of appetite',
                        'Occasional coughing',
                        'Stiffness after play'
                      ].map((prompt) => (
                        <button
                          key={prompt}
                          type="button"
                          onClick={() => setAdvisorSymptoms(prompt)}
                          className="rounded-lg bg-slate-50 border border-slate-200 px-2 py-1 text-[10px] text-slate-600 hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-200 transition-colors cursor-pointer"
                        >
                          {prompt}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                    Describe your pet's symptoms, behavior, or health question
                  </label>
                  <textarea
                    required
                    rows={3}
                    value={advisorSymptoms}
                    onChange={(e) => setAdvisorSymptoms(e.target.value)}
                    placeholder="e.g. Buddy has been shaking his head and scratching his right ear since yesterday after swimming at the park..."
                    className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-xs text-slate-800 placeholder:text-slate-400 focus:border-emerald-500 focus:outline-none"
                  />
                </div>

                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={isConsultingAi || !advisorSymptoms.trim()}
                    className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 px-5 py-2.5 text-xs font-bold text-white shadow-md shadow-emerald-600/20 hover:from-emerald-700 hover:to-teal-700 transition-all cursor-pointer disabled:opacity-40"
                  >
                    {isConsultingAi ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span>Analyzing Symptoms with Gemini...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="h-4 w-4" />
                        <span>Analyze & Get Recommendations</span>
                      </>
                    )}
                  </button>
                </div>
              </form>

              {aiAdvice && (
                <div className="mt-6 rounded-2xl border border-emerald-100 bg-emerald-50/40 p-5 space-y-4 animate-in fade-in duration-300">
                  <div className="flex items-center justify-between border-b border-emerald-100 pb-3">
                    <span className="text-xs font-bold text-slate-800 flex items-center gap-2">
                      <ShieldCheck className="h-4 w-4 text-emerald-600" />
                      Preliminary Clinical Triage
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        aiAdvice.urgency === 'Low'
                          ? 'bg-emerald-100 text-emerald-800'
                          : aiAdvice.urgency === 'Moderate'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-rose-100 text-rose-800'
                      }`}
                    >
                      Urgency Level: {aiAdvice.urgency}
                    </span>
                  </div>

                  <div>
                    <strong className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                      Assessment Overview
                    </strong>
                    <p className="text-xs text-slate-700 leading-relaxed font-medium">
                      {aiAdvice.assessment}
                    </p>
                  </div>

                  {aiAdvice.recommendations && aiAdvice.recommendations.length > 0 && (
                    <div>
                      <strong className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1.5">
                        Recommended Action Steps
                      </strong>
                      <ul className="space-y-1.5">
                        {aiAdvice.recommendations.map((rec, i) => (
                          <li key={i} className="flex items-start gap-2 text-xs text-slate-700">
                            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0 mt-0.5" />
                            <span>{rec}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-t border-emerald-100 pt-3">
                    <p className="text-[10px] text-slate-400 italic">
                      ⚠️ {aiAdvice.disclaimer}
                    </p>
                    <button
                      type="button"
                      onClick={() => {
                        setShowBookModal(true);
                        setBookNotes(advisorSymptoms);
                      }}
                      className="flex items-center gap-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white px-3.5 py-1.5 text-xs font-bold shadow-xs cursor-pointer shrink-0"
                    >
                      <span>Book Clinic Appointment</span>
                      <ArrowRight className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* PORTAL VISITS BOOKER MODAL */}
      {showBookModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-xl rounded-2xl bg-white p-6 shadow-2xl border border-slate-100 max-h-[85vh] overflow-y-auto">
            <h3 className="text-sm font-bold text-slate-800 border-b border-slate-100 pb-3">Schedule Veterinary Visit</h3>
            <form onSubmit={handleBookAppointment} className="mt-4 space-y-4">
              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">Select Family Pet</label>
                <select
                  required
                  value={selectedPetId}
                  onChange={(e) => setSelectedPetId(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs bg-white focus:border-emerald-500 focus:outline-none"
                >
                  <option value="">-- Choose target Pet --</option>
                  {myPetsList.map(pet => (
                    <option key={pet.id} value={pet.id}>{pet.name} ({pet.species})</option>
                  ))}
                </select>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">Service Type Ordered</label>
                  <select
                    value={bookType}
                    onChange={(e) => setBookType(e.target.value as AppointmentType)}
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs bg-white focus:outline-none"
                  >
                    <option value="Consultation">General Consultation</option>
                    <option value="Vaccination">Inoculation Injections / Booster</option>
                    <option value="Follow-Up">Follow-Up Check</option>
                    <option value="Grooming">Shed Grooming</option>
                  </select>
                </div>

                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">Visitation Date Target</label>
                  <input
                    type="date"
                    required
                    value={bookDate}
                    onChange={(e) => setBookDate(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs focus:outline-none font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">Target Booking Time</label>
                <input
                  type="time"
                  required
                  value={bookTime}
                  onChange={(e) => setBookTime(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs focus:outline-none font-mono"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">Brief Description of Symptoms / request</label>
                <textarea
                  rows={2}
                  value={bookNotes}
                  onChange={(e) => setBookNotes(e.target.value)}
                  placeholder="Need core vaccines boosters. Occasional minor scratching ears..."
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs focus:outline-none"
                />
              </div>

              <div className="flex gap-2 justify-end border-t border-slate-50 pt-4">
                <button
                  type="button"
                  onClick={() => setShowBookModal(false)}
                  className="rounded-xl border border-slate-200 px-4 py-2 text-xs text-slate-500 hover:bg-slate-50 cursor-pointer"
                >
                  Discard Booking
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-emerald-600 px-4 py-2 text-xs font-semibold text-white hover:bg-emerald-700 cursor-pointer"
                >
                  Confirm Reservation Request
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
