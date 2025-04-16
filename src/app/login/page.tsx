'use client';

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { api } from "~/trpc/react";
import { Montserrat } from 'next/font/google';

// Import the Montserrat font
const montserrat = Montserrat({ subsets: ['latin'], weight: ['400', '500', '700'] });

export default function Login() {
  const router = useRouter();
  const [username, setUsername] = useState(""); // 🔄 changed from email
  const [password, setPassword] = useState("");
  const loginMutation = api.auth.login.useMutation();

  const handleLogin = async () => {
    try {
      const response = await loginMutation.mutateAsync({
        username: username,
        password: password,
      });
  
      localStorage.setItem("token", response.token);
  
      if (response.user && response.user.username) {
        localStorage.setItem("username", response.user.username);
        if(response?.role == 'Student')
        {
          localStorage.setItem("Student_ID", response.user.id.toString()); //need to store student's id for many apis
        }
      }
  
      if (response?.role === 'Admin') {
        router.push('/dashboard/admin/student');
      } else if (response?.role === 'Student') {
        router.push('/dashboard/student/assignment');
      } else {
        alert("Wrong Info");
      }
  
    } catch (err: any) {
      alert(err.message || "Login failed");
    }
  };  
  

  const handleSignup = () => {
    router.push('/signup');
  };

  return (
    <div className={montserrat.className}> {/* Apply the Montserrat font here */}
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
              type="text"
              placeholder="Username" // 🔄 updated label
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full p-3 rounded-lg border border-black text-white"
            />

            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-3 rounded-lg border border-black text-white"
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
    </div>
  );
}
