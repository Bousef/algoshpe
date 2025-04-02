'use client';

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function Login() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  //handles login(api is going to go here)
  const handleLogin = () => {

    console.log("Logging in with", { email, password });

    router.push("/dashboard");
  };

  //handles clicking the signup
  const handleSignup = () => {
    router.push('/signup');
  };

  return (
    <div className="min-h-screen bg-[#CAD2C5] text-white flex items-center justify-center">
      <div className="flex w-full max-w-6xl min-h-[600px] bg-[#52796F] rounded-2xl shadow-lg overflow-hidden">
        <div className="w-1/2 hidden md:flex items-center justify-center bg-[#354F52]">
          <Image
            src="/logo.png"
            alt="AlgoSHPE Logo"
            width={1000}
            height={1000}
            className="rounded-lg"
            priority
          />
        </div>

        <div className="w-full md:w-1/2 flex flex-col justify-center items-center p-10 gap-6">
          <h2 className="text-3xl font-bold">Login to AlgoSHPE</h2>

          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-3 rounded-lg border border-black text-white"
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-3 rounded-lg border border-black text-black"
          />

          <button
            onClick={handleLogin}
            className="w-full bg-[#354F52] text-white py-3 px-6 rounded-lg hover:bg-[#2F3E46]"
          >
            Login
          </button>

          <p className="text-sm">
            Don’t have an account?{" "}
            <span
              className="text-blue-200 hover:underline cursor-pointer"
              onClick={handleSignup}
            >
              Sign Up
            </span>
          </p>
        </div>
      </div>
    </div>
  );
}
