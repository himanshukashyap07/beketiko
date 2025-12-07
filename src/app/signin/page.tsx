"use client";

import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "react-toastify";

export default function page() {
  const [identifier, serIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

   try {
     const res = await signIn("credentials", {
       identifier,
       password,
       redirect: false,
     });
     console.log(res);
     if (res?.error) {
      toast.error(res.error)
      return;
     }
     
     toast.success("User logged in successfully");
      router.replace("/friends");
     
   } catch (error:any) {
    console.log(error);
    toast.error(error)
    
   }
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-purple-500 via-pink-400 to-yellow-300 flex items-center justify-center p-5">

      {/* Glassmorphic Card */}
      <form
        onSubmit={handleSubmit}
        className="w-96 backdrop-blur-xl bg-white/30 border border-white/40 shadow-2xl p-8 rounded-2xl text-white"
      >
        <h2 className="text-3xl font-extrabold text-center mb-8 drop-shadow-lg">
          Welcome Back
        </h2>

        {/* Identifier Input */}
        <label className="block mb-2 font-semibold tracking-wide">
          Email / Username / Number
        </label>
        <input
          type="text"
          value={identifier}
          onChange={(e) => serIdentifier(e.target.value)}
          className="w-full px-4 py-3 rounded-xl bg-white/20 text-white placeholder-white border border-white/50 
                     focus:ring-2 focus:ring-white focus:outline-none shadow-md mb-6"
          placeholder="Enter your identifier"
          required
        />

        {/* Password Input */}
        <label className="block mb-2 font-semibold">Password</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full px-4 py-3 rounded-xl bg-white/20 text-white placeholder-white border border-white/50 
                     focus:ring-2 focus:ring-white focus:outline-none shadow-md mb-8"
          placeholder="Enter your password"
          required
        />

        {/* Login Button */}
        <button
          type="submit"
          className="w-full py-3 bg-linear-to-r from-indigo-600 to-purple-600 rounded-xl text-white font-semibold 
                     hover:scale-105 hover:shadow-xl transition-transform duration-200"
        >
          Login
        </button>

        {/* Extra Bottom Text */}
        <p className="text-center mt-4 text-white/90 text-sm">
          Secure • Fast • Beautiful UI ✨
        </p>
      </form>
    </div>
  );
}
