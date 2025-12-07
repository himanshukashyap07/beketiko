"use client";

import { useState } from "react";
import axios from "axios";
import { z } from "zod";
import { toast } from "react-toastify";
import { FiLoader } from "react-icons/fi";
import { useRouter } from "next/navigation";

const step1Schema = z.object({
  fullName: z.string().min(3),
  mobileNumber: z.string().length(10),
});

const finalSchema = z.object({
  username: z.string().min(3),
  password: z.string().min(6),
  otp: z.string().length(4),
  avatar: z.string().url(),
});

export default function Page() {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    fullName: "",
    mobileNumber: "",
    username: "",
    password: "",
    otp: "",
    avatar: "",
  });
  const router = useRouter()

  const [loading, setLoading] = useState(false);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);

  const handleSendOTP = async () => {
    try {
      step1Schema.parse({
        fullName: form.fullName,
        mobileNumber: form.mobileNumber,
      });
      setLoading(true);
      await axios.post("/api/send-otp", {
        mobileNumber: form.mobileNumber,
        fullName: form.fullName,
      });
      setLoading(false);
      toast.success("OTP sent!");
      setStep(2);
    } catch (err: any) {
      setLoading(false);
      toast.error(err.response?.data?.error || "Check details");
    }
  };

  const uploadAvatar = async () => {
    if (!avatarFile) return toast.error("Select an image");

    const fd = new FormData();
    fd.append("file", avatarFile);

    try {
      setLoading(true);
      const res = await axios.post("/api/upload-file", fd);
      setForm((f) => ({ ...f, avatar: res.data.message }));
      setLoading(false);
      toast.success("Avatar uploaded");
    } catch {
      setLoading(false);
      toast.error("Upload failed");
    }
  };

  const handleSignup = async () => {
    try {
      finalSchema.parse(form);
    } catch (err: any) {
      toast.error(err[0]?.message || "Invalid details");
      return;
    }

    const fd = new FormData();
    Object.entries(form).forEach(([k, v]) => fd.append(k, v));

    try {
      setLoading(true);
      await axios.post("/api/register", fd);
      setLoading(false);
      toast.success("Account created!");
      router.replace("/signin")
    } catch (err: any) {
      setLoading(false);
      toast.error(err.response?.data?.error);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-tr from-pink-100 via-yellow-100 to-green-100 px-4 sm:px-6 lg:px-8">
      <div className="bg-white p-6 sm:p-8 rounded-3xl shadow-2xl w-full max-w-md sm:max-w-lg lg:max-w-xl transition-transform duration-300 hover:scale-[1.01]">
        {/* STEP 1 */}
        {loading ? (
          <FiLoader className="mx-auto animate-spin text-3xl sm:text-4xl text-purple-500" />
        ) : (
          step === 1 && (
            <>
              <h2 className="text-2xl sm:text-3xl font-extrabold mb-6 text-center bg-clip-text text-transparent bg-linear-to-r from-pink-500 via-red-500 to-yellow-500">
                Enter Details
              </h2>

              <input
                className="w-full p-3 sm:p-4 mb-3 border-2 border-pink-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-400 placeholder-pink-400 text-purple-700 transition duration-200"
                placeholder="Full Name"
                onChange={(e) =>
                  setForm((f) => ({ ...f, fullName: e.target.value }))
                }
              />

              <input
                className="w-full p-3 sm:p-4 mb-3 border-2 border-yellow-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400 placeholder-yellow-400 text-green-700 transition duration-200"
                placeholder="Mobile Number"
                onChange={(e) =>
                  setForm((f) => ({ ...f, mobileNumber: e.target.value }))
                }
              />

              <button
                className="w-full py-3 sm:py-4 mt-4 bg-linear-to-r from-pink-500 via-red-500 to-yellow-500 text-white font-bold rounded-xl shadow-md hover:shadow-lg hover:scale-105 transition transform duration-300"
                onClick={handleSendOTP}
              >
                Send OTP
              </button>
            </>
          )
        )}

        {/* STEP 2 */}
        {loading ? (
          <FiLoader className="mx-auto animate-spin text-3xl sm:text-4xl text-green-500" />
        ) : (
          step === 2 && (
            <>
              <h2 className="text-2xl sm:text-3xl font-extrabold mb-6 text-center text-green-600">
                Verify OTP
              </h2>

              <input
                className="w-full p-3 sm:p-4 mb-3 border-2 border-green-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400 placeholder-green-400 text-green-700 transition duration-200"
                placeholder="Enter OTP"
                onChange={(e) =>
                  setForm((f) => ({ ...f, otp: e.target.value }))
                }
              />

              <button
                className="w-full py-3 sm:py-4 bg-linear-to-r from-green-400 to-green-600 text-white font-bold rounded-xl shadow-md hover:shadow-lg hover:scale-105 transition transform duration-300"
                onClick={() => setStep(3)}
              >
                Continue
              </button>

              <button
                className="w-full py-3 sm:py-4 mt-2 bg-gray-200 text-gray-800 font-semibold rounded-lg hover:bg-gray-300 transition duration-200"
                onClick={() => setStep(1)}
              >
                Wrong number
              </button>
            </>
          )
        )}

        {/* STEP 3 */}
        {loading ? (
          <FiLoader className="mx-auto animate-spin text-3xl sm:text-4xl text-blue-500" />
        ) : (
          step === 3 && (
            <>
              <h2 className="text-2xl sm:text-3xl font-extrabold mb-6 text-center bg-clip-text text-transparent bg-linear-to-r from-blue-500 via-indigo-500 to-purple-500">
                Create Account
              </h2>
              <input
                type="file"
                accept="image/*"
                className="w-full p-2 sm:p-3 mb-3 text-black border-2 border-pink-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-400 transition duration-200"
                onChange={(e) => setAvatarFile(e.target.files?.[0] || null)}
              />

              <button
                className="w-full py-3 sm:py-4 mt-2 bg-purple-600 text-white font-bold rounded-xl shadow-md hover:shadow-lg hover:scale-105 transition transform duration-300"
                onClick={uploadAvatar}
              >
                Upload Avatar
              </button>
              <input
                className="w-full p-3 sm:p-4 mb-3 border-2 border-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 placeholder-blue-400 text-indigo-700 transition duration-200"
                placeholder="Username"
                onChange={(e) =>
                  setForm((f) => ({ ...f, username: e.target.value }))
                }
              />

              <input
                className="w-full p-3 sm:p-4 mb-3 border-2 border-purple-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400 placeholder-purple-400 text-purple-700 transition duration-200"
                placeholder="Password"
                type="password"
                onChange={(e) =>
                  setForm((f) => ({ ...f, password: e.target.value }))
                }
              />



              <button
                className="w-full py-3 sm:py-4 mt-4 bg-linear-to-r from-indigo-500 via-purple-500 to-pink-500 text-white font-bold rounded-xl shadow-md hover:shadow-lg hover:scale-105 transition transform duration-300"
                onClick={handleSignup}
              >
                Finish Signup
              </button>
            </>
          )
        )}
      </div>
    </div>
  );
}