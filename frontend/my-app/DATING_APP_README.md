# Dating App - Frontend

A modern dating application built with Next.js and TypeScript that allows users to create profiles, like other users, match, and schedule dates.

## Features

### PART A - CREATE PROFILE
Users can create a profile including:
- Name
- Age
- Gender
- Short bio
- Email (used as a simple identifier)

Profiles are saved to the backend database (NestJS + Prisma).

### PART B - DISPLAY & LIKE
**1. Show Profile List**
- Display all created profiles
- Each profile has a Like button

**2. Match Logic**
- When User A likes User B AND User B likes User A
- System shows: "It's a Match! 💝"
- Matches are persisted in the database

### PART C - DATE SCHEDULING
After a successful match, both users can schedule a date:

**C1. Availability Selection**
- Users select available time slots within the next 3 weeks
- Choose date + time range (from – to)

**C2. Check Common Availability**
- System finds the first overlapping time slot
- If found: ✅ "You have a date scheduled on: [date] [time]"
- If no overlap: ❌ "No common time found. Please select again."

## Getting Started

### Prerequisites
- Node.js 18+
- Backend server running on http://localhost:3000

### Installation

1. Navigate to the frontend directory:
```bash
cd frontend/my-app
```

2. Install dependencies:
```bash
npm install
```

3. Make sure the backend server is running on http://localhost:3000

4. Start the development server:
```bash
npm run dev
```

5. Open [http://localhost:3001](http://localhost:3001) in your browser

## Usage Guide

### 1. Create Your Profile
- Click on "Create Profile" tab
- Fill in your details (name, age, gender, email, bio)
- Click "Create Profile" button
- Your email is stored in localStorage to identify you

### 2. Browse and Like Profiles
- Click on "Browse Profiles" tab
- View all available profiles
- Click the ❤️ "Like" button on profiles you're interested in
- If the other user has also liked you, you'll see "It's a Match!" notification

### 3. View Your Matches
- Click on "My Matches" tab
- See all your mutual matches
- Each match shows the matched user's profile
- Click "Schedule a Date 📅" button to proceed

### 4. Schedule a Date
- Select your available time slots (within next 3 weeks)
- Choose date and time range (from - to)
- Click "Submit Availability"
- After both users submit their availability, click "Check Common Availability"
- System will show if there's an overlapping time slot

## Tech Stack
- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **HTTP Client**: Axios
- **Backend API**: NestJS (running on port 3000)

## API Endpoints Used
- `POST /profiles` - Create a new profile
- `GET /profiles` - Get all profiles
- `POST /matchs` - Like a profile (creates match if mutual)
- `GET /matchs` - Get all matches
- `POST /availabilities` - Submit availability for a match
- `POST /availabilities/check` - Check common availability between matched users

## Project Structure
```
app/
├── components/
│   ├── CreateProfile.tsx         # Profile creation form
│   ├── ProfileList.tsx           # Browse and like profiles
│   ├── MatchDisplay.tsx          # View matches
│   └── AvailabilityScheduler.tsx # Schedule dates
├── Database/
│   └── Axios.ts                  # API configuration
├── globals.css                   # Global styles
├── layout.tsx                    # Root layout
└── page.tsx                      # Main page with tabs
```

## Features Explained

### Profile Management
- Users create profiles with basic information
- Current user is identified by email stored in localStorage
- No complex authentication system required

### Matching System
- Bidirectional matching: both users must like each other
- Real-time match notification
- Persistent storage of matches

### Date Scheduling
- Availability selection within 3-week window
- Automatic overlap detection
- Clear feedback on scheduling success/failure

## Notes
- The app uses localStorage to remember the current user's email
- No authentication system is implemented (as per requirements)
- Backend must be running for the app to function
- All data is persisted in the backend database

## Future Enhancements
- Profile pictures upload
- Multiple availability slots per user
- Chat functionality between matches
- User authentication system
- Profile editing and deletion
- Match history and analytics
