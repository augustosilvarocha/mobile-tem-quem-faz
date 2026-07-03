import { Pressable, StyleSheet, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Link } from "expo-router";

import { AppText } from "@/components/atoms/AppText";
import { FeatureCard } from "@/components/molecules/FeatureCard";
import { colors, radius, spacing } from "@/theme";

export function WelcomeActions() {
  return (
    <View style={styles.container}>
      <View style={styles.featuresBox}>
        <FeatureCard
          icon="search-outline"
          title="Buscar fácil"
          description={"Encontre o serviço\nque você precisa\nem poucos toques."}
        />

        <View style={styles.divider} />

        <FeatureCard
          icon="location-outline"
          title="Perto de você"
          description={"Profissionais da\nsua região, prontos\npara te atender."}
        />

        <View style={styles.divider} />

        <FeatureCard
          icon="logo-whatsapp"
          title="Contato rápido"
          description={"Fale diretamente\ncom o prestador\nde forma rápida."}
        />
      </View>

      <Link href="/home" asChild>
        <Pressable style={styles.visitorButton}>
          <Ionicons name="person-outline" size={28} color={colors.white} />

          <AppText
            variant="button"
            color={colors.white}
            style={styles.mainButtonText}
          >
            Entrar como visitante
          </AppText>
        </Pressable>
      </Link>

      <Link href="/(auth)/login" asChild>
        <Pressable style={styles.providerButton}>
          <Ionicons name="briefcase-outline" size={26} color={colors.primary} />

          <AppText
            variant="button"
            color={colors.primary}
            style={styles.providerButtonText}
          >
            Entrar como prestador
          </AppText>
        </Pressable>
      </Link>

      <View style={styles.dashedLine} />

      <AppText
        variant="profession"
        color={colors.text.secondary}
        style={styles.registerLabel}
      >
        Ainda não é prestador?
      </AppText>

      <Link href="/(auth)/register-provider" asChild>
        <Pressable style={styles.registerButton}>
          <AppText variant="subtitle" color={colors.primary}>
            Cadastre-se como prestador
          </AppText>

          <Ionicons
            name="chevron-forward"
            size={28}
            color={colors.primary}
          />
        </Pressable>
      </Link>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: spacing.md,
  },

  featuresBox: {
    flexDirection: "row",
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    paddingVertical: spacing.sm,
    marginTop: -spacing.sm,
  },

  divider: {
    width: 1,
    backgroundColor: colors.border,
    marginVertical: spacing.sm,
  },

  visitorButton: {
    height: 56,
    borderRadius: radius.md,
    backgroundColor: colors.primary,
    marginTop: spacing.sm,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
  },

  mainButtonText: {
    fontSize: 18,
  },

  providerButton: {
    height: 56,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.primary,
    backgroundColor: colors.white,
    marginTop: spacing.sm,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
  },

  providerButtonText: {
    fontSize: 18,
  },

  dashedLine: {
    borderTopWidth: 1,
    borderStyle: "dashed",
    borderColor: colors.border,
    marginTop: spacing.md,
    marginBottom: spacing.sm,
  },

  registerLabel: {
    textAlign: "center",
    marginBottom: 2,
  },

  registerButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.xs,
  },
});