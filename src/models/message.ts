import mongoose, { Schema,Document } from "mongoose";

export interface IMsg extends Document{
    content:string;
    sender:mongoose.Types.ObjectId;
    reciver:mongoose.Types.ObjectId;
    isDelete:boolean;
    isSeen:boolean;
}

const msgSchema:Schema = new mongoose.Schema<IMsg>(
  {
    content: {
      type: String,
      required: [true, "Content is required"],
      trim: true,
      minlength: [1, "Content must be at least 1 character long"],
    },
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    reciver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    isDelete: {
      type: Boolean,
      default: false,
    },
    isSeen:{
      type:Boolean,
      default:false
    }
  },
  { timestamps: true }
);

const Msg = mongoose.models.Msg || mongoose.model("Msg", msgSchema);
export default Msg
