'use client';

import Image from "next/image";
import { useRouter } from "next/navigation";
import { Montserrat } from 'next/font/google';

const montserrat = Montserrat({ subsets: ['latin'], weight: ['400', '500', '700'] });

export default function Page() {
  const router = useRouter();

  const handleAbout = () => router.push('/Assignments');
  const handleQandA = () => router.push('/Q & A');
  const handleResources = () => router.push('/Resources');
  const handleLeadership = () => router.push('/Leadership');
  const handleLogOut = () => router.push('/Log Out');

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
                Assignments
              </div>
              <div onClick={handleQandA} className="text-white cursor-pointer hover:text-[#A1B0A6] transition duration-200">
                Q & A
              </div>
              <div onClick={handleResources} className="text-white cursor-pointer hover:text-[#A1B0A6] transition duration-200">
                Resources
              </div>
              <div onClick={handleLeadership} className="text-white cursor-pointer hover:text-[#A1B0A6] transition duration-200">
                Leadership
              </div>
              <div onClick={handleLogOut} className="text-white cursor-pointer hover:text-[#A1B0A6] transition duration-200">
                Log Out
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="px-4 py-8">
          <h1 className="text-3xl text-white font-semibold mb-8">Assignments Overview</h1>
          
          {/* Main Content: Divided into 4 sections */}
          <div className="flex space-x-4 mb-8"> {/* Flex container for 4 parts */}
            {/* Past Assignments */}
            <div className="flex-1 bg-[#A1B0A6] p-6 rounded-lg">
              <h2 className="text-2xl font-semibold text-white">Past Assignments</h2>
              {/* Add your past assignments content here */}
              <p>Content for past assignments...</p>
            </div>

            {/* Current Assignments */}
            <div className="flex-1 bg-[#5C6B73] p-6 rounded-lg">
              <h2 className="text-2xl font-semibold text-white">Current Assignments</h2>
              {/* Add your current assignments content here */}
              <p>Content for current assignments...</p>
            </div>

            {/* Upcoming Assignments */}
            <div className="flex-1 bg-[#354F52] p-6 rounded-lg">
              <h2 className="text-2xl font-semibold text-white">Upcoming Assignments</h2>
              {/* Add your upcoming assignments content here */}
              <p>Content for upcoming assignments...</p>
            </div>

            {/* Pie Chart */}
            <div className="flex-1 bg-[#8B9A8B] p-6 rounded-lg">
              <h2 className="text-2xl font-semibold text-white">Pie Chart</h2>
              {/* Add your pie chart component here */}
              <p>Pie chart goes here...</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}