'use client';

import { useEffect, useState } from 'react';
import { supabase } from 'src/app/utils/supabase';
import { Montserrat } from 'next/font/google';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

const montserrat = Montserrat({ subsets: ['latin'], weight: ['400', '500', '700'] });

const topics = [
  { key: 'introduction', label: 'Introduction' },
  { key: 'arrays_and_strings', label: 'Arrays and Strings' },
  { key: 'hashing', label: 'Hashing' },
  { key: 'linked_lists', label: 'Linked Lists' },
  { key: 'stacks_and_queues', label: 'Stacks and Queues' },
  { key: 'trees_and_graphs', label: 'Trees and Graphs' },
  { key: 'heaps', label: 'Heaps' },
  { key: 'greedy', label: 'Greedy' },
  { key: 'binary_search', label: 'Binary Search' },
  { key: 'backtracking', label: 'Backtracking' },
  { key: 'dynamic_programming', label: 'Dynamic Programming' },
];

type Material = {
  id: number;
  title: string;
  file_url: string;
  uploaded: string | null;
};

export default function Resources() {

  const router = useRouter();

  const handleAbout = () => router.push('/dashboard/student/about');
  const handleAssignments = () => router.push('/dashboard/student/assignment');
  const handleQandA = () => router.push('/dashboard/student/qa');
  const handleResources = () => router.push('/Resources');
  const handleLeaderboard = () => router.push('/leaderboard');
  const handleLogOut = () => router.push('/logout');

  const [resources, setResources] = useState<Material[]>([]);
  const [selectedTopic, setSelectedTopic] = useState('');

  useEffect(() => {
    const fetchResources = async () => {
      const { data, error } = await supabase.from('algoshpe_material').select('*');
      if (error) console.error('Error loading resources:', error.message);
      else setResources(data);
    };

    fetchResources();
  }, []);

  const filteredResources = resources.filter((r) =>
    selectedTopic && r.file_url.includes(`/resources/${selectedTopic}/`)
  );

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

        <div className="bg-[#CAD2C5] p-10">
          <div className="bg-[#A1B0A6] p-6 rounded-lg mb-8 flex flex-col items-center justify-center text-center">
            <h1 className="text-2xl font-bold text-[#354F52] mb-6 text-center">
              Select a Topic to View Resources
            </h1>

            <select
              value={selectedTopic}
              onChange={(e) => setSelectedTopic(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-md mb-6 text-center"
              style={{ textAlignLast: 'center' }}
            >
              <option value="">-- Select a topic --</option>
              {topics.map((topic) => (
                <option key={topic.key} value={topic.key}>
                  {topic.label}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {selectedTopic && filteredResources.length > 0 ? (
              filteredResources.map((file) => (
                <div key={file.id} className="bg-[#A1B0A6] p-4 rounded shadow flex flex-col justify-between text-center">
                  <div>
                    <h2 className="text-lg font-semibold text-[#354F52]">{file.title}</h2>
                    <p className="text-sm text-gray-500 mt-1">Click below to download this file.</p>
                  </div>
                  <a
                    href={file.file_url}
                    download
                    className="mt-4 inline-block bg-[#52796F] text-white px-4 py-2 rounded hover:bg-[#43635e] text-center"
                  >
                    Download
                  </a>
                </div>
              ))
            ) : selectedTopic ? (
              <p className="text-gray-600 col-span-2 text-center">No resources available for this topic.</p>
            ) : (
              <p className="text-gray-600 col-span-2 text-center">Please select a topic to view resources.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
