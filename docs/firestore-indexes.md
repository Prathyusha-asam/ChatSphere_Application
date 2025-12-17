# Firestore Indexes

## Required Indexes

### Conversations
- Collection: conversations
- Field: participants
- Query: array-contains (userId)

### Messages
- Subcollection: conversations/{conversationId}/messages
- Order by: createdAt (ascending)

Additional composite indexes will be added as prompted
by Firestore during query execution.
