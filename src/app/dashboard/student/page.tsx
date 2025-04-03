'use client';

import Image from "next/image";
import { useRouter } from "next/navigation";
import { Montserrat } from 'next/font/google';

const montserrat = Montserrat({ subsets: ['latin'], weight: ['400', '500', '700'] });

export default function Header() {
  const router = useRouter();

  const handleAbout = () => {
    router.push('/Assignments'); // Assignments page
  };

  const handleQandA = () => {
    router.push('/Q & A'); // Q & A page
  };

  const handleResources = () => {
    router.push('/Resources'); // Resources page
  };

  const handleLeadership = () => {
    router.push('/Leadership'); // Leadership page
  };

  const handleLogOut = () => {
    router.push('/Log Out'); // Log Out page
  };

  return (
    <div className={montserrat.className}>
    <div className="bg-[#CAD2C5] min-h-screen">
      <header className="bg-[#354F52]">
        <div className="flex justify-between items-center max-w-7xl mx-auto ">
          {/* Logo on the left */}
          <div className="flex items-center">
            <Image
              src="/algoshpelogo.png"
              alt="AlgoSHPE Logo"
              width={300} 
              height={300}
              className="rounded-lg w-24 h-auto"
            />
          </div>

          {/* Navigation links on the right */}
          <div className="flex gap-6">
            <div
              onClick={handleAbout}
              className="text-white cursor-pointer hover:text-[#A1B0A6] transition duration-200"
            >
              Assignments
            </div>
            <div
              onClick={handleQandA}
              className="text-white cursor-pointer hover:text-[#A1B0A6] transition duration-200"
            >
              Q & A
            </div>
            <div
              onClick={handleResources}
              className="text-white cursor-pointer hover:text-[#A1B0A6] transition duration-200"
            >
              Resources
            </div>
            <div
              onClick={handleLeadership}
              className="text-white cursor-pointer hover:text-[#A1B0A6] transition duration-200"
            >
              Leadership
            </div>
            <div
              onClick={handleLogOut}
              className="text-white cursor-pointer hover:text-[#A1B0A6] transition duration-200"
            >
              Log Out
            </div>
          </div>
        </div>
      </header>
    </div>
    </div>
  );
}