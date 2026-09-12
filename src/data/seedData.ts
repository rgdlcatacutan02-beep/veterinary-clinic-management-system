/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

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
  AuditLog
} from '../types';

// Helper to format dates relative to current evaluation day
const getRelativeDate = (offsetDays: number): string => {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  return d.toISOString().split('T')[0];
};

const todayStr = getRelativeDate(0);
const yesterdayStr = getRelativeDate(-1);
const lastWeekStr = getRelativeDate(-7);
const twoWeeksAgoStr = getRelativeDate(-14);
const threeMonthsAgoStr = getRelativeDate(-90);
const tomorrowStr = getRelativeDate(1);
const inThreeDaysStr = getRelativeDate(3);
const inTwoWeeksStr = getRelativeDate(14);
const inSixMonthsStr = getRelativeDate(180);
const inOneYearStr = getRelativeDate(365);

export const SEED_SUPPLIERS: Supplier[] = [
  {
    id: 'SUP-01',
    name: 'VetMed Biotech Supplies',
    contactName: 'Helen Hunt',
    phone: '555-0987',
    email: 'orders@vetmedsupplies.com',
    address: '456 Pharma Rd, Biotech City, CA'
  },
  {
    id: 'SUP-02',
    name: 'Apex Veterinary Pharmaceuticals',
    contactName: 'John Vance',
    phone: '555-4321',
    email: 'orders@apexsupplies.com',
    address: '78 Distribution Blvd, Petaluma, CA'
  },
  {
    id: 'SUP-03',
    name: 'Zoetis Diagnostic Instruments',
    contactName: 'Amanda Brooks',
    phone: '555-7766',
    email: 'support@zoetis-instruments.com',
    address: '100 Medical Park, Parsippany, NJ'
  }
];

export const SEED_USERS: User[] = [
  {
    id: 'USR-ADMIN',
    name: 'Dr. Sarah Jenkins',
    username: 'Admin',
    email: 'admin@wellpet.com',
    password: 'admin1234',
    role: 'Admin',
    phone: '555-0100',
    employmentDate: '2024-01-15',
    isActive: true,
    credentials: 'DVM, Practice Medical Director & System Administrator'
  },
  {
    id: 'USR-VET',
    name: 'Dr. Robert Taylor',
    username: 'dr.taylor',
    email: 'robert.taylor@wellpet.com',
    password: 'staff1234',
    role: 'Veterinarian',
    phone: '555-0102',
    employmentDate: '2024-03-01',
    isActive: true,
    credentials: 'DVM, Senior Clinical Specialist & Soft Tissue Surgeon'
  },
  {
    id: 'USR-RECEPT',
    name: 'Emily Clark',
    username: 'emily.clark',
    email: 'emily.clark@wellpet.com',
    password: 'staff1234',
    role: 'Receptionist',
    phone: '555-0103',
    employmentDate: '2024-06-10',
    isActive: true,
    credentials: 'Front Desk Lead & Patient Admissions Coordinator'
  },
  {
    id: 'USR-CLIENT-1',
    name: 'John Doe',
    username: 'john.doe',
    email: 'john.doe@example.com',
    password: 'client1234',
    role: 'Pet Owner',
    phone: '555-0142',
    isActive: true,
    clientId: 'CLI-01',
    credentials: 'Registered Client & Pet Owner'
  }
];

export const SEED_CLIENTS: Client[] = [
  {
    id: 'CLI-01',
    firstName: 'John',
    lastName: 'Doe',
    phone: '555-0142',
    email: 'john.doe@example.com',
    address: '742 Evergreen Terrace, Springfield, IL',
    emergencyContact: {
      name: 'Mary Doe',
      phone: '555-0143',
      relationship: 'Spouse'
    },
    registrationDate: '2025-01-10'
  },
  {
    id: 'CLI-02',
    firstName: 'Sarah',
    lastName: 'Connor',
    phone: '555-0189',
    email: 'sarah.c@example.com',
    address: '1204 Cyber Way, Los Angeles, CA',
    emergencyContact: {
      name: 'John Connor',
      phone: '555-0190',
      relationship: 'Son'
    },
    registrationDate: '2025-02-14'
  },
  {
    id: 'CLI-03',
    firstName: 'Marcus',
    lastName: 'Vance',
    phone: '555-0231',
    email: 'm.vance@example.com',
    address: '88 Beacon Hill St, Boston, MA',
    emergencyContact: {
      name: 'Lisa Vance',
      phone: '555-0232',
      relationship: 'Sister'
    },
    registrationDate: '2025-03-01'
  },
  {
    id: 'CLI-04',
    firstName: 'Elena',
    lastName: 'Rostova',
    phone: '555-0374',
    email: 'elena.r@example.com',
    address: '512 Willow Creek Rd, Seattle, WA',
    emergencyContact: {
      name: 'Dmitri Rostov',
      phone: '555-0375',
      relationship: 'Father'
    },
    registrationDate: '2025-04-18'
  }
];

