# Hicapp Backend

The backend service for **Hicapp**, a social and messaging application.

The backend is built with **native Node.js HTTP APIs**, PostgreSQL, WebSockets, and AWS S3. It intentionally does not use Express.js.

---

## Table of Contents

- [Overview](#overview)
- [Architecture](#architecture)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Backend Architecture](#backend-architecture)
- [Authentication](#authentication)
- [REST API](#rest-api)
- [WebSocket Architecture](#websocket-architecture)
- [Messaging System](#messaging-system)
- [Message Pagination](#message-pagination)
- [Read / Seen System](#read--seen-system)
- [Post & Image Uploads](#post--image-uploads)
- [Database](#database)
- [Environment Variables](#environment-variables)
- [Running Locally](#running-locally)
- [Docker](#docker)
- [Development Workflow](#development-workflow)
- [Future Improvements](#future-improvements)
- [License](#license)

---

## Overview

Hicapp Backend provides the server-side infrastructure for:

- User authentication
- User accounts
- Conversations
- Real-time messaging
- Message history
- Cursor-based message pagination
- Message read/seen state
- Posts
- Post images
- File and image uploads
- PostgreSQL data persistence
- WebSocket communication

The backend exposes two primary communication mechanisms:

1. **REST APIs** for request/response operations
2. **WebSockets** for real-time communication

---

## Architecture

```text
                         HICAPP BACKEND
                              │
              ┌───────────────┴───────────────┐
              │                               │
          REST API                         WebSocket
              │                               │
              ▼                               ▼
        Controllers                    WebSocket Server
              │                               │
              ▼                               ▼
          Services                    Connected Users
              │
              ▼
       PostgreSQL Queries
              │
              ▼
         PostgreSQL


                         File Uploads

Browser
   │
   │ Request upload URL
   ▼
Hicapp Backend
   │
   │ Presigned S3 URL
   ▼
Browser
   │
   │ Direct upload
   ▼
AWS S3
```

---

## Tech Stack

| Technology          | Purpose                             |
| ------------------- | ----------------------------------- |
| Node.js             | Backend runtime                     |
| Native Node.js HTTP | HTTP server                         |
| JavaScript          | Backend language                    |
| PostgreSQL          | Primary database                    |
| `pg`                | PostgreSQL client / connection pool |
| `ws`                | WebSocket server                    |
| JWT                 | Authentication                      |
| HttpOnly Cookies    | Authentication token storage        |
| AWS S3              | Image/file storage                  |
| Docker              | Containerization                    |
| Docker Compose      | Local multi-container development   |

> **Note:** The backend does not use Express.js.

Routing, request handling, authentication, and WebSocket upgrades are implemented using Node.js APIs and the application's own architecture.

---

## Project Structure

The backend follows a layered architecture:

```text
src/
│
├── controllers/
│   └── HTTP request handling
│
├── services/
│   └── Business logic
│
├── queries/
│   └── Database queries
│
├── utils/
│   └── Shared utilities
│
├── middleware/
│   └── Authentication / request middleware
│
├── websocket/
│   └── WebSocket connection and event handling
│
├── config/
│   └── Application configuration
│
└── server.js
```

The exact directory structure may evolve as the application grows.

---

## Backend Architecture

Hicapp follows a controller → service → database architecture.

```text
HTTP Request
     │
     ▼
Controller
     │
     ▼
Service
     │
     ▼
Database Query
     │
     ▼
PostgreSQL
```

### Controllers

Controllers are responsible for:

- Reading HTTP requests
- Extracting parameters
- Validating basic request data
- Calling services
- Sending HTTP responses

Controllers should avoid containing large amounts of business logic.

### Services

Services contain application and business logic.

Examples include:

```text
getMessagesService()
markConversationReadService()
```

Services interact with database queries and return application-level data.

### Database

PostgreSQL is accessed through a connection pool.

```js
const result = await pool.query(query, params);
```

The backend does not use an ORM.

---

## Authentication

Hicapp uses JWT-based authentication.

The access token is stored in an **HttpOnly cookie**.

```text
Login
  │
  ▼
Backend validates credentials
  │
  ▼
JWT generated
  │
  ▼
HttpOnly cookie
  │
  ▼
Browser
```

Authenticated REST requests use the cookie automatically.

The same authentication mechanism is used when establishing WebSocket connections.

---

## REST API

REST APIs are used for operations where request/response communication is appropriate.

Examples include:

- Authentication
- Conversations
- Message history
- Posts
- Uploads
- User data

A typical request flow:

```text
Frontend
   │
   ▼
API Function
   │
   ▼
Backend Controller
   │
   ▼
Service
   │
   ▼
PostgreSQL
```

---

## WebSocket Architecture

Hicapp uses the [`ws`](https://github.com/websockets/ws) WebSocket implementation.

The WebSocket server is integrated with the native Node.js HTTP server.

```text
Browser
   │
   │ WebSocket Upgrade
   ▼
Node.js HTTP Server
   │
   ▼
WebSocket Server
```

Connected users are tracked using:

```js
Map<UserId, Set<WebSocket>>
```

This allows a single user to have multiple active connections.

For example:

```text
User A
 ├── Browser
 ├── Mobile
 └── Second browser tab
```

Each connection can receive real-time events.

---

## Messaging System

Messaging uses a hybrid architecture.

### REST

REST is responsible for:

- Loading initial messages
- Loading older messages
- Message history

### WebSocket

WebSocket is responsible for:

- New incoming messages
- Real-time message delivery
- Conversation read state
- Real-time participant state changes

```text
                Messaging
                    │
          ┌─────────┴─────────┐
          │                   │
        REST              WebSocket
          │                   │
    Message History     Real-time Events
```

---

## Message Pagination

Message history uses **cursor-based pagination** rather than offset/page pagination.

### Initial Request

```http
GET /conversations/:conversationId/messages?limit=10
```

The initial request returns the newest messages.

### Loading Older Messages

```http
GET /conversations/:conversationId/messages?limit=10&prevMessageID=<oldest-message-id>
```

The cursor represents the oldest currently loaded message.

Conceptually:

```text
Initial:

[11 12 13 14 15 16 17 18 19 20]


Scroll to top:

[01 02 03 04 05 06 07 08 09 10]
[11 12 13 14 15 16 17 18 19 20]
```

The API response contains:

```json
{
  "messages": [],
  "hasMore": true
}
```

`hasMore` tells the frontend whether additional message history exists.

---

## Read / Seen System

Conversation read state is stored in the conversation participant relationship.

The backend maintains a `last_read_at` timestamp for participants.

When a user views a conversation:

```text
Frontend
   │
   │ conversation:read
   ▼
WebSocket
   │
   ▼
Backend
   │
   ▼
conversation_participants
   │
   │ UPDATE last_read_at
   ▼
PostgreSQL
```

The backend then broadcasts the updated read state to connected participants.

The frontend uses this information to determine which sent message should display the **Seen** state.

---

## Post & Image Uploads

Posts can have associated images.

Post image metadata is stored in PostgreSQL while the actual image files are stored in AWS S3.

Example relationship:

```text
Post
 │
 ├── Image 1
 ├── Image 2
 └── Image 3
```

Image ordering is maintained using a position field.

---

## S3 Upload Flow

The backend does not need to receive the complete image file.

Instead:

```text
1. Frontend requests upload URL
             │
             ▼
2. Backend generates presigned S3 URL
             │
             ▼
3. Frontend uploads directly to S3
             │
             ▼
4. Frontend receives/stores permanent file URL
             │
             ▼
5. Backend stores image metadata
```

This keeps large file transfers away from the application server.

---

## Database

Hicapp uses **PostgreSQL** as its primary relational database.

Known core areas include:

- Users
- Posts
- Post Images
- Conversations
- Conversation Participants
- Messages

The application uses foreign keys and relational constraints to maintain relationships between entities.

The backend accesses PostgreSQL directly through a connection pool rather than an ORM.

> The complete database schema is maintained in the project's migration files. This README intentionally does not duplicate every table and column so the documentation does not become inconsistent with the migrations.

---

## Environment Variables

Create a `.env` file for local development.

Example:

```env
PORT=4000

DATABASE_URL=postgresql://USER:PASSWORD@HOST:5432/DATABASE

JWT_SECRET=your_jwt_secret

AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key
AWS_REGION=your_region
AWS_S3_BUCKET=your_bucket
```

Do not commit `.env` files or production credentials to Git.

Recommended `.gitignore` entries:

```text
.env
.env.local
.env.production
```

---

## Running Locally

### 1. Clone the repository

```bash
git clone <repository-url>
cd hicapp-backend
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

Create:

```text
.env
```

and provide the required database, JWT, and AWS configuration.

### 4. Start PostgreSQL

If using Docker:

```bash
docker compose up -d
```

### 5. Start the backend

```bash
npm run dev
```

The development server runs on the configured port, for example:

```text
http://localhost:4000
```

---

## Docker

The project can be containerized for consistent development environments.

Typical architecture:

```text
Docker Compose
│
├── Hicapp Backend
│
└── PostgreSQL
```

Docker helps ensure that the application and database environment are reproducible across machines.

---

## Development Workflow

A typical feature follows this flow:

```text
1. Define database changes
        ↓
2. Create / update migration
        ↓
3. Add database query
        ↓
4. Add service logic
        ↓
5. Add controller / WebSocket handler
        ↓
6. Add frontend API integration
        ↓
7. Update Zustand state if required
        ↓
8. Update UI
        ↓
9. Test REST / WebSocket behavior
```

---

## Future Improvements

Potential areas for future development include:

- Better request validation
- Centralized error handling
- Rate limiting
- Improved logging
- WebSocket reconnection strategy
- Message delivery states
- Message editing/deletion
- Message reactions
- File attachments
- Notifications
- Redis for distributed WebSocket state
- Horizontal backend scaling
- Automated testing
- API documentation
- Database indexing optimization

---

## License

This project is currently a private project.
