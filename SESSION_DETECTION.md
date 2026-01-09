# Session Detection in Integrated Demo Page

## How Session Detection Works

Since the demo page is now integrated into the dashboard (at `/demo` route), session detection works seamlessly across the entire application.

### Session Storage Mechanism

The tracking script uses **localStorage** to store session information:

```javascript
// Session data stored in browser's localStorage
localStorage.setItem('analytics_session_id', 'session_1234567890_abc123');
localStorage.setItem('analytics_session_id_timestamp', '1234567890');
```

### Key Points:

1. **Same-Origin Storage**: 
   - Since the demo page is at `http://localhost:3000/demo` and the dashboard is at `http://localhost:3000`
   - Both share the same origin, so they share the same localStorage
   - Session ID is accessible across all pages in the dashboard

2. **Session Persistence**:
   - Session ID persists across page navigations within the dashboard
   - If you navigate from `/` to `/demo` to `/heatmap`, the same session ID is used
   - Session expires after 30 minutes of inactivity

3. **Session Generation**:
   - When you first visit any page with the tracking script, a new session ID is generated
   - Format: `session_{timestamp}_{randomString}`
   - Example: `session_1704729600000_k3j9x2m8p`

4. **Session Expiration**:
   - Sessions expire after 30 minutes of inactivity
   - If you return after 30 minutes, a new session is created
   - The timestamp is checked on each page load

### Flow Diagram:

```
User visits http://localhost:3000/demo
    │
    ▼
Tracking script loads (analytics.js)
    │
    ▼
Check localStorage for existing session
    │
    ├─► Session exists and valid (< 30 min old)?
    │   └─► Use existing session ID
    │
    └─► No session or expired?
        └─► Generate new session ID
            └─► Store in localStorage
                └─► Use new session ID
    │
    ▼
All events tracked with this session ID
    │
    ▼
Navigate to / (Sessions page)
    │
    ▼
Same session ID from localStorage
    │
    ▼
All events from demo page appear in same session
```

### Benefits of Integration:

1. **No CORS Issues**: Same origin means no cross-origin restrictions
2. **Shared Sessions**: Events from demo page appear in the same session as dashboard navigation
3. **Seamless Experience**: Users can test tracking and immediately see results
4. **Simplified Setup**: No need to run separate server for demo page

### Testing Session Detection:

1. Open dashboard: `http://localhost:3000`
2. Navigate to Demo page: Click "Demo" in navigation
3. Check browser console: `localStorage.getItem('analytics_session_id')`
4. Interact with demo page elements
5. Navigate back to Sessions page
6. Click "Refresh" - you should see your session with all events

### Session ID Display:

The demo page displays the current session ID in the info box. This helps verify:
- That the tracking script is loaded
- What session ID is being used
- That the session persists across page navigations

### Important Notes:

- **localStorage is domain-specific**: Sessions are isolated per domain
- **Private/Incognito mode**: Each private window has its own localStorage
- **Browser-specific**: Sessions don't persist across different browsers
- **Clear data**: Clearing browser data will reset sessions