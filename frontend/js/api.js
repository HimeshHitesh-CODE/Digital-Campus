/**
 * Digital Campus Central API Client
 * Wraps native fetch with JWT authorization headers, base URL resolution, and unified error handling.
 */

const API_BASE_URL = window.location.origin.includes('localhost') || window.location.origin.includes('127.0.0.1')
  ? `${window.location.origin}/api/v1`
  : '/api/v1';

class ApiClient {
  constructor(baseUrl) {
    this.baseUrl = baseUrl;
  }

  getToken() {
    return localStorage.getItem('auth_token') || localStorage.getItem('dc_auth_token');
  }

  setToken(token) {
    if (!token) return;
    localStorage.setItem('auth_token', token);
    localStorage.setItem('dc_auth_token', token);
  }

  getUser() {
    const rawUser = localStorage.getItem('dc_user');
    if (rawUser) {
      try {
        return JSON.parse(rawUser);
      } catch (e) {
        console.warn('Failed to parse stored dc_user:', e);
      }
    }

    const role = localStorage.getItem('user_role');
    const name = localStorage.getItem('user_name');
    const pin = localStorage.getItem('student_pin');

    if (role && (name || pin)) {
      return {
        role,
        name: name || 'Student User',
        sbtetPin: pin || '',
        rollNumber: pin || '',
      };
    }

    return null;
  }

  setUser(user) {
    if (!user) return;
    localStorage.setItem('dc_user', JSON.stringify(user));
    if (user.role) localStorage.setItem('user_role', user.role);
    if (user.name) localStorage.setItem('user_name', user.name);
    if (user.sbtetPin || user.rollNumber) {
      localStorage.setItem('student_pin', user.sbtetPin || user.rollNumber);
    }
    localStorage.setItem('session_start', Date.now().toString());
  }

  clearAuth() {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('dc_auth_token');
    localStorage.removeItem('user_role');
    localStorage.removeItem('student_pin');
    localStorage.removeItem('user_name');
    localStorage.removeItem('dc_user');
    localStorage.removeItem('session_start');
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseUrl}${endpoint}`;
    const token = this.getToken();

    const headers = {
      'Content-Type': 'application/json',
      ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
      ...options.headers,
    };

    const config = {
      ...options,
      headers,
    };

    if (config.body && typeof config.body === 'object' && !(config.body instanceof FormData)) {
      config.body = JSON.stringify(config.body);
    }

    try {
      const response = await fetch(url, config);

      if (response.status === 401) {
        // Do not aggressively clear or force redirect on optional data fetches to prevent infinite loops
        const data = await response.json().catch(() => ({}));
        const error = new Error(data.message || 'Unauthorized');
        error.status = 401;
        error.data = data;
        throw error;
      }

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        const error = new Error(data.message || `Request failed with status ${response.status}`);
        error.status = response.status;
        error.data = data;
        throw error;
      }

      return data;
    } catch (error) {
      console.warn(`[API Info] ${endpoint}:`, error.message || error);
      throw error;
    }
  }

  get(endpoint, params = {}) {
    const query = new URLSearchParams(params).toString();
    return this.request(query ? `${endpoint}?${query}` : endpoint, { method: 'GET' });
  }

  post(endpoint, body) {
    return this.request(endpoint, { method: 'POST', body });
  }

  put(endpoint, body) {
    return this.request(endpoint, { method: 'PUT', body });
  }

  patch(endpoint, body) {
    return this.request(endpoint, { method: 'PATCH', body });
  }

  delete(endpoint) {
    return this.request(endpoint, { method: 'DELETE' });
  }
}

export const api = new ApiClient(API_BASE_URL);
