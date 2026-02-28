'use client';
import React from "react";
import TutorPortal from "@/components/TutorPortal";

export default function TutorPage() {
  // TutorPortal internally handles its own useScheduleData() 
  // and updateAttendance() calls based on the code you provided earlier.
  
  return (
    <main className="min-h-screen bg-[#faf9f7]">
      <div className="py-4">
        <TutorPortal />
      </div>
    </main>
  );
}