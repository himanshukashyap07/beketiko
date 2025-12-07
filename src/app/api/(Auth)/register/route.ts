import apiResponse from "@/utils/apirespone";
import apiError from "@/utils/apiError";
import { z } from "zod";
import User from "@/models/user";
import dbConnect from "@/lib/dbConnect";
import Otp from "@/models/otp";

const signupSchema = z.object({
  mobileNumber: z.string().length(10),
  fullName: z.string().min(3),
  username: z.string().min(3),
  password: z.string().min(6),
  otp: z.string().length(4),
  avatar:z.string().min(1)
});

export async function POST(req: Request) {
  await dbConnect();

  const form = await req.formData();

  const body = {
    mobileNumber: form.get("mobileNumber"),
    fullName: form.get("fullName"),
    username: form.get("username"),
    password: form.get("password"),
    otp: form.get("otp"),
    avatar:form.get("avatar")
  };
  

  const validation = signupSchema.safeParse(body);

  
  if (!validation.success) {
    return apiError(validation.error.issues[0].message, 400);
  }

  const { mobileNumber, fullName, username, password, otp,avatar } = validation.data;

  
  // ---------------------- OTP CHECK ----------------------
  const savedOTP = global.otpStore?.[mobileNumber]; // example store
  
  if (!savedOTP || savedOTP !== otp) {
    return apiError("Invalid OTP", 400);
  }


  // ------------------ CHECK USER EXISTS ------------------
  const existing = await User.findOne({ $or: [{ mobileNumber }, { username }] });
  if (existing) return apiError("User already exists", 400);

  // ------------------ FILE UPLOAD ------------------------
  if (!avatar) return apiError("Avatar is required", 400);

  // ------------------ CREATE USER ------------------------
  const user = await User.create({
    fullName,
    username,
    mobileNumber,
    password,
    isVerified:true,
    avatar,
  });
  await Otp.findOneAndDelete({mobileNumber})
  
  return apiResponse("user created successfully",user,200)
}
