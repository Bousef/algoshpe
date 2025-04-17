'use client';

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { api } from "~/trpc/react";
import { supabase } from "src/app/utils/supabase";
import { Montserrat } from 'next/font/google';

const montserrat = Montserrat({ subsets: ['latin'], weight: ['400', '500', '700'] });

export default function SignUp() {
  const router = useRouter();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [ucfid, setUcfid] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isAdmin, setIsAdmin] = useState(false); // ✅

  const createStudent = api.student.createStudent.useMutation();

  const handleSignUp = async () => {
    try {
      const { data, error } = await supabase.auth.signUp({ email, password });
      if (error || !data.user) throw new Error(error?.message || "Signup failed");

      const auth_id = data.user.id;

      // ✅ Register as student
      await createStudent.mutateAsync({
        ucf_id: parseInt(ucfid),
        first_name: firstName,
        last_name: lastName,
        username,
        email,
        password,
      });

      // ✅ Register as admin if selected
      if (isAdmin) {
        const { error: adminErr } = await supabase.from("algoshpe_admin").insert({
          email,
          username,
          password,
          auth_id, // <- must exist in your table schema
        });
        if (adminErr) throw new Error("Admin insert failed: " + adminErr.message);
      }

      router.push("/login");
    } catch (error: any) {
      console.error("Signup failed:", error);
      alert(error.message || "Signup failed");
    }
  };

  const handleLoginRedirect = () => router.push("/login");

  return (
    <div className={montserrat.className}>
      <div className="min-h-screen bg-[#CAD2C5] text-white flex items-center justify-center">
        <div className="flex w-full max-w-6xl min-h-[700px] bg-[#52796F] rounded-2xl shadow-lg overflow-hidden">

          <div className="w-1/2 hidden md:flex items-center justify-center bg-[#354F52]">
            <Image src="/logo.png" alt="AlgoSHPE Logo" width={1000} height={1000} className="rounded-lg" priority />
          </div>

          <div className="w-full md:w-1/2 flex flex-col justify-center items-center p-10 gap-5">
            <h2 className="text-3xl font-bold">Sign Up for AlgoSHPE</h2>

            <div className="flex gap-4 w-full">
              <input type="text" placeholder="First Name" value={firstName} onChange={(e) => setFirstName(e.target.value)} className="w-1/2 p-3 rounded-lg border border-black text-white" />
              <input type="text" placeholder="Last Name" value={lastName} onChange={(e) => setLastName(e.target.value)} className="w-1/2 p-3 rounded-lg border border-black text-white" />
            </div>

            <input type="text" placeholder="UCFID" value={ucfid} onChange={(e) => setUcfid(e.target.value)} className="w-full p-3 rounded-lg border border-black text-white" />
            <input type="text" placeholder="Username" value={username} onChange={(e) => setUsername(e.target.value)} className="w-full p-3 rounded-lg border border-black text-white" />
            <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full p-3 rounded-lg border border-black text-white" />
            <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full p-3 rounded-lg border border-black text-white" />

            {/* ✅ Admin checkbox */}
            <label className="flex items-center gap-2">
              <input type="checkbox" checked={isAdmin} onChange={() => setIsAdmin(!isAdmin)} />
              <span className="text-white">Sign up as Admin</span>
            </label>

            <button onClick={handleSignUp} className="w-full bg-[#354F52] text-white py-3 px-6 rounded-lg hover:bg-[#2F3E46]">
              Sign Up
            </button>

            <p className="text-sm">
              Already have an account?{" "}
              <span className="text-blue-200 hover:underline cursor-pointer" onClick={handleLoginRedirect}>
                Login
              </span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

