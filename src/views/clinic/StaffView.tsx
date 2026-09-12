/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useVeterinary } from '../../context/VeterinaryContext';
import { UserCheck, PlusCircle, Search, Calendar, Shield, Sparkles, Sliders, CheckSquare, Trash2, Key } from 'lucide-react';
import { User, UserRole } from '../../types';

export const StaffView: React.FC = () => {
  const {
    users,
    addUser,
    updateUser,
    deleteUser,
    currentUser
  } = useVeterinary();

  const [searchTerm, setSearchTerm] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState<User | null>(null);

  // New Staff Fields
  const [newName, setNewName] = useState('');
  const [newUsername, setNewUsername] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newRole, setNewRole] = useState<UserRole>('Veterinarian');
  const [newPhone, setNewPhone] = useState('');

  const filteredStaff = users.filter(usr => {
    return (
      usr.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      usr.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (usr.username && usr.username.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  });

  const handleCreateStaff = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName || !newEmail || !newPhone) return;

    const created = addUser({
      name: newName,
      username: newUsername.trim() || newEmail.split('@')[0],
      email: newEmail.trim(),
      password: newPassword.trim() || (newRole === 'Admin' ? 'admin1234' : 'staff1234'),
      role: newRole,
      phone: newPhone.trim(),
      isActive: true,
      credentials:
        newRole === 'Veterinarian'
          ? 'DVM certified, Senior Clinical Specialist'
          : newRole === 'Veterinary Assistant'
          ? 'Certified Veterinary Assistant (CVA)'
          : newRole === 'Admin'
          ? 'Practice Director & System Administrator'
          : 'Front Desk & Patient Admissions'
    });

    // Reset
    setNewName('');
    setNewUsername('');
    setNewEmail('');
    setNewPassword('');
    setNewPhone('');
    setShowAddForm(false);
    setSelectedStaff(created);
  };

  const handleToggleStatus = (usr: User) => {
    updateUser({
      ...usr,
      isActive: !usr.isActive
    });
  };

  const handleDeleteUser = (usr: User) => {
    if (usr.id === currentUser?.id) {
      alert('You cannot delete your own active Superadmin account.');
      return;
    }
    const confirmed = window.confirm(`Are you sure you want to permanently delete the account for ${usr.name} (${usr.role})?`);
    if (confirmed) {
      const ok = deleteUser(usr.id);
      if (ok) {
        if (selectedStaff?.id === usr.id) {
          setSelectedStaff(null);
        }
      }
    }
  };

  return (
    <div className="space-y-6 text-left animate-in fade-in duration-200" id="staff-view-container">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-slate-800">Veterinary Shift Rostering & Staff Profiles</h2>
          <p className="text-xs text-slate-500">Coordinate shifts rosters, audit clinical credentials, and toggle system login authorizations.</p>
        </div>
        {currentUser?.role === 'Admin' && (
          <button
            onClick={() => setShowAddForm(true)}
            className="flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-xs font-semibold text-white hover:bg-emerald-700 shadow-md shadow-emerald-500/15 cursor-pointer self-start"
            id="enroll-staff-btn"
          >
            <PlusCircle className="h-4 w-4" />
            <span>Enroll Veterinary Professional</span>
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
              placeholder="Search staff rosters..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-xl border border-slate-200 py-2.5 pl-10 pr-4 text-xs font-medium focus:border-emerald-500 focus:outline-none"
            />
          </div>

          <div className="rounded-2xl border border-slate-100 bg-white p-2 shadow-sm max-h-[55vh] overflow-y-auto space-y-1">
            {filteredStaff.map((usr) => {
              const isSelected = selectedStaff?.id === usr.id;
              return (
                <button
                  key={usr.id}
                  onClick={() => setSelectedStaff(usr)}
                  className={`w-full text-left p-3.5 rounded-xl transition-all cursor-pointer flex justify-between items-center ${
                    isSelected ? 'bg-emerald-50 border border-emerald-100/30' : 'hover:bg-slate-50'
                  }`}
                >
                  <div>
                    <span className="font-bold text-xs text-slate-800">{usr.name}</span>
                    <span className="text-[10px] text-slate-400 block mt-1 font-mono font-bold text-emerald-800 uppercase tracking-widest">{usr.role}</span>
                  </div>

                  <span className={`h-2.5 w-2.5 rounded-full ${usr.isActive ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Details Roster Simulator */}
        <div className="md:col-span-2">
          {selectedStaff ? (
            <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm space-y-6">
              <div className="flex justify-between items-center border-b border-slate-50 pb-3">
                <div>
                  <h3 className="text-sm font-extrabold text-slate-800">Operational Profile Card</h3>
                  <span className="text-[10px] text-slate-400 font-mono">ID: {selectedStaff.id}</span>
                </div>

                {currentUser?.role === 'Admin' && (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleToggleStatus(selectedStaff)}
                      className={`rounded-xl px-3 py-1.5 text-[11px] font-semibold transition-all cursor-pointer ${
                        selectedStaff.isActive
                          ? 'bg-amber-50 text-amber-700 hover:bg-amber-100 border border-amber-200'
                          : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200'
                      }`}
                    >
                      {selectedStaff.isActive ? 'Suspend Access' : 'Grant Active Status'}
                    </button>

                    <button
                      onClick={() => handleDeleteUser(selectedStaff)}
                      disabled={selectedStaff.id === currentUser?.id}
                      title={
                        selectedStaff.id === currentUser?.id
                          ? 'Cannot delete your active Superadmin session account'
                          : 'Permanently delete this user account'
                      }
                      className="flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-[11px] font-semibold bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200 transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                      id="delete-staff-btn"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      <span>Delete Account</span>
                    </button>
                  </div>
                )}
              </div>

              <div className="grid gap-3 sm:grid-cols-3 text-xs">
                <div className="bg-slate-50 rounded-xl p-3 border border-slate-100">
                  <span className="text-slate-400 block text-[11px]">Email Account</span>
                  <p className="font-bold text-slate-700 mt-0.5 truncate">{selectedStaff.email}</p>
                </div>
                <div className="bg-slate-50 rounded-xl p-3 border border-slate-100">
                  <span className="text-slate-400 block text-[11px]">Login Username</span>
                  <p className="font-bold text-slate-700 mt-0.5 font-mono">{selectedStaff.username || selectedStaff.email.split('@')[0]}</p>
                </div>
                <div className="bg-slate-50 rounded-xl p-3 border border-slate-100">
                  <span className="text-slate-400 block text-[11px]">Practice Phone</span>
                  <p className="font-bold text-slate-700 mt-0.5">{selectedStaff.phone || 'N/A'}</p>
                </div>
              </div>

              {/* Shifts Roster week Simulation checkboxes */}
              <div className="space-y-4">
                <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                  <Calendar className="h-4.5 w-4.5 text-emerald-600" />
                  Active Operational Roster Schedule Week Checklist:
                </span>

                <div className="grid grid-cols-7 gap-2 text-center text-[10px] font-bold font-mono">
                  {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, idx) => {
                    const isWorking = selectedStaff.role === 'Veterinarian'
                      ? (idx < 5) // Mon-Fri standard Vets
                      : selectedStaff.role === 'Admin'
                      ? (idx === 0 || idx === 2 || idx === 4) // Mon, Wed, Fri
                      : (idx < 6); // Receptionists Mon-Sat

                    return (
                      <div
                        key={day}
                        className={`rounded-xl border p-2.5 flex flex-col justify-center items-center ${
                          isWorking
                            ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                            : 'bg-slate-50 border-slate-200 text-slate-400 opacity-60'
                        }`}
                      >
                        <span className="uppercase text-[9px] font-bold block">{day}</span>
                        <span className="text-[9px] font-normal mt-1">{isWorking ? 'SHIFT' : 'OFF'}</span>
                      </div>
                    );
                  })}
                </div>

                <div className="rounded-xl border border-slate-100 bg-slate-50/40 p-4 text-xs font-medium text-slate-600 text-left">
                  <span className="font-bold text-slate-700 block mb-1">Clinic Credentials audit:</span>
                  <p className="italic">"{selectedStaff.credentials || 'Certified Board General Staff Practice.'}"</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-12 text-center text-slate-400 text-xs flex flex-col items-center justify-center">
              <UserCheck className="h-10 w-10 text-slate-300 stroke-[1.5] mb-2" />
              <p>Select staff member to inspect shift logs, credentials, or toggle active accounts.</p>
            </div>
          )}
        </div>
      </div>

      {/* ENROLL MODAL */}
      {showAddForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-xl rounded-2xl bg-white p-6 shadow-2xl border border-slate-100 max-h-[85vh] overflow-y-auto">
            <h3 className="text-sm font-bold text-slate-800 border-b border-slate-100 pb-3">Enroll New Veterinary Staff</h3>
            <form onSubmit={handleCreateStaff} className="mt-4 space-y-4">
              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={newName}
                  placeholder="Abigail Vance Jr DVM"
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">Email Account</label>
                  <input
                    type="email"
                    required
                    value={newEmail}
                    placeholder="staff.member@wellpetclinic.com"
                    onChange={(e) => setNewEmail(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs focus:border-emerald-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">Phone Number</label>
                  <input
                    type="text"
                    required
                    value={newPhone}
                    placeholder="555-0199"
                    onChange={(e) => setNewPhone(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs focus:border-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">Login Username</label>
                  <input
                    type="text"
                    value={newUsername}
                    placeholder="Defaults to email prefix"
                    onChange={(e) => setNewUsername(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs focus:border-emerald-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">Initial Password</label>
                  <input
                    type="text"
                    value={newPassword}
                    placeholder="Defaults to staff1234"
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs focus:border-emerald-500 focus:outline-none font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">Roster Role Allocation</label>
                <select
                  value={newRole}
                  onChange={(e) => setNewRole(e.target.value as UserRole)}
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs bg-white focus:outline-none"
                >
                  <option value="Veterinarian">Veterinarian</option>
                  <option value="Veterinary Assistant">Veterinary Assistant</option>
                  <option value="Receptionist">Receptionist</option>
                  <option value="Admin">Practice Administrator</option>
                </select>
              </div>

              <div className="flex gap-2 justify-end border-t border-slate-50 pt-4">
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="rounded-xl border border-slate-200 px-4 py-2 text-xs text-slate-500 hover:bg-slate-50 cursor-pointer"
                >
                  Discard Profile
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-emerald-600 px-4 py-2 text-xs font-semibold text-white hover:bg-emerald-700 cursor-pointer"
                >
                  Register Staff profile
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
