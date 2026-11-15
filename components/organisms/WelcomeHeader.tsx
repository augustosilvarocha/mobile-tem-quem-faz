import { Image, StyleSheet, View } from "react-native";
import { AppText } from "@/components/atoms/AppText";
import { colors, spacing } from "@/theme";
import type { WelcomeLayout } from "@/utils/welcomeLayout";

type WelcomeHeaderProps = { layout: WelcomeLayout; showIllustration?: boolean };

export function WelcomeHeader({ layout, showIllustration = true }: WelcomeHeaderProps) {
  return (
    <View style={[styles.container, { paddingHorizontal: layout.horizontalPadding, gap: layout.gap * 2 }]}>
      <Image source={require("../../assets/images/logo.png")} resizeMode="contain"
        accessibilityLabel="TemQuemFaz" style={{ width: layout.logoWidth, height: layout.logoHeight }} />
      <AppText variant="title" style={[styles.title, { fontSize: layout.heroFontSize, lineHeight: layout.heroLineHeight }]}>
        O serviço que você{ "\n" }precisa, perto{ "\n" }
        <AppText variant="title" style={{ color: colors.primary, fontSize: layout.heroFontSize, lineHeight: layout.heroLineHeight }}>de você.</AppText>
      </AppText>
      <AppText style={[styles.description, { fontSize: layout.subtitleFontSize, lineHeight: layout.subtitleLineHeight }]}>
        Encontre profissionais da sua região.
      </AppText>
      {showIllustration && <Image source={require("../../assets/images/welcome-duo.png")}
        resizeMode="contain" style={[styles.illustration, { height: layout.illustrationMaxHeight }]} />}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: "center", flexShrink: 0 },
  title: { color: "#082252", textAlign: "center", width: "100%", letterSpacing: -0.8 },
  description: { color: colors.text.secondary, textAlign: "center" },
  illustration: { width: "100%", marginTop: spacing.xs, borderRadius: 24 },
});
