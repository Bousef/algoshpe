'use client';

import Image from "next/image";
import { useRouter } from "next/navigation";
import { Montserrat } from 'next/font/google';

const montserrat = Montserrat({ subsets: ['latin'], weight: ['400', '500', '700'] });

export default function About() {
  const router = useRouter();

  const handleAbout = () => router.push('/dashboard/admin/about');
  const handleAssignments = () => router.push('/dashboard/admin/assignment');
  const handleQandA = () => router.push('/dashboard/admin/qa');
  const handleStudent = () => router.push('/dashboard/admin/student');
  const handleResources = () => router.push('/dashboard/admin/resources');
  const handleLeaderboard = () => router.push('/leaderboard');
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
      {/* Main Content right after header */}
      <main className="py-12 px-6 bg-[#CAD2C5]">
        {/* AlgoSHPE Introduction */}
        <div className="bg-white rounded-2xl shadow-md p-8 mb-12 max-w-3xl mx-auto text-center">
        
          <h1 className="text-3xl font-bold mb-4">What is AlgoSHPE?</h1>
          <p className="text-gray-700 text-lg">
            AlgoSHPE is a coding platform built by students for students — with the goal of helping our community grow within the computer science industry. 
            Designed with SHPE UCF in mind, our mission is to provide a space for practice, collaboration, and fun challenges that level up your skills while 
            staying connected with your peers.
          </p>
        </div>

        {/* Developer Section Title */}
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold">Words from the Developers</h2>
        </div>

        {/* Catalina Section */}
        <div className="bg-white rounded-2xl shadow-md p-8 mb-12 flex flex-col items-center text-center max-w-2xl mx-auto">
          <Image
            src="/catalina.png"
            alt="Catalina Ocampo"
            width={120}
            height={120}
            className="rounded-full mb-4"
          />
          <h2 className="text-2xl font-bold mb-2">Catalina Ocampo</h2>
          <p className="text-gray-700">
            Hey! I’m Catalina, one of the developers behind AlgoSHPE. I’m all about great UI, smooth design, and building tools that make learning programming fun and approachable!
          </p>
        </div>

        {/* Yousef Section */}
        <div className="bg-white rounded-2xl shadow-md p-8 flex flex-col items-center text-center max-w-2xl mx-auto">
          <Image
            src="/teammate.png"
            alt="Yousef"
            width={120}
            height={120}
            className="rounded-full mb-4"
          />
          <h2 className="text-2xl font-bold mb-2">Yousef Osman</h2>
          <p className="text-gray-700">
            Hey! I'm Yousef, one of the developers behind AlgoSHPE. I’m all about great UI, smooth design, and building tools that make learning programming fun and approachable!
          </p>
        </div>
      </main>
    </div>
  </div>
  );
}
