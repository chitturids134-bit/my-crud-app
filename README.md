
# my-crud-app

CRUD app for tracking gym workouts.

## What It Is

A web app to log and track your daily gym sets — exercises, weights, and reps — so you always know where to start next session.

## The Problem It Solves

Every time I hit the gym, I couldn't remember what weight I lifted last session. I'd spend 10 minutes guessing, wasting time, and sometimes going too light or too heavy. This app records every set I log with the exact weight, reps, and date — so I always know exactly where to start.

## What I Intentionally Excluded

- **User authentication**: Adding login would require sessions or JWT tokens, significantly increasing complexity. Since this MVP is only for my personal use, I don't need it.
- **Social features**: Sharing workouts or following friends would add database complexity. My focus was shipping a simple, fast MVP.
- **Advanced analytics**: Charts and graphs for progress tracking would require additional charting libraries. The raw data is sufficient for now.

## Tech Stack

- **Backend**: Node.js + Express + MongoDB
- **Frontend**: Vanilla HTML, CSS, JavaScript
- **Deployed**: Render (backend) + Netlify (frontend)

## Live Deployment

**Frontend**: [Deploying to Netlify]  
**Backend**: [Deploying to Render]

## How to Run Locally

### Backend Setup

```bash
cd backend
npm install
```

Create a `.env` file (copy from `.env.example`):

```env
PORT=3000
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/gym-tracker
```

Start the backend:

```bash
npm run dev
```

### Frontend Setup

```bash
cd frontend
python3 -m http.server 5000
```

Visit `http://localhost:5000`

## CRUD Operations

All four operations are implemented and tested:

- **CREATE** (POST /workouts) - Log a new workout
- **READ** (GET /workouts) - View all workouts
- **UPDATE** (PUT /workouts/:id) - Edit a workout
- **DELETE** (DELETE /workouts/:id) - Remove a workout

