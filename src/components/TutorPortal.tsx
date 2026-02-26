"use client"
import React, { useState } from 'react';
import { Clock, Save, User, X, Plus, Check, CalendarClock, AlertCircle } from "lucide-react";

const TIME_SLOTS = ["14:00", "15:00", "16:00", "17:00", "18:00"];
const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];

const TUTOR_INFO = {
  name: "Sarah Jenkins",
  subjects: ["Math", "Calculus", "Physics"],
  email: "sarah.jenkins@tutoring.com"
};

const INITIAL_AVAILABILITY: Record<number, string[]> = {
  1: ["15:00-17:00"],
  2: ["15:00-17:00"],
  3: ["15:00-17:00"],
  4: ["16:00-18:00"],
  5: ["15:00-17:00"],
};

const ASSIGNED_SESSIONS = [
  { day: 1, time: "15:00", students: [
    { id: "s1", name: "James M.", topic: "Calculus", status: "scheduled", hoursLeft: 8 },
    { id: "s2", name: "Ava R.", topic: "Physics", status: "scheduled", hoursLeft: 12 }
  ]},
  { day: 1, time: "16:00", students: [
    { id: "s3", name: "Leo T.", topic: "Math", status: "scheduled", hoursLeft: 5 }
  ]},
  { day: 2, time: "15:00", students: [
    { id: "s10", name: "Sophia W.", topic: "Physics", status: "scheduled", hoursLeft: 15 }
  ]},
  { day: 2, time: "16:00", students: [
    { id: "s15", name: "Chris P.", topic: "Calculus", status: "scheduled", hoursLeft: 3 },
    { id: "s25", name: "James M.", topic: "Calculus", status: "scheduled", hoursLeft: 6 }
  ]},
  { day: 3, time: "15:00", students: [
    { id: "s15", name: "Chris P.", topic: "Calculus", status: "scheduled", hoursLeft: 3 }
  ]},
  { day: 3, time: "17:00", students: [
    { id: "s24", name: "Ava R.", topic: "Physics", status: "scheduled", hoursLeft: 10 }
  ]},
  { day: 4, time: "16:00", students: [
    { id: "s24", name: "Ava R.", topic: "Physics", status: "scheduled", hoursLeft: 10 }
  ]},
  { day: 4, time: "18:00", students: [
    { id: "s24", name: "Ava R.", topic: "Physics", status: "scheduled", hoursLeft: 10 }
  ]},
  { day: 5, time: "15:00", students: [
    { id: "s25", name: "James M.", topic: "Calculus", status: "scheduled", hoursLeft: 6 }
  ]},
  { day: 5, time: "17:00", students: [
    { id: "s10", name: "Sophia W.", topic: "Physics", status: "scheduled", hoursLeft: 15 }
  ]}
];

