import { User, UserRole, Doctor, Appointment, AppointmentStatus, TimeSlot, Message, SystemLog, ActivityType, CallRecord, CallSession, MedicalStatus } from '../types';

/* -------------------------------------------------------------------------- */
/*                                CONFIGURATION                               */
/* -------------------------------------------------------------------------- */

const DB_VERSION = 'v26_elite_auth'; // Updated version to ensure clean seed

const KEYS = {
  USERS: `docspot_users_${DB_VERSION}`, 
  APPOINTMENTS: `docspot_appointments_${DB_VERSION}`,
  SESSION: `docspot_session_${DB_VERSION}`,
  LOGS: `docspot_logs_${DB_VERSION}`,
  MESSAGES: `docspot_messages_${DB_VERSION}`,
  CALLS: `docspot_calls_${DB_VERSION}`,
  ACTIVE_CALL: `docspot_active_call_${DB_VERSION}`,
  SYNC_STATUS: `docspot_sync_status`
};

const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;

/* -------------------------------------------------------------------------- */
/*                                SEED DATA                                   */
/* -------------------------------------------------------------------------- */

const SEED_ADMIN: User = {
  id: 'admin-1',
  name: 'Alex (System Owner)',
  email: 'alex@docspot.com',
  password: 'admin',
  role: UserRole.ADMIN,
  avatar: 'https://ui-avatars.com/api/?name=Alex+Owner&background=0D8ABC&color=fff',
  joinedAt: Date.now(),
  lastLoginAt: Date.now(),
  accountStatus: 'active'
};

const SEED_DOCTOR: Doctor = {
  id: 'doc-1',
  name: 'Dr. Sarah Demo',
  email: 'sarah@docspot.com',
  password: 'pass',
  role: UserRole.DOCTOR,
  avatar: 'https://ui-avatars.com/api/?name=Sarah+Demo&background=10b981&color=fff',
  joinedAt: Date.now(),
  lastLoginAt: Date.now(),
  accountStatus: 'active',
  specialization: 'Cardiologist',
  experience: 12,
  hospital: 'DocSpot Heart Center',
  fees: 150,
  verified: true,
  rating: 4.9,
  reviews: 128,
  about: 'Senior Cardiologist with over a decade of experience in interventional cardiology. Committed to providing top-tier heart care.',
  availableDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
  startTime: '09:00',
  endTime: '17:00'
};

const SEED_PATIENT: User = {
  id: 'pat-1',
  name: 'John Demo',
  email: 'john@example.com',
  password: 'pass',
  role: UserRole.PATIENT,
  avatar: 'https://ui-avatars.com/api/?name=John+Demo&background=3b82f6&color=fff',
  joinedAt: Date.now(),
  lastLoginAt: Date.now(),
  accountStatus: 'active',
  age: 32,
  gender: 'Male',
  bloodGroup: 'O+',
  medicalStatus: 'Healthy'
};

/* -------------------------------------------------------------------------- */
/*                        HYBRID ENGINE (LOCAL + CLOUD)                       */
/* -------------------------------------------------------------------------- */

const getLocal = <T>(key: string, defaultVal: T): T => {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultVal;
  } catch (e) {
    console.warn(`Error parsing ${key}, resetting to default.`);
    return defaultVal;
  }
};

const setLocal = (key: string, data: any) => {
  try {
    localStorage.setItem(key, JSON.stringify(data));
    window.dispatchEvent(new Event('storage')); 
  } catch (e) {
    console.error("LocalStorage Write Error:", e);
  }
};

// --- SYNC LOGIC ---

// Placeholder for real backend connection (e.g., MongoDB URL)
const REMOTE_API_URL = process.env.MONGODB_URI || null; 
let isRemoteConnected = false;

