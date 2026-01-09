const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'User Analytics API',
      version: '1.0.0',
      description: 'RESTful API for tracking and analyzing user interactions and events',
      contact: {
        name: 'API Support',
      },
      license: {
        name: 'MIT',
      },
    },
    servers: [
      {
        url: process.env.API_URL || 'http://localhost:3001',
        description: 'Development server',
      },
      {
        url: 'https://event-tracker-dftf.onrender.com',
        description: 'Production server',
      },
    ],
    components: {
      schemas: {
        Event: {
          type: 'object',
          required: ['session_id', 'event_type', 'page_url'],
          properties: {
            session_id: {
              type: 'string',
              description: 'Unique session identifier',
              example: 'session_1704067200000_abc123xyz',
            },
            event_type: {
              type: 'string',
              enum: ['page_view', 'click', 'form_submit', 'input_change', 'input_focus', 'scroll', 'button_click', 'image_view'],
              description: 'Type of event',
              example: 'click',
            },
            page_url: {
              type: 'string',
              description: 'URL of the page where the event occurred',
              example: 'https://example.com/page',
            },
            timestamp: {
              type: 'string',
              format: 'date-time',
              description: 'Event timestamp (ISO 8601)',
              example: '2024-01-01T12:00:00.000Z',
            },
            click_x: {
              type: 'number',
              description: 'X coordinate of click (required for click and button_click events)',
              example: 150,
            },
            click_y: {
              type: 'number',
              description: 'Y coordinate of click (required for click and button_click events)',
              example: 200,
            },
            metadata: {
              type: 'object',
              description: 'Additional event-specific metadata',
              example: { button_text: 'Submit', form_id: 'contact-form' },
            },
          },
        },
        EventResponse: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: true,
            },
            event: {
              $ref: '#/components/schemas/Event',
            },
          },
        },
        Session: {
          type: 'object',
          properties: {
            session_id: {
              type: 'string',
              example: 'session_1704067200000_abc123xyz',
            },
            totalEvents: {
              type: 'number',
              description: 'Total number of events in this session',
              example: 42,
            },
            firstSeen: {
              type: 'string',
              format: 'date-time',
              description: 'Timestamp of first event in session',
              example: '2024-01-01T12:00:00.000Z',
            },
            lastSeen: {
              type: 'string',
              format: 'date-time',
              description: 'Timestamp of last event in session',
              example: '2024-01-01T12:30:00.000Z',
            },
            uniquePages: {
              type: 'number',
              description: 'Number of unique pages visited in this session',
              example: 5,
            },
          },
        },
        SessionsResponse: {
          type: 'object',
          properties: {
            sessions: {
              type: 'array',
              items: {
                $ref: '#/components/schemas/Session',
              },
            },
          },
        },
        SessionEventsResponse: {
          type: 'object',
          properties: {
            session_id: {
              type: 'string',
              example: 'session_1704067200000_abc123xyz',
            },
            events: {
              type: 'array',
              items: {
                $ref: '#/components/schemas/Event',
              },
            },
          },
        },
        HeatmapResponse: {
          type: 'object',
          properties: {
            page_url: {
              type: 'string',
              example: 'https://example.com/page',
            },
            clicks: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  click_x: {
                    type: 'number',
                    example: 150,
                  },
                  click_y: {
                    type: 'number',
                    example: 200,
                  },
                  timestamp: {
                    type: 'string',
                    format: 'date-time',
                    example: '2024-01-01T12:00:00.000Z',
                  },
                  session_id: {
                    type: 'string',
                    example: 'session_1704067200000_abc123xyz',
                  },
                },
              },
            },
          },
        },
        PagesResponse: {
          type: 'object',
          properties: {
            pages: {
              type: 'array',
              items: {
                type: 'string',
              },
              example: ['https://example.com/page1', 'https://example.com/page2'],
            },
          },
        },
        Error: {
          type: 'object',
          properties: {
            error: {
              type: 'string',
              example: 'Error message',
            },
            details: {
              type: 'string',
              description: 'Additional error details (only in development)',
            },
          },
        },
      },
    },
  },
  apis: ['./routes/*.js', './server.js'],
};

const swaggerSpec = swaggerJsdoc(options);

module.exports = swaggerSpec;