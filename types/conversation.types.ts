import { Timestamp } from "firebase/firestore";

export type Conversation = {
  id: string;
  participants: string[];
  lastMessage?: string;
  lastMessageAt?: Timestamp;
};
