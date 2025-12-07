import { NextResponse } from "next/server";

const apiError = (error: string,object?:{}, status = 400): NextResponse => {
    return NextResponse.json({ error,object, success: false }, { status });
}

export default apiError