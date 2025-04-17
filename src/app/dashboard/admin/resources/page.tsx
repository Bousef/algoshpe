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

  const [resources, setResources] = useState<Material[]>([]);
  const [selectedTopic, setSelectedTopic] = useState('');
  const [uploading, setUploading] = useState(false);
  const [file, setFile] = useState<File | null>(null);

  const handleAbout = () => router.push('/dashboard/admin/about');
  const handleAssignments = () => router.push('/dashboard/admin/assignment');
  const handleQandA = () => router.push('/dashboard/admin/qa');
  const handleResources = () => router.push('/dashboard/admin/resources');
  const handleLeaderboard = () => router.push('/dashboard/admin/leaderboard');
  const handleStudent = () => router.push('/dashboard/admin/student');
  const handleLogOut = () => router.push('/');

  const fetchResources = async () => {
    const { data, error } = await supabase.from('algoshpe_material').select('*');
    if (error) console.error('Error loading resources:', error.message);
    else setResources(data);
  };

  useEffect(() => {
    fetchResources();
  }, []);

  const filteredResources = resources.filter((r) =>
    selectedTopic && r.file_url.includes(`resources/${selectedTopic}/`)
  );
  

  const handleUpload = async () => {
    if (!file || !selectedTopic) return;
    setUploading(true);

    const filePath = `resources/${selectedTopic}/${file.name}`;
    const { error: uploadError } = await supabase.storage.from('resources').upload(filePath, file, {
      upsert: true,
    });

    if (uploadError) {
      console.error('Upload error:', uploadError.message);
      setUploading(false);
      return;
    }

    const fullUrl = `https://sacogbctkkoaeuhcgzrr.supabase.co/storage/v1/object/public/${filePath}`;

    const { error: insertError } = await supabase.from('algoshpe_material').insert({
      title: file.name,
      file_url: fullUrl,
      uploaded: new Date().toISOString(),
    });

    if (insertError) console.error('DB insert error:', insertError.message);
    setFile(null);
    setUploading(false);
    fetchResources();
  };

  return (
    <div className={montserrat.className}>
      <div className="bg-[#CAD2C5] min-h-screen">
        <header className="bg-[#354F52] p-2">
          <div className="flex justify-between items-center w-full px-6">
            <Image src="/algoshpelogo.png" alt="AlgoSHPE Logo" width={160} height={160} className="rounded-lg w-24 h-auto" />
            <div className="flex gap-6 text-white">
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

        <div className="bg-[#CAD2C5] p-10">
          <div className="bg-[#A1B0A6] p-6 rounded-lg mb-8 text-center">
            <h1 className="text-2xl font-bold text-[#354F52] mb-6">Select a Topic to View Resources</h1>
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

          {selectedTopic && (
            <div className="bg-white p-4 rounded shadow mb-8 text-center">
              <h2 className="text-lg font-bold mb-2 text-[#354F52]">Upload a File for {selectedTopic.replaceAll('_', ' ')}</h2>
              <input
                type="file"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
                className="mb-3"
              />
              <button
                onClick={handleUpload}
                disabled={uploading}
                className="bg-[#52796F] text-white px-4 py-2 rounded hover:bg-[#43635e]"
              >
                {uploading ? 'Uploading...' : 'Upload File'}
              </button>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {selectedTopic && filteredResources.length > 0 ? (
              filteredResources.map((file) => (
                <div key={file.id} className="bg-[#A1B0A6] p-4 rounded shadow flex flex-col justify-between text-center">
                  <h2 className="text-lg font-semibold text-[#354F52]">{file.title}</h2>
                  <p className="text-sm text-gray-500 mt-1">Click below to download this file.</p>
                  <a
                    href={file.file_url}
                    download
                    className="mt-4 inline-block bg-[#52796F] text-white px-4 py-2 rounded hover:bg-[#43635e]"
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
