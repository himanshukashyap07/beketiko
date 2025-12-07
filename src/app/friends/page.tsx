"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { useSession } from "next-auth/react";
import Header from "@/components/DashboardHader";
import { FiLoader } from "react-icons/fi";

export default function Page() {
  const [mobile, setMobile] = useState("");
  const [foundUser, setFoundUser] = useState<any>(null);
  const router = useRouter();
  const [userId, setUserId] = useState()
  const [loading,setLoading] = useState(false)
  
  const { data: session } = useSession()
  useEffect(() => {

    setUserId(session?.user?.id)
  })

  const handleSearch = async () => {
    if (!mobile) return;

    try {
      const res = await axios.get(`/api/find-friend/${mobile}`);
      setFoundUser(res.data.data);

    } catch (err) {
      toast.error("User not found");
      setFoundUser(null);
    }
  };

  const openChat = () => {
    const loggedInUserId = userId;


    router.replace(`/friends/chat/${loggedInUserId}/${foundUser._id}`);
  };

  return (
    <div>
      <Header />
      <div className="p-6 max-w-md mx-auto">
        <h1 className="text-xl font-bold mb-4">Search by Mobile</h1>
        <input
          className="w-full p-2 border rounded"
          placeholder="Enter mobile number"
          value={mobile}
          onChange={(e) => setMobile(e.target.value)}
        />

        <button
          onClick={handleSearch}
          className="mt-3 w-full bg-blue-600 text-white p-2 rounded"
        >
          Search User
        </button>
        {
          loading
          ?
          <FiLoader className="mx-auto animate-spin text-3xl sm:text-4xl text-white" />
          : ""
        }
        {foundUser && (
          <div className="mt-4 p-4 border text-black rounded bg-gray-100">
            <h2 className="font-semibold">user Found: {foundUser.fullName}</h2>

            <button
              onClick={openChat}
              className="mt-3 bg-green-600 text-white p-2 rounded w-full"
            >
              Start Chat
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
