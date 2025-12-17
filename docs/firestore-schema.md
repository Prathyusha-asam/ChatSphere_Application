# Firestore Database Schema (NT-3)

## Overview
The Firestore data model follows a conversation-centric design where messages
are scoped under conversations, and user presence/typing is handled separately
for real-time updates.

---

## Collections

### users
Document ID: Firebase Auth UID

Fields:
- email: string
- displayName: string
- photoURL: string
- isOnline: boolean
- lastSeen: timestamp
- createdAt: timestamp

---

### conversations
Fields:
- participants: string[]
- type: "direct" | "group"
- lastMessage: string
- lastMessageAt: timestamp
- createdAt: timestamp

Subcollection:
messages/{messageId}

Fields:
- senderId: string
- text: string
- isRead: boolean
- createdAt: timestamp

---

### typingIndicators
Document ID: conversationId_userId

Fields:
- conversationId: string
- userId: string
- isTyping: boolean
- updatedAt: timestamp
