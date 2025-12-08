import React, { useState, useEffect } from 'react';
import { mockDb } from '../services/mockDb';
import { Doctor, User, TimeSlot } from '../types';
import { MapPin, Star, Search, Sparkles, Loader2, Calendar, Clock, ChevronRight, AlertCircle, Ticket, CheckCircle2, Circle, ChevronLeft, Stethoscope, ShieldCheck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { generateSymptomSummary } from '../services/geminiService';
import clsx from 'clsx';

interface Props {
  user: User;
}

const COMMON_REASONS = [
  "General Checkup",
  "Fever / Cold / Flu",
  "Skin Issue / Rash",
  "Stomach Pain / Gastric",
  "Headache / Migraine",
  "Follow-up Visit"
];

export const BookAppointment: React.FC<Props> = ({ user }) => {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  
  // Form State
  const [selectedReason, setSelectedReason] = useState(COMMON_REASONS[0]);
  const [customReason, setCustomReason] = useState('');
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedSlot, setSelectedSlot] = useState('');
  const [availableSlots, setAvailableSlots] = useState<TimeSlot[]>([]);
  
  // Date Picker State
  const [dateDates, setDateDates] = useState<Date[]>([]);

  // AI State
  const [aiSummary, setAiSummary] = useState('');
  const [isSummarizing, setIsSummarizing] = useState(false);
  
  // Loading State
  const [isBooking, setIsBooking] = useState(false);
  
  const [step, setStep] = useState(1); // 1: List, 2: Details/Slot
  const navigate = useNavigate();

  useEffect(() => {
    mockDb.getDoctors().then(setDoctors);
    
    // Generate next 14 days
    const dates = [];
    const today = new Date();
    for (let i = 0; i < 14; i++) {
        const d = new Date(today);
        d.setDate(today.getDate() + i);
        dates.push(d);
    }
    setDateDates(dates);
  }, []);

  // When date changes, fetch slots
  useEffect(() => {
    if (selectedDoctor && selectedDate) {
      const dateStr = selectedDate.toISOString().split('T')[0];
      mockDb.generateSlots(selectedDoctor.id, dateStr).then(setAvailableSlots);
      setSelectedSlot('');
    }
  }, [selectedDate, selectedDoctor]);

  const handleBook = async (e: React.FormEvent) => {
    e.preventDefault();
    const finalReason = selectedReason === 'Other' ? customReason : selectedReason;
    if (!selectedDoctor || !selectedDate || !selectedSlot || !finalReason) return;

    setIsBooking(true);
    // Simulate network latency
    await new Promise(resolve => setTimeout(resolve, 800));

    await mockDb.createAppointment({
      patientId: user.id,
      patientName: user.name,
      doctorId: selectedDoctor.id,
      doctorName: selectedDoctor.name,
      doctorAvatar: selectedDoctor.avatar,
      date: selectedDate.toISOString().split('T')[0],
      time: selectedSlot,
      reason: aiSummary ? `${finalReason}\n\n[AI Summary]: ${aiSummary}` : finalReason,
      type: 'Online',
      aiSummary: aiSummary
    });
    
    setIsBooking(false);
    navigate('/patient-dashboard');
  };

  const handleAiSummarize = async () => {
    const textToSummarize = selectedReason === 'Other' ? customReason : selectedReason;
    if (!textToSummarize) return;
    setIsSummarizing(true);
    const summary = await generateSymptomSummary(textToSummarize);
    setAiSummary(summary);
    setIsSummarizing(false);
  };

  const filteredDoctors = doctors.filter(d => 
    d.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    d.specialization.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const isDateAvailable = (date: Date) => {
      if (!selectedDoctor) return false;
      const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
      return selectedDoctor.availableDays.includes(dayName);
  };

  return (
    <div className="max-w-7xl mx-auto pb-10 min-h-screen">
      
      {/* --- STEP 1: DOCTOR DISCOVERY --- */}
      {step === 1 && (
        <div className="animate-fade-in space-y-8">
           {/* Hero Search */}
           <div className="relative rounded-[2.5rem] bg-slate-900 dark:bg-black p-8 md:p-12 overflow-hidden shadow-2xl">
               <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-gradient-to-l from-emerald-500/30 to-blue-600/30 rounded-full blur-[100px] opacity-60"></div>
               <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-violet-600/20 rounded-full blur-[100px] opacity-40"></div>
               
               <div className="relative z-10 max-w-2xl">
                   <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur border border-white/10 text-emerald-300 text-xs font-bold mb-4 uppercase tracking-wider">
                      <Sparkles className="w-3 h-3" /> Premium Healthcare
                   </div>
                   <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 leading-tight">
                       Find the perfect <br/>
                       <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">Specialist for You</span>
                   </h1>
                   
                   <div className="relative mt-8 group">
                        <div className="absolute -inset-1 bg-gradient-to-r from-emerald-500 to-blue-500 rounded-2xl blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
                        <div className="relative flex items-center bg-white dark:bg-slate-900 rounded-xl p-2 shadow-xl">
                            <Search className="h-6 w-6 text-slate-400 ml-3" />
                            <input 
                                type="text"
                                placeholder="Search by doctor name, specialty, or hospital..."
                                className="w-full pl-4 pr-4 py-3 bg-transparent border-none focus:ring-0 text-slate-900 dark:text-white placeholder-slate-400 text-lg"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                   </div>
               </div>
           </div>

           {/* Doctor Grid */}
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredDoctors.map((doc, idx) => (
                <div 
                  key={doc.id}
                  onClick={() => { setSelectedDoctor(doc); setStep(2); }}
                  className="group relative bg-white dark:bg-slate-900 rounded-[2rem] p-6 border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 cursor-pointer overflow-hidden"
                  style={{ animationDelay: `${idx * 50}ms` }}
                >
                  <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-900 -z-10 group-hover:scale-110 transition-transform duration-500"></div>
                  
                  <div className="flex justify-between items-start mb-4">
                      <div className="relative">
                          <img src={doc.avatar} alt={doc.name} className="w-20 h-20 rounded-2xl object-cover border-4 border-white dark:border-slate-900 shadow-md group-hover:shadow-lg transition-all" />
                          <div className="absolute -bottom-2 -right-2 bg-emerald-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full border-2 border-white dark:border-slate-900 flex items-center gap-1 shadow-sm">
                             <ShieldCheck className="w-3 h-3" /> Verified
                          </div>
                      </div>
                      <div className="flex flex-col items-end gap-1">
                          <span className="flex items-center gap-1 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 px-2 py-1 rounded-lg text-xs font-bold">
                              <Star className="w-3 h-3 fill-current" /> {doc.rating}
                          </span>
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">{doc.reviews} Reviews</span>
                      </div>
                  </div>

                  <div className="mb-4">
                      <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-1 group-hover:text-emerald-600 transition-colors">{doc.name}</h3>
                      <p className="text-emerald-600 dark:text-emerald-400 font-medium text-sm">{doc.specialization}</p>
                  </div>

                  <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 text-xs mb-6 bg-slate-50 dark:bg-slate-800/50 p-2 rounded-lg">
                      <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
                      <span className="truncate">{doc.hospital}</span>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800">
                      <div>
                          <p className="text-xs text-slate-400 uppercase font-bold">Consultation</p>
                          <p className="text-lg font-bold text-slate-900 dark:text-white">${doc.fees}</p>
                      </div>
                      <button className="w-10 h-10 rounded-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg">
                          <ChevronRight className="w-5 h-5" />
                      </button>
                  </div>
                </div>
              ))}
           </div>
        </div>
      )}

      {/* --- STEP 2: PREMIUM BOOKING INTERFACE --- */}
      {step === 2 && selectedDoctor && (
        <div className="animate-fade-in grid grid-cols-1 lg:grid-cols-12 gap-8 relative">
           
           {/* Sticky Sidebar: Doctor Profile */}
           <div className="lg:col-span-4 xl:col-span-3">
               <div className="sticky top-28 space-y-6">
                   <button 
                     onClick={() => setStep(1)} 
                     className="flex items-center text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors text-sm font-medium group"
                   >
                     <div className="p-2 bg-white dark:bg-slate-800 rounded-full shadow-sm mr-2 group-hover:-translate-x-1 transition-transform">
                         <ChevronLeft className="w-4 h-4" />
                     </div>
                     Back to Doctors
                   </button>

                   <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-6 shadow-2xl border border-slate-100 dark:border-slate-800 relative overflow-hidden">
                       <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-emerald-50 to-transparent dark:from-emerald-900/20 -z-10"></div>
                       
                       <div className="flex flex-col items-center text-center">
                           <div className="relative mb-4">
                               <img src={selectedDoctor.avatar} className="w-32 h-32 rounded-[2rem] object-cover shadow-2xl border-4 border-white dark:border-slate-800" />
                               <div className="absolute -bottom-3 -right-3 bg-white dark:bg-slate-800 p-2 rounded-full shadow-md">
                                   <div className="bg-emerald-500 p-1.5 rounded-full">
                                       <Stethoscope className="w-4 h-4 text-white" />
                                   </div>
                               </div>
                           </div>
                           
                           <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-1">{selectedDoctor.name}</h2>
                           <p className="text-emerald-600 dark:text-emerald-400 font-medium mb-4">{selectedDoctor.specialization}</p>
                           
                           <div className="flex flex-wrap justify-center gap-2 mb-6">
                               <span className="px-3 py-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-full text-xs font-bold border border-slate-200 dark:border-slate-700">
                                   {selectedDoctor.experience} Yrs Exp.
                               </span>
                               <span className="px-3 py-1 bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 rounded-full text-xs font-bold border border-amber-100 dark:border-amber-800 flex items-center gap-1">
                                   <Star className="w-3 h-3 fill-current" /> {selectedDoctor.rating}
                               </span>
                           </div>

                           <div className="w-full bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-4 text-left mb-4">
                               <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">About Doctor</p>
                               <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">{selectedDoctor.about}</p>
                           </div>

                           <div className="w-full flex items-center justify-between bg-slate-900 dark:bg-white text-white dark:text-slate-900 p-4 rounded-2xl">
                               <span className="text-xs font-medium opacity-80">Consultation Fee</span>
                               <span className="text-xl font-bold">${selectedDoctor.fees}</span>
                           </div>
                       </div>
                   </div>
               </div>
           </div>

           {/* Main Booking Engine */}
           <div className="lg:col-span-8 xl:col-span-9 space-y-8">
               
               <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-6 md:p-10 shadow-xl border border-slate-100 dark:border-slate-800 relative overflow-hidden">
                   {/* Background Decor */}
                   <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-blue-50 to-emerald-50 dark:from-blue-900/10 dark:to-emerald-900/10 rounded-full blur-3xl -z-10 opacity-50 pointer-events-none"></div>

                   <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-8 flex items-center gap-3">
                       <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                           <Calendar className="w-5 h-5" />
                       </div>
                       Select Date & Time
                   </h2>

                   {/* --- HORIZONTAL DATE CAROUSEL --- */}
                   <div className="mb-10">
                       <div className="flex gap-4 overflow-x-auto pb-4 snap-x hide-scrollbar">
                           {dateDates.map((date, i) => {
                               const available = isDateAvailable(date);
                               const isSelected = selectedDate?.toDateString() === date.toDateString();
                               const isToday = date.toDateString() === new Date().toDateString();

                               return (
                                   <button
                                     key={i}
                                     onClick={() => available && setSelectedDate(date)}
                                     disabled={!available}
                                     className={clsx(
                                         "flex-shrink-0 w-[4.5rem] h-24 rounded-[1.5rem] flex flex-col items-center justify-center gap-1 transition-all duration-300 snap-center border-2 relative overflow-hidden group",
                                         isSelected 
                                            ? "bg-slate-900 dark:bg-white text-white dark:text-slate-900 border-slate-900 dark:border-white shadow-xl scale-105 ring-4 ring-emerald-500/20"
                                            : available 
                                                ? "bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-100 dark:border-slate-700 hover:border-emerald-400 dark:hover:border-emerald-500 hover:shadow-lg"
                                                : "bg-slate-50 dark:bg-slate-900/50 text-slate-300 dark:text-slate-600 border-transparent cursor-not-allowed grayscale opacity-60"
                                     )}
                                   >
                                       <span className="text-[10px] font-bold uppercase tracking-wider opacity-80">{date.toLocaleDateString('en-US', { weekday: 'short' })}</span>
                                       <span className="text-2xl font-bold">{date.getDate()}</span>
                                       
                                       {/* Availability Dot */}
                                       <div className={clsx(
                                           "w-1.5 h-1.5 rounded-full mt-1",
                                           isSelected ? "bg-emerald-400" : available ? "bg-emerald-500" : "bg-slate-300 dark:bg-slate-700"
                                       )}></div>

                                       {isToday && !isSelected && (
                                           <span className="absolute top-1 right-1 w-2 h-2 bg-blue-500 rounded-full"></span>
                                       )}
                                   </button>
                               );
                           })}
                       </div>
                       <div className="flex items-center gap-2 text-xs text-slate-400 pl-2">
                           <div className="w-2 h-2 bg-emerald-500 rounded-full"></div> Available
                           <div className="w-2 h-2 bg-slate-300 dark:bg-slate-700 rounded-full ml-2"></div> Unavailable
                       </div>
                   </div>

                   {/* --- SLOTS GRID --- */}
                   {selectedDate ? (
                       <div className="animate-slide-up">
                           <div className="flex items-center justify-between mb-6">
                               <h3 className="font-bold text-slate-800 dark:text-slate-200">Available Slots</h3>
                               <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/30 px-3 py-1 rounded-full border border-emerald-100 dark:border-emerald-800">
                                   {availableSlots.filter(s => s.available).length} spots left
                               </span>
                           </div>

                           {availableSlots.length > 0 ? (
                               <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                                   {availableSlots.map((slot) => (
                                       <button
                                         key={slot.time}
                                         disabled={!slot.available}
                                         onClick={() => setSelectedSlot(slot.time)}
                                         className={clsx(
                                             "relative py-4 rounded-xl border flex flex-col items-center justify-center transition-all duration-200 group overflow-hidden",
                                             selectedSlot === slot.time 
                                                ? "bg-emerald-500 text-white border-emerald-500 shadow-lg shadow-emerald-500/30 scale-105" 
                                                : slot.available 
                                                    ? "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-emerald-400 hover:shadow-md"
                                                    : "bg-slate-50 dark:bg-slate-900 border-slate-100 dark:border-slate-800 text-slate-300 dark:text-slate-600 cursor-not-allowed"
                                         )}
                                       >
                                           <div className="flex items-center gap-2">
                                               <Clock className={clsx("w-4 h-4", selectedSlot === slot.time ? "text-white" : "text-slate-400")} />
                                               <span className="font-bold text-sm tracking-wide">{slot.time}</span>
                                           </div>
                                           {selectedSlot === slot.time && (
                                               <div className="absolute top-0 right-0 p-1">
                                                   <CheckCircle2 className="w-4 h-4 text-white" />
                                               </div>
                                           )}
                                       </button>
                                   ))}
                               </div>
                           ) : (
                               <div className="p-6 bg-amber-50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-800/30 rounded-2xl flex items-center justify-center gap-3 text-amber-800 dark:text-amber-400">
                                   <AlertCircle className="w-6 h-6" />
                                   <span className="font-medium">Doctor is fully booked for this day.</span>
                               </div>
                           )}
                       </div>
                   ) : (
                       <div className="h-40 flex flex-col items-center justify-center text-slate-400 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-3xl bg-slate-50/50 dark:bg-slate-900/50">
                           <Calendar className="w-10 h-10 mb-2 opacity-50" />
                           <p className="font-medium">Select a date above to view slots</p>
                       </div>
                   )}
               </div>

               {/* --- REASON & CONFIRM --- */}
               <div className={clsx(
                   "bg-white dark:bg-slate-900 rounded-[2.5rem] p-6 md:p-10 shadow-xl border border-slate-100 dark:border-slate-800 transition-all duration-500",
                   selectedDate && selectedSlot ? "opacity-100 translate-y-0" : "opacity-50 translate-y-4 pointer-events-none grayscale"
               )}>
                   <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-8 flex items-center gap-3">
                       <div className="w-10 h-10 rounded-xl bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center text-violet-600 dark:text-violet-400">
                           <Sparkles className="w-5 h-5" />
                       </div>
                       Consultation Details
                   </h2>

                   <form onSubmit={handleBook} className="space-y-8">
                       <div>
                           <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-4 ml-1">Reason for Visit</label>
                           <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                              {[...COMMON_REASONS, "Other"].map(reason => (
                                  <button
                                    key={reason}
                                    type="button"
                                    onClick={() => setSelectedReason(reason)}
                                    className={clsx(
                                        "px-4 py-3 rounded-xl border text-sm font-medium transition-all text-left flex items-center justify-between group",
                                        selectedReason === reason 
                                         ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300 shadow-md ring-1 ring-emerald-500/20"
                                         : "border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:border-emerald-300 dark:hover:border-emerald-700"
                                    )}
                                  >
                                      {reason}
                                      <div className={clsx("w-5 h-5 rounded-full border flex items-center justify-center", selectedReason === reason ? "bg-emerald-500 border-emerald-500" : "border-slate-300")}>
                                          {selectedReason === reason && <CheckCircle2 className="w-3.5 h-3.5 text-white" />}
                                      </div>
                                  </button>
                              ))}
                           </div>

                           {selectedReason === 'Other' && (
                               <textarea 
                                 rows={3}
                                 className="w-full mt-4 px-5 py-4 border border-slate-200 dark:border-slate-700 rounded-2xl focus:ring-2 focus:ring-emerald-500 focus:outline-none text-sm resize-none bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white animate-fade-in"
                                 placeholder="Please describe your specific symptoms in detail..."
                                 value={customReason}
                                 onChange={(e) => setCustomReason(e.target.value)}
                                 required
                               />
                           )}
                       </div>

                       {/* AI Summary Feature */}
                       <div className="p-1 rounded-2xl bg-gradient-to-r from-violet-100 to-fuchsia-100 dark:from-violet-900/20 dark:to-fuchsia-900/20">
                            <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur rounded-xl p-4">
                                <div className="flex justify-between items-center mb-3">
                                    <h4 className="font-bold text-violet-700 dark:text-violet-300 text-sm flex items-center gap-2">
                                        <Sparkles className="w-4 h-4" /> AI Pre-Screening Summary
                                    </h4>
                                    <button 
                                       type="button"
                                       onClick={handleAiSummarize}
                                       disabled={!selectedReason || (selectedReason === 'Other' && !customReason) || isSummarizing}
                                       className="text-xs font-bold bg-violet-600 hover:bg-violet-500 text-white px-3 py-1.5 rounded-lg transition-all disabled:opacity-50 flex items-center gap-1"
                                     >
                                       {isSummarizing ? <Loader2 className="w-3 h-3 animate-spin" /> : 'Generate Summary'}
                                     </button>
                                </div>
                                
                                {aiSummary ? (
                                    <p className="text-sm text-slate-700 dark:text-slate-300 italic bg-violet-50 dark:bg-violet-900/10 p-3 rounded-lg border border-violet-100 dark:border-violet-800 animate-fade-in">
                                        "{aiSummary}"
                                    </p>
                                ) : (
                                    <p className="text-xs text-slate-400">
                                        Use AI to summarize your symptoms for the doctor before the visit. (Optional)
                                    </p>
                                )}
                            </div>
                       </div>

                       <button 
                         type="submit"
                         disabled={isBooking}
                         className="w-full py-5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-2xl font-bold text-lg hover:shadow-2xl hover:shadow-emerald-500/20 hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center justify-center gap-3 disabled:opacity-70 disabled:scale-100"
                       >
                          {isBooking ? (
                              <>
                                <Loader2 className="w-5 h-5 animate-spin" /> Booking...
                              </>
                          ) : (
                              <>
                                Confirm Appointment <ChevronRight className="w-5 h-5" />
                              </>
                          )}
                       </button>
                   </form>
               </div>
           </div>
        </div>
      )}
    </div>
  );
};