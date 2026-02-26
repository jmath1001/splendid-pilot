"use client"
import React, { useState, useMemo } from 'react';
import { Search, X, Repeat, Check, PlusCircle } from "lucide-react";

import { DAYS, formatTime } from '@/components/constants';

// ─── Types ───────────────────────────────────────────────────────────────────

export interface PrefilledSlot {
  tutor: any;
  dayName: string;
  dayNum: number;
  date: string;   // ISO date string e.g. '2026-02-25'
  time: string;
}

export interface BookingConfirmData {
  student: any;
  slot: PrefilledSlot;
  recurring: boolean;
  recurringWeeks: number;
}

export interface BookingFormProps {
  prefilledSlot?: PrefilledSlot | null;
  onConfirm: (data: BookingConfirmData) => void;
  onCancel: () => void;
  enrollCat: string;
  setEnrollCat: (c: string) => void;
  allAvailableSeats: any[];
  studentDatabase: any[]; // ← now passed in from Supabase instead of imported
}

// ─── BookingForm ──────────────────────────────────────────────────────────────

export function BookingForm({
  prefilledSlot,
  onConfirm,
  onCancel,
  enrollCat,
  setEnrollCat,
  allAvailableSeats,
  studentDatabase,
}: BookingFormProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStudent, setSelectedStudent] = useState<any>(null);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [recurring, setRecurring] = useState(false);
  const [recurringWeeks, setRecurringWeeks] = useState(4);
  const [selectedSlot, setSelectedSlot] = useState<any>(prefilledSlot || null);

  const filteredStudents = useMemo(() => {
    if (!searchQuery.trim()) return [];
    return studentDatabase.filter(student =>
      student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.subject.toLowerCase().includes(searchQuery.toLowerCase())
    ).slice(0, 5);
  }, [searchQuery, studentDatabase]);

  const selectStudent = (student: any) => {
    setSelectedStudent(student);
    setSearchQuery(student.name);
    setShowSuggestions(false);
  };

  const canConfirm = selectedStudent && selectedSlot;

  return (
    <div
      className="w-full max-w-5xl max-h-[90vh] rounded-3xl md:rounded-[2.5rem] flex flex-col md:flex-row overflow-hidden"
      style={{
        background: '#0c1422',
        border: '1px solid rgba(255,255,255,0.1)',
        boxShadow: '0 0 0 1px rgba(16,185,129,0.15), 0 40px 80px rgba(0,0,0,0.7)',
      }}
    >
      {/* TOP ACCENT LINE */}
      <div className="absolute top-0 left-0 right-0 h-0.5 rounded-t-3xl z-10" style={{ background: 'linear-gradient(90deg, transparent 0%, #10b981 40%, #06b6d4 70%, transparent 100%)' }} />

      {/* ── LEFT PANEL ── */}
      <div
        className="w-full md:w-72 p-6 md:p-8 flex flex-col justify-between border-b md:border-b-0 md:border-r"
        style={{ background: 'rgba(0,0,0,0.3)', borderColor: 'rgba(255,255,255,0.07)' }}
      >
        <div>
          {/* Title */}
          <h3 className="text-3xl md:text-4xl font-black uppercase italic tracking-tighter text-white mb-1">
            Schedule<br className="hidden md:block" />Student
          </h3>
          <p className="text-[9px] font-bold text-emerald-400 uppercase tracking-widest mb-6 md:mb-8">Book a session</p>

          {/* Prefilled slot badge */}
          {prefilledSlot && (
            <div className="mb-5 p-3 rounded-xl" style={{ background: 'rgba(16,185,129,0.15)', border: '1px solid rgba(16,185,129,0.3)' }}>
              <p className="text-[8px] font-black uppercase tracking-wider text-emerald-400 mb-1">Booking Slot</p>
              <p className="text-sm font-black text-white leading-none">{prefilledSlot.tutor.name}</p>
              <p className="text-[9px] font-bold text-emerald-300 mt-1 uppercase">{prefilledSlot.dayName} · {new Date(prefilledSlot.date + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} · {formatTime(prefilledSlot.time)}</p>
            </div>
          )}

          {/* Student Search */}
          <div className="mb-5 relative">
            <label className="text-[10px] font-black text-slate-300 uppercase tracking-wider mb-2 block">Search Student</label>
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setShowSuggestions(true);
                  if (!e.target.value) setSelectedStudent(null);
                }}
                onFocus={() => setShowSuggestions(true)}
                placeholder="Type name or subject..."
                className="w-full py-3 px-4 rounded-xl text-sm font-bold text-white placeholder-slate-600 focus:outline-none transition-colors"
                style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)' }}
                onFocus={e => (e.currentTarget.style.borderColor = 'rgba(16,185,129,0.6)')}
                onBlur={e => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)')}
              />
              <Search size={16} className="absolute right-3 top-3.5 text-slate-500" />
            </div>

            {showSuggestions && filteredStudents.length > 0 && (
              <div
                className="absolute top-full left-0 right-0 mt-1.5 rounded-xl overflow-hidden z-10"
                style={{ background: '#0d1b2a', border: '1px solid rgba(255,255,255,0.1)', boxShadow: '0 20px 40px rgba(0,0,0,0.7)' }}
              >
                {filteredStudents.map(student => (
                  <button
                    key={student.id}
                    onClick={() => selectStudent(student)}
                    className="w-full p-3 text-left transition-colors"
                    style={{ borderBottom: '1px solid rgba(255,255,255,0.06)', background: 'transparent' }}
                    onMouseEnter={e => (e.currentTarget.style.background = 'rgba(16,185,129,0.1)')}
                    onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                  >
                    <p className="text-sm font-black text-white leading-none mb-1">{student.name}</p>
                    <div className="flex items-center gap-2">
                      <span className="text-[8px] font-bold text-emerald-400 uppercase">{student.subject}</span>
                      <span className="text-[8px] text-slate-600">•</span>
                      <span className="text-[8px] font-bold text-slate-400">{student.hoursLeft}h left</span>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Selected student confirmation */}
          {selectedStudent && (
            <div className="mb-5 p-3.5 rounded-xl" style={{ background: 'rgba(16,185,129,0.12)', border: '1px solid rgba(16,185,129,0.3)' }}>
              <p className="text-[9px] font-black text-emerald-400 uppercase tracking-wider mb-1.5">✓ Selected</p>
              <p className="text-sm font-black text-white mb-0.5">{selectedStudent.name}</p>
              <p className="text-[9px] font-bold text-slate-400 uppercase">{selectedStudent.subject} · {selectedStudent.hoursLeft}h remaining</p>
            </div>
          )}

          {/* Recurring toggle */}
          <div className="mb-5 p-4 rounded-xl" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Repeat size={14} className={recurring ? 'text-emerald-400' : 'text-slate-500'} />
                <span className="text-[11px] font-black uppercase tracking-wider text-slate-200">Recurring</span>
              </div>
              <button
                onClick={() => setRecurring(!recurring)}
                className="relative w-10 h-5 rounded-full transition-all"
                style={{ background: recurring ? '#10b981' : 'rgba(255,255,255,0.12)', boxShadow: recurring ? '0 0 10px rgba(16,185,129,0.4)' : 'none' }}
              >
                <span
                  className="absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform"
                  style={{ transform: recurring ? 'translateX(20px)' : 'translateX(0)' }}
                />
              </button>
            </div>
            {recurring && (
              <div>
                <p className="text-[10px] font-black text-slate-300 uppercase tracking-wider mb-2">Repeat for</p>
                <div className="flex gap-1.5 flex-wrap">
                  {[2, 4, 6, 8].map(w => (
                    <button
                      key={w}
                      onClick={() => setRecurringWeeks(w)}
                      className="px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-wider transition-all"
                      style={recurringWeeks === w ? {
                        background: '#10b981', color: 'white', border: '1px solid #10b981', boxShadow: '0 0 10px rgba(16,185,129,0.4)',
                      } : {
                        background: 'rgba(255,255,255,0.06)', color: '#94a3b8', border: '1px solid rgba(255,255,255,0.1)',
                      }}
                    >
                      {w}wk
                    </button>
                  ))}
                </div>
                <p className="text-[9px] text-slate-400 mt-2 font-bold">
                  Every {selectedSlot ? DAYS[selectedSlot.dayNum - 1] || selectedSlot.dayName : 'selected day'} for {recurringWeeks} weeks
                </p>
              </div>
            )}
          </div>

          {/* Category filter */}
          {!prefilledSlot && (
            <div className="flex md:flex-col gap-2">
              {[
                { key: 'math', label: 'Math / Science' },
                { key: 'english', label: 'English / Hist' },
              ].map(({ key, label }) => (
                <button
                  key={key}
                  onClick={() => setEnrollCat(key)}
                  className="flex-1 py-3 md:py-3.5 px-4 rounded-2xl text-[10px] font-black uppercase tracking-wider transition-all"
                  style={enrollCat === key ? {
                    background: 'linear-gradient(135deg, #10b981, #059669)',
                    color: 'white',
                    border: '1px solid transparent',
                    boxShadow: '0 0 16px rgba(16,185,129,0.35)',
                  } : {
                    background: 'rgba(255,255,255,0.05)',
                    color: '#94a3b8',
                    border: '1px solid rgba(255,255,255,0.09)',
                  }}
                >
                  {label}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Close */}
        <button
          onClick={onCancel}
          className="py-3 rounded-xl text-[10px] font-black text-slate-400 uppercase tracking-wider mt-4 md:mt-0 transition-all hover:text-white"
          style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
          onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.08)')}
          onMouseLeave={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.04)')}
        >
          Close
        </button>
      </div>

      {/* ── RIGHT PANEL ── */}
      <div className="flex-1 flex flex-col max-h-[70vh] md:max-h-none">
        <div
          className="p-6 md:p-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-2"
          style={{ background: 'rgba(0,0,0,0.2)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}
        >
          <h4 className="text-lg md:text-xl font-black italic uppercase text-white">
            {prefilledSlot ? 'Confirm Booking' : 'Available Slots'}
          </h4>
          {!prefilledSlot && (
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider px-3 py-1.5 rounded-full" style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)' }}>
              Mon–Fri
            </span>
          )}
        </div>

        <div className="flex-1 p-4 md:p-8 overflow-y-auto space-y-2 md:space-y-3" style={{ background: 'rgba(0,0,0,0.1)' }}>

          {prefilledSlot ? (
            <div>
              <div
                className="p-5 md:p-6 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-3 md:gap-0"
                style={{
                  background: selectedSlot ? 'rgba(16,185,129,0.1)' : 'rgba(255,255,255,0.04)',
                  border: `1px solid ${selectedSlot ? 'rgba(16,185,129,0.4)' : 'rgba(255,255,255,0.08)'}`,
                  boxShadow: selectedSlot ? '0 0 20px rgba(16,185,129,0.1)' : 'none',
                }}
              >
                <div className="flex items-center gap-4 md:gap-6">
                  <div
                    className="w-16 h-16 rounded-xl flex flex-col items-center justify-center text-white shrink-0"
                    style={{ background: 'linear-gradient(135deg, #10b981, #059669)', boxShadow: '0 0 20px rgba(16,185,129,0.35)' }}
                  >
                    <span className="text-[8px] font-black uppercase opacity-80 leading-none mb-0.5">{prefilledSlot.dayName.substring(0, 3)}</span>
                    <span className="text-base font-black leading-none">{prefilledSlot.time}</span>
                  </div>
                  <div>
                    <p className="text-base font-black text-white leading-none mb-1.5">{prefilledSlot.tutor.name}</p>
                    <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider">{prefilledSlot.tutor.subjects.join(' · ')}</span>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg" style={{ background: 'rgba(16,185,129,0.15)', border: '1px solid rgba(16,185,129,0.3)' }}>
                  <Check size={13} className="text-emerald-400" />
                  <span className="text-[9px] font-black text-emerald-300 uppercase">Slot Selected</span>
                </div>
              </div>

              {canConfirm && (
                <div className="mt-4 p-4 rounded-2xl" style={{ background: 'rgba(0,0,0,0.35)', border: '1px solid rgba(255,255,255,0.07)' }}>
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-wider mb-2">Booking Summary</p>
                  <p className="text-sm font-black text-white mb-1">{selectedStudent.name}</p>
                  <p className="text-[9px] font-bold text-slate-400 uppercase">{prefilledSlot.dayName} · {formatTime(prefilledSlot.time)} · {prefilledSlot.tutor.name}</p>
                  {recurring && (
                    <div className="flex items-center gap-1.5 mt-2 pt-2" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                      <Repeat size={10} className="text-emerald-400" />
                      <span className="text-[9px] font-black text-emerald-400 uppercase">Recurring · {recurringWeeks} weeks</span>
                    </div>
                  )}
                </div>
              )}

              <button
                disabled={!canConfirm}
                onClick={() => onConfirm({ student: selectedStudent, slot: prefilledSlot, recurring, recurringWeeks })}
                className="mt-4 w-full py-4 rounded-xl text-[11px] font-black uppercase tracking-wider transition-all active:scale-95"
                style={canConfirm ? {
                  background: 'linear-gradient(135deg, #10b981, #059669)',
                  color: 'white',
                  border: '1px solid transparent',
                  boxShadow: '0 0 20px rgba(16,185,129,0.4)',
                } : {
                  background: 'rgba(255,255,255,0.04)',
                  color: '#475569',
                  border: '1px solid rgba(255,255,255,0.06)',
                  cursor: 'not-allowed',
                }}
              >
                {canConfirm ? `Confirm Booking${recurring ? ` · ${recurringWeeks} weeks` : ''}` : 'Search & select a student first'}
              </button>
            </div>

          ) : (
            allAvailableSeats.length > 0 ? allAvailableSeats.map((slot, i) => {
              const isSelected = selectedSlot?.tutor.id === slot.tutor.id && selectedSlot?.dayName === slot.dayName && selectedSlot?.time === slot.time;
              return (
                <div
                  key={i}
                  onClick={() => setSelectedSlot(slot)}
                  className="p-4 md:p-5 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-3 md:gap-0 cursor-pointer transition-all"
                  style={{
                    background: isSelected ? 'rgba(16,185,129,0.1)' : 'rgba(255,255,255,0.03)',
                    border: `1px solid ${isSelected ? 'rgba(16,185,129,0.4)' : 'rgba(255,255,255,0.07)'}`,
                    boxShadow: isSelected ? '0 0 20px rgba(16,185,129,0.1)' : 'none',
                  }}
                  onMouseEnter={e => { if (!isSelected) { e.currentTarget.style.borderColor = 'rgba(16,185,129,0.2)'; e.currentTarget.style.background = 'rgba(16,185,129,0.04)'; }}}
                  onMouseLeave={e => { if (!isSelected) { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.07)'; e.currentTarget.style.background = 'rgba(255,255,255,0.03)'; }}}
                >
                  <div className="flex items-center gap-3 md:gap-5">
                    <div
                      className="w-14 h-14 md:w-16 md:h-16 rounded-xl flex flex-col items-center justify-center text-white shrink-0 transition-all"
                      style={isSelected ? {
                        background: 'linear-gradient(135deg, #10b981, #059669)', boxShadow: '0 0 16px rgba(16,185,129,0.4)',
                      } : {
                        background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.1)',
                      }}
                    >
                      <span className="text-[8px] md:text-[9px] font-black uppercase opacity-60 leading-none mb-0.5">{slot.dayName.substring(0, 3)}</span>
                      <span className="text-sm md:text-base font-black leading-none">{formatTime(slot.time)}</span>
                    </div>
                    <div>
                      <p className="text-sm md:text-base font-black text-white leading-none mb-1.5">{slot.tutor.name}</p>
                      <div className="flex items-center gap-2">
                        <span className="text-[9px] font-bold text-emerald-400 uppercase tracking-wider">{slot.seatsLeft} Seats</span>
                        <span className="text-[9px] text-slate-600">·</span>
                        <span className="text-[9px] font-bold text-slate-400 uppercase">{slot.tutor.subjects[0]}</span>
                      </div>
                    </div>
                  </div>
                  {isSelected ? (
                    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg" style={{ background: 'rgba(16,185,129,0.15)', border: '1px solid rgba(16,185,129,0.3)' }}>
                      <Check size={12} className="text-emerald-400" />
                      <span className="text-[9px] font-black text-emerald-300 uppercase">Selected</span>
                    </div>
                  ) : (
                    <div className="px-3 py-1.5 rounded-lg text-[9px] font-black text-slate-400 uppercase" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
                      Select
                    </div>
                  )}
                </div>
              );
            }) : (
              <div className="text-center py-16">
                <p className="text-slate-600 font-bold uppercase italic text-xs">No seats available.</p>
              </div>
            )
          )}

          {!prefilledSlot && selectedSlot && (
            <div className="sticky bottom-0 pt-3 pb-1" style={{ backdropFilter: 'blur(12px)' }}>
              {canConfirm ? (
                <div className="mb-2 p-3.5 rounded-xl flex items-center justify-between" style={{ background: 'rgba(6,14,24,0.97)', border: '1px solid rgba(255,255,255,0.08)' }}>
                  <div>
                    <p className="text-[9px] font-black text-slate-500 uppercase mb-0.5">Booking</p>
                    <p className="text-xs font-black text-white">{selectedStudent.name} · {selectedSlot.dayName} {formatTime(selectedSlot.time)}</p>
                    {recurring && (
                      <div className="flex items-center gap-1 mt-0.5">
                        <Repeat size={9} className="text-emerald-400" />
                        <span className="text-[8px] font-bold text-emerald-400 uppercase">{recurringWeeks} weeks</span>
                      </div>
                    )}
                  </div>
                  <button
                    onClick={() => onConfirm({ student: selectedStudent, slot: selectedSlot, recurring, recurringWeeks })}
                    className="px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-wider text-white transition-all active:scale-95"
                    style={{ background: 'linear-gradient(135deg, #10b981, #059669)', boxShadow: '0 0 16px rgba(16,185,129,0.4)' }}
                  >
                    Confirm
                  </button>
                </div>
              ) : (
                <div className="p-3 rounded-xl text-center" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}>
                  <p className="text-[9px] font-bold text-slate-400 uppercase">Search for a student above to confirm</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── BookingToast ─────────────────────────────────────────────────────────────

export interface BookingToastProps {
  data: BookingConfirmData;
  onClose: () => void;
}

export function BookingToast({ data, onClose }: BookingToastProps) {
  return (
    <div
      className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[60] px-5 py-4 rounded-2xl flex items-center gap-4 min-w-[300px]"
      style={{
        background: '#0c1422',
        border: '1px solid rgba(16,185,129,0.3)',
        boxShadow: '0 0 0 1px rgba(16,185,129,0.15), 0 20px 40px rgba(0,0,0,0.7), 0 0 30px rgba(16,185,129,0.12)',
      }}
    >
      <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0" style={{ background: '#10b981', boxShadow: '0 0 14px rgba(16,185,129,0.6)' }}>
        <Check size={16} className="text-white" strokeWidth={3} />
      </div>
      <div className="flex-1">
        <p className="text-sm font-black text-white leading-none mb-1">{data.student.name} booked!</p>
        <p className="text-[9px] font-bold text-slate-400 uppercase">
          {data.slot.dayName} · {formatTime(data.slot.time)} · {data.slot.tutor.name}
          {data.recurring ? ` · ${data.recurringWeeks}wk` : ''}
        </p>
      </div>
      <button onClick={onClose} className="text-slate-600 hover:text-white transition-colors ml-1"><X size={15} /></button>
    </div>
  );
}