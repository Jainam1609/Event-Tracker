import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { eventsAPI } from '../lib/api';

export default function Home() {
  const router = useRouter();
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadSessions();
  }, []);

  const loadSessions = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await eventsAPI.getSessions();
      setSessions(data);
    } catch (err) {
      setError('Failed to load sessions. Make sure the backend is running.');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  const handleSessionClick = (sessionId) => {
    router.push(`/session/${sessionId}`);
  };

  return (
    <div>
      <div className="header">
        <h1>User Analytics Dashboard</h1>
        <p>Track and analyze user interactions and sessions</p>
      </div>

      <div className="container">
        <nav className="nav">
          <Link href="/" className="active">Sessions</Link>
          <Link href="/heatmap">Heatmap</Link>
          <Link href="/demo">Demo</Link>
        </nav>

        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '15px' }}>
            <h2>Sessions Overview</h2>
            <button className="button" onClick={loadSessions}>
              Refresh
            </button>
          </div>

          {error && <div className="error">{error}</div>}

          {loading ? (
            <div className="loading">Loading sessions...</div>
          ) : sessions.length === 0 ? (
            <div className="loading">
              No sessions found. Make sure the tracking script is active and events are being sent to the backend.
            </div>
          ) : (
            <table className="table">
              <thead>
                <tr>
                  <th>Session ID</th>
                  <th>Total Events</th>
                  <th>Unique Pages</th>
                  <th>First Seen</th>
                  <th>Last Seen</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {sessions.map((session) => (
                  <tr key={session.session_id}>
                    <td>
                      <code style={{ fontSize: '0.9em' }}>{session.session_id}</code>
                    </td>
                    <td>
                      <span className="badge primary">{session.totalEvents}</span>
                    </td>
                    <td>
                      <span className="badge info">{session.uniquePages}</span>
                    </td>
                    <td>{formatDate(session.firstSeen)}</td>
                    <td>{formatDate(session.lastSeen)}</td>
                    <td>
                      <button
                        className="button secondary"
                        onClick={() => handleSessionClick(session.session_id)}
                      >
                        View Journey
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}