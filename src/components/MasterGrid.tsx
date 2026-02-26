"use client"
import React, { useState, useMemo } from 'react';
import { PlusCircle, RefreshCw, Check, AlertCircle, XCircle, UserX, X, CalendarClock, Loader2, ChevronLeft, ChevronRight, CalendarDays } from "lucide-react";

import { TIME_SLOTS, MAX_CAPACITY, formatTime } from '@/components/constants';
import {
  useScheduleData,
  bookStudent,
  updateAttendance,
  removeStudentFromSession,
  getWeekStart,
  getWeekDates,
  toISODate,
  formatDate,
  dayOfWeek,
  type Tutor,
} from '@/lib/useScheduleData';
import { BookingForm, BookingToast } from '@/components/BookingForm';
import { TutorManagementModal } from '@/components/TutorManagementModal';
import type { PrefilledSlot, BookingConfirmData } from '@/components/BookingForm';

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** A tutor is available at `time` if that exact time string is in their availabilityBlocks */
const isTutorAvailable = (tutor: Tutor, time: string) =>
  tutor.availabilityBlocks.includes(time);

const DAY_NAMES = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

/** Format week range e.g. "Feb 24 – Feb 28, 2026" */
function formatWeekRange(weekStart: Date): string {
  const end = new Date(weekStart);
  end.setDate(end.getDate() + 4);
  const opts: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric' };
  const s = weekStart.toLocaleDateString('en-US', opts);
  const e = end.toLocaleDateString('en-US', { ...opts, year: 'numeric' });
  return `${s} – ${e}`;
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function MasterDeployment() {
  // Week navigation — start from current week's Monday
  const [weekStart, setWeekStart] = useState<Date>(() => getWeekStart(new Date()));
  const weekDates = useMemo(() => getWeekDates(weekStart), [weekStart]);

  const { tutors, students, sessions, loading, error, refetch } = useScheduleData(weekStart);

  const [selectedSession, setSelectedSession] = useState<any>(null);
  const [isEnrollModalOpen, setIsEnrollModalOpen] = useState(false);
  const [gridSlotToBook, setGridSlotToBook] = useState<PrefilledSlot | null>(null);
  const [enrollCat, setEnrollCat] = useState('math');
  const [bookingToast, setBookingToast] = useState<BookingConfirmData | null>(null);
  const [isTutorModalOpen, setIsTutorModalOpen] = useState(false);

  const goToPrevWeek = () => {
    setWeekStart(prev => { const d = new Date(prev); d.setDate(d.getDate() - 7); return d; });
  };
  const goToNextWeek = () => {
    setWeekStart(prev => { const d = new Date(prev); d.setDate(d.getDate() + 7); return d; });
  };
  const goToThisWeek = () => setWeekStart(getWeekStart(new Date()));

  const isCurrentWeek = toISODate(weekStart) === toISODate(getWeekStart(new Date()));

  // Available seats computed from real dates
  const allAvailableSeats = useMemo(() => {
    let seats: any[] = [];
    tutors.filter(t => t.cat === enrollCat).forEach(tutor => {
      weekDates.forEach(date => {
        const isoDate = toISODate(date);
        const dow = dayOfWeek(isoDate); // 1=Mon…5=Fri
        if (!tutor.availability.includes(dow)) return;
        TIME_SLOTS.forEach(time => {
          if (!isTutorAvailable(tutor, time)) return;
          const session = sessions.find(s => s.date === isoDate && s.tutorId === tutor.id && s.time === time);
          const count = session ? session.students.length : 0;
          if (count < MAX_CAPACITY) {
            seats.push({
              tutor,
              dayName: DAY_NAMES[dow - 1],
              date: isoDate,
              time,
              count,
              seatsLeft: MAX_CAPACITY - count,
              dayNum: dow,
            });
          }
        });
      });
    });
    return seats.sort((a, b) => {
      const dd = a.date.localeCompare(b.date);
      return dd !== 0 ? dd : a.time.localeCompare(b.time);
    });
  }, [enrollCat, tutors, sessions, weekDates]);

  const handleGridSlotClick = (tutor: Tutor, date: string, dayName: string, time: string) => {
    setGridSlotToBook({ tutor, dayNum: dayOfWeek(date), dayName, time, date });
  };

  const handleConfirmBooking = async (data: BookingConfirmData) => {
    try {
      await bookStudent({
        tutorId: data.slot.tutor.id,
        date: (data.slot as any).date,
        time: data.slot.time,
        student: data.student,
        topic: data.student.subject,
        recurring: data.recurring,
        recurringWeeks: data.recurringWeeks,
      });
      refetch();
      setBookingToast(data);
      setIsEnrollModalOpen(false);
      setGridSlotToBook(null);
      setTimeout(() => setBookingToast(null), 4000);
    } catch (err) {
      console.error('Booking failed:', err);
    }
  };

  const handleAttendance = async (status: 'scheduled' | 'present' | 'no-show') => {
    if (!selectedSession) return;
    try {
      await updateAttendance({ sessionId: selectedSession.id, studentId: selectedSession.activeStudent.id, status });
      refetch();
      setSelectedSession(null);
    } catch (err) {
      console.error('Attendance update failed:', err);
    }
  };

  const handleRemove = async () => {
    if (!selectedSession) return;
    try {
      await removeStudentFromSession({ sessionId: selectedSession.id, studentId: selectedSession.activeStudent.id });
      refetch();
      setSelectedSession(null);
    } catch (err) {
      console.error('Remove failed:', err);
    }
  };

  const closeAllModals = () => { setIsEnrollModalOpen(false); setGridSlotToBook(null); };

  // ─── Loading / Error ────────────────────────────────────────────────────────

  if (loading) return (
    <div className="relative w-full min-h-screen flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #0a0f1e 0%, #060d18 50%, #010a10 100%)' }}>
      <div className="flex flex-col items-center gap-4">
        <Loader2 size={32} className="text-emerald-400 animate-spin" />
        <p className="text-[11px] font-black text-slate-500 uppercase tracking-widest">Loading schedule…</p>
      </div>
    </div>
  );

  if (error) return (
    <div className="relative w-full min-h-screen flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #0a0f1e 0%, #060d18 50%, #010a10 100%)' }}>
      <div className="text-center">
        <p className="text-sm font-black text-rose-400 uppercase tracking-widest mb-3">Failed to load</p>
        <p className="text-xs text-slate-500 mb-6">{error}</p>
        <button onClick={refetch} className="px-6 py-3 rounded-xl text-xs font-black uppercase tracking-wider text-white" style={{ background: 'linear-gradient(135deg, #10b981, #059669)' }}>Retry</button>
      </div>
    </div>
  );

  // ─── Render ─────────────────────────────────────────────────────────────────

  return (
    <div
      className="relative w-full min-h-screen pb-12 font-sans overflow-x-hidden"
      style={{ background: 'linear-gradient(135deg, #0a0f1e 0%, #060d18 50%, #010a10 100%)' }}
    >
      {/* AMBIENT GLOW */}
      <div className="pointer-events-none fixed inset-0 z-0" style={{
        background:
          'radial-gradient(ellipse 80% 60% at 50% 20%, rgba(16,185,129,0.11) 0%, transparent 70%), ' +
          'radial-gradient(ellipse 50% 40% at 80% 80%, rgba(6,182,212,0.07) 0%, transparent 60%)',
      }} />

      {/* ── HEADER ── */}
      <div
        className="sticky top-0 z-40 flex justify-between items-center px-4 md:px-8 py-3 border-b border-white/5"
        style={{ background: 'rgba(6,9,20,0.85)', backdropFilter: 'blur(16px)' }}
      >
        <div>
          <h1 className="text-xl md:text-2xl font-black uppercase italic tracking-tighter text-white leading-none">Weekly Schedule</h1>
          <p className="text-[9px] font-bold text-emerald-400/70 uppercase tracking-widest mt-0.5">Tutor Management</p>
        </div>
        <div className="flex items-center gap-2 md:gap-3">
          <button
            onClick={() => setIsTutorModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider text-slate-300 transition-all"
            style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.1)'; e.currentTarget.style.color = 'white'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; e.currentTarget.style.color = '#cbd5e1'; }}
          >
            Manage Tutors
          </button>
          <button
            onClick={() => setIsEnrollModalOpen(true)}
            className="flex items-center gap-2 px-6 md:px-8 py-2.5 md:py-3 rounded-xl text-xs md:text-sm font-black uppercase tracking-wider text-white transition-all active:scale-95"
            style={{
              background: 'linear-gradient(135deg, #10b981, #059669)',
              boxShadow: '0 0 20px rgba(16,185,129,0.5), 0 0 40px rgba(16,185,129,0.2), inset 0 1px 0 rgba(255,255,255,0.15)',
            }}
            onMouseEnter={e => (e.currentTarget.style.boxShadow = '0 0 32px rgba(16,185,129,0.7), 0 0 64px rgba(16,185,129,0.3), inset 0 1px 0 rgba(255,255,255,0.15)')}
            onMouseLeave={e => (e.currentTarget.style.boxShadow = '0 0 20px rgba(16,185,129,0.5), 0 0 40px rgba(16,185,129,0.2), inset 0 1px 0 rgba(255,255,255,0.15)')}
          >
            <PlusCircle size={15} />
            Schedule Student
          </button>
        </div>
      </div>

      {/* ── WEEK NAVIGATION ── */}
      <div className="relative z-10 max-w-[1600px] mx-auto px-3 md:px-6 pt-6 pb-2 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={goToPrevWeek}
            className="w-9 h-9 rounded-xl flex items-center justify-center text-slate-400 transition-all"
            style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}
            onMouseEnter={e => { e.currentTarget.style.color = 'white'; e.currentTarget.style.background = 'rgba(255,255,255,0.1)'; }}
            onMouseLeave={e => { e.currentTarget.style.color = '#94a3b8'; e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; }}
          >
            <ChevronLeft size={16} />
          </button>

          <div>
            <div className="text-base md:text-lg font-black text-white uppercase italic tracking-tight leading-none">
              {formatWeekRange(weekStart)}
            </div>
            {isCurrentWeek && (
              <span className="text-[9px] font-bold text-emerald-400 uppercase tracking-widest">Current Week</span>
            )}
          </div>

          <button onClick={goToNextWeek}
            className="w-9 h-9 rounded-xl flex items-center justify-center text-slate-400 transition-all"
            style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}
            onMouseEnter={e => { e.currentTarget.style.color = 'white'; e.currentTarget.style.background = 'rgba(255,255,255,0.1)'; }}
            onMouseLeave={e => { e.currentTarget.style.color = '#94a3b8'; e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; }}
          >
            <ChevronRight size={16} />
          </button>
        </div>

        {!isCurrentWeek && (
          <button onClick={goToThisWeek}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider text-emerald-400 transition-all"
            style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.25)' }}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(16,185,129,0.2)'}
            onMouseLeave={e => e.currentTarget.style.background = 'rgba(16,185,129,0.1)'}
          >
            <CalendarDays size={12} /> Today
          </button>
        )}
      </div>

      {/* ── MAIN GRID ── */}
      <div className="relative z-10 max-w-[1600px] mx-auto p-3 md:p-6 space-y-10 md:space-y-14">
        {weekDates.map((date, idx) => {
          const isoDate = toISODate(date);
          const dow = idx + 1; // 1=Mon…5=Fri
          const activeTutors = tutors.filter(t => t.availability.includes(dow));
          const isToday = isoDate === toISODate(new Date());

          // Day label — e.g. "Monday" + "Feb 25"
          const dayLabel = DAY_NAMES[idx];
          const dateLabel = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

          return (
            <div key={isoDate} className="space-y-3 md:space-y-4">

              {/* Day heading */}
              <div className="flex items-center gap-3 md:gap-4 px-1">
                <div className="flex items-baseline gap-3">
                  <h2 className={`text-4xl md:text-5xl font-black uppercase italic tracking-tighter leading-none ${isToday ? 'text-emerald-400' : 'text-white'}`}>
                    {dayLabel}
                  </h2>
                  <span className={`text-base md:text-lg font-bold uppercase tracking-wider ${isToday ? 'text-emerald-500' : 'text-slate-500'}`}>
                    {dateLabel}
                    {isToday && <span className="ml-2 text-[9px] font-black px-2 py-0.5 rounded-full align-middle" style={{ background: 'rgba(16,185,129,0.2)', border: '1px solid rgba(16,185,129,0.4)', color: '#34d399' }}>TODAY</span>}
                  </span>
                </div>
                <div className="h-px grow rounded-full" style={{ background: isToday ? 'linear-gradient(90deg, rgba(16,185,129,0.6), transparent)' : 'linear-gradient(90deg, rgba(16,185,129,0.4), transparent)' }} />
              </div>

              {activeTutors.length === 0 ? (
                <div className="rounded-2xl p-6 text-center" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}>
                  <p className="text-[10px] font-bold text-slate-600 uppercase tracking-wider italic">No tutors available</p>
                </div>
              ) : (
                <>
                  {/* ── DESKTOP TABLE ── */}
                  <div
                    className="hidden md:block rounded-3xl overflow-hidden"
                    style={{
                      background: '#f8fafc',
                      border: '1px solid rgba(226,232,240,1)',
                      boxShadow: '0 8px 32px rgba(0,0,0,0.35), 0 0 0 1px rgba(255,255,255,0.05)',
                    }}
                  >
                    <div className="overflow-x-auto">
                    <table className="border-collapse" style={{ minWidth: '100%', width: 'max-content' }}>
                      <thead>
                        <tr className="text-xs font-black uppercase tracking-wider" style={{ background: '#f1f5f9', borderBottom: '1px solid #e2e8f0' }}>
                          <th className="p-4 text-left text-slate-400 font-black text-xs" style={{ borderRight: '1px solid #e2e8f0', minWidth: 160 }}>Instructor</th>
                          {TIME_SLOTS.map(t => (
                            <th key={t} className="p-2 text-center font-black text-slate-600 text-[10px] tracking-wide" style={{ borderRight: '1px solid #e2e8f0', minWidth: 90 }}>
                              {formatTime(t).replace(' AM','a').replace(' PM','p')}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {activeTutors.map(tutor => (
                          <tr key={tutor.id} style={{ borderBottom: '1px solid #e2e8f0' }}>
                            {/* Tutor cell */}
                            <td className="p-4 align-top" style={{ background: '#ffffff', borderRight: '1px solid #e2e8f0' }}>
                              <p className="text-sm font-black text-slate-900 leading-none mb-2 tracking-tight">{tutor.name}</p>
                              <div className="flex flex-wrap gap-1">
                                {tutor.subjects.map(s => (
                                  <span key={s} className="text-[9px] font-bold px-2 py-0.5 rounded-md uppercase tracking-tight" style={{ background: '#f1f5f9', color: '#475569', border: '1px solid #cbd5e1' }}>{s}</span>
                                ))}
                              </div>
                            </td>

                            {TIME_SLOTS.map(time => {
                              const session = sessions.find(s => s.date === isoDate && s.tutorId === tutor.id && s.time === time);
                              const hasStudents = session && session.students.length > 0;
                              const isAvailable = isTutorAvailable(tutor, time) && !hasStudents;
                              const isFull = hasStudents && session!.students.length >= MAX_CAPACITY;
                              const isOutside = !isTutorAvailable(tutor, time);

                              let cellBg = '#ffffff';
                              if (isOutside) cellBg = '#f8fafc';
                              // available cells stay white — dashed border signals availability

                              return (
                                <td key={time} className="p-1.5 align-top h-[110px]" style={{ background: cellBg, borderRight: '1px solid #e2e8f0' }}>
                                  <div className="flex flex-col gap-1.5 h-full">
                                    {hasStudents ? (
                                      <>
                                        {session.students.map(student => (
                                          <div
                                            key={student.rowId || student.id}
                                            onClick={() => setSelectedSession({ ...session, activeStudent: student, dayName: dayLabel, date: isoDate, tutorName: tutor.name })}
                                            className="group relative p-2 rounded-xl transition-all hover:scale-[1.02] cursor-pointer"
                                            style={student.status === 'no-show' ? {
                                              background: 'transparent', border: '1.5px solid #cbd5e1', opacity: 0.4,
                                            } : {
                                              background: '#eef2ff', border: '1.5px solid #818cf8',
                                            }}
                                          >
                                            <div className="flex justify-between items-start mb-0.5">
                                              <p className="text-xs font-black leading-tight text-slate-800">{student.name}</p>
                                              <RefreshCw size={10} className="text-indigo-400 opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                                            </div>
                                            <p className="text-[11px] font-bold uppercase tracking-tight text-indigo-500">{student.topic}</p>
                                          </div>
                                        ))}
                                        {!isFull && (
                                          <button
                                            onClick={() => handleGridSlotClick(tutor, isoDate, dayLabel, time)}
                                            className="mt-auto py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all"
                                            style={{ background: 'transparent', border: '1.5px dashed #86efac', color: '#16a34a' }}
                                            onMouseEnter={e => { e.currentTarget.style.background = '#10b981'; e.currentTarget.style.color = 'white'; e.currentTarget.style.borderColor = '#10b981'; }}
                                            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#16a34a'; e.currentTarget.style.borderColor = '#86efac'; }}
                                          >
                                            + ADD ({MAX_CAPACITY - session.students.length})
                                          </button>
                                        )}
                                      </>
                                    ) : isAvailable ? (
                                      <div
                                        onClick={() => handleGridSlotClick(tutor, isoDate, dayLabel, time)}
                                        className="w-full h-full rounded-xl flex flex-col items-center justify-center gap-1.5 group cursor-pointer transition-all active:scale-[0.97]"
                                        style={{ background: '#ffffff', border: '1.5px dashed #86efac' }}
                                        onMouseEnter={e => { e.currentTarget.style.background = '#f0fdf4'; e.currentTarget.style.borderColor = '#4ade80'; }}
                                        onMouseLeave={e => { e.currentTarget.style.background = '#ffffff'; e.currentTarget.style.borderColor = '#86efac'; }}
                                      >
                                        <PlusCircle size={16} className="text-emerald-400 group-hover:text-emerald-600 transition-colors" />
                                        <span className="text-[9px] font-black uppercase tracking-widest text-emerald-400 group-hover:text-emerald-600 transition-colors">Open</span>
                                      </div>
                                    ) : (
                                      <div className="w-full h-full rounded-xl flex items-center justify-center" style={{ background: 'repeating-linear-gradient(45deg, #f8fafc, #f8fafc 4px, #f1f5f9 4px, #f1f5f9 8px)' }}>
                                        <span className="text-[9px] font-bold text-slate-300 uppercase tracking-wider">—</span>
                                      </div>
                                    )}
                                  </div>
                                </td>
                              );
                            })}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    </div>{/* end overflow-x-auto */}
                  </div>

                  {/* ── MOBILE VIEW ── */}
                  <div className="md:hidden space-y-2">
                    {activeTutors.map(tutor => (
                      <div key={tutor.id} className="rounded-2xl overflow-hidden" style={{ background: '#f8fafc', border: '1px solid #e2e8f0', boxShadow: '0 4px 16px rgba(0,0,0,0.25)' }}>
                        <div className="p-3" style={{ background: '#ffffff', borderBottom: '1px solid #e2e8f0' }}>
                          <p className="text-xs font-black text-slate-900 leading-none mb-1">{tutor.name}</p>
                          <div className="flex flex-wrap gap-1">
                            {tutor.subjects.slice(0, 2).map(s => (
                              <span key={s} className="text-[7px] font-bold px-1.5 py-0.5 rounded uppercase" style={{ background: '#f1f5f9', color: '#64748b', border: '1px solid #cbd5e1' }}>{s}</span>
                            ))}
                          </div>
                        </div>
                        <div className="overflow-x-auto">
                          <div className="flex">
                            {TIME_SLOTS.map(time => {
                              const session = sessions.find(s => s.date === isoDate && s.tutorId === tutor.id && s.time === time);
                              const hasStudents = session && session.students.length > 0;
                              const isAvailable = isTutorAvailable(tutor, time) && !hasStudents;
                              const isFull = hasStudents && session!.students.length >= MAX_CAPACITY;
                              const isOutside = !isTutorAvailable(tutor, time);
                              return (
                                <div key={time} className="flex-shrink-0 w-40 p-2" style={{ background: isOutside ? '#f1f5f9' : '#ffffff', borderRight: '1px solid #e2e8f0' }}>
                                  <div className="text-[9px] font-black text-slate-500 uppercase mb-2 text-center tracking-widest">{time}</div>
                                  <div className="space-y-1.5 min-h-[100px]">
                                    {hasStudents ? (
                                      <>
                                        {session.students.map(student => (
                                          <div key={student.rowId || student.id} onClick={() => setSelectedSession({ ...session, activeStudent: student, dayName: dayLabel, date: isoDate, tutorName: tutor.name })}
                                            className="p-2 rounded-lg transition-all active:scale-95 cursor-pointer"
                                            style={student.status === 'no-show' ? { background: 'transparent', border: '1.5px solid #cbd5e1', opacity: 0.4 } : { background: '#eef2ff', border: '1.5px solid #818cf8' }}
                                          >
                                            <p className="text-[10px] font-black leading-tight mb-0.5 text-slate-800">{student.name}</p>
                                            <p className="text-[7px] font-bold uppercase text-indigo-500">{student.topic}</p>
                                          </div>
                                        ))}
                                        {!isFull && (
                                          <button onClick={() => handleGridSlotClick(tutor, isoDate, dayLabel, time)} className="w-full py-1.5 rounded-lg text-[7px] font-black uppercase transition-all" style={{ background: 'transparent', border: '1.5px dashed #86efac', color: '#16a34a' }}>
                                            + {MAX_CAPACITY - session.students.length}
                                          </button>
                                        )}
                                      </>
                                    ) : isAvailable ? (
                                      <div onClick={() => handleGridSlotClick(tutor, isoDate, dayLabel, time)} className="w-full h-20 rounded-lg flex flex-col items-center justify-center gap-1.5 cursor-pointer active:scale-95 transition-all" style={{ background: 'linear-gradient(135deg, #dcfce7, #bbf7d0)', border: '1.5px solid #4ade80' }}>
                                        <div className="flex items-center gap-1">
                                          <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                                          <span className="text-[7px] font-black uppercase tracking-wider text-emerald-700">Available</span>
                                        </div>
                                        <PlusCircle size={18} className="text-emerald-500" />
                                      </div>
                                    ) : (
                                      <div className="w-full h-20 rounded-lg" style={{ background: 'repeating-linear-gradient(45deg, #f8fafc, #f8fafc 4px, #f1f5f9 4px, #f1f5f9 8px)' }} />
                                    )}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          );
        })}
      </div>

      {/* ── MODALS ── */}
      {isEnrollModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(2,6,18,0.92)', backdropFilter: 'blur(20px)' }}>
          <BookingForm prefilledSlot={null} onConfirm={handleConfirmBooking} onCancel={closeAllModals} enrollCat={enrollCat} setEnrollCat={setEnrollCat} allAvailableSeats={allAvailableSeats} studentDatabase={students} />
        </div>
      )}
      {gridSlotToBook && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(2,6,18,0.92)', backdropFilter: 'blur(20px)' }}>
          <BookingForm prefilledSlot={gridSlotToBook} onConfirm={handleConfirmBooking} onCancel={closeAllModals} enrollCat={enrollCat} setEnrollCat={setEnrollCat} allAvailableSeats={allAvailableSeats} studentDatabase={students} />
        </div>
      )}

      {/* ATTENDANCE MODAL */}
      {selectedSession && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(2,6,18,0.92)', backdropFilter: 'blur(20px)' }}>
          <div className="w-full max-w-md md:max-w-lg rounded-3xl overflow-hidden" style={{ background: '#0c1422', border: '1px solid rgba(255,255,255,0.1)', boxShadow: '0 0 0 1px rgba(16,185,129,0.15), 0 40px 80px rgba(0,0,0,0.7)' }}>
            <div className="h-0.5 w-full" style={{ background: 'linear-gradient(90deg, transparent 0%, #10b981 40%, #06b6d4 70%, transparent 100%)' }} />
            <div className="p-6 md:p-8 pb-4 md:pb-5">
              <div className="flex items-start justify-between mb-5">
                <div className="flex-1">
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full mb-3" style={{ background: 'rgba(99,102,241,0.15)', border: '1px solid rgba(99,102,241,0.35)' }}>
                    <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-pulse" />
                    <span className="text-[9px] font-black uppercase tracking-widest text-indigo-300">{selectedSession.activeStudent.topic}</span>
                  </div>
                  <h3 className="text-2xl md:text-3xl font-black text-white uppercase italic tracking-tighter leading-none mb-2">{selectedSession.activeStudent.name}</h3>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                    {selectedSession.dayName} &nbsp;·&nbsp; {formatDate(selectedSession.date)} &nbsp;·&nbsp; {selectedSession.time} &nbsp;·&nbsp; {selectedSession.tutorName}
                  </p>
                </div>
                <button onClick={() => setSelectedSession(null)} className="ml-4 mt-1 w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-slate-500 hover:text-white transition-colors" style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)' }}>
                  <X size={15} />
                </button>
              </div>
            </div>
            <div className="px-6 md:px-8 pb-5">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Mark Attendance</p>
              <div className="grid grid-cols-2 gap-2.5 mb-3">
                <button onClick={() => handleAttendance('present')} className="flex items-center justify-center gap-2.5 py-3.5 rounded-2xl font-black text-[11px] uppercase tracking-wider text-white transition-all active:scale-95 hover:brightness-110" style={{ background: 'linear-gradient(135deg, #059669, #10b981)', boxShadow: '0 4px 14px rgba(16,185,129,0.35)' }}>
                  <Check size={15} strokeWidth={3} /> Present
                </button>
                <button onClick={() => handleAttendance('scheduled')} className="flex items-center justify-center gap-2.5 py-3.5 rounded-2xl font-black text-[11px] uppercase tracking-wider text-white transition-all active:scale-95 hover:brightness-110" style={{ background: 'linear-gradient(135deg, #d97706, #f59e0b)', boxShadow: '0 4px 14px rgba(245,158,11,0.35)' }}>
                  <AlertCircle size={15} strokeWidth={3} /> Excused
                </button>
                <button onClick={() => handleAttendance('no-show')} className="flex items-center justify-center gap-2.5 py-3.5 rounded-2xl font-black text-[11px] uppercase tracking-wider text-white transition-all active:scale-95 hover:brightness-110" style={{ background: 'linear-gradient(135deg, #dc2626, #ef4444)', boxShadow: '0 4px 14px rgba(239,68,68,0.35)' }}>
                  <XCircle size={15} strokeWidth={3} /> Unexcused
                </button>
                <button onClick={handleRemove} className="flex items-center justify-center gap-2.5 py-3.5 rounded-2xl font-black text-[11px] uppercase tracking-wider text-slate-300 transition-all active:scale-95 hover:bg-white/10" style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)' }}>
                  <UserX size={15} strokeWidth={2.5} /> Remove
                </button>
              </div>
              <button className="w-full flex items-center justify-center gap-2.5 py-3.5 rounded-2xl font-black text-[11px] uppercase tracking-wider text-white transition-all active:scale-95" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.12)' }} onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.09)')} onMouseLeave={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.05)')}>
                <CalendarClock size={15} strokeWidth={2.5} /> Reschedule Appointment
              </button>
            </div>
            <div className="mx-6 md:mx-8 h-px" style={{ background: 'rgba(255,255,255,0.06)' }} />
            <div className="max-h-[32vh] overflow-y-auto">
              <div className="p-6 md:p-8 pt-5">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Alternative Coverage &nbsp;·&nbsp; {selectedSession.time}</p>
                {tutors.filter(t =>
                  t.id !== selectedSession.tutorId &&
                  isTutorAvailable(t, selectedSession.time) &&
                  t.availability.includes(dayOfWeek(selectedSession.date)) &&
                  t.cat === tutors.find(ot => ot.id === selectedSession.tutorId)?.cat
                ).map(t => (
                  <div key={t.id} className="flex items-center justify-between mb-2.5 p-3.5 rounded-2xl transition-all cursor-pointer" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}
                    onMouseEnter={e => { e.currentTarget.style.background = 'rgba(16,185,129,0.08)'; e.currentTarget.style.borderColor = 'rgba(16,185,129,0.3)'; }}
                    onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.07)'; }}
                  >
                    <div>
                      <p className="text-sm font-black text-white leading-none mb-0.5">{t.name}</p>
                      <p className="text-[9px] text-slate-500 font-bold uppercase tracking-wider">{t.subjects.join(', ')}</p>
                    </div>
                    <button className="px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-wider text-white transition-all active:scale-95" style={{ background: 'rgba(16,185,129,0.2)', border: '1px solid rgba(16,185,129,0.35)' }}
                      onMouseEnter={e => { e.currentTarget.style.background = '#10b981'; e.currentTarget.style.boxShadow = '0 0 12px rgba(16,185,129,0.4)'; }}
                      onMouseLeave={e => { e.currentTarget.style.background = 'rgba(16,185,129,0.2)'; e.currentTarget.style.boxShadow = 'none'; }}
                    >Reassign</button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {bookingToast && <BookingToast data={bookingToast} onClose={() => setBookingToast(null)} />}

      {isTutorModalOpen && (
        <TutorManagementModal tutors={tutors} onClose={() => setIsTutorModalOpen(false)} onRefetch={refetch} />
      )}
    </div>
  );
}