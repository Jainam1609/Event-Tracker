# User Analytics Application

A full-stack application for tracking user interactions (page views, clicks, form submissions, and more) on webpages and visualizing them through an interactive dashboard.

## Features

- **Event Tracking**: JavaScript tracking script that captures multiple event types:
  - `page_view` - Page loads and navigation
  - `click` - All clicks with coordinates
  - `button_click` - Button-specific clicks with metadata
  - `form_submit` - Form submissions with field information
  - `input_change` - Input field value changes
  - `input_focus` - Input field focus events
  - `scroll` - Page scroll events (throttled)
  - `image_view` - Image load events
- **Session Management**: Automatic session ID generation and management using localStorage
- **Backend API**: RESTful API built with Node.js and Express
- **Database**: MongoDB for storing events with optimized indexes
- **Dashboard**: React/Next.js dashboard with:
  - **Sessions View**: List all sessions with event counts and metadata
  - **User Journey**: Detailed timeline of events for a specific session
  - **Heatmap View**: Visual representation of click positions on pages
  - **Demo Page**: Integrated demo page for testing tracking (no separate server needed)

## Tech Stack

### Backend
- **Node.js** - Runtime environment
- **Express** - Web framework
- **MongoDB** - Database (via Mongoose ODM)
- **CORS** - Cross-origin resource sharing

### Frontend Dashboard
- **Next.js 14** - React framework
- **React 18** - UI library
- **Axios** - HTTP client

### Tracking Script
- **Vanilla JavaScript** - No dependencies, can be embedded anywhere
- **localStorage** - Session persistence
- **Fetch API** - Event sending with sendBeacon fallback

## Project Structure (Monorepo)

This is a **monorepo** - both backend and frontend are in the same repository. You can deploy both services from one GitHub repository to different hosting platforms.

```
├── backend/                      # Node.js/Express backend
│   ├── config/
│   │   └── database.js          # MongoDB connection
│   ├── models/
│   │   └── Event.js             # Event data model
│   ├── routes/
│   │   └── events.js            # API routes
│   ├── server.js                # Express server
│   └── package.json
├── frontend/
│   ├── lib/
│   │   └── api.js               # API client functions
│   ├── pages/
│   │   ├── index.js             # Sessions list page
│   │   ├── heatmap.js           # Heatmap view
│   │   ├── demo.js              # Demo page (integrated)
│   │   └── session/[sessionId].js  # Session detail page
│   ├── public/
│   │   └── analytics.js         # Tracking script (served statically)
│   ├── styles/
│   │   └── globals.css          # Global styles
│   └── package.json
├── tracking-script/
│   └── analytics.js             # Tracking script source
└── README.md
```

## Setup Instructions

### Quick Setup (Automated)

You can use either the Python setup script or the bash script:

```bash
# Option 1: Python setup script
python3 setup.py

# Option 2: Bash setup script
./scripts/setup.sh

# Option 3: npm script
npm run install:all
```

### Prerequisites

