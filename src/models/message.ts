import mongoose, { Schema,Document } from "mongoose";

export interface IMsg extends Document {
  content: string;
  sender: mongoose.Types.ObjectId;
  reciver: mongoose.Types.ObjectId;
  isDelete: boolean;
  isSeen: boolean;
  file: {
    type:string ,
      url: string,
      name: string,
      size: number,
      fileType: string,
      hash:string,
  };
}
const msgSchema:Schema = new mongoose.Schema<IMsg>(
  {
    content: {
      type: String,
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
    },
    file: {
      type: {type:String},
      url: {type:String},
      name: {type:String},
      size: {type:Number},
      fileType: {type:String},
      hash:{type:String}
    }
  },
  { timestamps: true }
);

const Msg = mongoose.models.Msg || mongoose.model("Msg", msgSchema);
export default Msg
