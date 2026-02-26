"use client"
import React, { useState } from 'react';
import { X, Plus, Trash2, Save, UserPlus, ChevronDown, ChevronUp, AlertTriangle } from 'lucide-react';
import { TIME_SLOTS, formatTime } from '@/components/constants';
import { supabase } from '@/lib/supabaseClient';
import type { Tutor } from '@/lib/useScheduleData';

// ─── Adjusted Constants (Monday=1, Sunday=7) ──────────────────────────────────

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const DAY_NUMS = [1, 2, 3, 4, 5, 6, 7]; 

const EMPTY_TUTOR: Omit<Tutor, 'id'> = {
  name: '',
  subjects: [],
  cat: 'math',
  availability: [],
  availabilityBlocks: [],
};

// ─── Availability Grid Component ──────────────────────────────────────────────

function AvailabilityGrid({ blocks, onChange }: { blocks: string[]; onChange: (b: string[]) => void }) {
  const toggle = (d: number, t: string) => {
    const key = `${d}-${t}`;
    const next = blocks.includes(key) ? blocks.filter(b => b !== key) : [...blocks, key];
    onChange(next);
  };

  return (
    <div className="space-y-2">
      <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Weekly Schedule (Mon-Sun)</p>
      <div className="overflow-x-auto rounded-xl border border-white/5 bg-black/20">
        <div className="inline-grid grid-cols-[55px_repeat(7,1fr)] gap-px bg-white/5 min-w-[580px]">
          <div className="bg-[#0c1422]" />
          {DAYS.map(d => (
            <div key={d} className="bg-[#0c1422] p-2 text-center text-[9px] font-black text-slate-400 uppercase border-b border-white/5">
              {d}
            </div>
          ))}
          {TIME_SLOTS.map(t => (
            <React.Fragment key={t}>
              <div className="bg-[#0c1422] p-1 flex items-center justify-end pr-2 text-[8px] font-bold text-slate-600">
                {formatTime(t)}
              </div>
              {DAY_NUMS.map(dn => {
                const active = blocks.includes(`${dn}-${t}`);
                return (
                  <button 
                    key={`${dn}-${t}`} 
                    type="button"
                    onClick={() => toggle(dn, t)} 
                    className={`h-8 transition-all border-[0.5px] border-white/5 ${active ? 'bg-emerald-500 shadow-[inset_0_0_8px_rgba(0,0,0,0.2)]' : 'bg-[#0c1422] hover:bg-white/5'}`} 
                  />
                );
              })}
            </React.Fragment>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Tutor Row ───────────────────────────────────────────────────────────────

function TutorRow({ tutor, onSave, onDelete }: { tutor: Tutor; onSave: (u: Tutor) => Promise<void>; onDelete: (id: string) => Promise<void> }) {
  const [expanded, setExpanded] = useState(false);
  const [draft, setDraft] = useState<Tutor>(tutor);
  const [saving, setSaving] = useState(false);
  const [confirm, setConfirm] = useState(false);
  
  const dirty = JSON.stringify(tutor.availabilityBlocks) !== JSON.stringify(draft.availabilityBlocks) || 
                tutor.name !== draft.name || 
                tutor.cat !== draft.cat ||
                JSON.stringify(tutor.subjects) !== JSON.stringify(draft.subjects);

  return (
    <div className={`rounded-2xl border transition-all ${expanded ? 'border-emerald-500/30 bg-emerald-500/5' : 'border-white/5 bg-white/5'}`}>
      <div className="p-4 flex items-center gap-3 cursor-pointer" onClick={() => setExpanded(!expanded)}>
        <div className="flex-1">
          <p className="text-sm font-black text-white">{draft.name || 'Unnamed'}</p>
          <div className="flex gap-2 mt-1">
             <span className="text-[8px] font-black text-emerald-400 uppercase tracking-tighter px-1.5 py-0.5 rounded bg-emerald-400/10 border border-emerald-400/20">{draft.cat}</span>
             <span className="text-[8px] font-bold text-slate-500 truncate max-w-[200px]">{draft.subjects.join(', ')}</span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {dirty && <span className="text-[8px] font-black text-amber-500 bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/20 italic">MODIFIED</span>}
          {expanded ? <ChevronUp size={14} className="text-slate-500" /> : <ChevronDown size={14} className="text-slate-500" />}
        </div>
      </div>

      {expanded && (
        <div className="px-4 pb-4 space-y-4 border-t border-white/5 pt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="space-y-1">
               <label className="text-[8px] font-black text-slate-500 uppercase ml-1">Tutor Name</label>
               <input value={draft.name} onChange={e => setDraft({...draft, name: e.target.value})} className="w-full bg-white/5 border border-white/10 p-2.5 rounded-xl text-sm text-white focus:outline-none focus:border-emerald-500" />
            </div>
            <div className="space-y-1">
               <label className="text-[8px] font-black text-slate-500 uppercase ml-1">Category</label>
               <div className="flex gap-2 h-[42px]">
                {['math', 'english'].map(c => (
                  <button key={c} onClick={() => setDraft({...draft, cat: c as any})} className={`flex-1 rounded-xl text-[9px] font-black uppercase border transition-all ${draft.cat === c ? 'bg-emerald-500 border-transparent text-white' : 'bg-white/5 border-white/10 text-slate-500'}`}>
                    {c === 'math' ? 'Math/Sci' : 'Eng/Hist'}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <AvailabilityGrid 
            blocks={draft.availabilityBlocks} 
            onChange={b => setDraft({
              ...draft, 
              availabilityBlocks: b, 
              availability: Array.from(new Set(b.map(x => parseInt(x.split('-')[0])))).sort((a,b) => a-b)
            })} 
          />

          <div className="flex justify-between items-center pt-2">
            <button onClick={() => confirm ? onDelete(tutor.id) : setConfirm(true)} className="text-[10px] font-black uppercase text-red-400 hover:text-red-300 flex items-center gap-1">
              <Trash2 size={12} /> {confirm ? "Click to Confirm" : "Delete Tutor"}
            </button>
            <button 
              disabled={!dirty || saving} 
              onClick={async () => { setSaving(true); await onSave(draft); setSaving(false); }} 
              className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase transition-all ${dirty ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20' : 'bg-white/10 text-slate-600 cursor-not-allowed'}`}
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Main Modal ───────────────────────────────────────────────────────────────

export function TutorManagementModal({ tutors, onClose, onRefetch }: { tutors: Tutor[]; onClose: () => void; onRefetch: () => void }) {
  const [adding, setAdding] = useState(false);
  const [newTutor, setNewTutor] = useState<Omit<Tutor, 'id'>>(EMPTY_TUTOR);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSave = async (updated: Tutor) => {
    setError(null);
    const { error } = await supabase.from('tutors').update({
      name: updated.name,
      subjects: updated.subjects,
      cat: updated.cat,
      availability: updated.availability,
      availability_blocks: updated.availabilityBlocks,
    }).eq('id', updated.id);
    if (error) setError(error.message); else onRefetch();
  };

  const handleAdd = async () => {
    if (!newTutor.name.trim()) return;
    setSaving(true);
    setError(null);

    const { error } = await supabase.from('tutors').insert([{
      name: newTutor.name,
      subjects: newTutor.subjects,
      cat: newTutor.cat,
      availability: newTutor.availability,
      availability_blocks: newTutor.availabilityBlocks,
    }]);

    setSaving(false);
    if (error) {
        setError(error.message);
    } else {
        setAdding(false);
        setNewTutor(EMPTY_TUTOR);
        onRefetch();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-md p-4 overflow-hidden">
      <div className="w-full max-w-3xl max-h-[92vh] bg-[#0c1422] border border-white/10 rounded-[2.5rem] flex flex-col shadow-2xl relative">
        {/* Header */}
        <div className="p-7 border-b border-white/5 flex justify-between items-center bg-white/[0.02]">
          <div>
            <h2 className="text-2xl font-black italic uppercase text-white tracking-tighter leading-none">Staff Database</h2>
            <p className="text-[10px] font-bold text-emerald-400 uppercase tracking-[0.2em] mt-1.5">{tutors.length} Active Tutors</p>
          </div>
          <div className="flex gap-3">
            {!adding && (
              <button onClick={() => setAdding(true)} className="bg-emerald-500 text-white px-5 py-2.5 rounded-2xl text-[10px] font-black uppercase flex items-center gap-2 shadow-lg shadow-emerald-500/20 active:scale-95 transition-all">
                <UserPlus size={14} /> New Tutor
              </button>
            )}
            <button onClick={onClose} className="w-10 h-10 flex items-center justify-center rounded-full bg-white/5 text-slate-400 hover:text-white border border-white/10 transition-colors">
              <X size={18} />
            </button>
          </div>
        </div>

        {/* List Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar">
          {error && <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-400 text-xs font-black flex items-center gap-2 uppercase tracking-tight"><AlertTriangle size={16} /> {error}</div>}
          
          {adding && (
            <div className="p-6 bg-emerald-500/[0.03] border border-emerald-500/20 rounded-[2rem] space-y-5 animate-in slide-in-from-top-2 duration-300">
              <div className="flex justify-between items-center"><p className="text-xs font-black text-emerald-500 uppercase italic">Registration</p></div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input value={newTutor.name} onChange={e => setNewTutor({...newTutor, name: e.target.value})} className="bg-black/20 border border-white/10 p-3.5 rounded-2xl text-white focus:outline-none focus:border-emerald-500" placeholder="Full Name" />
                <div className="flex gap-2">
                  {['math', 'english'].map(c => (
                    <button key={c} onClick={() => setNewTutor({...newTutor, cat: c as any})} className={`flex-1 rounded-2xl text-[10px] font-black uppercase border transition-all ${newTutor.cat === c ? 'bg-emerald-500 border-transparent text-white' : 'bg-white/5 border-white/10 text-slate-500'}`}>{c === 'math' ? 'Math/Sci' : 'Eng/Hist'}</button>
                  ))}
                </div>
              </div>
              <AvailabilityGrid 
                blocks={newTutor.availabilityBlocks} 
                onChange={b => setNewTutor({
                  ...newTutor, 
                  availabilityBlocks: b,
                  availability: Array.from(new Set(b.map(x => parseInt(x.split('-')[0])))).sort((a,b) => a-b)
                })} 
              />
              <div className="flex gap-3">
                <button onClick={() => setAdding(false)} className="flex-1 p-3.5 rounded-2xl bg-white/5 text-slate-500 text-[10px] font-black uppercase border border-white/5 hover:bg-white/10 transition-all">Discard</button>
                <button onClick={handleAdd} disabled={saving || !newTutor.name} className="flex-[2] p-3.5 rounded-2xl bg-emerald-500 text-white text-[10px] font-black uppercase shadow-lg shadow-emerald-500/30 active:scale-95 transition-all">{saving ? 'Processing...' : 'Add to Database'}</button>
              </div>
            </div>
          )}

          {tutors.map(t => <TutorRow key={t.id} tutor={t} onSave={handleSave} onDelete={async (id) => { await supabase.from('tutors').delete().eq('id', id); onRefetch(); }} />)}
          
          {tutors.length === 0 && !adding && (
            <div className="py-20 text-center opacity-20">
               <p className="text-sm font-black uppercase tracking-widest text-white">No Tutors Found</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}