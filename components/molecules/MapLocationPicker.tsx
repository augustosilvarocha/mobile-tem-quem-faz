import { useState } from "react";
import { Modal, Pressable, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import MapView, { Marker, type Region } from "@/components/atoms/NativeMap";
import { AppText } from "@/components/atoms/AppText";
import { colors, spacing } from "@/theme";

type Coordinate = { latitude: number; longitude: number };
type Props = {
  initialRegion: Region;
  initialCoordinate: Coordinate | null;
  onCancel: () => void;
  onConfirm: (coordinate: Coordinate) => void;
};

export function MapLocationPicker({ initialRegion, initialCoordinate, onCancel, onConfirm }: Props) {
  const [coordinate, setCoordinate] = useState<Coordinate | null>(initialCoordinate);

  function selectCoordinate(nextCoordinate: Coordinate) {
    setCoordinate({ latitude: nextCoordinate.latitude, longitude: nextCoordinate.longitude });
  }

  return (
    <Modal visible animationType="slide" onRequestClose={onCancel}>
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Pressable accessibilityLabel="Fechar mapa" accessibilityRole="button" onPress={onCancel} style={styles.button}>
            <Ionicons name="close" size={24} color={colors.text.primary} />
          </Pressable>
          <AppText variant="name">Escolher localização</AppText>
          <Pressable
            accessibilityLabel="Confirmar localização marcada"
            accessibilityRole="button"
            accessibilityState={{ disabled: !coordinate }}
            disabled={!coordinate}
            onPress={() => { if (coordinate) onConfirm(coordinate); }}
            style={styles.button}
          >
            <Ionicons name="checkmark" size={24} color={coordinate ? colors.primary : colors.text.secondary} />
          </Pressable>
        </View>
        <AppText style={styles.help}>
          Toque no mapa para marcar o local. Para ajustar, toque em outro ponto ou arraste o marcador.
        </AppText>
        <View style={styles.mapContainer}>
          <MapView
            style={StyleSheet.absoluteFillObject}
            initialRegion={initialRegion}
            moveOnMarkerPress={false}
            onPress={(event) => selectCoordinate(event.nativeEvent.coordinate)}
            onLongPress={(event) => selectCoordinate(event.nativeEvent.coordinate)}
            onPoiClick={(event) => selectCoordinate(event.nativeEvent.coordinate)}
          >
            {/* Keep the native marker mounted, even before the first selection. */}
            <Marker
              coordinate={coordinate ?? initialRegion}
              opacity={coordinate ? 1 : 0}
              draggable={Boolean(coordinate)}
              onDragEnd={(event) => selectCoordinate(event.nativeEvent.coordinate)}
            />
          </MapView>
        </View>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background.primary },
  header: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    paddingHorizontal: spacing.sm, backgroundColor: colors.white,
  },
  button: { width: 48, height: 56, alignItems: "center", justifyContent: "center" },
  help: { padding: spacing.md, textAlign: "center" },
  mapContainer: { flex: 1 },
});
