import { useState, useEffect } from 'react';
import Link from 'next/link';
import { eventsAPI } from '../lib/api';

export default function Heatmap() {
  const [pages, setPages] = useState([]);
  const [selectedPage, setSelectedPage] = useState('');
  const [heatmapData, setHeatmapData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [viewportSize, setViewportSize] = useState({ width: 1200, height: 800 });

  useEffect(() => {
    loadPages();
  }, []);

  useEffect(() => {
    if (selectedPage) {
      loadHeatmapData();
    }
  }, [selectedPage]);

  const loadPages = async () => {
    try {
      const data = await eventsAPI.getPages();
      setPages(data);
      if (data.length > 0 && !selectedPage) {
        setSelectedPage(data[0]);
      }
    } catch (err) {
      setError('Failed to load pages.');
    }
  };

  const loadHeatmapData = async () => {
    if (!selectedPage) return;

    try {
      setLoading(true);
      setError(null);
      const data = await eventsAPI.getHeatmapData(selectedPage);
      setHeatmapData(data);

      if (data.clicks && data.clicks.length > 0) {
        const maxX = Math.max(...data.clicks.map(c => c.click_x));
        const maxY = Math.max(...data.clicks.map(c => c.click_y));
        setViewportSize({
          width: Math.max(1200, maxX + 100),
          height: Math.max(800, maxY + 100),
        });
      }
    } catch (err) {
      setError('Failed to load heatmap data.');
    } finally {
      setLoading(false);
    }
  };

  const handleDotClick = (click) => {
    alert(`Click at (${click.click_x}, ${click.click_y})\nTime: ${new Date(click.timestamp).toLocaleString()}\nSession: ${click.session_id}`);
  };

  return (
    <div>
      <div className="header">
        <h1>Click Heatmap</h1>
        <p>Visualize click positions on pages</p>
      </div>

      <div className="container">
        <nav className="nav">
          <Link href="/">Sessions</Link>
          <Link href="/heatmap" className="active">Heatmap</Link>
          <Link href="/demo">Demo</Link>
        </nav>

        <div className="card">
          <h2>Select Page</h2>
          <select
            className="select"
            value={selectedPage}
            onChange={(e) => setSelectedPage(e.target.value)}
            style={{ maxWidth: '600px' }}
          >
            <option value="">-- Select a page --</option>
            {pages.map((page) => (
              <option key={page} value={page}>
                {page}
              </option>
            ))}
          </select>

          {error && <div className="error">{error}</div>}

          {loading ? (
            <div className="loading">Loading heatmap data...</div>
          ) : selectedPage && heatmapData ? (
            <div style={{ marginTop: '30px' }}>
              <div style={{ marginBottom: '20px' }}>
                <p><strong>Page URL:</strong> <code style={{ wordBreak: 'break-all' }}>{selectedPage}</code></p>
                <p><strong>Total Clicks:</strong> {heatmapData.clicks?.length || 0}</p>
                <button className="button" onClick={loadHeatmapData} style={{ marginTop: '10px' }}>
                  Refresh
                </button>
              </div>

              {heatmapData.clicks && heatmapData.clicks.length > 0 ? (
                <div>
                  <p style={{ marginBottom: '10px', color: '#666' }}>
                    Click on any dot to see details. Dots represent click positions.
                  </p>
                  <div
                    style={{
                      position: 'relative',
                      width: '100%',
                      maxWidth: `${viewportSize.width}px`,
                      height: `${Math.min(viewportSize.height, 800)}px`,
                      border: '2px solid #e2e8f0',
                      borderRadius: '8px',
                      background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
                      overflow: 'auto',
                      margin: '0 auto',
                      boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                    }}
                  >
                    {heatmapData.clicks.map((click, index) => (
                      <div
                        key={index}
                        onClick={() => handleDotClick(click)}
                        style={{
                          position: 'absolute',
                          left: `${click.click_x}px`,
                          top: `${click.click_y}px`,
                          width: '12px',
                          height: '12px',
                          background: '#f56565',
                          borderRadius: '50%',
                          cursor: 'pointer',
                          transform: 'translate(-50%, -50%)',
                          boxShadow: '0 2px 4px rgba(245, 101, 101, 0.5)',
                          transition: 'all 0.2s ease',
                          border: '2px solid white',
                        }}
                        onMouseEnter={(e) => {
                          e.target.style.width = '16px';
                          e.target.style.height = '16px';
                          e.target.style.background = '#e53e3e';
                          e.target.style.zIndex = '1000';
                        }}
                        onMouseLeave={(e) => {
                          e.target.style.width = '12px';
                          e.target.style.height = '12px';
                          e.target.style.background = '#f56565';
                          e.target.style.zIndex = '1';
                        }}
                        title={`X: ${click.click_x}, Y: ${click.click_y}`}
                      />
                    ))}
                    <div
                      style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        backgroundImage: `
                          linear-gradient(to right, rgba(0,0,0,0.05) 1px, transparent 1px),
                          linear-gradient(to bottom, rgba(0,0,0,0.05) 1px, transparent 1px)
                        `,
                        backgroundSize: '50px 50px',
                        pointerEvents: 'none',
                      }}
                    />
                  </div>
                </div>
              ) : (
                <div className="loading">
                  No click data found for this page. Try clicking on the demo page while tracking is active.
                </div>
              )}
            </div>
          ) : (
            !loading && (
              <div className="loading">
                Select a page to view the heatmap, or ensure events are being tracked.
              </div>
            )
          )}
        </div>
      </div>
    </div>
  );
}