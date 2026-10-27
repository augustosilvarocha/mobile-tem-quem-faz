const { AndroidConfig, withAndroidManifest } = require("expo/config-plugins");

// A release APK must explicitly allow HTTP while the API uses a bare IP.
module.exports = function withHttpApi(config) {
  const apiUrl = process.env.EXPO_PUBLIC_API_URL || "";

  return withAndroidManifest(config, (config) => {
    const application = AndroidConfig.Manifest.getMainApplicationOrThrow(
      config.modResults
    );
    application.$["android:usesCleartextTraffic"] = String(
      apiUrl.startsWith("http://")
    );
    return config;
  });
};
