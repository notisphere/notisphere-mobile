// metro.config.js
const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// 👇 Обязательно для expo-sqlite на вебе:
config.resolver.assetExts = [
  ...config.resolver.assetExts,
  'wasm', // Поддержка WebAssembly
];

// 👇 Заголовки для SharedArrayBuffer:
config.server.enhanceMiddleware = (middleware) => {
  return (req, res, next) => {
    res.setHeader('Cross-Origin-Embedder-Policy', 'credentialless');
    res.setHeader('Cross-Origin-Opener-Policy', 'same-origin');
    middleware(req, res, next);
  };
};

module.exports = config;
