"use client"
import React, { useState, useEffect, useCallback } from 'react';
import { Plus, ChevronDown, Trash2, GraduationCap, Loader2, Save, X } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';

// ─── CONFIG ──────────────────────────────────────────────────────────────────
const SESSION_CONFIG = [
  { id: 'S1', label: 'Session 1', time: '3:00 PM - 4:30 PM' },
  { id: 'S2', label: 'Session 2', time: '4:30 PM - 6:00 PM' },
  { id: 'S3', label: 'Session 3', time: '6:00 PM - 7:30 PM' },
  { id: 'S4', label: 'Session 4', time: '7:30 PM - 9:00 PM' },
];

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const DAY_NUMS = [1, 2, 3, 4, 5, 6, 7];

// ─── STUDENT ROW ─────────────────────────────────────────────────────────────

function StudentRow({ student, onRefetch }: { student: any; onRefetch: () => void }) {
  const [expanded, setExpanded] = useState(false);
  const [draft, setDraft] = useState(student);
  const [saving, setSaving] = useState(false);

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
      enrolled_sessions: draft.enrolled_sessions
    }).eq('id', student.id);
    onRefetch();
    setSaving(false);
    setExpanded(false);
  };

  return (
    <div className="mb-4 bg-white border-2 border-slate-200 rounded-lg shadow-sm overflow-hidden">
      <div 
        className="p-4 flex items-center justify-between cursor-pointer hover:bg-slate-50"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center gap-4">
          <div className="bg-slate-100 p-2 rounded">
            <GraduationCap className="text-slate-600" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900">{draft.name}</h3>
            <p className="text-sm text-slate-500">Grade {draft.grade}</p>
          </div>
        </div>
        <ChevronDown className={`text-slate-400 transition-transform ${expanded ? 'rotate-180' : ''}`} />
      </div>

      {expanded && (
        <div className="p-6 border-t-2 border-slate-100 bg-white">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Full Name</label>
              <input 
                value={draft.name} 
                onChange={e => setDraft({...draft, name: e.target.value})} 
                className="w-full border-2 border-slate-200 p-3 rounded text-slate-900 focus:border-blue-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Grade</label>
              <input 
                type="number" 
                value={draft.grade} 
                onChange={e => setDraft({...draft, grade: e.target.value})} 
                className="w-full border-2 border-slate-200 p-3 rounded text-slate-900 focus:border-blue-500 outline-none"
              />
            </div>
          </div>

          <div className="mb-6">
            <label className="block text-xs font-bold text-slate-700 uppercase mb-2">Weekly Schedule (Click to change subject)</label>
            <div className="overflow-x-auto border rounded border-slate-200">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-slate-50">
                    <th className="p-2 border-b border-r text-xs text-slate-500">Time</th>
                    {DAYS.map(d => <th key={d} className="p-2 border-b text-xs text-slate-700 font-bold">{d}</th>)}
                  </tr>
                </thead>
                <tbody>
                  {SESSION_CONFIG.map(s => (
                    <tr key={s.id}>
                      <td className="p-2 border-r border-b bg-slate-50 text-[10px] font-bold text-slate-600">
                        {s.label}<br/>{s.time}
                      </td>
                      {DAY_NUMS.map(dn => {
                        const sub = enrollment[`${dn}-${s.id}`];
                        return (
                          <td key={dn} className="p-1 border-b">
                            <button 
                              onClick={() => handleToggle(dn, s.id)}
                              className={`w-full py-3 rounded text-[10px] font-bold uppercase border ${
                                sub === 'math' ? 'bg-green-100 border-green-500 text-green-700' : 
                                sub === 'english' ? 'bg-blue-100 border-blue-500 text-blue-700' : 
                                'bg-white border-slate-200 text-slate-300'
                              }`}
                            >
                              {sub || 'None'}
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

          <div className="flex justify-between">
            <button 
              onClick={async () => {
                if(confirm("Delete student?")) {
                  await supabase.from('students').delete().eq('id', student.id);
                  onRefetch();
                }
              }}
              className="text-red-600 text-sm font-bold flex items-center gap-1"
            >
              <Trash2 size={16}/> Remove Student
            </button>
            <button 
              onClick={handleUpdate}
              className="bg-blue-600 text-white px-6 py-2 rounded font-bold hover:bg-blue-700 flex items-center gap-2"
            >
              <Save size={18}/> {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── MAIN PAGE ───────────────────────────────────────────────────────────────

export default function StudentManagementPage() {
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
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

  if (loading && students.length === 0) {
    return (
      <div className="h-screen flex items-center justify-center bg-white">
        <Loader2 className="animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 p-4 md:p-8 font-sans">
      <div className="max-w-4xl mx-auto">
        
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-black text-slate-900">Student List</h1>
          <button 
            onClick={() => setAdding(true)} 
            className="bg-blue-600 text-white px-6 py-3 rounded-lg font-bold shadow-md flex items-center gap-2"
          >
            <Plus size={20}/> Add New Student
          </button>
        </div>

        {adding && (
          <div className="mb-8 p-6 bg-white border-2 border-blue-500 rounded-lg shadow-lg">
             <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">New Student Registration</h2>
                <button onClick={() => setAdding(false)}><X/></button>
             </div>
             <input 
               value={newStudent.name} 
               onChange={e => setNewStudent({...newStudent, name: e.target.value})} 
               className="w-full border-2 border-slate-200 p-4 rounded text-xl mb-4" 
               placeholder="Enter Student's Full Name" 
             />
             <button onClick={handleCreate} className="w-full bg-blue-600 text-white p-4 rounded font-bold text-lg">
               Confirm and Add
             </button>
          </div>
        )}

        <div className="space-y-2">
          {students.map(s => (
            <StudentRow key={s.id} student={s} onRefetch={fetchData} />
          ))}
        </div>
      </div>
    </div>
  );
}