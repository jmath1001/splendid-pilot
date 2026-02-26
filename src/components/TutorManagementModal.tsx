"use client"
import React, { useState } from 'react';
import { X, Plus, Trash2, Save, UserPlus, ChevronDown, ChevronUp, AlertTriangle } from 'lucide-react';
import { TIME_SLOTS, formatTime } from '@/components/constants';
import { supabase } from '@/lib/supabaseClient';
import type { Tutor } from '@/lib/useScheduleData';

// ─── Constants ────────────────────────────────────────────────────────────────

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];
const DAY_NUMS = [1, 2, 3, 4, 5];

const EMPTY_TUTOR: Omit<Tutor, 'id'> = {
  name: '',
  subjects: [],
  cat: 'math',
  availability: [],
  availabilityBlocks: [],
};

// ─── Helpers removed — blocks are now individual times ─────────────────────

// ─── Sub-components ───────────────────────────────────────────────────────────

function SubjectTags({ subjects, onChange }: { subjects: string[]; onChange: (s: string[]) => void }) {
  const [input, setInput] = useState('');

  const add = () => {
    const trimmed = input.trim();
    if (trimmed && !subjects.includes(trimmed)) {
      onChange([...subjects, trimmed]);
    }
    setInput('');
  };

  const remove = (s: string) => onChange(subjects.filter(x => x !== s));

  return (
    <div>
      <div className="flex flex-wrap gap-1.5 mb-2">
        {subjects.map(s => (
          <span key={s} className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-black uppercase" style={{ background: '#f1f5f9', color: '#475569', border: '1px solid #cbd5e1' }}>
            {s}
            <button onClick={() => remove(s)} className="ml-0.5 text-slate-400 hover:text-red-400 transition-colors"><X size={9} /></button>
          </span>
        ))}
        {subjects.length === 0 && <span className="text-[10px] text-slate-400 italic">No subjects yet</span>}
      </div>
      <div className="flex gap-2">
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && add()}
          placeholder="e.g. Calculus"
          className="flex-1 px-3 py-2 rounded-lg text-xs font-bold text-white placeholder-slate-600 focus:outline-none"
          style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)' }}
          onFocus={e => (e.currentTarget.style.borderColor = 'rgba(16,185,129,0.6)')}
          onBlur={e => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)')}
        />
        <button onClick={add} className="px-3 py-2 rounded-lg text-xs font-black text-white transition-all" style={{ background: 'rgba(16,185,129,0.2)', border: '1px solid rgba(16,185,129,0.35)' }}
          onMouseEnter={e => e.currentTarget.style.background = '#10b981'}
          onMouseLeave={e => e.currentTarget.style.background = 'rgba(16,185,129,0.2)'}
        >
          <Plus size={12} />
        </button>
      </div>
    </div>
  );
}

