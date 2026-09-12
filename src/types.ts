/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type UserRole = 'Admin' | 'Veterinarian' | 'Veterinary Assistant' | 'Receptionist' | 'Pet Owner';

export interface User {
  id: string;
  name: string;
  username?: string;
  email: string;
  password?: string;
  role: UserRole;
  phone?: string;
  employmentDate?: string;
  isActive: boolean;
  clientId?: string; // Links pet owners to a Client record
  credentials?: string;
}

export interface Client {
  id: string;
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  address: string;
  emergencyContact: {
    name: string;
    phone: string;
    relationship: string;
  };
  registrationDate: string;
}

export interface WeightRecord {
  date: string;
  weight: number; // in kg
}

export interface Pet {
  id: string;
  clientId: string;
  name: string;
  photoUrl?: string;
  species: string;
  breed: string;
  gender: 'Male' | 'Female' | 'Neutered Male' | 'Spayed Female';
  dob: string;
  weight: number; // current weight
  weightHistory: WeightRecord[];
  color: string;
  microchipNumber?: string;
  allergies: string;
  specialNotes?: string;
}

export type AppointmentType = 'Consultation' | 'Vaccination' | 'Surgery' | 'Follow-Up' | 'Grooming';

export type AppointmentStatus =
  | 'Pending'
  | 'Scheduled'
  | 'Confirmed'
  | 'Checked In'
  | 'Completed'
  | 'Cancelled'
  | 'No Show';

export interface Appointment {
  id: string;
  petId: string;
  clientId: string;
  vetId: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:MM
  type: AppointmentType;
  notes?: string;
  status: AppointmentStatus;
}

export interface MedicalRecord {
  id: string;
  petId: string;
  vetId: string;
  visitDate: string;
  chiefComplaint: string;
  history: string;
  physicalExamination: string;
  diagnosis: string;
  treatmentPlan: string;
  notes: string;
  isVisibleToOwner: boolean;
  attachments?: {
    name: string;
    url: string;
  }[];
}

export interface Vaccination {
  id: string;
  petId: string;
  vaccineName: string;
  batchNumber: string;
  dateAdministered: string;
  nextDueDate: string;
  vetId: string;
  notes?: string;
}

export type PrescriptionStatus = 'Active' | 'Completed' | 'Expired';

export interface Prescription {
  id: string;
  petId: string;
  vetId: string;
  medicationName: string;
  dosage: string;
  frequency: string;
  duration: string;
  instructions: string;
  startDate: string;
  endDate: string;
  status: PrescriptionStatus;
}

export interface LabRecord {
  id: string;
  petId: string;
  testName: string;
  requestedBy: string; // vetId
  dateRequested: string;
  dateCompleted?: string;
  results?: string;
  attachments?: {
    name: string;
    url: string;
  }[];
}

export interface Surgery {
  id: string;
  petId: string;
  surgeryType: string;
  surgeonId: string; // vetId
  date: string;
  notes?: string;
  outcome: string;
  followUpInstructions?: string;
}

export interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
}

export type PaymentMethod = 'Cash' | 'Credit Card' | 'Bank Transfer' | 'E-Wallet';

export interface Invoice {
  id: string; // formatted e.g. "INV-2026-0001"
  clientId: string;
  petId: string;
  date: string;
  items: InvoiceItem[];
  subtotal: number;
  tax: number;
  totalAmount: number;
  paidAmount: number;
  status: 'Unpaid' | 'Partially Paid' | 'Paid';
  payments: {
    id: string;
    date: string;
    amount: number;
    method: PaymentMethod;
    referenceNumber?: string;
  }[];
}

export type InventoryCategory = 'Medications' | 'Vaccines' | 'Medical Supplies' | 'Consumables';

export interface InventoryItem {
  id: string;
  name: string;
  category: InventoryCategory;
  quantity: number;
  unit: string; // e.g. "Vials", "Pills", "Boxes"
  supplierId: string;
  purchaseCost: number;
  sellingPrice: number;
  expirationDate: string;
  minStockLevel: number;
}

export interface Supplier {
  id: string;
  name: string;
  contactName: string;
  phone: string;
  email: string;
  address?: string;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'appointment' | 'vaccination' | 'prescription' | 'invoice' | 'inventory_low' | 'inventory_expired';
  date: string;
  read: boolean;
  targetRole?: UserRole;
  targetClientId?: string; // For owner specific notifications
}

export interface AuditLog {
  id: string;
  userId: string;
  userName: string;
  userRole: UserRole;
  action: string;
  timestamp: string;
  affectedRecordId?: string;
  entityType?: string;
  entityId?: string;
  details?: string;
}
