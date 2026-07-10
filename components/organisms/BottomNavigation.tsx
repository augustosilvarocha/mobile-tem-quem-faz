import { Pressable, StyleSheet, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { AppText } from "@/components/atoms/AppText";
import { colors, spacing } from "@/theme";

type BottomNavigationProps = {
  active?: "home" | "voice" | "profile";
  onPressHome?: () => void;
  onPressVoice?: () => void;
  onPressProfile?: () => void;
  voiceActive?: boolean;
  voiceDisabled?: boolean;
  voiceIconName?: keyof typeof Ionicons.glyphMap;
  voiceLabel?: string;
};

export function BottomNavigation({
  active = "home",
  onPressHome,
  onPressVoice,
  onPressProfile,
  voiceActive = false,
  voiceDisabled = false,
  voiceIconName = "mic",
  voiceLabel = "Busca por voz",
}: BottomNavigationProps) {
  return (
    <View style={styles.container}>
      <Pressable style={styles.item} onPress={onPressHome}>
        <Ionicons
          name={active === "home" ? "home" : "home-outline"}
          size={28}
          color={colors.primary}
        />
        <AppText style={styles.label} numberOfLines={1}>
          Início
        </AppText>
      </Pressable>

      <Pressable
        disabled={voiceDisabled}
        style={styles.voiceItem}
        onPress={onPressVoice}
      >
        <View
          style={[
            styles.voiceCircle,
            voiceActive && styles.voiceCircleActive,
            voiceDisabled && styles.voiceCircleDisabled,
          ]}
        >
          <Ionicons name={voiceIconName} size={30} color={colors.white} />
        </View>
        <AppText style={styles.label} numberOfLines={1}>
          {voiceLabel}
        </AppText>
      </Pressable>

      <Pressable style={styles.item} onPress={onPressProfile}>
        <Ionicons
          name={active === "profile" ? "person" : "person-outline"}
          size={28}
          color={colors.primary}
        />
        <AppText style={styles.label} numberOfLines={1}>
          Perfil
        </AppText>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 90,
    backgroundColor: colors.white,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
    paddingHorizontal: spacing.md,
  },
  item: {
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
  },
  voiceItem: {
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
    marginTop: -24,
  },
  voiceCircle: {
    width: 62,
    height: 62,
    borderRadius: 31,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 6,
    borderColor: "#D8F1E3",
    marginBottom: 2,
  },
  voiceCircleActive: {
    backgroundColor: colors.danger,
    borderColor: "#F7D4D4",
  },
  voiceCircleDisabled: {
    opacity: 0.7,
  },
  label: {
    color: colors.primary,
    fontWeight: "600",
    fontSize: 14,
    lineHeight: 18,
    textAlign: "center",
  },
});
