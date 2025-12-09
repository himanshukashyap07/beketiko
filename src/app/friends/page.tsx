"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { useSession } from "next-auth/react";
import Header from "@/components/DashboardHader";
import { FiLoader } from "react-icons/fi";
import Image from "next/image";

export default function Page() {
  const [mobile, setMobile] = useState("");
  const [foundUser, setFoundUser] = useState<any>(null);
  const router = useRouter();
  const [userId, setUserId] = useState()
  const [loading,setLoading] = useState(false)
  const [users,setUsers] = useState([])
  const { data: session } = useSession()
  useEffect(() => {

    setUserId(session?.user?.id)
  })
  useEffect(()=>{
    async function getUser(){
      setLoading(true)
      const users = await axios.get("/api/allUser")
      setUsers(users.data.message)
      setLoading(false)
    }
    getUser()
  },[])

  const handleSearch = async () => {
    if (!mobile) return;

    try {
      setLoading(true)
      const res = await axios.get(`/api/find-friend/${mobile}`);
      setFoundUser(res.data.data);
      setLoading(false)
    } catch (err) {
      setLoading(false)
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
        <h1 className="text-xl font-bold mb-4 text-center">Search by Mobile</h1>
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
          <FiLoader className="mx-auto animate-spin text-3xl sm:text-4xl text-blue" />
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
        <div className="mt-16">
          {
            users && users.map((user:any,index)=>(
              <button 
              onClick={()=>router.replace(`/friends/chat/${userId}/${user._id}`)}
              className="mt-3 w-full flex items-center rounded-xl bg-sky-300 cursor-pointer text-white p-2" key={index}
              >
                <Image
                src={user.avatar}
                alt="user-image"
                width="60"
                height="60"
                className="rounded-full w-auto h-auto"
                ></Image>
                <span className="ml-20 text-black font-bold">
                  {user.fullName.toUpperCase()}
                </span>
              </button>
            ))
          }
        </div>
      </div>
    </div>
  );
}
