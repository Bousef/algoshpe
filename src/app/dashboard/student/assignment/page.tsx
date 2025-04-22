'use client';

import Image from "next/image";
import { useRouter } from "next/navigation";
import { Montserrat } from 'next/font/google';
import { useState, useEffect } from 'react';
import { api } from "~/trpc/react";
import { Pie } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend);

const montserrat = Montserrat({ subsets: ['latin'], weight: ['400', '500', '700'] });

export default function Assignment() {
  const router = useRouter();

  const handleAbout = () => router.push('/dashboard/student/about');
  const handleAssignment = () => router.push('/dashboard/student/assignment');
  const handleQandA = () => router.push('/dashboard/student/qa');
  const handleResources = () => router.push('/dashboard/student/resources');
  const handleLeaderboard = () => router.push('/dashboard/student/leaderboard');
  const handleLogOut = () => router.push('/');

  const [studentId, setStudentId] = useState<number | null>(null);

  useEffect(() => {
    const idFromStorage = localStorage.getItem("Student_ID");
    if (idFromStorage) {
      setStudentId(Number(idFromStorage));
    }
  }, []);

  const { data: studentAssignmentIds, isLoading: loadingIds } = api.student.getStudentAssignments.useQuery(
    { studentId: studentId ?? 0 },
    { enabled: studentId !== null }
  );

  const { data: currentAssignments = [] } = api.assignment.getAssignmentsByArrayIds.useQuery(
    { ids: studentAssignmentIds?.current ?? [] },
    { enabled: !!studentAssignmentIds }
  );

  const { data: pastAssignments = [] } = api.assignment.getAssignmentsByArrayIds.useQuery(
    { ids: studentAssignmentIds?.past ?? [] },
    { enabled: !!studentAssignmentIds }
  );

  const { data: studentSubmissionCount } = api.submission.getStudentSubmissionCount.useQuery(
    { studentId: studentId ?? 0 },
    { enabled: studentId !== null }
  );
  const { data: allSubmissions = [] } = api.submission.getAllStudentSubmissions.useQuery(
    { studentId: studentId ?? 0 },
    { enabled: studentId !== null }
  );

  const { data: totalAssignmentCount } = api.assignment.getTotalAssignmentCount.useQuery();
  const uniqueSubmittedAssignmentIds = Array.from(
    new Set(allSubmissions.map((s) => s.assignmentId))
  );
  const assignmentsSubmittedCount = uniqueSubmittedAssignmentIds.length;

  const groupByLevel = (assignments: typeof currentAssignments) => {
    const groups: Record<string, typeof currentAssignments> = {
      citronaut: [],
      knight: [],
      pegasus: [],
    };
    assignments.forEach((assignment) => {
      const level = assignment.level?.toLowerCase() || 'citronaut';
      groups[level]?.push(assignment);
    });

    for (const key in groups) {
        const group = groups[key] as typeof currentAssignments;
        group.sort((a, b) => 
            new Date(a.due_date ?? "").getTime() - new Date(b.due_date ?? "").getTime()
          );
      }

    return groups;
  };

  const currentGrouped = groupByLevel(currentAssignments);
  const pastGrouped = groupByLevel(pastAssignments);

  const levelColors: Record<string, string> = {
    citronaut: "#CAD2C5",
    knight: "#52796F",
    pegasus: "#354F52",
  };

  return (
    <div className={montserrat.className}>
      <div className="bg-[#CAD2C5] min-h-screen">
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
              <div onClick={handleAbout} className="text-white cursor-pointer hover:text-[#A1B0A6] transition duration-200">About</div>
              <div onClick={handleAssignment} className="text-white cursor-pointer hover:text-[#A1B0A6] transition duration-200">Assignments</div>
              <div onClick={handleQandA} className="text-white cursor-pointer hover:text-[#A1B0A6] transition duration-200">Q & A</div>
              <div onClick={handleResources} className="text-white cursor-pointer hover:text-[#A1B0A6] transition duration-200">Resources</div>
              <div onClick={handleLeaderboard} className="text-white cursor-pointer hover:text-[#A1B0A6] transition duration-200">Leaderboard</div>
              <div onClick={handleLogOut} className="text-white cursor-pointer hover:text-[#A1B0A6] transition duration-200">Log Out</div>
            </div>
          </div>
        </header>

        <div className="px-4 py-8">
          <div className="flex space-x-4 mb-8">
            {/* Current Assignments */}
            <div className="flex-1 bg-[#5C6B73] p-6 rounded-lg text-white">
            <h2 className="text-2xl text-center font-semibold mb-4">Current Assignments</h2>
            {loadingIds ? null : currentAssignments.length === 0 ? (
                <div className="text-center text-white text-lg mt-8">No current assignments.</div>
            ) : (
                [...currentAssignments]
                  .sort((a, b) => {
                    const levelOrder = ['citronaut', 'knight', 'pegasus'];
                    const levelA = a.level?.toLowerCase() ?? 'citronaut';
                    const levelB = b.level?.toLowerCase() ?? 'citronaut';
                    const levelCompare = levelOrder.indexOf(levelA) - levelOrder.indexOf(levelB);
                    if (levelCompare !== 0) return levelCompare;
                    return new Date(a.due_date ?? "").getTime() - new Date(b.due_date ?? "").getTime();
                  })
                  .map((assignment) => (
                    <div
                      key={assignment.id}
                      onClick={() => router.push(`/dashboard/student/assignment/${assignment.id}`)}
                      className="mb-4 cursor-pointer p-4 bg-white rounded-lg text-black hover:shadow-lg transition"
                    >
                      <h4 className="text-xl font-bold">{assignment.title}</h4>
                      <p
                        className="text-sm italic font-semibold mb-1"
                        style={{ color: levelColors[assignment.level?.toLowerCase() ?? 'citronaut'] }}
                      >
                        Level: {assignment.level?.charAt(0).toUpperCase() + assignment.level?.slice(1) ?? 'Citronaut'}
                      </p>
                      <p>{assignment.description}</p>
                      <p className="text-sm text-gray-500">Due: {assignment.due_date}</p>
                    </div>
                  ))
            )}
            </div>

            {/* Past Assignments */}
            <div className="flex-1 bg-[#A1B0A6] p-6 rounded-lg text-white">
              <h2 className="text-2xl text-center font-semibold text-white mb-4">Past Assignments</h2>
              {loadingIds ? null : pastAssignments.length === 0 ? (
                <div className="text-center text-white text-lg mt-8">No past assignments.</div>
              ) : (
                [...pastAssignments]
                  .sort((a, b) => {
                    const levelOrder = ['citronaut', 'knight', 'pegasus'];
                    const levelA = a.level?.toLowerCase() ?? 'citronaut';
                    const levelB = b.level?.toLowerCase() ?? 'citronaut';
                    const levelCompare = levelOrder.indexOf(levelA) - levelOrder.indexOf(levelB);
                    if (levelCompare !== 0) return levelCompare;
                    return new Date(a.due_date ?? "").getTime() - new Date(b.due_date ?? "").getTime();
                  })
                  .map((assignment) => (
                    <div
                      key={assignment.id}
                      onClick={() => router.push(`/dashboard/student/assignment/${assignment.id}`)}
                      className="mb-4 cursor-pointer p-4 bg-white rounded-lg text-black hover:shadow-lg transition"
                    >
                      <h4 className="text-xl font-bold">{assignment.title}</h4>
                      <p
                        className="text-sm italic font-semibold mb-1"
                        style={{ color: levelColors[assignment.level?.toLowerCase() ?? 'citronaut'] }}
                      >
                        Level: {assignment.level?.charAt(0).toUpperCase() + assignment.level?.slice(1) ?? 'Citronaut'}
                      </p>
                      <p>{assignment.description}</p>
                      <p className="text-sm text-gray-600">Due: {assignment.due_date}</p>
                    </div>
                  ))
              )}
            </div>

            {/* Pie Chart */}
            <div className="flex-1 bg-[#8B9A8B] p-6 rounded-lg">
              <h2 className="text-2xl text-center font-semibold text-white">Pie Chart</h2>
              {studentSubmissionCount !== undefined && totalAssignmentCount !== undefined ? (
                <div className="text-white text-center">
                  <p className="text-lg mb-2">
                    Assignments Submitted: {assignmentsSubmittedCount} / {totalAssignmentCount}
                  </p>
                  <Pie
                    data={{
                      labels: ['Citronaut', 'Knight', 'Pegasus', 'Remaining'],
                      datasets: [
                        {
                          data: [
                            allSubmissions.filter(s => (currentAssignments.find(a => a.id === s.assignmentId)?.level?.toLowerCase() ?? '') === 'citronaut').length,
                            allSubmissions.filter(s => (currentAssignments.find(a => a.id === s.assignmentId)?.level?.toLowerCase() ?? '') === 'knight').length,
                            allSubmissions.filter(s => (currentAssignments.find(a => a.id === s.assignmentId)?.level?.toLowerCase() ?? '') === 'pegasus').length,
                            Math.max((totalAssignmentCount ?? 0) - assignmentsSubmittedCount, 0),
                          ],
                          backgroundColor: [
                            levelColors['citronaut'],
                            levelColors['knight'],
                            levelColors['pegasus'],
                            '#DADADA',
                          ],
                          borderWidth: 1,
                        },
                      ],
                    }}
                    options={{
                      responsive: true,
                      plugins: {
                        legend: {
                          position: 'bottom',
                          labels: {
                            color: 'white',
                          },
                        },
                      },
                    }}
                  />
                </div>
              ) : (
                <p className="text-white text-center">Loading chart...</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}