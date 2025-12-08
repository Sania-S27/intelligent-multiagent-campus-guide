import axios from 'axios';

// Create an Axios instance
const api = axios.create({
  baseURL: process.env.REACT_APP_API_BASE_URL || 'https://campus-guide-api.onrender.com',
});

// Add a request interceptor to include the auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// --- Auth API Calls ---
export const registerUser = (userData) => api.post('/auth/register', userData);
export const loginUser = (credentials) => api.post('/auth/login', credentials);

// --- Navigation API Calls ---
export const getLocations = () => api.get('/navigation/locations');
export const calculateRoute = (requestBody) => api.post('/navigation/calculate-route', requestBody);


// --- Events API Calls ---
export const getEvents = (query, category, sortBy = 'date') => api.get('/events', { // <-- Removed 'branch'
  params: { 
    search: query,
    category: category || null,
    sort_by: sortBy
    // VVV REMOVED 'branch' VVV
  } 
});

export const createEvent = (eventData) => api.post('/events', eventData);
export const registerForEvent = (eventId) => api.post(`/events/register/${eventId}`);
export const getEventRegistrations = () => api.get('/admin/event-registrations');

// --- FAQ API Calls ---
export const getFAQs = (query) => api.get('/faq', { params: { search: query } });
export const createFAQ = (faqData) => api.post('/faq', faqData);

// --- Support API Calls ---
export const postToSupportChat = (message) => api.post('/support/chat', { message: message });
// ... (other API calls) ...
export const getUserNotifications = () => api.get('/user/notifications');
export const markNotificationsRead = () => api.post('/user/notifications/mark-read');
// VVV ADD THIS NEW FUNCTION VVV
export const clearUserNotifications = () => api.post('/user/notifications/clear-all');
// --- Admin API Calls ---
export const getUnansweredQuestions = () => api.get('/admin/unanswered-questions');

export const adminClearAllNotifications = () => api.post('/admin/notifications/clear-all-history');
export default api;