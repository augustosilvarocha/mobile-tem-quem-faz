import { Pressable, StyleSheet, View } from "react-native";
import { useState } from "react";
import { Link, router } from "expo-router";
import { AppText } from "@/components/atoms/AppText";
import { RegistrationChoiceModal } from "@/components/molecules/RegistrationChoiceModal";
import { colors, radius, spacing } from "@/theme";
import { clearAuthSession } from "@/utils/authStorage";
import type { WelcomeLayout } from "@/utils/welcomeLayout";

export function WelcomeActions({ layout }: { layout: WelcomeLayout }) {
  const [registrationVisible, setRegistrationVisible] = useState(false);
  async function handleVisitorPress() {
    await clearAuthSession();
    router.push("/home");
  }
  const buttonStyle = { minHeight: layout.buttonMinHeight, paddingHorizontal: layout.horizontalPadding };
  const textStyle = { fontSize: layout.buttonFontSize, lineHeight: layout.buttonLineHeight };
  return (
    <View style={[styles.container, { paddingHorizontal: layout.horizontalPadding }]}>
      <Pressable accessibilityRole="button" style={[styles.button, styles.primary, buttonStyle]} onPress={handleVisitorPress}>
        <AppText variant="button" style={[styles.text, textStyle]} color={colors.white}>Entrar como visitante</AppText>
      </Pressable>
      <Link href="/(auth)/login" asChild>
        <Pressable accessibilityRole="button" style={StyleSheet.flatten([styles.button, styles.secondary, buttonStyle])}>
          <AppText variant="button" style={[styles.text, textStyle]} color={colors.primary}>Já tenho conta</AppText>
        </Pressable>
      </Link>
      <AppText color={colors.text.secondary} style={[styles.registerLabel, {
        fontSize: layout.registerLabelFontSize,
        lineHeight: layout.registerLabelLineHeight,
      }]}>
        Ainda não tem conta?
      </AppText>
      <Pressable accessibilityRole="button" style={[styles.register, buttonStyle]} onPress={() => setRegistrationVisible(true)}>
        <AppText variant="button" color={colors.primary} style={[styles.text, textStyle]}>Criar conta</AppText>
      </Pressable>
      <RegistrationChoiceModal visible={registrationVisible} onClose={() => setRegistrationVisible(false)} />
    </View>
  );
}
const styles = StyleSheet.create({
  container: { flexShrink: 0, gap: spacing.sm, paddingTop: spacing.lg, paddingBottom: spacing.md },
  button: { justifyContent: "center", alignItems: "center", borderRadius: radius.lg, paddingVertical: spacing.sm },
  primary: { backgroundColor: colors.primary },
  secondary: { borderWidth: 1.5, borderColor: colors.primary, backgroundColor: colors.white },
  registerLabel: { textAlign: "center", marginTop: spacing.sm },
  register: { justifyContent: "center", alignItems: "center", paddingVertical: spacing.sm },
  text: { textAlign: "center", flexShrink: 1 },
});
