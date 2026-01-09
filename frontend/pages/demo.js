import { useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import Script from 'next/script';

export default function Demo() {
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
      window.ANALYTICS_API_ENDPOINT = `${apiUrl}/api/events`;
      window.ANALYTICS_DEBUG = process.env.NODE_ENV === 'development';
    }
  }, []);

  const showMessage = (msg) => {
    alert(msg);
  };

  const addCard = () => {
    const container = document.getElementById('cards-container');
    if (!container) return;
    const cardCount = container.children.length + 1;
    const card = document.createElement('div');
    card.className = 'demo-card';
    card.onclick = () => showMessage('Card ' + cardCount + ' clicked');
    card.innerHTML = `
      <h3>Card ${cardCount}</h3>
      <p>This card was added dynamically. Click anywhere on it to track events!</p>
    `;
    container.appendChild(card);
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    showMessage('Form submitted! Check the dashboard to see the click events.');
  };

  const resetForm = () => {
    const form = document.querySelector('form');
    if (form) {
      form.reset();
      showMessage('Form reset');
    }
  };

  const openModal = () => {
    const modal = document.getElementById('demo-modal');
    if (modal) modal.classList.add('active');
  };

  const closeModal = () => {
    const modal = document.getElementById('demo-modal');
    if (modal) modal.classList.remove('active');
  };


  useEffect(() => {
    const modal = document.getElementById('demo-modal');
    if (modal) {
      const handleClick = (e) => {
        if (e.target === modal) closeModal();
      };
      modal.addEventListener('click', handleClick);
      return () => modal.removeEventListener('click', handleClick);
    }
  }, []);

  return (
    <>
      <Head>
        <title>Analytics Demo - User Analytics Dashboard</title>
      </Head>
      
      <Script
        src="/analytics.js"
        strategy="afterInteractive"
        onLoad={() => {
          const updateSessionId = () => {
            if (window.AnalyticsTracker) {
              const sessionIdEl = document.getElementById('sessionId');
              if (sessionIdEl) {
                sessionIdEl.textContent = window.AnalyticsTracker.getSessionId();
              }
            } else {
              setTimeout(updateSessionId, 100);
            }
          };
          updateSessionId();
        }}
      />

      <div className="demo-page">
        <div className="header">
          <h1>Analytics Demo Page</h1>
          <p>This page demonstrates the analytics tracking script with various interactive elements. All clicks and page views are being tracked.</p>
        </div>

        <div className="container">
          <nav className="nav">
            <Link href="/">Sessions</Link>
            <Link href="/heatmap">Heatmap</Link>
            <Link href="/demo" className="active">Demo</Link>
          </nav>

          <div className="card info-box">
            <p><strong>Status:</strong> <span className="status active">Tracking Active</span></p>
            <p><strong>Session ID:</strong> <span id="sessionId">Loading...</span></p>
            <p><strong>API Endpoint:</strong> <code>{typeof window !== 'undefined' ? (window.ANALYTICS_API_ENDPOINT || '/api/events') : '/api/events'}</code></p>
            <p style={{ marginTop: '10px', fontSize: '0.9em', color: '#666' }}>
              <strong>Note:</strong> Sessions are shared across all dashboard pages via localStorage. 
              Events from this demo page will appear in the same session as dashboard navigation.
            </p>
          </div>

          <div className="card">
            <h2>Buttons and Actions</h2>
            <p>Click on any button to generate click events:</p>
            <div className="button-group">
              <button className="button" onClick={() => showMessage('Primary button clicked')}>Primary Button</button>
              <button className="button secondary" onClick={() => showMessage('Secondary button clicked')}>Secondary Button</button>
              <button className="button danger" onClick={() => showMessage('Danger button clicked')}>Danger Button</button>
              <button className="button" onClick={addCard}>Add Dynamic Card</button>
              <button className="button" onClick={() => window.location.reload()}>Reload Page</button>
              <button className="button" onClick={openModal}>Open Modal</button>
            </div>
          </div>

          <div className="card">
            <h2>Interactive Cards</h2>
            <div id="cards-container" className="cards-container">
              <div className="demo-card" onClick={() => showMessage('Card 1 clicked')}>
                <h3>Card 1</h3>
                <p>Click anywhere on this card to generate a click event with coordinates.</p>
              </div>
              <div className="demo-card" onClick={() => showMessage('Card 2 clicked')}>
                <h3>Card 2</h3>
                <p>Each click is tracked with its X and Y coordinates relative to the viewport.</p>
              </div>
              <div className="demo-card" onClick={() => showMessage('Card 3 clicked')}>
                <h3>Card 3</h3>
                <p>Navigate to different sections or reload the page to see page view events.</p>
              </div>
            </div>
          </div>

          <div className="card">
            <h2>Form Elements</h2>
            <p>Interact with form elements - all clicks are tracked:</p>
            <form onSubmit={handleFormSubmit} className="demo-form">
              <div className="form-group">
                <label htmlFor="name">Full Name:</label>
                <input type="text" id="name" name="name" placeholder="Enter your name" />
              </div>
              
              <div className="form-group">
                <label htmlFor="email">Email:</label>
                <input type="email" id="email" name="email" placeholder="Enter your email" />
              </div>
              
              <div className="form-group">
                <label htmlFor="country">Country:</label>
                <select id="country" name="country">
                  <option value="">Select a country</option>
                  <option value="us">United States</option>
                  <option value="uk">United Kingdom</option>
                  <option value="ca">Canada</option>
                  <option value="au">Australia</option>
                  <option value="in">India</option>
                </select>
              </div>
              
              <div className="form-group">
                <label>Interests:</label>
                <div className="checkbox-group">
                  <label><input type="checkbox" name="interest" value="tech" /> Technology</label>
                  <label><input type="checkbox" name="interest" value="sports" /> Sports</label>
                  <label><input type="checkbox" name="interest" value="music" /> Music</label>
                  <label><input type="checkbox" name="interest" value="travel" /> Travel</label>
                </div>
              </div>
              
              <div className="form-group">
                <label>Gender:</label>
                <div className="radio-group">
                  <label><input type="radio" name="gender" value="male" /> Male</label>
                  <label><input type="radio" name="gender" value="female" /> Female</label>
                  <label><input type="radio" name="gender" value="other" /> Other</label>
                </div>
              </div>
              
              <div className="form-group">
                <label htmlFor="message">Message:</label>
                <textarea id="message" name="message" placeholder="Enter your message" />
              </div>
              
              <div className="button-group">
                <button type="submit" className="button">Submit Form</button>
                <button type="button" className="button secondary" onClick={resetForm}>Reset</button>
              </div>
            </form>
          </div>

          <div className="card">
            <h2>Image Gallery</h2>
            <p>Images automatically trigger <strong>image_view</strong> events when they load. Click on any image to track click events:</p>
            <div className="image-container">
              <div className="image-item" onClick={() => showMessage('Image 1 clicked')}>
                <img src="https://images.pexels.com/photos/196667/pexels-photo-196667.jpeg?auto=compress&cs=tinysrgb&w=800" alt="Sample Image 1 - Desk workspace" />
                <div className="image-label">Image 1</div>
              </div>
              <div className="image-item" onClick={() => showMessage('Image 2 clicked')}>
                <img src="https://images.pexels.com/photos/196655/pexels-photo-196655.jpeg?auto=compress&cs=tinysrgb&w=800" alt="Sample Image 2 - City skyline" />
                <div className="image-label">Image 2</div>
              </div>
              <div className="image-item" onClick={() => showMessage('Image 3 clicked')}>
                <img src="https://images.pexels.com/photos/210186/pexels-photo-210186.jpeg?auto=compress&cs=tinysrgb&w=800" alt="Sample Image 3 - Mountain landscape" />
                <div className="image-label">Image 3</div>
              </div>
              <div className="image-item" onClick={() => showMessage('Image 4 clicked')}>
                <img src="https://images.pexels.com/photos/248797/pexels-photo-248797.jpeg?auto=compress&cs=tinysrgb&w=800" alt="Sample Image 4 - Forest road" />
                <div className="image-label">Image 4</div>
              </div>
            </div>
          </div>

          <div className="card">
            <h2>Event Types Being Tracked</h2>
            <p>This demo page tracks the following event types:</p>
            <ul className="event-types-list">
              <li><strong>page_view</strong> - Automatically tracked on page load and navigation</li>
              <li><strong>click</strong> - Tracked for all clicks on the page</li>
              <li><strong>button_click</strong> - Specifically tracked for button elements (with button metadata)</li>
              <li><strong>form_submit</strong> - Tracked when forms are submitted (submit the form above)</li>
              <li><strong>input_change</strong> - Tracked when input fields change value (type in form fields above)</li>
              <li><strong>input_focus</strong> - Tracked when inputs receive focus (click on form fields above)</li>
              <li><strong>scroll</strong> - Tracked when page is scrolled (scroll this page)</li>
              <li><strong>image_view</strong> - Tracked when images load (images in gallery above)</li>
            </ul>
            <div className="tip-box">
              <strong>Tip:</strong> Interact with different elements above to generate various event types. Then check the dashboard to see all tracked events with their metadata.
            </div>
          </div>
        </div>

        <div className="modal" id="demo-modal">
          <div className="modal-content">
            <h2>Sample Modal</h2>
            <p>This is a modal dialog. Click outside or the close button to dismiss.</p>
            <div className="button-group">
              <button className="button" onClick={closeModal}>Close</button>
              <button className="button secondary" onClick={() => showMessage('Modal action clicked')}>Action</button>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .demo-page {
          min-height: 100vh;
        }

        .info-box {
          background: #e6f3ff;
          border: 1px solid #b3d9ff;
        }

        .info-box p {
          margin: 8px 0;
          color: #004085;
        }

        .status {
          display: inline-block;
          padding: 4px 12px;
          border-radius: 12px;
          font-size: 0.9em;
          font-weight: 500;
          margin-left: 10px;
        }

        .status.active {
          background: #48bb78;
          color: white;
        }

        .button-group {
          display: flex;
          gap: 15px;
          flex-wrap: wrap;
          margin: 20px 0;
        }

        .button.danger {
          background: #f56565;
        }

        .button.danger:hover {
          background: #e53e3e;
        }

        .cards-container {
          display: grid;
          gap: 15px;
          margin: 20px 0;
        }

        .demo-card {
          background: #f8f9fa;
          border: 1px solid #e0e0e0;
          border-radius: 8px;
          padding: 20px;
          transition: all 0.3s ease;
          cursor: pointer;
        }

        .demo-card:hover {
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
          transform: translateY(-2px);
        }

        .demo-card h3 {
          color: #667eea;
          margin-bottom: 10px;
        }

        .demo-form {
          margin-top: 20px;
        }

        .form-group {
          margin-bottom: 20px;
        }

        .form-group label {
          display: block;
          margin-bottom: 8px;
          font-weight: 500;
          color: #333;
        }

        .form-group input[type="text"],
        .form-group input[type="email"],
        .form-group input[type="password"],
        .form-group input[type="number"],
        .form-group textarea,
        .form-group select {
          width: 100%;
          padding: 10px;
          border: 1px solid #ddd;
          border-radius: 6px;
          font-size: 14px;
          font-family: inherit;
        }

        .form-group textarea {
          resize: vertical;
          min-height: 100px;
        }

        .checkbox-group,
        .radio-group {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .checkbox-group label,
        .radio-group label {
          display: flex;
          align-items: center;
          font-weight: normal;
        }

        .checkbox-group input,
        .radio-group input {
          margin-right: 8px;
          cursor: pointer;
        }

        .image-container {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
          gap: 20px;
          margin: 20px 0;
        }

        .image-item {
          border-radius: 8px;
          overflow: hidden;
          cursor: pointer;
          transition: transform 0.3s ease;
          background: white;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }

        .image-item:hover {
          transform: scale(1.05);
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
        }

        .image-item img {
          width: 100%;
          height: 150px;
          object-fit: cover;
          display: block;
        }

        .image-label {
          padding: 10px;
          text-align: center;
          font-weight: 500;
        }

        .event-types-list {
          margin: 15px 0;
          padding-left: 30px;
          line-height: 2;
        }

        .tip-box {
          margin-top: 15px;
          padding: 15px;
          background: #fff3cd;
          border-left: 4px solid #ffc107;
          border-radius: 4px;
        }

        .modal {
          display: none;
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: rgba(0, 0, 0, 0.5);
          z-index: 1000;
          align-items: center;
          justify-content: center;
        }

        .modal.active {
          display: flex;
        }

        .modal-content {
          background: white;
          padding: 30px;
          border-radius: 8px;
          max-width: 500px;
          width: 90%;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
        }

        @media (max-width: 768px) {
          .button-group {
            flex-direction: column;
          }
          
          .button {
            width: 100%;
          }

          .image-container {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </>
  );
}