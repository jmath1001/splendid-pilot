'use client';
import React, { useState } from "react";
import MasterGrid from "@/components/MasterGrid";
import TutorPortal from "@/components/TutorPortal";

export default function Home() {
  const [view, setView] = useState<'owner' | 'tutor'>('owner');

  // SHARED STATE - This is what "saves" during your demo
  const [availability, setAvailability] = useState(["14:00", "16:00", "17:00"]);
  const [sessions, setSessions] = useState([
    { id: "s1", name: "James M.", time: "14:00", topic: "Calculus", present: false, hoursLeft: 4.5 },
    { id: "s2", name: "Ava R.", time: "14:00", topic: "AP Physics", present: true, hoursLeft: 2.0 }
  ]);

  return (
    <main className="min-h-screen bg-[#fafafa] pb-24">
      {/* PERSISTENT VIEW TOGGLE (Bottom of screen for easy switching) */}
      <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[100] flex gap-2 bg-white border-4 border-slate-900 p-2 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
        <button 
          onClick={() => setView('owner')}
          className={`px-6 py-2 text-xs font-black uppercase italic transition-all ${view === 'owner' ? 'bg-slate-900 text-white' : 'hover:bg-slate-100'}`}
        >
          Agency Admin
        </button>
        <button 
          onClick={() => setView('tutor')}
          className={`px-6 py-2 text-xs font-black uppercase italic transition-all ${view === 'tutor' ? 'bg-emerald-500 text-slate-900' : 'hover:bg-slate-100'}`}
        >
          Tutor Portal
        </button>
      </div>

      {view === 'owner' ? (
        <MasterGrid availability={availability} sessions={sessions} />
      ) : (
        <TutorPortal 
          availability={availability} 
          setAvailability={setAvailability} 
          sessions={sessions}
          setSessions={setSessions}
        />
      )}
    </main>
  );
}