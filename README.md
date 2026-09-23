# PulsePoll

PulsePoll is a full-stack real-time polling application where authenticated users can create polls, vote once per poll, and view live voting results.

## Features

- User registration and login
- JWT-based authentication
- Protected poll routes
- Create polls with 2-6 options
- Optional poll expiration
- One vote per user per poll
- Duplicate vote prevention
- Near-real-time result updates
- Redis caching for poll results
- Redis cache invalidation after voting
- MongoDB persistence
- Responsive React frontend
- Input validation and error handling
- Protected frontend routes
- Live percentage-based result visualization

## Tech Stack

### Frontend

- React
- React Router
- Vite
- JavaScript
- HTML
- CSS

### Backend

- Go
- Gin
- JWT
- bcrypt
- REST API

### Database and Caching

- MongoDB Atlas
- Redis
- Docker

## Project Structure

```text
pulse-poll/
|
+-- backend/
|   +-- cmd/
|   |   +-- server/
|   |       +-- main.go
|   +-- config/
|   +-- controllers/
|   +-- middleware/
|   +-- models/
|   +-- routes/
|   +-- utils/
|   +-- go.mod
|   +-- go.sum
|
+-- frontend/
|   +-- public/
|   +-- src/
|       +-- components/
|       +-- pages/
|   +-- package.json
|   +-- vite.config.js
|
+-- .gitignore
+-- README.md
API Endpoints
Authentication
POST /api/auth/register
POST /api/auth/login
Polls
POST /api/polls
GET  /api/polls
GET  /api/polls/:id
Voting and Results
POST /api/polls/:id/vote
GET  /api/polls/:id/results
Health Check
GET /api/health
Authentication

Protected endpoints require a JWT token:

Authorization: Bearer <token>
Running Locally
1. Clone the repository
git clone https://github.com/kunal919109/pulse-poll.git
cd pulse-poll
2. Start Redis

Make sure Docker Desktop is running.

docker run --name pulsepoll-redis -p 6379:6379 -d redis

If the container already exists:

docker start pulsepoll-redis
3. Start the Backend

Open a terminal:

cd backend
go mod tidy
go run ./cmd/server

Backend:

http://localhost:8080
4. Start the Frontend

Open another terminal:

cd frontend
npm install
npm run dev

Frontend:

http://localhost:5173
Environment Variables

The backend requires:

MONGODB_URI
JWT_SECRET

Never commit real credentials or secrets to GitHub.

Redis Caching

Poll results are cached using keys such as:

poll:results:<poll-id>

Cached results expire automatically, and the cache is invalidated after a successful vote.

Validation

PulsePoll validates:

Required authentication
Password length
Poll question length
2-6 poll options
Empty options
Duplicate options
Future expiration dates
Valid poll IDs
Valid voting options
Duplicate votes
Production Build
Frontend
cd frontend
npm run build
Backend
cd backend
go build ./cmd/server
Future Improvements
WebSocket-based real-time updates
Poll creator management
User profile page
Poll search and filtering
Pagination
Admin dashboard
Production deployment
Automated backend and frontend tests
Author

Kunal Kasar

Computer Engineering Student
Savitribai Phule Pune University  