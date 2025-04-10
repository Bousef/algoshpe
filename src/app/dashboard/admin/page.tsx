'use client';

import Image from "next/image";
import { useRouter } from "next/navigation";

export default function AdminDashboard() {
  const router = useRouter();
  
  const handleLogin = () => {
    router.push('/login');
  };

  const handleSignup = () => {
    router.push('/signup');
  };

  return (
    <div className="min-h-screen bg-[#CAD2C5] text-white flex items-center justify-center">
      <div className="flex flex-col items-center text-center px-6 py-6 gap-8">
        {/* Logo Image */}
        <Image
          src="/logo.png"
          alt="AlgoSHPE Logo"
          width={1000}
          height={1000}
          className="rounded-lg"
          priority
        />

        {/* Buttons */}
        <div className="flex flex-row gap-6">
          <button
            onClick={handleLogin}
            className="text-xl text-white bg-[#354F52] hover:text-blue-100 font-montserrat font-light py-2 px-6 border border-black rounded-lg"
          >
            Login
          </button>
          <button
            onClick={handleSignup}
            className="text-xl text-white bg-[#354F52] hover:text-blue-100 font-montserrat font-light py-2 px-6 border border-black rounded-lg"
          >
            Sign Up
          </button>
        </div>
      </div>
    </div>
  );
}
