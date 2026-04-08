# ServiceMatch Messaging System

## Overview

Real-time messaging system built with Socket.io, PostgreSQL, and React for customer-professional communication.

## Features

- ✅ Real-time messaging with Socket.io
- ✅ Message persistence in PostgreSQL
- ✅ Typing indicators
- ✅ Message status tracking (sent, delivered, read)
- ✅ Authentication with JWT tokens
- ✅ Chat modal integration
- ✅ Dashboard integration for both user types

## Architecture

### Backend Components

```
server/
├── routes/messages.js          # Message API endpoints
├── index.js                   # Socket.io server setup
└── migrations/001_initial_schema.js  # Messages table
```

### Frontend Components

```
client/
├── components/
│   ├── Chat.tsx               # Main chat interface
│   └── ChatModal.tsx          # Modal wrapper
└── pages/
    ├── customer/dashboard.tsx  # Customer integration
    └── professional/dashboard.tsx  # Professional integration
```

## API Endpoints

### Messages

- `GET /api/messages/match/:matchId` - Get message history
- `POST /api/messages/send` - Send a message
- `PUT /api/messages/mark-read` - Mark messages as read

### Matches

- `GET /api/matches/customer` - Get customer matches
- `GET /api/matches/my-matches` - Get professional matches

## Socket.io Events

### Client → Server

- `join_match` - Join a match room
- `leave_match` - Leave a match room
- `send_message` - Send real-time message
- `typing_start` - Start typing indicator
- `typing_stop` - Stop typing indicator

### Server → Client

- `new_message` - New message received
- `user_typing` - User is typing
- `user_stopped_typing` - User stopped typing

## Database Schema

### Messages Table

```sql
CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  match_id UUID REFERENCES matches(id) ON DELETE CASCADE,
  sender_id UUID REFERENCES users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  message_type VARCHAR DEFAULT 'text',
  attachment_url VARCHAR,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW()
);
```

## Usage Examples

### Opening a Chat

```typescript
const openChat = (matchId: string, otherUserName: string, jobTitle: string) => {
  setChatModal({
    isOpen: true,
    matchId,
    otherUserName,
    jobTitle,
  });
};
```

### Sending a Message

```typescript
const sendMessage = async () => {
  const response = await fetch("/api/messages/send", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      matchId,
      content: messageContent,
      messageType: "text",
    }),
  });
};
```

## Testing

### Test Page

Visit `http://localhost:3000/test-messaging` to test the messaging system.

### Manual Testing Steps

1. Register as both customer and professional
2. Post a job as customer
3. Accept match as professional
4. Click "Message" button in either dashboard
5. Send messages and verify real-time updates

## Environment Variables

```env
# Backend
JWT_SECRET=your_jwt_secret
DB_HOST=localhost
DB_PORT=5432
DB_NAME=servicematch_dev
DB_USER=your_db_user
DB_PASSWORD=your_db_password

# Frontend
NEXT_PUBLIC_API_URL=http://localhost:5000
```

## Security Features

- JWT token authentication for Socket.io connections
- Message access control (users can only access their matches)
- Input validation and sanitization
- Rate limiting on API endpoints

## Performance Considerations

- Message pagination (50 messages per page)
- Real-time updates only for active matches
- Efficient database queries with proper indexing
- Socket.io room-based messaging for scalability

















