/**
 * KHUSHI OPTICS - API Client
 * Interacts with backend Express REST API (/api/...) with cookie-based auth
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

export const apiClient = {
  async request(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    const defaultHeaders = {
      'Content-Type': 'application/json'
    };

    const config = {
      ...options,
      credentials: 'include', // Ensures HTTP-only cookies are sent with every request
      headers: {
        ...defaultHeaders,
        ...options.headers
      }
    };

    try {
      if (window.Utils) window.Utils.showLoading(true);
      const response = await fetch(url, config);
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || `HTTP Error ${response.status}`);
      }
      return data;
    } catch (err) {
      console.warn(`[API Client] Endpoint ${endpoint} unreachable or error:`, err.message);
      throw err;
    } finally {
      if (window.Utils) window.Utils.showLoading(false);
    }
  },

  get(endpoint) { return this.request(endpoint, { method: 'GET' }); },
  post(endpoint, body) { return this.request(endpoint, { method: 'POST', body: JSON.stringify(body) }); },
  put(endpoint, body) { return this.request(endpoint, { method: 'PUT', body: JSON.stringify(body) }); },
  delete(endpoint) { return this.request(endpoint, { method: 'DELETE' }); }
};
