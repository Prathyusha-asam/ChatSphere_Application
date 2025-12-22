#  ChatSphere  
### Real-Time Chat Application with Next.js & Firebase

---

##  Overview

**ChatSphere** is a modern, production-grade real-time chat application built using **Next.js (App Router)** and **Firebase**.  
It enables users to securely authenticate, manage profiles, start one-to-one conversations, exchange messages in real time, view typing indicators, track message delivery/read status, and monitor user presence.

The application follows **clean architecture principles**, **transaction-safe Firestore operations**, and **robust real-time state management** using React Context and custom hooks.

---

##  Features

###  Authentication & Security
- Email & password authentication (Firebase Auth)
- User registration with profile creation
- Forgot password (email reset)
- Session persistence (Remember Me / Session-based)
- Global authentication state using `AuthContext`
- Route protection via `AuthGuard`
- Logout confirmation modal
- Graceful auth error handling

###  Real-Time Messaging
- One-to-one conversations
- Real-time message updates using Firestore listeners
- Message delivery & read receipts
- Edit messages
- Delete messages
- Reply to messages
- Emoji picker support
- Character limit enforcement
- Transaction-safe message writes

###  Typing Indicators (Ghost-Proof)
- Real-time typing status
- Debounced updates
- Timestamp-based stale data cleanup
- Deletes typing records when user stops typing
- Never shows current user as typing

### User Presence
- Online / offline status
- Last-seen timestamp
- Presence updated on:
  - Login
  - Logout
  - Browser close
  - Page refresh
- Real-time presence list
- Online users sorted first
- Current user excluded from presence list

###  User Profiles
- Display name support
- Preset avatars
- Initials fallback avatar
- Real-time profile updates (Navbar)
- Account metadata (email, creation date)

###  Conversation Management
- Conversation list with:
  - Last message preview
  - Timestamp formatting
  - Unread message count
- Search conversations by user name
- Start new chats via modal
- Delete conversations (with cascade message deletion)
- Right-click context menus

###  UI & UX
- Tailwind CSS styling
- Responsive layouts
- Skeleton loaders
- Empty states
- Error boundaries
- Smooth transitions & animations
- Accessible components

---

## Tech Stack

| Layer | Technology |
|------|-----------|
| Framework | Next.js (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS |
| Authentication | Firebase Authentication |
| Database | Firebase Firestore |
| State Management | React Context API |
| Real-time | Firestore `onSnapshot` |
| UI Utilities | Emoji Picker, DevExtreme |
| Error Handling | React Error Boundaries |

---

## Project Structure

```
src/
├─ app/
│  ├─ auth/
│  ├─ chat/
│  ├─ profile/
│  ├─ layout.tsx
│  └─ page.tsx
│
├─ components/
│  ├─ auth/
│  ├─ chat/
│  ├─ common/
│  ├─ layout/
│  ├─ ui/
│  ├─ skeletons/
│  └─ error/
│
├─ context/
│  ├─ AuthContext.tsx
│  └─ ChatContext.tsx
│
├─ hooks/
│  ├─ useAuth.ts
│  ├─ useChat.ts
│  ├─ useTypingIndicator.ts
│  ├─ useUserPresence.ts
│  ├─ useConversations.ts
│  └─ useFirestore.ts
│
├─ lib/
│  ├─ firebase.ts
│  ├─ auth.ts
│  ├─ firestore.ts
│  ├─ conversations.ts
│  ├─ messages.ts
│  ├─ sendMessage.ts
│  ├─ typing.ts
│  └─ getAuthErrorMessage.ts
│
├─ types/
│  └─ firestore.types.ts
│
└─ styles/
   └─ globals.css
```

---

##  Architecture Overview

###  AuthContext
- Tracks authenticated user
- Manages login, register, logout
- Updates Firestore presence automatically
- Handles browser unload safely
- Exposes `useAuth()` hook

###  ChatContext
- Single source of truth for chat state
- Manages active conversation, messages, reply/edit state
- Handles loading & error states
- Automatically marks messages as read
- Exposes `useChat()` hook

###  Typing Indicator Logic
- Uses a dedicated `typingIndicators` collection
- Deletes typing records when user stops typing
- Ignores stale records (> 3 seconds)
- Prevents ghost typing issues

###  Presence Logic
- User marked online when authenticated
- User marked offline on logout / tab close
- Last-seen timestamp stored in Firestore
- Real-time presence list with sorting

---

##  Firebase Setup

### Enabled Services
- Firebase Authentication (Email / Password)
- Firestore Database

### Environment Variables
```
NEXT_PUBLIC_FIREBASE_API_KEY=xxxx
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=xxxx
NEXT_PUBLIC_FIREBASE_PROJECT_ID=xxxx
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=xxxx
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=xxxx
NEXT_PUBLIC_FIREBASE_APP_ID=xxxx
```

---

##  API & Utility Documentation

###  Authentication (`lib/auth.ts`)
- `signUp(email, password, displayName)`
- `login(email, password)`
- `logout()`
- `forgotPassword(email)`

###  Conversations (`lib/conversations.ts`)
- `createConversation(currentUserId, otherUserId)`

###  Messages (`lib/messages.ts`)
- `sendMessage(conversationId, senderId, text, replyTo?)`
- `updateMessage(conversationId, messageId, text)`
- `deleteMessage(conversationId, messageId)`

###  Typing Indicator (`lib/typing.ts`)
- `setTypingStatus(conversationId, userId, isTyping)`

###  User Profiles (`lib/firestore.ts`)
- `createUserProfile(userId, email, displayName)`
- `getUserProfile(userId)`
- `updateUserProfile(userId, data)`

---

##  Firestore Data Schema

### users
```
{
  userId: string
  email: string
  displayName: string
  photoURL: string
  isOnline: boolean
  lastSeen: Timestamp
  createdAt: Timestamp
}
```

### conversations
```
{
  participants: string[]
  type: "direct"
  lastMessage?: string
  lastMessageAt?: Timestamp
  createdAt: Timestamp
}
```

### messages
```
{
  conversationId: string
  senderId: string
  text: string
  isRead: boolean
  deliveredAt?: Timestamp
  createdAt: Timestamp
}
```

### typingIndicators
```
{
  conversationId: string
  userId: string
  isTyping: boolean
  updatedAt: Timestamp
}
```

---

##  Getting Started

### Installation
```
git clone <repository-url>
cd chat-sphere
npm install
```

### Run Locally
```
npm run dev
```

Open http://localhost:3000

---

##  Error Handling
- Global ErrorBoundary
- Defensive Firestore listeners
- Friendly user-facing messages
- Retry mechanisms

---

##  Known Limitations
- No group chats
- No file/image uploads
- No push notifications
- No message reactions UI
- No admin moderation panel

---

##  Future Improvements
- Group conversations
- Media sharing
- Push notifications
- Emoji reactions UI
- AI chatbot integration
- Admin dashboard
- Role-based access control
