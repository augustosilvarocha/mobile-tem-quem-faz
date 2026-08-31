import { StyleSheet, View } from "react-native";
import MapView, { Marker } from "react-native-maps";

import { colors, radius } from "@/theme";

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
});
