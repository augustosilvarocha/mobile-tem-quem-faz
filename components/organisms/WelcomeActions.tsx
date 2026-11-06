import { Pressable, StyleSheet, View } from "react-native";
import { useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import { Link, router } from "expo-router";

import { AppText } from "@/components/atoms/AppText";
import { FeatureCard } from "@/components/molecules/FeatureCard";
import { RegistrationChoiceModal } from "@/components/molecules/RegistrationChoiceModal";
import { colors, radius, spacing } from "@/theme";
import { clearAuthSession } from "@/utils/authStorage";
import type { WelcomeLayout } from "@/utils/welcomeLayout";

type WelcomeActionsProps = {
  layout: WelcomeLayout;
};

export function WelcomeActions({ layout }: WelcomeActionsProps) {
  const [registrationVisible, setRegistrationVisible] = useState(false);
  const responsiveStyles = createResponsiveStyles(layout);

  async function handleVisitorPress() {
    await clearAuthSession();
    router.push("/home");
  }

  return (
    <View
      style={[
        styles.container,
        responsiveStyles.container,
      ]}
    >
      <View style={[styles.featuresBox, responsiveStyles.featuresBox]}>
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

      <Pressable style={[styles.visitorButton, responsiveStyles.button]} onPress={handleVisitorPress}>
        <Ionicons name="person-outline" size={layout.buttonIconSize} color={colors.white} />

        <AppText
          variant="button"
          color={colors.white}
          style={[styles.buttonText, responsiveStyles.buttonText]}
        >
          Entrar como visitante
        </AppText>
      </Pressable>

      <Link href="/(auth)/login" asChild>
        <Pressable style={StyleSheet.flatten([styles.providerButton, responsiveStyles.button])}>
          <Ionicons name="log-in-outline" size={layout.buttonIconSize} color={colors.primary} />

          <AppText
            variant="button"
            color={colors.primary}
            style={[styles.buttonText, responsiveStyles.buttonText]}
          >
            Faça login
          </AppText>
        </Pressable>
      </Link>

      <AppText color={colors.text.secondary} style={[styles.registerLabel, responsiveStyles.registerLabel]}>
        Ainda não tem uma conta?
      </AppText>

        <Pressable accessibilityRole="button" onPress={() => setRegistrationVisible(true)} style={styles.registerButton}>
          <View style={styles.registerLink}>
          <AppText
            variant="subtitle"
            color={colors.primary}
            style={[
              styles.registerButtonText,
              responsiveStyles.registerButtonText,
            ]}
          >
            Cadastre-se aqui
          </AppText>
          </View>

          <Ionicons name="chevron-forward" size={28} color={colors.primary} />

        </Pressable>
      <RegistrationChoiceModal visible={registrationVisible} onClose={() => setRegistrationVisible(false)} />
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

  registerButton: {
    minHeight: 44,
    paddingVertical: spacing.xs,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.xs,
  },
  registerLink: {
    flexShrink: 1,
    borderBottomWidth: 1,
    borderBottomColor: colors.primary,
  },
  registerButtonText: {
    flexShrink: 1,
    textAlign: "center",
  },
  registerLabel: {
    textAlign: "center",
  },
});

function createResponsiveStyles(layout: WelcomeLayout) {
  return StyleSheet.create({
    container: {
      paddingHorizontal: layout.horizontalPadding,
      paddingBottom: layout.gap,
    },
    featuresBox: {
      paddingVertical: layout.gap,
    },
    button: {
      minHeight: layout.buttonMinHeight,
      marginTop: layout.buttonSpacing,
      paddingVertical: layout.gap,
      paddingHorizontal: layout.horizontalPadding,
    },
    buttonText: {
      fontSize: layout.buttonFontSize,
      lineHeight: layout.buttonLineHeight,
    },
    registerLabel: {
      marginTop: layout.gap + spacing.xs,
      fontSize: layout.registerLabelFontSize,
      lineHeight: layout.registerLabelLineHeight,
    },
    registerButtonText: {
      fontSize: layout.registerFontSize,
      lineHeight: layout.registerLineHeight,
    },
  });
}
