import { NextRequest, NextResponse } from "next/server";
import User from "@/models/user";
import dbConnect from "@/lib/dbConnect";

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ mobile: string }> }
) {
  try {
    await dbConnect();

    const { mobile } = await context.params;

    const user = await User.findOne({ mobileNumber: mobile });

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        _id: user._id,
        fullName: user.fullName,
        avatar: user.avatar,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