export default function TutorPortal() {
  const [availability, setAvailability] = useState(INITIAL_AVAILABILITY);
  const [sessions, setSessions] = useState(ASSIGNED_SESSIONS);
  const [showAvailModal, setShowAvailModal] = useState(false);
  const [selectedDay, setSelectedDay] = useState(1);
  const [blockStart, setBlockStart] = useState("");
  const [blockEnd, setBlockEnd] = useState("");

  const isTimeAvailable = (dayNum: number, time: string) => {
    const dayAvail = availability[dayNum] || [];
    return dayAvail.some(block => {
      const [start, end] = block.split('-');
      return time >= start && time <= end;
    });
  };

  const togglePresent = (dayIdx: number, time: string, studentId: string) => {
    setSessions(prev => prev.map(s => {
      if (s.day === dayIdx && s.time === time) {
        return {
          ...s,
          students: s.students.map(student =>
            student.id === studentId
              ? { ...student, status: student.status === 'present' ? 'scheduled' : 'present' }
              : student
          )
        };
      }
      return s;
    }));
  };

  const addAvailabilityBlock = () => {
    if (blockStart && blockEnd && blockStart <= blockEnd) {
      setAvailability(prev => ({
        ...prev,
        [selectedDay]: [...(prev[selectedDay] || []), `${blockStart}-${blockEnd}`]
      }));
      setBlockStart("");
      setBlockEnd("");
    }
  };

  const removeAvailabilityBlock = (dayNum: number, blockIndex: number) => {
    setAvailability(prev => ({
      ...prev,
      [dayNum]: prev[dayNum].filter((_, idx) => idx !== blockIndex)
    }));
  };

  const totalAvailableSlots = Object.entries(availability).reduce((total, [, blocks]) => {
    return total + blocks.reduce((dayTotal, block) => {
      const [start, end] = block.split('-');
      const startIdx = TIME_SLOTS.indexOf(start);
      const endIdx = TIME_SLOTS.indexOf(end);
      return dayTotal + (endIdx - startIdx + 1);
    }, 0);
  }, 0);

  const totalSessionsThisWeek = sessions.reduce((t, s) => t + s.students.length, 0);

  const canAddBlock = blockStart && blockEnd && blockStart <= blockEnd;

  return (
    <div
      className="relative w-full min-h-screen pb-12 font-sans text-white overflow-x-hidden"
      style={{ background: 'linear-gradient(135deg, #0a0f1e 0%, #060d18 50%, #010a10 100%)' }}
    >
      {/* AMBIENT NEON GLOW */}
      <div
        className="pointer-events-none fixed inset-0 z-0"
        style={{
          background:
            'radial-gradient(ellipse 80% 60% at 50% 10%, rgba(16,185,129,0.12) 0%, transparent 70%), ' +
            'radial-gradient(ellipse 40% 40% at 85% 85%, rgba(6,182,212,0.07) 0%, transparent 60%)',
        }}
      />

      {/* HEADER */}
      <div
        className="sticky top-0 z-40 flex justify-between items-center px-4 md:px-8 py-3 border-b border-white/5"
        style={{ background: 'rgba(6,9,20,0.85)', backdropFilter: 'blur(16px)' }}
      >
        <div>
          <h1 className="text-xl md:text-2xl font-black uppercase italic tracking-tighter text-white leading-none">
            {TUTOR_INFO.name}
          </h1>
          <p className="text-[9px] font-bold text-emerald-400 uppercase tracking-widest mt-0.5">Tutor Portal</p>
        </div>

        <button
          onClick={() => setShowAvailModal(true)}
          className="flex items-center gap-2 px-5 md:px-7 py-2.5 md:py-3 rounded-xl text-xs md:text-sm font-black uppercase tracking-wider text-white transition-all active:scale-95"
          style={{
            background: 'linear-gradient(135deg, #10b981, #059669)',
            boxShadow: '0 0 20px rgba(16,185,129,0.45), inset 0 1px 0 rgba(255,255,255,0.15)',
          }}
          onMouseEnter={e => (e.currentTarget.style.boxShadow = '0 0 32px rgba(16,185,129,0.65), inset 0 1px 0 rgba(255,255,255,0.15)')}
          onMouseLeave={e => (e.currentTarget.style.boxShadow = '0 0 20px rgba(16,185,129,0.45), inset 0 1px 0 rgba(255,255,255,0.15)')}
        >
          <CalendarClock size={15} />
          Set Availability
        </button>
      </div>

      {/* MAIN CONTENT */}
      <div className="relative z-10 max-w-[1600px] mx-auto p-3 md:p-6 space-y-6 md:space-y-10">

        {/* TUTOR INFO CARD */}
        <div
          className="rounded-2xl md:rounded-3xl p-5 md:p-7 flex flex-col md:flex-row md:items-center justify-between gap-4"
          style={{
            background: 'rgba(255,255,255,0.97)',
            boxShadow: '0 0 0 1px rgba(16,185,129,0.1), 0 20px 40px rgba(0,0,0,0.3)',
          }}
        >
          <div className="flex items-center gap-4">
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center shrink-0"
              style={{ background: 'linear-gradient(135deg, #0f172a, #1e293b)' }}
            >
              <User size={24} className="text-white" />
            </div>
            <div>
              <h2 className="text-lg md:text-xl font-black text-slate-900 leading-none mb-1">{TUTOR_INFO.name}</h2>
              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-2">{TUTOR_INFO.email}</p>
              <div className="flex flex-wrap gap-1.5">
                {TUTOR_INFO.subjects.map(s => (
                  <span key={s} className="text-[9px] font-bold px-2 py-0.5 bg-slate-100 text-slate-600 rounded-md uppercase tracking-tight border border-slate-200">{s}</span>
                ))}
              </div>
            </div>
          </div>
          <div className="flex gap-6 md:gap-10">
            <div className="text-center">
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Available Hrs</p>
              <p className="text-3xl md:text-4xl font-black text-slate-900 leading-none">{totalAvailableSlots}</p>
            </div>
            <div className="w-px bg-slate-200" />
            <div className="text-center">
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Sessions</p>
              <p className="text-3xl md:text-4xl font-black text-emerald-600 leading-none">{totalSessionsThisWeek}</p>
            </div>
          </div>
        </div>

        {/* SECTION HEADING */}
        <div className="flex items-center gap-3 md:gap-4">
          <h2 className="text-2xl md:text-3xl font-black uppercase italic tracking-tighter text-white whitespace-nowrap">My Weekly Schedule</h2>
          <div className="h-px grow rounded-full" style={{ background: 'linear-gradient(90deg, rgba(16,185,129,0.4), transparent)' }} />
        </div>

        {/* DAY BLOCKS */}
        {DAYS.map((dayName, idx) => {
          const dayNum = idx + 1;
          const daySessions = sessions.filter(s => s.day === dayNum);
          const dayAvailability = availability[dayNum] || [];

          return (
            <div key={dayName} className="space-y-3">

              {/* Day label — outside the calendar, stays dark/white */}
              <div className="flex items-center justify-between gap-3 px-1">
                <div className="flex items-center gap-3 md:gap-4">
                  <h3 className="text-3xl md:text-4xl font-black uppercase italic tracking-tighter text-white">{dayName}</h3>
                  <div className="h-px grow rounded-full" style={{ background: 'linear-gradient(90deg, rgba(16,185,129,0.4), transparent)' }} />
                </div>
                {dayAvailability.length > 0 && (
                  <div className="flex gap-1.5 flex-wrap justify-end">
                    {dayAvailability.map((block, i) => (
                      <span
                        key={i}
                        className="text-[9px] font-black px-2.5 py-1 rounded-full uppercase tracking-wider"
                        style={{ background: 'rgba(16,185,129,0.15)', border: '1px solid rgba(16,185,129,0.3)', color: '#34d399' }}
                      >
                        {block}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {dayAvailability.length === 0 ? (
                <div
                  className="rounded-2xl p-8 text-center border border-dashed"
                  style={{ borderColor: 'rgba(255,255,255,0.08)', background: 'rgba(0,0,0,0.2)' }}
                >
                  <p className="text-xs font-bold text-slate-600 uppercase italic tracking-wider">No availability set — tap Set Availability to add</p>
                </div>
              ) : (
                <>
                  {/* DESKTOP TABLE — light, matches MasterGrid */}
                  <div
                    className="hidden md:block rounded-3xl overflow-hidden"
                    style={{
                      background: '#f8fafc',
                      border: '1px solid #e2e8f0',
                      boxShadow: '0 8px 32px rgba(0,0,0,0.35), 0 0 0 1px rgba(255,255,255,0.05)',
                    }}
                  >
                    <div className="grid grid-cols-5" style={{ borderColor: '#e2e8f0' }}>
                      {TIME_SLOTS.map(time => {
                        const session = daySessions.find(s => s.time === time);
                        const isAvail = isTimeAvailable(dayNum, time);

                        // Cell bg — light palette identical to MasterGrid
                        let cellBg = '#ffffff';
                        if (!isAvail) cellBg = '#f8fafc';
                        else if (isAvail && !session) cellBg = '#f0fdf4';

                        return (
                          <div
                            key={time}
                            className="p-3"
                            style={{ background: cellBg, borderRight: '1px solid #e2e8f0' }}
                          >
                            {/* Time label */}
                            <div
                              className="text-[9px] font-black uppercase tracking-widest text-center mb-3 pb-2"
                              style={{ color: isAvail ? '#16a34a' : '#94a3b8', borderBottom: '1px solid #e2e8f0' }}
                            >
                              {time}
                            </div>

                            <div className="space-y-2 min-h-[120px]">
                              {session ? (
                                session.students.map(student => (
                                  <div
                                    key={student.id}
                                    className="p-2.5 rounded-xl transition-all"
                                    style={student.status === 'present' ? {
                                      // Present = glowing green (check-in confirmed)
                                      background: '#dcfce7',
                                      border: '1.5px solid #4ade80',
                                      boxShadow: '0 0 10px rgba(16,185,129,0.15)',
                                    } : {
                                      // Scheduled = indigo outline, matches MasterGrid student cards
                                      background: '#eef2ff',
                                      border: '1.5px solid #818cf8',
                                    }}
                                  >
                                    <div className="flex justify-between items-start mb-1.5">
                                      <div className="flex-1 min-w-0">
                                        <p className="text-xs font-black text-slate-800 leading-tight truncate mb-0.5">{student.name}</p>
                                        <p className="text-[9px] font-bold uppercase tracking-tight text-indigo-500">{student.topic}</p>
                                      </div>
                                      {/* Check-in button */}
                                      <button
                                        onClick={() => togglePresent(dayNum, time, student.id)}
                                        className="ml-2 shrink-0 w-6 h-6 rounded-lg flex items-center justify-center transition-all active:scale-90"
                                        style={student.status === 'present' ? {
                                          background: '#10b981',
                                          border: '1px solid #059669',
                                          boxShadow: '0 0 8px rgba(16,185,129,0.4)',
                                        } : {
                                          background: '#e0e7ff',
                                          border: '1px solid #a5b4fc',
                                        }}
                                      >
                                        <Check size={13} strokeWidth={3} className={student.status === 'present' ? 'text-white' : 'text-indigo-400'} />
                                      </button>
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                      <Clock size={9} className="text-slate-400" />
                                      <span className="text-[8px] font-bold text-slate-500 uppercase">{student.hoursLeft}h left</span>
                                    </div>
                                  </div>
                                ))
                              ) : isAvail ? (
                                // Available — light green, same as MasterGrid
                                <div
                                  className="h-full min-h-[80px] rounded-xl flex items-center justify-center border border-dashed"
                                  style={{ background: '#f0fdf4', borderColor: '#86efac' }}
                                >
                                  <span className="text-[8px] font-black uppercase tracking-wider text-emerald-600">Open</span>
                                </div>
                              ) : (
                                // Outside availability — diagonal stripe
                                <div
                                  className="h-full min-h-[80px] rounded-xl flex items-center justify-center"
                                  style={{ background: 'repeating-linear-gradient(45deg, #f8fafc, #f8fafc 4px, #f1f5f9 4px, #f1f5f9 8px)' }}
                                >
                                  <span className="text-[8px] font-bold text-slate-300 uppercase">—</span>
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* MOBILE VIEW — light */}
                  <div className="md:hidden space-y-2">
                    {daySessions.length > 0 ? daySessions.map(session => (
                      <div
                        key={`${session.day}-${session.time}`}
                        className="rounded-2xl overflow-hidden"
                        style={{ background: '#f8fafc', border: '1px solid #e2e8f0', boxShadow: '0 4px 16px rgba(0,0,0,0.25)' }}
                      >
                        {/* Time header */}
                        <div className="px-4 py-2.5" style={{ background: '#f1f5f9', borderBottom: '1px solid #e2e8f0' }}>
                          <p className="text-xs font-black text-slate-700 uppercase tracking-widest">{session.time}</p>
                        </div>
                        <div className="p-3 space-y-2">
                          {session.students.map(student => (
                            <div
                              key={student.id}
                              className="p-3 rounded-xl transition-all"
                              style={student.status === 'present' ? {
                                background: '#dcfce7',
                                border: '1.5px solid #4ade80',
                              } : {
                                background: '#eef2ff',
                                border: '1.5px solid #818cf8',
                              }}
                            >
                              <div className="flex justify-between items-start mb-2">
                                <div>
                                  <p className="text-sm font-black text-slate-800 leading-tight mb-0.5">{student.name}</p>
                                  <p className="text-[9px] font-bold uppercase tracking-tight text-indigo-500">{student.topic}</p>
                                </div>
                                <button
                                  onClick={() => togglePresent(dayNum, session.time, student.id)}
                                  className="ml-2 w-9 h-9 rounded-xl flex items-center justify-center transition-all active:scale-90"
                                  style={student.status === 'present' ? {
                                    background: '#10b981',
                                    border: '1px solid #059669',
                                    boxShadow: '0 0 10px rgba(16,185,129,0.4)',
                                  } : {
                                    background: '#e0e7ff',
                                    border: '1px solid #a5b4fc',
                                  }}
                                >
                                  <Check size={16} strokeWidth={3} className={student.status === 'present' ? 'text-white' : 'text-indigo-400'} />
                                </button>
                              </div>
                              <div className="flex items-center gap-1.5">
                                <Clock size={10} className="text-slate-400" />
                                <span className="text-[9px] font-bold text-slate-500 uppercase">{student.hoursLeft}h remaining</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )) : (
                      <div
                        className="rounded-2xl p-6 text-center border border-dashed"
                        style={{ borderColor: '#86efac', background: '#f0fdf4' }}
                      >
                        <p className="text-xs font-bold text-emerald-600 uppercase italic tracking-wider">No sessions scheduled</p>
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          );
        })}
      </div>

      {/* AVAILABILITY MODAL — unchanged */}
      {showAvailModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: 'rgba(2,6,18,0.92)', backdropFilter: 'blur(20px)' }}
        >
          <div
            className="w-full max-w-xl max-h-[90vh] rounded-3xl overflow-hidden flex flex-col"
            style={{
              background: '#0c1422',
              border: '1px solid rgba(255,255,255,0.1)',
              boxShadow: '0 0 0 1px rgba(16,185,129,0.15), 0 40px 80px rgba(0,0,0,0.7)',
            }}
          >
            <div className="h-0.5 w-full shrink-0" style={{ background: 'linear-gradient(90deg, transparent 0%, #10b981 40%, #06b6d4 70%, transparent 100%)' }} />

            <div className="px-6 md:px-8 pt-6 pb-5 border-b shrink-0" style={{ borderColor: 'rgba(255,255,255,0.07)' }}>
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-2xl md:text-3xl font-black text-white uppercase italic tracking-tighter leading-none mb-1.5">
                    Set Availability
                  </h3>
                  <p className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest">
                    Define your available time blocks
                  </p>
                </div>
                <button
                  onClick={() => setShowAvailModal(false)}
                  className="w-8 h-8 rounded-full flex items-center justify-center text-slate-500 hover:text-white transition-colors"
                  style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)' }}
                >
                  <X size={15} />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-6">
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Select Day</p>
                <div className="flex gap-2 overflow-x-auto pb-1">
                  {DAYS.map((day, idx) => {
                    const isActive = selectedDay === idx + 1;
                    const hasBlocks = (availability[idx + 1] || []).length > 0;
                    return (
                      <button
                        key={day}
                        onClick={() => setSelectedDay(idx + 1)}
                        className="px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all shrink-0 relative"
                        style={isActive ? {
                          background: 'linear-gradient(135deg, #10b981, #059669)',
                          color: 'white',
                          border: '1px solid transparent',
                          boxShadow: '0 0 14px rgba(16,185,129,0.4)',
                        } : {
                          background: 'rgba(255,255,255,0.05)',
                          color: '#94a3b8',
                          border: '1px solid rgba(255,255,255,0.09)',
                        }}
                      >
                        {day.substring(0, 3)}
                        {hasBlocks && !isActive && (
                          <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-emerald-400 rounded-full" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest mb-3">
                  {DAYS[selectedDay - 1]} · Current Blocks
                </p>
                <div className="space-y-2">
                  {(availability[selectedDay] || []).length === 0 ? (
                    <div
                      className="p-4 rounded-xl text-center border border-dashed"
                      style={{ borderColor: 'rgba(255,255,255,0.08)', background: 'rgba(0,0,0,0.2)' }}
                    >
                      <p className="text-xs font-bold text-slate-600 italic uppercase">No blocks set for this day</p>
                    </div>
                  ) : (
                    (availability[selectedDay] || []).map((block, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between p-3.5 rounded-xl"
                        style={{ background: 'rgba(16,185,129,0.12)', border: '1px solid rgba(16,185,129,0.3)' }}
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-2 h-2 bg-emerald-400 rounded-full" style={{ boxShadow: '0 0 6px rgba(16,185,129,0.6)' }} />
                          <span className="text-sm font-black text-white uppercase tracking-wider">{block}</span>
                        </div>
                        <button
                          onClick={() => removeAvailabilityBlock(selectedDay, idx)}
                          className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-500 hover:text-rose-400 transition-colors"
                          style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)' }}
                        >
                          <X size={13} />
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>

              <div
                className="p-5 rounded-2xl space-y-4"
                style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
              >
                <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Add Time Block</p>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { label: 'Start Time', value: blockStart, setter: setBlockStart },
                    { label: 'End Time', value: blockEnd, setter: setBlockEnd },
                  ].map(({ label, value, setter }) => (
                    <div key={label}>
                      <label className="text-[9px] font-black text-slate-400 uppercase tracking-wider mb-2 block">{label}</label>
                      <select
                        value={value}
                        onChange={e => setter(e.target.value)}
                        className="w-full py-3 px-4 rounded-xl text-sm font-black text-white focus:outline-none transition-colors appearance-none"
                        style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)' }}
                        onFocus={e => (e.currentTarget.style.borderColor = 'rgba(16,185,129,0.5)')}
                        onBlur={e => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)')}
                      >
                        <option value="" style={{ background: '#0c1422' }}>Select</option>
                        {TIME_SLOTS.map(time => (
                          <option key={time} value={time} style={{ background: '#0c1422' }}>{time}</option>
                        ))}
                      </select>
                    </div>
                  ))}
                </div>

                {blockStart && blockEnd && blockStart > blockEnd && (
                  <div className="flex items-center gap-2 px-3 py-2 rounded-lg" style={{ background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.25)' }}>
                    <AlertCircle size={12} className="text-red-400 shrink-0" />
                    <p className="text-[9px] font-bold text-red-400 uppercase">End time must be after start time</p>
                  </div>
                )}

                <button
                  onClick={addAvailabilityBlock}
                  disabled={!canAddBlock}
                  className="w-full py-3.5 rounded-xl text-[10px] font-black uppercase tracking-wider flex items-center justify-center gap-2 transition-all active:scale-95"
                  style={canAddBlock ? {
                    background: 'linear-gradient(135deg, #10b981, #059669)',
                    color: 'white',
                    border: '1px solid transparent',
                    boxShadow: '0 0 16px rgba(16,185,129,0.35)',
                  } : {
                    background: 'rgba(255,255,255,0.04)',
                    color: '#475569',
                    border: '1px solid rgba(255,255,255,0.06)',
                    cursor: 'not-allowed',
                  }}
                >
                  <Plus size={14} />
                  Add Block
                </button>
              </div>
            </div>

            <div className="px-6 md:px-8 py-5 shrink-0 border-t" style={{ borderColor: 'rgba(255,255,255,0.07)', background: 'rgba(0,0,0,0.2)' }}>
              <button
                onClick={() => setShowAvailModal(false)}
                className="w-full py-4 rounded-2xl font-black uppercase text-[11px] tracking-wider flex items-center justify-center gap-2.5 text-white transition-all active:scale-95"
                style={{
                  background: 'linear-gradient(135deg, #10b981, #059669)',
                  boxShadow: '0 0 20px rgba(16,185,129,0.4)',
                }}
                onMouseEnter={e => (e.currentTarget.style.boxShadow = '0 0 32px rgba(16,185,129,0.6)')}
                onMouseLeave={e => (e.currentTarget.style.boxShadow = '0 0 20px rgba(16,185,129,0.4)')}
              >
                <Save size={16} />
                Save Availability
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}