// Function to upload all local data to the remote cloud
const syncLocalToCloud = async () => {
    if (!REMOTE_API_URL) return;
    
    // In a real app, this sends a bulk POST request
    const payload = {
        users: getLocal(KEYS.USERS, []),
        appointments: getLocal(KEYS.APPOINTMENTS, []),
        logs: getLocal(KEYS.LOGS, []),
        messages: getLocal(KEYS.MESSAGES, [])
    };

    try {
        // Simulation of API Call
        // await fetch(`${REMOTE_API_URL}/sync`, { method: 'POST', body: JSON.stringify(payload) });
        
        localStorage.setItem(KEYS.SYNC_STATUS, new Date().toISOString());
        isRemoteConnected = true;
    } catch (e) {
        console.warn("⚠️ SYNC FAILED: Remote DB unreachable. Continuing in Offline Mode.");
        isRemoteConnected = false;
    }
};

const initializeDb = async () => {
  // 1. Initialize Local Storage if Empty (Offline Mode Default)
  if (!localStorage.getItem(KEYS.USERS)) {
    console.log("Initializing Local Offline Database...");
    setLocal(KEYS.USERS, [SEED_ADMIN, SEED_DOCTOR, SEED_PATIENT]);
    setLocal(KEYS.APPOINTMENTS, []);
    setLocal(KEYS.LOGS, []);
    setLocal(KEYS.MESSAGES, []);
    setLocal(KEYS.CALLS, []);
  }

  // 2. Try to Sync if Cloud Config exists
  if (REMOTE_API_URL) {
      await syncLocalToCloud();
  } else {
      console.log("ℹ️ No Remote DB configured. Running in Local-Only Mode.");
  }
};

// Initialize immediately
initializeDb();


/* -------------------------------------------------------------------------- */
/*                                 API EXPORTS                                */
/* -------------------------------------------------------------------------- */

