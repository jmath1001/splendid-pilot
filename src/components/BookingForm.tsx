"use client"
import React, { useState, useMemo } from 'react';
import { Search, X, Repeat, Check, PlusCircle, Users } from "lucide-react";

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
  subject: string;
}

export interface BookingFormProps {
  prefilledSlot?: PrefilledSlot | null;
  onConfirm: (data: BookingConfirmData) => void;
  onCancel: () => void;
  enrollCat: string;
  setEnrollCat: (c: string) => void;
  allAvailableSeats: any[];
  studentDatabase: any[];
  sessions?: any[]; // to detect who's already scheduled this week
}

// ─── StudentRow ──────────────────────────────────────────────────────────────

function StudentRow({ student, selected, onSelect, isUnassigned }: {
  student: any;
  selected: boolean;
  onSelect: (s: any) => void;
  isUnassigned?: boolean;
}) {
  return (
    <button
      onClick={() => onSelect(student)}
      className="w-full p-2.5 text-left transition-all flex items-center gap-2.5"
      style={{
        borderBottom: '1px solid #f0ece8',
        background: selected ? '#ede9fe' : 'transparent',
      }}
      onMouseEnter={e => { if (!selected) e.currentTarget.style.background = '#faf9f7'; }}
      onMouseLeave={e => { if (!selected) e.currentTarget.style.background = 'transparent'; }}
    >
      <div className="w-7 h-7 rounded-full flex items-center justify-center shrink-0 text-xs font-semibold" style={{ background: selected ? '#6d28d9' : '#f0ece8', color: selected ? 'white' : '#78716c' }}>
        {student.name.charAt(0)}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5">
          <p className="text-sm font-medium leading-none truncate" style={{ color: '#1c1917' }}>{student.name}</p>
          {isUnassigned && (
            <span className="shrink-0 text-[9px] font-medium px-1.5 py-0.5 rounded-full" style={{ background: '#fef3c7', color: '#92400e', border: '1px solid #fcd34d' }}>New</span>
          )}
        </div>
        <p className="text-xs mt-0.5" style={{ color: '#a8a29e' }}>{student.subject}</p>
      </div>
      {selected && <Check size={12} style={{ color: '#6d28d9' }} strokeWidth={2.5} className="shrink-0" />}
    </button>
  );
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
  sessions = [],
}: BookingFormProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStudent, setSelectedStudent] = useState<any>(null);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [studentMode, setStudentMode] = useState<'search' | 'all'>('search');
  const [subject, setSubject] = useState('');
  const [recurring, setRecurring] = useState(false);
  const [recurringWeeks, setRecurringWeeks] = useState(4);
  const [selectedSlot, setSelectedSlot] = useState<any>(prefilledSlot || null);

  const filteredStudents = useMemo(() => {
    if (!searchQuery.trim()) return studentDatabase.slice(0, 8);
    return studentDatabase.filter(student =>
      student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.subject.toLowerCase().includes(searchQuery.toLowerCase())
    ).slice(0, 8);
  }, [searchQuery, studentDatabase]);

  // Student IDs that already have at least one session this week
  const assignedStudentIds = useMemo(() => {
    const ids = new Set<string>();
    sessions.forEach((session: any) => {
      session.students?.forEach((s: any) => ids.add(s.id));
    });
    return ids;
  }, [sessions]);

  const selectStudent = (student: any) => {
    setSelectedStudent(student);
    setSearchQuery(student.name);
    setSubject(student.subject || '');
    setShowSuggestions(false);
  };

  const canConfirm = selectedStudent && selectedSlot;

  return (
    <div
      className="w-full max-w-4xl rounded-2xl flex flex-col md:flex-row overflow-hidden"
      style={{
        background: 'white',
        border: '1px solid #e7e3dd',
        boxShadow: '0 20px 60px rgba(0,0,0,0.15)',
        maxHeight: '90vh',
      }}
    >
      {/* ── LEFT PANEL ── */}
      <div
        className="w-full md:w-64 p-5 md:p-6 flex flex-col justify-between border-b md:border-b-0 md:border-r overflow-y-auto"
        style={{ background: '#faf9f7', borderColor: '#e7e3dd', minWidth: 240 }}
      >
        <div>
          {/* Title */}
          <h3 className="text-xl font-bold tracking-tight mb-0.5" style={{ color: '#1c1917' }}>Book Session</h3>
          <p className="text-xs mb-5" style={{ color: '#a8a29e' }}>Schedule a student</p>

          {/* Prefilled slot badge */}
          {prefilledSlot && (
            <div className="mb-4 p-3 rounded-xl" style={{ background: '#ede9fe', border: '1px solid #c4b5fd' }}>
              <p className="text-[9px] font-semibold uppercase tracking-wider mb-1" style={{ color: '#7c3aed' }}>Slot</p>
              <p className="text-sm font-semibold leading-none mb-1" style={{ color: '#1c1917' }}>{prefilledSlot.tutor.name}</p>
              <p className="text-xs" style={{ color: '#6d28d9' }}>{prefilledSlot.dayName} · {new Date(prefilledSlot.date + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} · {formatTime(prefilledSlot.time)}</p>
            </div>
          )}

          {/* Student picker — tabs: Search / All */}
          <div className="mb-5">
            {/* Tab row */}
            <div className="flex gap-1.5 mb-3">
              {([['search', 'Search'], ['all', 'All Students']] as const).map(([mode, label]) => (
                <button
                  key={mode}
                  onClick={() => setStudentMode(mode)}
                  className="flex-1 py-2 rounded-lg text-[9px] font-black uppercase tracking-wider transition-all"
                  style={studentMode === mode ? {
                    background: '#6d28d9', color: 'white', border: '1px solid #6d28d9',
                  } : {
                    background: 'white', color: '#78716c', border: '1px solid #e7e3dd',
                  }}
                >{label}</button>
              ))}
            </div>

            {studentMode === 'search' ? (
              /* ── Search mode ── */
              <div className="relative">
                <div className="relative">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={e => { setSearchQuery(e.target.value); if (!e.target.value) setSelectedStudent(null); }}
                    placeholder="Name or subject..."
                    className="w-full py-2.5 px-4 rounded-xl text-sm focus:outline-none"
                    style={{ background: 'white', border: '1px solid #e7e3dd', color: '#1c1917' }}
                    onFocus={e => e.currentTarget.style.borderColor = '#6d28d9'}
                    onBlur={e => e.currentTarget.style.borderColor = '#e7e3dd'}
                  />
                  <Search size={14} className="absolute right-3 top-3 text-slate-500" />
                </div>
                {filteredStudents.length > 0 && (
                  <div className="mt-1.5 rounded-xl overflow-hidden" style={{ background: 'white', border: '1px solid #e7e3dd', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}>
                    {filteredStudents.map(student => (
                      <StudentRow key={student.id} student={student} selected={selectedStudent?.id === student.id} onSelect={selectStudent} isUnassigned={!assignedStudentIds.has(student.id)} />
                    ))}
                  </div>
                )}
                {searchQuery && filteredStudents.length === 0 && (
                  <p className="text-xs italic mt-2 text-center" style={{ color: '#a8a29e' }}>No students found</p>
                )}
              </div>
            ) : (
              /* ── All Students mode ── */
              <div className="rounded-xl overflow-hidden max-h-[240px] overflow-y-auto" style={{ background: 'white', border: '1px solid #e7e3dd' }}>
                {studentDatabase.length === 0 ? (
                  <p className="text-xs italic p-4 text-center" style={{ color: '#a8a29e' }}>No students in database</p>
                ) : studentDatabase
                  .sort((a, b) => {
                    // Unscheduled first
                    const aU = !assignedStudentIds.has(a.id);
                    const bU = !assignedStudentIds.has(b.id);
                    if (aU && !bU) return -1;
                    if (!aU && bU) return 1;
                    return a.name.localeCompare(b.name);
                  })
                  .map(student => (
                  <StudentRow key={student.id} student={student} selected={selectedStudent?.id === student.id} onSelect={selectStudent} isUnassigned={!assignedStudentIds.has(student.id)} />
                ))}
              </div>
            )}
          </div>

          {/* Selected student confirmation */}
          {selectedStudent && (
            <div className="mb-4 p-3 rounded-xl" style={{ background: '#d1fae5', border: '1px solid #6ee7b7' }}>
              <div className="flex items-center gap-1.5 mb-1">
                <Check size={11} style={{ color: '#059669' }} strokeWidth={3} />
                <p className="text-[10px] font-semibold" style={{ color: '#059669' }}>Selected</p>
              </div>
              <p className="text-sm font-semibold" style={{ color: '#1c1917' }}>{selectedStudent.name}</p>
              <p className="text-xs" style={{ color: '#64748b' }}>{selectedStudent.subject}</p>
            </div>
          )}

          {/* Subject input */}
          {selectedStudent && (
            <div className="mb-5">
              <label className="text-xs font-medium mb-1.5 block" style={{ color: '#78716c' }}>Topic / Subject</label>
              <input
                value={subject}
                onChange={e => setSubject(e.target.value)}
                placeholder="e.g. Calculus, Essay Writing..."
                className="w-full py-2.5 px-3 rounded-xl text-sm focus:outline-none"
                style={{ background: 'white', border: '1px solid #e7e3dd', color: '#1c1917' }}
                onFocus={e => e.currentTarget.style.borderColor = '#6d28d9'}
                onBlur={e => e.currentTarget.style.borderColor = '#e7e3dd'}
              />
            </div>
          )}

          {/* Recurring toggle */}
          <div className="mb-4 p-3.5 rounded-xl" style={{ background: 'white', border: '1px solid #e7e3dd' }}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Repeat size={13} style={{ color: recurring ? '#6d28d9' : '#a8a29e' }} />
                <span className="text-sm font-medium" style={{ color: '#1c1917' }}>Recurring</span>
              </div>
              <button onClick={() => setRecurring(!recurring)}
                className="relative w-9 h-5 rounded-full transition-all"
                style={{ background: recurring ? '#6d28d9' : '#e7e3dd' }}
              >
                <span className="absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform"
                  style={{ transform: recurring ? 'translateX(16px)' : 'translateX(0)' }}
                />
              </button>
            </div>
            {recurring && (
              <div className="mt-3">
                <p className="text-xs font-medium mb-2" style={{ color: '#78716c' }}>Repeat for</p>
                <div className="flex gap-1.5">
                  {[2, 4, 6, 8].map(w => (
                    <button key={w} onClick={() => setRecurringWeeks(w)}
                      className="flex-1 py-1.5 rounded-lg text-xs font-semibold transition-all"
                      style={recurringWeeks === w ? {
                        background: '#6d28d9', color: 'white', border: '1px solid #6d28d9',
                      } : {
                        background: '#f9f7f4', color: '#78716c', border: '1px solid #e7e3dd',
                      }}
                    >{w}wk</button>
                  ))}
                </div>
                <p className="text-xs mt-2" style={{ color: '#a8a29e' }}>
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
                  className="flex-1 py-2.5 px-3 rounded-xl text-xs font-semibold transition-all"
                  style={enrollCat === key ? {
                    background: '#6d28d9', color: 'white', border: '1px solid #6d28d9',
                  } : {
                    background: 'white', color: '#78716c', border: '1px solid #e7e3dd',
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
          className="py-2.5 rounded-xl text-xs font-medium mt-3 md:mt-0 transition-all"
          style={{ background: '#f9f7f4', color: '#78716c', border: '1px solid #e7e3dd' }}
          onMouseEnter={e => e.currentTarget.style.background = '#f0ece8'}
          onMouseLeave={e => e.currentTarget.style.background = '#f9f7f4'}
        >
          Close
        </button>
      </div>

      {/* ── RIGHT PANEL ── */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="px-5 py-4 flex items-center justify-between" style={{ borderBottom: '1px solid #f0ece8' }}>
          <h4 className="text-base font-semibold" style={{ color: '#1c1917' }}>
            {prefilledSlot ? 'Confirm Booking' : 'Available Slots'}
          </h4>
          {!prefilledSlot && (
            <span className="text-xs px-2.5 py-1 rounded-full" style={{ background: '#f9f7f4', color: '#a8a29e', border: '1px solid #e7e3dd' }}>
              Mon–Fri
            </span>
          )}
        </div>

        <div className="flex-1 p-4 overflow-y-auto space-y-2" style={{ background: 'white' }}>

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
                <div className="flex items-center gap-3">
                  <div className="w-14 h-14 rounded-xl flex flex-col items-center justify-center shrink-0" style={{ background: '#ede9fe', border: '1px solid #c4b5fd' }}>
                    <span className="text-[9px] font-semibold leading-none mb-0.5" style={{ color: '#7c3aed' }}>{prefilledSlot.dayName.substring(0, 3)}</span>
                    <span className="text-sm font-bold leading-none" style={{ color: '#6d28d9' }}>{formatTime(prefilledSlot.time).replace(' AM','a').replace(' PM','p')}</span>
                  </div>
                  <div>
                    <p className="text-sm font-semibold leading-none mb-1" style={{ color: '#1c1917' }}>{prefilledSlot.tutor.name}</p>
                    <span className="text-xs" style={{ color: '#a8a29e' }}>{prefilledSlot.tutor.subjects.join(' · ')}</span>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg" style={{ background: '#d1fae5', border: '1px solid #6ee7b7' }}>
                  <Check size={12} style={{ color: '#059669' }} strokeWidth={3} />
                  <span className="text-xs font-semibold" style={{ color: '#065f46' }}>Ready</span>
                </div>
              </div>

              {canConfirm && (
                <div className="mt-3 p-3.5 rounded-xl" style={{ background: '#f9f7f4', border: '1px solid #e7e3dd' }}>
                  <p className="text-xs font-medium mb-1.5" style={{ color: '#a8a29e' }}>Summary</p>
                  <p className="text-sm font-semibold mb-0.5" style={{ color: '#1c1917' }}>{selectedStudent.name}</p>
                  <p className="text-xs" style={{ color: '#78716c' }}>{prefilledSlot.dayName} · {formatTime(prefilledSlot.time)} · {prefilledSlot.tutor.name}</p>
                  {recurring && (
                    <div className="flex items-center gap-1.5 mt-2 pt-2" style={{ borderTop: '1px solid #e7e3dd' }}>
                      <Repeat size={10} style={{ color: '#6d28d9' }} />
                      <span className="text-xs font-medium" style={{ color: '#6d28d9' }}>Recurring · {recurringWeeks} weeks</span>
                    </div>
                  )}
                </div>
              )}

              <button
                disabled={!canConfirm}
                onClick={() => onConfirm({ student: selectedStudent, slot: prefilledSlot, recurring, recurringWeeks, subject: subject || selectedStudent.subject })}
                className="mt-3 w-full py-3 rounded-xl text-sm font-semibold transition-all active:scale-95"
                style={canConfirm ? {
                  background: '#6d28d9', color: 'white', border: '1px solid #6d28d9',
                  boxShadow: '0 2px 8px rgba(109,40,217,0.3)',
                } : {
                  background: '#f9f7f4', color: '#c4b9b2', border: '1px solid #e7e3dd', cursor: 'not-allowed',
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
                    background: isSelected ? '#ede9fe' : 'white',
                    border: `1px solid ${isSelected ? '#c4b5fd' : '#f0ece8'}`,
                  }}
                  onMouseEnter={e => { if (!isSelected) { e.currentTarget.style.borderColor = '#c4b5fd'; e.currentTarget.style.background = '#faf9ff'; }}}
                  onMouseLeave={e => { if (!isSelected) { e.currentTarget.style.borderColor = '#f0ece8'; e.currentTarget.style.background = 'white'; }}}
                >
                  <div className="flex items-center gap-3 md:gap-5">
                    <div
                      className="w-14 h-14 md:w-16 md:h-16 rounded-xl flex flex-col items-center justify-center text-white shrink-0 transition-all"
                      style={isSelected ? {
                        background: '#6d28d9',
                      } : {
                        background: '#f9f7f4', border: '1px solid #e7e3dd',
                      }}
                    >
                      <span className="text-[9px] font-semibold leading-none mb-0.5" style={{ color: isSelected ? 'rgba(255,255,255,0.7)' : '#a8a29e' }}>{slot.dayName.substring(0, 3)}</span>
                      <span className="text-sm font-bold leading-none" style={{ color: isSelected ? 'white' : '#1c1917' }}>{formatTime(slot.time).replace(' AM','a').replace(' PM','p')}</span>
                    </div>
                    <div>
                      <p className="text-sm font-semibold leading-none mb-1" style={{ color: '#1c1917' }}>{slot.tutor.name}</p>
                      <p className="text-xs" style={{ color: '#a8a29e' }}>{slot.tutor.subjects[0]}</p>
                    </div>
                  </div>
                  {isSelected ? (
                    <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg" style={{ background: '#d1fae5', border: '1px solid #6ee7b7' }}>
                      <Check size={11} style={{ color: '#059669' }} strokeWidth={3} />
                      <span className="text-xs font-semibold" style={{ color: '#065f46' }}>Selected</span>
                    </div>
                  ) : (
                    <div className="px-2.5 py-1.5 rounded-lg text-xs font-medium" style={{ background: '#f9f7f4', color: '#a8a29e', border: '1px solid #e7e3dd' }}>
                      Select
                    </div>
                  )}
                </div>
              );
            }) : (
              <div className="text-center py-12">
                <p className="text-sm italic" style={{ color: '#c4b9b2' }}>No open slots this week</p>
              </div>
            )
          )}

          {!prefilledSlot && selectedSlot && (
            <div className="sticky bottom-0 pt-3 pb-1" style={{ backdropFilter: 'blur(12px)' }}>
              {canConfirm ? (
                <div className="mb-2 p-3.5 rounded-xl flex items-center justify-between" style={{ background: 'white', border: '1px solid #e7e3dd', boxShadow: '0 -4px 16px rgba(0,0,0,0.06)' }}>
                  <div>
                    <p className="text-xs font-medium mb-0.5" style={{ color: '#a8a29e' }}>Booking</p>
                    <p className="text-sm font-semibold" style={{ color: '#1c1917' }}>{selectedStudent.name} · {selectedSlot.dayName} {formatTime(selectedSlot.time)}</p>
                    {recurring && (
                      <div className="flex items-center gap-1 mt-0.5">
                        <Repeat size={9} style={{ color: '#6d28d9' }} />
                        <span className="text-xs" style={{ color: '#6d28d9' }}>{recurringWeeks} weeks</span>
                      </div>
                    )}
                  </div>
                  <button
                    onClick={() => onConfirm({ student: selectedStudent, slot: selectedSlot, recurring, recurringWeeks, subject: subject || selectedStudent.subject })}
                    className="px-4 py-2.5 rounded-xl text-sm font-semibold text-white transition-all active:scale-95"
                    style={{ background: '#6d28d9', boxShadow: '0 2px 8px rgba(109,40,217,0.3)' }}
                    onMouseEnter={e => e.currentTarget.style.background = '#5b21b6'}
                    onMouseLeave={e => e.currentTarget.style.background = '#6d28d9'}
                  >
                    Confirm
                  </button>
                </div>
              ) : (
                <div className="p-3 rounded-xl text-center" style={{ background: '#f9f7f4', border: '1px solid #e7e3dd' }}>
                  <p className="text-xs" style={{ color: '#a8a29e' }}>Select a student to confirm</p>
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
      className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[60] px-4 py-3.5 rounded-xl flex items-center gap-3 min-w-[280px]"
      style={{
        background: 'white',
        border: '1px solid #e7e3dd',
        boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
      }}
    >
      <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0" style={{ background: '#d1fae5' }}>
        <Check size={15} style={{ color: '#059669' }} strokeWidth={3} />
      </div>
      <div className="flex-1">
        <p className="text-sm font-semibold leading-none mb-0.5" style={{ color: '#1c1917' }}>{data.student.name} booked</p>
        <p className="text-xs" style={{ color: '#a8a29e' }}>
          {data.slot.dayName} · {formatTime(data.slot.time)} · {data.slot.tutor.name}
          {data.recurring ? ` · ${data.recurringWeeks}wk` : ''}
        </p>
      </div>
      <button onClick={onClose} className="transition-colors ml-1" style={{ color: '#c4b9b2' }} onMouseEnter={e => (e.currentTarget as any).style.color='#78716c'} onMouseLeave={e => (e.currentTarget as any).style.color='#c4b9b2'}><X size={14} /></button>
    </div>
  );
}