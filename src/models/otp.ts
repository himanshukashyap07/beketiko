import mongoose, {Document, Schema} from 'mongoose'

export interface Iotp extends Document{
    mobileNumber:string;
    otp:string;
    createdAt:Date;
}

const otpSchema:Schema = new Schema<Iotp>({
    mobileNumber:{
        type:String,
        required:true
    },
    otp:{
        type:String,
        required:true
    }
},{timestamps:true})


const Otp = mongoose.models.Otp || mongoose.model("Otp",otpSchema)
export default Otp;