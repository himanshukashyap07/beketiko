import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Msg from "@/models/message";

export async function POST(req: Request) {
  await dbConnect();

  const { hash } = await req.json();
  console.log(hash);
  
  if (!hash) {
    return NextResponse.json(
      { error: "Hash is required" },
      { status: 400 }
    );
  }

  const existing = await Msg.findOne(
    { "file.hash": hash },
    { file: 1 }
  ).lean();
  console.log("existing file",existing);
  

  if (existing?.file) {
    return NextResponse.json({
      exists: true,
      file: existing.file,
    });
  }

  return NextResponse.json({ exists: false });
}
