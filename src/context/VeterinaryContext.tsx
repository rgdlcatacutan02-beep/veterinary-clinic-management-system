/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  User,
  Client,
  Pet,
  Appointment,
  MedicalRecord,
  Vaccination,
  Prescription,
  LabRecord,
  Surgery,
  Invoice,
  InventoryItem,
  Supplier,
  Notification,
  AuditLog,
  UserRole,
  PaymentMethod,
  AppointmentStatus,
  AppointmentType,
  PrescriptionStatus
} from '../types';
import {
  SEED_USERS,
  SEED_CLIENTS,
  SEED_PETS,
  SEED_APPOINTMENTS,
  SEED_MEDICAL_RECORDS,
  SEED_VACCINATIONS,
  SEED_PRESCRIPTIONS,
  SEED_LAB_RECORDS,
  SEED_SURGERIES,
  SEED_INVOICES,
  SEED_INVENTORIES,
  SEED_SUPPLIERS,
  SEED_NOTIFICATIONS,
  SEED_AUDIT_LOGS
} from '../data/seedData';

interface VeterinaryContextType {
  currentUser: User | null;
  users: User[];
  clients: Client[];
  pets: Pet[];
  appointments: Appointment[];
  medicalRecords: MedicalRecord[];
  vaccinations: Vaccination[];
  prescriptions: Prescription[];
  labRecords: LabRecord[];
  surgeries: Surgery[];
  invoices: Invoice[];
  inventoryItems: InventoryItem[];
  suppliers: Supplier[];
  notifications: Notification[];
  auditLogs: AuditLog[];
  
  // Auth Functions
  setCurrentUser: (user: User | null) => void;
  loginAs: (role: UserRole, email?: string) => boolean;
  loginWithCredentials: (identifier: string, password: string) => { success: boolean; message?: string };
  logout: () => void;
  
  // User & Staff Management
  addUser: (userData: Omit<User, 'id'>) => User;
  updateUser: (user: User) => void;
  deleteUser: (id: string) => boolean;
  addStaff: (name: string, email: string, role: UserRole, phone?: string) => User;
  toggleStaffStatus: (id: string) => void;
  addClient: (client: Omit<Client, 'id' | 'registrationDate'> & { username?: string; password?: string }) => Client;
  addClientWithPet: (params: {
    client: Omit<Client, 'id' | 'registrationDate'>;
    credentials?: { username?: string; password?: string };
    pet?: {
      name: string;
      photoUrl?: string;
      species: string;
      breed: string;
      gender: 'Male' | 'Female' | 'Neutered Male' | 'Spayed Female';
      dob: string;
      weight: number;
      color: string;
      microchipNumber?: string;
      allergies?: string;
      specialNotes?: string;
    };
  }) => { client: Client; user: User; pet?: Pet };
  updateClient: (client: Client) => void;
  deleteClient: (id: string) => void;
  
  // Pet CRUD
  addPet: (pet: Omit<Pet, 'id' | 'weightHistory'> & { weight: number }) => Pet;
  updatePet: (pet: Pet) => void;
  addWeightToPet: (petId: string, weight: number, date: string) => void;
  deletePet: (id: string) => void;
  
  // Appointment CRUD
  addAppointment: (app: Omit<Appointment, 'id'>) => Appointment;
  updateAppointment: (app: Appointment) => void;
  
  // Medical Records
  addMedicalRecord: (rec: Omit<MedicalRecord, 'id'>) => MedicalRecord;
  updateMedicalRecord: (rec: MedicalRecord) => void;
  
  // Vaccinations
  addVaccination: (vac: Omit<Vaccination, 'id'>) => Vaccination;
  updateVaccination: (vac: Vaccination) => void;
  
  // Prescriptions
  addPrescription: (pres: Omit<Prescription, 'id'>) => Prescription;
  updatePrescription: (pres: Prescription) => void;
  
  // Lab Records
  addLabRecord: (lab: Omit<LabRecord, 'id'>) => LabRecord;
  updateLabRecord: (lab: LabRecord) => void;
  
  // Surgeries
  addSurgery: (surg: Omit<Surgery, 'id'>) => Surgery;
  updateSurgery: (surg: Surgery) => void;
  
  // Billing & Payments
  addInvoice: (inv: Omit<Invoice, 'id' | 'subtotal' | 'tax' | 'totalAmount' | 'paidAmount' | 'status' | 'payments'>) => Invoice;
  addPaymentToInvoice: (invoiceId: string, amount: number, method: PaymentMethod, refNo?: string) => void;
  
  // Inventory
  addInventoryItem: (item: Omit<InventoryItem, 'id'>) => InventoryItem;
  updateInventoryItem: (item: InventoryItem) => void;
  adjustStock: (itemId: string, change: number, reason: string) => void;
  
  // Suppliers
  addSupplier: (supplier: Omit<Supplier, 'id'>) => Supplier;
  
