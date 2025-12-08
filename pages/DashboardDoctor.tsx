import React, { useEffect, useState } from 'react';
import { User, Appointment, AppointmentStatus, UserRole, Doctor, MedicalStatus } from '../types';
import { mockDb } from '../services/mockDb';
import { DoctorHeader } from '../components/doctor/DoctorHeader';
import { DoctorActivePatient } from '../components/doctor/DoctorActivePatient';
import { DoctorQueue } from '../components/doctor/DoctorQueue';
import { Loader2 } from 'lucide-react';

interface Props {
  user: User;
}

export const DashboardDoctor: React.FC<Props> = ({ user }) => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [doctorDetails, setDoctorDetails] = useState<Doctor | null>(null);
  const [chartData, setChartData] = useState<any[]>([]);
  const [activePatientUser, setActivePatientUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null); // For loading states on actions
  const [currentTime, setCurrentTime] = useState(new Date());

  const refresh = async () => {
    const data = await mockDb.getAppointments(user.id, UserRole.DOCTOR);
    setAppointments(data);
    const doctors = await mockDb.getDoctors();
    const me = doctors.find(d => d.id === user.id);
    if(me) setDoctorDetails(me);
    
    const activeApt = data.find(a => a.status === AppointmentStatus.IN_PROGRESS);
    if (activeApt) {
        const users = await mockDb.getAllUsers();
        const p = users.find(u => u.id === activeApt.patientId);
        setActivePatientUser(p || null);
    } else {
        setActivePatientUser(null);
    }
    setLoading(false);
  };

  useEffect(() => { refresh(); }, [user.id]);

  useEffect(() => {
      const timer = setInterval(() => setCurrentTime(new Date()), 1000);
      return () => clearInterval(timer);
  }, []);

  useEffect(() => {
      const data = [
          { name: 'Mon', revenue: 450, patients: 3 }, 
          { name: 'Tue', revenue: 600, patients: 5 }, 
          { name: 'Wed', revenue: 900, patients: 8 },
          { name: 'Thu', revenue: 750, patients: 6 }, 
          { name: 'Fri', revenue: 1200, patients: 12 }, 
          { name: 'Sat', revenue: 300, patients: 2 }, 
          { name: 'Sun', revenue: 0, patients: 0 },
      ];
      setChartData(data);
  }, []);

  const handleStatus = async (id: string, status: AppointmentStatus) => {
    setProcessingId(id);
    // Simulate slight delay for better UX feel
    await new Promise(r => setTimeout(r, 400));
    await mockDb.updateAppointmentStatus(id, status);
    await refresh();
    setProcessingId(null);
  };

  const handlePatientStatusChange = async (newStatus: MedicalStatus) => {
      if (activePatientUser) {
          setProcessingId('status-update');
          await mockDb.updateUser(activePatientUser.id, { medicalStatus: newStatus });
          setActivePatientUser({ ...activePatientUser, medicalStatus: newStatus });
          setProcessingId(null);
      }
  };

  const activePatient = appointments.find(a => a.status === AppointmentStatus.IN_PROGRESS);
  const pendingRequests = appointments.filter(a => a.status === AppointmentStatus.PENDING);
  const queue = appointments.filter(a => a.status === AppointmentStatus.ACCEPTED);
  const completedToday = appointments.filter(a => a.status === AppointmentStatus.COMPLETED && new Date(a.date).toDateString() === new Date().toDateString()).length;

  if (loading) {
      return (
          <div className="min-h-screen flex flex-col items-center justify-center space-y-4">
              <Loader2 className="w-10 h-10 text-emerald-500 animate-spin" />
              <p className="text-slate-500 font-medium">Initializing Medical Cockpit...</p>
          </div>
      );
  }

  return (
    <div className="min-h-screen max-w-[1800px] mx-auto pb-10 space-y-6 font-sans">
        
        <DoctorHeader 
            user={user} 
            doctorDetails={doctorDetails} 
            currentTime={currentTime} 
            queueLength={queue.length}
            completedTodayRevenue={completedToday * (doctorDetails?.fees || 0)}
        />

        {/* --- MAIN COCKPIT --- */}
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
            
            {/* Pass processingId down to components to show spinners */}
            <DoctorActivePatient 
                activePatient={activePatient}
                activePatientUser={activePatientUser}
                onStatusChange={handleStatus}
                onPatientStatusChange={handlePatientStatusChange}
                chartData={chartData}
                processingId={processingId}
            />

            <DoctorQueue 
                pendingRequests={pendingRequests}
                queue={queue}
                onStatusChange={handleStatus}
                processingId={processingId}
            />
        </div>
    </div>
  );
};