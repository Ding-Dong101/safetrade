const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require("nativewind/metro"); // Capital W

// @type {import('expo/metro-config').MetroConfig}
const config = getDefaultConfig(__dirname);

module.exports = withNativeWind(config, { input: "./global.css" }); // Capital W and CSS input