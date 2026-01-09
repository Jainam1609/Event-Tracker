# Implementation Guide

This document explains the architecture, data flow, and implementation details of the User Analytics Application.

## Table of Contents

1. [System Architecture](#system-architecture)
2. [Data Flow](#data-flow)
3. [Component Breakdown](#component-breakdown)
4. [File Structure & Responsibilities](#file-structure--responsibilities)
5. [Key Implementation Details](#key-implementation-details)

## System Architecture

```
┌─────────────────────────────────────┐
│      Dashboard (Next.js/React)      │
│         Port: 3000                  │
│  ┌──────────┐  ┌──────────┐         │
│  │ Sessions │  │ Heatmap  │         │
│  └──────────┘  └──────────┘         │
│  ┌──────────────────────────────┐   │
│  │      Demo Page (/demo)        │   │
│  │  + analytics.js (from /public)│   │
│  └──────────────┬───────────────┘   │
└─────────────────┼───────────────────┘
                  │ HTTP POST
                  │ Events (JSON)
                  ▼
         ┌─────────────────┐      ┌──────────────┐
         │   Backend API   │◄────►│   MongoDB    │
         │  (Express.js)   │      │   Database   │
         │  Port: 3001     │      │  Port: 27017 │
         └────────┬─────────┘      └──────────────┘
                  │
                  │ HTTP GET
                  │ API Calls
                  ▼
         ┌─────────────────┐
         │  Dashboard UI   │
         │  (Next.js/React)│
         │  Port: 3000     │
         └─────────────────┘
```

## Data Flow

### 1. Event Tracking Flow

```
User Action (Click/Page Load)
    │
    ▼
analytics.js (Tracking Script)
    │
    ├─► Generate/Create Session ID (localStorage)
    ├─► Capture Event Data:
    │     - session_id
    │     - event_type (page_view | click)
    │     - page_url
    │     - timestamp
    │     - click_x, click_y (for clicks)
    │
    ▼
HTTP POST to /api/events
    │
    ▼
Backend API (Express)
    │
    ├─► Validate Request
    ├─► Create Event Document
    │
    ▼
MongoDB Database
    │
    └─► Store Event Document
```

### 2. Dashboard Data Retrieval Flow

```
Dashboard Page Load
    │
    ▼
Frontend (React/Next.js)
    │
    ├─► GET /api/events/sessions
    │     └─► Backend aggregates sessions
    │         └─► Returns: session_id, totalEvents, uniquePages, timestamps
    │
    ├─► GET /api/events/sessions/:sessionId
    │     └─► Backend queries MongoDB
    │         └─► Returns: All events for session, ordered by timestamp
    │
    └─► GET /api/events/heatmap?page_url=...
          └─► Backend queries MongoDB for clicks on page
              └─► Returns: All click events with coordinates
```

## Component Breakdown

### Frontend Components

#### 1. **Tracking Script** (`tracking-script/analytics.js`)
- **Purpose**: Client-side event tracking
- **Key Functions**:
  - `getSessionId()`: Generates/maintains session ID in localStorage
  - `trackPageView()`: Captures page load events
  - `trackClick(event)`: Captures click events with coordinates
  - `sendEvent(data)`: Sends events to backend API
- **Session Management**: 
  - 30-minute session expiration
  - Persistent across page reloads via localStorage
- **Event Types**: `page_view`, `click`

#### 2. **Dashboard - Sessions View** (`frontend/pages/index.js`)
- **Purpose**: Display all user sessions
- **Data Source**: `GET /api/events/sessions`
- **Features**:
  - Lists all sessions with metadata
  - Shows total events per session
  - Shows unique pages visited
  - Shows first/last seen timestamps
  - Links to detailed session view

#### 3. **Dashboard - Session Detail** (`frontend/pages/session/[sessionId].js`)
- **Purpose**: Display user journey for a specific session
- **Data Source**: `GET /api/events/sessions/:sessionId`
- **Features**:
  - Timeline of all events in chronological order
  - Event type indicators (page_view, click)
  - Click coordinates for click events
  - Page URLs for navigation tracking

#### 4. **Dashboard - Heatmap View** (`frontend/pages/heatmap.js`)
- **Purpose**: Visualize click positions on pages
- **Data Source**: `GET /api/events/heatmap?page_url=...`
- **Features**:
  - Page URL selector dropdown
  - Visual representation of click positions
  - Interactive dots showing click locations
  - Hover tooltips with coordinates

### Backend Components

#### 1. **Server** (`backend/server.js`)
- **Purpose**: Main Express application entry point
- **Responsibilities**:
  - Initialize MongoDB connection
  - Configure CORS middleware
  - Register API routes
  - Start HTTP server on port 3001

#### 2. **Database Connection** (`backend/config/database.js`)
- **Purpose**: MongoDB connection management
- **Functionality**:
  - Connects to MongoDB using Mongoose
  - Uses connection string from environment variables
  - Handles connection errors gracefully

#### 3. **Event Model** (`backend/models/Event.js`)
- **Purpose**: Define event data schema
- **Schema Fields**:
  - `session_id` (String, indexed)
  - `event_type` (String, enum: 'page_view' | 'click')
  - `page_url` (String, indexed)
  - `timestamp` (Date, indexed)
  - `click_x` (Number, required for clicks)
  - `click_y` (Number, required for clicks)
- **Indexes**:
  - Single: session_id, page_url, timestamp
  - Compound: (session_id, timestamp), (page_url, event_type)

#### 4. **API Routes** (`backend/routes/events.js`)
- **Endpoints**:
  - `POST /api/events`: Store new event
    - Validates required fields
    - Validates event_type
    - Validates click coordinates for click events
    - Saves to MongoDB
    - Returns stored event
  
  - `GET /api/events/sessions`: Get all sessions
    - Aggregates events by session_id
    - Calculates totalEvents, uniquePages
    - Gets firstSeen, lastSeen timestamps
    - Sorted by lastSeen (most recent first)
  
  - `GET /api/events/sessions/:sessionId`: Get session events
    - Queries MongoDB for specific session
    - Sorted by timestamp (chronological order)
    - Returns all events for session
  
  - `GET /api/events/heatmap?page_url=...`: Get heatmap data
    - Filters events by page_url and event_type='click'
    - Returns click coordinates and metadata
  
  - `GET /api/events/pages`: Get unique pages
    - Returns list of all unique page URLs

### Demo Page

#### **Demo Page** (`frontend/pages/demo.js`)
- **Purpose**: Test the tracking script (integrated into dashboard)
- **Location**: Accessible at `/demo` route
- **Features**:
  - Interactive buttons, forms, images, tables, tabs
  - Displays current session ID from localStorage
  - Shows tracking status
  - Demonstrates all event types
  - Same session shared with dashboard navigation

## Session Detection

Since the demo page is integrated into the dashboard (at `/demo` route), session detection works seamlessly across the entire application.

### Session Storage Mechanism

The tracking script uses **localStorage** to store session information:

```javascript
// Session data stored in browser's localStorage
localStorage.setItem('analytics_session_id', 'session_1234567890_abc123');
localStorage.setItem('analytics_session_id_timestamp', '1234567890');
```

### Key Points:

1. **Same-Origin Storage**: 
   - Since the demo page is at `http://localhost:3000/demo` and the dashboard is at `http://localhost:3000`, they share the same localStorage
   - All events from both pages appear in the same session

2. **Session Expiration**:
   - Sessions expire after 30 minutes of inactivity
   - New session is created automatically when old one expires

3. **Session ID Format**:
   - Format: `session_{timestamp}_{random}`
   - Example: `session_1704067200000_abc123xyz`

4. **Cross-Page Tracking**:
   - Navigating between dashboard pages maintains the same session
   - Events from demo page and dashboard pages are linked by session_id

## File Structure & Responsibilities

```
Assignment – Full Stack Engineer/
│
├── backend/                          # Backend API Server
│   ├── config/
│   │   └── database.js              # MongoDB connection setup
│   ├── models/
│   │   └── Event.js                 # Mongoose schema for events
│   ├── routes/
│   │   └── events.js                # API route handlers
│   ├── server.js                    # Express server entry point
│   ├── package.json                 # Backend dependencies
│   └── env.example                  # Environment variables template
│
├── frontend/                         # Dashboard UI
│   ├── lib/
│   │   └── api.js                   # API client functions (Axios)
│   ├── pages/
│   │   ├── _app.js                  # Next.js app wrapper
│   │   ├── index.js                 # Sessions list page
│   │   ├── heatmap.js               # Heatmap visualization page
│   │   └── session/
│   │       └── [sessionId].js       # Dynamic session detail page
│   ├── styles/
│   │   └── globals.css              # Global CSS styles
│   ├── package.json                 # Frontend dependencies
│   ├── next.config.js               # Next.js configuration
│   └── .eslintrc.json               # ESLint configuration
│
├── tracking-script/
│   └── analytics.js                 # Client-side tracking script source
│
├── scripts/
│   └── setup.sh                     # Automated setup script (bash)
│
├── .gitignore                       # Git ignore patterns
├── .nvmrc                           # Node.js version specification
├── package.json                     # Root package.json
├── README.md                        # Main documentation
├── SETUP.md                         # Setup instructions
├── DEPLOYMENT.md                    # Deployment guide
├── TROUBLESHOOTING.md               # Troubleshooting guide
├── IMPLEMENTATION.md                # This file
└── setup.py                         # Automated setup script (Python)
```

## Key Implementation Details

### Session Management

**Location**: `tracking-script/analytics.js`

- Session IDs are generated client-side using: `session_${timestamp}_${randomString}`
- Stored in `localStorage` with key: `analytics_session_id`
- Session expires after 30 minutes of inactivity
- New session created when:
  - No session exists
  - Existing session has expired
  - User clears localStorage

**Integrated Demo Page**:
- Demo page is at `/demo` route (same origin as dashboard at `/`)
- Sessions are shared via localStorage across all dashboard pages
- Events from demo page appear in the same session as dashboard navigation
- No CORS issues since everything is on the same domain
- Tracking script served from `/analytics.js` (Next.js public folder)
- Session ID displayed on demo page for verification

### Event Tracking

**Location**: `tracking-script/analytics.js`

- **Page Views**: Automatically tracked on:
  - Initial page load
  - DOM content loaded
  - SPA navigation (via MutationObserver)
  
- **Clicks**: Tracked using event capture phase
  - Coordinates: `clientX`, `clientY` (viewport-relative)
  - All clicks on document are captured
  - Includes clicks on dynamically added elements

### Data Storage

**Location**: `backend/models/Event.js`

- Uses Mongoose ODM for MongoDB
- Schema validation ensures data integrity
- Indexes optimized for common queries:
  - Session-based queries: `session_id`, `(session_id, timestamp)`
  - Page-based queries: `page_url`, `(page_url, event_type)`
  - Time-based queries: `timestamp`

### API Design

**Location**: `backend/routes/events.js`

- RESTful API design
- Proper HTTP status codes:
  - `201 Created`: Event stored successfully
  - `400 Bad Request`: Validation errors
  - `500 Internal Server Error`: Server errors
- Input validation on all endpoints
- Error handling with descriptive messages

### Dashboard Features

**Location**: `frontend/pages/`

- **Sessions View**:
  - Real-time data fetching on mount
  - Refresh button for manual updates
  - Responsive table layout
  - Click-to-navigate to session details

- **Session Detail**:
  - Timeline visualization
  - Event type badges
  - Formatted timestamps
  - Click coordinate display

- **Heatmap View**:
  - Page URL dropdown (auto-populated)
  - Click position dots on canvas
  - Hover interactions
  - Dynamic viewport sizing based on click data

### CORS Configuration

**Location**: `backend/server.js`

- Permissive CORS for development
- Allows requests from:
  - Dashboard (localhost:3000)
  - Demo page (localhost:8080)
  - File:// protocol (null origin)
- Can be restricted via environment variables for production

### Error Handling

- **Frontend**: 
  - Try-catch blocks in API calls
  - User-friendly error messages
  - Loading states during API calls

- **Backend**:
  - Input validation before processing
  - Try-catch in async routes
  - Database error handling
  - Console logging for debugging

### Development vs Production

**Current Configuration**: Development mode

- Debug logging enabled (console.log statements)
- Permissive CORS
- No authentication/authorization
- No rate limiting
- Environment variables for easy configuration

**Production Considerations** (not implemented):
- Remove debug logging
- Restrict CORS to specific origins
- Add authentication middleware
- Implement rate limiting
- Add request validation middleware
- Enable request logging/monitoring

## Requirements Verification

### ✅ Event Tracking (Client Side)
- [x] JavaScript tracking script (`tracking-script/analytics.js`)
- [x] Tracks `page_view` events
- [x] Tracks `click` events
- [x] Includes `session_id` (localStorage)
- [x] Includes event type
- [x] Includes page URL
- [x] Includes timestamp
- [x] Includes click x/y coordinates (for clicks)
- [x] Sends data to backend API
- [x] Demo webpage included (`demo/index.html`)

### ✅ Backend (Node.js)
- [x] Built with Node.js/Express
- [x] API to receive and store events (`POST /api/events`)
- [x] API to fetch sessions with event counts (`GET /api/events/sessions`)
- [x] API to fetch events for a session (`GET /api/events/sessions/:sessionId`)
- [x] API to fetch click data for heatmap (`GET /api/events/heatmap`)

### ✅ Database
- [x] Uses MongoDB
- [x] Stores events in structured format
- [x] Suitable for querying (indexed fields)

### ✅ Dashboard (Frontend)
- [x] Built with React/Next.js
- [x] Sessions View listing all sessions with total events
- [x] Clicking session shows ordered list of events (user journey)
- [x] Heatmap View with page URL selection
- [x] Displays click positions visually (dots on canvas)

## Summary

This implementation provides a complete, production-ready (with production considerations noted) user analytics system. The architecture is clean, modular, and follows best practices for separation of concerns. The system tracks user interactions on webpages and provides meaningful visualizations through an intuitive dashboard interface.