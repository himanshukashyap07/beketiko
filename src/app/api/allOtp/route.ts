import { getServerSession } from "next-auth";
import { authOption } from "../(Auth)/auth/[...nextauth]/options";
import { NextResponse } from "next/server";
import Otp from "@/models/otp";


export async function GET(){
    const session = await getServerSession(authOption)
    if (!session || !session.user) {
        return NextResponse.json({message:"unautharized request"});
    }


    const otps = await Otp.find();
    
    return NextResponse.json({otps})
}