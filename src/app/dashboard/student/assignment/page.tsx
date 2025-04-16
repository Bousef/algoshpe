'use client';

import Image from "next/image";
import { useRouter } from "next/navigation";
import { Montserrat } from 'next/font/google';
import { useState, useEffect } from 'react';
import { api } from "~/trpc/react";

const montserrat = Montserrat({ subsets: ['latin'], weight: ['400', '500', '700'] });

export default function Assignment() {
  const router = useRouter();

  //header routers
  const handleAbout = () => router.push('/dashboard/student/about');
  const handleAssignment= () => router.push('/dashboard/student/assignment');
  const handleQandA = () => router.push('/dashboard/student/qa');
  const handleResources = () => router.push('/dashboard/student/resources');
  const handleLeaderboard = () => router.push('/dashboard/student/leaderboard');
  const handleLogOut = () => router.push('/');

  type Assignment = {
    id: number;
    title: string;
    description: string | null;
    due_date: string | null;
  };

  //state variables
  const [currentAssignments, setCurrentAssignments] = useState<Assignment[]>([]);
  const [pastAssignments, setPastAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [studentId, setStudentId] = useState<number | null>(null);

  //student id from local storage
  useEffect(() => {
    const idFromStorage = localStorage.getItem("Student_ID");
    if (idFromStorage) {
      setStudentId(Number(idFromStorage));
    }
  }, []);

  //only calls apis if studentid is available
  const { data: currData, isLoading: currLoading } = api.assignment.getCurrAssignments.useQuery(
    { studentId: studentId ?? 0 },  
    { enabled: studentId !== null }
  );
  
  const { data: pastData, isLoading: pastLoading } = api.assignment.getPastAssignments.useQuery(
    { studentId: studentId ?? 0 },
    { enabled: studentId !== null }
  );

  //when currData or pastData are changed, it calls this !
  useEffect(() => {
    console.log(studentId, currData, pastData);
    if (currData) setCurrentAssignments(currData);
    if (pastData) setPastAssignments(pastData);
  
    if (!currLoading && !pastLoading) setLoading(false);
  }, [currData, pastData, currLoading, pastLoading]);


  return (
    <div className={montserrat.className}>
      <div className="bg-[#CAD2C5] min-h-screen">
        {/* Header Section */}
        <header className="bg-[#354F52] p-2">
          <div className="flex justify-between items-center w-full px-6">
            {/* Logo on the left */}
            <div className="flex items-center">
              <Image
                src="/algoshpelogo.png"
                alt="AlgoSHPE Logo"
                width={160}
                height={160}
                className="rounded-lg w-24 h-auto"
              />
            </div>

            {/* Navigation links on the right */}
            <div className="flex gap-6">
              <div onClick={handleAbout} className="text-white cursor-pointer hover:text-[#A1B0A6] transition duration-200">
                About
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

        {/* Page Content */}
        <div className="px-4 py-8">

          {/* Main Content: Divided into 4 sections */}
          <div className="flex space-x-4 mb-8">
          {/* Current Assignments */}

            <div className="flex-1 bg-[#5C6B73] p-6 rounded-lg text-white">
              <h2 className="text-2xl text-center font-semibold mb-2">Current Assignments</h2>
              {loading ? null : currentAssignments.length === 0 ? <p>No current assignments.</p> : currentAssignments.map((assignment) => (
                <div
                key={assignment.id}
                onClick={() => router.push(`/dashboard/student/assignment/${assignment.id}`)}
                className="mb-4 cursor-pointer p-4 bg-white rounded-lg text-black hover:shadow-lg transition"
                > 
                  <h3 className="text-xl font-bold">{assignment.title}</h3>
                  <p>{assignment.description}</p>
                  <p className="text-sm text-gray-300">Due: {assignment.due_date}</p>
                </div>
              ))}
            </div>

            {/* Past Assignments */}
            <div className="flex-1 bg-[#A1B0A6] p-6 rounded-lg text-white">
            <h2 className="text-2xl text-center font-semibold text-white">Past Assignments</h2>
              {loading ? null : pastAssignments.length === 0 ? <p>No past assignments.</p> : pastAssignments.map((assignment) => (
                <div
                  key={assignment.id}
                  onClick={() => router.push(`/dashboard/student/assignment/${assignment.id}`)}
                  className="mb-4 cursor-pointer p-4 bg-white rounded-lg text-black hover:shadow-lg transition"
                >
                  <h3 className="text-xl font-bold">{assignment.title}</h3>
                  <p>{assignment.description}</p>
                  <p className="text-sm text-gray-600">Due: {assignment.due_date}</p>
                </div>
              ))}
            </div>

            {/* Pie Chart */}
            <div className="flex-1 bg-[#8B9A8B] p-6 rounded-lg">
              <h2 className="text-2xl text-center font-semibold text-white">Pie Chart</h2>
              {/* Add your pie chart component here */}
              <p>Pie chart goes here...</p>
            </div>
            
          </div>
        </div>
      </div>
    </div>
  );
}