  // Notifications
  markNotificationRead: (id: string) => void;
  clearNotifications: () => void;
  addSystemNotification: (title: string, message: string, type: Notification['type'], role?: UserRole, clientId?: string) => void;
  resetToDemoData: () => void;
}

const VeterinaryContext = createContext<VeterinaryContextType | undefined>(undefined);

export const VeterinaryProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Load data from LocalStorage if exists, else fallback to initial seed
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const sessionActive = sessionStorage.getItem('vet_session_active');
    if (sessionActive === 'true') {
      const saved = localStorage.getItem('vet_current_user');
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch {
          return null;
        }
      }
    }
    return null;
  });

  const [users, setUsers] = useState<User[]>(() => {
    const saved = localStorage.getItem('vet_users');
    if (saved) {
      try {
        const parsed: User[] = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch {
        return SEED_USERS;
      }
    }
    return SEED_USERS;
  });

  const [clients, setClients] = useState<Client[]>(() => {
    const saved = localStorage.getItem('vet_clients');
    if (saved) {
      try {
        const parsed: Client[] = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch {
        return SEED_CLIENTS;
      }
    }
    return SEED_CLIENTS;
  });

  const [pets, setPets] = useState<Pet[]>(() => {
    const saved = localStorage.getItem('vet_pets');
    if (saved) {
      try {
        const parsed: Pet[] = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch {
        return SEED_PETS;
      }
    }
    return SEED_PETS;
  });

  const [appointments, setAppointments] = useState<Appointment[]>(() => {
    const saved = localStorage.getItem('vet_appointments');
    if (saved) {
      try {
        const parsed: Appointment[] = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch {
        return SEED_APPOINTMENTS;
      }
    }
    return SEED_APPOINTMENTS;
  });

  const [medicalRecords, setMedicalRecords] = useState<MedicalRecord[]>(() => {
    const saved = localStorage.getItem('vet_medical_records');
    return saved ? JSON.parse(saved) : SEED_MEDICAL_RECORDS;
  });

  const [vaccinations, setVaccinations] = useState<Vaccination[]>(() => {
    const saved = localStorage.getItem('vet_vaccinations');
    return saved ? JSON.parse(saved) : SEED_VACCINATIONS;
  });

  const [prescriptions, setPrescriptions] = useState<Prescription[]>(() => {
    const saved = localStorage.getItem('vet_prescriptions');
    return saved ? JSON.parse(saved) : SEED_PRESCRIPTIONS;
  });

  const [labRecords, setLabRecords] = useState<LabRecord[]>(() => {
    const saved = localStorage.getItem('vet_lab_records');
    return saved ? JSON.parse(saved) : SEED_LAB_RECORDS;
  });

  const [surgeries, setSurgeries] = useState<Surgery[]>(() => {
    const saved = localStorage.getItem('vet_surgeries');
    return saved ? JSON.parse(saved) : SEED_SURGERIES;
  });

  const [invoices, setInvoices] = useState<Invoice[]>(() => {
    const saved = localStorage.getItem('vet_invoices');
    return saved ? JSON.parse(saved) : SEED_INVOICES;
  });

  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>(() => {
    const saved = localStorage.getItem('vet_inventory');
    return saved ? JSON.parse(saved) : SEED_INVENTORIES;
  });

  const [suppliers, setSuppliers] = useState<Supplier[]>(() => {
    const saved = localStorage.getItem('vet_suppliers');
    return saved ? JSON.parse(saved) : SEED_SUPPLIERS;
  });

  const [notifications, setNotifications] = useState<Notification[]>(() => {
    const saved = localStorage.getItem('vet_notifications');
    return saved ? JSON.parse(saved) : SEED_NOTIFICATIONS;
  });

  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(() => {
    const saved = localStorage.getItem('vet_audit_logs');
    return saved ? JSON.parse(saved) : SEED_AUDIT_LOGS;
  });

  // Sync state changes to LocalStorage
  useEffect(() => {
    localStorage.setItem('vet_current_user', JSON.stringify(currentUser));
  }, [currentUser]);

  useEffect(() => {
    localStorage.setItem('vet_users', JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    localStorage.setItem('vet_clients', JSON.stringify(clients));
  }, [clients]);

  useEffect(() => {
    localStorage.setItem('vet_pets', JSON.stringify(pets));
  }, [pets]);

  useEffect(() => {
    localStorage.setItem('vet_appointments', JSON.stringify(appointments));
  }, [appointments]);

  useEffect(() => {
    localStorage.setItem('vet_medical_records', JSON.stringify(medicalRecords));
  }, [medicalRecords]);

  useEffect(() => {
    localStorage.setItem('vet_vaccinations', JSON.stringify(vaccinations));
  }, [vaccinations]);

  useEffect(() => {
    localStorage.setItem('vet_prescriptions', JSON.stringify(prescriptions));
  }, [prescriptions]);

  useEffect(() => {
    localStorage.setItem('vet_lab_records', JSON.stringify(labRecords));
  }, [labRecords]);

  useEffect(() => {
    localStorage.setItem('vet_surgeries', JSON.stringify(surgeries));
  }, [surgeries]);

  useEffect(() => {
    localStorage.setItem('vet_invoices', JSON.stringify(invoices));
  }, [invoices]);

  useEffect(() => {
    localStorage.setItem('vet_inventory', JSON.stringify(inventoryItems));
  }, [inventoryItems]);

  useEffect(() => {
    localStorage.setItem('vet_suppliers', JSON.stringify(suppliers));
  }, [suppliers]);

  useEffect(() => {
    localStorage.setItem('vet_notifications', JSON.stringify(notifications));
  }, [notifications]);

  useEffect(() => {
    localStorage.setItem('vet_audit_logs', JSON.stringify(auditLogs));
  }, [auditLogs]);


  // Helper: Write Audit Log
  const addAuditLog = (
    action: string,
    affectedRecordId?: string,
    entityType?: string,
    details?: string
  ) => {
    if (!currentUser) return;
    const newLog: AuditLog = {
      id: `LOG-${Date.now()}`,
      userId: currentUser.id,
      userName: currentUser.name,
      userRole: currentUser.role,
      action,
      timestamp: new Date().toISOString(),
      affectedRecordId,
      entityType: entityType || 'Clinical System',
      entityId: affectedRecordId,
      details: details || action
    };
    setAuditLogs(prev => [newLog, ...prev]);
  };

  // Helper: Reset database to complete demo data
  const resetToDemoData = () => {
    const keysToRemove = [
      'vet_current_user',
      'vet_users',
      'vet_clients',
      'vet_pets',
      'vet_appointments',
      'vet_medical_records',
      'vet_vaccinations',
      'vet_prescriptions',
      'vet_lab_records',
      'vet_surgeries',
      'vet_invoices',
      'vet_inventory',
      'vet_suppliers',
      'vet_notifications',
      'vet_audit_logs'
    ];
    keysToRemove.forEach(k => localStorage.removeItem(k));
    sessionStorage.removeItem('vet_session_active');

    setUsers(SEED_USERS);
    setClients(SEED_CLIENTS);
    setPets(SEED_PETS);
    setAppointments(SEED_APPOINTMENTS);
    setMedicalRecords(SEED_MEDICAL_RECORDS);
    setVaccinations(SEED_VACCINATIONS);
    setPrescriptions(SEED_PRESCRIPTIONS);
    setLabRecords(SEED_LAB_RECORDS);
    setSurgeries(SEED_SURGERIES);
    setInvoices(SEED_INVOICES);
    setInventoryItems(SEED_INVENTORIES);
    setSuppliers(SEED_SUPPLIERS);
    setNotifications(SEED_NOTIFICATIONS);
    setAuditLogs(SEED_AUDIT_LOGS);
    setCurrentUser(null);
  };

  // Helper: Add Notification
  const addSystemNotification = (
    title: string,
    message: string,
    type: Notification['type'],
    targetRole?: UserRole,
    targetClientId?: string
  ) => {
    const newNotify: Notification = {
      id: `NTF-${Date.now()}`,
      title,
      message,
      type,
      date: new Date().toISOString().split('T')[0],
      read: false,
      targetRole,
      targetClientId
    };
    setNotifications(prev => [newNotify, ...prev]);
  };

  // Authentication
  const loginWithCredentials = (identifier: string, pass: string): { success: boolean; message?: string } => {
    const trimmedId = identifier.trim().toLowerCase();
    const trimmedPass = pass.trim();

    if (!trimmedId || !trimmedPass) {
      return { success: false, message: 'Please enter both your username or email and password.' };
    }

    // Match by username, email, or 'admin' keyword
    const matchedUser = users.find(u => {
      const uUsername = (u.username || '').toLowerCase();
      const uEmail = (u.email || '').toLowerCase();
      if (trimmedId === 'admin' && u.role === 'Admin') return true;
      return uUsername === trimmedId || uEmail === trimmedId;
    });

    if (!matchedUser) {
      return { success: false, message: 'Invalid username or email. Please check your credentials.' };
    }

    if (!matchedUser.isActive) {
      return { success: false, message: 'This account has been deactivated. Please contact an administrator.' };
    }

    const expectedPass = matchedUser.password || (matchedUser.role === 'Admin' ? 'admin1234' : 'staff1234');
    if (trimmedPass !== expectedPass) {
      return { success: false, message: 'Incorrect password. Please try again.' };
    }

    sessionStorage.setItem('vet_session_active', 'true');
    setCurrentUser(matchedUser);

    const newLog: AuditLog = {
      id: `LOG-${Date.now()}`,
      userId: matchedUser.id,
      userName: matchedUser.name,
      userRole: matchedUser.role,
      action: `User authenticated credentials successfully as ${matchedUser.role}.`,
      timestamp: new Date().toISOString()
    };
    setAuditLogs(prev => [newLog, ...prev]);

    return { success: true };
  };

  const loginAs = (role: UserRole, email?: string): boolean => {
    const matchedUser = users.find(u => u.role === role && (!email || u.email.toLowerCase() === email.toLowerCase()));
    if (matchedUser) {
      if (!matchedUser.isActive) return false;
      sessionStorage.setItem('vet_session_active', 'true');
      setCurrentUser(matchedUser);
      // Log login
      const newLog: AuditLog = {
        id: `LOG-${Date.now()}`,
        userId: matchedUser.id,
        userName: matchedUser.name,
        userRole: matchedUser.role,
        action: `User switched session role to ${matchedUser.role}.`,
        timestamp: new Date().toISOString()
      };
      setAuditLogs(prev => [newLog, ...prev]);
      return true;
    }
    return false;
  };

  const logout = () => {
    sessionStorage.removeItem('vet_session_active');
    localStorage.removeItem('vet_current_user');
    if (currentUser) {
      const newLog: AuditLog = {
        id: `LOG-${Date.now()}`,
        userId: currentUser.id,
        userName: currentUser.name,
        userRole: currentUser.role,
        action: `User logged out.`,
        timestamp: new Date().toISOString()
      };
      setAuditLogs(prev => [newLog, ...prev]);
    }
    setCurrentUser(null);
  };

  // Client management
  const addClient = (clientData: Omit<Client, 'id' | 'registrationDate'>): Client => {
    const newId = `CLI-${Date.now().toString().slice(-4)}`;
    const newClient: Client = {
      ...clientData,
      id: newId,
      registrationDate: new Date().toISOString().split('T')[0]
    };
    setClients(prev => [...prev, newClient]);
    
    // Also create a secure user login for this pet owner
    const newPetOwnerUser: User = {
      id: `USR-C-${newId}`,
      name: `${clientData.firstName} ${clientData.lastName}`,
      email: clientData.email,
      role: 'Pet Owner',
      clientId: newId,
      isActive: true
    };
    setUsers(prev => [...prev, newPetOwnerUser]);

    addAuditLog(`Registered new client: ${clientData.firstName} ${clientData.lastName}`, newId);
    return newClient;
  };

  const addClientWithPet = (
    clientData: Omit<Client, 'id' | 'registrationDate'>,
    petData: Omit<Pet, 'id' | 'clientId' | 'weightHistory'> & { weight: number },
    temporaryPassword?: string
  ): { client: Client; pet: Pet; user: User } => {
    const timestamp = Date.now().toString().slice(-4);
    const clientId = `CLI-${timestamp}`;
    const newClient: Client = {
      ...clientData,
      id: clientId,
      registrationDate: new Date().toISOString().split('T')[0]
    };

    const petId = `PET-${timestamp}`;
    const newPet: Pet = {
      ...petData,
      id: petId,
      clientId: clientId,
      photoUrl: petData.photoUrl || 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=150&auto=format&fit=crop&q=60',
      weightHistory: [{ date: new Date().toISOString().split('T')[0], weight: petData.weight }]
    };

    const username = clientData.email.split('@')[0].toLowerCase().replace(/[^a-z0-9]/g, '') || `client${timestamp}`;
    const password = temporaryPassword || 'client1234';

    const newUser: User = {
      id: `USR-C-${clientId}`,
      name: `${clientData.firstName} ${clientData.lastName}`,
      username: username,
      email: clientData.email,
      password: password,
      role: 'Pet Owner',
      clientId: clientId,
      phone: clientData.phone,
      isActive: true
    };

    setClients(prev => [...prev, newClient]);
    setPets(prev => [...prev, newPet]);
    setUsers(prev => [...prev, newUser]);

    addAuditLog(`Admin registered new client account: ${clientData.firstName} ${clientData.lastName} with pet ${petData.name}`, clientId);

    return { client: newClient, pet: newPet, user: newUser };
  };

  const updateClient = (client: Client) => {
    setClients(prev => prev.map(c => c.id === client.id ? client : c));
    
    // Update user linked to client email/name
    setUsers(prev => prev.map(u => {
      if (u.clientId === client.id) {
        return { ...u, name: `${client.firstName} ${client.lastName}`, email: client.email };
      }
      return u;
    }));

    addAuditLog(`Updated profile details for client: ${client.firstName} ${client.lastName}`, client.id);
  };

  const deleteClient = (id: string) => {
    const client = clients.find(c => c.id === id);
    if (!client) return;
    setClients(prev => prev.filter(c => c.id !== id));
    // Soft-deactivate user account
    setUsers(prev => prev.map(u => u.clientId === id ? { ...u, isActive: false } : u));
    addAuditLog(`Deactivated client account and records: ${client.firstName} ${client.lastName}`, id);
  };

  // Pet management
  const addPet = (petData: Omit<Pet, 'id' | 'weightHistory'> & { weight: number }): Pet => {
    const newId = `PET-${Date.now().toString().slice(-4)}`;
    const newPet: Pet = {
      id: newId,
      clientId: petData.clientId,
      name: petData.name,
      photoUrl: petData.photoUrl || 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=150&auto=format&fit=crop&q=60',
      species: petData.species,
      breed: petData.breed,
      gender: petData.gender,
      dob: petData.dob,
      weight: petData.weight,
      weightHistory: [{ date: new Date().toISOString().split('T')[0], weight: petData.weight }],
      color: petData.color,
      microchipNumber: petData.microchipNumber,
      allergies: petData.allergies,
      specialNotes: petData.specialNotes
    };
    setPets(prev => [...prev, newPet]);
    
    const owner = clients.find(c => c.id === petData.clientId);
    const ownerName = owner ? `${owner.firstName} ${owner.lastName}` : 'Unknown';
    addAuditLog(`Registered new pet: ${petData.name} (${petData.species}) for owner: ${ownerName}`, newId);
    return newPet;
  };

  const updatePet = (pet: Pet) => {
    setPets(prev => prev.map(p => p.id === pet.id ? pet : p));
    addAuditLog(`Updated profile details for pet: ${pet.name}`, pet.id);
  };

  const addWeightToPet = (petId: string, weight: number, date: string) => {
    setPets(prev => prev.map(p => {
      if (p.id === petId) {
        const alreadyExists = p.weightHistory.find(wh => wh.date === date);
        const newHistory = alreadyExists 
          ? p.weightHistory.map(wh => wh.date === date ? { ...wh, weight } : wh)
          : [...p.weightHistory, { date, weight }].sort((a, b) => a.date.localeCompare(b.date));
        return {
          ...p,
          weight, // Update current weight
          weightHistory: newHistory
        };
      }
      return p;
    }));
    const pet = pets.find(p => p.id === petId);
    addAuditLog(`Updated weight tracking for pet: ${pet?.name || petId} (Set to ${weight}kg)`, petId);
  };

  const deletePet = (id: string) => {
    const pet = pets.find(p => p.id === id);
    if (!pet) return;
    setPets(prev => prev.filter(p => p.id !== id));
    addAuditLog(`Deregistered pet details: ${pet.name}`, id);
  };

  // Appointment management
  const addAppointment = (appData: Omit<Appointment, 'id'>): Appointment => {
    const newId = `APP-${Date.now().toString().slice(-4)}`;
    const newApp: Appointment = {
      ...appData,
      id: newId
    };
    setAppointments(prev => [...prev, newApp]);

    const petName = pets.find(p => p.id === appData.petId)?.name || 'Unknown';
    addAuditLog(`Created appointment for pet: ${petName} on ${appData.date} at ${appData.time}`, newId);

    // If client created this appointment, alert the receptionist and admin
    if (currentUser?.role === 'Pet Owner') {
      addSystemNotification(
        'Appointment Selection Requested',
        `Client ${currentUser.name} requested an appointment for ${petName} on ${appData.date} at ${appData.time}.`,
        'appointment',
        'Receptionist'
      );
    } else {
      // Alert pet owner
      const pet = pets.find(p => p.id === appData.petId);
      if (pet) {
        addSystemNotification(
          'Appointment Scheduled',
          `Your pet ${pet.name} is scheduled for a ${appData.type} on ${appData.date} at ${appData.time}.`,
          'appointment',
          'Pet Owner',
          pet.clientId
        );
      }
    }

    return newApp;
  };

  const updateAppointment = (app: Appointment) => {
    const oldApp = appointments.find(a => a.id === app.id);
    setAppointments(prev => prev.map(a => a.id === app.id ? app : a));

    const petName = pets.find(p => p.id === app.petId)?.name || 'Unknown';
    addAuditLog(`Appointment ${app.id} status modified from ${oldApp?.status} to ${app.status}`, app.id);

    // Notify pet owner on status change
    const pet = pets.find(p => p.id === app.petId);
    if (pet && oldApp && oldApp.status !== app.status) {
      addSystemNotification(
        'Appointment Update',
        `Your appointment for ${pet.name} on ${app.date} has been updated to: ${app.status}.`,
        'appointment',
        'Pet Owner',
        pet.clientId
      );
    }
  };

  // Medical Records management
  const addMedicalRecord = (recData: Omit<MedicalRecord, 'id'>): MedicalRecord => {
    const newId = `REC-${Date.now().toString().slice(-4)}`;
    const newRec: MedicalRecord = {
      ...recData,
      id: newId
    };
    setMedicalRecords(prev => [...prev, newRec]);

    const pet = pets.find(p => p.id === recData.petId);
    addAuditLog(`Added comprehensive consultation medical record for: ${pet?.name || 'Unknown'} - Diagnosed: ${recData.diagnosis}`, newId);

    if (recData.isVisibleToOwner && pet) {
      addSystemNotification(
        'New Medical Review Ready',
        `Medical visit report for ${pet.name} is now available to download in your health records timeline.`,
        'prescription',
        'Pet Owner',
        pet.clientId
      );
    }

    return newRec;
  };

  const updateMedicalRecord = (rec: MedicalRecord) => {
    setMedicalRecords(prev => prev.map(r => r.id === rec.id ? rec : r));
    const pet = pets.find(p => p.id === rec.petId);
    addAuditLog(`Updated consultation record details for: ${pet?.name || 'Unknown'}`, rec.id);
  };

  // Vaccination management
  const addVaccination = (vacData: Omit<Vaccination, 'id'>): Vaccination => {
    const newId = `VAC-${Date.now().toString().slice(-4)}`;
    const newVac: Vaccination = {
      ...vacData,
      id: newId
    };
    setVaccinations(prev => [...prev, newVac]);

    const pet = pets.find(p => p.id === vacData.petId);
    addAuditLog(`Recorded vaccine entry for ${pet?.name}: ${vacData.vaccineName} (Batch: ${vacData.batchNumber})`, newId);

    // Automatically subtract vaccine stock from inventory if we find a matching name
    const matchingItem = inventoryItems.find(item => item.category === 'Vaccines' && item.name.toLowerCase().includes(vacData.vaccineName.toLowerCase().slice(0, 5)));
    if (matchingItem) {
      adjustStock(matchingItem.id, -1, `Auto-dispensed vaccine administration for ${pet?.name || 'Pet'}`);
    }

    // Owner notification
    if (pet) {
      addSystemNotification(
        'Immunization Recorded',
        `Vaccination ${vacData.vaccineName} successfully updated for ${pet.name}. Next booster due: ${vacData.nextDueDate}.`,
        'vaccination',
        'Pet Owner',
        pet.clientId
      );
    }

    return newVac;
  };

  const updateVaccination = (vac: Vaccination) => {
    setVaccinations(prev => prev.map(v => v.id === vac.id ? vac : v));
    addAuditLog(`Updated vaccine entry key information for ${vac.vaccineName}`, vac.id);
  };

  // Prescription management
  const addPrescription = (presData: Omit<Prescription, 'id'>): Prescription => {
    const newId = `PRE-${Date.now().toString().slice(-4)}`;
    const newPres: Prescription = {
      ...presData,
      id: newId
    };
    setPrescriptions(prev => [...prev, newPres]);

    const pet = pets.find(p => p.id === presData.petId);
    addAuditLog(`Issued medication prescription for ${pet?.name}: ${presData.medicationName} (${presData.dosage})`, newId);

    // Automatically deduct from inventory if item matches medicationName
    const matchingItem = inventoryItems.find(item => item.category === 'Medications' && item.name.toLowerCase().includes(presData.medicationName.toLowerCase().slice(0, 5)));
    if (matchingItem) {
      adjustStock(matchingItem.id, -1, `Auto-dispensed prescription drug for ${pet?.name || 'Pet'}`);
    }

    if (pet) {
      addSystemNotification(
        'Treatment Prescription Issued',
        `New treatment plan generated for ${pet.name}: ${presData.medicationName} (${presData.dosage}) active until ${presData.endDate}.`,
        'prescription',
        'Pet Owner',
        pet.clientId
      );
    }

    return newPres;
  };

  const updatePrescription = (pres: Prescription) => {
    setPrescriptions(prev => prev.map(p => p.id === pres.id ? pres : p));
    addAuditLog(`Updated prescription specifications for ${pres.medicationName}`, pres.id);
  };

  // Lab Records
  const addLabRecord = (labData: Omit<LabRecord, 'id'>): LabRecord => {
    const newId = `LAB-${Date.now().toString().slice(-4)}`;
    const newLab: LabRecord = {
      ...labData,
      id: newId
    };
    setLabRecords(prev => [...prev, newLab]);

    const pet = pets.find(p => p.id === labData.petId);
    addAuditLog(`Created laboratory diagnostics request for ${pet?.name}: ${labData.testName}`, newId);

    if (pet) {
      addSystemNotification(
        'Lab Results Submitted',
        `Diagnostic results for ${pet.name}'s ${labData.testName} are now uploaded and ready for viewing.`,
        'prescription',
        'Pet Owner',
        pet.clientId
      );
    }

    return newLab;
  };

  const updateLabRecord = (lab: LabRecord) => {
    setLabRecords(prev => prev.map(l => l.id === lab.id ? lab : l));
    addAuditLog(`Uploaded laboratory findings details for lab sheet ${lab.id}`, lab.id);
  };

  // Surgeries
  const addSurgery = (surgData: Omit<Surgery, 'id'>): Surgery => {
    const newId = `SUR-${Date.now().toString().slice(-4)}`;
    const newSurg: Surgery = {
      ...surgData,
      id: newId
    };
    setSurgeries(prev => [...prev, newSurg]);

    const pet = pets.find(p => p.id === surgData.petId);
    addAuditLog(`Scheduled surgical operation for ${pet?.name}: ${surgData.surgeryType}`, newId);

    if (pet) {
      addSystemNotification(
        'Surgical Operation Scheduled',
        `A surgery (${surgData.surgeryType}) is scheduled for ${pet.name} on ${surgData.date}.`,
        'appointment',
        'Pet Owner',
        pet.clientId
      );
    }

    return newSurg;
  };

  const updateSurgery = (surg: Surgery) => {
    setSurgeries(prev => prev.map(s => s.id === surg.id ? surg : s));
    addAuditLog(`Registered recovery status and surgical details for key ${surg.id}`, surg.id);
  };

  // Billing and Payments
  const addInvoice = (invData: Omit<Invoice, 'id' | 'subtotal' | 'tax' | 'totalAmount' | 'paidAmount' | 'status' | 'payments'>): Invoice => {
    const newId = `INV-2026-${Date.now().toString().slice(-4)}`;
    
    // Auto calculate invoice metrics
    const subtotal = invData.items.reduce((sum, item) => sum + item.subtotal, 0);
    const tax = Number((subtotal * 0.08).toFixed(2)); // 8% sales/services tax rate
    const totalAmount = Number((subtotal + tax).toFixed(2));

    const newInvoice: Invoice = {
      id: newId,
      clientId: invData.clientId,
      petId: invData.petId,
      date: new Date().toISOString().split('T')[0],
      items: invData.items,
      subtotal,
      tax,
      totalAmount,
      paidAmount: 0.0,
      status: 'Unpaid',
      payments: []
    };

    setInvoices(prev => [...prev, newInvoice]);

    const client = clients.find(c => c.id === invData.clientId);
    addAuditLog(`Generated invoice number ${newId} for client ${client?.firstName} ${client?.lastName} (Total: $${totalAmount})`, newId);

    // Notify pet owner
    addSystemNotification(
      'Outstanding Balance Invoice',
      `New veterinary service invoice ${newId} of $${totalAmount} generated. Please review outstanding balance.`,
      'invoice',
      'Pet Owner',
      invData.clientId
    );

    return newInvoice;
  };

  const addPaymentToInvoice = (invoiceId: string, amount: number, method: PaymentMethod, refNo?: string) => {
    setInvoices(prev => prev.map(invoice => {
      if (invoice.id === invoiceId) {
        const newPaidAmount = Number((invoice.paidAmount + amount).toFixed(2));
        const newPayments = [
          ...invoice.payments,
          {
            id: `PAY-${Date.now().toString().slice(-4)}`,
            date: new Date().toISOString().split('T')[0],
            amount,
            method,
            referenceNumber: refNo
          }
        ];

        let status: 'Unpaid' | 'Partially Paid' | 'Paid' = 'Unpaid';
        if (newPaidAmount >= invoice.totalAmount) {
          status = 'Paid';
        } else if (newPaidAmount > 0) {
          status = 'Partially Paid';
        }

        return {
          ...invoice,
          paidAmount: newPaidAmount,
          status,
          payments: newPayments
        };
      }
      return invoice;
    }));

    addAuditLog(`Processed payment of $${amount} via ${method} for invoice ${invoiceId}`, invoiceId);
    
    // Notify owner of invoice receipt
    const invoice = invoices.find(inv => inv.id === invoiceId);
    if (invoice) {
      addSystemNotification(
        'Transaction Paid Receipt',
        `Service Payment of $${amount} successfully received. Invoice ${invoiceId} status: ${amount + invoice.paidAmount >= invoice.totalAmount ? 'Fully Settled' : 'Partially Settled'}.`,
        'invoice',
        'Pet Owner',
        invoice.clientId
      );
    }
  };

  // Inventory Management
  const addInventoryItem = (itemData: Omit<InventoryItem, 'id'>): InventoryItem => {
    const newId = `INV-I-${Date.now().toString().slice(-4)}`;
    const newItem: InventoryItem = {
      ...itemData,
      id: newId
    };
    setInventoryItems(prev => [...prev, newItem]);
    addAuditLog(`Created inventory registry index for drug/supply: ${itemData.name}`, newId);
    return newItem;
  };

  const updateInventoryItem = (item: InventoryItem) => {
    setInventoryItems(prev => prev.map(i => i.id === item.id ? item : i));
    addAuditLog(`Updated inventory registry specifications for item: ${item.name}`, item.id);
  };

  const adjustStock = (itemId: string, change: number, reason: string) => {
    setInventoryItems(prev => prev.map(item => {
      if (item.id === itemId) {
        const newQty = Math.max(0, item.quantity + change);
        
        // Push Alert if low stock is hit
        if (newQty <= item.minStockLevel && item.quantity > item.minStockLevel) {
          addSystemNotification(
            'Inventory Low Alert',
            `Item "${item.name}" has reached or dropped below minimum safety level. (Qty: ${newQty}, Min: ${item.minStockLevel})`,
            'inventory_low',
            'Admin'
          );
          addSystemNotification(
            'Inventory Low Alert',
            `Item "${item.name}" is running low on medical stock.`,
            'inventory_low',
            'Receptionist'
          );
        }

        return {
          ...item,
          quantity: newQty
        };
      }
      return item;
    }));

    const inventoryRecord = inventoryItems.find(i => i.id === itemId);
    const flowText = change >= 0 ? `Inflow (+${change})` : `Outflow (${change})`;
    addAuditLog(`Adjusted inventory stock for: ${inventoryRecord?.name || itemId}. Reason: ${reason} (${flowText})`, itemId);
  };

  // Suppliers
  const addSupplier = (supplierData: Omit<Supplier, 'id'>): Supplier => {
    const newId = `SUP-${Date.now().toString().slice(-4)}`;
    const newSupplier: Supplier = {
      ...supplierData,
      id: newId
    };
    setSuppliers(prev => [...prev, newSupplier]);
    addAuditLog(`Created Supplier database profile for ${supplierData.name}`, newId);
    return newSupplier;
  };

  // Staff and User Account Management
  const addUser = (userData: Omit<User, 'id'>): User => {
    const newId = `USR-${Date.now().toString().slice(-4)}`;
    const username = userData.username || userData.email.split('@')[0];
    const password = userData.password || (userData.role === 'Admin' ? 'admin1234' : 'staff1234');
    const newUser: User = {
      ...userData,
      id: newId,
      username,
      password,
      employmentDate: userData.employmentDate || new Date().toISOString().split('T')[0],
      isActive: userData.isActive !== false
    };
    setUsers(prev => [...prev, newUser]);
    addAuditLog(`Created user account: ${newUser.name} (Role: ${newUser.role}, Username: ${username})`, newId);
    return newUser;
  };

  const updateUser = (user: User) => {
    setUsers(prev => prev.map(u => u.id === user.id ? user : u));
    addAuditLog(`Updated account credentials / status for user: ${user.name}`, user.id);
  };

  const deleteUser = (id: string): boolean => {
    const target = users.find(u => u.id === id);
    if (!target) return false;
    if (target.id === currentUser?.id) {
      return false; // Cannot delete currently logged in user
    }
    setUsers(prev => prev.filter(u => u.id !== id));
    addAuditLog(`Permanently deleted user account: ${target.name} (${target.role})`, id);
    return true;
  };

  // Staff Account Settings Management by Admin
  const addStaff = (name: string, email: string, role: UserRole, phone?: string): User => {
    return addUser({
      name,
      email,
      role,
      phone,
      username: email.split('@')[0],
      password: role === 'Admin' ? 'admin1234' : 'staff1234',
      isActive: true,
      employmentDate: new Date().toISOString().split('T')[0]
    });
  };

  const toggleStaffStatus = (id: string) => {
    setUsers(prev => prev.map(u => {
      if (u.id === id) {
        const targetStatus = !u.isActive;
        addAuditLog(`Staff user login status modified: ${u.name} (Toggled Active status to: ${targetStatus.toString()})`, id);
        return { ...u, isActive: targetStatus };
      }
      return u;
    }));
  };

  // Internal Notifications Management
  const markNotificationRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const clearNotifications = () => {
    setNotifications([]);
  };

  return (
    <VeterinaryContext.Provider
      value={{
        currentUser,
        users,
        clients,
        pets,
        appointments,
        medicalRecords,
        vaccinations,
        prescriptions,
        labRecords,
        surgeries,
        invoices,
        inventoryItems,
        suppliers,
        notifications,
        auditLogs,
        setCurrentUser,
        loginAs,
        loginWithCredentials,
        logout,
        addUser,
        updateUser,
        deleteUser,
        addClient,
        addClientWithPet,
        updateClient,
        deleteClient,
        addPet,
        updatePet,
        addWeightToPet,
        deletePet,
        addAppointment,
        updateAppointment,
        addMedicalRecord,
        updateMedicalRecord,
        addVaccination,
        updateVaccination,
        addPrescription,
        updatePrescription,
        addLabRecord,
        updateLabRecord,
        addSurgery,
        updateSurgery,
        addInvoice,
        addPaymentToInvoice,
        addInventoryItem,
        updateInventoryItem,
        adjustStock,
        addSupplier,
        addStaff,
        toggleStaffStatus,
        markNotificationRead,
        clearNotifications,
        addSystemNotification,
        resetToDemoData
      }}
    >
      {children}
    </VeterinaryContext.Provider>
  );
};

export const useVeterinary = () => {
  const context = useContext(VeterinaryContext);
  if (context === undefined) {
    throw new Error('useVeterinary must be used within a VeterinaryProvider');
  }
  return context;
};
