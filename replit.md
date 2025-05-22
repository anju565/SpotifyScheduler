# StudyBeats - Spotify Study Timer Application

## Overview

StudyBeats is a study timer application with Spotify integration. It helps users maintain focus during study sessions with timed study periods and breaks, with the ability to play music from Spotify during breaks. The application uses a modern tech stack with React for the frontend, Express for the backend, and Drizzle ORM for database interactions.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend
- **Framework**: React
- **UI Components**: ShadCN UI library (built on Radix UI primitives)
- **Styling**: TailwindCSS
- **State Management**: React Query for server state, React's useState/useEffect for local state
- **Routing**: Wouter (lightweight alternative to React Router)

### Backend
- **Framework**: Express.js
- **API**: RESTful API endpoints
- **Database**: Drizzle ORM with PostgreSQL support
- **Authentication**: Session-based authentication (express-session)

### Database
- **ORM**: Drizzle ORM
- **Schema**: User accounts, settings, and Spotify integration data
- **Tables**: 
  - `users`: User account information
  - `settings`: User preferences for study/break durations and notifications

## Key Components

### Frontend Components
1. **Timer Page**: Main interface showing the countdown timer
2. **TimerCircle**: Visual representation of the timer with progress indication
3. **SpotifyPlayer**: Displays currently playing track information
4. **SettingsModal**: Allows users to configure timer settings
5. **SpotifyAuthModal**: Facilitates Spotify authentication
6. **Notification**: Displays alerts for break and study periods

### Backend Components
1. **Express Server**: Handles HTTP requests and serves the frontend
2. **API Routes**: Endpoints for settings and Spotify integration
3. **Storage Layer**: Database interaction for persistent data
4. **Spotify Integration**: OAuth authentication and API interaction

## Data Flow

1. **Authentication Flow**:
   - User logs in/registers
   - Session is created and stored
   - User is redirected to main application

2. **Settings Flow**:
   - User preferences are loaded from database
   - User can modify settings through the UI
   - Changes are persisted to the database

3. **Timer Flow**:
   - Timer counts down based on user settings
   - When study period ends, notification is shown
   - During breaks, Spotify integration can play music
   - Cycle repeats based on user interaction

4. **Spotify Integration Flow**:
   - User connects to Spotify via OAuth
   - Application retrieves and stores refresh token
   - During breaks, application can control Spotify playback
   - User can select playlists to play during breaks

## External Dependencies

### Frontend Libraries
- React and React DOM
- TanStack React Query for data fetching
- Radix UI components (accordion, dialog, etc.)
- TailwindCSS for styling
- Wouter for routing
- Lucide React for icons

### Backend Libraries
- Express for the server
- Drizzle ORM for database operations
- Express-session for session management
- Connect-pg-simple for PostgreSQL session storage

### External Services
- Spotify Web API for music integration

## Deployment Strategy

The application is configured for deployment on Replit with the following considerations:

1. **Build Process**:
   - Frontend: Vite builds the React application
   - Backend: esbuild bundles the server code
   - Combined into a single deployable package

2. **Runtime Environment**:
   - Node.js 20
   - PostgreSQL 16 for database
   - Environment variables for configuration

3. **Scaling**:
   - Configured for autoscaling deployment on Replit

4. **Database Management**:
   - Drizzle ORM for schema management
   - Migration support through drizzle-kit

## Development Workflow

1. **Local Development**:
   - `npm run dev`: Starts the development server
   - Vite provides HMR for frontend changes
   - Server auto-restarts for backend changes

2. **Database Operations**:
   - `npm run db:push`: Updates database schema

3. **Production Build**:
   - `npm run build`: Creates optimized production build
   - `npm run start`: Runs the production build