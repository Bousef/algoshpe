'use client';

import Image from "next/image";
import { useRouter } from "next/navigation";

export default function Header() {
  const router = useRouter();

  // Navigation handlers for different pages
  const handleHome = () => {
    router.push('/'); // Home page
  };

  const handleAbout = () => {
    router.push('/about'); // About page
  };

  const handleContact = () => {
    router.push('/contact'); // Contact page
  };

  return (
    <header className="bg-[#354F52] p-4">
      <div className="flex justify-between items-center max-w-7xl mx-auto">
        {/* Logo on the left */}
        <div className="flex items-center">
          <Image
            src="/logo.png"
            alt="AlgoSHPE Logo"
            width={50}
            height={50}
            className="rounded-lg"
          />
        </div>

        {/* Navigation buttons on the right */}
        <div className="flex gap-4">
          <button
            onClick={handleHome}
            className="text-white bg-[#5C6B73] py-2 px-4 rounded-lg hover:bg-[#4A5559]"
          >
            Home
          </button>
          <button
            onClick={handleAbout}
            className="text-white bg-[#5C6B73] py-2 px-4 rounded-lg hover:bg-[#4A5559]"
          >
            About
          </button>
          <button
            onClick={handleContact}
            className="text-white bg-[#5C6B73] py-2 px-4 rounded-lg hover:bg-[#4A5559]"
          >
            Contact
          </button>
        </div>
      </div>
    </header>
  );
}