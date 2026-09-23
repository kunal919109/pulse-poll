# PulsePoll

PulsePoll is a full-stack real-time polling application where authenticated users can create polls, vote once per poll, and view near-real-time voting results.

## Live Demo

- Frontend: https://pulse-poll-frontend.onrender.com
- Backend API: https://pulse-poll-backend.onrender.com
- Health Check: https://pulse-poll-backend.onrender.com/api/health

## Features

- User registration and login
- JWT-based authentication
- Protected frontend and backend routes
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
- Live percentage-based result visualization
- Production deployment using Render

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

### Deployment

- Render
- GitHub
- MongoDB Atlas
- Render Redis

## Project Architecture

```text
User
 |
 v
React Frontend
 |
 | REST API
 v
Go + Gin Backend
 |
 +------------------+
 |                  |
 v                  v
MongoDB Atlas      Redis
 |                  |
 +--------+---------+
          |
          v
     Poll Results

Project Structure
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
|   |   +-- components/
|   |   +-- pages/
|   +-- package.json
|   +-- vite.config.js
|
+-- .gitignore
+-- README.md
API Endpoints
Authentication
Method	Endpoint	Description
POST	/api/auth/register	Register a new user
POST	/api/auth/login	Login and receive JWT token
Polls
Method	Endpoint	Description
POST	/api/polls	Create a new poll
GET	/api/polls	Get available polls
GET	/api/polls/:id	Get poll details
GET	/api/polls/:id/results	Get poll results
Voting
Method	Endpoint	Description
POST	/api/polls/:id/vote	Submit a vote
Health Check
Method	Endpoint	Description
GET	/api/health	Check backend health
Authentication

Protected endpoints require a valid JWT token.

Authorization: Bearer <token>

The backend validates the token before allowing access to protected resources.

Redis Caching

PulsePoll uses Redis to cache poll results and reduce repeated database queries.

Example cache key:

poll:results:<poll-id>

Cached results expire automatically.

After a successful vote, the related poll-results cache is invalidated so that subsequent requests receive updated results.

Validation

PulsePoll validates:

Required authentication
Password length
Poll question length
2-6 poll options
Empty poll options
Duplicate poll options
Future expiration dates
Valid poll IDs
Valid voting options
Duplicate votes
Expired polls
Running Locally
1. Clone the Repository
git clone https://github.com/kunal919109/pulse-poll.git
cd pulse-poll
2. Start Redis

Make sure Docker Desktop is running.

docker run --name pulsepoll-redis -p 6379:6379 -d redis

If the container already exists:

docker start pulsepoll-redis

Check Redis:

docker exec -it pulsepoll-redis redis-cli ping

Expected:

PONG
3. Configure Backend Environment Variables

Create a .env file inside the backend directory.

PORT=8080
MONGODB_URI=your_mongodb_connection_string
REDIS_URL=redis://localhost:6379
JWT_SECRET=your_jwt_secret
FRONTEND_URL=http://localhost:5173

Never commit real credentials or secrets to GitHub.

4. Start the Backend

Open a terminal:

cd backend
go mod tidy
go run ./cmd/server

Backend:

http://localhost:8080

Health check:

http://localhost:8080/api/health
5. Start the Frontend

Open another terminal:

cd frontend
npm install
npm run dev

Frontend:

http://localhost:5173

For local development, the frontend uses:

VITE_API_URL=http://localhost:8080
Environment Variables
Backend

The backend requires:

PORT
MONGODB_URI
REDIS_URL
JWT_SECRET
FRONTEND_URL
GIN_MODE
Frontend

The frontend requires:

VITE_API_URL

For local development:

VITE_API_URL=http://localhost:8080

For production:

VITE_API_URL=https://pulse-poll-backend.onrender.com

Never commit real credentials, API keys, database URLs, or secrets to GitHub.

Production Deployment

PulsePoll is deployed using Render.

Frontend

The React/Vite frontend is deployed as a Render Static Site.

https://pulse-poll-frontend.onrender.com

Build command:

npm ci && npm run build

Publish directory:

dist
Backend

The Go/Gin backend is deployed as a Render Web Service.

https://pulse-poll-backend.onrender.com

Build command:

go build -o server ./cmd/server

Start command:

./server
Production Services
React/Vite frontend
Go/Gin backend
MongoDB Atlas
Redis
Render
GitHub
Production Verification

The deployed application has been tested for:

User registration
User login
JWT authentication
Dashboard access
Poll creation
Voting
Duplicate vote prevention
Poll result updates
Logout
Protected routes
Frontend/backend communication
MongoDB persistence
Redis connectivity
React Router refresh handling
Backend health check
Production Build
Frontend
cd frontend
npm run build
Backend
cd backend
go build -o server ./cmd/server
Future Improvements
WebSocket-based real-time updates
Poll creator management
User profile page
Poll search and filtering
Pagination
Admin dashboard
Automated backend and frontend tests
Advanced analytics
Poll sharing
Email notifications
Author

Kunal Kasar

Computer Engineering Student
Savitribai Phule Pune University

License

This project is developed for learning, internship, and portfolio purposes.


### Important

Your current README has **“Production deployment” under Future Improvements**. The version above fixes that because your deployment is already complete.

After replacing the entire file, **save `README.md` only**. Don't run Git commands yet. Tell me **“done”**.  