function AvailabilityEditor({
  availability,
  availabilityBlocks,
  onChange,
}: {
  availability: number[];
  availabilityBlocks: string[];
  onChange: (days: number[], blocks: string[]) => void;
}) {
  const toggleDay = (day: number) => {
    const next = availability.includes(day)
      ? availability.filter(d => d !== day)
      : [...availability, day].sort();
    onChange(next, availabilityBlocks);
  };

  const toggleTime = (time: string) => {
    const next = availabilityBlocks.includes(time)
      ? availabilityBlocks.filter(t => t !== time)
      : [...availabilityBlocks, time].sort();
    onChange(availability, next);
  };

  return (
    <div className="space-y-4">
      {/* Day toggles */}
      <div>
        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">Available Days</p>
        <div className="flex gap-2">
          {DAYS.map((label, i) => {
            const dayNum = DAY_NUMS[i];
            const active = availability.includes(dayNum);
            return (
              <button
                key={dayNum}
                onClick={() => toggleDay(dayNum)}
                className="flex-1 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all"
                style={active ? {
                  background: 'linear-gradient(135deg, #10b981, #059669)',
                  color: 'white',
                  border: '1px solid transparent',
                  boxShadow: '0 0 10px rgba(16,185,129,0.3)',
                } : {
                  background: 'rgba(255,255,255,0.04)',
                  color: '#64748b',
                  border: '1px solid rgba(255,255,255,0.08)',
                }}
              >
                {label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Time slot toggles */}
      <div>
        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">
          Available Times <span className="text-slate-600 normal-case font-bold">({availabilityBlocks.length} selected)</span>
        </p>
        <div className="flex flex-wrap gap-1.5">
          {TIME_SLOTS.map(time => {
            const active = availabilityBlocks.includes(time);
            return (
              <button
                key={time}
                onClick={() => toggleTime(time)}
                className="px-2.5 py-1.5 rounded-lg text-[10px] font-black transition-all"
                style={active ? {
                  background: 'linear-gradient(135deg, #10b981, #059669)',
                  color: 'white',
                  border: '1px solid transparent',
                  boxShadow: '0 0 8px rgba(16,185,129,0.3)',
                } : {
                  background: 'rgba(255,255,255,0.04)',
                  color: '#64748b',
                  border: '1px solid rgba(255,255,255,0.08)',
                }}
              >
                {formatTime(time)}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ─── Tutor Row (collapsed/expanded) ──────────────────────────────────────────

function TutorRow({
  tutor,
  onSave,
  onDelete,
}: {
  tutor: Tutor;
  onSave: (updated: Tutor) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}) {
  const [expanded, setExpanded] = useState(false);
  const [draft, setDraft] = useState<Tutor>(tutor);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [dirty, setDirty] = useState(false);

  const update = (patch: Partial<Tutor>) => {
    setDraft(prev => ({ ...prev, ...patch }));
    setDirty(true);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await onSave(draft);
      setDirty(false);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await onDelete(tutor.id);
    } finally {
      setDeleting(false);
      setConfirmDelete(false);
    }
  };

  return (
    <div className="rounded-2xl overflow-hidden transition-all" style={{ background: 'rgba(255,255,255,0.03)', border: `1px solid ${expanded ? 'rgba(16,185,129,0.3)' : 'rgba(255,255,255,0.08)'}` }}>
      {/* Header row */}
      <div
        className="flex items-center gap-3 p-4 cursor-pointer"
        onClick={() => setExpanded(e => !e)}
      >
        <div className="flex-1 min-w-0">
          <p className="text-sm font-black text-white truncate">{draft.name || <span className="text-slate-500 italic">Unnamed</span>}</p>
          <div className="flex items-center gap-2 mt-0.5">
            <span className="text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded" style={{ background: draft.cat === 'math' ? 'rgba(99,102,241,0.2)' : 'rgba(245,158,11,0.2)', color: draft.cat === 'math' ? '#a5b4fc' : '#fbbf24', border: `1px solid ${draft.cat === 'math' ? 'rgba(99,102,241,0.3)' : 'rgba(245,158,11,0.3)'}` }}>
              {draft.cat === 'math' ? 'Math / Sci' : 'English / Hist'}
            </span>
            <span className="text-[9px] text-slate-500">·</span>
            <span className="text-[9px] text-slate-400 font-bold">{draft.subjects.slice(0, 2).join(', ')}{draft.subjects.length > 2 ? ` +${draft.subjects.length - 2}` : ''}</span>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {dirty && <span className="text-[8px] font-black text-amber-400 uppercase px-2 py-0.5 rounded" style={{ background: 'rgba(245,158,11,0.15)', border: '1px solid rgba(245,158,11,0.3)' }}>Unsaved</span>}
          <div className="flex gap-1">
            {draft.availability.map(d => (
              <span key={d} className="w-5 h-5 rounded text-[8px] font-black flex items-center justify-center text-white" style={{ background: 'rgba(16,185,129,0.3)' }}>{DAYS[d-1]}</span>
            ))}
          </div>
          {expanded ? <ChevronUp size={14} className="text-slate-400" /> : <ChevronDown size={14} className="text-slate-400" />}
        </div>
      </div>

      {/* Expanded editor */}
      {expanded && (
        <div className="px-4 pb-4 space-y-5 border-t" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
          <div className="pt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Name */}
            <div>
              <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-2">Name</label>
              <input
                value={draft.name}
                onChange={e => update({ name: e.target.value })}
                placeholder="Tutor name"
                className="w-full px-3 py-2.5 rounded-xl text-sm font-bold text-white placeholder-slate-600 focus:outline-none"
                style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)' }}
                onFocus={e => (e.currentTarget.style.borderColor = 'rgba(16,185,129,0.6)')}
                onBlur={e => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)')}
              />
            </div>

            {/* Category */}
            <div>
              <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-2">Category</label>
              <div className="flex gap-2">
                {[{ key: 'math', label: 'Math / Sci' }, { key: 'english', label: 'English / Hist' }].map(({ key, label }) => (
                  <button key={key} onClick={() => update({ cat: key })}
                    className="flex-1 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all"
                    style={draft.cat === key ? {
                      background: 'linear-gradient(135deg, #10b981, #059669)', color: 'white', border: '1px solid transparent', boxShadow: '0 0 10px rgba(16,185,129,0.3)',
                    } : {
                      background: 'rgba(255,255,255,0.05)', color: '#64748b', border: '1px solid rgba(255,255,255,0.09)',
                    }}
                  >{label}</button>
                ))}
              </div>
            </div>
          </div>

          {/* Subjects */}
          <div>
            <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-2">Subjects</label>
            <SubjectTags subjects={draft.subjects} onChange={s => update({ subjects: s })} />
          </div>

          {/* Availability */}
          <AvailabilityEditor
            availability={draft.availability}
            availabilityBlocks={draft.availabilityBlocks}
            onChange={(days, blocks) => update({ availability: days, availabilityBlocks: blocks })}
          />

          {/* Action buttons */}
          <div className="flex items-center justify-between pt-2">
            {confirmDelete ? (
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold text-red-400">Are you sure?</span>
                <button onClick={handleDelete} disabled={deleting}
                  className="px-3 py-1.5 rounded-lg text-[10px] font-black text-white uppercase transition-all"
                  style={{ background: '#ef4444', border: 'none' }}
                >
                  {deleting ? 'Deleting…' : 'Yes, delete'}
                </button>
                <button onClick={() => setConfirmDelete(false)} className="px-3 py-1.5 rounded-lg text-[10px] font-black text-slate-400 uppercase" style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}>
                  Cancel
                </button>
              </div>
            ) : (
              <button onClick={() => setConfirmDelete(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-black text-red-400 uppercase transition-all"
                style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)' }}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(239,68,68,0.2)'}
                onMouseLeave={e => e.currentTarget.style.background = 'rgba(239,68,68,0.1)'}
              >
                <Trash2 size={11} /> Delete
              </button>
            )}

            <button onClick={handleSave} disabled={!dirty || saving}
              className="flex items-center gap-2 px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider text-white transition-all"
              style={dirty ? {
                background: 'linear-gradient(135deg, #10b981, #059669)',
                border: '1px solid transparent',
                boxShadow: '0 0 14px rgba(16,185,129,0.35)',
                cursor: 'pointer',
              } : {
                background: 'rgba(255,255,255,0.06)',
                border: '1px solid rgba(255,255,255,0.08)',
                color: '#475569',
                cursor: 'not-allowed',
              }}
            >
              <Save size={12} />
              {saving ? 'Saving…' : 'Save Changes'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Main Modal ───────────────────────────────────────────────────────────────

interface TutorManagementModalProps {
  tutors: Tutor[];
  onClose: () => void;
  onRefetch: () => void;
}

export function TutorManagementModal({ tutors, onClose, onRefetch }: TutorManagementModalProps) {
  const [adding, setAdding] = useState(false);
  const [newTutor, setNewTutor] = useState<Omit<Tutor, 'id'>>(EMPTY_TUTOR);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSave = async (updated: Tutor) => {
    setError(null);
    const { error } = await supabase
      .from('tutors')
      .update({
        name:                updated.name,
        subjects:            updated.subjects,
        cat:                 updated.cat,
        availability:        updated.availability,
        availability_blocks: updated.availabilityBlocks,
      })
      .eq('id', updated.id);

    if (error) { setError(error.message); return; }
    onRefetch();
  };

  const handleDelete = async (id: string) => {
    setError(null);
    const { error } = await supabase.from('tutors').delete().eq('id', id);
    if (error) { setError(error.message); return; }
    onRefetch();
  };

  const handleAddTutor = async () => {
    if (!newTutor.name.trim()) return;
    setSaving(true);
    setError(null);
    const { error } = await supabase.from('tutors').insert({
      name:                newTutor.name,
      subjects:            newTutor.subjects,
      cat:                 newTutor.cat,
      availability:        newTutor.availability,
      availability_blocks: newTutor.availabilityBlocks,
    });
    setSaving(false);
    if (error) { setError(error.message); return; }
    setNewTutor(EMPTY_TUTOR);
    setAdding(false);
    onRefetch();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(2,6,18,0.92)', backdropFilter: 'blur(20px)' }}
    >
      <div
        className="w-full max-w-2xl max-h-[90vh] rounded-3xl flex flex-col overflow-hidden"
        style={{
          background: '#0c1422',
          border: '1px solid rgba(255,255,255,0.1)',
          boxShadow: '0 0 0 1px rgba(16,185,129,0.15), 0 40px 80px rgba(0,0,0,0.7)',
        }}
      >
        {/* Accent */}
        <div className="h-0.5 w-full shrink-0" style={{ background: 'linear-gradient(90deg, transparent 0%, #10b981 40%, #06b6d4 70%, transparent 100%)' }} />

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 shrink-0" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <div>
            <h2 className="text-xl font-black italic uppercase tracking-tighter text-white leading-none">Manage Tutors</h2>
            <p className="text-[9px] font-bold text-emerald-400/70 uppercase tracking-widest mt-0.5">{tutors.length} tutors · availability &amp; schedule</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => { setAdding(true); setNewTutor(EMPTY_TUTOR); }}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider text-white transition-all"
              style={{ background: 'linear-gradient(135deg, #10b981, #059669)', boxShadow: '0 0 14px rgba(16,185,129,0.35)' }}
              onMouseEnter={e => e.currentTarget.style.boxShadow = '0 0 24px rgba(16,185,129,0.55)'}
              onMouseLeave={e => e.currentTarget.style.boxShadow = '0 0 14px rgba(16,185,129,0.35)'}
            >
              <UserPlus size={13} /> Add Tutor
            </button>
            <button onClick={onClose} className="w-8 h-8 rounded-full flex items-center justify-center text-slate-500 hover:text-white transition-colors" style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)' }}>
              <X size={15} />
            </button>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="mx-6 mt-4 p-3 rounded-xl flex items-center gap-2 shrink-0" style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)' }}>
            <AlertTriangle size={13} className="text-red-400 shrink-0" />
            <p className="text-xs font-bold text-red-400">{error}</p>
          </div>
        )}

        {/* Scrollable list */}
        <div className="flex-1 overflow-y-auto p-6 space-y-3">

          {/* Add new tutor form */}
          {adding && (
            <div className="rounded-2xl p-4 space-y-4" style={{ background: 'rgba(16,185,129,0.05)', border: '1px solid rgba(16,185,129,0.25)' }}>
              <p className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">New Tutor</p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-1.5">Name</label>
                  <input
                    value={newTutor.name}
                    onChange={e => setNewTutor(p => ({ ...p, name: e.target.value }))}
                    placeholder="Full name"
                    className="w-full px-3 py-2.5 rounded-xl text-sm font-bold text-white placeholder-slate-600 focus:outline-none"
                    style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)' }}
                    onFocus={e => (e.currentTarget.style.borderColor = 'rgba(16,185,129,0.6)')}
                    onBlur={e => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)')}
                  />
                </div>
                <div>
                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-1.5">Category</label>
                  <div className="flex gap-2">
                    {[{ key: 'math', label: 'Math / Sci' }, { key: 'english', label: 'English / Hist' }].map(({ key, label }) => (
                      <button key={key} onClick={() => setNewTutor(p => ({ ...p, cat: key }))}
                        className="flex-1 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all"
                        style={newTutor.cat === key ? {
                          background: 'linear-gradient(135deg, #10b981, #059669)', color: 'white', border: '1px solid transparent',
                        } : {
                          background: 'rgba(255,255,255,0.05)', color: '#64748b', border: '1px solid rgba(255,255,255,0.09)',
                        }}
                      >{label}</button>
                    ))}
                  </div>
                </div>
              </div>

              <div>
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-1.5">Subjects</label>
                <SubjectTags subjects={newTutor.subjects} onChange={s => setNewTutor(p => ({ ...p, subjects: s }))} />
              </div>

              <AvailabilityEditor
                availability={newTutor.availability}
                availabilityBlocks={newTutor.availabilityBlocks}
                onChange={(days, blocks) => setNewTutor(p => ({ ...p, availability: days, availabilityBlocks: blocks }))}
              />

              <div className="flex gap-2 pt-1">
                <button onClick={() => setAdding(false)} className="flex-1 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-wider text-slate-400 transition-all" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.09)' }}>
                  Cancel
                </button>
                <button onClick={handleAddTutor} disabled={!newTutor.name.trim() || saving}
                  className="flex-1 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-wider text-white transition-all"
                  style={newTutor.name.trim() ? {
                    background: 'linear-gradient(135deg, #10b981, #059669)', border: '1px solid transparent', boxShadow: '0 0 14px rgba(16,185,129,0.35)', cursor: 'pointer',
                  } : {
                    background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', color: '#475569', cursor: 'not-allowed',
                  }}
                >
                  {saving ? 'Adding…' : 'Add Tutor'}
                </button>
              </div>
            </div>
          )}

          {/* Existing tutors */}
          {tutors.length === 0 && !adding ? (
            <div className="text-center py-16">
              <p className="text-slate-600 font-bold uppercase italic text-xs">No tutors yet — add one above</p>
            </div>
          ) : (
            tutors.map(tutor => (
              <TutorRow key={tutor.id} tutor={tutor} onSave={handleSave} onDelete={handleDelete} />
            ))
          )}
        </div>
      </div>
    </div>
  );
}