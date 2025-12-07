import dbConnect from "@/lib/dbConnect";
import { otpStore } from "@/lib/otpStore";
import { sendVerificationMessage } from "@/lib/sendMessage";
import Otp from "@/models/otp";
import apiError from "@/utils/apiError";
import apiResponse from "@/utils/apirespone";

export async function POST(req: Request) {
  const { mobileNumber, fullName } = await req.json();
  await dbConnect()
  try {
    if (!mobileNumber) return apiError("mobile number is required");

    const otp = Math.floor(1000 + Math.random() * 9000).toString();
    if (!global.otpStore) global.otpStore = {};
    global.otpStore[mobileNumber] = otp;
    
    await Otp.create({
      mobileNumber,
      otp
    })
    

    const sentOtp = await sendVerificationMessage(mobileNumber, fullName, otp)
    if (!sentOtp) {
      return apiError("error occure in sending otp")
    }

    return apiResponse("otp send Successfull", { otp })
  } catch (error: any) {
    return apiError("internal server error in sending otp", error, 500)
  };
}
