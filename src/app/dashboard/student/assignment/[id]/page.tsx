'use client';

import Image from "next/image";
import { useRouter, useParams } from "next/navigation";
import { Montserrat } from 'next/font/google';
import { useEffect, useState } from "react";
import { api } from "~/trpc/react";
import Editor from "@monaco-editor/react";

const montserrat = Montserrat({ subsets: ['latin'], weight: ['400', '500', '700'] });

export default function AssignmentDetailPage() {
  const router = useRouter();
  const { id } = useParams();
  const [assignmentId, setAssignmentId] = useState<number | null>(null);

  useEffect(() => {
    if (typeof id === "string") {
      setAssignmentId(parseInt(id));
    }
  }, [id]);

  const { data: assignment, isLoading } = api.assignment.getAssignmentByID.useQuery(
    { id: assignmentId! },
    { enabled: !!assignmentId }
  );

  const handleAbout = () => router.push('/dashboard/student/about');
  const handleAssignments = () => router.push('/dashboard/student/assignment');
  const handleQandA = () => router.push('/dashboard/student/qa');
  const handleResources = () => router.push('/Resources');
  const handleLeaderboard = () => router.push('/leaderboard');
  const handleLogOut = () => router.push('/logout');

  const [theme, setTheme] = useState<"vs-dark" | "light">("vs-dark");
  const [language, setLanguage] = useState<"java" | "python">("python");
  const [code, setCode] = useState<string>("");
  const [output, setOutput] = useState<string>("");

  const handleSave = () => {
    // Save logic
    console.log("Code saved:", code);
  };
  
  const handleRun = () => {
    // For now, just simulate code execution output
    setOutput(`Running ${language.toUpperCase()}...\n\n${code}`);
  };

  if (isLoading || !assignment) return <p className="p-8">Loading...</p>;

  return (
    <div className={montserrat.className}>
      <div className="bg-[#CAD2C5] min-h-screen">
        {/* Header */}
        <header className="bg-[#354F52] p-2">
          <div className="flex justify-between items-center w-full px-6">
            <Image
              src="/algoshpelogo.png"
              alt="AlgoSHPE Logo"
              width={160}
              height={160}
              className="rounded-lg w-24 h-auto"
            />

            <div className="flex gap-6">
              {[
                { label: "About", handler: handleAbout },
                { label: "Assignments", handler: handleAssignments },
                { label: "Q & A", handler: handleQandA },
                { label: "Resources", handler: handleResources },
                { label: "Leaderboard", handler: handleLeaderboard },
                { label: "Log Out", handler: handleLogOut },
              ].map(({ label, handler }) => (
                <div
                  key={label}
                  onClick={handler}
                  className="text-white cursor-pointer hover:text-[#A1B0A6] transition duration-200"
                >
                  {label}
                </div>
              ))}
            </div>
          </div>
        </header>

        {/* Content */}
        <div className="flex min-h-screen bg-[#F5F5F5]">
          {/* Left Panel - Description */}
          <div className="w-1/3 p-10 bg-white shadow-lg">
            <h1 className="text-3xl font-bold mb-4">{assignment.title}</h1>
            <p className="text-gray-700 mb-4">{assignment.description}</p>
            <p className="text-sm text-gray-500">
              Due Date: {assignment.due_date ?? "No due date"}
            </p>
          </div>

          {/* Right Panel - Editor & Output */}
            <div className="w-2/3 p-10 flex flex-col gap-4">
            {/* Controls */}
            <div className="flex justify-between items-center">
                <div className="flex items-center gap-4">
                <label className="font-medium text-gray-700">Language:</label>
                <select
                    value={language}
                    onChange={(e) => setLanguage(e.target.value as "java" | "python")}
                    className="px-3 py-2 rounded border"
                >
                    <option value="python">Python</option>
                    <option value="java">Java</option>
                </select>
                </div>

                <div className="flex gap-2">
                <button
                    onClick={handleRun}
                    className="flex items-center gap-1 px-4 py-2 text-white bg-[#52796F] rounded hover:bg-[#52796F] transition"
                    >
                    <Image src="/run2.png" alt="Run" width={18} height={18} />
                
                </button>
                        
                <button
                    onClick={handleSave}
                    className="px-4 py-2 text-white bg-[#52796F] rounded hover:bg-[#52796F] transition"
                >
                    Submit
                </button>
                <button
                    onClick={() => setTheme(prev => (prev === "vs-dark" ? "light" : "vs-dark"))}
                    className="px-4 py-2 text-white bg-[#52796F] rounded hover:bg-[#52796F] transition"
                >
                    {theme === "vs-dark" ? "Light" : "Dark"} Mode
                </button>
                </div>
            </div>

            {/* Editor */}
            <Editor
                height="50vh"
                language={language}
                value={code}
                onChange={(value) => setCode(value || "")}
                theme={theme}
                options={{
                fontSize: 14,
                minimap: { enabled: false },
                automaticLayout: true,
                }}
            />

            {/* Output Section */}
            <div className="bg-black text-white p-4 rounded-md font-mono h-40 overflow-y-auto">
                <p className="text-green-400 font-semibold mb-2">Console Output:</p>
                <pre className="whitespace-pre-wrap">{output || "No output yet..."}</pre>
            </div>
            </div>
        </div>
      </div>
    </div>
  );
}