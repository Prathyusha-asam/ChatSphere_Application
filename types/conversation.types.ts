export type Conversation = {
  id: string;
  participants: string[];      // user names
  lastMessage: string;
  lastMessageTime: string;     // ISO string
};