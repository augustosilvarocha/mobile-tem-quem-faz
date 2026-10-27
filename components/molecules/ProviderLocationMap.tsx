import { StyleSheet, View } from "react-native";
import MapView, { Marker } from "react-native-maps";
import { Ionicons } from "@expo/vector-icons";

import { AppText } from "@/components/atoms/AppText";
import { colors, radius } from "@/theme";
import { canRenderNativeMap } from "@/utils/nativeMaps";
import { hasValidCoordinates } from "@/utils/providerDistance";

const PROVIDER_MAP_DELTA = 0.005;

type ProviderLocationMapProps = {
  description: string;
  latitude: number;
  longitude: number;
  title: string;
};

export function ProviderLocationMap({
  description,
  latitude,
  longitude,
  title,
}: ProviderLocationMapProps) {
  if (!hasValidCoordinates({ latitude, longitude })) {
    return null;
  }

  if (!canRenderNativeMap()) {
    return (
      <View style={[styles.mapContainer, styles.mapFallback]}>
        <Ionicons name="location" size={32} color={colors.primary} />
        <AppText style={styles.fallbackText}>
          Consulte a localização em “Abrir no mapa”.
        </AppText>
      </View>
    );
  }

  return (
    <View style={styles.mapContainer}>
      <MapView
        style={styles.map}
        initialRegion={{
          latitude,
          longitude,
          latitudeDelta: PROVIDER_MAP_DELTA,
          longitudeDelta: PROVIDER_MAP_DELTA,
        }}
        pitchEnabled={false}
        rotateEnabled={false}
        scrollEnabled={false}
        zoomEnabled={false}
      >
        <Marker
          coordinate={{ latitude, longitude }}
          title={title}
          description={description}
        />
      </MapView>
    </View>
  );
}

const styles = StyleSheet.create({
  mapContainer: {
    height: 190,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    backgroundColor: colors.background.card,
    overflow: "hidden",
  },

  map: {
    flex: 1,
  },

  mapFallback: {
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    padding: 20,
  },

  fallbackText: {
    textAlign: "center",
    color: colors.text.secondary,
  },
});
