const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const config = getDefaultConfig(__dirname);
config.resolver.assetExts.push('lottie');

// Redirect the legacy EventEmitter path removed in RN 0.76+ to our polyfill.
config.resolver.resolveRequest = (context, moduleName, platform) => {
  if (moduleName.includes('EventEmitter')) {
    console.log(`[Metro Resolver] Intercepted import for: ${moduleName}`);
  }

  // Fix legacy EventEmitter path removed in RN 0.76+ (used by react-native-webview etc.)
  if (moduleName === 'react-native/Libraries/vendor/emitter/EventEmitter') {
    const targetPath = path.resolve(__dirname, 'emitter-polyfill.js');
    console.log(`[Metro Resolver] Successfully redirected ${moduleName} -> ${targetPath}`);
    return {
      filePath: targetPath,
      type: 'sourceFile',
    };
  }

  // Fallback to default resolver
  return context.resolveRequest(context, moduleName, platform);
};

module.exports = config;
