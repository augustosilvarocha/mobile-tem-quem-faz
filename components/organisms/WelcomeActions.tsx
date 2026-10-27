import { Pressable, StyleSheet, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Link, router } from "expo-router";

import { AppText } from "@/components/atoms/AppText";
import { FeatureCard } from "@/components/molecules/FeatureCard";
import { colors, radius, spacing } from "@/theme";
import { clearAuthSession } from "@/utils/authStorage";
import type { WelcomeLayout } from "@/utils/welcomeLayout";

type WelcomeActionsProps = {
  layout: WelcomeLayout;
};

export function WelcomeActions({ layout }: WelcomeActionsProps) {
  const buttonStyle = {
    minHeight: layout.buttonMinHeight,
    marginTop: layout.gap,
    paddingVertical: layout.gap,
    paddingHorizontal: layout.horizontalPadding,
  };
  const buttonTextStyle = {
    fontSize: layout.buttonFontSize,
    lineHeight: layout.buttonLineHeight,
  };

  async function handleVisitorPress() {
    await clearAuthSession();
    router.push("/home");
  }

  return (
    <View
      style={[
        styles.container,
        { paddingHorizontal: layout.horizontalPadding, paddingBottom: layout.gap },
      ]}
    >
      <View style={[styles.featuresBox, { paddingVertical: layout.gap }]}>
        <FeatureCard
          icon="search-outline"
          title="Buscar fácil"
          description="Encontre o serviço que você precisa em poucos toques."
          layout={layout}
        />

        <View style={styles.divider} />

        <FeatureCard
          icon="location-outline"
          title="Perto de você"
          description="Profissionais da sua região, prontos para te atender."
          layout={layout}
        />

        <View style={styles.divider} />

        <FeatureCard
          icon="logo-whatsapp"
          title="Contato rápido"
          description="Fale diretamente com o prestador de forma rápida."
          layout={layout}
        />
      </View>

      <Pressable style={[styles.visitorButton, buttonStyle]} onPress={handleVisitorPress}>
        <Ionicons name="person-outline" size={layout.buttonIconSize} color={colors.white} />

        <AppText
          variant="button"
          color={colors.white}
          style={[styles.buttonText, buttonTextStyle]}
        >
          Entrar como visitante
        </AppText>
      </Pressable>

      <Link href="/(auth)/login" asChild>
        <Pressable style={StyleSheet.flatten([styles.providerButton, buttonStyle])}>
          <Ionicons name="briefcase-outline" size={layout.buttonIconSize} color={colors.primary} />

          <AppText
            variant="button"
            color={colors.primary}
            style={[styles.buttonText, buttonTextStyle]}
          >
            Entrar como prestador
          </AppText>
        </Pressable>
      </Link>

      <View style={[styles.dashedLine, { marginTop: layout.gap }]} />

      <AppText
        variant="profession"
        color={colors.text.secondary}
        style={[
          styles.registerLabel,
          { fontSize: layout.registerLabelFontSize, lineHeight: layout.registerLabelLineHeight },
        ]}
      >
        Ainda não é prestador?
      </AppText>

      <Link href="/(auth)/register-provider" asChild>
        <Pressable style={styles.registerButton}>
          <AppText
            variant="subtitle"
            color={colors.primary}
            style={[
              styles.registerButtonText,
              { fontSize: layout.registerFontSize, lineHeight: layout.registerLineHeight },
            ]}
          >
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
    flexShrink: 0,
  },

  featuresBox: {
    flexDirection: "row",
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
  },

  divider: {
    width: 1,
    backgroundColor: colors.border,
    marginVertical: spacing.sm,
  },

  visitorButton: {
    borderRadius: radius.md,
    backgroundColor: colors.primary,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
  },

  buttonText: {
    flexShrink: 1,
    textAlign: "center",
  },

  providerButton: {
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.primary,
    backgroundColor: colors.white,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
  },

  dashedLine: {
    borderTopWidth: 1,
    borderStyle: "dashed",
    borderColor: colors.border,
    marginBottom: spacing.xs,
  },

  registerLabel: {
    textAlign: "center",
    marginBottom: 2,
  },

  registerButton: {
    minHeight: 44,
    paddingVertical: spacing.xs,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.xs,
  },
  registerButtonText: {
    flexShrink: 1,
    textAlign: "center",
  },
});
