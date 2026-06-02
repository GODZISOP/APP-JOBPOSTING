/**
 * Polyfill for react-native/Libraries/vendor/emitter/EventEmitter
 * This path was removed in React Native 0.76+.
 * Packages like react-native-webview and react-native-google-mobile-ads
 * still import from this legacy path.
 * 
 *
 * This polyfill provides a compatible EventEmitter class with both
 * default export (ES module) and module.exports (CommonJS) for maximum compatibility.
 */

class EventEmitter {
  constructor() {
    this._listeners = {};
  }

  addListener(event, listener, context) {
    if (!this._listeners[event]) this._listeners[event] = [];
    const entry = { listener, context };
    this._listeners[event].push(entry);
    const self = this;
    return {
      remove() {
        if (self._listeners[event]) {
          self._listeners[event] = self._listeners[event].filter(e => e !== entry);
        }
      },
      eventType: event,
    };
  }

  emit(event, ...args) {
    const entries = this._listeners[event];
    if (entries) {
      // Copy to avoid mutation during iteration
      [...entries].forEach(({ listener, context }) => {
        try {
          listener.apply(context, args);
        } catch (e) {
          console.error('EventEmitter listener error:', e);
        }
      });
    }
  }

  removeAllListeners(event) {
    if (event != null) {
      delete this._listeners[event];
    } else {
      this._listeners = {};
    }
  }

  listenerCount(event) {
    return (this._listeners[event] || []).length;
  }

  // Alias for compatibility
  on(event, listener, context) {
    return this.addListener(event, listener, context);
  }

  off(event, listener) {
    if (this._listeners[event]) {
      this._listeners[event] = this._listeners[event].filter(e => e.listener !== listener);
    }
  }
}

// CommonJS export with __esModule: true so _interopRequireDefault works correctly
// packages that do: var _E = _interopRequireDefault(require('...')); new _E.default()
module.exports = EventEmitter;
module.exports.default = EventEmitter;
module.exports.EventEmitter = EventEmitter;
module.exports.__esModule = true;
