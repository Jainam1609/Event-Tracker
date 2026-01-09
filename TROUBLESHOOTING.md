# Troubleshooting Guide

## Events Not Showing in Dashboard

If you can open the demo page and click, but don't see events in the dashboard, follow these steps:

### 1. Check Backend is Running

```bash
# Check if backend is running on port 3001
curl http://localhost:3001/health

# Should return: {"status":"ok","message":"Analytics API is running"}
```

### 2. Check MongoDB is Running

```bash
# If using Docker
docker ps | grep mongodb

# Check if events are being stored
docker exec mongodb mongosh --quiet --eval "db.events.countDocuments()" analytics
```

### 3. Check Browser Console

1. Open the demo page: http://localhost:3000/demo
2. Open Developer Tools (F12 or Cmd+Option+I)
3. Go to the Console tab
4. Look for error messages (if debug mode is enabled)
5. Check Network tab for requests to `/api/events`

### 4. Check Network Tab

1. Open Developer Tools (F12)
2. Go to the Network tab
3. Click around on the demo page
4. Look for requests to `http://localhost:3001/api/events`
5. Check the status:
   - **200/201**: Success ✅
   - **400**: Bad request (check event data)
   - **500**: Server error (check backend logs)
   - **CORS error**: Backend CORS configuration issue

### 5. Check Backend Logs

Look at the terminal where you ran `npm run dev` in the backend folder. You should see:
- `📥 Received event request:` - Events are being received
- `✅ Event stored successfully:` - Events are being saved
- `❌ Error storing event:` - There's a database/validation error

### 6. Common Issues and Fixes

#### Issue: CORS Error

**Symptom**: Browser console shows "CORS policy" error

**Fix**: The backend CORS configuration has been updated to allow requests from common origins. If still having issues:
- Make sure backend is running
- Restart the backend server after CORS changes
- Check `backend/.env` has correct `CORS_ORIGIN` setting

#### Issue: Events Not Sending

**Symptom**: No network requests in browser Network tab

**Fix**: 
- Check if tracking script is loaded: Look for `Analytics tracking initialized` in console
- Make sure `analytics.js` is included in the demo page
- Check browser console for JavaScript errors

#### Issue: Events Sending but Not Stored

**Symptom**: See `✅ Analytics event sent successfully` but database is empty

**Fix**:
- Check backend logs for errors
- Verify MongoDB connection in backend logs
- Check MongoDB is running and accessible
- Test MongoDB connection: `docker exec mongodb mongosh --quiet --eval "db.runCommand({ ping: 1 })" analytics`

#### Issue: Demo Page Not Loading Tracking Script

**Symptom**: No console logs about analytics tracking

**Fix**:
- Make sure you're accessing the demo page at http://localhost:3000/demo
- Check that frontend server is running
- Verify `/analytics.js` is accessible: http://localhost:3000/analytics.js
- Check browser console for script loading errors
- Hard refresh: Cmd+Shift+R (Mac) or Ctrl+Shift+R (Windows)

### 7. Test Endpoints Manually

```bash
# Test backend health
curl http://localhost:3001/health

# Test storing an event
curl -X POST http://localhost:3001/api/events \
  -H "Content-Type: application/json" \
  -d '{
    "session_id": "test_session_123",
    "event_type": "click",
    "page_url": "http://localhost:8080",
    "click_x": 100,
    "click_y": 200
  }'

# Check if event was stored
curl http://localhost:3001/api/events/sessions

# Should show the test session
```

### 8. Reset and Start Fresh

If nothing works, try a fresh start:

```bash
# Stop all servers (Ctrl+C in terminals)

# Clear MongoDB data (if using Docker)
docker stop mongodb
docker rm mongodb
docker run -d -p 27017:27017 --name mongodb mongo:latest

# Restart backend
cd backend
npm run dev

# In another terminal, restart frontend
cd frontend
npm run dev

# Demo page is integrated - just navigate to http://localhost:3000/demo
```

### 9. Still Not Working?

1. Check all console errors (browser and backend)
2. Verify all three services are running (backend, frontend, MongoDB)
3. Check firewall/security settings
4. Try incognito/private browsing mode
5. Check if another application is using ports 3000, 3001, or 27017