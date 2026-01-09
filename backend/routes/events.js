const express = require('express');
const router = express.Router();
const Event = require('../models/Event');

/**
 * @swagger
 * /api/events:
 *   post:
 *     summary: Create a new event
 *     tags: [Events]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Event'
 *           examples:
 *             click:
 *               value:
 *                 session_id: "session_1704067200000_abc123xyz"
 *                 event_type: "click"
 *                 page_url: "https://example.com/page"
 *                 click_x: 150
 *                 click_y: 200
 *                 timestamp: "2024-01-01T12:00:00.000Z"
 *                 metadata: {}
 *             page_view:
 *               value:
 *                 session_id: "session_1704067200000_abc123xyz"
 *                 event_type: "page_view"
 *                 page_url: "https://example.com/page"
 *                 timestamp: "2024-01-01T12:00:00.000Z"
 *     responses:
 *       201:
 *         description: Event created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/EventResponse'
 *       400:
 *         description: Bad request - missing or invalid fields
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
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

/**
 * @swagger
 * /api/events/sessions:
 *   get:
 *     summary: Get all sessions with event counts
 *     tags: [Sessions]
 *     description: Returns a list of all sessions with aggregated event statistics
 *     responses:
 *       200:
 *         description: List of sessions
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SessionsResponse'
 *             example:
 *               sessions:
 *                 - session_id: "session_1704067200000_abc123xyz"
 *                   totalEvents: 42
 *                   firstSeen: "2024-01-01T12:00:00.000Z"
 *                   lastSeen: "2024-01-01T12:30:00.000Z"
 *                   uniquePages: 5
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
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

/**
 * @swagger
 * /api/events/sessions/{sessionId}:
 *   get:
 *     summary: Get all events for a specific session
 *     tags: [Sessions]
 *     description: Returns all events for a given session ID, ordered by timestamp
 *     parameters:
 *       - in: path
 *         name: sessionId
 *         required: true
 *         schema:
 *           type: string
 *         description: Session ID to retrieve events for
 *         example: session_1704067200000_abc123xyz
 *     responses:
 *       200:
 *         description: Session events retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SessionEventsResponse'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
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

/**
 * @swagger
 * /api/events/heatmap:
 *   get:
 *     summary: Get click data for heatmap visualization
 *     tags: [Heatmap]
 *     description: Returns all click events for a specific page URL, used for generating heatmaps
 *     parameters:
 *       - in: query
 *         name: page_url
 *         required: true
 *         schema:
 *           type: string
 *         description: URL of the page to get heatmap data for
 *         example: https://example.com/page
 *     responses:
 *       200:
 *         description: Heatmap data retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/HeatmapResponse'
 *       400:
 *         description: Bad request - page_url parameter is required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
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

/**
 * @swagger
 * /api/events/pages:
 *   get:
 *     summary: Get all unique page URLs
 *     tags: [Pages]
 *     description: Returns a list of all unique page URLs that have been tracked
 *     responses:
 *       200:
 *         description: List of unique page URLs
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PagesResponse'
 *             example:
 *               pages:
 *                 - "https://example.com/page1"
 *                 - "https://example.com/page2"
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/pages', async (req, res) => {
  try {
    const pages = await Event.distinct('page_url');
    res.json({ pages: pages.sort() });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch pages' });
  }
});

module.exports = router;