/**
 * User Analytics Tracking Script
 * Tracks page views, clicks, and various user interactions
 */

(function() {
  'use strict';

  const API_ENDPOINT = window.ANALYTICS_API_ENDPOINT || 'http://localhost:3001/api/events';
  
  const SESSION_KEY = 'analytics_session_id';
  const SESSION_DURATION = 30 * 60 * 1000; // 30 minutes

  /**
   * Get or create session ID
   */
  function getSessionId() {
    let sessionId = localStorage.getItem(SESSION_KEY);
    const sessionTimestamp = localStorage.getItem(SESSION_KEY + '_timestamp');
    
    const now = Date.now();
    
    if (sessionId && sessionTimestamp) {
      const sessionAge = now - parseInt(sessionTimestamp);
      if (sessionAge < SESSION_DURATION) {
        return sessionId;
      }
    }
    
    sessionId = 'session_' + now + '_' + Math.random().toString(36).substr(2, 9);
    localStorage.setItem(SESSION_KEY, sessionId);
    localStorage.setItem(SESSION_KEY + '_timestamp', now.toString());
    
    return sessionId;
  }

  /**
   * Send event to backend
   */
  function sendEvent(eventData) {
    fetch(API_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(eventData),
      keepalive: true
    })
    .then(response => {
      if (!response.ok) {
        return response.text().then(text => {
          throw new Error('HTTP error! status: ' + response.status + ', body: ' + text);
        });
      }
      return response.json();
    })
    .catch(error => {
      if (window.ANALYTICS_DEBUG) {
        console.error('Failed to send event:', eventData.event_type, error);
      }
      if (navigator.sendBeacon) {
        const blob = new Blob([JSON.stringify(eventData)], { type: 'application/json' });
        navigator.sendBeacon(API_ENDPOINT, blob);
      }
    });
  }

  /**
   * Generic event tracking function
   */
  function trackEvent(eventType, options = {}) {
    const eventData = {
      session_id: getSessionId(),
      event_type: eventType,
      page_url: window.location.href,
      timestamp: new Date().toISOString(),
      ...options
    };
    
    sendEvent(eventData);
  }

  /**
   * Track page view
   */
  function trackPageView() {
    trackEvent('page_view');
  }

  /**
   * Track click event
   */
  function trackClick(event) {
    trackEvent('click', {
      click_x: event.clientX,
      click_y: event.clientY
    });
  }

  /**
   * Track form submission
   */
  function trackFormSubmit(event) {
    const form = event.target;
    const formId = form.id || form.name || 'unnamed';
    const formFields = Array.from(form.elements).filter(el => el.name).map(el => el.name);
    
    trackEvent('form_submit', {
      metadata: {
        form_id: formId,
        form_action: form.action || '',
        field_count: formFields.length,
        fields: formFields
      }
    });
  }

  /**
   * Track input changes
   */
  function trackInputChange(event) {
    const input = event.target;
    trackEvent('input_change', {
      metadata: {
        input_type: input.type || 'text',
        input_name: input.name || '',
        input_id: input.id || '',
        value_length: (input.value || '').length
      }
    });
  }

  /**
   * Track input focus
   */
  function trackInputFocus(event) {
    const input = event.target;
    trackEvent('input_focus', {
      metadata: {
        input_type: input.type || 'text',
        input_name: input.name || '',
        input_id: input.id || ''
      }
    });
  }

  /**
   * Track scroll events (throttled)
   */
  let scrollTimeout;
  function trackScroll() {
    clearTimeout(scrollTimeout);
    scrollTimeout = setTimeout(() => {
      trackEvent('scroll', {
        metadata: {
          scroll_y: window.scrollY,
          scroll_x: window.scrollX,
          window_height: window.innerHeight,
          document_height: document.documentElement.scrollHeight,
          scroll_percentage: Math.round((window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100)
        }
      });
    }, 500);
  }

  /**
   * Track button clicks specifically
   */
  function trackButtonClick(event) {
    const button = event.target;
    trackEvent('button_click', {
      click_x: event.clientX,
      click_y: event.clientY,
      metadata: {
        button_text: button.textContent?.trim() || '',
        button_id: button.id || '',
        button_class: button.className || ''
      }
    });
  }

  /**
   * Track image views
   */
  function trackImageView(event) {
    const img = event.target;
    trackEvent('image_view', {
      metadata: {
        image_src: img.src || '',
        image_alt: img.alt || '',
        image_id: img.id || '',
        image_width: img.naturalWidth || 0,
        image_height: img.naturalHeight || 0
      }
    });
  }

  /**
   * Initialize tracking
   */
  function init() {
    if (document.readyState === 'complete' || document.readyState === 'interactive') {
      setTimeout(trackPageView, 0);
    } else {
      window.addEventListener('load', trackPageView);
    }

    // Track clicks on the entire document
    document.addEventListener('click', trackClick, true);

    // Track form submissions
    document.addEventListener('submit', trackFormSubmit, true);

    // Track input changes (with debounce)
    let changeTimeout;
    document.addEventListener('change', function(event) {
      if (event.target.tagName === 'INPUT' || event.target.tagName === 'TEXTAREA' || event.target.tagName === 'SELECT') {
        clearTimeout(changeTimeout);
        changeTimeout = setTimeout(() => trackInputChange(event), 300);
      }
    }, true);

    // Also track input events for real-time tracking
    let inputTimeout;
    document.addEventListener('input', function(event) {
      if (event.target.tagName === 'INPUT' || event.target.tagName === 'TEXTAREA') {
        clearTimeout(inputTimeout);
        inputTimeout = setTimeout(() => trackInputChange(event), 500);
      }
    }, true);

    // Track input focus (use focusin as focus doesn't bubble)
    document.addEventListener('focusin', function(event) {
      if (event.target.tagName === 'INPUT' || event.target.tagName === 'TEXTAREA' || event.target.tagName === 'SELECT') {
        trackInputFocus(event);
      }
    }, true);

    // Track scroll events
    window.addEventListener('scroll', trackScroll, { passive: true });

    // Track button clicks specifically
    document.addEventListener('click', function(event) {
      if (event.target.tagName === 'BUTTON' || event.target.closest('button')) {
        trackButtonClick(event);
      }
    }, true);

    // Track image loads - function to check and track images
    function trackImagesOnLoad() {
      const images = document.querySelectorAll('img');
      images.forEach(img => {
        // Skip if already tracked
        if (img.dataset.tracked === 'true') return;
        
        if (img.complete && img.naturalHeight !== 0) {
          // Image already loaded
          trackImageView({ target: img });
          img.dataset.tracked = 'true';
        } else {
          // Wait for image to load
          img.addEventListener('load', function(event) {
            trackImageView(event);
            img.dataset.tracked = 'true';
          }, { once: true });
          
          // Also handle error case
          img.addEventListener('error', function() {
            img.dataset.tracked = 'true';
          }, { once: true });
        }
      });
    }

    // Track images on initial load
    if (document.readyState === 'complete' || document.readyState === 'interactive') {
      setTimeout(trackImagesOnLoad, 100);
    } else {
      window.addEventListener('load', function() {
        setTimeout(trackImagesOnLoad, 100);
      });
    }

    // Also track dynamically added images
    const imageObserver = new MutationObserver(function(mutations) {
      mutations.forEach(function(mutation) {
        mutation.addedNodes.forEach(function(node) {
          if (node.nodeType === 1) {
            if (node.tagName === 'IMG') {
              setTimeout(() => trackImagesOnLoad(), 100);
            }
            // Check for images within added nodes
            const newImages = node.querySelectorAll && node.querySelectorAll('img');
            if (newImages && newImages.length > 0) {
              setTimeout(() => trackImagesOnLoad(), 100);
            }
          }
        });
      });
    });

    imageObserver.observe(document.body, {
      childList: true,
      subtree: true
    });

    // Track page views on navigation (for SPAs)
    let lastUrl = location.href;
    new MutationObserver(() => {
      const url = location.href;
      if (url !== lastUrl) {
        lastUrl = url;
        trackPageView();
      }
    }).observe(document, { subtree: true, childList: true });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  window.AnalyticsTracker = {
    trackPageView: trackPageView,
    trackClick: trackClick,
    trackFormSubmit: trackFormSubmit,
    trackInputChange: trackInputChange,
    trackInputFocus: trackInputFocus,
    trackScroll: trackScroll,
    trackButtonClick: trackButtonClick,
    trackImageView: trackImageView,
    trackEvent: trackEvent,
    getSessionId: getSessionId
  };

})();