import { NextResponse } from "next/server";


const apiResponse=(message:string,object?:{},status=201):NextResponse=>{
    return NextResponse.json({message,object,success:true},{status})
}

export default apiResponse