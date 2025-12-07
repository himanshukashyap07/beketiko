export interface IMessage {
  _id: string;
  content: string;
  sender: string;
  reciver: string;
  isDelete: boolean;
  createdAt: string;
  updatedAt: string;
}
