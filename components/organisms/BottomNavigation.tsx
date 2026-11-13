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
  voiceLabel = "Falar serviço",
}: BottomNavigationProps) {
  return (
    <View style={styles.container}>
      <Pressable
        accessibilityLabel="Início"
        accessibilityRole="tab"
        accessibilityState={{ selected: active === "home" }}
        style={styles.item}
        onPress={onPressHome}
      >
        <Ionicons
          name={active === "home" ? "home" : "home-outline"}
          size={26}
          color={colors.primary}
        />
        <AppText style={styles.label} numberOfLines={2}>
          Início
        </AppText>
      </Pressable>

      <Pressable
        accessibilityHint={
          voiceActive
            ? "Finaliza a gravação e procura prestadores"
            : "Inicia uma gravação para você dizer o serviço que precisa"
        }
        accessibilityLabel={
          voiceDisabled
            ? "Processando busca por voz"
            : voiceActive
              ? "Finalizar gravação"
              : "Falar o serviço que preciso"
        }
        accessibilityRole="button"
        accessibilityState={{ disabled: voiceDisabled }}
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
          <Ionicons name={voiceIconName} size={28} color={colors.white} />
        </View>
        <AppText style={styles.label} numberOfLines={2}>
          {voiceLabel}
        </AppText>
      </Pressable>

      <Pressable
        accessibilityLabel="Perfil"
        accessibilityRole="tab"
        accessibilityState={{ selected: active === "profile" }}
        style={styles.item}
        onPress={onPressProfile}
      >
        <Ionicons
          name={active === "profile" ? "person" : "person-outline"}
          size={26}
          color={colors.primary}
        />
        <AppText style={styles.label} numberOfLines={2}>
          Perfil
        </AppText>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    minHeight: 72,
    backgroundColor: colors.white,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
    paddingHorizontal: spacing.md,
  },
  item: {
    minHeight: 48,
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
  },
  voiceItem: {
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
    marginTop: -20,
  },
  voiceCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
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
