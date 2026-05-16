// Learn more https://docs.expo.dev/guides/customizing-metro
const { getDefaultConfig } = require('expo/metro-config');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

// Exclude Android/iOS native build directories from Metro's file watcher.
// Without this, Metro crashes with ENOENT after 'gradlew clean' deletes
// build snapshot directories inside node_modules/**/android/build/.
config.watchFolders = config.watchFolders ?? [];
config.resolver.blockList = [
  /node_modules\/.*\/android\/build\/.*/,
  /node_modules\/.*\/ios\/build\/.*/,
  /android\/build\/.*/,
  /android\/\.gradle\/.*/,
];

module.exports = config;
