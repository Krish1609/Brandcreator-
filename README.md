# BrandCreator - Brand & Creator Collaboration Platform

AI-powered marketplace connecting brands and creators with smart analytics, fake follower detection, and seamless collaboration management.

---

## Project Structure

```
brandcreator/
├── backend/          ← Node.js + Express + MySQL (Sequelize ORM) API
│   ├── config/       ← MySQL database connection
│   ├── models/       ← Sequelize models (User, Campaign, Application, Message, Payment, etc.)
│   ├── routes/       ← REST API endpoints
│   ├── middleware/   ← JWT authentication middleware
│   ├── utils/        ← AI scoring and ML analysis logic
│   ├── uploads/      ← Uploaded media storage
│   ├── server.js     ← Express server + Socket.IO real-time WebSocket
│   └── seed.js       ← MySQL database seeder
│
└── frontend/         ← Next.js 14 + Tailwind CSS + Redux Toolkit
    └── src/app/
        ├── page.js              ← Modern landing page
        ├── auth/                ← Login, Register, Password Reset
        ├── dashboard/           ← Creator & Brand Dashboard
        │   ├── analytics/       ← Performance analytics & charts
        │   └── profile/         ← Creator profile & AI audit
        ├── campaigns/           ← Browse, create, and manage campaigns
        ├── creators/            ← Creator discovery directory
        ├── messages/            ← Real-time chat (Socket.IO)
        └── admin/               ← Platform administration panel
```

---

## Setup Instructions (Step by Step)

### Step 1: Requirements
- **Node.js** (v18+)
- **MySQL Server** (v8.0+): Local MySQL Server (e.g. `MySQL80`) or Cloud MySQL (Railway, Aiven, PlanetScale)

### Step 2: Setup Backend

Open terminal:

```bash
# Navigate to backend folder
cd backend

# Install dependencies
npm install

# Create environment file from template
cp .env.example .env
```

Configure `backend/.env`:
```env
PORT=5000
DB_HOST=localhost
DB_PORT=3306
DB_NAME=brandcreator
DB_USER=root
DB_PASSWORD=your_mysql_password
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
CLIENT_URL=http://localhost:3000
RAPIDAPI_KEY=your_rapidapi_key
SMTP_HOST=smtp.gmail.com
SMTP_PORT=465
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_gmail_app_password
```

Create the database in MySQL:
```sql
CREATE DATABASE IF NOT EXISTS brandcreator;
```

Seed initial demo data (creators, brands, campaigns, payments):
```bash
node seed.js
```

Start the backend server:
```bash
npm run dev
# or: node server.js
```

You should see:
```
🚀 Server running on port 5000
✅ MySQL Connected
✅ MySQL Models Synced
```

### Step 3: Setup Frontend

Open a new terminal window:

```bash
# Navigate to frontend folder
cd frontend

# Install dependencies
npm install

# Create environment file from template
cp .env.example .env.local

# Start Next.js development server
npm run dev
```

### Step 4: Open the Application

Open your browser at: **http://localhost:3000**

---

## Demo Accounts

All seeded demo accounts use password: `demo123`

| Role | Name | Email | Password |
|:---|:---|:---|:---|
| **Creator** | Krish Vaghasiya | `krish@creator.com` | `demo123` |
| **Creator** | Manav Patel | `manav@creator.com` | `demo123` |
| **Creator** | Utsav Shah | `utsav@creator.com` | `demo123` |
| **Brand** | Krish Tech Media | `krish@brand.com` | `demo123` |
| **Brand** | Nike Running | `nike@demo.com` | `demo123` |
| **Brand** | Spotify India | `spotify@demo.com` | `demo123` |
| **Admin** | Administrator | `admin@demo.com` | `demo123` |

---

## Core Features

### For Creators
- **Verified Profile:** Bio, social links, location, niche tags, and custom rate cards.
- **AI Creator Audit:** Engagement rate, authentic vs fake follower scoring, consistency ratings.
- **Campaign Marketplace:** Search and filter active campaigns by niche, compensation, and requirements.
- **Real-Time Deals:** Direct messaging and deal agreement negotiation.
- **Earnings & Analytics:** Real-time earnings breakdown and application history.

### For Brands
- **Campaign Creation:** Set deliverables, requirements (min followers, engagement), and budget.
- **Creator Discovery:** Advanced search by followers, engagement rate, AI score, and location.
- **Application Management:** Review proposals, shortlist candidates, and accept deals.
- **Real-Time Collaboration:** Live chat with creators via WebSockets.
- **Campaign Performance:** Track proposals, campaign views, and spend.

### For Admins
- **Platform Analytics:** Total users, creator-brand breakdown, active deals, and platform volume.
- **User Management:** Verify, feature, ban, or remove user accounts.
- **Campaign Supervision:** Global oversight of active and completed marketplace campaigns.

---

## Tech Stack

| Layer | Technology |
|:---|:---|
| **Frontend** | Next.js 14 (App Router), Tailwind CSS, Redux Toolkit, Recharts, Lucide Icons |
| **Backend** | Node.js, Express.js |
| **Database** | **MySQL 8** (with **Sequelize ORM**) |
| **Realtime** | Socket.IO (WebSockets) |
| **Authentication** | JWT (JSON Web Tokens) & bcryptjs |
| **AI / ML** | Scoring heuristics & Instagram analytics engine |
