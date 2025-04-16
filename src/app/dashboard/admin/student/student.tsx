// show tiles of students like materials 

'use client';

import Image from "next/image";
import { useRouter } from "next/navigation";
import { Montserrat } from 'next/font/google';

const montserrat = Montserrat({ subsets: ['latin'], weight: ['400', '500', '700'] });

export default function Header() {
  const router = useRouter();

  const handleAbout = () => router.push('/dashboard/admin/about');
  const handleAssignments = () => router.push('/dashboard/admin/assignment');
  const handleQandA = () => router.push('/dashboard/admin/qa');
  const handleResources = () => router.push('/dashboard/admin/resources');
  const handleLeaderboard = () => router.push('/dashboard/admin/leaderboard');
  const handleStudent = () => router.push('/dashboard/admin/student');
  const handleLogOut = () => router.push('/logout');

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
      </div>
    </div>
  );
}
