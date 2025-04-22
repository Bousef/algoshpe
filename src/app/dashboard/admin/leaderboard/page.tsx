'use client';
import { api } from "~/trpc/react";
import { useState } from 'react';
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Montserrat } from 'next/font/google';

const montserrat = Montserrat({ subsets: ['latin'], weight: ['400', '500', '700'] });

export default function Leaderboard() {
  const router = useRouter();
  const [open, setOpen] = useState<string | null>(null);

  const toggleOpen = (name: string) => {
    setOpen((prev) => (prev === name ? null : name));
  };

  const handleAbout = () => router.push('/dashboard/admin/about');
  const handleAssignment = () => router.push('/dashboard/admin/assignment');
  const handleQandA = () => router.push('/dashboard/admin/qa');
  const handleResources = () => router.push('/dashboard/admin/resources');
  const handleLeaderboard = () => router.push('/dashboard/admin/leaderboard');
  const handleStudent = () => router.push('/dashboard/admin/student');
  const handleLogOut = () => router.push('/');

  const { data: students = [] } = api.student.getAllStudents.useQuery();

  // Ensure students are always sorted by points in descending order
  const sortedStudents =
    students.length > 1
      ? [...students].sort((a, b) => (b.algoshpe_points ?? 0) - (a.algoshpe_points ?? 0))
      : students;

  const { data: allSubmissions = [] } = api.submission.getAllSubmissions.useQuery();
  const studentId = null; // Replace with actual studentId from localStorage or context
  const { data: studentSubmissions = [] } = api.submission.getAllStudentSubmissions.useQuery(
    { studentId: studentId ?? 0 },
    { enabled: studentId !== null }
  );

  type SubmissionLite = {
    studentId: number;
    assignmentId: number;
  };
  
  const submissionsByStudent = new Map<number, Set<number>>();
  for (const submission of allSubmissions as SubmissionLite[]) {
    if (!submissionsByStudent.has(submission.studentId)) {
      submissionsByStudent.set(submission.studentId, new Set());
    }
    submissionsByStudent.get(submission.studentId)!.add(submission.assignmentId);
  }

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
            <div onClick={handleAbout} className="text-white cursor-pointer hover:text-[#A1B0A6] transition duration-200">
                About
              </div>
              <div onClick={handleStudent} className="text-white cursor-pointer hover:text-[#A1B0A6] transition duration-200">
                Students
              </div>
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
          {sortedStudents.map((student, index) => {
            const fullName = `${student.first_name ?? ''} ${student.last_name ?? ''}`.trim() || student.username;

          const assignmentsCompleted = submissionsByStudent.get(student.id)?.size ?? 0;
            return (
              <div key={fullName} className="bg-white shadow-md rounded-xl px-6 py-4 mb-4 w-full max-w-md">
                <button
                  onClick={() => toggleOpen(fullName)}
                  className="flex justify-between items-center w-full text-left"
                >
                  <span className="text-xl font-semibold text-[#354F52]">
                    {fullName}
                  </span>
                  <span className="text-gray-500">{open === fullName ? '▲' : '▼'}</span>
                </button>
                {open === fullName && (
                  <div className="mt-4 text-gray-800 space-y-1">
                    <p><strong>Position:</strong> {index + 1}</p>
                    <p><strong>Points:</strong> {student.algoshpe_points ?? 0}</p>
                    <p><strong>Assignments Completed:</strong> {assignmentsCompleted}</p>
                    <p><strong>Classes Attended:</strong> {student.attendance}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}