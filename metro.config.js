// Learn more https://docs.expo.dev/guides/customizing-metro
const { getDefaultConfig } = require('expo/metro-config');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

// Firebase compatibility fixes
config.resolver.unstable_enablePackageExports = false;
config.resolver.sourceExts.push('cjs'); // 👈 This allows Metro to resolve .cjs files used in firebase/auth

module.exports = config;
// This configuration is necessary to ensure that Firebase packages work correctly with Expo's Metro bundler.