export const TIME_SLOTS = ["14:00", "15:00", "16:00", "17:00", "18:00"];
export const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
export const MAX_CAPACITY = 3;

export const STUDENT_DATABASE = [
  { id: "s1", name: "James Martinez", subject: "Calculus", hoursLeft: 8 },
  { id: "s2", name: "Ava Robinson", subject: "Physics", hoursLeft: 12 },
  { id: "s3", name: "Leo Thompson", subject: "Math", hoursLeft: 5 },
  { id: "s4", name: "Mia Sanders", subject: "Chemistry", hoursLeft: 10 },
  { id: "s5", name: "Zoe Parker", subject: "Biology", hoursLeft: 7 },
  { id: "s6", name: "Emma Lewis", subject: "ESL", hoursLeft: 15 },
  { id: "s7", name: "Luke Sullivan", subject: "Math", hoursLeft: 6 },
  { id: "s8", name: "Elena Vasquez", subject: "Geometry", hoursLeft: 9 },
  { id: "s9", name: "Ryan Brooks", subject: "Algebra II", hoursLeft: 11 },
  { id: "s10", name: "Sophia Wright", subject: "Physics", hoursLeft: 4 },
  { id: "s11", name: "Ben Hughes", subject: "History", hoursLeft: 13 },
  { id: "s12", name: "Dana Foster", subject: "Math", hoursLeft: 8 },
  { id: "s13", name: "Gabe Nelson", subject: "Math", hoursLeft: 7 },
  { id: "s14", name: "Jack Davis", subject: "Chemistry", hoursLeft: 5 },
  { id: "s15", name: "Chris Palmer", subject: "Calculus", hoursLeft: 10 },
  { id: "s16", name: "Liam Kim", subject: "Writing", hoursLeft: 12 },
  { id: "s17", name: "Mia Santos", subject: "ESL", hoursLeft: 14 },
  { id: "s18", name: "Zoe Price", subject: "Government", hoursLeft: 6 },
  { id: "s19", name: "Leo Torres", subject: "Algebra II", hoursLeft: 9 },
  { id: "s20", name: "Noah Walker", subject: "English", hoursLeft: 11 },
  { id: "s21", name: "Emma Lopez", subject: "History", hoursLeft: 8 },
  { id: "s22", name: "Jack Dixon", subject: "Government", hoursLeft: 7 },
  { id: "s23", name: "Elena Vargas", subject: "Math", hoursLeft: 5 },
  { id: "s24", name: "Ava Reed", subject: "Physics", hoursLeft: 10 },
  { id: "s25", name: "James Moore", subject: "Calculus", hoursLeft: 6 },
  { id: "s26", name: "Sophia Wilson", subject: "English", hoursLeft: 9 },
  { id: "s27", name: "Ben Harrison", subject: "Math", hoursLeft: 12 },
  { id: "s28", name: "Dana Fox", subject: "Math", hoursLeft: 8 },
  { id: "s29", name: "Oliver Chen", subject: "Chemistry", hoursLeft: 15 },
  { id: "s30", name: "Maya Patel", subject: "Biology", hoursLeft: 11 }
];

export const TUTORS = [
  { id: 't1', name: "Sarah Jenkins", cat: 'math', subjects: ["Math", "Calculus", "Physics"], availability: [1, 2, 3, 4, 5], availabilityBlocks: ["15:00-17:00"] },
  { id: 't2', name: "Kevin Vance", cat: 'math', subjects: ["Math", "Chemistry", "Biology"], availability: [1, 2, 4], availabilityBlocks: ["14:00-16:00"] },
  { id: 't3', name: "Maria Lopez", cat: 'english', subjects: ["English", "ESL", "Writing"], availability: [1, 3, 5], availabilityBlocks: ["16:00-18:00"] },
  { id: 't4', name: "Brian Ellis", cat: 'english', subjects: ["English", "History", "Government"], availability: [2, 3, 4, 5], availabilityBlocks: ["14:00-16:00", "18:00-18:00"] },
  { id: 't5', name: "Jessica Wu", cat: 'math', subjects: ["Math", "Algebra II", "Geometry"], availability: [1, 2, 3, 4, 5], availabilityBlocks: ["14:00-18:00"] },
  { id: 't6', name: "Andre Dubois", cat: 'math', subjects: ["Physics", "Calculus", "Chemistry"], availability: [2, 3, 5], availabilityBlocks: ["14:00-17:00"] },
  { id: 't7', name: "Priya Nair", cat: 'english', subjects: ["Writing", "English", "ESL"], availability: [1, 2, 4, 5], availabilityBlocks: ["15:00-18:00"] },
];

