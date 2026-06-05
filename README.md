# GitHub Profile Analyzer API

A clean, interview-friendly REST API built with **Node.js**, **TypeScript**, **Express 5**, and **MySQL** that analyzes GitHub user profiles, calculates derived insights, and persists the data for retrieval.

---

## Features

- 🔍 Fetch live GitHub profile data via the GitHub Public API
- 📊 Calculate account age, followers/following ratio, and popularity score
- 🗄️ Persist profiles in MySQL (upsert — no duplicates)
- 📄 Paginated list of all analyzed profiles
- 🏆 Top profiles ranked by popularity score
- ✅ Request validation with Zod
- 🛡️ Centralized error handling middleware
- 🔒 Strict TypeScript — no `any`

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Runtime | Node.js |
| Language | TypeScript (strict) |
| Framework | Express 5 |
| Database | MySQL 8 |
| DB Driver | mysql2/promise (connection pool) |
| HTTP Client | Axios |
| Validation | Zod |
| Config | dotenv |

---

## Project Structure

```
src/
├── app.ts                        # Express app setup
├── server.ts                     # HTTP server entry point
├── config/
│   └── db.ts                     # MySQL connection pool
├── controllers/
│   └── profile.controller.ts     # Route handlers
├── services/
│   └── github.service.ts         # GitHub API calls
├── routes/
│   └── profile.routes.ts         # Route definitions
├── middleware/
│   └── errorHandler.ts           # Centralized error handler
└── utils/
    └── calculateInsights.ts      # Insight calculation helpers

database/
└── schema.sql                    # MySQL schema
```

---

## Setup Instructions

### 1. Clone the repository

```bash
git clone https://github.com/kartik7310/github-profile-analyzer.git
cd github-profile-analyzer
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

```bash
cp .env.example .env
# Edit .env with your MySQL credentials
```

### 4. Set up the database

Run the SQL schema in your MySQL client:

```bash
mysql -u root -p < database/schema.sql
```

Or open `database/schema.sql` in MySQL Workbench and execute it.

### 5. Start the development server

```bash
npm run dev
```

The API will be running at: **http://localhost:5000**

---

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Port the server listens on | `5000` |
| `DB_HOST` | MySQL host | `localhost` |
| `DB_USER` | MySQL username | `root` |
| `DB_PASSWORD` | MySQL password | — |
| `DB_NAME` | MySQL database name | `github_analyzer` |

---

## Database Setup

The `database/schema.sql` file creates the `github_analyzer` database and the `profiles` table automatically.

Key design decisions:
- `username` has a `UNIQUE` constraint — re-analyzing the same user updates the existing row (`ON DUPLICATE KEY UPDATE`).
- `followers_following_ratio` is stored as `DECIMAL(10,2)`.
- `analyzed_at` records when the analysis was last run.

---

## API Endpoints

### Base URL: `http://localhost:5000/api/profiles`

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/analyze` | Analyze and save a GitHub profile |
| GET | `/` | Get all analyzed profiles (paginated) |
| GET | `/top` | Get top profiles by popularity score |
| GET | `/:id` | Get a single profile by database ID |

---

## Sample Requests & Responses

### POST /api/profiles/analyze

**Request:**
```bash
curl -X POST http://localhost:5000/api/profiles/analyze \
  -H "Content-Type: application/json" \
  -d '{"username": "torvalds"}'
```

**Response:**
```json
{
  "success": true,
  "message": "Profile analyzed successfully",
  "data": {
    "id": 1,
    "username": "torvalds",
    "name": "Linus Torvalds",
    "bio": "Just a simple coder :)",
    "location": "Portland, OR",
    "company": "Linux Foundation",
    "followers": 244000,
    "following": 0,
    "public_repos": 8,
    "public_gists": 0,
    "avatar_url": "https://avatars.githubusercontent.com/u/1024025?v=4",
    "profile_url": "https://github.com/torvalds",
    "account_created_at": "2011-09-03T15:26:22.000Z",
    "account_age_days": 4657,
    "followers_following_ratio": 244000,
    "popularity_score": 488040,
    "analyzed_at": "2024-06-05T08:00:00.000Z"
  }
}
```

---

### GET /api/profiles?page=1&limit=5

**Response:**
```json
{
  "success": true,
  "message": "Profiles fetched successfully",
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 5,
    "total": 12,
    "totalPages": 3
  }
}
```

---

### GET /api/profiles/top

**Response:**
```json
{
  "success": true,
  "message": "Top profiles fetched successfully",
  "data": [...]
}
```

---

### GET /api/profiles/1

**Response:**
```json
{
  "success": true,
  "message": "Profile fetched successfully",
  "data": { ... }
}
```

---

### Error Response

```json
{
  "success": false,
  "message": "GitHub user not found"
}
```

---

## Run Commands

```bash
# Development (auto-restart on save)
npm run dev

# Build TypeScript to dist/
npm run build

# Run compiled production build
npm start
```

---

## Insights Calculation

| Insight | Formula |
|---------|---------|
| `account_age_days` | `floor((now - created_at) / 86400000)` |
| `followers_following_ratio` | `following === 0 ? followers : followers / following` |
| `popularity_score` | `(followers × 2) + (public_repos × 5)` |
