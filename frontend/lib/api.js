import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL 
  ? `${process.env.NEXT_PUBLIC_API_URL}/api`
  : '/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

export const eventsAPI = {
  // Get all sessions with event counts
  getSessions: async () => {
    const response = await api.get('/events/sessions');
    return response.data.sessions;
  },

  // Get all events for a specific session
  getSessionEvents: async (sessionId) => {
    const response = await api.get(`/events/sessions/${sessionId}`);
    return response.data;
  },

  // Get click data for heatmap
  getHeatmapData: async (pageUrl) => {
    const response = await api.get('/events/heatmap', {
      params: { page_url: pageUrl }
    });
    return response.data;
  },

  // Get all unique page URLs
  getPages: async () => {
    const response = await api.get('/events/pages');
    return response.data.pages;
  },
};

export default api;