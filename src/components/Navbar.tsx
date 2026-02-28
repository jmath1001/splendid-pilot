"use client"
import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Users, GraduationCap } from 'lucide-react';

export function Navbar() {
  const pathname = usePathname();

  const navItems = [
    { name: 'Admin Grid', href: '/', icon: LayoutDashboard },
    { name: 'Tutor Portal', href: '/tutor', icon: GraduationCap },
    { name: 'Student Database', href: '/students', icon: Users },
  ];

  return (
    <nav className="sticky top-0 z-[100] bg-white border-b border-[#e7e3dd] px-6 py-3">
      <div className="max-w-[1600px] mx-auto flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-[#6d28d9] rounded-lg flex items-center justify-center shadow-lg shadow-violet-100">
            <GraduationCap size={18} className="text-white" />
          </div>
          <span className="font-black uppercase tracking-tighter text-[#1c1917] italic text-lg">
            Splendid<span className="text-[#6d28d9]">Tutoring</span>
          </span>
        </div>

        <div className="flex items-center gap-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  isActive 
                    ? 'bg-[#f3f0ff] text-[#6d28d9]' 
                    : 'text-[#78716c] hover:bg-[#faf9f7] hover:text-[#1c1917]'
                }`}
              >
                <item.icon size={14} strokeWidth={isActive ? 3 : 2} />
                {item.name}
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}