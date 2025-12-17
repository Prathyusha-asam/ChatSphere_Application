# Firestore Security Rules Documentation

## Overview

This document describes the Firestore security rules implemented to ensure that **user data is secure** and **only accessible to authorized users**. The rules enforce access control for:

* User profiles
* Conversations
* Messages
* Typing indicators

All rules have been tested using the **Firestore Rules Playground** in the Firebase Console.

---

## Authentication Requirement

All protected data requires the user to be authenticated.

```js
request.auth != null
```

Unauthenticated users cannot read or write protected data.

---

## Users Collection Rules

### Collection Path

```
users/{userId}
```

### Access Rules

* Users can read their own profile
* Users can update their own profile
* Users can create their profile
* Users cannot read or write other users’ profiles

### Rule Logic

```js
request.auth.uid == userId
```

### Access Matrix

| Action | Own Profile | Other User |
| ------ | ----------- | ---------- |
| Read   |  Allowed   |  Denied   |
| Write  |  Allowed   |  Denied   |

---

## Conversations Rules

### Collection Path

```
conversation/{conversationId}
```

### Expected Data Structure

```json
{
  "participants": ["userA_uid", "userB_uid"]
}
```

### Access Rules

* Only participants can read conversations
* Only participants can update or delete conversations
* Any authenticated user can create a conversation

### Rule Logic

```js
request.auth.uid in resource.data.participants
```

### Access Matrix

| Action | Participant | Non-Participant |
| ------ | ----------- | --------------- |
| Read   | Allowed   | Denied        |
| Update | Allowed   | Denied        |
| Delete | Allowed   | Denied        |

---

## Messages Rules

### Collection Path

```
conversation/{conversationId}/messages/{messageId}
```

### Access Rules

* Messages are readable only by conversation participants
* Messages can be created or updated only by participants

### Rule Logic

```js
request.auth.uid in
get(/databases/$(database)/documents/conversation/$(conversationId))
  .data.participants
```

### Access Matrix

| Action | Participant | Non-Participant |
| ------ | ----------- | --------------- |
| Read   |  Allowed   |  Denied        |
| Create |  Allowed   |  Denied        |

---

## Typing Indicators Rules

### Collection Path

```
typingIndicators/{docId}
```

### Expected Data Structure

```json
{
  "conversationId": "convo1",
  "userId": "userA_uid",
  "isTyping": true
}
```

### Access Rules

* Any authenticated user can read typing indicators
* A user can create or update only their own typing status
* Deleting typing indicator documents is not allowed

### Rule Logic

```js
request.auth.uid == request.resource.data.userId
```

### Access Matrix

| Action | Own Typing | Other User |
| ------ | ---------- | ---------- |
| Read   |  Allowed  |  Allowed  |
| Write  |  Allowed  | Denied   |
| Delete |  Denied   | Denied   |

---

## Rules Testing

All rules were tested using:

```
Firebase Console → Firestore → Rules → Rules Playground
```

### Tested Scenarios

* User reading own profile →  Allowed
* User reading another profile →  Denied
* Conversation participant reading conversation →  Allowed
* Non-participant reading conversation → Denied
* Participant creating a message → Allowed
* Non-participant creating a message → Denied
* User updating own typing indicator → Allowed
* User updating another user’s typing indicator → Denied

---

## Security Guarantees

* User data is isolated per authenticated user
* Conversations and messages are visible only to participants
* Unauthorized reads and writes are blocked
* Typing indicators are restricted to the owning user

---

## Acceptance Criteria Status

| Acceptance Criteria                    | Status |
| -------------------------------------- | ------ |
| Users can only read/write own profile  | ✅      |
| Conversations readable by participants | ✅      |
| Messages readable by participants      | ✅      |
| Typing indicators rules                | ✅      |
| Rules tested                           | ✅      |
| Documentation created                  | ✅      |

---

## Conclusion

Firestore security rules are fully implemented, tested, and documented. The rules provide strict access control to protect user data and ensure secure collaboration between authenticated users.
