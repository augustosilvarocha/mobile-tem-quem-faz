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
    <View style={styles.card}>
      {photo ? (
        <Image source={{ uri: photo }} style={styles.avatar} />
      ) : (
        <View style={styles.avatarPlaceholder}>
          <Ionicons name="person" size={32} color={colors.text.secondary} />
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
          <Ionicons name="location" size={14} color={colors.primary} />
          <AppText style={styles.location} numberOfLines={1}>
            {city}
          </AppText>
        </View>
      </View>

      <Pressable style={styles.button} onPress={onPress}>
        <AppText style={styles.buttonText}>Ver perfil</AppText>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create<{
  card: ViewStyle;
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
    padding: spacing.sm,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
  },
  avatarPlaceholder: {
    width: 72,
    height: 72,
    borderRadius: 36,
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
  },
  category: {
    color: colors.text.secondary,
    marginTop: 2,
  },
  locationRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
    marginTop: 2,
  },
  location: {
    color: colors.primary,
    fontWeight: "700",
  },
  button: {
    backgroundColor: colors.primary,
    borderRadius: radius.md,
    paddingHorizontal: spacing.sm,
    paddingVertical: 6,
    alignSelf: "flex-start",
  },
  buttonText: {
    color: colors.white,
    fontWeight: "700",
    fontSize: 12,
    lineHeight: 16,
  },
});
