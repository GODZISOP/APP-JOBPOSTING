// Polyfill DOMException for React Native environment
if (typeof globalThis.DOMException === 'undefined') {
  class DOMExceptionPolyfill extends Error {
    constructor(message = '', name = 'Error') {
      super(message);
      this.name = name;
      this.message = message;
      if (Error.captureStackTrace) {
        Error.captureStackTrace(this, DOMExceptionPolyfill);
      }
    }
  }
  globalThis.DOMException = DOMExceptionPolyfill;
  if (typeof global !== 'undefined') {
    global.DOMException = DOMExceptionPolyfill;
  }
  console.log('⚡ DOMException successfully polyfilled globally!');
}

// Polyfill globalThis.expo and globalThis.expo.EventEmitter to prevent
// "Cannot read property 'EventEmitter' of undefined" crashes.
if (typeof globalThis.expo === 'undefined') {
  globalThis.expo = {};
}
if (!globalThis.expo.EventEmitter) {
  try {
    const EventEmitterClass = require('./emitter-polyfill');
    globalThis.expo.EventEmitter = EventEmitterClass;
    console.log('⚡ globalThis.expo.EventEmitter successfully polyfilled!');
  } catch (err) {
    console.error('Failed to polyfill globalThis.expo.EventEmitter:', err);
  }
}

// Polyfill globalThis.expo.modules['ExpoAsset'] to prevent "Cannot find native module 'ExpoAsset'"
// when running on an existing Development Build APK that was compiled without it.
if (typeof globalThis.expo.modules === 'undefined') {
  globalThis.expo.modules = {};
}
if (!globalThis.expo.modules['ExpoAsset']) {
  globalThis.expo.modules['ExpoAsset'] = {
    downloadAsync: async (url, md5Hash, type) => {
      console.log(`[ExpoAsset Polyfill] downloadAsync intercepted for: ${url}`);
      return url;
    }
  };
  console.log('⚡ Native module ExpoAsset successfully polyfilled in JS!');
}

// Disable system font scaling globally to ensure layout consistency across all devices
try {
  const { Text, TextInput } = require('react-native');
  const React = require('react');

  // Method 1: For older React Native versions
  if (Text.defaultProps) {
    Text.defaultProps.allowFontScaling = false;
  } else {
    Text.defaultProps = { allowFontScaling: false };
  }
  if (TextInput.defaultProps) {
    TextInput.defaultProps.allowFontScaling = false;
  } else {
    TextInput.defaultProps = { allowFontScaling: false };
  }

  // Method 2: For React 19 / React Native 0.81+ (where defaultProps are ignored)
  if (Text.render) {
    const originalTextRender = Text.render;
    Text.render = function (...args) {
      const origin = originalTextRender.apply(this, args);
      return origin ? React.cloneElement(origin, { allowFontScaling: false }) : origin;
    };
  }

  if (TextInput.render) {
    const originalTextInputRender = TextInput.render;
    TextInput.render = function (...args) {
      const origin = originalTextInputRender.apply(this, args);
      return origin ? React.cloneElement(origin, { allowFontScaling: false }) : origin;
    };
  }

  console.log('⚡ Global font scaling disabled successfully!');
} catch (err) {
  console.warn('Failed to disable font scaling globally:', err);
}