export const SEED_PETS: Pet[] = [
  {
    id: 'PET-01',
    clientId: 'CLI-01',
    name: 'Buddy',
    species: 'Dog',
    breed: 'Golden Retriever',
    gender: 'Neutered Male',
    dob: '2021-04-12',
    weight: 31.5,
    color: 'Golden Honey',
    microchipNumber: '985141002348911',
    allergies: 'No known drug allergies',
    specialNotes: 'Gentle disposition. Friendly with clinic staff and other animals.',
    weightHistory: [
      { date: threeMonthsAgoStr, weight: 30.8 },
      { date: twoWeeksAgoStr, weight: 31.2 },
      { date: todayStr, weight: 31.5 }
    ]
  },
  {
    id: 'PET-02',
    clientId: 'CLI-01',
    name: 'Luna',
    species: 'Cat',
    breed: 'British Shorthair',
    gender: 'Spayed Female',
    dob: '2022-08-15',
    weight: 4.3,
    color: 'Silver Tabby',
    microchipNumber: '985141002348912',
    allergies: 'Mild intolerance to dry chicken meal',
    specialNotes: 'Prefers quiet examination room. Handled best with feline towel-wrap technique.',
    weightHistory: [
      { date: threeMonthsAgoStr, weight: 4.1 },
      { date: lastWeekStr, weight: 4.3 }
    ]
  },
  {
    id: 'PET-03',
    clientId: 'CLI-02',
    name: 'Rocky',
    species: 'Dog',
    breed: 'German Shepherd',
    gender: 'Neutered Male',
    dob: '2020-01-10',
    weight: 38.2,
    color: 'Black & Tan',
    microchipNumber: '985141004512789',
    allergies: 'Penicillin-group antibiotics',
    specialNotes: 'High-energy working breed. Shows mild early bilateral hip stiffness after intense exercise.',
    weightHistory: [
      { date: threeMonthsAgoStr, weight: 37.5 },
      { date: lastWeekStr, weight: 38.2 }
    ]
  },
  {
    id: 'PET-04',
    clientId: 'CLI-03',
    name: 'Barnaby',
    species: 'Rabbit',
    breed: 'Holland Lop',
    gender: 'Male',
    dob: '2023-02-05',
    weight: 1.85,
    color: 'Broken Tortoise',
    microchipNumber: '985141008821453',
    allergies: 'None',
    specialNotes: 'Dietary caution: Requires unlimited Timothy hay and fresh greens.',
    weightHistory: [
      { date: threeMonthsAgoStr, weight: 1.75 },
      { date: yesterdayStr, weight: 1.85 }
    ]
  },
  {
    id: 'PET-05',
    clientId: 'CLI-04',
    name: 'Bella',
    species: 'Dog',
    breed: 'French Bulldog',
    gender: 'Spayed Female',
    dob: '2022-11-20',
    weight: 11.4,
    color: 'Fawn with Black Mask',
    microchipNumber: '985141007733210',
    allergies: 'Seasonal environmental pollens, flea bite hypersensitivity',
    specialNotes: 'Brachycephalic breed - monitor airway during stressful handling.',
    weightHistory: [
      { date: threeMonthsAgoStr, weight: 11.0 },
      { date: todayStr, weight: 11.4 }
    ]
  }
];

