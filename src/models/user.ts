import bcrypt from "bcryptjs";
import mongoose, {Schema,Document} from "mongoose";

export interface IUser extends Document{
    username:string;
    fullName:string;
    role:string
    password:string;
    avatar:string;
    mobileNumber:string;
    isVerified:boolean;
    createdAt:Date;
}

const userSchema:Schema<IUser> = new Schema({
    username:{
        type:String,
        required:[true,"username is required"],
        unique:[true,"username should be unique"],
        trim:true,
        index:true
    },
    fullName:{
        type:String,
        required:[true,"fullName is required"],
        trim:true
    },
    mobileNumber:{
        type:String,
        trim:true,
        required:true,
        unique:true
    },
    role:{
        type:String,
        enum:["user","admin"],
        default:"user"
    },
    password:{
        type:String,
        required:[true,"password is required"],
        trim:true
    },
    isVerified:{
        type:Boolean,
        default:false
    },
    avatar:{
        type:String,
        trim:true
    }
},{
    timestamps:true
})

userSchema.pre("save",async function(){
    console.log("PRE-SAVE RUNNING");
  console.log("PASSWORD BEFORE HASH:", this.password);
    if (!this.isModified("password")) return;
    this.password = await bcrypt.hash(this.password,10)
    console.log("PASSWORD AFTER HASH:", this.password);
})


const User= mongoose.models.User || mongoose.model<IUser>("User", userSchema);

export default User;