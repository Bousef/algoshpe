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

  //state variables
  const [openMenuId, setOpenMenuId] = useState<number | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);
  const [showInputModal, setShowInputModal] = useState<null | { assignmentId: number }>(null);
  const [showStudents, setShowStudents] = useState<null | any>(null); 
  const [allStudents, setAllStudents] = useState([]);
  const [selectedStudents, setSelectedStudents] = useState<number[]>([]);
  const [modalType, setModalType] = useState<"edit" | "delete" | "create"  | "assign" | null>(null);  const [inputValue, setInputValue] = useState('');
  const [newAssignmentLevel, setNewAssignmentLevel] = useState<string | null>(null);

  const [newAssignmentData, setNewAssignmentData] = useState({
    title: '',
    description: '',
    due_date: '',
    starter_code: '',
    test_cases: '',
    hints: '',
  });

  
  //call apis

  //grab 
  const {
    data: students,
    isLoading: isStudentsLoading,
    error: studentsError,
  } = api.student.getAllStudents.useQuery();

  /*
  useEffect(() => {
    if (students) {
      setAllStudents(students);
    }
  }, [students]);
*/

  if (isStudentsLoading) return <div className="animate-spin">🌀</div>;
  if (studentsError) return <div> No Students in DB</div>;


  const {
    data: assignments = [],
    isLoading,
    isError,
    error,
  } = api.assignment.getAssignments.useQuery(); //get


  const assignMutation = api.student.assignStudentsToAssignment.useMutation({
    onSuccess: () => {
      console.log("Assigned successfully!");
      setShowStudents(null);
      setSelectedStudents([]);
    },
  });

  const updateAssignment = api.assignment.updateAssignment.useMutation({ //update
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

  const handleAbout = () => router.push('/dashboard/admin/about');
  const handleAssignments = () => router.push('/dashboard/admin/assignment');
  const handleQandA = () => router.push('/dashboard/admin/qa');
  const handleResources = () => router.push('/dashboard/admin/resources');
  const handleLeaderboard = () => router.push('/dashboard/admin/leaderboard');
  const handleStudent = () => router.push('/dashboard/admin/student');
  const handleLogOut = () => router.push('/');

  const handleDeleteClick = (assignmentId: number) => {
    console.log("Deleting assignment with ID:", assignmentId);
    deleteAssignment.mutate({ id: assignmentId });
  };

  return (
    <div className={montserrat.className}>
      <div className="bg-[#CAD2C5] min-h-screen">
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
              <div onClick={handleStudent} className="text-white cursor-pointer hover:text-[#A1B0A6] transition duration-200">
                Students
              </div>
              <div onClick={handleAssignments} className="text-white cursor-pointer hover:text-[#A1B0A6] transition duration-200">
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
        <div className="p-10">
          <div className="mb-8 bg-[#6A8C7B] p-6 rounded-lg">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-center w-full">Citronaut</h2>
              <button
                className="text-white text-2xl font-bold"
                onClick={() => {
                  setModalType("create");
                  setNewAssignmentLevel("citronaut");
                }}
              >
                +
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {groupedAssignments.citronaut.length === 0 ? (
                <p className="text-white text-center w-full">No assignments found</p>
              ) : (
                groupedAssignments.citronaut.map((assignment) => (
                  <div key={assignment.id} className="bg-white p-8 min-h-[180px] rounded-2xl shadow text-center relative flex flex-col justify-center items-center">
                    <div className="absolute top-2 right-2">
                      <button
                        onClick={() => setOpenMenuId(openMenuId === assignment.id ? null : assignment.id)}
                        className="cursor-pointer text-gray-500 text-lg"
                      >
                        ⋮
                      </button>
                      {openMenuId === assignment.id && (
                        <div ref={menuRef} className="absolute right-0 mt-1 w-40 bg-white border rounded shadow-md z-10">
                          <button
                            onClick={() => handleDeleteClick(assignment.id)}
                            className="block w-full text-left px-4 py-2 hover:bg-gray-100 text-sm"
                          >
                            Remove Assignment
                          </button>
                          <button onClick={() => { setShowStudents({ assignmentId: assignment.id }); setModalType("assign"); }} className="block w-full text-left px-4 py-2 hover:bg-gray-100 text-sm">Assign to Student/s</button>
                          <button onClick={() => { setShowInputModal({ assignmentId: assignment.id }); setModalType("edit"); }} className="block w-full text-left px-4 py-2 hover:bg-gray-100 text-sm">Edit Assignment</button>
                        </div>
                      )}
                    </div>
                    <p className="text-2xl font-extrabold text-[#354F52]">{assignment.title}</p>
                    <p className="text-lg text-gray-600 mt-2">
                      Due Date: {assignment.due_date ? new Date(assignment.due_date).toLocaleDateString() : 'N/A'}
                    </p>                  
                  </div>
                ))
              )}
            </div>
          </div>
          <div className="mb-8 bg-[#52796F] p-6 rounded-lg">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-center w-full">Knight</h2>
              <button
                className="text-white text-2xl font-bold"
                onClick={() => {
                  setModalType("create");
                  setNewAssignmentLevel("knight");
                }}
              >
                +
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {groupedAssignments.knight.length === 0 ? (
                <p className="text-white text-center w-full">No assignments found</p>
              ) : (
                groupedAssignments.knight.map((assignment) => (
                  <div key={assignment.id} className="bg-white p-8 min-h-[180px] rounded-2xl shadow text-center relative flex flex-col justify-center items-center">
                    <div className="absolute top-2 right-2">
                      <button
                        onClick={() => setOpenMenuId(openMenuId === assignment.id ? null : assignment.id)}
                        className="cursor-pointer text-gray-500 text-lg"
                      >
                        ⋮
                      </button>
                      {openMenuId === assignment.id && (
                        <div ref={menuRef} className="absolute right-0 mt-1 w-40 bg-white border rounded shadow-md z-10">
                          <button
                            onClick={() => handleDeleteClick(assignment.id)}
                            className="block w-full text-left px-4 py-2 hover:bg-gray-100 text-sm"
                          >
                            Remove Assignment
                          </button>
                          <button onClick={() => { setShowStudents({ assignmentId: assignment.id }); setModalType("assign"); }} className="block w-full text-left px-4 py-2 hover:bg-gray-100 text-sm">Assign to Student/s</button>
                          <button onClick={() => { setShowInputModal({ assignmentId: assignment.id }); setModalType("edit"); }} className="block w-full text-left px-4 py-2 hover:bg-gray-100 text-sm">Edit Assignment</button>
                        </div>
                      )}
                    </div>
                    <p className="text-2xl font-extrabold text-[#354F52]">{assignment.title}</p>
                    <p className="text-lg text-gray-600 mt-2">
                      Due Date: {assignment.due_date ? new Date(assignment.due_date).toLocaleDateString() : 'N/A'}
                    </p>                  
                  </div>
                ))
              )}
            </div>
          </div>
          <div className="mb-8 bg-[#354F52] p-6 rounded-lg">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-center w-full">Pegasus</h2>
              <button
                className="text-white text-2xl font-bold"
                onClick={() => {
                  setModalType("create");
                  setNewAssignmentLevel("pegasus");
                }}
              >
                +
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {groupedAssignments.pegasus.length === 0 ? (
                <p className="text-white text-center w-full">No assignments found</p>
              ) : (
                groupedAssignments.pegasus.map((assignment) => (
                  <div key={assignment.id} className="bg-white p-8 min-h-[180px] rounded-2xl shadow text-center relative flex flex-col justify-center items-center">
                    <div className="absolute top-2 right-2">
                      <button
                        onClick={() => setOpenMenuId(openMenuId === assignment.id ? null : assignment.id)}
                        className="cursor-pointer text-gray-500 text-lg"
                      >
                        ⋮
                      </button>
                      {openMenuId === assignment.id && (
                        <div ref={menuRef} className="absolute right-0 mt-1 w-40 bg-white border rounded shadow-md z-10">
                          <button
                            onClick={() => handleDeleteClick(assignment.id)}
                            className="block w-full text-left px-4 py-2 hover:bg-gray-100 text-sm"
                          >
                            Remove Assignment
                          </button>
                          <button onClick={() => { setShowStudents({ assignmentId: assignment.id }); setModalType("assign"); }} className="block w-full text-left px-4 py-2 hover:bg-gray-100 text-sm">Assign to Student/s</button>
                          <button onClick={() => { setShowInputModal({ assignmentId: assignment.id }); setModalType("edit"); }} className="block w-full text-left px-4 py-2 hover:bg-gray-100 text-sm">Edit Assignment</button>
                        </div>
                      )}
                    </div>
                    <p className="text-2xl font-extrabold text-[#354F52]">{assignment.title}</p>
                    <p className="text-lg text-gray-600 mt-2">
                      Due Date: {assignment.due_date ? new Date(assignment.due_date).toLocaleDateString() : 'N/A'}
                    </p>                  
                  </div>
                ))
              )}
            </div>
          </div>
        </div> 


        {showStudents && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded shadow-md w-[90%] max-w-md max-h-[80%] overflow-auto">
            <h2 className="text-lg font-semibold mb-4">Assign to Students</h2>
            
            {/* Select All Checkbox */}
            <div className="mb-4">
              <label className="inline-flex items-center">
                <input
                  type="checkbox"
                  checked={selectedStudents.length === allStudents.length}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setSelectedStudents(allStudents.map((s: any) => s.id));
                    } else {
                      setSelectedStudents([]);
                    }
                  }}
                />
                <span className="ml-2">Select All</span>
              </label>
            </div>

            {/* List of Students */}
            <div className="space-y-2 max-h-60 overflow-y-auto border rounded p-2">
              {allStudents.map((student: any) => (
                <label key={student.id} className="flex items-center">
                  <input
                    type="checkbox"
                    checked={selectedStudents.includes(student.id)}
                    onChange={() => {
                      setSelectedStudents((prev) =>
                        prev.includes(student.id)
                          ? prev.filter((id) => id !== student.id)
                          : [...prev, student.id]
                      );
                    }}
                  />
                  <span className="ml-2">{student.first_name} {student.last_name}</span>
                </label>
              ))}
            </div>

            {/* Buttons */}
            <div className="flex justify-end gap-2 mt-4">
              <button onClick={() => { setShowStudents(null); setSelectedStudents([]); }} className="px-4 py-2 bg-gray-200 rounded">Cancel</button>
              <button
                onClick={() => {
                  // Handle the assign action
                  console.log("Assigned to students:", selectedStudents);
                  setShowStudents(null);
                  setSelectedStudents([]);
                }}
                className="px-4 py-2 bg-[#52796F] text-white rounded"
              >
                Assign
              </button>
            </div>
          </div>
        </div>
      )}

      {showInputModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded shadow-md w-80">
            <h2 className="text-lg font-semibold mb-4">
              {modalType === "edit" ? "Edit Assignment" : "Remove Assignment"}
            </h2>
            {modalType === "edit" && (
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                className="w-full p-2 border rounded mb-4"
                placeholder="Assignment Title"
              />
            )}
            <div className="flex justify-end gap-2">
              <button onClick={() => setShowInputModal(null)} className="px-4 py-2 bg-gray-200 rounded">Cancel</button>
              <button
                onClick={() => {
                  if (modalType === "edit") {
                    updateAssignment.mutate({ id: showInputModal.assignmentId, title: inputValue });
                  } else {
                    deleteAssignment.mutate({ id: showInputModal.assignmentId });
                  }
                }}
                className="px-4 py-2 bg-[#52796F] text-white rounded"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
      {showStudents && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded shadow-md w-[90%] max-w-md max-h-[80%] overflow-auto">
            <h2 className="text-lg font-semibold mb-4">Assign to Students</h2>
            <div className="mb-4">
              <label className="inline-flex items-center">
                <input
                  type="checkbox"
                  checked={selectedStudents.length === allStudents.length}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setSelectedStudents(allStudents.map((s: any) => s.id));
                    } else {
                      setSelectedStudents([]);
                    }
                  }}
                />
                <span className="ml-2">Select All</span>
              </label>
            </div>
            <div className="space-y-2 max-h-60 overflow-y-auto border rounded p-2">
              {allStudents.map((student: any) => (
                <label key={student.id} className="flex items-center">
                  <input
                    type="checkbox"
                    checked={selectedStudents.includes(student.id)}
                    onChange={() => {
                      setSelectedStudents((prev) =>
                        prev.includes(student.id)
                          ? prev.filter((id) => id !== student.id)
                          : [...prev, student.id]
                      );
                    }}
                  />
                  <span className="ml-2">{student.first_name} {student.last_name}</span>
                </label>
              ))}
            </div>
            <div className="flex justify-end gap-2 mt-4">
              <button onClick={() => { setShowStudents(null); setSelectedStudents([]); }} className="px-4 py-2 bg-gray-200 rounded">Cancel</button>
              <button
                onClick={() => {
                  // TODO: Call assign-to-students mutation
                  console.log("Assigning to:", selectedStudents);
                  setShowStudents(null);
                  setSelectedStudents([]);
                }}
                className="px-4 py-2 bg-[#52796F] text-white rounded"
              >
                Assign
              </button>
            </div>
          </div>
        </div>
      )}
      {modalType === "create" && newAssignmentLevel && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded shadow-md w-[90%] max-w-md">
            <h2 className="text-lg font-semibold mb-4">Create {newAssignmentLevel} Assignment</h2>
            <input
              type="text"
              placeholder="Title"
              value={newAssignmentData.title}
              onChange={(e) => setNewAssignmentData({ ...newAssignmentData, title: e.target.value })}
              className="w-full mb-2 p-2 border rounded"
            />
            <textarea
              placeholder="Description"
              value={newAssignmentData.description}
              onChange={(e) => setNewAssignmentData({ ...newAssignmentData, description: e.target.value })}
              className="w-full mb-2 p-2 border rounded"
            />
            <input
              type="date"
              value={newAssignmentData.due_date}
              onChange={(e) => setNewAssignmentData({ ...newAssignmentData, due_date: e.target.value })}
              className="w-full mb-2 p-2 border rounded"
            />
            <textarea
              placeholder="Starter Code"
              value={newAssignmentData.starter_code}
              onChange={(e) => setNewAssignmentData({ ...newAssignmentData, starter_code: e.target.value })}
              className="w-full mb-2 p-2 border rounded"
            />
            <textarea
              placeholder="Test Cases (JSON)"
              value={newAssignmentData.test_cases}
              onChange={(e) => setNewAssignmentData({ ...newAssignmentData, test_cases: e.target.value })}
              className="w-full mb-2 p-2 border rounded"
            />
            <textarea
              placeholder="Hints (JSON)"
              value={newAssignmentData.hints}
              onChange={(e) => setNewAssignmentData({ ...newAssignmentData, hints: e.target.value })}
              className="w-full mb-2 p-2 border rounded"
            />
            <div className="flex justify-end gap-2">
              <button onClick={() => { setModalType(null); setNewAssignmentLevel(null); }} className="px-4 py-2 bg-gray-200 rounded">Cancel</button>
              <button onClick={() => createAssignment.mutate({ ...newAssignmentData, level: newAssignmentLevel, due_date: new Date(newAssignmentData.due_date) })} className="px-4 py-2 bg-[#52796F] text-white rounded">Create</button>
            </div>
          </div>
        </div>
      )}
      </div>
    </div>
  );
}
