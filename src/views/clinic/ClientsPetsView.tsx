/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useVeterinary } from '../../context/VeterinaryContext';
import {
  Search,
  Plus,
  User,
  Phone,
  Mail,
  MapPin,
  Heart,
  Settings,
  Scale,
  CalendarCheck,
  Receipt,
  FileText,
  AlertOctagon,
  Trash,
  ChevronRight,
  Sparkles,
  ArrowLeft,
  Briefcase,
  Camera,
  Key,
  ShieldCheck,
  CheckCircle2,
  Lock,
  X,
  Copy,
  Check,
  Upload,
  AlertCircle
} from 'lucide-react';
import { Client, Pet } from '../../types';

export const ClientsPetsView: React.FC = () => {
  const {
    currentUser,
    clients,
    pets,
    addClient,
    addClientWithPet,
    updateClient,
    deleteClient,
    addPet,
    updatePet,
    deletePet,
    addWeightToPet,
    appointments,
    invoices,
    medicalRecords,
    vaccinations,
    prescriptions
  } = useVeterinary();

  const isAdmin = currentUser?.role === 'Admin';

  // Search and selection states
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [selectedPet, setSelectedPet] = useState<Pet | null>(null);

  // Form states
  const [showAddClient, setShowAddClient] = useState(false);
  const [showAddPet, setShowAddPet] = useState(false);
  const [showEditClient, setShowEditClient] = useState(false);
  const [showEditPet, setShowEditPet] = useState(false);

  // Account creation feedback modal
  const [createdCredentialAlert, setCreatedCredentialAlert] = useState<{
    clientName: string;
    petName?: string;
    email: string;
    username: string;
    password: string;
  } | null>(null);
  const [copiedPass, setCopiedPass] = useState(false);
  
  // Weights tracker states
  const [newWeight, setNewWeight] = useState('');
  const [newWeightDate, setNewWeightDate] = useState(new Date().toISOString().split('T')[0]);

  // Form inputs for Clients
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [emergName, setEmergName] = useState('');
  const [emergPhone, setEmergPhone] = useState('');
  const [emergRel, setEmergRel] = useState('');
  const [clientPassword, setClientPassword] = useState('client1234');
  const [includePet, setIncludePet] = useState(true);

  // Form inputs for Pets
  const [petName, setPetName] = useState('');
  const [petPhoto, setPetPhoto] = useState('');
  const [petSpecies, setPetSpecies] = useState('Dog');
  const [petBreed, setPetBreed] = useState('');
  const [petGender, setPetGender] = useState<'Male' | 'Female' | 'Neutered Male' | 'Spayed Female'>('Neutered Male');
  const [petDob, setPetDob] = useState('');
  const [petWeight, setPetWeight] = useState('');
  const [petColor, setPetColor] = useState('');
  const [petMicrochip, setPetMicrochip] = useState('');
  const [petAllergies, setPetAllergies] = useState('');
  const [petNotes, setPetNotes] = useState('');

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert('Please choose an image smaller than 5MB.');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          setPetPhoto(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const filteredClients = clients.filter(c => {
    const full = `${c.firstName} ${c.lastName}`.toLowerCase();
    return (
      full.includes(searchTerm.toLowerCase()) ||
      c.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.phone.includes(searchTerm)
    );
  });

  const handleCreateClient = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAdmin) {
      alert('Only Practice Administrators are authorized to provision client accounts.');
      return;
    }
    if (!firstName || !lastName || !email || !phone) return;

    if (includePet && petName.trim()) {
      const result = addClientWithPet(
        {
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          phone: phone.trim(),
          email: email.trim(),
          address: address.trim() || 'Address on file',
          emergencyContact: {
            name: emergName.trim() || 'Primary Contact',
            phone: emergPhone.trim() || phone.trim(),
            relationship: emergRel.trim() || 'Family'
          }
        },
        {
          name: petName.trim(),
          photoUrl: petPhoto.trim() || undefined,
          species: petSpecies,
          breed: petBreed.trim() || 'Mixed Breed',
          gender: petGender,
          dob: petDob || new Date().toISOString().split('T')[0],
          weight: parseFloat(petWeight) || 5.0,
          color: petColor.trim() || 'Standard',
          microchipNumber: petMicrochip.trim() || undefined,
          allergies: petAllergies.trim() || 'None reported',
          specialNotes: petNotes.trim() || undefined
        },
        clientPassword.trim() || 'client1234'
      );

      setCreatedCredentialAlert({
        clientName: `${result.client.firstName} ${result.client.lastName}`,
        petName: result.pet.name,
        email: result.client.email,
        username: result.user.username || result.client.email.split('@')[0],
        password: clientPassword.trim() || 'client1234'
      });
    } else {
      const newClient = addClient({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        phone: phone.trim(),
        email: email.trim(),
        address: address.trim() || 'Address on file',
        emergencyContact: {
          name: emergName.trim() || 'Primary Contact',
          phone: emergPhone.trim() || phone.trim(),
          relationship: emergRel.trim() || 'Family'
        }
      });

      setCreatedCredentialAlert({
        clientName: `${newClient.firstName} ${newClient.lastName}`,
        email: newClient.email,
        username: newClient.email.split('@')[0],
        password: clientPassword.trim() || 'client1234'
      });
    }

    // Reset
    setFirstName(''); setLastName(''); setPhone(''); setEmail(''); setAddress('');
    setEmergName(''); setEmergPhone(''); setEmergRel('');
    setPetName(''); setPetPhoto(''); setPetBreed(''); setPetDob(''); setPetWeight('');
    setPetColor(''); setPetMicrochip(''); setPetAllergies(''); setPetNotes('');
    setClientPassword('client1234');
    setShowAddClient(false);
  };

  const handleEditClientSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedClient) return;
    updateClient({
      ...selectedClient,
      firstName,
      lastName,
      phone,
      email,
      address,
      emergencyContact: { name: emergName, phone: emergPhone, relationship: emergRel }
    });
    setSelectedClient(null);
    setShowEditClient(false);
  };

  const handleCreatePet = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedClient || !petName || !petBreed || !petDob || !petWeight) return;
    addPet({
      clientId: selectedClient.id,
      name: petName,
      photoUrl: petPhoto || undefined,
      species: petSpecies,
      breed: petBreed,
      gender: petGender,
      dob: petDob,
      weight: parseFloat(petWeight),
      color: petColor,
      microchipNumber: petMicrochip || undefined,
      allergies: petAllergies || 'None reported',
      specialNotes: petNotes || undefined
    });
    // Reset
    setPetName('');setPetPhoto('');setPetBreed('');setPetDob('');setPetWeight('');
    setPetColor('');setPetMicrochip('');setPetAllergies('');setPetNotes('');
    setShowAddPet(false);
  };

  const handleEditPetSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPet) return;
    updatePet({
      ...selectedPet,
      name: petName,
      photoUrl: petPhoto || undefined,
      species: petSpecies,
      breed: petBreed,
      gender: petGender,
      dob: petDob,
      weight: parseFloat(petWeight),
      color: petColor,
      microchipNumber: petMicrochip || undefined,
      allergies: petAllergies || 'None reported',
      specialNotes: petNotes || undefined
    });
    // Sync current viewed pet
    setSelectedPet(null);
    setShowEditPet(false);
  };

  const handleWeightAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPet || !newWeight) return;
    addWeightToPet(selectedPet.id, parseFloat(newWeight), newWeightDate);
    // Refresh pet view
    const updated = pets.find(p => p.id === selectedPet.id);
    if (updated) setSelectedPet(updated);
    setNewWeight('');
  };

  const openEditClientForm = (client: Client) => {
    setFirstName(client.firstName);
    setLastName(client.lastName);
    setPhone(client.phone);
    setEmail(client.email);
    setAddress(client.address);
    setEmergName(client.emergencyContact.name);
    setEmergPhone(client.emergencyContact.phone);
    setEmergRel(client.emergencyContact.relationship);
    setShowEditClient(true);
  };

  const openEditPetForm = (pet: Pet) => {
    setPetName(pet.name);
    setPetPhoto(pet.photoUrl || '');
    setPetSpecies(pet.species);
    setPetBreed(pet.breed);
    setPetGender(pet.gender);
    setPetDob(pet.dob);
    setPetWeight(pet.weight.toString());
    setPetColor(pet.color);
    setPetMicrochip(pet.microchipNumber || '');
    setPetAllergies(pet.allergies);
    setPetNotes(pet.specialNotes || '');
    setShowEditPet(true);
  };

  return (
    <div className="space-y-6 text-left animate-in fade-in duration-200" id="clients-pets-container">
      {/* HEADER SECTION */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-slate-800">Clients & Patients Module</h2>
          <p className="text-xs text-slate-500">Register new clinic clients and keep precise microchip and health logs on pets.</p>
        </div>
        {!selectedClient && (
          isAdmin ? (
            <button
              onClick={() => setShowAddClient(true)}
              className="flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-xs font-semibold text-white hover:bg-emerald-700 shadow-md shadow-emerald-500/15 cursor-pointer self-start transition-all"
              id="register-client-tab-btn"
            >
              <Plus className="h-4 w-4" />
              <span>Register Client Account & Pet</span>
            </button>
          ) : (
            <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-xs text-slate-500">
              <Lock className="h-3.5 w-3.5 text-slate-400" />
              <span>Account creation restricted to Practice Administrator</span>
            </div>
          )
        )}
      </div>

      {/* DETAILED VIEW ROUTERS */}
      {selectedPet ? (
        /* PET DETAILS SCREEN */
        <div className="space-y-6 animate-in slide-in-from-right duration-200">
          <button
            onClick={() => {
              setSelectedPet(null);
            }}
            className="flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-slate-800 cursor-pointer"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Client Workspace
          </button>

          <div className="grid gap-6 md:grid-cols-3">
            {/* Left Col: Pet Summary profile */}
            <div className="space-y-6">
              <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm flex flex-col items-center">
                <img
                  src={selectedPet.photoUrl}
                  alt={selectedPet.name}
                  referrerPolicy="no-referrer"
                  className="h-28 w-28 rounded-2xl object-cover ring-4 ring-slate-100 shadow"
                />
                <h3 className="text-lg font-bold text-slate-800 mt-4">{selectedPet.name}</h3>
                <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700 mt-1.5 border border-emerald-100/30">
                  {selectedPet.species} | {selectedPet.breed}
                </span>

                <div className="w-full mt-6 space-y-3.5 border-t border-slate-50 pt-5 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Gender</span>
                    <strong className="text-slate-700 font-semibold">{selectedPet.gender}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Date of Birth</span>
                    <strong className="text-slate-700 font-semibold font-mono">{selectedPet.dob}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Microchip Number</span>
                    <strong className="text-slate-700 font-semibold font-mono">{selectedPet.microchipNumber || 'Unassigned'}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Coloring</span>
                    <strong className="text-indigo-600 font-semibold">{selectedPet.color}</strong>
                  </div>
                </div>

                <div className="flex gap-2 w-full mt-6 border-t border-slate-50 pt-4">
                  <button
                    onClick={() => openEditPetForm(selectedPet)}
                    className="flex-1 rounded-xl bg-slate-50 border border-slate-100 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer text-center"
                  >
                    Edit Profile
                  </button>
                  <button
                    onClick={() => {
                      if (confirm(`Are you sure you want to remove patient records for ${selectedPet.name}?`)) {
                        deletePet(selectedPet.id);
                        setSelectedPet(null);
                      }
                    }}
                    className="rounded-xl bg-rose-50 p-2 text-rose-500 hover:bg-rose-100 transition-colors cursor-pointer"
                  >
                    <Trash className="h-4.5 w-4.5" />
                  </button>
                </div>
              </div>

              {/* Health Warnings Box */}
              <div className="rounded-2xl border border-rose-100 bg-rose-50/20 p-5 shadow-sm">
                <h4 className="text-xs font-bold uppercase tracking-wider text-rose-800 flex items-center gap-1.5 mb-3">
                  <AlertOctagon className="h-4 w-4 text-rose-600" /> Medical Contradictions
                </h4>
                <div className="space-y-4 text-xs text-rose-950">
                  <div>
                    <span className="font-semibold block text-slate-500">Known Allergies:</span>
                    <p className="mt-1 font-mono text-xs text-rose-700 bg-rose-50 border border-rose-100 px-2.5 py-1.5 rounded-lg font-bold">
                      {selectedPet.allergies || 'No allergies logged.'}
                    </p>
                  </div>
                  <div>
                    <span className="font-semibold block text-slate-500">Special Handling Instructions:</span>
                    <p className="mt-1 leading-relaxed bg-white/70 rounded-lg p-2.5 border border-slate-100 text-slate-600">
                      {selectedPet.specialNotes || 'Standard handling applies.'}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Middle Col / Right Col: Weight Tracking & Clinical Timeline */}
            <div className="md:col-span-2 space-y-6">
              {/* Weight logs & Input */}
              <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
                <div className="flex items-center justify-between mb-4 border-b border-slate-50 pb-3">
                  <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <Scale className="h-4.5 w-4.5 text-emerald-600" />
                    Weight History Metrics
                  </span>
                  <span className="text-[10px] text-slate-400">Current: {selectedPet.weight}kg</span>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <form onSubmit={handleWeightAdd} className="space-y-3">
                    <span className="text-[11px] font-semibold text-slate-500 block">Record New Scale Reading:</span>
                    <div className="flex gap-2">
                      <div className="relative flex-1">
                        <input
                          type="number"
                          step="0.01"
                          placeholder="0.0"
                          value={newWeight}
                          onChange={(e) => setNewWeight(e.target.value)}
                          className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs font-mono focus:border-emerald-500 focus:outline-none"
                          required
                        />
                        <span className="absolute right-3 top-2 text-[10px] text-slate-400">kg</span>
                      </div>
                      <input
                        type="date"
                        value={newWeightDate}
                        onChange={(e) => setNewWeightDate(e.target.value)}
                        className="rounded-xl border border-slate-200 px-2.5 py-2 text-xs focus:border-emerald-500 focus:outline-none font-mono"
                        required
                      />
                    </div>
                    <button
                      type="submit"
                      className="w-full rounded-xl bg-slate-800 py-2 text-xs font-semibold text-white hover:bg-slate-700 transition-colors"
                    >
                      Update Weight Curve
                    </button>
                  </form>

                  <div className="max-h-40 overflow-y-auto rounded-xl border border-slate-50 p-2 text-xs">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-slate-100 text-left text-[10px] text-slate-400">
                          <th className="pb-1.5">Date Checked</th>
                          <th className="pb-1.5 text-right">Registered Reading</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-50 font-mono">
                        {selectedPet.weightHistory.map((wh, idx) => (
                          <tr key={idx}>
                            <td className="py-2 text-slate-500">{wh.date}</td>
                            <td className="py-2 text-right font-bold text-slate-800">{wh.weight} kg</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              {/* Patient Timeline summary */}
              <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm text-left">
                <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5 mb-4 border-b border-slate-50 pb-2">
                  <FileText className="h-4.5 w-4.5 text-indigo-600" /> Patient Medical File Logs
                </span>

                <div className="space-y-4">
                  {medicalRecords.filter(r => r.petId === selectedPet.id).length === 0 ? (
                    <p className="text-xs text-slate-400 text-center py-6">No surgical or consultation audits available for this patient.</p>
                  ) : (
                    medicalRecords.filter(r => r.petId === selectedPet.id).map((rec, key) => (
                      <div key={key} className="rounded-xl border border-slate-50 bg-slate-50/30 p-4">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-xs font-extrabold text-emerald-700">Diagnosis: {rec.diagnosis}</span>
                          <span className="text-[10px] font-mono text-slate-400 font-bold">{rec.visitDate}</span>
                        </div>
                        <p className="text-xs font-medium text-slate-700">
                          Chief Complaint: <strong className="text-slate-800 font-normal">"{rec.chiefComplaint}"</strong>
                        </p>
                        <p className="text-xs mt-2 text-slate-600">
                          Treatment Details: <strong className="font-semibold text-indigo-700">{rec.treatmentPlan}</strong>
                        </p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : selectedClient ? (
        /* CLIENT WORKSPACE SCREEN */
        <div className="space-y-6 animate-in slide-in-from-right duration-200">
          <button
            onClick={() => setSelectedClient(null)}
            className="flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-slate-800 cursor-pointer"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Client Search Ledger
          </button>

          <div className="grid gap-6 md:grid-cols-3">
            {/* Client Profile details */}
            <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm space-y-5">
              <div className="flex items-center gap-3 border-b border-slate-50 pb-4">
                <div className="rounded-xl bg-emerald-50 px-3 py-2.5 text-emerald-700 font-bold text-center">
                  {selectedClient.firstName[0]}
                  {selectedClient.lastName[0]}
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-800">
                    {selectedClient.firstName} {selectedClient.lastName}
                  </h3>
                  <span className="font-mono text-[9px] text-slate-300">ID: {selectedClient.id}</span>
                </div>
              </div>

              <div className="space-y-4 text-xs">
                <div className="flex gap-2.5 text-slate-600">
                  <Phone className="h-4 w-4 text-slate-400" />
                  <span>{selectedClient.phone}</span>
                </div>
                <div className="flex gap-2.5 text-slate-600">
                  <Mail className="h-4 w-4 text-slate-400" />
                  <span className="truncate">{selectedClient.email}</span>
                </div>
                <div className="flex gap-2.5 text-slate-600">
                  <MapPin className="h-4 w-4 text-slate-400" />
                  <span className="leading-relaxed">{selectedClient.address}</span>
                </div>
                <div className="border-t border-slate-50 pt-4">
                  <span className="font-semibold uppercase tracking-wider text-[10px] text-slate-400 block mb-2">Emergency Contact</span>
                  <p className="font-semibold text-slate-700">{selectedClient.emergencyContact.name}</p>
                  <p className="text-slate-500 font-mono mt-1 text-[11px]">
                    {selectedClient.emergencyContact.phone} ({selectedClient.emergencyContact.relationship})
                  </p>
                </div>
              </div>

              <div className="flex gap-2 border-t border-slate-50 pt-4">
                <button
                  onClick={() => openEditClientForm(selectedClient)}
                  className="flex-1 rounded-xl bg-slate-50 border border-slate-100 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer text-center"
                >
                  Edit Profile
                </button>
                <button
                  onClick={() => {
                    if (confirm(`Do you wish to delete profile and associated records for ${selectedClient.firstName}?`)) {
                      deleteClient(selectedClient.id);
                      setSelectedClient(null);
                    }
                  }}
                  className="rounded-xl bg-rose-50 p-2 text-rose-500 hover:bg-rose-100 transition-colors cursor-pointer"
                >
                  <Trash className="h-4.5 w-4.5" />
                </button>
              </div>
            </div>

            {/* Pets, Invoices, Appointments lists */}
            <div className="md:col-span-2 space-y-6">
              {/* Registered Owned Pets */}
              <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm text-left">
                <div className="flex items-center justify-between mb-4 border-b border-slate-50 pb-3">
                  <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <Heart className="h-4.5 w-4.5 text-rose-600" />
                    Registered Owned Pets
                  </span>
                  <button
                    onClick={() => setShowAddPet(true)}
                    className="text-[11px] font-bold text-emerald-600 hover:text-emerald-700 flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="h-3 w-3" /> Add Pet patient
                  </button>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  {pets.filter(p => p.clientId === selectedClient.id).length === 0 ? (
                    <div className="sm:col-span-2 py-6 text-center text-xs text-slate-400">
                      No pets currently registered under this client profile.
                    </div>
                  ) : (
                    pets.filter(p => p.clientId === selectedClient.id).map((pet) => (
                      <div
                        key={pet.id}
                        onClick={() => setSelectedPet(pet)}
                        className="rounded-xl border border-slate-100 bg-slate-50/20 p-4 hover:bg-slate-50 cursor-pointer transition-all flex items-center justify-between group"
                      >
                        <div className="flex items-center gap-3.5">
                          <img
                            src={pet.photoUrl}
                            alt={pet.name}
                            referrerPolicy="no-referrer"
                            className="h-12 w-12 rounded-xl object-cover ring-2 ring-white shadow-sm"
                          />
                          <div>
                            <h4 className="text-xs font-bold text-slate-800 group-hover:text-emerald-700 transition-colors">{pet.name}</h4>
                            <p className="text-[11px] text-slate-400">{pet.breed}</p>
                            <span className="rounded bg-emerald-50 px-1 py-0.5 text-[9px] font-medium text-emerald-700 inline-block mt-1">
                              {pet.species}
                            </span>
                          </div>
                        </div>
                        <ChevronRight className="h-4 w-4 text-slate-400 group-hover:translate-x-1 transition-transform" />
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Client history segments */}
              <div className="grid gap-6 sm:grid-cols-2 text-left">
                <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
                  <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5 mb-3">
                    <CalendarCheck className="h-4.5 w-4.5 text-indigo-600" /> Visit Scheduling Ledger
                  </span>

                  <div className="space-y-2 max-h-44 overflow-y-auto text-xs">
                    {appointments.filter(a => a.clientId === selectedClient.id).length === 0 ? (
                      <p className="text-xs text-slate-400 py-3">No historic visits booked.</p>
                    ) : (
                      appointments.filter(a => a.clientId === selectedClient.id).map((app, key) => (
                        <div key={key} className="flex justify-between items-center py-2 border-b border-slate-50 last:border-none">
                          <div>
                            <span className="font-semibold block text-slate-700">{app.type}</span>
                            <span className="text-[10px] font-mono text-slate-400">{app.date} | {app.time}</span>
                          </div>
                          <span className={`inline-flex px-1.5 rounded text-[9px] font-semibold ${
                            app.status === 'Completed' ? 'bg-green-100 text-green-800' : 'bg-slate-100 text-slate-600'
                          }`}>
                            {app.status}
                          </span>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
                  <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5 mb-3">
                    <Receipt className="h-4.5 w-4.5 text-emerald-600" /> Invoicing Ledger
                  </span>

                  <div className="space-y-2 max-h-44 overflow-y-auto text-xs">
                    {invoices.filter(i => i.clientId === selectedClient.id).length === 0 ? (
                      <p className="text-xs text-slate-400 py-3">No invoice metrics generated.</p>
                    ) : (
                      invoices.filter(i => i.clientId === selectedClient.id).map((inv, key) => (
                        <div key={key} className="flex justify-between items-center py-2 border-b border-slate-50 last:border-none font-mono">
                          <div>
                            <span className="font-semibold block text-slate-700 text-xs text-left font-sans">{inv.id}</span>
                            <span className="text-[10px] text-slate-400">{inv.date}</span>
                          </div>
                          <div className="text-right">
                            <span className="block font-bold text-slate-800">${inv.totalAmount}</span>
                            <span className={`inline-block text-[9px] font-semibold px-1 py-0.5 rounded ${
                              inv.status === 'Paid' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                            }`}>
                              {inv.status}
                            </span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* CENTRAL CLIENT LIST WITH SEARCH */
        <div className="space-y-4">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search Client Name, Email, Registration phone..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full rounded-xl border border-slate-200 py-2.5 pl-10 pr-4 text-xs font-medium focus:border-emerald-500 focus:outline-none"
                id="client-search-field"
              />
            </div>
          </div>

          <div className="rounded-2xl border border-slate-100 bg-white shadow-sm overflow-hidden text-left">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/50 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                    <th className="px-6 py-3 text-left">Contact Name</th>
                    <th className="px-6 py-3 text-left">Phone Number</th>
                    <th className="px-6 py-3 text-left">Email Address</th>
                    <th className="px-6 py-3 text-left">Patient Pets</th>
                    <th className="px-6 py-3 text-left">Date Opened</th>
                    <th className="px-6 py-3 text-right">Settings</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs">
                  {filteredClients.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-12 text-center text-slate-400">
                        No clients registered under this matching criteria.
                      </td>
                    </tr>
                  ) : (
                    filteredClients.map((client) => {
                      const clientPets = pets.filter(p => p.clientId === client.id);
                      return (
                        <tr
                          key={client.id}
                          className="hover:bg-slate-50/60 transition-colors"
                        >
                          <td className="px-6 py-4 font-bold text-slate-800">
                            {client.firstName} {client.lastName}
                          </td>
                          <td className="px-6 py-4 font-mono text-slate-600">{client.phone}</td>
                          <td className="px-6 py-4 text-slate-600 truncate max-w-[120px]">{client.email}</td>
                          <td className="px-6 py-4">
                            <div className="flex gap-1.5 flex-wrap">
                              {clientPets.length === 0 ? (
                                <span className="text-slate-400 text-[10px]">None</span>
                              ) : (
                                clientPets.map((p) => (
                                  <span key={p.id} className="rounded bg-emerald-50 px-1.5 py-0.5 text-[10px] font-semibold text-emerald-800 border border-emerald-100/10">
                                    {p.name}
                                  </span>
                                ))
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4 font-mono text-slate-500">{client.registrationDate}</td>
                          <td className="px-6 py-4 text-right">
                            <button
                              onClick={() => setSelectedClient(client)}
                              className="rounded bg-emerald-50 px-2.5 py-1 text-[11px] font-bold text-emerald-700 hover:bg-emerald-100 transition-colors cursor-pointer"
                            >
                              Manage Record
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

      {/* RENDER MODAL LAYERS FOR CLIENT ADDS OR PATIENT ADDS */}
      {showAddClient && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-2xl rounded-2xl bg-white p-6 shadow-2xl border border-slate-100 max-h-[90vh] overflow-y-auto transform duration-300">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-bold text-slate-800">Register Client Account & Pet</h3>
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700 border border-emerald-200">
                    <ShieldCheck className="h-3 w-3" /> Admin Only
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Creates client profile, provisions Pet Owner Portal credentials, and registers patient with photo.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowAddClient(false)}
                className="text-slate-400 hover:text-slate-600 rounded-lg p-1"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleCreateClient} className="mt-5 space-y-5">
              {/* SECTION 1: Client Information */}
              <div>
                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700 mb-3">
                  <User className="h-3.5 w-3.5 text-emerald-600" />
                  <span>Client Owner Information</span>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">First Name *</label>
                    <input
                      type="text"
                      required
                      value={firstName}
                      placeholder="e.g. Jordan"
                      onChange={(e) => setFirstName(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs focus:border-emerald-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">Last Name *</label>
                    <input
                      type="text"
                      required
                      value={lastName}
                      placeholder="e.g. Hayes"
                      onChange={(e) => setLastName(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs focus:border-emerald-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid gap-3 sm:grid-cols-2 mt-3">
                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">Email Address (Login Identity) *</label>
                    <input
                      type="email"
                      required
                      value={email}
                      placeholder="client@example.com"
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs focus:border-emerald-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">Phone Number *</label>
                    <input
                      type="text"
                      required
                      value={phone}
                      placeholder="e.g. 555-0144"
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs focus:border-emerald-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="mt-3">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">Residential Address</label>
                  <input
                    type="text"
                    value={address}
                    placeholder="Street, City, Postal Code"
                    onChange={(e) => setAddress(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs focus:border-emerald-500 focus:outline-none"
                  />
                </div>

                <div className="mt-3">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1.5">Emergency Contact</span>
                  <div className="grid gap-3 sm:grid-cols-3">
                    <input
                      type="text"
                      placeholder="Contact Name"
                      value={emergName}
                      onChange={(e) => setEmergName(e.target.value)}
                      className="rounded-xl border border-slate-200 px-3 py-2 text-xs focus:border-emerald-500 focus:outline-none"
                    />
                    <input
                      type="text"
                      placeholder="Relationship"
                      value={emergRel}
                      onChange={(e) => setEmergRel(e.target.value)}
                      className="rounded-xl border border-slate-200 px-3 py-2 text-xs focus:border-emerald-500 focus:outline-none"
                    />
                    <input
                      type="text"
                      placeholder="Contact Phone"
                      value={emergPhone}
                      onChange={(e) => setEmergPhone(e.target.value)}
                      className="rounded-xl border border-slate-200 px-3 py-2 text-xs focus:border-emerald-500 focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* SECTION 2: Portal Credentials */}
              <div className="rounded-xl border border-emerald-100 bg-emerald-50/40 p-3.5 space-y-3">
                <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-800">
                  <Key className="h-3.5 w-3.5 text-emerald-600" />
                  <span>Pet Owner Portal Account Credentials</span>
                </div>
                <div className="grid gap-3 sm:grid-cols-2 text-xs">
                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block mb-1">Username</label>
                    <div className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-slate-700 font-mono text-xs">
                      {email ? email.split('@')[0] : 'client username (derived from email)'}
                    </div>
                  </div>
                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block mb-1">Temporary Password</label>
                    <input
                      type="text"
                      value={clientPassword}
                      onChange={(e) => setClientPassword(e.target.value)}
                      placeholder="e.g. client1234"
                      className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-mono focus:border-emerald-500 focus:outline-none"
                    />
                  </div>
                </div>
                <p className="text-[10px] text-slate-500">
                  The client can sign in immediately at the portal with either their email or username and this password.
                </p>
              </div>

              {/* SECTION 3: Pet Patient Registration */}
              <div className="border-t border-slate-100 pt-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Heart className="h-3.5 w-3.5 text-rose-500" />
                    <span className="text-xs font-bold text-slate-800">Register Pet Patient</span>
                  </div>
                  <label className="flex items-center gap-2 text-xs text-slate-600 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={includePet}
                      onChange={(e) => setIncludePet(e.target.checked)}
                      className="rounded text-emerald-600 focus:ring-emerald-500 h-3.5 w-3.5"
                    />
                    <span>Attach pet to this account</span>
                  </label>
                </div>

                {includePet && (
                  <div className="space-y-4 rounded-xl border border-slate-100 bg-slate-50/50 p-4">
                    {/* Pet Picture Upload Section */}
                    <div>
                      <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1.5">
                        Pet Picture
                      </label>
                      <div className="flex items-start gap-4">
                        {petPhoto ? (
                          <div className="relative">
                            <img
                              src={petPhoto}
                              alt="Pet preview"
                              className="h-20 w-20 rounded-xl object-cover ring-2 ring-emerald-500 shadow-sm"
                            />
                            <button
                              type="button"
                              onClick={() => setPetPhoto('')}
                              className="absolute -top-1.5 -right-1.5 bg-rose-500 text-white rounded-full p-1 hover:bg-rose-600 shadow cursor-pointer"
                              title="Remove photo"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </div>
                        ) : (
                          <label className="flex flex-col items-center justify-center h-20 w-24 border-2 border-dashed border-slate-200 rounded-xl cursor-pointer hover:border-emerald-500 hover:bg-emerald-50/30 transition-all bg-white">
                            <Camera className="h-5 w-5 text-slate-400" />
                            <span className="text-[10px] text-slate-500 mt-1 font-medium">Upload File</span>
                            <input
                              type="file"
                              accept="image/*"
                              onChange={handlePhotoUpload}
                              className="hidden"
                            />
                          </label>
                        )}
                        <div className="flex-1 space-y-1.5">
                          <label className="text-[10px] font-medium text-slate-500 block">
                            Or paste image web link / URL:
                          </label>
                          <input
                            type="text"
                            value={petPhoto}
                            placeholder="https://images.unsplash.com/..."
                            onChange={(e) => setPetPhoto(e.target.value)}
                            className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs focus:border-emerald-500 focus:outline-none"
                          />
                          <p className="text-[10px] text-slate-400">
                            Upload a photo from your computer (PNG, JPG) or specify an image link.
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="grid gap-3 sm:grid-cols-2">
                      <div>
                        <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">Pet Name *</label>
                        <input
                          type="text"
                          required={includePet}
                          value={petName}
                          placeholder="e.g. Luna / Milo"
                          onChange={(e) => setPetName(e.target.value)}
                          className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs focus:border-emerald-500 focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">Species *</label>
                        <select
                          value={petSpecies}
                          onChange={(e) => setPetSpecies(e.target.value)}
                          className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs focus:border-emerald-500 focus:outline-none"
                        >
                          <option value="Dog">Dog</option>
                          <option value="Cat">Cat</option>
                          <option value="Rabbit">Rabbit</option>
                          <option value="Bird">Bird</option>
                          <option value="Reptile">Reptile</option>
                          <option value="Other">Other</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid gap-3 sm:grid-cols-3">
                      <div>
                        <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">Breed *</label>
                        <input
                          type="text"
                          required={includePet}
                          value={petBreed}
                          placeholder="e.g. Golden Retriever"
                          onChange={(e) => setPetBreed(e.target.value)}
                          className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs focus:border-emerald-500 focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">Gender *</label>
                        <select
                          value={petGender}
                          onChange={(e) => setPetGender(e.target.value as any)}
                          className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs focus:border-emerald-500 focus:outline-none"
                        >
                          <option value="Neutered Male">Neutered Male</option>
                          <option value="Spayed Female">Spayed Female</option>
                          <option value="Male">Male</option>
                          <option value="Female">Female</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">Weight (kg) *</label>
                        <input
                          type="number"
                          step="0.1"
                          required={includePet}
                          value={petWeight}
                          placeholder="e.g. 12.5"
                          onChange={(e) => setPetWeight(e.target.value)}
                          className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs focus:border-emerald-500 focus:outline-none"
                        />
                      </div>
                    </div>

                    <div className="grid gap-3 sm:grid-cols-3">
                      <div>
                        <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">Coloring</label>
                        <input
                          type="text"
                          value={petColor}
                          placeholder="e.g. Golden / Fawn"
                          onChange={(e) => setPetColor(e.target.value)}
                          className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs focus:border-emerald-500 focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">Date of Birth</label>
                        <input
                          type="date"
                          value={petDob}
                          onChange={(e) => setPetDob(e.target.value)}
                          className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs focus:border-emerald-500 focus:outline-none font-mono"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">Microchip Number</label>
                        <input
                          type="text"
                          value={petMicrochip}
                          placeholder="15-digit code or blank"
                          onChange={(e) => setPetMicrochip(e.target.value)}
                          className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs focus:border-emerald-500 focus:outline-none"
                        />
                      </div>
                    </div>

                    <div className="grid gap-3 sm:grid-cols-2">
                      <div>
                        <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">Allergies</label>
                        <input
                          type="text"
                          value={petAllergies}
                          placeholder="e.g. Penicillin, Chicken"
                          onChange={(e) => setPetAllergies(e.target.value)}
                          className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs focus:border-emerald-500 focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">Special Care Notes</label>
                        <input
                          type="text"
                          value={petNotes}
                          placeholder="Behavioral or dietary instructions"
                          onChange={(e) => setPetNotes(e.target.value)}
                          className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs focus:border-emerald-500 focus:outline-none"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex gap-2 justify-end border-t border-slate-100 pt-4">
                <button
                  type="button"
                  onClick={() => setShowAddClient(false)}
                  className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-500 hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-emerald-600 px-5 py-2 text-xs font-semibold text-white hover:bg-emerald-700 shadow-sm cursor-pointer"
                >
                  Provision Client & Register Pet
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showAddPet && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-xl rounded-2xl bg-white p-6 shadow-2xl border border-slate-100 max-h-[85vh] overflow-y-auto">
            <h3 className="text-sm font-bold text-slate-800 border-b border-slate-100 pb-3">Register New Pet Patient</h3>
            <form onSubmit={handleCreatePet} className="mt-4 space-y-4">
              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">Pet Name *</label>
                <input
                  type="text"
                  required
                  value={petName}
                  onChange={(e) => setPetName(e.target.value)}
                  placeholder="e.g. Bella"
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1.5">
                  Pet Picture
                </label>
                <div className="flex items-start gap-4">
                  {petPhoto ? (
                    <div className="relative">
                      <img
                        src={petPhoto}
                        alt="Pet preview"
                        className="h-16 w-16 rounded-xl object-cover ring-2 ring-emerald-500 shadow-sm"
                      />
                      <button
                        type="button"
                        onClick={() => setPetPhoto('')}
                        className="absolute -top-1.5 -right-1.5 bg-rose-500 text-white rounded-full p-1 hover:bg-rose-600 shadow cursor-pointer"
                        title="Remove photo"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ) : (
                    <label className="flex flex-col items-center justify-center h-16 w-20 border-2 border-dashed border-slate-200 rounded-xl cursor-pointer hover:border-emerald-500 hover:bg-emerald-50/30 transition-all bg-white">
                      <Camera className="h-4 w-4 text-slate-400" />
                      <span className="text-[9px] text-slate-500 mt-0.5 font-medium">Upload</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handlePhotoUpload}
                        className="hidden"
                      />
                    </label>
                  )}
                  <div className="flex-1 space-y-1">
                    <input
                      type="text"
                      value={petPhoto}
                      placeholder="Or enter photo URL (https://...)"
                      onChange={(e) => setPetPhoto(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs focus:border-emerald-500 focus:outline-none"
                    />
                    <span className="text-[10px] text-slate-400 block">
                      Choose an image file from your device or paste a web address.
                    </span>
                  </div>
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-3">
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">Species</label>
                  <select
                    value={petSpecies}
                    onChange={(e) => setPetSpecies(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs bg-white focus:border-emerald-500 focus:outline-none"
                  >
                    <option value="Dog">Dog</option>
                    <option value="Cat">Cat</option>
                    <option value="Rabbit">Rabbit</option>
                    <option value="Bird">Bird</option>
                    <option value="Reptile">Reptile</option>
                  </select>
                </div>
                <div className="sm:col-span-2">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">Breed Description</label>
                  <input
                    type="text"
                    required
                    value={petBreed}
                    placeholder="e.g. Shiba Inu / Golden Retriever"
                    onChange={(e) => setPetBreed(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs focus:border-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-3">
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">Weight (kg)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={petWeight}
                    onChange={(e) => setPetWeight(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs focus:border-emerald-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">Coloring</label>
                  <input
                    type="text"
                    required
                    value={petColor}
                    placeholder="e.g. Brindle / Seal"
                    onChange={(e) => setPetColor(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs focus:border-emerald-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">Date of Birth</label>
                  <input
                    type="date"
                    required
                    value={petDob}
                    onChange={(e) => setPetDob(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs focus:border-emerald-500 focus:outline-none font-mono"
                  />
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">Gender Registry</label>
                  <select
                    value={petGender}
                    onChange={(e) => setPetGender(e.target.value as any)}
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs bg-white focus:border-emerald-500 focus:outline-none"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Neutered Male">Neutered Male</option>
                    <option value="Spayed Female">Spayed Female</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">Microchip Stamp ID</label>
                  <input
                    type="text"
                    value={petMicrochip}
                    placeholder="15-digit code or blank"
                    onChange={(e) => setPetMicrochip(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs focus:border-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">Biological Allergies</label>
                <input
                  type="text"
                  value={petAllergies}
                  placeholder="e.g. Beef, Penicillin..."
                  onChange={(e) => setPetAllergies(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">Critical Care Notes</label>
                <textarea
                  value={petNotes}
                  rows={2}
                  placeholder="Special behavioral instructions..."
                  onChange={(e) => setPetNotes(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div className="flex gap-2 justify-end border-t border-slate-50 pt-4">
                <button
                  type="button"
                  onClick={() => setShowAddPet(false)}
                  className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-500 hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-emerald-600 px-4 py-2 text-xs font-semibold text-white hover:bg-emerald-700 cursor-pointer"
                >
                  Confirm Registration
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* RENDER EDIT CLIENT WORKSPACE */}
      {showEditClient && selectedClient && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-xl rounded-2xl bg-white p-6 shadow-2xl border border-slate-100">
            <h3 className="text-sm font-bold text-slate-800 border-b border-slate-100 pb-3">Edit Client Profile</h3>
            <form onSubmit={handleEditClientSubmit} className="mt-4 space-y-4">
              <div className="grid gap-3 sm:grid-cols-2">
                <input
                  type="text" required value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="First Name" className="rounded-xl border border-slate-200 px-3 py-2 text-xs"
                />
                <input
                  type="text" required value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="Last Name" className="rounded-xl border border-slate-200 px-3 py-2 text-xs"
                />
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <input
                  type="text" required value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="Phone" className="rounded-xl border border-slate-200 px-3 py-2 text-xs"
                />
                <input
                  type="email" required value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Email" className="rounded-xl border border-slate-200 px-3 py-2 text-xs"
                />
              </div>
              <input
                type="text" required value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Address" className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs"
              />
              <div className="flex gap-2 justify-end border-t border-slate-50 pt-4">
                <button
                  type="button" onClick={() => setShowEditClient(false)}
                  className="rounded-xl border border-slate-200 px-4 py-2 text-xs text-slate-500 hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-emerald-600 px-4 py-2 text-xs font-semibold text-white hover:bg-emerald-700 cursor-pointer"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* RENDER EDIT PET WORKSPACE */}
      {showEditPet && selectedPet && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-xl rounded-2xl bg-white p-6 shadow-2xl border border-slate-100 max-h-[85vh] overflow-y-auto">
            <h3 className="text-sm font-bold text-slate-800 border-b border-slate-100 pb-3">Edit Pet Patient</h3>
            <form onSubmit={handleEditPetSubmit} className="mt-4 space-y-4">
              <input
                type="text" required value={petName}
                onChange={(e) => setPetName(e.target.value)}
                placeholder="Pet Name" className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs"
              />
              <input
                type="text" value={petPhoto}
                onChange={(e) => setPetPhoto(e.target.value)}
                placeholder="Photo URL" className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs"
              />
              <input
                type="text" required value={petBreed}
                onChange={(e) => setPetBreed(e.target.value)}
                placeholder="Breed" className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs"
              />
              <div className="grid gap-3 sm:grid-cols-2">
                <input
                  type="number" step="0.01" required value={petWeight}
                  onChange={(e) => setPetWeight(e.target.value)}
                  placeholder="Weight" className="rounded-xl border border-slate-200 px-3 py-2 text-xs"
                />
                <input
                  type="text" required value={petColor}
                  onChange={(e) => setPetColor(e.target.value)}
                  placeholder="Coloring" className="rounded-xl border border-slate-200 px-3 py-2 text-xs"
                />
              </div>
              <div className="flex gap-2 justify-end border-t border-slate-50 pt-4">
                <button
                  type="button" onClick={() => setShowEditPet(false)}
                  className="rounded-xl border border-slate-200 px-4 py-2 text-xs text-slate-500 hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-emerald-600 px-4 py-2 text-xs font-semibold text-white hover:bg-emerald-700 cursor-pointer"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CREDENTIALS PROVISIONING SUCCESS MODAL */}
      {createdCredentialAlert && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl border border-slate-100 transform duration-300">
            <div className="flex items-start gap-3.5">
              <div className="h-10 w-10 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center flex-shrink-0">
                <CheckCircle2 className="h-6 w-6" />
              </div>
              <div className="flex-1">
                <h3 className="text-base font-bold text-slate-800">Client Account Provisioned</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Account successfully created and enrolled in Pet Owner Portal.
                </p>
              </div>
            </div>

            <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50/70 p-3.5 space-y-2.5 text-xs">
              <div className="flex justify-between items-center py-0.5 border-b border-slate-200/60">
                <span className="text-slate-400 font-medium">Client:</span>
                <span className="font-bold text-slate-800">{createdCredentialAlert.clientName}</span>
              </div>
              {createdCredentialAlert.petName && (
                <div className="flex justify-between items-center py-0.5 border-b border-slate-200/60">
                  <span className="text-slate-400 font-medium">Registered Pet:</span>
                  <span className="font-bold text-emerald-700">{createdCredentialAlert.petName}</span>
                </div>
              )}
              <div className="flex justify-between items-center py-0.5 border-b border-slate-200/60">
                <span className="text-slate-400 font-medium">Login Identity (Email):</span>
                <span className="font-mono text-slate-700 font-semibold">{createdCredentialAlert.email}</span>
              </div>
              <div className="flex justify-between items-center py-0.5 border-b border-slate-200/60">
                <span className="text-slate-400 font-medium">Portal Username:</span>
                <span className="font-mono text-slate-800 font-bold bg-white px-2 py-0.5 rounded border border-slate-200">
                  {createdCredentialAlert.username}
                </span>
              </div>
              <div className="flex justify-between items-center py-0.5">
                <span className="text-slate-400 font-medium">Temporary Password:</span>
                <span className="font-mono text-emerald-800 font-bold bg-white px-2 py-0.5 rounded border border-emerald-200">
                  {createdCredentialAlert.password}
                </span>
              </div>
            </div>

            <div className="mt-4 flex flex-col gap-2">
              <button
                type="button"
                onClick={() => {
                  const text = `Pet Owner Portal Credentials\nClient: ${createdCredentialAlert.clientName}\nUsername: ${createdCredentialAlert.username}\nEmail: ${createdCredentialAlert.email}\nPassword: ${createdCredentialAlert.password}\nPortal: Sign in as Pet Owner`;
                  navigator.clipboard.writeText(text);
                  setCopiedPass(true);
                  setTimeout(() => setCopiedPass(false), 2000);
                }}
                className="w-full flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer transition-colors"
              >
                {copiedPass ? (
                  <>
                    <Check className="h-4 w-4 text-emerald-600" />
                    <span className="text-emerald-700">Credentials Copied to Clipboard!</span>
                  </>
                ) : (
                  <>
                    <Copy className="h-4 w-4 text-slate-500" />
                    <span>Copy Login Credentials</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => {
                  setCreatedCredentialAlert(null);
                  setCopiedPass(false);
                }}
                className="w-full rounded-xl bg-emerald-600 py-2.5 text-xs font-semibold text-white hover:bg-emerald-700 cursor-pointer shadow-sm"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
