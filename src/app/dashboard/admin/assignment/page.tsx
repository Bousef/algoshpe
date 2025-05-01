'use client';

import Image from "next/image";
import { useRouter } from "next/navigation";
import { Montserrat } from 'next/font/google';
import { api } from '~/trpc/react';
import { useState, useEffect, useRef } from 'react';

const montserrat = Montserrat({ subsets: ['latin'], weight: ['400', '500', '700'] });

export default function AssignmentPage() {
  const router = useRouter();
  const utils = api.useUtils();

  const [openMenuId, setOpenMenuId] = useState<number | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);
  const [showInputModal, setShowInputModal] = useState<null | { assignmentId: number }>(null);
  const [showStudents, setShowStudents] = useState<null | { assignmentId: number }>(null);
  const [allStudents, setAllStudents] = useState<any[]>([]);
  const [selectedStudents, setSelectedStudents] = useState<number[]>([]);
  const [modalType, setModalType] = useState<"edit" | "delete" | "create" | "assign" | null>(null);
  const [inputValue, setInputValue] = useState('');
  const [newAssignmentLevel, setNewAssignmentLevel] = useState<string | null>(null);

  const [newAssignmentData, setNewAssignmentData] = useState({
    title: '',
    description: '',
    due_date: '',
    starter_code: '',
    test_cases: '',
    hints: '',
  });

  const {
    data: students,
    isLoading: isStudentsLoading,
    error: studentsError,
  } = api.student.getAllStudents.useQuery();

  useEffect(() => {
    if (students) {
      setAllStudents(students);
    }
  }, [students]);

  const assignMutation = api.assignment.assignToAllStudents.useMutation({
    onSuccess: () => {
      console.log("Assigned to ALL students successfully!");
      utils.assignment.getAssignments.invalidate();
    },
  });

  const assignSpecificMutation = api.assignment.assignToSpecificStudents.useMutation({
    onSuccess: () => {
      console.log("Assigned to specific students successfully!");
      utils.assignment.getAssignments.invalidate();
    },
  });

  const {
    data: assignments = [],
    isLoading,
    isError,
    error,
  } = api.assignment.getAssignments.useQuery();

  const updateAssignment = api.assignment.updateAssignment.useMutation({
    onSuccess: () => {
      utils.assignment.getAssignments.invalidate();
      setShowInputModal(null);
      setInputValue('');
    },
  });

  const deleteAssignment = api.assignment.deleteAssignment.useMutation({
    onMutate: async ({ id }) => {
      await utils.assignment.getAssignments.cancel();
      const previousData = utils.assignment.getAssignments.getData();
      utils.assignment.getAssignments.setData(undefined, previousData?.filter((assignment) => assignment.id !== id));
      return { previousData };
    },
    onError: (_err, _variables, context) => {
      if (context?.previousData) {
        utils.assignment.getAssignments.setData(undefined, context.previousData);
      }
    },
    onSettled: () => {
      utils.assignment.getAssignments.invalidate();
    },
  });

  const createAssignment = api.assignment.createAssignment.useMutation({
    onSuccess: () => {
      utils.assignment.getAssignments.invalidate();
      setShowInputModal(null);
      setNewAssignmentLevel(null);
      setNewAssignmentData({
        title: '',
        description: '',
        due_date: '',
        starter_code: '',
        test_cases: '',
        hints: '',
      });
    },
  });

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setOpenMenuId(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleAssign = () => {
    if (!showStudents) return;
    if (selectedStudents.length === allStudents.length) {
      assignMutation.mutate({ assignmentId: showStudents.assignmentId });
    } else {
      assignSpecificMutation.mutate({ assignmentId: showStudents.assignmentId, studentIds: selectedStudents });
    }
    setShowStudents(null);
    setSelectedStudents([]);
  };

  // Navigation
  const handleAbout = () => router.push('/dashboard/admin/about');
  const handleAssignments = () => router.push('/dashboard/admin/assignment');
  const handleQandA = () => router.push('/dashboard/admin/qa');
  const handleResources = () => router.push('/dashboard/admin/resources');
  const handleLeaderboard = () => router.push('/dashboard/admin/leaderboard');
  const handleStudent = () => router.push('/dashboard/admin/student');
  const handleLogOut = () => router.push('/');

  // Handle Delete
  const handleDeleteClick = (assignmentId: number) => {
    deleteAssignment.mutate({ id: assignmentId });
  };

  // Assignment Sections (citronaut, knight, pegasus)
  const sortedAssignments = [...assignments].sort((a, b) => {
    const dateA = new Date(a.due_date ?? "").getTime();
    const dateB = new Date(b.due_date ?? "").getTime();
    return dateA - dateB;
  });

  const groupedAssignments = {
    citronaut: sortedAssignments.filter(a => a.level === 'citronaut'),
    knight: sortedAssignments.filter(a => a.level === 'knight'),
    pegasus: sortedAssignments.filter(a => a.level === 'pegasus'),
  };

  return (
    <div className={montserrat.className}>
      {/* HEADER */}
      <div className="bg-[#CAD2C5] min-h-screen">
        <header className="bg-[#354F52] p-2">
          <div className="flex justify-between items-center w-full px-6">
            <div className="flex items-center">
              <Image src="/algoshpelogo.png" alt="AlgoSHPE Logo" width={160} height={160} className="rounded-lg w-24 h-auto" />
            </div>
            <div className="flex gap-6">
              <div onClick={handleAbout} className="text-white cursor-pointer hover:text-[#A1B0A6]">About</div>
              <div onClick={handleStudent} className="text-white cursor-pointer hover:text-[#A1B0A6]">Students</div>
              <div onClick={handleAssignments} className="text-white cursor-pointer hover:text-[#A1B0A6]">Assignments</div>
              <div onClick={handleQandA} className="text-white cursor-pointer hover:text-[#A1B0A6]">Q & A</div>
              <div onClick={handleResources} className="text-white cursor-pointer hover:text-[#A1B0A6]">Resources</div>
              <div onClick={handleLeaderboard} className="text-white cursor-pointer hover:text-[#A1B0A6]">Leaderboard</div>
              <div onClick={handleLogOut} className="text-white cursor-pointer hover:text-[#A1B0A6]">Log Out</div>
            </div>
          </div>
        </header>

        {/* Assignments List */}
        <div className="p-10">
          {['citronaut', 'knight', 'pegasus'].map((level) => (
            <div key={level} className={`mb-8 p-6 rounded-lg ${level === 'citronaut' ? 'bg-[#6A8C7B]' : level === 'knight' ? 'bg-[#52796F]' : 'bg-[#354F52]'}`}>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold text-center w-full capitalize">{level}</h2>
                <button className="text-white text-2xl font-bold" onClick={() => {
                  setModalType('create');
                  setNewAssignmentLevel(level);
                }}>+</button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {groupedAssignments[level as keyof typeof groupedAssignments].length === 0 ? (
                  <p className="text-white text-center w-full">No assignments found</p>
                ) : (
                  groupedAssignments[level as keyof typeof groupedAssignments].map((assignment) => (
                    <div key={assignment.id} className="bg-white p-8 min-h-[180px] rounded-2xl shadow text-center relative flex flex-col justify-center items-center">
                      <div className="absolute top-2 right-2">
                        <button
                          onClick={() => setOpenMenuId(openMenuId === assignment.id ? null : assignment.id)}
                          className="cursor-pointer text-gray-500 text-lg"
                        >⋮</button>
                        {openMenuId === assignment.id && (
                          <div ref={menuRef} className="absolute right-0 mt-1 w-40 bg-white border rounded shadow-md z-10">
                            <button onClick={() => handleDeleteClick(assignment.id)} className="block w-full text-left px-4 py-2 hover:bg-gray-100 text-sm">Remove Assignment</button>
                            <button onClick={() => { setShowStudents({ assignmentId: assignment.id }); setModalType('assign'); }} className="block w-full text-left px-4 py-2 hover:bg-gray-100 text-sm">Assign to Students</button>
                            <button onClick={() => { setShowInputModal({ assignmentId: assignment.id }); setModalType('edit'); }} className="block w-full text-left px-4 py-2 hover:bg-gray-100 text-sm">Edit Assignment</button>
                          </div>
                        )}
                      </div>
                      <p className="text-2xl font-extrabold text-[#354F52]">{assignment.title}</p>
                      <p className="text-lg text-gray-600 mt-2">Due: {assignment.due_date ? new Date(assignment.due_date).toLocaleDateString() : 'N/A'}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Modals for Assign, Edit, Create */}
        {showStudents && (
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded shadow-md w-[90%] max-w-md">
              <h2 className="text-lg font-semibold mb-4">Assign to Students</h2>
              <div className="space-y-2 max-h-60 overflow-y-auto border rounded p-2">
                {allStudents.map((student: any) => (
                  <label key={student.id} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={selectedStudents.includes(student.id)}
                      onChange={() => {
                        setSelectedStudents(prev => prev.includes(student.id)
                          ? prev.filter(id => id !== student.id)
                          : [...prev, student.id]);
                      }}
                    />
                    <span className="ml-2">{student.first_name} {student.last_name}</span>
                  </label>
                ))}
              </div>
              <div className="flex flex-col gap-2 mt-4">
            <div className="flex justify-end gap-2">
              <button onClick={() => { setShowStudents(null); setSelectedStudents([]); }} className="px-4 py-2 bg-gray-200 rounded">Cancel</button>
              <button onClick={handleAssign} className="px-4 py-2 bg-[#52796F] text-white rounded">Assign Selected</button>
            </div>
            <div className="flex justify-end">
              <button
                onClick={() => {
                  if (!showStudents) return;
                  assignMutation.mutate({ assignmentId: showStudents.assignmentId });
                  setShowStudents(null);
                  setSelectedStudents([]);
                }}
                className="w-full px-4 py-2 bg-[#354F52] text-white rounded"
              >
                Assign to All Students
              </button>
            </div>
          </div>

            </div>
          </div>
        )}
      </div>
    </div>
  );
}
