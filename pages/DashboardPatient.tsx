import React, { useEffect, useState } from 'react';
import { User, Appointment, AppointmentStatus, UserRole, CallRecord, Message } from '../types';
import { mockDb } from '../services/mockDb';
import { X, Check, Star, Gift, Download, FileText, Loader2 } from 'lucide-react';
import clsx from 'clsx';
import { PlaybackModal } from '../components/PlaybackModal';
import { PatientHero } from '../components/patient/PatientHero';
import { PatientStats } from '../components/patient/PatientStats';
import { PatientAppointments } from '../components/patient/PatientAppointments';

interface Props {
  user: User;
}

export const DashboardPatient: React.FC<Props> = ({ user }) => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [recordings, setRecordings] = useState<CallRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Playback
  const [playbackRecord, setPlaybackRecord] = useState<CallRecord | null>(null);

  // Review & Tip Modal State
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [selectedAptId, setSelectedAptId] = useState<string | null>(null);
  const [selectedDocId, setSelectedDocId] = useState<string | null>(null);
  const [rating, setRating] = useState(5);
  const [tipAmount, setTipAmount] = useState(0); 
  const [reviewText, setReviewText] = useState('');

  // Prescription Modal State
  const [showPrescription, setShowPrescription] = useState(false);
  const [currentPrescription, setCurrentPrescription] = useState<string>('');
  const [currentDocName, setCurrentDocName] = useState('');

  const refresh = async () => {
    const aptData = await mockDb.getAppointments(user.id, UserRole.PATIENT);
    setAppointments(aptData);
    
    // Fetch and filter recordings where user is participant
    const allCalls = await mockDb.getCallRecords();
    const myCalls = allCalls.filter(c => c.callerId === user.id || c.receiverId === user.id);
    setRecordings(myCalls);
    
    setLoading(false);
  };

  useEffect(() => {
    refresh();
  }, [user.id]);

  const openReviewModal = (apt: Appointment) => {
      setSelectedAptId(apt.id);
      setSelectedDocId(apt.doctorId);
      setReviewModalOpen(true);
      setRating(5);
      setTipAmount(0);
      setReviewText('');
  };

  const submitReview = async () => {
      if(selectedAptId && selectedDocId) {
          setIsSubmitting(true);
          // Simulate network
          await new Promise(r => setTimeout(r, 800));

          if (tipAmount > 0) {
              await mockDb.addTip(selectedAptId, tipAmount);
              const sysMsg: Message = {
                  id: Date.now().toString(),
                  appointmentId: selectedAptId,
                  senderId: 'system',
                  senderName: 'System',
                  text: `You sent a $${tipAmount} tip and a ${rating}-star rating!`,
                  timestamp: Date.now(),
                  isAi: false
              };
              await mockDb.saveMessage(sysMsg);
          }
          await mockDb.addReview(selectedAptId, selectedDocId, rating);
          setReviewModalOpen(false);
          await refresh();
          setIsSubmitting(false);
      }
  };

  const openPrescription = (apt: Appointment) => {
      if (apt.prescription) {
          setCurrentPrescription(apt.prescription);
          setCurrentDocName(apt.doctorName);
          setShowPrescription(true);
      }
  };

  const nextAppointment = appointments
    .filter(a => [AppointmentStatus.ACCEPTED, AppointmentStatus.IN_PROGRESS].includes(a.status))
    .sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime())[0];

  const completedCount = appointments.filter(a => a.status === AppointmentStatus.COMPLETED).length;
  const prescriptionCount = appointments.filter(a => a.prescription).length;

  if (loading) {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center space-y-4">
            <Loader2 className="w-10 h-10 text-emerald-500 animate-spin" />
            <p className="text-slate-500 font-medium">Loading Patient Portal...</p>
        </div>
    );
  }

  return (
    <div className="space-y-8 max-w-7xl mx-auto animate-fade-in relative pb-10">
      
      <PatientHero user={user} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Col: Next Appointment & Stats */}
          <div className="space-y-8">
              <PatientStats 
                nextAppointment={nextAppointment} 
                completedCount={completedCount} 
                prescriptionCount={prescriptionCount} 
              />
          </div>

          {/* Right Col: Timeline/History/Recordings */}
          <PatientAppointments 
            user={user}
            appointments={appointments}
            recordings={recordings}
            loading={loading}
            onOpenPlayback={setPlaybackRecord}
            onOpenReview={openReviewModal}
            onOpenPrescription={openPrescription}
          />
      </div>

      {/* REVIEW & TIP MODAL */}
      {reviewModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm animate-fade-in p-4">
              <div className="bg-white dark:bg-slate-900 w-full max-w-md p-6 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 animate-slide-up relative">
                  <button onClick={() => setReviewModalOpen(false)} className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 dark:hover:text-white rounded-full hover:bg-slate-100 dark:hover:bg-slate-800"><X className="w-5 h-5"/></button>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2 text-center">Rate Your Experience</h3>
                  
                  {/* Rating Stars */}
                  <div className="flex justify-center space-x-2 my-6">
                      {[1, 2, 3, 4, 5].map((star) => (
                          <button 
                            key={star} 
                            onClick={() => setRating(star)}
                            className={`transition-all duration-200 hover:scale-110 p-1 ${rating >= star ? 'text-amber-400 fill-current drop-shadow-md' : 'text-slate-200 dark:text-slate-700'}`}
                          >
                              <Star className="w-10 h-10" />
                          </button>
                      ))}
                  </div>

                  {/* Tipping Section */}
                  <div className="mb-6 p-4 bg-emerald-50 dark:bg-emerald-900/10 rounded-2xl border border-emerald-100 dark:border-emerald-800/30">
                      <label className="flex items-center gap-2 text-xs font-bold uppercase text-emerald-600 dark:text-emerald-400 mb-3">
                          <Gift className="w-4 h-4" /> Add a Tip (Optional)
                      </label>
                      <div className="grid grid-cols-4 gap-2">
                          {[0, 5, 10, 20].map(amt => (
                              <button
                                key={amt}
                                onClick={() => setTipAmount(amt)}
                                className={clsx(
                                    "py-2 rounded-xl text-sm font-bold border transition-all",
                                    tipAmount === amt 
                                      ? "bg-emerald-500 text-white border-emerald-500 shadow-md" 
                                      : "bg-white dark:bg-slate-800 text-slate-500 border-slate-200 dark:border-slate-700 hover:border-emerald-300"
                                )}
                              >
                                  {amt === 0 ? 'None' : `$${amt}`}
                              </button>
                          ))}
                      </div>
                  </div>
                  
                  <textarea 
                    className="w-full p-4 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl focus:ring-2 focus:ring-emerald-500 outline-none mb-6 resize-none text-slate-900 dark:text-white"
                    rows={3}
                    placeholder="Write a brief review... (Optional)"
                    value={reviewText}
                    onChange={(e) => setReviewText(e.target.value)}
                  />

                  <button 
                    onClick={submitReview}
                    disabled={isSubmitting}
                    className="w-full bg-emerald-600 text-white py-3.5 rounded-xl font-bold hover:bg-emerald-500 transition-all flex items-center justify-center shadow-lg shadow-emerald-500/30 disabled:opacity-50 disabled:scale-100"
                  >
                      {isSubmitting ? (
                          <>
                             <Loader2 className="w-5 h-5 mr-2 animate-spin" /> Submitting...
                          </>
                      ) : (
                          <>
                             <Check className="w-5 h-5 mr-2" /> Submit Review {tipAmount > 0 && `& $${tipAmount} Tip`}
                          </>
                      )}
                  </button>
              </div>
          </div>
      )}

      {/* PLAYBACK MODAL */}
      <PlaybackModal record={playbackRecord} onClose={() => setPlaybackRecord(null)} />

      {/* PRESCRIPTION MODAL */}
      {showPrescription && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 backdrop-blur-md animate-fade-in p-4">
              <div className="bg-white dark:bg-slate-900 w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden animate-scale-in flex flex-col max-h-[90vh]">
                  <div className="bg-emerald-600 p-6 flex justify-between items-start text-white">
                      <div>
                          <h2 className="text-2xl font-bold flex items-center gap-2"><FileText className="w-6 h-6"/> Medical Prescription</h2>
                          <p className="text-emerald-100 mt-1">Issued by {currentDocName}</p>
                      </div>
                      <button onClick={() => setShowPrescription(false)} className="text-white/80 hover:text-white bg-white/10 hover:bg-white/20 p-2 rounded-full transition-colors"><X className="w-6 h-6"/></button>
                  </div>
                  <div className="p-8 overflow-y-auto bg-white text-slate-900 font-serif">
                      <div className="border-2 border-slate-900 p-8 min-h-[400px]">
                          <div className="flex justify-between border-b-2 border-slate-900 pb-4 mb-6">
                              <div><h3 className="text-3xl font-bold">DocSpot Clinic</h3><p className="text-sm text-slate-600">Digital Health Services</p></div>
                              <div className="text-right"><p className="font-bold">Date: {new Date().toLocaleDateString()}</p><p className="text-sm">Patient: {user.name}</p></div>
                          </div>
                          <pre className="whitespace-pre-wrap font-serif text-lg leading-relaxed">{currentPrescription}</pre>
                          <div className="mt-12 pt-8 border-t border-slate-300 flex justify-between items-end">
                              <div className="text-sm text-slate-500"><p>Generated digitally via DocSpot.</p></div>
                              <div className="text-center"><p className="font-bold">{currentDocName}</p></div>
                          </div>
                      </div>
                  </div>
                  <div className="p-4 bg-slate-50 dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700 flex justify-end">
                      <button onClick={() => alert("Downloading PDF... (Simulation)")} className="flex items-center gap-2 px-6 py-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl font-bold hover:shadow-lg transition-all"><Download className="w-4 h-4" /> Download PDF</button>
                  </div>
              </div>
          </div>
      )}
    </div>
  );
};