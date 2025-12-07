import mongoose from "mongoose";

type ConnectionObject={
    isConnected?:number
}

const connnection:ConnectionObject ={}

async function dbConnect():Promise<void> {
    if(connnection.isConnected){
        console.log("database is already connected");
        return
    }
    if (mongoose.connection.readyState === 1) {
    return; // already connected
  }

  if (mongoose.connection.readyState === 2) {
    return; // connecting
  }
    try {
        if (!process.env.MONGODB_URI) {
            throw new Error("environment variables is not set properly")
        }
        const db = await mongoose.connect(process.env.MONGODB_URI!||"");
        connnection.isConnected = db.connections[0].readyState
        console.log("db connected successfully");
        
    } catch (error) {
        
        console.log("db not connected::",error);
        process.exit(1)
    }
}

export default dbConnect