// ✅ Resources.tsx - Student view, dynamically loads from Supabase DB

'use client';

import { useEffect, useState } from 'react';
import { supabase } from 'src/app/utils/supabase';
import { Montserrat } from 'next/font/google';

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
      <div className="bg-[#CAD2C5] min-h-screen p-10">
        <h1 className="text-2xl font-bold text-[#354F52] mb-6">Select a Topic to View Resources</h1>

        <select
          value={selectedTopic}
          onChange={(e) => setSelectedTopic(e.target.value)}
          className="w-full p-3 border border-gray-300 rounded-md mb-6"
        >
          <option value="">-- Select a topic --</option>
          {topics.map((topic) => (
            <option key={topic.key} value={topic.key}>{topic.label}</option>
          ))}
        </select>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {selectedTopic && filteredResources.length > 0 ? (
            filteredResources.map((file) => (
              <div key={file.id} className="bg-white p-4 rounded shadow flex flex-col justify-between">
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
            <p className="text-gray-600 col-span-2">No resources available for this topic.</p>
          ) : (
            <p className="text-gray-600 col-span-2">Please select a topic to view resources.</p>
          )}
        </div>
      </div>
    </div>
  );
}
