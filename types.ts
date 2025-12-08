
export enum UserRole {
  PATIENT = 'patient',
  DOCTOR = 'doctor',
  ADMIN = 'admin',
}

export const GLOBAL_BOT_ID = 'docspot-global-ai';

export type AccountStatus = 'active' | 'disabled';

// New Medical Status types for Doctor/Admin management
export type MedicalStatus = 'Outpatient (OP)' | 'Inpatient (IP)' | 'Observation' | 'Critical' | 'Discharged' | 'Healthy';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  password?: string;
  joinedAt: number; // For analytics
  lastLoginAt?: number; // For inactivity tracking
  accountStatus?: AccountStatus; // For disabling logic
  // Patient Specific
  age?: number;
  gender?: string;
  bloodGroup?: string;
  medicalStatus?: MedicalStatus; // New field for status management
  
  // Extended Health Profile
  height?: string; // e.g. "5'10"
  weight?: string; // e.g. "75kg"
  allergies?: string[];
  chronicConditions?: string[];
  currentMedications?: string[];
  lifestyle?: string[]; // e.g. "Smoker", "Active"
}

export interface Review {
  id: string;
  patientName: string;
  rating: number;
  comment: string;
  date: string;
}

export interface Doctor extends User {
  specialization: string;
  experience: number;
  verified: boolean;
  hospital: string;
  fees: number;
  rating: number;
  reviews: number;
  about: string;
  availableDays: string[]; // e.g., ['Mon', 'Tue']
  startTime: string; // "09:00"
  endTime: string;   // "17:00"
}

export enum AppointmentStatus {
  PENDING = 'pending',
  ACCEPTED = 'accepted',
  IN_PROGRESS = 'in_progress',
  REJECTED = 'rejected',
  COMPLETED = 'completed',
}

export interface Appointment {
  id: string;
  patientId: string;
  patientName: string;
  doctorId: string;
  doctorName: string;
  doctorAvatar?: string;
  date: string;
  time: string;
  reason: string;
  status: AppointmentStatus;
  type: 'Online' | 'In-Person';
  fee: number; // Snapshot of cost
  aiSummary?: string;
  isReviewed?: boolean;
  prescription?: string; // New field for prescriptions
  tipAmount?: number; // New field for Tipping
}

export interface BookingAction {
  type: 'BOOKING_PROPOSAL' | 'CANCEL_PROPOSAL';
  doctorId?: string;
  doctorName?: string;
  appointmentId?: string; // Required for cancellation
  date?: string;
  time?: string;
  reason?: string;
}

export interface Message {
  id: string;
  appointmentId: string;
  senderId: string;
  senderName: string;
  text: string;
  timestamp: number;
  isAi: boolean;
  action?: BookingAction; // New field for system actions
}

export interface TimeSlot {
  time: string;
  available: boolean;
}

export enum ActivityType {
  LOGIN = 'LOGIN',
  LOGOUT = 'LOGOUT',
  REGISTER = 'REGISTER',
  BOOKING = 'BOOKING',
  STATUS_CHANGE = 'STATUS_CHANGE',
  REVIEW = 'REVIEW',
  DOCTOR_UPDATE = 'DOCTOR_UPDATE',
  CALL = 'CALL',
  FINANCE = 'FINANCE'
}

export interface SystemLog {
  id: string;
  timestamp: number;
  type: ActivityType;
  userId: string;
  userName: string;
  details: string;
}

export interface CallRecord {
  id: string;
  appointmentId: string;
  callerId: string;
  callerName: string;
  receiverId: string;
  receiverName: string;
  timestamp: number;
  duration: number; // in seconds
  type: 'audio' | 'video';
  recordingUrl?: string; // Simulated URL
  size?: string; // e.g., "15 MB"
}

// --- REAL-TIME SIGNALING TYPES ---
export type CallState = 'ringing' | 'connected' | 'ended' | 'rejected' | 'busy';

export interface CallSession {
  id: string;
  appointmentId: string;
  caller: User;
  receiverId: string;
  status: CallState;
  isVideo: boolean;
  startTime?: number;
}
