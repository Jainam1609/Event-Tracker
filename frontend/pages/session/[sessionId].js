import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { eventsAPI } from '../../lib/api';

export default function SessionDetail() {
  const router = useRouter();
  const { sessionId } = router.query;
  const [sessionData, setSessionData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (sessionId) {
      loadSessionEvents();
    }
  }, [sessionId]);

  const loadSessionEvents = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await eventsAPI.getSessionEvents(sessionId);
      setSessionData(data);
    } catch (err) {
      setError('Failed to load session events.');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  const getEventTypeColor = (eventType) => {
    return eventType === 'page_view' ? 'info' : 'success';
  };

  return (
    <div>
      <div className="header">
        <h1>User Journey</h1>
        <p>Detailed view of events for session: <code style={{ background: 'rgba(255,255,255,0.2)', padding: '2px 8px', borderRadius: '4px' }}>{sessionId}</code></p>
      </div>

      <div className="container">
        <nav className="nav">
          <Link href="/">Sessions</Link>
          <Link href="/heatmap">Heatmap</Link>
          <Link href="/demo">Demo</Link>
        </nav>

        {error && <div className="error">{error}</div>}

        {loading ? (
          <div className="loading">Loading session events...</div>
        ) : !sessionData ? (
          <div className="loading">No session data found.</div>
        ) : (
          <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2>Event Timeline</h2>
              <button className="button" onClick={loadSessionEvents}>
                Refresh
              </button>
            </div>

            <div style={{ marginBottom: '20px' }}>
              <p><strong>Total Events:</strong> {sessionData.events?.length || 0}</p>
              <p><strong>Session ID:</strong> <code>{sessionData.session_id}</code></p>
            </div>

            {sessionData.events && sessionData.events.length === 0 ? (
              <div className="loading">No events found for this session.</div>
            ) : (
              <div style={{ position: 'relative' }}>
                {sessionData.events?.map((event, index) => (
                  <div
                    key={index}
                    style={{
                      display: 'flex',
                      padding: '20px',
                      marginBottom: '16px',
                      background: 'linear-gradient(135deg, #f7fafc 0%, #ffffff 100%)',
                      borderRadius: '12px',
                      borderLeft: '4px solid',
                      borderLeftColor: event.event_type === 'page_view' ? '#667eea' : '#48bb78',
                      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
                      transition: 'all 0.3s ease',
                      position: 'relative',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'translateX(4px)';
                      e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.12)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'translateX(0)';
                      e.currentTarget.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.08)';
                    }}
                  >
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                        <span className={`badge ${getEventTypeColor(event.event_type)}`}>
                          {event.event_type}
                        </span>
                        <span style={{ color: '#666', fontSize: '0.9em' }}>
                          {formatDate(event.timestamp)}
                        </span>
                      </div>
                      <div style={{ marginBottom: '5px' }}>
                        <strong>Page URL:</strong> <code style={{ fontSize: '0.9em', wordBreak: 'break-all' }}>{event.page_url}</code>
                      </div>
                      {['click', 'button_click'].includes(event.event_type) && (
                        <div style={{ color: '#666', fontSize: '0.9em', marginBottom: '5px' }}>
                          <strong>Click Position:</strong> X: {event.click_x}, Y: {event.click_y}
                        </div>
                      )}
                      {event.metadata && Object.keys(event.metadata).length > 0 && (
                        <div style={{ 
                          color: '#4a5568', 
                          fontSize: '0.9em', 
                          marginTop: '12px', 
                          padding: '12px', 
                          background: 'linear-gradient(135deg, #edf2f7 0%, #e2e8f0 100%)', 
                          borderRadius: '8px',
                          border: '1px solid #cbd5e0'
                        }}>
                          <strong style={{ color: '#2d3748', display: 'block', marginBottom: '8px' }}>Metadata:</strong>
                          <pre style={{ 
                            margin: 0, 
                            fontSize: '0.85em', 
                            overflow: 'auto',
                            background: 'white',
                            padding: '10px',
                            borderRadius: '4px',
                            border: '1px solid #e2e8f0',
                            color: '#2d3748',
                            fontFamily: 'Monaco, "Courier New", monospace'
                          }}>
                            {JSON.stringify(event.metadata, null, 2)}
                          </pre>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}