const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// 1. Add 'wasm' to assetExts
config.resolver.assetExts.push('wasm');

// 2. Add headers for SharedArrayBuffer support (required by expo-sqlite)
config.server.enhanceMiddleware = (middleware, server) => {
  return (req, res, next) => {
    // Set COOP and COEP headers
    res.setHeader('Cross-Origin-Opener-Policy', 'same-origin');
    res.setHeader('Cross-Origin-Embedder-Policy', 'require-corp');
    return middleware(req, res, next);
  };
};

module.exports = config;