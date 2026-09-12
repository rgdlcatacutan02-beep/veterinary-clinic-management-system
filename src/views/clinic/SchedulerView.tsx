/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useVeterinary } from '../../context/VeterinaryContext';
import {
  Calendar as CalendarIcon,
  Clock,
  PlusCircle,
  FileEdit,
  Filter,
  Check,
  X,
  Sparkles,
  HelpCircle,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { Appointment, AppointmentType, AppointmentStatus } from '../../types';

export const SchedulerView: React.FC = () => {
  const {
    appointments,
    addAppointment,
    updateAppointment,
    pets,
    clients,
    users
  } = useVeterinary();

  // Selected date context for schedule tracker
  const [activeDate, setActiveDate] = useState(new Date().toISOString().split('T')[0]);
  const [filterType, setFilterType] = useState<string>('All');
  const [showAddForm, setShowAddForm] = useState(false);

  // New Appointment Fields
  const [newPetId, setNewPetId] = useState('');
  const [newVetId, setNewVetId] = useState('');
  const [newTime, setNewTime] = useState('10:00');
  const [newDatePicker, setNewDatePicker] = useState(activeDate);
  const [newType, setNewType] = useState<AppointmentType>('Consultation');
  const [newNotes, setNewNotes] = useState('');

  // Editing Fields
  const [editingApp, setEditingApp] = useState<Appointment | null>(null);

  const vetsList = users.filter(u => u.role === 'Veterinarian' || u.role === 'Admin');

  const filteredAppointments = appointments.filter(app => {
    if (app.date !== activeDate) return false;
    if (filterType !== 'All' && app.type !== filterType) return false;
    return true;
  });

  const handleCreateAppointment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPetId || !newVetId || !newDatePicker || !newTime) return;

    const pet = pets.find(p => p.id === newPetId);
    if (!pet) return;

    addAppointment({
      petId: newPetId,
      clientId: pet.clientId,
      vetId: newVetId,
      date: newDatePicker,
      time: newTime,
      type: newType,
      notes: newNotes,
      status: 'Scheduled'
    });

    // Reset
    setNewPetId('');
    setNewNotes('');
    setShowAddForm(false);
  };

  const handleStatusChange = (app: Appointment, status: AppointmentStatus) => {
    updateAppointment({ ...app, status });
  };

  // Quick Calendar Dates Generators for 1-Week view slider
  const getWeekDates = () => {
    const dates = [];
    const today = new Date(activeDate);
    // Gather 3 days before and 3 days after activeDate
    for (let i = -3; i <= 3; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() + i);
      dates.push(d.toISOString().split('T')[0]);
    }
    return dates;
  };

  const weekDates = getWeekDates();

  const getDayName = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', { weekday: 'short', timeZone: 'UTC' });
  };

  const getDayNumber = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.getUTCDate();
  };

  return (
    <div className="space-y-6 text-left animate-in fade-in duration-200" id="scheduler-view-container">
      {/* Upper Grid Bar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-slate-800">Operational Clinic Calendar</h2>
          <p className="text-xs text-slate-500">Coordinate veterinary surgeons, follow-ups, scale checkups and patient check-ins.</p>
        </div>
        <button
          onClick={() => {
            setNewDatePicker(activeDate);
            setShowAddForm(true);
          }}
          className="flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-xs font-semibold text-white hover:bg-emerald-700 shadow-md shadow-emerald-500/10 cursor-pointer self-start"
          id="scheduler-add-appointment-btn"
        >
          <PlusCircle className="h-4 w-4" />
          <span>Schedule Appointment</span>
        </button>
      </div>

      {/* Date Carousel Navigator */}
      <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <CalendarIcon className="h-4.5 w-4.5 text-emerald-600" />
          <span className="text-xs font-semibold text-slate-700">Select Operating Date</span>
          <input
            type="date"
            value={activeDate}
            onChange={(e) => setActiveDate(e.target.value)}
            className="rounded-xl border border-slate-200 px-3 py-1.5 text-xs focus:border-emerald-500 focus:outline-none font-mono"
          />
        </div>

        {/* Horizontal Weekly sliders */}
        <div className="flex items-center gap-1 overflow-x-auto py-1">
          {weekDates.map((dateStr) => {
            const isSelected = dateStr === activeDate;
            return (
              <button
                key={dateStr}
                onClick={() => setActiveDate(dateStr)}
                className={`flex flex-col items-center justify-center h-12 w-12 rounded-xl transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-emerald-600 text-white shadow-md shadow-emerald-500/20 scale-105'
                    : 'bg-slate-50 text-slate-500 hover:bg-slate-100'
                }`}
              >
                <span className="text-[9px] uppercase tracking-wider font-semibold opacity-75">{getDayName(dateStr)}</span>
                <span className="text-xs font-bold font-mono mt-0.5">{getDayNumber(dateStr)}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main operational view splits */}
      <div className="grid gap-6 md:grid-cols-4">
        {/* Quick configuration Filters on side */}
        <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm h-fit space-y-4">
          <span className="text-xs font-semibold text-slate-800 flex items-center gap-1.5 border-b border-slate-50 pb-2">
            <Filter className="h-4 w-4 text-slate-400" /> Service Type Filter
          </span>

          <div className="space-y-1">
            {['All', 'Consultation', 'Vaccination', 'Surgery', 'Follow-Up', 'Grooming'].map((type) => (
              <button
                key={type}
                onClick={() => setFilterType(type)}
                className={`w-full text-left px-3 py-2 text-xs font-medium rounded-lg transition-colors cursor-pointer ${
                  filterType === type
                    ? 'bg-emerald-50 text-emerald-700'
                    : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                {type}
              </button>
            ))}
          </div>

          <div className="border-t border-slate-100 pt-4 text-xs space-y-2">
            <span className="font-semibold text-slate-500 block">Queue Status Keys:</span>
            <div className="grid grid-cols-2 gap-2 text-[10px] font-medium font-mono">
              <span className="bg-sky-50 text-sky-700 px-1.5 py-1 rounded">Scheduled</span>
              <span className="bg-amber-50 text-amber-700 px-1.5 py-1 rounded">Checked In</span>
              <span className="bg-emerald-50 text-emerald-700 px-1.5 py-1 rounded">Completed</span>
              <span className="bg-rose-50 text-rose-700 px-1.5 py-1 rounded">Cancelled</span>
            </div>
          </div>
        </div>

        {/* Schedule Queue Tracker */}
        <div className="md:col-span-3 space-y-4">
          <div className="rounded-2xl border border-slate-100 bg-white shadow-sm overflow-hidden">
            <div className="bg-slate-50/50 border-b border-slate-100 px-5 py-4">
              <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <Clock className="h-4.5 w-4.5 text-emerald-600" /> Hourly Queue Roadmap for {activeDate}
              </span>
            </div>

            <div className="divide-y divide-slate-100">
              {filteredAppointments.length === 0 ? (
                <div className="p-12 text-center text-slate-400 text-xs">
                  Nothing scheduled for this date and type. Click "Schedule Appointment" to book.
                </div>
              ) : (
                filteredAppointments
                  .sort((a, b) => a.time.localeCompare(b.time))
                  .map((app) => {
                    const pet = pets.find(p => p.id === app.petId);
                    const client = clients.find(c => c.id === app.clientId);
                    const vet = vertsMatch(app.vetId);

                    function vertsMatch(idStr: string) {
                      return vetsList.find(v => v.id === idStr);
                    }

                    return (
                      <div key={app.id} className="p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 hover:bg-slate-50/40 transition-colors">
                        <div className="flex items-start gap-4">
                          <span className="text-xs font-bold font-mono text-slate-500 bg-slate-100 px-2 py-1 rounded border border-slate-200 mt-1">
                            {app.time}
                          </span>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-bold text-slate-800">{pet?.name}</span>
                              <span className="rounded bg-emerald-50 px-1.5 py-0.5 text-[9px] font-semibold text-emerald-700">
                                {pet?.species}
                              </span>
                              <span className="text-[11px] text-slate-400 font-medium">({pet?.breed})</span>
                            </div>
                            <p className="text-[11px] text-slate-500 mt-1">
                              Owner: {client?.firstName} {client?.lastName} | Phone: {client?.phone}
                            </p>
                            <p className="text-[11px] text-slate-600 mt-1 italic">
                              Notes: "{app.notes || 'Routine diagnostic clinic'}"
                            </p>
                            <span className="text-[10px] font-mono font-medium text-emerald-800 bg-emerald-50/50 rounded px-1.5 mt-1.5 inline-block">
                              Assigned Staff: {vet?.name || 'Default Vet'}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 self-end sm:self-center">
                          {/* Active operational checkers */}
                          {app.status === 'Scheduled' && (
                            <button
                              onClick={() => handleStatusChange(app, 'Checked In')}
                              className="rounded bg-amber-50 hover:bg-amber-100 px-2.5 py-1 text-[11px] font-semibold text-amber-700 transition-colors cursor-pointer"
                            >
                              Check In
                            </button>
                          )}
                          {app.status === 'Checked In' && (
                            <button
                              onClick={() => handleStatusChange(app, 'Completed')}
                              className="rounded bg-emerald-50 hover:bg-emerald-100 px-2.5 py-1 text-[11px] font-semibold text-emerald-700 transition-colors cursor-pointer"
                            >
                              Settle Visit
                            </button>
                          )}

                          {/* Quick Cancel trigger */}
                          {app.status !== 'Completed' && app.status !== 'Cancelled' && (
                            <button
                              onClick={() => handleStatusChange(app, 'Cancelled')}
                              className="rounded hover:bg-rose-50 p-1 text-slate-400 hover:text-rose-500 cursor-pointer"
                              title="Cancel appointment"
                            >
                              <X className="h-4 w-4" />
                            </button>
                          )}

                          <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider font-mono ${
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
        </div>
      </div>

      {/* RENDER RESERVATION PORTALS FORM (MODAL) */}
      {showAddForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-xl rounded-2xl bg-white p-6 shadow-2xl border border-slate-100 max-h-[90vh] overflow-y-auto">
            <h3 className="text-sm font-bold text-slate-800 border-b border-slate-100 pb-3">Book New Veterinary Appointment</h3>
            <form onSubmit={handleCreateAppointment} className="mt-4 space-y-4">
              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">Select Patient Pet</label>
                <select
                  required
                  value={newPetId}
                  onChange={(e) => setNewPetId(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs bg-white focus:border-emerald-500 focus:outline-none"
                >
                  <option value="">-- Choose registered pet --</option>
                  {pets.map(pet => {
                    const client = clients.find(c => c.id === pet.clientId);
                    return (
                      <option key={pet.id} value={pet.id}>
                        {pet.name} ({pet.species}) - Owner: {client?.firstName} {client?.lastName}
                      </option>
                    )
                  })}
                </select>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">Select Practitioner Vet</label>
                  <select
                    required
                    value={newVetId}
                    onChange={(e) => setNewVetId(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs bg-white focus:border-emerald-500 focus:outline-none"
                  >
                    <option value="">-- Select vet --</option>
                    {vetsList.map(v => (
                      <option key={v.id} value={v.id}>{v.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">Service Type</label>
                  <select
                    required
                    value={newType}
                    onChange={(e) => setNewType(e.target.value as AppointmentType)}
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs bg-white focus:border-emerald-500 focus:outline-none"
                  >
                    <option value="Consultation">Consultation</option>
                    <option value="Vaccination">Vaccination</option>
                    <option value="Surgery">Surgery</option>
                    <option value="Follow-Up">Follow-Up</option>
                    <option value="Grooming">Grooming</option>
                  </select>
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">Reservation Date</label>
                  <input
                    type="date"
                    required
                    value={newDatePicker}
                    onChange={(e) => setNewDatePicker(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs focus:border-emerald-500 focus:outline-none font-mono"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">Scheduled Time slot</label>
                  <input
                    type="time"
                    required
                    value={newTime}
                    onChange={(e) => setNewTime(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs focus:border-emerald-500 focus:outline-none font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">Reason for consultation / Notes</label>
                <textarea
                  value={newNotes}
                  rows={2}
                  onChange={(e) => setNewNotes(e.target.value)}
                  placeholder="Minor coughing, annual boosters, dental cleaning..."
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div className="flex gap-2 justify-end border-t border-slate-50 pt-4">
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="rounded-xl border border-slate-200 px-4 py-2 text-xs text-slate-500 hover:bg-slate-50 cursor-pointer"
                >
                  Close Form
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-emerald-600 px-4 py-2 text-xs font-semibold text-white hover:bg-emerald-700 cursor-pointer"
                >
                  Schedule Appointment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
