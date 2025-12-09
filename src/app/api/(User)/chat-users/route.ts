import dbConnect from "@/lib/dbConnect";
import Msg from "@/models/message";
import { NextResponse } from "next/server";
import mongoose from "mongoose";
import User from "@/models/user";
import { getServerSession } from "next-auth";
import { authOption } from "@/app/api/(Auth)/auth/[...nextauth]/options";


export async function GET() {
    const session = await getServerSession(authOption);
    const userId = session?.user.id

    try {
        await dbConnect();
        const userObjectID = new mongoose.Types.ObjectId(userId)
        const users = await Msg.aggregate([
            // 1️⃣ Match messages where user is sender or receiver
            {
                $match: {
                    $or: [
                        { sender: userObjectID },
                        { reciver: userObjectID }
                    ]
                }
            },

            // 2️⃣ Determine the other user
            {
                $project: {
                    otherUser: {
                        $cond: [
                            { $eq: ["$sender", userObjectID] },
                            "$reciver",
                            "$sender"
                        ]
                    }
                }
            },

            // 3️⃣ Group unique users
            {
                $group: { _id: "$otherUser" }
            },

            // 4️⃣ Lookup user details
            {
                $lookup: {
                    from: "users",
                    localField: "_id",
                    foreignField: "_id",
                    as: "user"
                }
            },

            // 5️⃣ Flatten array
            { $unwind: "$user" },

            // 6️⃣ Use user object as root
            { $replaceRoot: { newRoot: "$user" } }
        ]);

        return NextResponse.json({
            message: "Users fetched successfully",
            users,
        });

    } catch (error) {
        console.error(error);
        return NextResponse.json(
            { message: "Internal server error", error },
            { status: 500 }
        );
    }
}