export const SEED_APPOINTMENTS: Appointment[] = [
  {
    id: 'APP-1001',
    petId: 'PET-01',
    clientId: 'CLI-01',
    vetId: 'USR-VET',
    date: todayStr,
    time: '09:30',
    type: 'Consultation',
    notes: 'Annual comprehensive wellness physical & booster vaccination review.',
    status: 'Checked In'
  },
  {
    id: 'APP-1002',
    petId: 'PET-05',
    clientId: 'CLI-04',
    vetId: 'USR-ADMIN',
    date: todayStr,
    time: '11:00',
    type: 'Follow-Up',
    notes: 'Re-evaluation of allergic dermatitis on ventral abdomen & paws.',
    status: 'Scheduled'
  },
  {
    id: 'APP-1003',
    petId: 'PET-03',
    clientId: 'CLI-02',
    vetId: 'USR-VET',
    date: todayStr,
    time: '14:30',
    type: 'Consultation',
    notes: 'Mobility evaluation and refill review for Carprofen anti-inflammatory chewables.',
    status: 'Scheduled'
  },
  {
    id: 'APP-1004',
    petId: 'PET-02',
    clientId: 'CLI-01',
    vetId: 'USR-VET',
    date: tomorrowStr,
    time: '10:00',
    type: 'Vaccination',
    notes: 'Feline FVRCP & Rabies core vaccine updates.',
    status: 'Scheduled'
  },
  {
    id: 'APP-1005',
    petId: 'PET-04',
    clientId: 'CLI-03',
    vetId: 'USR-ADMIN',
    date: inThreeDaysStr,
    time: '15:15',
    type: 'Consultation',
    notes: 'Incisor and molar dental checkup, nail trim.',
    status: 'Scheduled'
  },
  {
    id: 'APP-1006',
    petId: 'PET-01',
    clientId: 'CLI-01',
    vetId: 'USR-VET',
    date: twoWeeksAgoStr,
    time: '09:00',
    type: 'Consultation',
    notes: 'Mild right ear scratching. Otic exam and ear cleaning performed.',
    status: 'Completed'
  }
];

