import {
  Image,
  Pressable,
  StyleSheet,
  View,
  type ImageStyle,
  type TextStyle,
  type ViewStyle,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { AppText } from "@/components/atoms/AppText";
import { colors, radius, spacing } from "@/theme";

type ProviderCardProps = {
  name: string;
  category: string;
  city: string;
  photo?: string;
  onPress?: () => void;
};

export function ProviderCard({
  name,
  category,
  city,
  photo,
  onPress,
}: ProviderCardProps) {
  return (
    <Pressable
      accessibilityLabel={`Ver perfil de ${name}`}
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
    >
      <View style={styles.content}>
        {photo ? (
          <Image source={{ uri: photo }} style={styles.avatar} />
        ) : (
          <View style={styles.avatarPlaceholder}>
            <Ionicons name="person" size={38} color={colors.text.secondary} />
          </View>
        )}

        <View style={styles.info}>
          <AppText style={styles.name} numberOfLines={1}>
            {name}
          </AppText>
          <AppText style={styles.category} numberOfLines={2}>
            {category}
          </AppText>

          <View style={styles.locationRow}>
            <Ionicons name="location" size={16} color={colors.primary} />
            <AppText style={styles.location} numberOfLines={1}>
              {city}
            </AppText>
          </View>
        </View>
      </View>

      <View style={styles.button}>
        <AppText style={styles.buttonText}>Ver perfil</AppText>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create<{
  card: ViewStyle;
  cardPressed: ViewStyle;
  content: ViewStyle;
  avatar: ImageStyle;
  avatarPlaceholder: ViewStyle;
  info: ViewStyle;
  name: TextStyle;
  category: TextStyle;
  locationRow: ViewStyle;
  location: TextStyle;
  button: ViewStyle;
  buttonText: TextStyle;
}>({
  card: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.md,
    minHeight: 154,
    gap: spacing.md,
  },
  content: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
  },
  cardPressed: {
    opacity: 0.82,
  },
  avatar: {
    width: 84,
    height: 84,
    borderRadius: 42,
  },
  avatarPlaceholder: {
    width: 84,
    height: 84,
    borderRadius: 42,
    backgroundColor: colors.background.card,
    alignItems: "center",
    justifyContent: "center",
  },
  info: {
    flex: 1,
    minWidth: 0,
  },
  name: {
    fontWeight: "700",
    color: colors.text.primary,
    fontSize: 18,
    lineHeight: 22,
  },
  category: {
    color: colors.text.secondary,
    fontSize: 15,
    lineHeight: 20,
    marginTop: 2,
  },
  locationRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
    marginTop: spacing.xs,
  },
  location: {
    color: colors.primary,
    fontWeight: "700",
    fontSize: 15,
    lineHeight: 20,
  },
  button: {
    minHeight: 48,
    backgroundColor: colors.primary,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "stretch",
  },
  buttonText: {
    color: colors.white,
    fontWeight: "700",
    fontSize: 15,
    lineHeight: 20,
  },
});
