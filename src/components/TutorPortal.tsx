"use client"
import React, { useState, useMemo } from 'react';
import { User, X, Check, ChevronDown, ChevronLeft, ChevronRight, CalendarDays, Loader2 } from "lucide-react";

import { TIME_SLOTS, MAX_CAPACITY, formatTime } from '@/components/constants';
import {
  useScheduleData,
  updateAttendance,
  getWeekStart,
  getWeekDates,
  toISODate,
  dayOfWeek,
  type Tutor,
  type Session,
} from '@/lib/useScheduleData';

// ─── Helpers ──────────────────────────────────────────────────────────────────

const isTutorAvailable = (tutor: Tutor, time: string) =>
  tutor.availabilityBlocks.includes(time);

const DAY_NAMES = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

function formatWeekRange(weekStart: Date): string {
  const end = new Date(weekStart);
  end.setDate(end.getDate() + 4);
  const opts: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric' };
  return `${weekStart.toLocaleDateString('en-US', opts)} – ${end.toLocaleDateString('en-US', { ...opts, year: 'numeric' })}`;
}

// ─── Tutor Dropdown ───────────────────────────────────────────────────────────

function TutorDropdown({ tutors, selected, onSelect }: {
  tutors: Tutor[];
  selected: Tutor | null;
  onSelect: (t: Tutor) => void;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(o => !o)}
        className="flex items-center gap-3 px-4 py-2.5 rounded-2xl transition-all min-w-[200px]"
        style={{ background: 'rgba(255,255,255,0.97)', border: '1px solid #e2e8f0', boxShadow: '0 4px 16px rgba(0,0,0,0.2)' }}
      >
        <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0" style={{ background: selected ? 'linear-gradient(135deg, #10b981, #059669)' : '#f1f5f9' }}>
          <User size={13} className={selected ? 'text-white' : 'text-slate-400'} />
        </div>
        <p className="text-sm font-black text-slate-900 leading-none flex-1 text-left truncate">{selected?.name ?? 'Select Tutor'}</p>
        <ChevronDown size={13} className={`text-slate-400 transition-transform shrink-0 ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute top-full right-0 mt-2 rounded-2xl overflow-hidden z-50 min-w-[220px]"
            style={{ background: '#fff', border: '1px solid #e2e8f0', boxShadow: '0 20px 40px rgba(0,0,0,0.15)' }}
          >
            {tutors.map(tutor => (
              <button key={tutor.id} onClick={() => { onSelect(tutor); setOpen(false); }}
                className="w-full flex items-center gap-3 px-4 py-3 text-left transition-colors"
                style={{ borderBottom: '1px solid #f1f5f9', background: selected?.id === tutor.id ? '#f0fdf4' : 'transparent' }}
                onMouseEnter={e => { if (selected?.id !== tutor.id) e.currentTarget.style.background = '#f8fafc'; }}
                onMouseLeave={e => { if (selected?.id !== tutor.id) e.currentTarget.style.background = 'transparent'; }}
              >
                <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0" style={{ background: selected?.id === tutor.id ? 'linear-gradient(135deg, #10b981, #059669)' : '#f1f5f9' }}>
                  <User size={12} className={selected?.id === tutor.id ? 'text-white' : 'text-slate-400'} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-black text-slate-900 leading-none">{tutor.name}</p>
                  <p className="text-[9px] font-bold text-slate-400 uppercase mt-0.5 truncate">{tutor.subjects.slice(0, 2).join(' · ')}</p>
                </div>
                {selected?.id === tutor.id && <Check size={12} className="text-emerald-500 shrink-0" />}
              </button>
            ))}
            {tutors.length === 0 && (
              <div className="px-4 py-6 text-center">
                <p className="text-xs text-slate-400 font-bold uppercase italic">No tutors in database</p>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────

export default function TutorPortal() {
  const [weekStart, setWeekStart] = useState<Date>(() => getWeekStart(new Date()));
  const weekDates = useMemo(() => getWeekDates(weekStart), [weekStart]);
  const isCurrentWeek = toISODate(weekStart) === toISODate(getWeekStart(new Date()));

  const { tutors, sessions, loading, error, refetch } = useScheduleData(weekStart);
  const [selectedTutor, setSelectedTutor] = useState<Tutor | null>(null);

  React.useEffect(() => {
    if (tutors.length > 0 && !selectedTutor) setSelectedTutor(tutors[0]);
  }, [tutors]);

  const goToPrevWeek = () => setWeekStart(p => { const d = new Date(p); d.setDate(d.getDate() - 7); return d; });
  const goToNextWeek = () => setWeekStart(p => { const d = new Date(p); d.setDate(d.getDate() + 7); return d; });
  const goToThisWeek = () => setWeekStart(getWeekStart(new Date()));

  const tutorSessions = useMemo(() =>
    selectedTutor ? sessions.filter(s => s.tutorId === selectedTutor.id) : [],
    [sessions, selectedTutor]
  );
  const totalStudents = tutorSessions.reduce((t, s) => t + s.students.length, 0);
  const openSlots = selectedTutor
    ? weekDates.reduce((t, date) => {
        const dow = dayOfWeek(toISODate(date));
        if (!selectedTutor.availability.includes(dow)) return t;
        const daySlots = selectedTutor.availabilityBlocks.length;
        const bookedSlots = tutorSessions
          .filter(s => s.date === toISODate(date))
          .reduce((n, s) => n + s.students.length, 0);
        return t + Math.max(0, daySlots - bookedSlots);
      }, 0)
    : 0;

  const handleAttendanceToggle = async (session: Session, studentId: string, currentStatus: string) => {
    const next = currentStatus === 'present' ? 'scheduled' : 'present';
    try {
      await updateAttendance({ sessionId: session.id, studentId, status: next as any });
      refetch();
    } catch (err) { console.error(err); }
  };

  if (loading) return (
    <div className="w-full min-h-screen flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #0a0f1e 0%, #060d18 50%, #010a10 100%)' }}>
      <div className="flex flex-col items-center gap-4">
        <Loader2 size={32} className="text-emerald-400 animate-spin" />
        <p className="text-[11px] font-black text-slate-500 uppercase tracking-widest">Loading…</p>
      </div>
    </div>
  );

  if (error) return (
    <div className="w-full min-h-screen flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #0a0f1e 0%, #060d18 50%, #010a10 100%)' }}>
      <div className="text-center">
        <p className="text-sm font-black text-rose-400 uppercase mb-3">{error}</p>
        <button onClick={refetch} className="px-6 py-3 rounded-xl text-xs font-black uppercase text-white" style={{ background: 'linear-gradient(135deg, #10b981, #059669)' }}>Retry</button>
      </div>
    </div>
  );

  return (
    <div className="relative w-full min-h-screen pb-12 font-sans text-white overflow-x-hidden"
      style={{ background: 'linear-gradient(135deg, #0a0f1e 0%, #060d18 50%, #010a10 100%)' }}
    >
      <div className="pointer-events-none fixed inset-0 z-0" style={{
        background: 'radial-gradient(ellipse 80% 60% at 50% 10%, rgba(16,185,129,0.12) 0%, transparent 70%)',
      }} />

      {/* HEADER */}
      <div className="sticky top-0 z-40 flex justify-between items-center px-4 md:px-8 py-3 border-b border-white/5"
        style={{ background: 'rgba(6,9,20,0.85)', backdropFilter: 'blur(16px)' }}
      >
        <div>
          <h1 className="text-xl md:text-2xl font-black uppercase italic tracking-tighter text-white leading-none">Tutor View</h1>
          <p className="text-[9px] font-bold text-emerald-400/70 uppercase tracking-widest mt-0.5">Admin Portal</p>
        </div>
        <TutorDropdown tutors={tutors} selected={selectedTutor} onSelect={setSelectedTutor} />
      </div>

      <div className="relative z-10 max-w-[1600px] mx-auto px-3 md:px-6">

        {/* STATS CARD */}
        {selectedTutor && (
          <div className="pt-6">
            <div className="rounded-2xl md:rounded-3xl p-5 md:p-6 flex flex-col md:flex-row md:items-center justify-between gap-4"
              style={{ background: 'rgba(255,255,255,0.97)', boxShadow: '0 0 0 1px rgba(16,185,129,0.1), 0 20px 40px rgba(0,0,0,0.3)' }}
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0" style={{ background: 'linear-gradient(135deg, #0f172a, #1e293b)' }}>
                  <User size={20} className="text-white" />
                </div>
                <div>
                  <h2 className="text-lg font-black text-slate-900 leading-none mb-2">{selectedTutor.name}</h2>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedTutor.subjects.map(s => (
                      <span key={s} className="text-[9px] font-bold px-2 py-0.5 bg-slate-100 text-slate-600 rounded-md uppercase border border-slate-200">{s}</span>
                    ))}
                  </div>
                </div>
              </div>
              <div className="flex gap-8">
                <div className="text-center">
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Students</p>
                  <p className="text-3xl font-black text-emerald-600 leading-none">{totalStudents}</p>
                </div>
                <div className="w-px bg-slate-200" />
                <div className="text-center">
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Open Slots</p>
                  <p className="text-3xl font-black text-slate-900 leading-none">{openSlots}</p>
                </div>
                <div className="w-px bg-slate-200" />
                <div className="text-center">
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Sessions</p>
                  <p className="text-3xl font-black text-slate-900 leading-none">{tutorSessions.length}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* WEEK NAV */}
        <div className="pt-5 pb-2 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={goToPrevWeek} className="w-9 h-9 rounded-xl flex items-center justify-center text-slate-400 transition-all"
              style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}
              onMouseEnter={e => { e.currentTarget.style.color = 'white'; e.currentTarget.style.background = 'rgba(255,255,255,0.1)'; }}
              onMouseLeave={e => { e.currentTarget.style.color = '#94a3b8'; e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; }}
            ><ChevronLeft size={16} /></button>
            <div>
              <div className="text-base font-black text-white uppercase italic tracking-tight leading-none">{formatWeekRange(weekStart)}</div>
              {isCurrentWeek && <span className="text-[9px] font-bold text-emerald-400 uppercase tracking-widest">Current Week</span>}
            </div>
            <button onClick={goToNextWeek} className="w-9 h-9 rounded-xl flex items-center justify-center text-slate-400 transition-all"
              style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}
              onMouseEnter={e => { e.currentTarget.style.color = 'white'; e.currentTarget.style.background = 'rgba(255,255,255,0.1)'; }}
              onMouseLeave={e => { e.currentTarget.style.color = '#94a3b8'; e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; }}
            ><ChevronRight size={16} /></button>
          </div>
          {!isCurrentWeek && (
            <button onClick={goToThisWeek} className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider text-emerald-400"
              style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.25)' }}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(16,185,129,0.2)'}
              onMouseLeave={e => e.currentTarget.style.background = 'rgba(16,185,129,0.1)'}
            ><CalendarDays size={12} /> Today</button>
          )}
        </div>

        {/* GRID */}
        <div className="space-y-10 md:space-y-14 pb-12">
          {!selectedTutor ? (
            <div className="rounded-2xl p-16 text-center" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}>
              <p className="text-sm font-black text-slate-600 uppercase italic">Select a tutor above</p>
            </div>
          ) : weekDates.map((date, idx) => {
            const isoDate = toISODate(date);
            const dow = idx + 1;
            const isToday = isoDate === toISODate(new Date());
            const isAvailableDay = selectedTutor.availability.includes(dow);
            const dateLabel = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

            return (
              <div key={isoDate} className="space-y-3">
                {/* Day heading */}
                <div className="flex items-center gap-3 px-1">
                  <div className="flex items-baseline gap-3">
                    <h2 className={`text-4xl md:text-5xl font-black uppercase italic tracking-tighter leading-none ${isToday ? 'text-emerald-400' : isAvailableDay ? 'text-white' : 'text-slate-600'}`}>
                      {DAY_NAMES[idx]}
                    </h2>
                    <span className={`text-base font-bold uppercase tracking-wider ${isToday ? 'text-emerald-500' : 'text-slate-500'}`}>
                      {dateLabel}
                      {isToday && (
                        <span className="ml-2 text-[9px] font-black px-2 py-0.5 rounded-full align-middle" style={{ background: 'rgba(16,185,129,0.2)', border: '1px solid rgba(16,185,129,0.4)', color: '#34d399' }}>TODAY</span>
                      )}
                    </span>
                  </div>
                  <div className="h-px grow rounded-full" style={{ background: isToday ? 'linear-gradient(90deg, rgba(16,185,129,0.6), transparent)' : 'linear-gradient(90deg, rgba(255,255,255,0.08), transparent)' }} />
                  {!isAvailableDay && <span className="text-[9px] font-black text-slate-600 uppercase tracking-wider shrink-0">Off</span>}
                </div>

                {!isAvailableDay ? (
                  <div className="rounded-2xl p-5 text-center" style={{ background: 'rgba(255,255,255,0.01)', border: '1px solid rgba(255,255,255,0.04)' }}>
                    <p className="text-[10px] font-bold text-slate-700 uppercase italic">Not available this day</p>
                  </div>
                ) : (
                  <div className="rounded-3xl overflow-hidden" style={{ background: '#f8fafc', border: '1px solid #e2e8f0', boxShadow: '0 8px 32px rgba(0,0,0,0.35)' }}>
                    <div className="overflow-x-auto">
                      <table className="border-collapse" style={{ minWidth: '100%', width: 'max-content' }}>
                        <thead>
                          <tr style={{ background: '#f1f5f9', borderBottom: '1px solid #e2e8f0' }}>
                            {TIME_SLOTS.map(t => (
                              <th key={t} className="p-2 text-center font-black text-slate-600 text-[10px] tracking-wide"
                                style={{ borderRight: '1px solid #e2e8f0', minWidth: 110 }}
                              >
                                {formatTime(t).replace(' AM', 'a').replace(' PM', 'p')}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          <tr>
                            {TIME_SLOTS.map(time => {
                              const session = sessions.find(s => s.date === isoDate && s.tutorId === selectedTutor.id && s.time === time);
                              const hasStudents = session && session.students.length > 0;
                              const isAvail = isTutorAvailable(selectedTutor, time);

                              return (
                                <td key={time} className="p-2 align-top h-[160px]"
                                  style={{ background: isAvail ? '#ffffff' : '#f8fafc', borderRight: '1px solid #e2e8f0' }}
                                >
                                  <div className="flex flex-col gap-1.5 h-full">
                                    {hasStudents ? (
                                      <>
                                        {session!.students.map(student => (
                                          <div key={student.rowId || student.id}
                                            className="p-2.5 rounded-xl"
                                            style={student.status === 'present' ? {
                                              background: '#dcfce7', border: '1.5px solid #4ade80',
                                            } : student.status === 'no-show' ? {
                                              background: 'transparent', border: '1.5px solid #cbd5e1', opacity: 0.45,
                                            } : {
                                              background: '#eef2ff', border: '1.5px solid #818cf8',
                                            }}
                                          >
                                            <div className="flex items-start justify-between mb-0.5">
                                              <div className="min-w-0">
                                                <p className="text-xs font-black text-slate-800 leading-tight truncate">{student.name}</p>
                                                <p className="text-[10px] font-bold uppercase tracking-tight text-indigo-500">{student.topic}</p>
                                              </div>
                                              <button
                                                onClick={() => handleAttendanceToggle(session!, student.id, student.status)}
                                                className="ml-1.5 shrink-0 w-6 h-6 rounded-lg flex items-center justify-center transition-all active:scale-90"
                                                style={student.status === 'present' ? {
                                                  background: '#10b981', border: '1px solid #059669', boxShadow: '0 0 8px rgba(16,185,129,0.4)',
                                                } : {
                                                  background: '#e0e7ff', border: '1px solid #a5b4fc',
                                                }}
                                              >
                                                <Check size={12} strokeWidth={3} className={student.status === 'present' ? 'text-white' : 'text-indigo-400'} />
                                              </button>
                                            </div>
                                          </div>
                                        ))}
                                      </>
                                    ) : isAvail ? (
                                      <div className="w-full h-full rounded-xl flex items-center justify-center" style={{ border: '1.5px dashed #86efac' }}>
                                        <span className="text-[9px] font-black uppercase tracking-widest text-emerald-400">Open</span>
                                      </div>
                                    ) : (
                                      <div className="w-full h-full rounded-xl flex items-center justify-center" style={{ background: 'repeating-linear-gradient(45deg, #f8fafc, #f8fafc 4px, #f1f5f9 4px, #f1f5f9 8px)' }}>
                                        <span className="text-[9px] font-bold text-slate-300">—</span>
                                      </div>
                                    )}
                                  </div>
                                </td>
                              );
                            })}
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}