const express = require('express');
const router = express.Router();
const Event = require('../models/Event');

router.post('/', async (req, res) => {
  try {
    const { session_id, event_type, page_url, timestamp, click_x, click_y, metadata } = req.body;

    if (!session_id || !event_type || !page_url) {
      return res.status(400).json({ error: 'Missing required fields: session_id, event_type, page_url' });
    }

    const validEventTypes = ['page_view', 'click', 'form_submit', 'input_change', 'input_focus', 'scroll', 'button_click', 'image_view'];
    if (!validEventTypes.includes(event_type)) {
      return res.status(400).json({ error: `Invalid event_type. Must be one of: ${validEventTypes.join(', ')}` });
    }

    if (['click', 'button_click'].includes(event_type) && (click_x === undefined || click_y === undefined)) {
      return res.status(400).json({ error: 'click_x and click_y are required for click and button_click events' });
    }

    const event = new Event({
      session_id,
      event_type,
      page_url,
      timestamp: timestamp ? new Date(timestamp) : new Date(),
      click_x,
      click_y,
      metadata: metadata || {}
    });

    await event.save();
    res.status(201).json({ success: true, event });
  } catch (error) {
    if (process.env.NODE_ENV !== 'production') {
      console.error('Error storing event:', error.message);
    }
    res.status(500).json({ error: 'Failed to store event', details: process.env.NODE_ENV !== 'production' ? error.message : undefined });
  }
});

router.get('/sessions', async (req, res) => {
  try {
    const sessions = await Event.aggregate([
      {
        $group: {
          _id: '$session_id',
          totalEvents: { $sum: 1 },
          firstSeen: { $min: '$timestamp' },
          lastSeen: { $max: '$timestamp' },
          pages: { $addToSet: '$page_url' }
        }
      },
      {
        $project: {
          session_id: '$_id',
          totalEvents: 1,
          firstSeen: 1,
          lastSeen: 1,
          uniquePages: { $size: '$pages' },
          _id: 0
        }
      },
      {
        $sort: { lastSeen: -1 }
      }
    ]);

    res.json({ sessions });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch sessions' });
  }
});

router.get('/sessions/:sessionId', async (req, res) => {
  try {
    const { sessionId } = req.params;
    const events = await Event.find({ session_id: sessionId })
      .sort({ timestamp: 1 })
      .select('-__v -createdAt -updatedAt');

    res.json({ session_id: sessionId, events });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch session events' });
  }
});

router.get('/heatmap', async (req, res) => {
  try {
    const { page_url } = req.query;

    if (!page_url) {
      return res.status(400).json({ error: 'page_url query parameter is required' });
    }

    const clicks = await Event.find({
      event_type: 'click',
      page_url: page_url
    })
      .select('click_x click_y timestamp session_id')
      .sort({ timestamp: -1 });

    res.json({ page_url, clicks });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch heatmap data' });
  }
});

router.get('/pages', async (req, res) => {
  try {
    const pages = await Event.distinct('page_url');
    res.json({ pages: pages.sort() });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch pages' });
  }
});

module.exports = router;