export const mockDb = {

  getConnectionStatus: () => {
      return {
          type: isRemoteConnected ? 'Cloud Synced' : 'Local Storage',
          status: isRemoteConnected ? 'Online' : 'Offline Mode',
          lastSync: getLocal(KEYS.SYNC_STATUS, 'Never')
      };
  },

  // --- SIGNALING / REAL CALLS ---
  initiateCall: async (caller: User, receiverId: string, appointmentId: string, isVideo: boolean): Promise<CallSession> => {
      const session: CallSession = {
          id: `call-${Date.now()}`,
          appointmentId,
          caller,
          receiverId,
          status: 'ringing',
          isVideo,
          startTime: Date.now()
      };
      setLocal(KEYS.ACTIVE_CALL, session);
      return session;
  },

  answerCall: async () => {
      const session = getLocal<CallSession | null>(KEYS.ACTIVE_CALL, null);
      if (session && session.status === 'ringing') {
          session.status = 'connected';
          session.startTime = Date.now();
          setLocal(KEYS.ACTIVE_CALL, session);
      }
  },

  rejectCall: async () => {
      const session = getLocal<CallSession | null>(KEYS.ACTIVE_CALL, null);
      if (session) {
          session.status = 'rejected';
          setLocal(KEYS.ACTIVE_CALL, session);
          setTimeout(() => localStorage.removeItem(KEYS.ACTIVE_CALL), 2000);
      }
  },

  endCall: async () => {
      const session = getLocal<CallSession | null>(KEYS.ACTIVE_CALL, null);
      if (session) {
          const duration = Math.floor((Date.now() - (session.startTime || Date.now())) / 1000);
          
          const users = getLocal<User[]>(KEYS.USERS, []);
          const receiver = users.find(u => u.id === session.receiverId);

          const record: CallRecord = {
              id: session.id,
              appointmentId: session.appointmentId,
              callerId: session.caller.id,
              callerName: session.caller.name,
              receiverId: session.receiverId,
              receiverName: receiver ? receiver.name : 'Unknown User',
              timestamp: session.startTime || Date.now(),
              duration: duration,
              type: session.isVideo ? 'video' : 'audio',
              recordingUrl: `secure_record_${Date.now()}.${session.isVideo ? 'webm' : 'mp3'}`,
              size: session.isVideo ? `${(duration * 1.2 + 2).toFixed(1)} MB` : `${(duration * 0.1 + 0.5).toFixed(1)} MB`
          };
          
          const calls = getLocal<CallRecord[]>(KEYS.CALLS, []);
          setLocal(KEYS.CALLS, [record, ...calls]);

          session.status = 'ended';
          setLocal(KEYS.ACTIVE_CALL, session);
          
          setTimeout(() => {
              localStorage.removeItem(KEYS.ACTIVE_CALL);
              window.dispatchEvent(new Event('storage'));
          }, 1000);
      }
  },

  getActiveCall: (): CallSession | null => {
      return getLocal<CallSession | null>(KEYS.ACTIVE_CALL, null);
  },

  // --- TYPING INDICATOR SIGNALING ---
  setTyping: (appointmentId: string, userId: string) => {
      const key = `docspot_typing_${appointmentId}`;
      localStorage.setItem(key, JSON.stringify({ userId, timestamp: Date.now() }));
  },

  getTyping: (appointmentId: string): { userId: string, timestamp: number } | null => {
      const key = `docspot_typing_${appointmentId}`;
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : null;
  },

  // --- LOGGING ---
  logActivity: (userId: string, userName: string, type: ActivityType, details: string) => {
      const logs = getLocal<SystemLog[]>(KEYS.LOGS, []);
      const newLog: SystemLog = {
          id: `log-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          timestamp: Date.now(),
          userId,
          userName,
          type,
          details
      };
      setLocal(KEYS.LOGS, [newLog, ...logs]);
  },

  getSystemLogs: async (): Promise<SystemLog[]> => {
      return getLocal<SystemLog[]>(KEYS.LOGS, []);
  },

  // --- MESSAGING ---
  saveMessage: async (msg: Message) => {
      const messages = getLocal<Message[]>(KEYS.MESSAGES, []);
      setLocal(KEYS.MESSAGES, [...messages, msg]);
  },

  getChatHistory: async (appointmentId: string): Promise<Message[]> => {
      const messages = getLocal<Message[]>(KEYS.MESSAGES, []);
      return messages.filter(m => m.appointmentId === appointmentId).sort((a,b) => a.timestamp - b.timestamp);
  },

  // --- CALL RECORDING ---
  saveCallRecord: async (record: CallRecord) => {
      const calls = getLocal<CallRecord[]>(KEYS.CALLS, []);
      setLocal(KEYS.CALLS, [record, ...calls]);
      mockDb.logActivity(record.callerId, record.callerName, ActivityType.CALL, `${record.type.toUpperCase()} Call ended with ${record.receiverName} (${record.duration}s)`);
  },

  getCallRecords: async (): Promise<CallRecord[]> => {
      return getLocal<CallRecord[]>(KEYS.CALLS, []);
  },

  deleteCallRecord: async (id: string) => {
      const calls = getLocal<CallRecord[]>(KEYS.CALLS, []);
      setLocal(KEYS.CALLS, calls.filter(c => c.id !== id));
      mockDb.logActivity('admin', 'Alex (Admin)', ActivityType.STATUS_CHANGE, `Deleted call record: ${id}`);
  },

  // --- AUTH & ACCOUNT MANAGEMENT ---
  login: async (email: string, password: string, remember: boolean = true): Promise<User | null> => {
    return new Promise((resolve, reject) => {
      const users = getLocal<User[]>(KEYS.USERS, []);
      const idx = users.findIndex(u => u.email === email && u.password === password);
      
      if (idx !== -1) {
        const user = users[idx];

        if (user.accountStatus === 'disabled') {
            reject(new Error("Your account has been disabled. Please contact the administrator."));
            return;
        }

        if (user.role === UserRole.DOCTOR && user.lastLoginAt) {
            const timeSinceLastLogin = Date.now() - user.lastLoginAt;
            if (timeSinceLastLogin > THIRTY_DAYS_MS) {
                user.accountStatus = 'disabled';
                users[idx] = user;
                setLocal(KEYS.USERS, users);
                mockDb.logActivity(user.id, user.name, ActivityType.STATUS_CHANGE, "Account auto-disabled due to 30+ days inactivity.");
                reject(new Error("Account disabled due to inactivity (30+ days). Contact Admin to reactivate."));
                return;
            }
        }

        user.lastLoginAt = Date.now();
        users[idx] = user;
        setLocal(KEYS.USERS, users);

        try {
            localStorage.removeItem(KEYS.SESSION);
            sessionStorage.removeItem(KEYS.SESSION);
            if (remember) {
            localStorage.setItem(KEYS.SESSION, JSON.stringify(user));
            } else {
            sessionStorage.setItem(KEYS.SESSION, JSON.stringify(user));
            }
        } catch(e) { console.error("Session storage error", e); }

        mockDb.logActivity(user.id, user.name, ActivityType.LOGIN, `User logged in`);
        resolve(user);
        
        // Trigger Sync on Login
        if(REMOTE_API_URL) syncLocalToCloud();

      } else {
        resolve(null);
      }
    });
  },

  logout: async () => {
    localStorage.removeItem(KEYS.SESSION);
    sessionStorage.removeItem(KEYS.SESSION);
  },

  getSession: async (): Promise<User | null> => {
    try {
      const local = localStorage.getItem(KEYS.SESSION);
      if (local) return JSON.parse(local);
      const session = sessionStorage.getItem(KEYS.SESSION);
      if (session) return JSON.parse(session);
      return null;
    } catch (e) {
      console.warn("Session data corrupted, clearing session.");
      localStorage.removeItem(KEYS.SESSION);
      sessionStorage.removeItem(KEYS.SESSION);
      return null;
    }
  },

  registerPatient: async (name: string, email: string, password: string, age: number, gender: string, bloodGroup: string): Promise<User> => {
    const users = getLocal<User[]>(KEYS.USERS, []);
    if (users.find(u => u.email === email)) throw new Error('Email already exists');

    const newUser: User = {
      id: `pat-${Date.now()}`,
      name,
      email,
      password,
      role: UserRole.PATIENT,
      avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random`,
      age,
      gender,
      bloodGroup,
      joinedAt: Date.now(),
      lastLoginAt: Date.now(),
      accountStatus: 'active',
      medicalStatus: 'Healthy'
    };

    setLocal(KEYS.USERS, [...users, newUser]);
    localStorage.setItem(KEYS.SESSION, JSON.stringify(newUser)); 
    mockDb.logActivity(newUser.id, newUser.name, ActivityType.REGISTER, `New patient registration`);
    return newUser;
  },

  getAllUsers: async (): Promise<User[]> => {
      return getLocal<User[]>(KEYS.USERS, []);
  },

  getDoctors: async (): Promise<Doctor[]> => {
      const users = getLocal<User[]>(KEYS.USERS, []);
      return users.filter(u => u.role === UserRole.DOCTOR) as Doctor[];
  },

  // Calculate Doctor Revenue from Completed Appointments
  getDoctorRevenue: async (doctorId: string): Promise<number> => {
      const appointments = getLocal<Appointment[]>(KEYS.APPOINTMENTS, []);
      return appointments
          .filter(a => a.doctorId === doctorId && a.status === AppointmentStatus.COMPLETED)
          .reduce((total, a) => total + (a.fee || 0) + (a.tipAmount || 0), 0);
  },

  updateUser: async (id: string, updates: Partial<User>): Promise<User> => {
    const users = getLocal<User[]>(KEYS.USERS, []);
    const idx = users.findIndex(u => u.id === id);
    if (idx === -1) throw new Error('User not found');
    
    if (updates.email && updates.email !== users[idx].email) {
        if (users.find(u => u.email === updates.email)) throw new Error('Email already taken');
    }

    const updatedUser = { ...users[idx], ...updates };
    users[idx] = updatedUser;
    
    setLocal(KEYS.USERS, users);
    mockDb.logActivity('admin', 'System', ActivityType.STATUS_CHANGE, `Updated profile/status for: ${updatedUser.name}`);
    return updatedUser;
  },

  deleteUser: async (id: string): Promise<void> => {
    const users = getLocal<User[]>(KEYS.USERS, []);
    const userToDelete = users.find(u => u.id === id);
    
    if (userToDelete) {
        if (userToDelete.role === UserRole.ADMIN) throw new Error("Cannot delete the root Admin.");

        const newUsers = users.filter(u => u.id !== id);
        setLocal(KEYS.USERS, newUsers);

        const appointments = getLocal<Appointment[]>(KEYS.APPOINTMENTS, []);
        const validAppointments = appointments.filter(a => a.patientId !== id && a.doctorId !== id);
        setLocal(KEYS.APPOINTMENTS, validAppointments);

        const messages = getLocal<Message[]>(KEYS.MESSAGES, []);
        const validMessages = messages.filter(m => m.senderId !== id);
        setLocal(KEYS.MESSAGES, validMessages);

        mockDb.logActivity('admin', 'Alex (Admin)', ActivityType.STATUS_CHANGE, `PERMANENTLY Deleted user: ${userToDelete.name}`);
    }
  },

  createDoctor: async (doctorData: Omit<Doctor, 'id' | 'role' | 'verified' | 'rating' | 'reviews' | 'joinedAt'>): Promise<Doctor> => {
    const users = getLocal<User[]>(KEYS.USERS, []);
    if (users.find(u => u.email === doctorData.email)) throw new Error('Email already exists');

    const newDoc: Doctor = {
      ...doctorData,
      id: `doc-${Date.now()}`,
      role: UserRole.DOCTOR,
      verified: true,
      rating: 5.0,
      reviews: 0,
      avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(doctorData.name)}&background=random`,
      joinedAt: Date.now(),
      lastLoginAt: Date.now(),
      accountStatus: 'active'
    };

    setLocal(KEYS.USERS, [...users, newDoc]);
    mockDb.logActivity('admin', 'Alex (Admin)', ActivityType.REGISTER, `Created new doctor: ${newDoc.name}`);
    return newDoc;
  },

  createPatient: async (patientData: Omit<User, 'id' | 'role' | 'joinedAt'>): Promise<User> => {
    const users = getLocal<User[]>(KEYS.USERS, []);
    if (users.find(u => u.email === patientData.email)) throw new Error('Email already exists');

    const newUser: User = {
      ...patientData,
      id: `pat-${Date.now()}`,
      role: UserRole.PATIENT,
      avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(patientData.name)}&background=random`,
      joinedAt: Date.now(),
      lastLoginAt: Date.now(),
      accountStatus: 'active',
      medicalStatus: 'Healthy'
    };

    setLocal(KEYS.USERS, [...users, newUser]);
    mockDb.logActivity('admin', 'Alex (Admin)', ActivityType.REGISTER, `Created new patient: ${newUser.name}`);
    return newUser;
  },

  updateDoctor: async (id: string, updates: Partial<Doctor>): Promise<Doctor> => {
    return mockDb.updateUser(id, updates) as Promise<Doctor>;
  },

  createAppointment: async (apt: Partial<Appointment>): Promise<Appointment> => {
      const appointments = getLocal<Appointment[]>(KEYS.APPOINTMENTS, []);
      const users = getLocal<User[]>(KEYS.USERS, []);
      const doctor = users.find(u => u.id === apt.doctorId) as Doctor;
      
      const newApt: Appointment = {
          id: `DS-APT-${Date.now()}`,
          status: AppointmentStatus.PENDING,
          patientId: apt.patientId!,
          patientName: apt.patientName!,
          doctorId: apt.doctorId!,
          doctorName: apt.doctorName!,
          doctorAvatar: apt.doctorAvatar,
          date: apt.date!,
          time: apt.time!,
          reason: apt.reason!,
          type: 'Online',
          fee: doctor ? doctor.fees : 100,
          aiSummary: apt.aiSummary,
          tipAmount: 0
      };
      
      setLocal(KEYS.APPOINTMENTS, [...appointments, newApt]);
      mockDb.logActivity(newApt.patientId, newApt.patientName, ActivityType.BOOKING, `Booked appointment with Dr. ${newApt.doctorName}`);
      return newApt;
  },

  cancelAppointment: async (id: string, reason: string): Promise<void> => {
      const appointments = getLocal<Appointment[]>(KEYS.APPOINTMENTS, []);
      const idx = appointments.findIndex(a => a.id === id);
      if (idx !== -1) {
          appointments[idx].status = AppointmentStatus.REJECTED; 
          setLocal(KEYS.APPOINTMENTS, appointments);
          mockDb.logActivity(appointments[idx].patientId, 'System', ActivityType.STATUS_CHANGE, `Appointment ${id} cancelled. Reason: ${reason}`);
      }
  },

  addTip: async (appointmentId: string, amount: number) => {
      const appointments = getLocal<Appointment[]>(KEYS.APPOINTMENTS, []);
      const idx = appointments.findIndex(a => a.id === appointmentId);
      if (idx !== -1) {
          appointments[idx].tipAmount = (appointments[idx].tipAmount || 0) + amount;
          setLocal(KEYS.APPOINTMENTS, appointments);
          mockDb.logActivity(appointments[idx].patientId, 'Patient', ActivityType.FINANCE, `Tipped Doctor $${amount}`);
      }
  },

  getAppointments: async (userId: string, role: UserRole): Promise<Appointment[]> => {
    const appointments = getLocal<Appointment[]>(KEYS.APPOINTMENTS, []);
    if (role === UserRole.PATIENT) {
      return appointments.filter(a => a.patientId === userId).sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    } else if (role === UserRole.DOCTOR) {
      return appointments.filter(a => a.doctorId === userId).sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    }
    return appointments;
  },

  getAllAppointments: async (): Promise<Appointment[]> => {
      return getLocal<Appointment[]>(KEYS.APPOINTMENTS, []);
  },

  updateAppointmentStatus: async (id: string, status: AppointmentStatus): Promise<void> => {
    const appointments = getLocal<Appointment[]>(KEYS.APPOINTMENTS, []);
    const idx = appointments.findIndex(a => a.id === id);
    if (idx !== -1) {
      const oldStatus = appointments[idx].status;
      appointments[idx].status = status;
      setLocal(KEYS.APPOINTMENTS, appointments);
      mockDb.logActivity('system', 'System', ActivityType.STATUS_CHANGE, `Appointment ${id} changed from ${oldStatus} to ${status}`);
    }
  },

  generateSlots: async (doctorId: string, date: string): Promise<TimeSlot[]> => {
      const appointments = getLocal<Appointment[]>(KEYS.APPOINTMENTS, []);
      const users = getLocal<User[]>(KEYS.USERS, []);
      const doctor = users.find(u => u.id === doctorId) as Doctor;
      
      const slots: TimeSlot[] = [];
      if (!doctor) return slots;

      const startHour = parseInt(doctor.startTime.split(':')[0]);
      const endHour = parseInt(doctor.endTime.split(':')[0]);

      for (let i = startHour; i < endHour; i++) {
          const time = `${i.toString().padStart(2, '0')}:00`;
          const isBooked = appointments.some(a => 
              a.doctorId === doctorId && 
              a.date === date && 
              a.time === time && 
              a.status !== AppointmentStatus.REJECTED
          );
          
          slots.push({ time, available: !isBooked });
      }
      return slots;
  },

  addReview: async (appointmentId: string, doctorId: string, rating: number) => {
      const appointments = getLocal<Appointment[]>(KEYS.APPOINTMENTS, []);
      const aptIdx = appointments.findIndex(a => a.id === appointmentId);
      if (aptIdx !== -1) {
          appointments[aptIdx].isReviewed = true;
          setLocal(KEYS.APPOINTMENTS, appointments);

          const users = getLocal<User[]>(KEYS.USERS, []);
          const docIdx = users.findIndex(u => u.id === doctorId);
          if (docIdx !== -1) {
              const doc = users[docIdx] as Doctor;
              const totalScore = (doc.rating * doc.reviews) + rating;
              const newCount = doc.reviews + 1;
              doc.rating = Number((totalScore / newCount).toFixed(1));
              doc.reviews = newCount;
              users[docIdx] = doc;
              setLocal(KEYS.USERS, users);
          }
          
          mockDb.logActivity(appointments[aptIdx].patientId, appointments[aptIdx].patientName, ActivityType.REVIEW, `Rated Dr. ${appointments[aptIdx].doctorName} ${rating} stars`);
      }
  },

  getAnalytics: async () => {
      const users = getLocal<User[]>(KEYS.USERS, []);
      const appointments = getLocal<Appointment[]>(KEYS.APPOINTMENTS, []);
      
      const now = Date.now();
      const oneDay = 24 * 60 * 60 * 1000;
      const oneWeek = 7 * oneDay;
      const oneMonth = 30 * oneDay;

      const newUsersToday = users.filter(u => (now - (u.joinedAt || 0)) < oneDay).length;
      const newUsersWeek = users.filter(u => (now - (u.joinedAt || 0)) < oneWeek).length;
      const newUsersMonth = users.filter(u => (now - (u.joinedAt || 0)) < oneMonth).length;

      const completedApts = appointments.filter(a => a.status === AppointmentStatus.COMPLETED);
      
      const calcRevenue = (a: Appointment) => (a.fee || 0) + (a.tipAmount || 0);

      const revenueToday = completedApts
          .filter(a => (now - new Date(a.date).getTime()) < oneDay)
          .reduce((sum, a) => sum + calcRevenue(a), 0);
      
      const revenueWeek = completedApts
          .filter(a => (now - new Date(a.date).getTime()) < oneWeek)
          .reduce((sum, a) => sum + calcRevenue(a), 0);
          
      const revenueMonth = completedApts
          .filter(a => (now - new Date(a.date).getTime()) < oneMonth)
          .reduce((sum, a) => sum + calcRevenue(a), 0);

      const totalRevenue = completedApts.reduce((sum, a) => sum + calcRevenue(a), 0);

      return {
          users: {
              total: users.length,
              today: newUsersToday,
              week: newUsersWeek,
              month: newUsersMonth
          },
          finance: {
              total: totalRevenue,
              today: revenueToday,
              week: revenueWeek,
              month: revenueMonth
          }
      };
  },

  getDeepContext: async (user: User): Promise<string> => {
      const allUsers = getLocal<User[]>(KEYS.USERS, []);
      const appointments = getLocal<Appointment[]>(KEYS.APPOINTMENTS, []);
      
      let context = `Current User: ${user.name} (Role: ${user.role}, ID: ${user.id})\n`;
      
      if (user.role === UserRole.PATIENT) {
          const myApts = appointments.filter(a => a.patientId === user.id);
          const doctors = allUsers.filter(u => u.role === UserRole.DOCTOR) as Doctor[];
          
          context += `\nPERSONAL MEDICAL DATA:\n`;
          context += `- Age: ${user.age}\n`;
          context += `- Blood Group: ${user.bloodGroup}\n`;
          context += `- Current Status: ${user.medicalStatus || 'Unknown'}\n`;

          context += `\nUPCOMING APPOINTMENTS (Can be cancelled):\n`;
          const upcoming = myApts.filter(a => ['pending', 'accepted'].includes(a.status));
          if (upcoming.length === 0) context += "No upcoming appointments.\n";
          upcoming.forEach(a => {
              context += `- ID: ${a.id} | Date: ${a.date} | Time: ${a.time} | Dr. ${a.doctorName}\n`;
          });
          
          context += `\nAVAILABLE DOCTORS FOR BOOKING:\n`;
          doctors.forEach(d => {
              context += `- Dr. ${d.name} (ID: ${d.id}): ${d.specialization}, Fee: $${d.fees}, Days: ${d.availableDays.join(',')}\n`;
          });
      
      } else if (user.role === UserRole.DOCTOR) {
          const myApts = appointments.filter(a => a.doctorId === user.id);
          const today = new Date().toISOString().split('T')[0];
          const todayApts = myApts.filter(a => a.date === today && a.status === 'accepted');
          
          context += `\nMY SCHEDULE TODAY (${today}):\n`;
          if (todayApts.length === 0) context += "No appointments today.\n";
          todayApts.forEach(a => {
              context += `- ${a.time}: Patient ${a.patientName} (${a.reason})\n`;
          });
      }
      
      return context;
  }
};