'use client';

import Image from "next/image";
import { useRouter } from "next/navigation";
import { Montserrat } from 'next/font/google';
import { api } from '~/trpc/react';
import { useState, useEffect, useRef } from 'react';

const montserrat = Montserrat({ subsets: ['latin'], weight: ['400', '500', '700'] });

export default function StudentGridPage() {
  const router = useRouter();
  const { data: students = [] } = api.student.getAllStudents.useQuery();
  const [openMenuId, setOpenMenuId] = useState<number | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);
  const [showInputModal, setShowInputModal] = useState<null | any>(null); // Changed type to any
  const [modalType, setModalType] = useState<"points" | "attendance" | null>(null);
  const [inputValue, setInputValue] = useState('');
  const [currentPoints, setCurrentPoints] = useState<number>(0);
  const utils = api.useUtils();


  const updateStudent = api.student.updateStudent.useMutation({
    onSuccess: () => {
      utils.student.getAllStudents.invalidate();
      setShowInputModal(null);
      setInputValue('');
    },
  });

  const deleteStudent = api.student.deleteStudent.useMutation({
    onSuccess: () => utils.student.getAllStudents.invalidate(),
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

  const sortedStudents = [...students].sort((a, b) => {
    const nameA = `${a.first_name ?? ''} ${a.last_name ?? ''}`.trim().toLowerCase();
    const nameB = `${b.first_name ?? ''} ${b.last_name ?? ''}`.trim().toLowerCase();
    return nameA.localeCompare(nameB);
  });

  const handleAbout = () => router.push('/dashboard/admin/about');
  const handleAssignments = () => router.push('/dashboard/admin/assignment');
  const handleQandA = () => router.push('/dashboard/admin/qa');
  const handleResources = () => router.push('/dashboard/admin/resources');
  const handleLeaderboard = () => router.push('/dashboard/admin/leaderboard');
  const handleStudent = () => router.push('/dashboard/admin/student');
  const handleLogOut = () => router.push('/');

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
          {sortedStudents.length === 0 ? (
            <div className="text-center text-xl text-gray-600 mt-10">
              No Students in DB
            </div>
          ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {sortedStudents.map((student) => {
              const fullName = `${student.first_name ?? ''} ${student.last_name ?? ''}`.trim() || student.username;
              return (
                <div key={student.id} className="bg-white p-8 min-h-[180px] rounded-2xl shadow text-center relative flex flex-col justify-center items-center">
                  <div className="absolute top-2 right-2">
                    <button
                      onClick={() => setOpenMenuId(openMenuId === student.id ? null : student.id)}
                      className="cursor-pointer text-gray-500 text-lg"
                    >
                      ⋮
                    </button>
                    {openMenuId === student.id && (
                      <div ref={menuRef} className="absolute right-0 mt-1 w-40 bg-white border rounded shadow-md z-10">
                        <button
                          onClick={function handleDeleteClick() {
                            console.log("Deleting student with ID:", student.id);
                            deleteStudent.mutate({ id: student.id });
                          }}
                          className="block w-full text-left px-4 py-2 hover:bg-gray-100 text-sm"
                        >
                          Remove Student
                        </button>
                        <button
                          onClick={() => {
                            setShowInputModal(student);  // Set the full student object
                            setModalType("points");
                            setCurrentPoints(student.algoshpe_points ?? 0);
                          }}
                          className="block w-full text-left px-4 py-2 hover:bg-gray-100 text-sm"
                        >
                          Add Points
                        </button>
                        <button onClick={() => { 
                          setShowInputModal(student);  // Set the full student object
                          setModalType("attendance"); 
                        }} className="block w-full text-left px-4 py-2 hover:bg-gray-100 text-sm">
                          Add Attendance
                        </button>
                      </div>
                    )}
                  </div>
                  <p className="text-2xl font-extrabold text-[#354F52]">{fullName}</p>
                  <p className="text-lg text-gray-600 mt-2">Points: {student.algoshpe_points ?? 0}</p>
                  <p className="text-lg text-gray-600 mt-2">Attendance: {student.attendance ?? 0}</p>
                </div>
              );
            })}
          </div>
          )}
        </div>
      </div>
      {showInputModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded shadow-md w-80">
            <h2 className="text-lg font-semibold mb-4">
              Enter {modalType === "points" ? "Points" : "Attendance"} to Add
            </h2>
            <input
              type="number"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              className="w-full p-2 border rounded mb-4"
              placeholder="e.g. 10"
            />
            <div className="flex justify-end gap-2">
              <button onClick={() => setShowInputModal(null)} className="px-4 py-2 bg-gray-200 rounded">Cancel</button>
              <button
                onClick={() => {
                  const value = parseInt(inputValue);
                  if (!isNaN(value)) {
                    const student = showInputModal;  // Use the full student object

                    // Get the current attendance and points from the student object
                    const currentAttendance = student.attendance ?? 0;  // Default to 0 if no attendance
                    const currentPoints = student.algoshpe_points ?? 0;  // Default to 0 if no points

                    // Add the new attendance value to the current attendance
                    const updatedAttendance = currentAttendance + value;

                    // Calculate new points by adding 10 for each attendance
                    const newPoints = currentPoints + (value * 10);

                    // Prepare the update data with both attendance and points
                    const updateData = modalType === "points"
                      ? { id: student.id, algoshpe_points: currentPoints + value } // Adding points
                      : { id: student.id, attendance: updatedAttendance, algoshpe_points: newPoints }; // Adding attendance and points

                    // Trigger the mutation to update the student data
                    updateStudent.mutate(updateData, {
                      onSuccess: () => {
                        utils.student.getAllStudents.invalidate();  // Refetch the student data
                        setShowInputModal(null);  // Close the modal
                        setInputValue('');  // Clear the input field
                      },
                      onError: (error) => {
                        console.error("Error updating student:", error);
                        alert("Failed to update student data.");
                      },
                    });
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
    </div>
  );
}