export const DAY_COLORS = [
  { bg: 'bg-blue-50',    bar: 'bg-blue-300',    heading: 'text-blue-900'   },
  { bg: 'bg-violet-50',  bar: 'bg-violet-300',  heading: 'text-violet-900' },
  { bg: 'bg-emerald-50', bar: 'bg-emerald-300', heading: 'text-emerald-900'},
  { bg: 'bg-amber-50',   bar: 'bg-amber-300',   heading: 'text-amber-900'  },
  { bg: 'bg-rose-50',    bar: 'bg-rose-300',    heading: 'text-rose-900'   },
];

export const INITIAL_SESSIONS = [
  { day: 1, tutorId: 't1', time: "15:00", students: [{ id: "s1", name: "James M.", topic: "Calculus", status: "present" }, { id: "s2", name: "Ava R.", topic: "Physics", status: "no-show" }] },
  { day: 1, tutorId: 't1', time: "16:00", students: [{ id: "s3", name: "Leo T.", topic: "Math", status: "present" }] },
  { day: 1, tutorId: 't2', time: "14:00", students: [{ id: "s4", name: "Mia S.", topic: "Chemistry", status: "present" }] },
  { day: 1, tutorId: 't2', time: "15:00", students: [{ id: "s5", name: "Zoe P.", topic: "Biology", status: "present" }, { id: "s29", name: "Oliver C.", topic: "Chemistry", status: "present" }] },
  { day: 1, tutorId: 't3', time: "16:00", students: [{ id: "s6", name: "Emma L.", topic: "ESL", status: "present" }] },
  { day: 1, tutorId: 't3', time: "17:00", students: [{ id: "s17", name: "Mia S.", topic: "ESL", status: "present" }] },
  { day: 1, tutorId: 't5', time: "14:00", students: [{ id: "s7", name: "Luke S.", topic: "Math", status: "present" }] },
  { day: 1, tutorId: 't5', time: "16:00", students: [{ id: "s8", name: "Elena V.", topic: "Geometry", status: "present" }, { id: "s9", name: "Ryan B.", topic: "Algebra II", status: "present" }] },
  { day: 1, tutorId: 't5', time: "17:00", students: [{ id: "s27", name: "Ben H.", topic: "Math", status: "present" }] },
  { day: 2, tutorId: 't1', time: "15:00", students: [{ id: "s10", name: "Sophia W.", topic: "Physics", status: "present" }] },
  { day: 2, tutorId: 't1', time: "16:00", students: [{ id: "s15", name: "Chris P.", topic: "Calculus", status: "present" }, { id: "s25", name: "James M.", topic: "Calculus", status: "present" }] },
  { day: 2, tutorId: 't4', time: "14:00", students: [{ id: "s11", name: "Ben H.", topic: "History", status: "present" }, { id: "s21", name: "Emma L.", topic: "History", status: "present" }] },
  { day: 2, tutorId: 't5', time: "15:00", students: [{ id: "s12", name: "Dana F.", topic: "Math", status: "no-show" }] },
  { day: 2, tutorId: 't5', time: "17:00", students: [{ id: "s13", name: "Gabe N.", topic: "Math", status: "present" }] },
  { day: 2, tutorId: 't2', time: "15:00", students: [{ id: "s14", name: "Jack D.", topic: "Chemistry", status: "present" }] },
  { day: 3, tutorId: 't1', time: "15:00", students: [{ id: "s15", name: "Chris P.", topic: "Calculus", status: "present" }] },
  { day: 3, tutorId: 't1', time: "17:00", students: [{ id: "s24", name: "Ava R.", topic: "Physics", status: "present" }] },
  { day: 3, tutorId: 't3', time: "16:00", students: [{ id: "s16", name: "Liam K.", topic: "Writing", status: "present" }] },
  { day: 3, tutorId: 't3', time: "17:00", students: [{ id: "s26", name: "Sophia W.", topic: "English", status: "present" }] },
  { day: 3, tutorId: 't4', time: "14:00", students: [{ id: "s18", name: "Zoe P.", topic: "Gov", status: "present" }] },
  { day: 3, tutorId: 't5', time: "16:00", students: [{ id: "s19", name: "Leo T.", topic: "Algebra II", status: "present" }] },
  { day: 3, tutorId: 't5', time: "18:00", students: [{ id: "s28", name: "Dana F.", topic: "Math", status: "present" }] },
  { day: 4, tutorId: 't4', time: "14:00", students: [{ id: "s20", name: "Noah W.", topic: "English", status: "present" }, { id: "s21", name: "Emma L.", topic: "History", status: "present" }, { id: "s22", name: "Jack D.", topic: "Gov", status: "present" }] },
  { day: 4, tutorId: 't4', time: "15:00", students: [{ id: "s18", name: "Zoe P.", topic: "Gov", status: "present" }] },
  { day: 4, tutorId: 't2', time: "14:00", students: [{ id: "s23", name: "Elena V.", topic: "Math", status: "present" }, { id: "s30", name: "Maya P.", topic: "Biology", status: "present" }] },
  { day: 4, tutorId: 't1', time: "16:00", students: [{ id: "s24", name: "Ava R.", topic: "Physics", status: "present" }] },
  { day: 4, tutorId: 't5', time: "15:00", students: [{ id: "s7", name: "Luke S.", topic: "Math", status: "present" }] },
  { day: 4, tutorId: 't5', time: "17:00", students: [{ id: "s8", name: "Elena V.", topic: "Geometry", status: "present" }] },
  { day: 5, tutorId: 't1', time: "15:00", students: [{ id: "s25", name: "James M.", topic: "Calculus", status: "present" }] },
  { day: 5, tutorId: 't1', time: "17:00", students: [{ id: "s10", name: "Sophia W.", topic: "Physics", status: "present" }] },
  { day: 5, tutorId: 't3', time: "16:00", students: [{ id: "s26", name: "Sophia W.", topic: "English", status: "present" }] },
  { day: 5, tutorId: 't5', time: "14:00", students: [{ id: "s27", name: "Ben H.", topic: "Math", status: "present" }] },
  { day: 5, tutorId: 't5', time: "16:00", students: [{ id: "s28", name: "Dana F.", topic: "Math", status: "no-show" }] },
  { day: 2, tutorId: 't6', time: "14:00", students: [{ id: "s2", name: "Ava R.", topic: "Physics", status: "present" }, { id: "s10", name: "Sophia W.", topic: "Physics", status: "present" }] },
  { day: 2, tutorId: 't6', time: "16:00", students: [{ id: "s15", name: "Chris P.", topic: "Calculus", status: "present" }] },
  { day: 3, tutorId: 't6', time: "15:00", students: [{ id: "s1", name: "James M.", topic: "Calculus", status: "present" }] },
  { day: 5, tutorId: 't6', time: "14:00", students: [{ id: "s4", name: "Mia S.", topic: "Chemistry", status: "present" }, { id: "s29", name: "Oliver C.", topic: "Chemistry", status: "present" }] },
  { day: 5, tutorId: 't6', time: "16:00", students: [{ id: "s24", name: "Ava R.", topic: "Physics", status: "present" }] },
  { day: 1, tutorId: 't7', time: "15:00", students: [{ id: "s16", name: "Liam K.", topic: "Writing", status: "present" }] },
  { day: 1, tutorId: 't7', time: "17:00", students: [{ id: "s20", name: "Noah W.", topic: "English", status: "present" }, { id: "s26", name: "Sophia W.", topic: "English", status: "present" }] },
  { day: 2, tutorId: 't7', time: "16:00", students: [{ id: "s6", name: "Emma L.", topic: "ESL", status: "no-show" }] },
  { day: 4, tutorId: 't7', time: "15:00", students: [{ id: "s17", name: "Mia S.", topic: "ESL", status: "present" }] },
  { day: 4, tutorId: 't7', time: "18:00", students: [{ id: "s11", name: "Ben H.", topic: "History", status: "present" }] },
  { day: 5, tutorId: 't7', time: "16:00", students: [{ id: "s22", name: "Jack D.", topic: "Gov", status: "present" }, { id: "s18", name: "Zoe P.", topic: "Gov", status: "present" }] },
];

export const isTutorAvailable = (tutor: any, time: string) => {
  return tutor.availabilityBlocks.some((block: string) => {
    const [start, end] = block.split('-');
    return time >= start && time <= end;
  });
};