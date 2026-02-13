const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require("nativewind/metro");

const config = getDefaultConfig(__dirname);

// expo-sqlite web support: resolve .wasm as assets
config.resolver.assetExts = [...(config.resolver.assetExts || []).filter(e => e !== "wasm"), "wasm"];
config.resolver.sourceExts = (config.resolver.sourceExts || []).filter(e => e !== "wasm");

module.exports = withNativeWind(config, { input: "./global.css" });