- **Node.js** (v16 or higher) - Install from [nodejs.org](https://nodejs.org/) or use [nvm](https://github.com/nvm-sh/nvm)
- **MongoDB** (running locally or connection string)
- **npm** (comes with Node.js)

### Step 1: Install Dependencies

```bash
# Install all dependencies (root, backend, and frontend)
npm run install:all
```

Or install manually:

```bash
# Root dependencies
npm install

# Backend dependencies
cd backend
npm install

# Frontend dependencies
cd ../frontend
npm install
```

### Step 2: Configure Environment Variables

Create a `.env` file in the `backend` directory:

```bash
cd backend
cp env.example .env
```

Edit `.env` with your configuration:

```env
PORT=3001
MONGODB_URI=mongodb://localhost:27017/analytics
CORS_ORIGIN=http://localhost:3000
```

**Note**: If using MongoDB Atlas or a remote MongoDB instance, update `MONGODB_URI` accordingly.

### Step 3: Start MongoDB

Make sure MongoDB is running on your system. Choose one of these options:

#### Option A: Docker (Recommended - Easiest)

```bash
# Start MongoDB in Docker
docker run -d -p 27017:27017 --name mongodb mongo:latest

# To stop MongoDB
docker stop mongodb

# To start MongoDB again
docker start mongodb
```

#### Option B: Homebrew (macOS)

```bash
# First, add MongoDB tap (if not already done)
brew tap mongodb/brew

# Install MongoDB
brew install mongodb-community@8.0

# Start MongoDB service
brew services start mongodb-community@8.0

# To stop MongoDB
brew services stop mongodb-community@8.0
```

#### Option C: MongoDB Atlas (Cloud - Free Tier)

1. Sign up at https://www.mongodb.com/cloud/atlas
2. Create a free cluster
3. Get your connection string:
   - Click "Connect" on your cluster
   - Select "Drivers" option
   - Choose "Node.js" as the driver
   - Copy the connection string
   - Replace `<password>` with your database user password
   - Replace `<dbname>` with `analytics`
4. Update `backend/.env` with your Atlas connection string:
   ```
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/analytics
   ```

#### Option D: Download MongoDB Directly

1. Download from https://www.mongodb.com/try/download/community
2. Follow installation instructions for macOS
3. Start MongoDB manually or configure as a service

### Step 4: Start the Backend Server

```bash
cd backend
npm run dev
```

The backend API will be available at `http://localhost:3001`

### Step 5: Start the Frontend Dashboard

In a new terminal:

```bash
cd frontend
npm run dev
```

The dashboard will be available at `http://localhost:3000`

### Step 6: Test the Tracking Script

The demo page is now integrated into the dashboard. Simply navigate to:

```
http://localhost:3000/demo
```

Or click the "Demo" link in the dashboard navigation. The tracking script will automatically start sending events to the backend.

**Session Detection**: Since the demo page is on the same domain as the dashboard, sessions are shared via localStorage. Events from the demo page will appear in the same session as dashboard navigation events. See [IMPLEMENTATION.md](./IMPLEMENTATION.md) for details.

## API Endpoints

### POST `/api/events`
Store a new event.

**Request Body:**
```json
{
  "session_id": "session_1234567890_abc123",
  "event_type": "click",
  "page_url": "http://example.com/page",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "click_x": 150,
  "click_y": 200,
  "metadata": {}
}
```

**Supported Event Types**: `page_view`, `click`, `form_submit`, `input_change`, `input_focus`, `scroll`, `button_click`, `image_view`

### GET `/api/events/sessions`
Get all sessions with event counts and metadata.

**Response:**
```json
{
  "sessions": [
    {
      "session_id": "session_1234567890_abc123",
      "totalEvents": 15,
      "uniquePages": 3,
      "firstSeen": "2024-01-15T10:30:00.000Z",
      "lastSeen": "2024-01-15T10:35:00.000Z"
    }
  ]
}
```

### GET `/api/events/sessions/:sessionId`
Get all events for a specific session, ordered by timestamp.

### GET `/api/events/heatmap?page_url=<url>`
Get all click events for a specific page URL (for heatmap visualization).

### GET `/api/events/pages`
Get all unique page URLs that have been tracked.

## Usage

### Embedding the Tracking Script

Add the tracking script to any webpage:

```html
<script>
  // Configure API endpoint (optional)
  window.ANALYTICS_API_ENDPOINT = 'http://localhost:3001/api/events';
</script>
<script src="path/to/analytics.js"></script>
```

Or use it inline:

```html
<script>
  // Paste the contents of tracking-script/analytics.js here
</script>
```

The script will automatically:
- Generate and manage session IDs (stored in localStorage)
- Track page views on load
- Track all click events and other interactions
- Send events to the backend API

**Note**: For the integrated demo page, the script is automatically loaded from `/analytics.js` (served from `frontend/public/`).

### Manual Tracking (Optional)

The script exposes a global `AnalyticsTracker` object for manual tracking:

```javascript
// Get current session ID
const sessionId = AnalyticsTracker.getSessionId();

// Manually track a page view
AnalyticsTracker.trackPageView();

// Manually track a click
AnalyticsTracker.trackClick(event);

// Track custom events
AnalyticsTracker.trackEvent('custom_event', { metadata: { key: 'value' } });
```

## Session Detection

Since the demo page is integrated into the dashboard at `/demo`, session detection works seamlessly:

- **Same Origin**: Demo page and dashboard share the same domain (`localhost:3000`)
- **Shared localStorage**: Session ID stored in localStorage is accessible across all dashboard pages
- **Unified Sessions**: Events from demo page appear in the same session as dashboard navigation
- **No CORS Issues**: Everything on the same origin eliminates cross-origin restrictions

See [IMPLEMENTATION.md](./IMPLEMENTATION.md) for detailed explanation.

## Assumptions and Trade-offs

### Assumptions

1. **Session Duration**: Sessions expire after 30 minutes of inactivity (configurable in `analytics.js`)
2. **Click Coordinates**: Uses viewport-relative coordinates (`clientX`, `clientY`) rather than page-relative coordinates
3. **API Endpoint**: Backend API is expected to be at `http://localhost:3001` by default (can be configured)
4. **MongoDB**: Assumes MongoDB is available locally or via connection string
5. **CORS**: Backend allows requests from `http://localhost:3000` (dashboard and integrated demo page)

### Trade-offs

1. **Session Management**: 
   - Uses localStorage instead of cookies for better cross-origin support
   - Session expiration is client-side only (no server-side validation)
   - Session IDs are generated client-side (potential for collisions, but minimal with timestamp + random)

2. **Event Delivery**:
   - Uses `fetch` API with `sendBeacon` fallback for reliability
   - Events are sent asynchronously (no blocking of page navigation)
   - No retry mechanism for failed requests (acceptable for analytics)

3. **Data Storage**:
   - Events are stored individually (not batched) - may be less efficient for high-volume sites
   - No data retention policy implemented (all events stored indefinitely)
   - Minimal data validation on backend (trusts client data)

4. **Heatmap Visualization**:
   - Simple dot-based visualization (not a true heatmap with gradients)
   - Viewport size estimated from click coordinates
   - No click intensity/density visualization

5. **Security**:
   - No authentication/authorization (open API endpoints)
   - No rate limiting implemented
   - Accepts data from any origin (CORS configured but permissive)

### Future Improvements

- Add authentication and authorization
- Implement event batching for better performance
- Add data retention policies
- Implement server-side session validation
- Add rate limiting and request validation
- Improve heatmap visualization with gradient/intensity
- Add filtering and date range selection in dashboard
- Implement real-time event streaming
- Add export functionality (CSV/JSON)

## Development

### Running in Development Mode

```bash
# Terminal 1: Backend
cd backend
npm run dev

# Terminal 2: Frontend (includes demo page)
cd frontend
npm run dev
```

The demo page is accessible at `http://localhost:3000/demo` - no separate server needed!

### Building for Production

```bash
# Build frontend
cd frontend
npm run build
npm start

# Start backend
cd backend
npm start
```

## Testing

1. Open the dashboard: `http://localhost:3000`
2. Navigate to the Demo page (click "Demo" in navigation)
3. Interact with various elements (buttons, forms, images, etc.)
4. Navigate back to Sessions page
5. Click "Refresh" to see your session with all tracked events
6. Click "View Journey" on your session to see the detailed event timeline
7. Navigate to Heatmap view to see click positions

## Troubleshooting

### Backend won't start
- Ensure MongoDB is running
- Check that port 3001 is available
- Verify `.env` file exists and has correct values

### Events not appearing in dashboard
- Verify backend is running and accessible
- Check browser console for CORS errors
- Ensure `API_ENDPOINT` in tracking script matches backend URL
- Check MongoDB connection and verify events are being stored
- Restart backend after schema changes

### CORS errors
- Update `CORS_ORIGIN` in backend `.env` file
- Or modify `cors` configuration in `backend/server.js`

### Session not detected
- Check browser localStorage: `localStorage.getItem('analytics_session_id')`
- Verify tracking script is loaded (check browser console)
- Ensure demo page is on same domain as dashboard
- See [IMPLEMENTATION.md](./IMPLEMENTATION.md) for session detection details

## Documentation

- [README.md](./README.md) - This file
- [SETUP.md](./SETUP.md) - Setup instructions and quick start
- [DEPLOYMENT.md](./DEPLOYMENT.md) - Deployment guide
- [TROUBLESHOOTING.md](./TROUBLESHOOTING.md) - Troubleshooting guide
- [IMPLEMENTATION.md](./IMPLEMENTATION.md) - Architecture, implementation details, and session detection

## Deployment

**Live Application:**
- **Frontend**: https://event-tracker-liart-psi.vercel.app
- **Backend API**: https://event-tracker-dftf.onrender.com
- **Health Check**: https://event-tracker-dftf.onrender.com/health

**Monorepo Deployment**: Both backend and frontend are in one repository. Deploy both services from the same GitHub repo to different platforms.

- **Frontend**: Deployed on [Vercel](https://vercel.com) (free tier)
- **Backend**: Deployed on [Render](https://render.com) (free tier)
- **Database**: [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) (free tier - 512MB)

See [DEPLOYMENT.md](./DEPLOYMENT.md) for complete deployment instructions.

## License

MIT

## Author

Full Stack Engineer Assignment - CausalFunnel