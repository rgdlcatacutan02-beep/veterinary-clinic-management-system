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
  Printer,
  ArrowRight,
  LayoutDashboard,
  Users,
  Activity,
  FileSpreadsheet,
  Shield,
  Clock,
  CheckCircle2,
  AlertTriangle,
  ShieldCheck,
  Filter,
  DollarSign,
  Pill,
  Syringe,
  Info
} from 'lucide-react';
import { AppointmentType } from '../../types';

export interface PetOwnerPortalProps {
  currentTab?: string;
  onTabChange?: (tab: string) => void;
}

export type OwnerTabKey =
  | 'owner-dashboard'
  | 'owner-pets'
  | 'owner-appointments'
  | 'owner-history'
  | 'owner-prescriptions'
  | 'owner-vaccinations'
  | 'owner-billing';

export const PetOwnerPortal: React.FC<PetOwnerPortalProps> = ({ currentTab, onTabChange }) => {
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

  // Selected pet filter for sub-views
  const [filterPetId, setFilterPetId] = useState<string>('all');

  // Appointment scheduling for own pets in portal self service
  const [showBookModal, setShowBookModal] = useState(false);
  const [selectedPetId, setSelectedPetId] = useState('');
  const [bookType, setBookType] = useState<AppointmentType>('Consultation');
  const [bookDate, setBookDate] = useState(new Date().toISOString().split('T')[0]);
  const [bookTime, setBookTime] = useState('10:00');
  const [bookNotes, setBookNotes] = useState('');

  // Payment feedback
  const [paymentNotice, setPaymentNotice] = useState<string | null>(null);

  // Active tab synchronized with App.tsx & Sidebar
  const activeTab: OwnerTabKey = (currentTab as OwnerTabKey) || 'owner-dashboard';

  const switchTab = (tab: OwnerTabKey) => {
    onTabChange?.(tab);
  };

  // Filter entities to current logged-in client
  const clientOwnerId = currentUser?.clientId || currentUser?.id || '';
  const myPetsList = pets.filter(p => p.clientId === clientOwnerId);
  const myPetIds = myPetsList.map(p => p.id);

  const myAppointments = appointments.filter(a => myPetIds.includes(a.petId));
  const mySOAPRecords = medicalRecords.filter(r => myPetIds.includes(r.petId) && r.isVisibleToOwner);
  const myVaccines = vaccinations.filter(v => myPetIds.includes(v.petId));
  const myPrescriptions = prescriptions.filter(p => myPetIds.includes(p.petId));
  const myInvoices = invoices.filter(i => i.clientId === clientOwnerId);

  // Filtered views by selected pet
  const filteredAppointments = filterPetId === 'all'
    ? myAppointments
    : myAppointments.filter(a => a.petId === filterPetId);

  const filteredSOAPRecords = filterPetId === 'all'
    ? mySOAPRecords
    : mySOAPRecords.filter(r => r.petId === filterPetId);

  const filteredVaccines = filterPetId === 'all'
    ? myVaccines
    : myVaccines.filter(v => v.petId === filterPetId);

  const filteredPrescriptions = filterPetId === 'all'
    ? myPrescriptions
    : myPrescriptions.filter(p => p.petId === filterPetId);

  // Summary Metrics
  const upcomingAppointments = myAppointments.filter(a => a.status === 'Scheduled');
  const activePrescriptionsCount = myPrescriptions.filter(p => p.status === 'Active').length;
  const unpaidBalance = myInvoices.reduce((sum, inv) => sum + (inv.totalAmount - inv.paidAmount), 0);
  const nextVaccineDue = [...myVaccines]
    .filter(v => v.nextDueDate)
    .sort((a, b) => a.nextDueDate.localeCompare(b.nextDueDate))[0];

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
    switchTab('owner-appointments');
  };

  const handlePortalQuickPayment = (invId: string) => {
    const billObj = invoices.find(i => i.id === invId);
    if (!billObj) return;
    const balance = billObj.totalAmount - billObj.paidAmount;
    addPaymentToInvoice(invId, balance, 'Credit Card', `AUTH-PORTAL-${Date.now().toString().slice(-6)}`);
    setPaymentNotice(`Payment of $${balance.toFixed(2)} for ${invId} successfully completed via secure online portal!`);
    setTimeout(() => setPaymentNotice(null), 5000);
  };

  const tabsConfig = [
    { key: 'owner-dashboard', title: 'Dashboard', icon: LayoutDashboard },
    { key: 'owner-pets', title: 'My Registered Pets', icon: Heart },
    { key: 'owner-appointments', title: 'Visits Schedule', icon: Calendar },
    { key: 'owner-history', title: 'Medical Timeline', icon: Activity },
    { key: 'owner-prescriptions', title: 'Prescriptions (RX)', icon: FileSpreadsheet },
    { key: 'owner-vaccinations', title: 'Booster Certs', icon: Shield },
    { key: 'owner-billing', title: 'Bills & Payments', icon: Receipt }
  ];

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
      <div className="rounded-3xl bg-slate-900 border border-slate-800 p-6 sm:p-8 text-white relative overflow-hidden shadow-xl shadow-slate-900/10">
        <div className="absolute top-0 right-0 h-44 w-44 rounded-full bg-emerald-500/10 blur-3xl -z-0" />
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="space-y-1.5">
            <span className="text-[9px] uppercase font-bold tracking-widest text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full font-mono">
              WellPet Client Self-Service Gateway
            </span>
            <h2 className="text-xl sm:text-2xl font-black font-display tracking-tight leading-none mt-2">
              Welcome Back, {currentUser?.name || 'Pet Owner'}!
            </h2>
            <p className="text-xs text-slate-400">
              Conveniently access medical histories, active prescriptions, immunization booster sheets, and online payments.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setShowBookModal(true)}
              className="flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-xs font-bold text-white hover:bg-emerald-500 shadow-md shadow-emerald-500/20 transition-colors cursor-pointer"
              id="portal-book-btn"
            >
              <PlusCircle className="h-4 w-4 stroke-[2.5]" />
              <span>Book Visit Online</span>
            </button>
          </div>
        </div>
      </div>

      {/* Horizontal Tabs List */}
      <div className="flex border-b border-slate-200 overflow-x-auto gap-2 sm:gap-4 no-scrollbar pb-px">
        {tabsConfig.map((t) => {
          const isActive = activeTab === t.key;
          const Icon = t.icon;
          return (
            <button
              key={t.key}
              onClick={() => switchTab(t.key as OwnerTabKey)}
              className={`flex items-center gap-2 pb-3 text-xs font-bold px-2.5 border-b-2 transition-all cursor-pointer whitespace-nowrap ${
                isActive
                  ? 'border-emerald-600 text-emerald-800 font-bold'
                  : 'border-transparent text-slate-400 hover:text-slate-600'
              }`}
            >
              <Icon className={`h-4 w-4 ${isActive ? 'text-emerald-600' : 'text-slate-400'}`} />
              <span>{t.title}</span>
            </button>
          );
        })}
      </div>

      {/* Pet Filter selector for relevant sub-views */}
      {['owner-appointments', 'owner-history', 'owner-prescriptions', 'owner-vaccinations'].includes(activeTab) && (
        <div className="flex items-center justify-between bg-white border border-slate-100 rounded-xl px-4 py-2.5 shadow-2xs">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-700">
            <Filter className="h-3.5 w-3.5 text-slate-400" />
            <span>Filter by Family Pet:</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setFilterPetId('all')}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                filterPetId === 'all'
                  ? 'bg-emerald-100 text-emerald-800 font-bold'
                  : 'text-slate-500 hover:bg-slate-100'
              }`}
            >
              All Pets ({myPetsList.length})
            </button>
            {myPetsList.map(pet => (
              <button
                key={pet.id}
                onClick={() => setFilterPetId(pet.id)}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                  filterPetId === pet.id
                    ? 'bg-emerald-100 text-emerald-800 font-bold'
                    : 'text-slate-500 hover:bg-slate-100'
                }`}
              >
                {pet.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* VIEW CONTENT BY TAB */}
      <div className="space-y-6">

        {/* 1. DASHBOARD OVERVIEW */}
        {activeTab === 'owner-dashboard' && (
          <div className="space-y-6">
            {/* Metric KPI Cards */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div
                onClick={() => switchTab('owner-pets')}
                className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm hover:border-emerald-200 transition-all cursor-pointer group"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Family Pets</span>
                  <div className="h-9 w-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:scale-105 transition-transform">
                    <Heart className="h-4.5 w-4.5" />
                  </div>
                </div>
                <div className="mt-3">
                  <span className="text-2xl font-black text-slate-900">{myPetsList.length}</span>
                  <p className="text-[11px] text-slate-500 mt-0.5">Registered in clinic system</p>
                </div>
              </div>

              <div
                onClick={() => switchTab('owner-appointments')}
                className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm hover:border-indigo-200 transition-all cursor-pointer group"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Upcoming Visits</span>
                  <div className="h-9 w-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center group-hover:scale-105 transition-transform">
                    <Calendar className="h-4.5 w-4.5" />
                  </div>
                </div>
                <div className="mt-3">
                  <span className="text-2xl font-black text-slate-900">{upcomingAppointments.length}</span>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    {upcomingAppointments[0] ? `Next: ${upcomingAppointments[0].date}` : 'No upcoming visits'}
                  </p>
                </div>
              </div>

              <div
                onClick={() => switchTab('owner-prescriptions')}
                className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm hover:border-teal-200 transition-all cursor-pointer group"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Active Prescriptions</span>
                  <div className="h-9 w-9 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center group-hover:scale-105 transition-transform">
                    <FileSpreadsheet className="h-4.5 w-4.5" />
                  </div>
                </div>
                <div className="mt-3">
                  <span className="text-2xl font-black text-slate-900">{activePrescriptionsCount}</span>
                  <p className="text-[11px] text-slate-500 mt-0.5">Current medication cycles</p>
                </div>
              </div>

              <div
                onClick={() => switchTab('owner-billing')}
                className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm hover:border-amber-200 transition-all cursor-pointer group"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Balance Due</span>
                  <div className="h-9 w-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center group-hover:scale-105 transition-transform">
                    <DollarSign className="h-4.5 w-4.5" />
                  </div>
                </div>
                <div className="mt-3">
                  <span className={`text-2xl font-black ${unpaidBalance > 0 ? 'text-amber-600' : 'text-emerald-600'}`}>
                    ${unpaidBalance.toFixed(2)}
                  </span>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    {unpaidBalance > 0 ? 'Pending settlement' : 'All accounts paid in full'}
                  </p>
                </div>
              </div>
            </div>

            {/* Quick Links & Pet Cards Summary */}
            <div className="grid gap-6 lg:grid-cols-3">
              <div className="lg:col-span-2 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <Heart className="h-4 w-4 text-emerald-600" />
                    <span>My Registered Pets</span>
                  </h3>
                  <button
                    onClick={() => switchTab('owner-pets')}
                    className="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 cursor-pointer"
                  >
                    <span>View All Profiles</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </button>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  {myPetsList.map((pet) => (
                    <div
                      key={pet.id}
                      className="rounded-2xl border border-slate-100 bg-white p-5 shadow-xs space-y-3 hover:shadow-sm transition-shadow"
                    >
                      <div className="flex justify-between items-start border-b border-slate-100 pb-2.5">
                        <div>
                          <h4 className="font-bold text-slate-900 text-sm">{pet.name}</h4>
                          <p className="text-[11px] text-slate-400 italic">{pet.species} • {pet.breed}</p>
                        </div>
                        <span className="rounded-md bg-emerald-50 text-emerald-700 font-mono text-[9px] font-bold px-1.5 py-0.5">
                          ID: {pet.id}
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-xs text-slate-600">
                        <div>
                          <span className="text-slate-400 text-[9px] uppercase">Age / Gender</span>
                          <p className="font-semibold text-slate-700">{pet.age} Yrs • {pet.gender}</p>
                        </div>
                        <div>
                          <span className="text-slate-400 text-[9px] uppercase">Weight</span>
                          <p className="font-semibold text-slate-700">{pet.weight} kg</p>
                        </div>
                      </div>
                      <div className="flex gap-2 pt-1 border-t border-slate-50">
                        <button
                          onClick={() => {
                            switchTab('owner-prescriptions');
                            setFilterPetId(pet.id);
                          }}
                          className="flex-1 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-600 text-[11px] font-semibold py-1.5 text-center transition-colors cursor-pointer"
                        >
                          View Rx
                        </button>
                        <button
                          onClick={() => {
                            switchTab('owner-vaccinations');
                            setFilterPetId(pet.id);
                          }}
                          className="flex-1 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-600 text-[11px] font-semibold py-1.5 text-center transition-colors cursor-pointer"
                        >
                          Booster Certs
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Sidebar Quick Action Card */}
              <div className="space-y-4">
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4 text-emerald-600" />
                  <span>Clinical Quick Actions</span>
                </h3>
                <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-xs space-y-3">
                  <button
                    onClick={() => setShowBookModal(true)}
                    className="w-full flex items-center justify-between p-3 rounded-xl bg-emerald-50 text-emerald-800 hover:bg-emerald-100 transition-colors text-left cursor-pointer"
                  >
                    <div>
                      <strong className="block text-xs font-bold">Schedule Clinic Visit</strong>
                      <span className="text-[10px] text-emerald-600">Book doctor consultation online</span>
                    </div>
                    <Calendar className="h-4 w-4 text-emerald-600" />
                  </button>

                  <button
                    onClick={() => switchTab('owner-history')}
                    className="w-full flex items-center justify-between p-3 rounded-xl bg-slate-50 text-slate-800 hover:bg-slate-100 transition-colors text-left cursor-pointer"
                  >
                    <div>
                      <strong className="block text-xs font-bold">Medical SOAP Notes</strong>
                      <span className="text-[10px] text-slate-500">View released diagnosis records</span>
                    </div>
                    <Activity className="h-4 w-4 text-indigo-600" />
                  </button>

                  <button
                    onClick={() => switchTab('owner-prescriptions')}
                    className="w-full flex items-center justify-between p-3 rounded-xl bg-slate-50 text-slate-800 hover:bg-slate-100 transition-colors text-left cursor-pointer"
                  >
                    <div>
                      <strong className="block text-xs font-bold">Medications & Prescriptions</strong>
                      <span className="text-[10px] text-slate-500">Check dosage instructions</span>
                    </div>
                    <Pill className="h-4 w-4 text-teal-600" />
                  </button>

                  {nextVaccineDue && (
                    <div className="p-3 rounded-xl bg-amber-50/70 border border-amber-200/60 text-xs text-amber-900 space-y-1">
                      <div className="flex items-center gap-1.5 font-bold text-[11px] text-amber-800">
                        <AlertTriangle className="h-3.5 w-3.5 text-amber-600" />
                        <span>Upcoming Booster Due</span>
                      </div>
                      <p className="text-[11px] text-amber-700">
                        {pets.find(p => p.id === nextVaccineDue.petId)?.name}'s {nextVaccineDue.vaccineName} is due on {nextVaccineDue.nextDueDate}.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 2. MY REGISTERED PETS */}
        {activeTab === 'owner-pets' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Family Pets Directory</h3>
                <p className="text-xs text-slate-400">Complete medical registry and biological profiles of your pets</p>
              </div>
              <button
                onClick={() => setShowBookModal(true)}
                className="flex items-center gap-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1.5 text-xs font-bold cursor-pointer"
              >
                <PlusCircle className="h-3.5 w-3.5" />
                <span>Book Appointment</span>
              </button>
            </div>

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {myPetsList.length === 0 ? (
                <p className="col-span-full py-12 text-center text-slate-400 text-xs">No registered pets filed in WellPet systems.</p>
              ) : (
                myPetsList.map((pet) => {
                  const petVaccines = myVaccines.filter(v => v.petId === pet.id);
                  const petPrescriptions = myPrescriptions.filter(p => p.petId === pet.id && p.status === 'Active');
                  const petRecords = mySOAPRecords.filter(r => r.petId === pet.id);

                  return (
                    <div key={pet.id} className="rounded-2xl border border-slate-100 bg-white p-5 shadow-xs space-y-4 text-xs">
                      <div className="flex justify-between items-start border-b border-slate-100 pb-3">
                        <div>
                          <h4 className="font-bold text-slate-900 text-base">{pet.name}</h4>
                          <p className="text-xs text-slate-400 italic font-medium">{pet.species} | {pet.breed}</p>
                        </div>
                        <span className="rounded-md bg-emerald-50 text-emerald-700 font-mono text-[10px] font-bold px-2 py-0.5">
                          ID: {pet.id}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-3 text-slate-600">
                        <div>
                          <span className="text-slate-400 uppercase text-[9px] block">Gender</span>
                          <p className="font-semibold text-slate-800 mt-0.5">{pet.gender}</p>
                        </div>
                        <div>
                          <span className="text-slate-400 uppercase text-[9px] block">Age</span>
                          <p className="font-semibold text-slate-800 mt-0.5">{pet.age} Years</p>
                        </div>
                        <div>
                          <span className="text-slate-400 uppercase text-[9px] block">Current Weight</span>
                          <p className="font-semibold text-slate-800 mt-0.5">{pet.weight} kg</p>
                        </div>
                        <div>
                          <span className="text-slate-400 uppercase text-[9px] block">Microchip ID</span>
                          <p className="font-mono text-[11px] text-slate-700 mt-0.5">{pet.microchipId || 'None registered'}</p>
                        </div>
                      </div>

                      <div className="rounded-xl bg-slate-50 p-3 space-y-1.5 border border-slate-100">
                        <div className="flex justify-between text-[11px]">
                          <span className="text-slate-500">Inoculations:</span>
                          <span className="font-bold text-slate-800">{petVaccines.length} recorded</span>
                        </div>
                        <div className="flex justify-between text-[11px]">
                          <span className="text-slate-500">Active Prescriptions:</span>
                          <span className="font-bold text-emerald-700">{petPrescriptions.length} active</span>
                        </div>
                        <div className="flex justify-between text-[11px]">
                          <span className="text-slate-500">Medical Visits:</span>
                          <span className="font-bold text-slate-800">{petRecords.length} visits</span>
                        </div>
                      </div>

                      <div className="flex gap-2 pt-2 border-t border-slate-100">
                        <button
                          onClick={() => {
                            switchTab('owner-prescriptions');
                            setFilterPetId(pet.id);
                          }}
                          className="flex-1 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold py-2 text-center transition-colors cursor-pointer"
                        >
                          Prescriptions
                        </button>
                        <button
                          onClick={() => {
                            switchTab('owner-vaccinations');
                            setFilterPetId(pet.id);
                          }}
                          className="flex-1 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold py-2 text-center transition-colors cursor-pointer"
                        >
                          Boosters
                        </button>
                        <button
                          onClick={() => {
                            setSelectedPetId(pet.id);
                            setShowBookModal(true);
                          }}
                          className="rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-2 text-xs font-semibold transition-colors cursor-pointer"
                          title="Book Visit"
                        >
                          Book
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}

        {/* 3. VISITS & APPOINTMENTS SCHEDULE */}
        {activeTab === 'owner-appointments' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Visits & Appointments Schedule</h3>
                <p className="text-xs text-slate-400">View upcoming reservations and historical clinic appointments</p>
              </div>
              <button
                onClick={() => setShowBookModal(true)}
                className="flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2 text-xs font-bold text-white hover:bg-emerald-500 shadow-sm transition-colors cursor-pointer"
              >
                <PlusCircle className="h-4 w-4" />
                <span>Book Visit Online</span>
              </button>
            </div>

            <div className="rounded-2xl border border-slate-100 bg-white shadow-xs overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-100 bg-slate-50/50 text-[10px] font-bold uppercase text-slate-400 tracking-wider">
                      <th className="px-5 py-3">Patient Pet</th>
                      <th className="px-5 py-3">Date</th>
                      <th className="px-5 py-3">Time</th>
                      <th className="px-5 py-3">Visit Type</th>
                      <th className="px-5 py-3">Reason / Notes</th>
                      <th className="px-5 py-3 text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredAppointments.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="py-12 text-center text-slate-400">
                          No scheduled appointments found. Click "Book Visit Online" to schedule a visit!
                        </td>
                      </tr>
                    ) : (
                      filteredAppointments
                        .sort((a, b) => b.date.localeCompare(a.date))
                        .map((app) => (
                          <tr key={app.id} className="hover:bg-slate-50/40 transition-colors">
                            <td className="px-5 py-4 font-bold text-slate-800">
                              {pets.find(p => p.id === app.petId)?.name}
                            </td>
                            <td className="px-5 py-4 font-mono font-medium text-slate-700">{app.date}</td>
                            <td className="px-5 py-4 font-mono text-slate-600">{app.time}</td>
                            <td className="px-5 py-4 font-semibold text-slate-700">{app.type}</td>
                            <td className="px-5 py-4 italic text-slate-500 max-w-xs truncate">"{app.notes}"</td>
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
          </div>
        )}

        {/* 4. MEDICAL TIMELINE (SOAP RECORDS) */}
        {activeTab === 'owner-history' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Medical Timeline & Clinical Consultations</h3>
                <p className="text-xs text-slate-400">Official veterinary SOAP consultation summaries released for client review</p>
              </div>
              <button
                onClick={() => window.print()}
                className="flex items-center gap-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 px-3 py-1.5 rounded-xl text-xs font-semibold cursor-pointer"
              >
                <Printer className="h-3.5 w-3.5" />
                <span>Print Medical Records</span>
              </button>
            </div>

            <div className="space-y-4">
              {filteredSOAPRecords.length === 0 ? (
                <div className="rounded-2xl border border-slate-100 bg-white p-12 text-center text-slate-400 text-xs">
                  No released medical records found for the selected pet.
                </div>
              ) : (
                filteredSOAPRecords.map((rec) => {
                  const petObj = pets.find(p => p.id === rec.petId);
                  const vetObj = users.find(u => u.id === rec.vetId);

                  return (
                    <div key={rec.id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs space-y-4 text-xs">
                      <div className="flex flex-wrap justify-between items-start border-b border-slate-100 pb-3 gap-2">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-slate-900 text-sm">{petObj?.name}</span>
                            <span className="text-[10px] text-slate-400">({petObj?.species} - {petObj?.breed})</span>
                          </div>
                          <p className="text-[11px] text-slate-500 mt-0.5">
                            Attending Vet: <strong className="text-slate-700">{vetObj?.name || 'Dr. Robert Taylor'}</strong>
                          </p>
                        </div>
                        <div className="text-right">
                          <span className="rounded-md bg-indigo-50 text-indigo-700 font-mono text-[10px] font-bold px-2 py-0.5 block">
                            SOAP #{rec.id}
                          </span>
                          <span className="text-[10px] font-mono text-slate-400 mt-0.5 block">Visit Date: {rec.visitDate}</span>
                        </div>
                      </div>

                      <div className="grid gap-3 sm:grid-cols-2">
                        <div className="bg-slate-50 rounded-xl p-3 border border-slate-100">
                          <span className="text-slate-400 block uppercase text-[9px] font-bold tracking-wider">Chief Complaint / Symptoms</span>
                          <p className="text-slate-700 italic mt-1 leading-relaxed">"{rec.chiefComplaint}"</p>
                        </div>
                        <div className="bg-emerald-50/50 rounded-xl p-3 border border-emerald-100">
                          <span className="text-emerald-700 block uppercase text-[9px] font-bold tracking-wider">Clinical Assessment & Diagnosis</span>
                          <p className="font-bold text-emerald-900 mt-1 leading-relaxed">{rec.diagnosis}</p>
                        </div>
                      </div>

                      {rec.objective && (
                        <div className="bg-slate-50 rounded-xl p-3 border border-slate-100">
                          <span className="text-slate-400 block uppercase text-[9px] font-bold tracking-wider">Veterinarian Objective Findings</span>
                          <p className="text-slate-700 mt-1 leading-relaxed">{rec.objective}</p>
                        </div>
                      )}

                      <div className="bg-indigo-50/40 rounded-xl p-3.5 border border-indigo-100">
                        <span className="text-indigo-800 font-bold block mb-1 text-[10px] uppercase tracking-wider">Prescribed Treatment & Care Plan</span>
                        <p className="text-slate-700 leading-relaxed font-medium">{rec.treatmentPlan}</p>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}

        {/* 5. DEDICATED PRESCRIPTIONS (RX) VIEW */}
        {activeTab === 'owner-prescriptions' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <FileSpreadsheet className="h-4 w-4 text-emerald-600" />
                  <span>Prescriptions & Medications Tracker (RX)</span>
                </h3>
                <p className="text-xs text-slate-400">Current and completed medication cycles, dosage instructions, and refill schedules</p>
              </div>
              <button
                onClick={() => window.print()}
                className="flex items-center gap-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 px-3 py-1.5 rounded-xl text-xs font-semibold cursor-pointer"
              >
                <Printer className="h-3.5 w-3.5" />
                <span>Print Prescription Slip</span>
              </button>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {filteredPrescriptions.length === 0 ? (
                <div className="col-span-full rounded-2xl border border-slate-100 bg-white p-12 text-center text-slate-400 text-xs">
                  No active or historical prescriptions found for the selected pet.
                </div>
              ) : (
                filteredPrescriptions.map((pres) => {
                  const petObj = pets.find(p => p.id === pres.petId);
                  const vetObj = users.find(u => u.id === pres.vetId);
                  const isActive = pres.status === 'Active';

                  return (
                    <div
                      key={pres.id}
                      className={`rounded-2xl border bg-white p-5 shadow-xs space-y-3 text-xs ${
                        isActive ? 'border-emerald-200 ring-1 ring-emerald-100' : 'border-slate-200'
                      }`}
                    >
                      <div className="flex justify-between items-start border-b border-slate-100 pb-2.5">
                        <div>
                          <h4 className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                            <Pill className="h-3.5 w-3.5 text-emerald-600" />
                            <span>{pres.medicationName}</span>
                          </h4>
                          <span className="text-[10px] text-slate-400 font-medium">
                            Patient: <strong className="text-slate-700">{petObj?.name}</strong>
                          </span>
                        </div>
                        <span className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded-full font-mono ${
                          isActive ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-600'
                        }`}>
                          {pres.status}
                        </span>
                      </div>

                      <div className="space-y-2 text-slate-600">
                        <div className="bg-slate-50 rounded-xl p-3 border border-slate-100">
                          <span className="text-slate-400 text-[9px] uppercase font-bold tracking-wider block">Dosage & Instructions</span>
                          <p className="font-bold text-slate-800 text-xs mt-0.5">"{pres.dosage} - {pres.frequency}"</p>
                        </div>

                        <div className="grid grid-cols-2 gap-2 text-[11px] pt-1">
                          <div>
                            <span className="text-slate-400 text-[9px] uppercase block">Cycle Start</span>
                            <span className="font-mono text-slate-700">{pres.startDate}</span>
                          </div>
                          <div>
                            <span className="text-slate-400 text-[9px] uppercase block">Cycle End</span>
                            <span className="font-mono text-slate-700">{pres.endDate}</span>
                          </div>
                        </div>

                        <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-400">
                          <span>Prescribed by: {vetObj?.name || 'Veterinarian'}</span>
                          <span className="font-mono">Ref: {pres.id}</span>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}

        {/* 6. DEDICATED BOOSTER CERTS & VACCINATIONS VIEW */}
        {activeTab === 'owner-vaccinations' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Shield className="h-4 w-4 text-emerald-600" />
                  <span>Immunization & Booster Certificates</span>
                </h3>
                <p className="text-xs text-slate-400">Official vaccination health passport, inoculation batches, and upcoming due dates</p>
              </div>
              <button
                onClick={() => window.print()}
                className="flex items-center gap-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 px-3 py-1.5 rounded-xl text-xs font-semibold cursor-pointer"
              >
                <Printer className="h-3.5 w-3.5" />
                <span>Print Vaccine Passport</span>
              </button>
            </div>

            <div className="rounded-2xl border border-slate-100 bg-white shadow-xs overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-100 bg-slate-50/50 text-[10px] font-bold uppercase text-slate-400 tracking-wider">
                      <th className="px-5 py-3">Patient Pet</th>
                      <th className="px-5 py-3">Vaccine / Inoculation</th>
                      <th className="px-5 py-3">Administered Date</th>
                      <th className="px-5 py-3">Batch Number</th>
                      <th className="px-5 py-3">Next Due Date</th>
                      <th className="px-5 py-3 text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredVaccines.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="py-12 text-center text-slate-400">
                          No immunization records found for the selected pet.
                        </td>
                      </tr>
                    ) : (
                      filteredVaccines
                        .sort((a, b) => b.dateAdministered.localeCompare(a.dateAdministered))
                        .map((vac) => {
                          const petObj = pets.find(p => p.id === vac.petId);
                          const isOverdue = vac.nextDueDate && new Date(vac.nextDueDate) < new Date();

                          return (
                            <tr key={vac.id} className="hover:bg-slate-50/40 transition-colors">
                              <td className="px-5 py-4 font-bold text-slate-800">
                                {petObj?.name}
                              </td>
                              <td className="px-5 py-4">
                                <div className="flex items-center gap-1.5">
                                  <Syringe className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                                  <strong className="text-slate-800">{vac.vaccineName}</strong>
                                </div>
                              </td>
                              <td className="px-5 py-4 font-mono text-slate-600">{vac.dateAdministered}</td>
                              <td className="px-5 py-4 font-mono text-slate-500">{vac.batchNumber}</td>
                              <td className="px-5 py-4 font-mono font-bold text-slate-700">{vac.nextDueDate}</td>
                              <td className="px-5 py-4 text-right">
                                <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider font-mono ${
                                  isOverdue
                                    ? 'bg-rose-100 text-rose-800'
                                    : 'bg-emerald-100 text-emerald-800'
                                }`}>
                                  {isOverdue ? 'Overdue' : 'Up to Date'}
                                </span>
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

        {/* 7. BILLING & RECEIPTS */}
        {activeTab === 'owner-billing' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Bills & Online Payments</h3>
                <p className="text-xs text-slate-400">Review itemized invoices, settle outstanding balances, and access payment receipts</p>
              </div>
              <button
                onClick={() => window.print()}
                className="flex items-center gap-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 px-3 py-1.5 rounded-xl text-xs font-semibold cursor-pointer"
              >
                <Printer className="h-3.5 w-3.5" />
                <span>Print Ledger</span>
              </button>
            </div>

            <div className="rounded-2xl border border-slate-100 bg-white shadow-xs overflow-hidden text-xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-slate-100 bg-slate-50/50 text-[10px] font-bold uppercase text-slate-400 tracking-wider">
                      <th className="px-5 py-3">Invoice ID</th>
                      <th className="px-5 py-3">Date Issued</th>
                      <th className="px-5 py-3">Total Cost</th>
                      <th className="px-5 py-3">Paid Amount</th>
                      <th className="px-5 py-3">Status</th>
                      <th className="px-5 py-3 text-right">Settlement</th>
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
                              <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider font-mono ${
                                inv.status === 'Paid' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                              }`}>
                                {inv.status}
                              </span>
                            </td>
                            <td className="px-5 py-4 text-right">
                              {hasBalance ? (
                                <button
                                  onClick={() => handlePortalQuickPayment(inv.id)}
                                  className="rounded-xl bg-emerald-600 hover:bg-emerald-700 font-bold text-white px-3 py-1.5 text-xs cursor-pointer shadow-xs transition-colors"
                                >
                                  Pay Balance (${balance.toFixed(2)})
                                </button>
                              ) : (
                                <button
                                  onClick={() => window.print()}
                                  className="flex items-center gap-1 bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1 text-slate-600 text-[11px] font-medium ml-auto cursor-pointer hover:bg-slate-100"
                                >
                                  <Printer className="h-3 w-3" />
                                  <span>Receipt</span>
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

              <div className="grid gap-3 sm:grid-cols-2">
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

                <div className="flex items-center text-[11px] text-slate-400 pt-4">
                  <Info className="h-4 w-4 text-emerald-500 mr-1.5 shrink-0" />
                  <span>Clinic hours: 8:00 AM - 6:00 PM</span>
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">Brief Description of Symptoms / Request</label>
                <textarea
                  rows={2}
                  value={bookNotes}
                  onChange={(e) => setBookNotes(e.target.value)}
                  placeholder="Need core vaccine boosters, general wellness checkup, or checkup reason..."
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
