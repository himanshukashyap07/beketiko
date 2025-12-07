"use client";

import { useState } from "react";
import { useSession, signOut } from "next-auth/react";
import { FaUserCircle } from "react-icons/fa";
import { useRouter } from "next/navigation";

export default function Header() {
  const { data: session } = useSession();
  const [open, setOpen] = useState(false);
  console.log(session);
  const router = useRouter()

  return (
    <header className="bg-linear-to-r from-blue-600 to-purple-600 text-white px-6 py-4 flex justify-between items-center shadow-lg">
      <h1 className="text-2xl font-bold tracking-wide">Messages Dashboard</h1>

      <div className="relative">
        <FaUserCircle
          className="text-4xl cursor-pointer hover:text-yellow-300 transition"
          onClick={() => setOpen(!open)}
        />

        {open && (
          <div className="absolute right-0 bg-white text-black w-56 mt-3 rounded-xl shadow-xl p-4">
            <p className="font-semibold text-lg">{session?.user?.username}</p>
            <p className="text-sm text-gray-600">{session?.user?.mobileNumber}</p>
            <p className="text-sm text-gray-600">{session?.user?.fullName}</p>

            <button
              onClick={() => {signOut();router.replace("/")}}
              className="mt-4 bg-red-600 text-white w-full py-2 rounded-lg hover:bg-red-700"
            >
              Logout
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
