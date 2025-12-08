import { getServerSession } from "next-auth";
import { authOption } from "../../(Auth)/auth/[...nextauth]/options";
import { NextResponse } from "next/server";
import User from "@/models/user";
import dbConnect from "@/lib/dbConnect";

export async function GET() {
  try {
    const session = await getServerSession(authOption);
    
    if (!session) {
      return NextResponse.json(
        { message: "Unauthorized request" },
        { status: 401 }
      );
    }

    await dbConnect();

    const users = await User.find();

    return NextResponse.json(
      { message: users, success: true },
      { status: 200 }
    );

  } catch (error) {
    console.log("GET /api/allUser Error:", error);

    return NextResponse.json(
      { message: "Internal server error", error: String(error) },
      { status: 500 }
    );
  }
}
