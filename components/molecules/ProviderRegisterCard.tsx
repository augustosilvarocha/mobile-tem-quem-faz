import { Pressable, StyleSheet, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Link } from "expo-router";

import { AppText } from "@/components/atoms/AppText";
import { colors, radius, spacing } from "@/theme";

export function ProviderRegisterCard() {
  return (
    <Link href="/(auth)/register-provider" asChild>
      <Pressable style={styles.card}>
        <View style={styles.iconCircle}>
          <Ionicons name="help" size={28} color={colors.white} />
        </View>

        <View style={styles.content}>
          <AppText variant="name" color={colors.text.primary}>
            Ainda não é prestador?
          </AppText>

          <AppText variant="field" color={colors.text.secondary}>
            Cadastre-se e comece a receber serviços.
          </AppText>
        </View>

        <Ionicons name="chevron-forward" size={28} color={colors.primary} />
      </Pressable>
    </Link>
  );
}

const styles = StyleSheet.create({
  card: {
    height: 80,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.white,
    marginTop: spacing.sm,
    paddingHorizontal: spacing.md,
    flexDirection: "row",
    alignItems: "center",
  },

  iconCircle: {
    width: 48,
    height: 48,
    borderRadius: radius.full,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
    marginRight: spacing.md,
  },

  content: {
    flex: 1,
  },
});
