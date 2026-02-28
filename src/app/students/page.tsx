"use client"
import React, { useState, useEffect, useCallback } from 'react';
import { Plus, ChevronDown, Trash2, GraduationCap, Loader2, Save, X, Search } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';

// ─── CONFIG ───────────────────────────────────────────────────────────────────

const SESSION_CONFIG = [
  { id: 'S1', label: 'Session 1', time: '3:00 – 4:30 PM' },
  { id: 'S2', label: 'Session 2', time: '4:30 – 6:00 PM' },
  { id: 'S3', label: 'Session 3', time: '6:00 – 7:30 PM' },
  { id: 'S4', label: 'Session 4', time: '7:30 – 9:00 PM' },
];

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const DAY_NUMS = [1, 2, 3, 4, 5, 6, 7];

// ─── Student Row ──────────────────────────────────────────────────────────────

function StudentRow({ student, onRefetch }: { student: any; onRefetch: () => void }) {
  const [expanded, setExpanded] = useState(false);
  const [draft, setDraft] = useState(student);
  const [saving, setSaving] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const enrollment = draft.enrolled_sessions || {};

  const handleToggle = (dayNum: number, sessionId: string) => {
    const key = `${dayNum}-${sessionId}`;
    const next = { ...enrollment };
    if (!next[key]) next[key] = 'math';
    else if (next[key] === 'math') next[key] = 'english';
    else delete next[key];
    setDraft({ ...draft, enrolled_sessions: next });
  };

  const handleUpdate = async () => {
    setSaving(true);
    await supabase.from('students').update({
      name: draft.name,
      grade: parseInt(draft.grade),
      enrolled_sessions: draft.enrolled_sessions,
    }).eq('id', student.id);
    onRefetch();
    setSaving(false);
    setExpanded(false);
  };

  // Count sessions this student is enrolled in
  const sessionCount = Object.keys(enrollment).length;

  return (
    <div className="rounded-xl border overflow-hidden transition-all" style={{ borderColor: expanded ? '#c4b5fd' : '#e7e3dd', background: expanded ? '#faf9ff' : 'white' }}>
      <div className="px-4 py-3.5 flex items-center gap-3 cursor-pointer select-none" onClick={() => setExpanded(!expanded)}>
        <div className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold shrink-0" style={{ background: '#ede9fe', color: '#6d28d9' }}>
          {draft.name.charAt(0).toUpperCase()}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold leading-none" style={{ color: '#1c1917' }}>{draft.name}</p>
          <p className="text-xs mt-1" style={{ color: '#a8a29e' }}>
            Grade {draft.grade}
            {sessionCount > 0 && <span className="ml-2 text-[9px] font-semibold px-1.5 py-0.5 rounded-full" style={{ background: '#d1fae5', color: '#065f46' }}>{sessionCount} session{sessionCount !== 1 ? 's' : ''}</span>}
          </p>
        </div>
        <ChevronDown size={14} style={{ color: '#a8a29e', transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.15s' }} />
      </div>

      {expanded && (
        <div className="px-4 pb-5 border-t space-y-5" style={{ borderColor: '#e7e3dd' }}>
          {/* Basic info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-4">
            <div className="space-y-1.5">
              <label className="text-xs font-medium" style={{ color: '#78716c' }}>Full Name</label>
              <input value={draft.name} onChange={e => setDraft({ ...draft, name: e.target.value })}
                className="w-full px-3 py-2.5 rounded-xl text-sm focus:outline-none"
                style={{ background: 'white', border: '1px solid #e7e3dd', color: '#1c1917' }}
                onFocus={e => e.currentTarget.style.borderColor = '#6d28d9'}
                onBlur={e => e.currentTarget.style.borderColor = '#e7e3dd'}
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium" style={{ color: '#78716c' }}>Grade</label>
              <input type="number" value={draft.grade} onChange={e => setDraft({ ...draft, grade: e.target.value })}
                className="w-full px-3 py-2.5 rounded-xl text-sm focus:outline-none"
                style={{ background: 'white', border: '1px solid #e7e3dd', color: '#1c1917' }}
                onFocus={e => e.currentTarget.style.borderColor = '#6d28d9'}
                onBlur={e => e.currentTarget.style.borderColor = '#e7e3dd'}
              />
            </div>
          </div>

          {/* Weekly schedule grid */}
          <div>
            <p className="text-xs font-medium mb-2" style={{ color: '#78716c' }}>Weekly Schedule <span className="font-normal text-[10px]">(tap to cycle: Math → English → None)</span></p>
            <div className="rounded-xl border overflow-x-auto" style={{ borderColor: '#e7e3dd' }}>
              <table className="border-collapse" style={{ minWidth: 500 }}>
                <thead>
                  <tr style={{ background: '#faf9f7', borderBottom: '1px solid #e7e3dd' }}>
                    <th className="px-3 py-2 text-left text-[10px] font-semibold" style={{ color: '#a8a29e', borderRight: '1px solid #f0ece8', minWidth: 110 }}>Session</th>
                    {DAYS.map(d => (
                      <th key={d} className="px-2 py-2 text-center text-[10px] font-semibold" style={{ color: '#78716c', borderRight: '1px solid #f0ece8', minWidth: 58 }}>{d}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {SESSION_CONFIG.map((s, si) => (
                    <tr key={s.id} style={{ borderBottom: si < SESSION_CONFIG.length - 1 ? '1px solid #f0ece8' : 'none' }}>
                      <td className="px-3 py-2 align-top" style={{ borderRight: '1px solid #f0ece8' }}>
                        <p className="text-xs font-semibold" style={{ color: '#1c1917' }}>{s.label}</p>
                        <p className="text-[10px]" style={{ color: '#a8a29e' }}>{s.time}</p>
                      </td>
                      {DAY_NUMS.map(dn => {
                        const sub = enrollment[`${dn}-${s.id}`];
                        return (
                          <td key={dn} className="p-1" style={{ borderRight: '1px solid #f0ece8' }}>
                            <button onClick={() => handleToggle(dn, s.id)}
                              className="w-full py-2.5 rounded-lg text-[9px] font-semibold uppercase transition-all"
                              style={sub === 'math' ? {
                                background: '#dbeafe', color: '#1d4ed8', border: '1px solid #93c5fd',
                              } : sub === 'english' ? {
                                background: '#fce7f3', color: '#be185d', border: '1px solid #f9a8d4',
                              } : {
                                background: '#faf9f7', color: '#d4d0ca', border: '1px solid #f0ece8',
                              }}
                            >
                              {sub || '·'}
                            </button>
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-between items-center">
            <button
              onClick={async () => {
                if (!confirmDelete) { setConfirmDelete(true); return; }
                await supabase.from('students').delete().eq('id', student.id);
                onRefetch();
              }}
              className="flex items-center gap-1.5 text-xs font-medium transition-colors"
              style={{ color: confirmDelete ? '#dc2626' : '#a8a29e' }}
            >
              <Trash2 size={13} /> {confirmDelete ? 'Click to confirm' : 'Remove student'}
            </button>
            <button onClick={handleUpdate}
              className="flex items-center gap-2 px-5 py-2 rounded-xl text-xs font-semibold text-white transition-all"
              style={{ background: '#6d28d9', boxShadow: '0 1px 4px rgba(109,40,217,0.3)' }}
              onMouseEnter={e => e.currentTarget.style.background = '#5b21b6'}
              onMouseLeave={e => e.currentTarget.style.background = '#6d28d9'}
            >
              <Save size={13} /> {saving ? 'Saving…' : 'Save Changes'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function StudentManagementPage() {
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [search, setSearch] = useState('');
  const [newStudent, setNewStudent] = useState({ name: '', grade: 1, enrolled_sessions: {} });

  const fetchData = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase.from('students').select('*').order('name');
    setStudents(data || []);
    setLoading(false);
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleCreate = async () => {
    if (!newStudent.name) return;
    await supabase.from('students').insert([newStudent]);
    setAdding(false);
    setNewStudent({ name: '', grade: 1, enrolled_sessions: {} });
    fetchData();
  };

  const filtered = students.filter(s => s.name.toLowerCase().includes(search.toLowerCase()));

  if (loading && students.length === 0) return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: '#f9f7f4' }}>
      <div className="flex flex-col items-center gap-3">
        <Loader2 size={28} className="animate-spin" style={{ color: '#6d28d9' }} />
        <p className="text-sm font-medium" style={{ color: '#a8a29e' }}>Loading students…</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen pb-16" style={{ background: '#f9f7f4', fontFamily: "'DM Sans', 'Inter', sans-serif" }}>

      {/* Header */}
      <header className="sticky top-0 z-40 border-b" style={{ background: 'rgba(249,247,244,0.92)', backdropFilter: 'blur(12px)', borderColor: '#e7e3dd' }}>
        <div className="max-w-3xl mx-auto px-4 md:px-8 h-14 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: '#6d28d9' }}>
              <GraduationCap size={14} className="text-white" />
            </div>
            <span className="font-bold text-base tracking-tight" style={{ color: '#1c1917' }}>Students</span>
            <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: '#ede9fe', color: '#6d28d9' }}>{students.length}</span>
          </div>
          <button onClick={() => setAdding(true)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold text-white transition-all"
            style={{ background: '#6d28d9', boxShadow: '0 1px 3px rgba(109,40,217,0.4)' }}
            onMouseEnter={e => e.currentTarget.style.background = '#5b21b6'}
            onMouseLeave={e => e.currentTarget.style.background = '#6d28d9'}
          >
            <Plus size={13} /> Add Student
          </button>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 md:px-8 pt-6 space-y-4">

        {/* Search */}
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: '#c4b9b2' }} />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search students…"
            className="w-full pl-9 pr-4 py-2.5 rounded-xl text-sm focus:outline-none"
            style={{ background: 'white', border: '1px solid #e7e3dd', color: '#1c1917' }}
            onFocus={e => e.currentTarget.style.borderColor = '#6d28d9'}
            onBlur={e => e.currentTarget.style.borderColor = '#e7e3dd'}
          />
        </div>

        {/* Add form */}
        {adding && (
          <div className="p-5 rounded-xl border space-y-4" style={{ background: 'white', borderColor: '#c4b5fd' }}>
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold" style={{ color: '#6d28d9' }}>New Student</p>
              <button onClick={() => setAdding(false)} className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-stone-100" style={{ color: '#a8a29e' }}>
                <X size={14} />
              </button>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <input value={newStudent.name} onChange={e => setNewStudent({ ...newStudent, name: e.target.value })} placeholder="Full name"
                className="col-span-2 md:col-span-1 px-3 py-2.5 rounded-xl text-sm focus:outline-none"
                style={{ background: '#faf9f7', border: '1px solid #e7e3dd', color: '#1c1917' }}
                onFocus={e => e.currentTarget.style.borderColor = '#6d28d9'}
                onBlur={e => e.currentTarget.style.borderColor = '#e7e3dd'}
              />
              <input type="number" value={newStudent.grade} onChange={e => setNewStudent({ ...newStudent, grade: parseInt(e.target.value) })} placeholder="Grade"
                className="px-3 py-2.5 rounded-xl text-sm focus:outline-none"
                style={{ background: '#faf9f7', border: '1px solid #e7e3dd', color: '#1c1917' }}
                onFocus={e => e.currentTarget.style.borderColor = '#6d28d9'}
                onBlur={e => e.currentTarget.style.borderColor = '#e7e3dd'}
              />
            </div>
            <div className="flex gap-2">
              <button onClick={() => setAdding(false)} className="flex-1 py-2.5 rounded-xl text-xs font-medium" style={{ background: '#f9f7f4', color: '#78716c', border: '1px solid #e7e3dd' }}>Cancel</button>
              <button onClick={handleCreate} disabled={!newStudent.name} className="flex-[2] py-2.5 rounded-xl text-xs font-semibold text-white" style={{ background: '#6d28d9', opacity: !newStudent.name ? 0.5 : 1 }}>
                Add Student
              </button>
            </div>
          </div>
        )}

        {/* Student list */}
        <div className="space-y-2">
          {filtered.map(s => <StudentRow key={s.id} student={s} onRefetch={fetchData} />)}
          {filtered.length === 0 && !adding && (
            <div className="py-16 text-center rounded-xl border border-dashed" style={{ borderColor: '#e7e3dd' }}>
              <p className="text-sm" style={{ color: '#c4b9b2' }}>{search ? 'No students match your search' : 'No students yet'}</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}