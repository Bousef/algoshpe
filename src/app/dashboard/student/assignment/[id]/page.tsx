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

  const handleAbout = () => router.push('/dashboard/student/about');
  const handleAssignment = () => router.push('/dashboard/student/assignment');
  const handleQandA = () => router.push('/dashboard/student/qa');
  const handleResources = () => router.push('/dashboard/student/resources');
  const handleLeaderboard = () => router.push('/dashboard/student/leaderboard');
  const handleLogOut = () => router.push('/');

  const [assignmentId, setAssignmentId] = useState<number | null>(null);
  const [showHints, setShowHints] = useState(false);
  const [theme, setTheme] = useState<"dark" | "light">("light"); // ✅ default to light mode
  const [code, setCode] = useState<string>("");
  const [output, setOutput] = useState<string>("");
  const [studentId, setStudentId] = useState<number | null>(null);
  const [submissions, setSubmissions] = useState<number[]>([]);
  const [activeTab, setActiveTab] = useState<"new" | number>("new");
  const [isCreatingNew, setIsCreatingNew] = useState(true);
  const updateAssignmentStatus = api.student.updateAssignmentStatus.useMutation();

  const { data: assignment, isLoading } = api.assignment.getAssignmentByID.useQuery(
    { id: assignmentId! },
    { enabled: !!assignmentId }
  );

  const createSubmission = api.submission.createSubmission.useMutation();
  const addSubmissionToAssignment = api.assignment.addSubmissionToAssignment.useMutation();
  const runCode = api.python.run.useMutation();

  const { data: submissionIds, isSuccess } = api.assignment.getSubmissionIds.useQuery(
    { assignmentId: assignmentId ?? 0 },
    { enabled: assignmentId !== null }
  );

  const { data: selectedSubmission } = api.submission.getSubmissionById.useQuery(
    { id: activeTab as number },
    {
      enabled: typeof activeTab === "number",
    }
  );

  const levelColors: Record<string, string> = {
    citronaut: "#CAD2C5",
    knight: "#52796F",
    pegasus: "#354F52",
  };


  // Load assignment ID from URL
  useEffect(() => {
    if (typeof id === "string") {
      setAssignmentId(parseInt(id));
    }
  }, [id]);

  useEffect(() => {
    const idFromStorage = localStorage.getItem("Student_ID");
    if (idFromStorage) {
      setStudentId(Number(idFromStorage));
    }
  }, []);

  useEffect(() => {
    if (submissionIds && Array.isArray(submissionIds)) {
      setSubmissions(submissionIds);
    }
  }, [isSuccess, submissionIds]);

  useEffect(() => {
    if (activeTab === "new") {
      setIsCreatingNew(true);
      if (assignment?.starter_code) {
        setCode(assignment.starter_code);
      }
      setOutput("");
    } else if (typeof activeTab === "number" && selectedSubmission) {
      setIsCreatingNew(false);
      setCode(selectedSubmission.code || "");
      setOutput(selectedSubmission.output || "");
    }
  }, [activeTab, assignment, selectedSubmission]);

  const handleRun = () => {
    if (!assignment) return;

    const testCases = JSON.parse(assignment.test_cases || "[]");
    let results: string[] = [];

    const runAllTests = async () => {
      for (let i = 0; i < testCases.length; i++) {
        const match = code.match(/def\s+([a-zA-Z_][a-zA-Z0-9_]*)\s*\(/);
        const functionName = match ? match[1] : "unknown_function";
        const testCode = `${code}\nprint(${functionName}(${JSON.stringify(testCases[i].input)}))`;

        await runCode.mutateAsync({ code: testCode }, {
          onSuccess: (data) => {
            let parsedOutput = data.output.trim();
            if (parsedOutput.startsWith("[") && parsedOutput.endsWith("]")) {
              try {
                const list = eval(parsedOutput); // or JSON.parse with cleanup
                if (Array.isArray(list)) {
                  parsedOutput = list.join(",");
                }
              } catch (e) {
                // fallback: keep as is
              }
            }
            
            const cleanOutput = parsedOutput.toLowerCase().replace(/\s/g, "");
            const expectedOutput = testCases[i].output.toString().toLowerCase().replace(/\s/g, "");
            
            const passed = cleanOutput === expectedOutput;
                     
          
            results.push(
              `Test ${i + 1}: ${passed ? "✅ Passed" : "❌ Failed"}\nYour Output: ${data.output.trim()}\nExpected: ${testCases[i].output}`
            );
          },          
        });
      }

      setOutput(results.join("\n\n"));
    };
    runAllTests();
  };

  const handleSubmit = async () => {
    try {
      if (!studentId || !assignmentId || !code || !output) {
        throw new Error("Missing Submission Data");
      }

      const submission = await createSubmission.mutateAsync({
        studentId: studentId,
        assignmentId: assignmentId,
        code: code,
        output: output,
        status: "Submitted",
      });

      if (!submission) {
        throw new Error("Submission creation failed: No submission Returned");
      }

      await addSubmissionToAssignment.mutateAsync({
        assignmentId: assignmentId,
        submissionId: submission.id,
      });

      setSubmissions(prev => [...prev, submission.id]);
      setActiveTab(submission.id);

      await updateAssignmentStatus.mutateAsync({
        studentId,
        assignmentId,
      });

    } catch (err) {
      console.error("Submission Failed:", err);
    }
  };

  if (isLoading || !assignment) return <p className="p-8">Loading...</p>;

  return (
    <div className={montserrat.className}>
      <div className="bg-[#CAD2C5] min-h-screen">
        <header className="bg-[#354F52] p-2">
          <div className="flex justify-between items-center w-full px-6">
            <Image src="/algoshpelogo.png" alt="AlgoSHPE Logo" width={160} height={160} className="rounded-lg w-24 h-auto" />
            <div className="flex gap-6">
              <div onClick={handleAbout} className="text-white cursor-pointer hover:text-[#A1B0A6]">About</div>
              <div onClick={handleAssignment} className="text-white cursor-pointer hover:text-[#A1B0A6]">Assignments</div>
              <div onClick={handleQandA} className="text-white cursor-pointer hover:text-[#A1B0A6]">Q & A</div>
              <div onClick={handleResources} className="text-white cursor-pointer hover:text-[#A1B0A6]">Resources</div>
              <div onClick={handleLeaderboard} className="text-white cursor-pointer hover:text-[#A1B0A6]">Leaderboard</div>
              <div onClick={handleLogOut} className="text-white cursor-pointer hover:text-[#A1B0A6]">Log Out</div>
            </div>
          </div>
        </header>

        <div className="flex min-h-screen bg-[#F5F5F5]">
          <div className="w-1/3 p-10 bg-white shadow-lg">
            <h1 className="text-3xl font-bold mb-4">{assignment.title}</h1>
              {/* Display level under the title with corresponding color */}
              {assignment.level && (
                <p
                  className="text-sm font-semibold mb-4"
                  style={{ color: levelColors[assignment.level.toLowerCase()] }}
                >
               
                  Level: {assignment.level.charAt(0).toUpperCase() + assignment.level.slice(1)}
                </p>
             
              )}

            <p className="text-gray-700 mb-4">{assignment.description}</p>
            <p className="text-sm text-gray-500 mb-6">Due Date: {assignment.due_date ?? "No due date"}</p>

            <div className="bg-gray-100 p-4 rounded-md mb-6">
              <h2 className="text-lg font-semibold mb-2">Test Cases</h2>
              <ul className="space-y-4">
                {JSON.parse(assignment.test_cases || "[]").map((tc: any, i: number) => (
                  <li key={i} className="text-sm text-gray-700">
                    <p className="font-semibold">Example {i + 1}:</p>
                    <p>
                      <strong>Input:</strong>{" "}
                      {Array.isArray(tc.input)
                        ? tc.input.map((v: any) => JSON.stringify(v)).join(", ")
                        : `n = ${tc.input}`}
                    </p>
                    <p>
                      <strong>Output:</strong>{" "}
                      {Array.isArray(tc.output)
                        ? `[${tc.output.map((v: any) => JSON.stringify(v)).join(", ")}]`
                        : tc.output}
                    </p>

                    {tc.explanation && <p><strong>Explanation:</strong> {tc.explanation}</p>}
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-gray-100 p-4 rounded-md">
              <h2 className="text-lg font-semibold mb-2 cursor-pointer" onClick={() => setShowHints(!showHints)}>
                {showHints ? "▼" : "▶"} Hints
              </h2>
              {showHints && (
                <ul className="list-disc list-inside space-y-2 mt-2">
                  {JSON.parse(assignment.hints || "[]").map((hint: string, i: number) => (
                    <li key={i} className="text-sm text-gray-700">{hint}</li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          <div className="w-2/3 p-10 flex flex-col gap-4">
            {submissions.length > 0 && (
              <div className="flex gap-2 border-b border-gray-300 mb-2">
                {submissions.map((id, index) => (
                  <button
                    key={id}
                    onClick={() => setActiveTab(id)}
                    className={`px-4 py-2 rounded-t-md ${
                      activeTab === id ? "bg-white font-semibold border border-b-transparent" : "bg-gray-200"
                    }`}
                  >
                    Submission {index + 1}
                  </button>
                ))}
                <button
                  onClick={() => setActiveTab("new")}
                  className={`px-4 py-2 rounded-t-md ${
                    activeTab === "new" ? "bg-white font-semibold border border-b-transparent" : "bg-gray-200"
                  }`}
                >
                  ＋
                </button>
              </div>
            )}

            <div className="flex justify-end items-center gap-2">
              <button onClick={handleRun} className="flex items-center gap-1 px-4 py-2 text-white bg-[#52796F] rounded">
                <Image src="/run2.png" alt="Run" width={18} height={18} />
              </button>
              <button onClick={handleSubmit} className="px-4 py-2 text-white bg-[#52796F] rounded">Submit</button>
              <button
                onClick={() => setTheme(prev => (prev === "dark" ? "light" : "dark"))}
                className="px-4 py-2 text-white bg-[#52796F] rounded"
              >
                {theme === "dark" ? "☀️ Light Mode" : "🌙 Dark Mode"}
              </button>
            </div>

            <Editor
              height="50vh"
              value={code}
              onChange={(value) => setCode(value || "")}
              language="python"
              theme={theme === "dark" ? "algoshpe-dark" : "vs-light"}
              onMount={(editor, monaco) => {
                monaco.editor.defineTheme('algoshpe-dark', {
                  base: 'vs-dark',
                  inherit: true,
                  rules: [
                    { token: 'comment', foreground: '6A9955' },
                    { token: 'keyword', foreground: 'C586C0' },
                    { token: 'string', foreground: 'CE9178' },
                    { token: 'number', foreground: 'B5CEA8' },
                    { token: 'type', foreground: '4EC9B0' },
                    { token: 'function', foreground: 'DCDCAA' },
                    { token: 'variable', foreground: '9CDCFE' },
                  ],
                  colors: {
                    'editor.background': '#1E1E1E',
                    'editor.foreground': '#FFFFFF',
                    'editor.lineHighlightBackground': '#2c313a',
                    'editorCursor.foreground': '#FFFFFF',
                    'editorIndentGuide.background': '#404040',
                    'editorLineNumber.foreground': '#858585',
                  }
                });
              }}
              options={{
                fontSize: 14,
                minimap: { enabled: false },
                automaticLayout: true,
              }}
            />

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