export const SEED_MEDICAL_RECORDS: MedicalRecord[] = [
  {
    id: 'MED-201',
    petId: 'PET-01',
    vetId: 'USR-VET',
    visitDate: twoWeeksAgoStr,
    chiefComplaint: 'Right ear scratching and intermittent head shaking for 3 days.',
    history: 'Owner noticed Buddy shaking head following swimming at local dog park lake. Eating and drinking normally.',
    physicalExamination: 'T: 101.4F, HR: 90 bpm, RR: 24. Right external ear canal mildly erythematous with moderate dark ceruminous discharge. Left ear clean. Tympanic membrane intact bilaterally.',
    diagnosis: 'Unilateral Otitis Externa (Right Ear), likely secondary to moisture retention and mild Malassezia overgrowth.',
    treatmentPlan: 'Performed in-clinic deep ear flush. Prescribed Posatex Otic suspension 4 drops daily for 7 days. Advised keep ear canal dry after bathing or swimming.',
    notes: 'Follow up in 2 weeks if discharge persists. Re-check ears at annual checkup.',
    isVisibleToOwner: true,
    attachments: [
      { name: 'Otic Cytology Report.pdf', url: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=400' }
    ]
  },
  {
    id: 'MED-202',
    petId: 'PET-05',
    vetId: 'USR-ADMIN',
    visitDate: lastWeekStr,
    chiefComplaint: 'Pruritus, ventral belly erythema and constant paw licking.',
    history: 'Flare-up began with warmer spring weather. Owner reports constant scratching at night.',
    physicalExamination: 'T: 101.8F, HR: 110 bpm, RR: 28. Erythematous papules along inguinal region and ventral abdomen. Interdigital erythema on all four paws with salivary staining.',
    diagnosis: 'Canine Atopic Dermatitis with secondary superficial bacterial pyoderma.',
    treatmentPlan: 'Initiated Apoquel (oclacitinib) 5.4mg BID for 14 days, then taper to SID maintenance. Chlorhexidine 4% antimicrobial mousse applied to paws twice weekly.',
    notes: 'Patient showed great initial relief. Scheduled follow-up visit in 7-10 days.',
    isVisibleToOwner: true,
    attachments: []
  },
  {
    id: 'MED-203',
    petId: 'PET-03',
    vetId: 'USR-VET',
    visitDate: threeMonthsAgoStr,
    chiefComplaint: 'Stiffness rising in the mornings and hesitation jumping into vehicle.',
    history: 'Active working line Shepherd. Gradual onset over 2 months. No acute trauma reported.',
    physicalExamination: 'T: 101.2F, HR: 84 bpm. Mild reduction in extension of bilateral coxofemoral joints. No joint effusion or focal spinal pain. Ortolani sign negative.',
    diagnosis: 'Early Bilateral Hip Osteoarthritis.',
    treatmentPlan: 'Prescribed Carprofen 75mg chewable tablet daily with food. Recommended high-potency Omega-3 fatty acid supplementation and joint protective supplements (Glucosamine/Chondroitin).',
    notes: 'Baseline liver and kidney chemistry panels performed; all values within normal limits.',
    isVisibleToOwner: true,
    attachments: []
  },
  {
    id: 'MED-204',
    petId: 'PET-02',
    vetId: 'USR-VET',
    visitDate: threeMonthsAgoStr,
    chiefComplaint: 'Routine wellness examination and dental checkup.',
    history: 'Indoor cat, good appetite. Switched to grain-free canned salmon diet with excellent digestive tolerance.',
    physicalExamination: 'T: 100.8F, HR: 170 bpm, RR: 30. Oral cavity reveals mild Grade 1 tartar on maxillary premolars; no gingival recession. Heart and lungs auscultate clear. Abdomen soft and non-painful.',
    diagnosis: 'Healthy adult feline. Mild Grade 1 dental tartar.',
    treatmentPlan: 'Recommended enzymatic feline dental treats and regular water additive. Routine vaccines scheduled.',
    notes: 'Next annual checkup due in 9 months.',
    isVisibleToOwner: true,
    attachments: []
  }
];

export const SEED_VACCINATIONS: Vaccination[] = [
  {
    id: 'VAC-01',
    petId: 'PET-01',
    vaccineName: 'Rabies 3-Year Canine Vaccine',
    batchNumber: 'RB-99824-A',
    dateAdministered: threeMonthsAgoStr,
    nextDueDate: inOneYearStr,
    vetId: 'USR-VET',
    notes: 'Administered in right hind limb subcutaneously. No adverse reaction observed.'
  },
  {
    id: 'VAC-02',
    petId: 'PET-01',
    vaccineName: 'DHPP Canine Core Booster',
    batchNumber: 'DH-44120-X',
    dateAdministered: threeMonthsAgoStr,
    nextDueDate: inTwoWeeksStr,
    vetId: 'USR-VET',
    notes: 'Distemper, Hepatitis, Parvovirus, Parainfluenza core immunization.'
  },
  {
    id: 'VAC-03',
    petId: 'PET-02',
    vaccineName: 'FVRCP Feline Core Vaccine',
    batchNumber: 'FV-88190-C',
    dateAdministered: threeMonthsAgoStr,
    nextDueDate: inSixMonthsStr,
    vetId: 'USR-VET',
    notes: 'Rhinotracheitis, Calicivirus, Panleukopenia vaccine administered in right shoulder.'
  },
  {
    id: 'VAC-04',
    petId: 'PET-03',
    vaccineName: 'Rabies 1-Year Canine Vaccine',
    batchNumber: 'RB-11029-B',
    dateAdministered: getRelativeDate(-380), // Overdue!
    nextDueDate: twoWeeksAgoStr,
    vetId: 'USR-VET',
    notes: 'OVERDUE FOR BOOSTER. Urgent reminder sent to client Sarah Connor.'
  },
  {
    id: 'VAC-05',
    petId: 'PET-05',
    vaccineName: 'Bordetella Bronchiseptica (Kennel Cough)',
    batchNumber: 'BB-66014-M',
    dateAdministered: lastWeekStr,
    nextDueDate: inSixMonthsStr,
    vetId: 'USR-ADMIN',
    notes: 'Intranasal administration. Required for doggy daycare and grooming.'
  }
];

export const SEED_PRESCRIPTIONS: Prescription[] = [
  {
    id: 'RX-501',
    petId: 'PET-03',
    vetId: 'USR-VET',
    medicationName: 'Carprofen Chewable Tablets 75mg',
    dosage: '75 mg (1 tablet)',
    frequency: 'Once daily with meal',
    duration: '30 Days',
    instructions: 'Administer with food. Monitor for any vomiting or dark tarry stools. Store at room temperature.',
    startDate: twoWeeksAgoStr,
    endDate: inTwoWeeksStr,
    status: 'Active'
  },
  {
    id: 'RX-502',
    petId: 'PET-05',
    vetId: 'USR-ADMIN',
    medicationName: 'Apoquel (Oclacitinib) 5.4mg',
    dosage: '5.4 mg (1 tablet)',
    frequency: 'Twice daily for 14 days, then once daily',
    duration: '28 Days',
    instructions: 'Give orally with or without food. Indicated for management of atopic allergic pruritus.',
    startDate: lastWeekStr,
    endDate: inThreeDaysStr,
    status: 'Active'
  },
  {
    id: 'RX-503',
    petId: 'PET-01',
    vetId: 'USR-VET',
    medicationName: 'Posatex Otic Suspension 15g',
    dosage: '4 Drops',
    frequency: 'Once daily into right ear canal',
    duration: '7 Days',
    instructions: 'Clean external ear canal gently before administration. Massage base of ear after applying drops.',
    startDate: twoWeeksAgoStr,
    endDate: lastWeekStr,
    status: 'Completed'
  },
  {
    id: 'RX-504',
    petId: 'PET-01',
    vetId: 'USR-VET',
    medicationName: 'NexGard Spectra Chews (Large Dog 30-60kg)',
    dosage: '1 Chewable treat',
    frequency: 'Once monthly',
    duration: '6 Months',
    instructions: 'Broad spectrum prevention against fleas, ticks, heartworm, and intestinal worms.',
    startDate: threeMonthsAgoStr,
    endDate: inSixMonthsStr,
    status: 'Active'
  }
];

export const SEED_LAB_RECORDS: LabRecord[] = [
  {
    id: 'LAB-801',
    petId: 'PET-01',
    testName: 'Comprehensive Senior Chemistry & CBC Profile',
    requestedBy: 'USR-VET',
    dateRequested: twoWeeksAgoStr,
    dateCompleted: twoWeeksAgoStr,
    results: 'BUN: 18 mg/dL (Normal: 7-27), Creatinine: 1.1 mg/dL (Normal: 0.5-1.5), ALT: 42 U/L (Normal: 10-100), Alkaline Phosphatase: 68 U/L (Normal: 23-212), Glucose: 94 mg/dL. CBC: Hematocrit 44%, Platelets 280k/uL. All markers within optimal physiological ranges.',
    attachments: [
      { name: 'CBC_Chemistry_Panel_PET01.pdf', url: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=400' }
    ]
  },
  {
    id: 'LAB-802',
    petId: 'PET-05',
    testName: 'Skin Scraping & Deep Cytology Exam',
    requestedBy: 'USR-ADMIN',
    dateRequested: lastWeekStr,
    dateCompleted: lastWeekStr,
    results: 'Superficial skin scraping negative for Demodex and Sarcoptes mites. Cytology reveals 2-3+ Malassezia pachydermatis yeast organisms per high-power field, consistent with secondary allergic dermatitis.',
    attachments: []
  },
  {
    id: 'LAB-803',
    petId: 'PET-02',
    testName: 'Urinalysis with Microscopic Sediment Examination',
    requestedBy: 'USR-VET',
    dateRequested: threeMonthsAgoStr,
    dateCompleted: threeMonthsAgoStr,
    results: 'Specific Gravity: 1.048 (Adequate feline concentration), pH: 6.5, Protein: Negative, Glucose: Negative, Ketones: Negative. Microscopic: 0-1 RBC/hpf, 0-1 WBC/hpf, No struvite or calcium oxalate crystals seen.',
    attachments: []
  }
];

export const SEED_SURGERIES: Surgery[] = [
  {
    id: 'SURG-101',
    petId: 'PET-05',
    surgeryType: 'Spaying (Ovariohysterectomy)',
    surgeonId: 'USR-VET',
    date: threeMonthsAgoStr,
    notes: 'Standard midline celiotomy. Ovarian pedicles ligated with 2-0 PDS. Uterine body transfixed cleanly. Three-layer surgical closure.',
    outcome: 'Procedure completed successfully. Smooth anesthetic recovery.',
    followUpInstructions: 'E-collar worn continuously for 10-14 days. Strict cage rest. Suture removal completed at day 12 with full primary intention healing.'
  },
  {
    id: 'SURG-102',
    petId: 'PET-01',
    surgeryType: 'Dental Prophylaxis & Ultrasonic Scaling',
    surgeonId: 'USR-VET',
    date: threeMonthsAgoStr,
    notes: 'Full mouth dental radiographs performed. Subgingival ultrasonic scaling and fluoride polishing. No mobile teeth requiring extraction.',
    outcome: 'Grade 1 gingivitis fully resolved. Fresh breath and healthy oral mucosal margins.',
    followUpInstructions: 'Feed softened diet for 24 hours. Continue daily enzymatic dental hygiene.'
  }
];

export const SEED_INVOICES: Invoice[] = [
  {
    id: 'INV-2026-0001',
    clientId: 'CLI-01',
    petId: 'PET-01',
    date: twoWeeksAgoStr,
    items: [
      { id: 'ITM-1', description: 'Comprehensive Physical Consultation Examination', quantity: 1, unitPrice: 55.0, subtotal: 55.0 },
      { id: 'ITM-2', description: 'Otic Deep Canal Cleansing & Lavage', quantity: 1, unitPrice: 35.0, subtotal: 35.0 },
      { id: 'ITM-3', description: 'Posatex Otic Antibacterial/Antifungal Suspension 15g', quantity: 1, unitPrice: 38.0, subtotal: 38.0 },
      { id: 'ITM-4', description: 'Medical Waste Disposal & Environmental Fee', quantity: 1, unitPrice: 7.0, subtotal: 7.0 }
    ],
    subtotal: 135.0,
    tax: 10.8,
    totalAmount: 145.8,
    paidAmount: 145.8,
    status: 'Paid',
    payments: [
      { id: 'PAY-101', date: twoWeeksAgoStr, amount: 145.8, method: 'Credit Card', referenceNumber: 'AUTH-CC-99214' }
    ]
  },
  {
    id: 'INV-2026-0002',
    clientId: 'CLI-02',
    petId: 'PET-03',
    date: lastWeekStr,
    items: [
      { id: 'ITM-1', description: 'Orthopedic Musculoskeletal Clinical Evaluation', quantity: 1, unitPrice: 75.0, subtotal: 75.0 },
      { id: 'ITM-2', description: 'Carprofen Chewable Tablets 75mg (30ct)', quantity: 1, unitPrice: 65.0, subtotal: 65.0 },
      { id: 'ITM-3', description: 'Comprehensive Joint Health Glucosamine Supplement', quantity: 1, unitPrice: 42.0, subtotal: 42.0 }
    ],
    subtotal: 182.0,
    tax: 14.56,
    totalAmount: 196.56,
    paidAmount: 100.0,
    status: 'Partially Paid',
    payments: [
      { id: 'PAY-102', date: lastWeekStr, amount: 100.0, method: 'Credit Card', referenceNumber: 'AUTH-CC-88120' }
    ]
  },
  {
    id: 'INV-2026-0003',
    clientId: 'CLI-04',
    petId: 'PET-05',
    date: yesterdayStr,
    items: [
      { id: 'ITM-1', description: 'Dermatological Consultation & Allergy Assessment', quantity: 1, unitPrice: 65.0, subtotal: 65.0 },
      { id: 'ITM-2', description: 'In-House Skin Scraping & Cytology Microscopy', quantity: 1, unitPrice: 45.0, subtotal: 45.0 },
      { id: 'ITM-3', description: 'Apoquel (Oclacitinib) 5.4mg (28ct)', quantity: 1, unitPrice: 78.0, subtotal: 78.0 }
    ],
    subtotal: 188.0,
    tax: 15.04,
    totalAmount: 203.04,
    paidAmount: 0.0,
    status: 'Unpaid',
    payments: []
  }
];

export const SEED_INVENTORIES: InventoryItem[] = [
  {
    id: 'INV-A1',
    name: 'Amoxicillin Trihydrate Oral Suspension 50ml',
    category: 'Medications',
    quantity: 18,
    unit: 'Bottles',
    supplierId: 'SUP-01',
    purchaseCost: 12.0,
    sellingPrice: 28.0,
    expirationDate: '2027-04-15',
    minStockLevel: 5
  },
  {
    id: 'INV-A2',
    name: 'NexGard Chews for Large Dogs 25-50kg',
    category: 'Medications',
    quantity: 3, // Below minStockLevel (5) -> triggers low stock alert!
    unit: 'Boxes',
    supplierId: 'SUP-02',
    purchaseCost: 35.0,
    sellingPrice: 62.0,
    expirationDate: inSixMonthsStr,
    minStockLevel: 5
  },
  {
    id: 'INV-A3',
    name: 'Rabies Feline/Canine Vaccine (10-dose vials)',
    category: 'Vaccines',
    quantity: 2, // Below minStockLevel (3) -> triggers low stock alert!
    unit: 'Vials',
    supplierId: 'SUP-01',
    purchaseCost: 45.0,
    sellingPrice: 120.0,
    expirationDate: inThreeDaysStr, // Near expiration -> triggers alert!
    minStockLevel: 3
  },
  {
    id: 'INV-A4',
    name: 'DHPP Canine Core Vaccine 10-Pack',
    category: 'Vaccines',
    quantity: 14,
    unit: 'Vials',
    supplierId: 'SUP-01',
    purchaseCost: 30.0,
    sellingPrice: 85.0,
    expirationDate: '2027-02-18',
    minStockLevel: 6
  },
  {
    id: 'INV-A5',
    name: 'Carprofen Chewable Tablets 75mg (60ct)',
    category: 'Medications',
    quantity: 12,
    unit: 'Bottles',
    supplierId: 'SUP-02',
    purchaseCost: 42.0,
    sellingPrice: 85.0,
    expirationDate: '2027-08-30',
    minStockLevel: 4
  },
  {
    id: 'INV-A6',
    name: 'Sterile Surgical Luer-Lock Syringes 3ml 22G',
    category: 'Medical Supplies',
    quantity: 180,
    unit: 'Units',
    supplierId: 'SUP-02',
    purchaseCost: 0.15,
    sellingPrice: 1.5,
    expirationDate: '2029-01-01',
    minStockLevel: 50
  },
  {
    id: 'INV-A7',
    name: 'Sterile Surgical Glove Sets - Powder Free Size 7.5',
    category: 'Consumables',
    quantity: 16,
    unit: 'Pairs',
    supplierId: 'SUP-02',
    purchaseCost: 2.0,
    sellingPrice: 6.5,
    expirationDate: '2028-09-30',
    minStockLevel: 10
  }
];

export const SEED_NOTIFICATIONS: Notification[] = [
  {
    id: 'NTF-01',
    title: 'Low Stock Alert: NexGard Large Dog',
    message: 'Current inventory is 3 boxes (minimum required threshold: 5). Reorder recommended from Apex Supplies.',
    type: 'inventory_low',
    date: todayStr,
    read: false,
    targetRole: 'Admin'
  },
  {
    id: 'NTF-02',
    title: 'Vaccine Expiration Warning',
    message: 'Rabies Feline/Canine Vaccine (10-dose vials) expires soon. Please cycle refrigerated stock.',
    type: 'inventory_expired',
    date: todayStr,
    read: false,
    targetRole: 'Veterinarian'
  },
  {
    id: 'NTF-03',
    title: 'Patient Checked In: Buddy',
    message: 'Buddy (Golden Retriever) has been checked in by front desk for 09:30 AM Consultation with Dr. Robert Taylor.',
    type: 'appointment',
    date: todayStr,
    read: false,
    targetRole: 'Veterinarian'
  },
  {
    id: 'NTF-04',
    title: 'Appointment Confirmed for Today',
    message: 'Your appointment for Buddy at 09:30 AM is confirmed with Dr. Robert Taylor. We look forward to seeing you!',
    type: 'appointment',
    date: todayStr,
    read: false,
    targetRole: 'Pet Owner',
    targetClientId: 'CLI-01'
  }
];

export const SEED_AUDIT_LOGS: AuditLog[] = [
  {
    id: 'LOG-INIT',
    userId: 'USR-ADMIN',
    userName: 'Dr. Sarah Jenkins',
    userRole: 'Admin',
    action: 'Veterinary platform initialized. RBAC and clinical ledger active.',
    timestamp: new Date().toISOString(),
    entityType: 'System',
    entityId: 'SYS-INIT',
    details: 'Practice database online with multi-tenant client portal and encryption.'
  },
  {
    id: 'LOG-02',
    userId: 'USR-VET',
    userName: 'Dr. Robert Taylor',
    userRole: 'Veterinarian',
    action: 'Authorized Prescription Refill',
    timestamp: new Date(Date.now() - 3600000).toISOString(),
    entityType: 'Prescription',
    entityId: 'RX-501',
    details: 'Authorized Carprofen 75mg chewables for patient Rocky (Owner: Sarah Connor)'
  },
  {
    id: 'LOG-03',
    userId: 'USR-RECEPT',
    userName: 'Emily Clark',
    userRole: 'Receptionist',
    action: 'Patient Checked In',
    timestamp: new Date(Date.now() - 1800000).toISOString(),
    entityType: 'Appointment',
    entityId: 'APP-1001',
    details: 'Patient Buddy arrived and checked in for Consultation Room 2'
  }
];
