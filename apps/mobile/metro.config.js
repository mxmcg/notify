const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

// Set environment variables before requiring metro config
process.env.EXPO_ROUTER_APP_ROOT = path.resolve(__dirname, 'app');
process.env.EXPO_ROUTER_ABS_APP_ROOT = path.resolve(__dirname, 'app');
process.env.EXPO_ROUTER_IMPORT_MODE = 'lazy';
process.env.EXPO_ROUTER_IMPORT_MODE_CLIENT = 'lazy';

const config = getDefaultConfig(__dirname);

module.exports = config;