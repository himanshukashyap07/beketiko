import apiError from "@/utils/apiError";
import { NextResponse } from "next/server"



export const sendVerificationMessage = async (mobileNumber: string, username: string, verifycodeOtp: string) => {
    try {
        const accountSid = process.env.TWILIOACCOUNT_SID!;
        const authToken = process.env.TWILIOACCOUNT_AUTHTOKEN!;
        

        const client = require('twilio')(accountSid, authToken);
        await client.messages
            .create({
                from: '+17659783563',
                body: ` {${username} your verificaiton otp is ${verifycodeOtp}} `,
                to: `+91${mobileNumber}`
            }).then()

        return NextResponse.json({ message: "otp send successfully", success: true }, { status: 201 })
    } catch (error:any) {
        
        return apiError("internal server error in sending otp to user",error,500)
    }
}