//same as student
'use client';

import { useState } from 'react';
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Montserrat } from 'next/font/google';

const montserrat = Montserrat({ subsets: ['latin'], weight: ['400', '500', '700'] });

// Sample student data (unsorted initially)
const students = [
  { name: 'Catalina', points: 120, assignmentsCompleted: 10, classesAttended: 8 },
  { name: 'Yousef', points: 110, assignmentsCompleted: 9, classesAttended: 9 },
  { name: 'Rafi', points: 95, assignmentsCompleted: 8, classesAttended: 7 },
];

export default function Leaderboard() {
  const router = useRouter();
  const [open, setOpen] = useState<string | null>(null);

  const toggleOpen = (name: string) => {
    setOpen((prev) => (prev === name ? null : name));
  };

  const handleAssignment = () => router.push('/dashboard/student/assignment');
  const handleQandA = () => router.push('/dashboard/student/qa');
  const handleResources = () => router.push('/dashboard/student/resources');
  const handleLeaderboard = () => router.push('/dashboard/student/leaderboard');
  const handleLogOut = () => router.push('/');

  // Ensure students are always sorted by points in descending order
  const sortedStudents = students
    .slice() // Create a copy to avoid mutating the original array
    .sort((a, b) => b.points - a.points);

  return (
    <div className={montserrat.className}>
      <div className="bg-[#CAD2C5] min-h-screen">
        {/* Header */}
        <header className="bg-[#354F52] p-2">
          <div className="flex justify-between items-center w-full px-6">
            <div className="flex items-center">
              <Image
                src="/algoshpelogo.png"
                alt="AlgoSHPE Logo"
                width={160}
                height={160}
                className="rounded-lg w-24 h-auto"
              />
            </div>
            <div className="flex gap-6">
              <div onClick={handleAssignment} className="text-white cursor-pointer hover:text-[#A1B0A6] transition duration-200">
                Assignments
              </div>
              <div onClick={handleQandA} className="text-white cursor-pointer hover:text-[#A1B0A6] transition duration-200">
                Q & A
              </div>
              <div onClick={handleResources} className="text-white cursor-pointer hover:text-[#A1B0A6] transition duration-200">
                Resources
              </div>
              <div onClick={handleLeaderboard} className="text-white cursor-pointer hover:text-[#A1B0A6] transition duration-200">
                Leaderboard
              </div>
              <div onClick={handleLogOut} className="text-white cursor-pointer hover:text-[#A1B0A6] transition duration-200">
                Log Out
              </div>
            </div>
          </div>
        </header>

        {/* Leaderboard Section */}
        <div className="pt-8 px-4 flex flex-col items-center overflow-y-auto max-h-[calc(100vh-100px)] w-full">
          {sortedStudents.map((student, index) => (
            <div key={student.name} className="bg-white shadow-md rounded-xl px-6 py-4 mb-4 w-full max-w-md">
              <button
                onClick={() => toggleOpen(student.name)}
                className="flex justify-between items-center w-full text-left"
              >
                <span className="text-xl font-semibold text-[#354F52]">
                  {student.name}
                </span>
                <span className="text-gray-500">{open === student.name ? '▲' : '▼'}</span>
              </button>
              {open === student.name && (
                <div className="mt-4 text-gray-800 space-y-1">
                  <p><strong>Position:</strong> {index + 1}</p>
                  <p><strong>Points:</strong> {student.points}</p>
                  <p><strong>Assignments Completed:</strong> {student.assignmentsCompleted}</p>
                  <p><strong>Classes Attended:</strong> {student.classesAttended}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}