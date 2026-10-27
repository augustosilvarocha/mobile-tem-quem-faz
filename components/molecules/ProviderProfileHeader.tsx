import { useState } from "react";
import { Image, Pressable, StyleSheet, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { AppText } from "@/components/atoms/AppText";
import { Provider } from "@/services/provider.service";
import { colors, spacing } from "@/theme";
import { ZoomableImageModal } from "./ZoomableImageModal";

export function ProviderProfileHeader({ provider }: { provider: Provider }) {
  const [photoVisible, setPhotoVisible] = useState(false);
  return (
    <View style={styles.container}>
      {provider.photo ? (
        <Pressable accessibilityRole="button" accessibilityLabel={`Ampliar foto de ${provider.name}`} onPress={() => setPhotoVisible(true)}>
          <Image source={{ uri: provider.photo }} style={styles.avatar} />
        </Pressable>
      ) : (
        <View style={[styles.avatar, styles.placeholder]}>
          <Ionicons name="person" size={64} color={colors.text.secondary} />
        </View>
      )}
      <AppText variant="title" style={styles.name}>{provider.name}</AppText>
      <View style={styles.location}>
        <Ionicons name="location" size={16} color={colors.primary} />
        <AppText style={styles.city}>{provider.city_name} - {provider.uf}</AppText>
      </View>
      {provider.photo ? <ZoomableImageModal imageUri={provider.photo} visible={photoVisible} onClose={() => setPhotoVisible(false)} /> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { paddingVertical: spacing.md, alignItems: "center", gap: spacing.sm },
  avatar: { width: 144, height: 144, borderRadius: 72 },
  placeholder: { backgroundColor: colors.background.card, alignItems: "center", justifyContent: "center" },
  name: { width: "100%", textAlign: "center", fontWeight: "800", color: colors.text.primary },
  location: { flexDirection: "row", justifyContent: "center", alignItems: "center", gap: spacing.xs, maxWidth: "100%" },
  city: { flexShrink: 1, textAlign: "center", color: colors.text.secondary },
});
