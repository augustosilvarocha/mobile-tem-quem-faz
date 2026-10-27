module.exports = ({ config }) => {
  const mapsKey = (
    process.env.GOOGLE_MAPS_API_KEY ||
    config.android?.config?.googleMaps?.apiKey ||
    ""
  ).trim();

  return {
    ...config,
    android: mapsKey
      ? {
          ...config.android,
          config: {
            ...config.android?.config,
            googleMaps: { ...config.android?.config?.googleMaps, apiKey: mapsKey },
          },
        }
      : config.android,
    extra: {
      ...config.extra,
      googleMapsAndroidEnabled: Boolean(mapsKey),
    },
  };
};
