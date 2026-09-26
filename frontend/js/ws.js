/**
 * Central Real-Time WebSocket Client for Campus Connect
 * Handles auto-reconnect, heartbeat keep-alive, online presence caching, and typed event dispatching.
 */

class WebSocketClient {
  constructor() {
    this.ws = null;
    this.pin = '';
    this.name = '';
    this.listeners = new Map(); // eventType -> Set of callbacks
    this.onlinePins = new Set();
    this.isConnected = false;
    this.reconnectTimeout = null;
    this.heartbeatTimer = null;
    this.reconnectAttempts = 0;
  }

  connect(pin, name = '') {
    if (!pin) {
      const storedUser = localStorage.getItem('dc_user');
      if (storedUser) {
        try {
          const u = JSON.parse(storedUser);
          pin = u.sbtetPin || u.rollNumber || u.pin;
          name = u.name || '';
        } catch (e) {}
      }
      if (!pin) pin = localStorage.getItem('student_pin') || '24259-CS-025';
    }

    this.pin = (pin || '').trim().toUpperCase();
    this.name = name || localStorage.getItem('user_name') || this.pin;

    if (this.ws && (this.ws.readyState === WebSocket.OPEN || this.ws.readyState === WebSocket.CONNECTING)) {
      return;
    }

    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const host = window.location.host || '127.0.0.1:8000';
    const wsUrl = `${protocol}//${host}/ws?pin=${encodeURIComponent(this.pin)}&name=${encodeURIComponent(this.name)}`;

    try {
      this.ws = new WebSocket(wsUrl);

      this.ws.onopen = () => {
        this.isConnected = true;
        this.reconnectAttempts = 0;
        this._startHeartbeat();
        this._emit('CONNECTED', { pin: this.pin });
      };

      this.ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          const type = data.type;

          // Cache online presence
          if (type === 'CONNECTION_ESTABLISHED' && Array.isArray(data.online_pins)) {
            this.onlinePins = new Set(data.online_pins.map(p => p.toUpperCase()));
          } else if (type === 'PRESENCE_UPDATE') {
            if (data.status === 'ONLINE' && data.pin) {
              this.onlinePins.add(data.pin.toUpperCase());
            } else if (data.status === 'OFFLINE' && data.pin) {
              this.onlinePins.delete(data.pin.toUpperCase());
            }
            if (Array.isArray(data.online_pins)) {
              this.onlinePins = new Set(data.online_pins.map(p => p.toUpperCase()));
            }
          }

          this._emit(type, data);
          this._emit('*', data);
        } catch (err) {
          console.warn('[WS] Failed to parse incoming frame:', err);
        }
      };

      this.ws.onclose = () => {
        this.isConnected = false;
        this._stopHeartbeat();
        this._emit('DISCONNECTED', { pin: this.pin });
        this._scheduleReconnect();
      };

      this.ws.onerror = (err) => {
        console.warn('[WS] Connection error:', err);
      };
    } catch (e) {
      console.warn('[WS] Failed to instantiate WebSocket:', e);
      this._scheduleReconnect();
    }
  }

  _startHeartbeat() {
    this._stopHeartbeat();
    this.heartbeatTimer = setInterval(() => {
      if (this.isConnected && this.ws && this.ws.readyState === WebSocket.OPEN) {
        this.ws.send(JSON.stringify({ type: 'PING' }));
      }
    }, 25000);
  }

  _stopHeartbeat() {
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer);
      this.heartbeatTimer = null;
    }
  }

  _scheduleReconnect() {
    if (this.reconnectTimeout) return;
    this.reconnectAttempts++;
    const delay = Math.min(1000 * Math.pow(1.5, this.reconnectAttempts), 10000);
    this.reconnectTimeout = setTimeout(() => {
      this.reconnectTimeout = null;
      if (this.pin) this.connect(this.pin, this.name);
    }, delay);
  }

  send(data) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(typeof data === 'string' ? data : JSON.stringify(data));
      return true;
    }
    return false;
  }

  on(type, callback) {
    if (!this.listeners.has(type)) {
      this.listeners.set(type, new Set());
    }
    this.listeners.get(type).add(callback);
    return () => this.off(type, callback);
  }

  off(type, callback) {
    if (this.listeners.has(type)) {
      this.listeners.get(type).delete(callback);
    }
  }

  _emit(type, data) {
    if (this.listeners.has(type)) {
      for (const cb of this.listeners.get(type)) {
        try {
          cb(data);
        } catch (e) {
          console.error(`[WS] Handler error for ${type}:`, e);
        }
      }
    }
  }

  isUserOnline(pin) {
    if (!pin) return false;
    return this.onlinePins.has(pin.trim().toUpperCase());
  }

  getOnlinePins() {
    return Array.from(this.onlinePins);
  }
}

export const wsClient = new WebSocketClient();
