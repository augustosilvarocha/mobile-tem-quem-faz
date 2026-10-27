import { Image, StyleSheet, View } from "react-native";
import { AppText } from "@/components/atoms/AppText";
import { colors } from "@/theme";
import type { WelcomeLayout } from "@/utils/welcomeLayout";

type WelcomeHeaderProps = {
  layout: WelcomeLayout;
  showIllustration?: boolean;
};

export function WelcomeHeader({
  layout,
  showIllustration = true,
}: WelcomeHeaderProps) {
  return (
    <View style={[styles.container, { paddingHorizontal: layout.horizontalPadding }]}>
      <Image
        source={require("../../assets/images/logo.png")}
        style={[styles.logo, { width: layout.logoWidth, height: layout.logoHeight }]}
        resizeMode="contain"
      />

      <AppText
        variant="subtitle"
        style={[
          styles.subtitle,
          { fontSize: layout.subtitleFontSize, lineHeight: layout.subtitleLineHeight },
        ]}
      >
        Encontre prestadores de serviço{"\n"}
        <AppText
          variant="subtitle"
          color={colors.primary}
          style={{ fontSize: layout.subtitleFontSize, lineHeight: layout.subtitleLineHeight }}
        >
          perto de você.
        </AppText>
      </AppText>

      {showIllustration && (
        <Image
          source={require("../../assets/images/auth-banner.png")}
          style={[
            styles.illustration,
            { maxHeight: layout.illustrationMaxHeight, marginTop: layout.gap },
          ]}
          resizeMode="contain"
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    minHeight: 0,
    alignItems: "center",
    justifyContent: "center",
  },

  logo: {
    flexShrink: 1,
    maxWidth: "100%",
  },
  subtitle: {
    color: colors.secondary,
    textAlign: "center",
  },

  illustration: {
    flex: 1,
    minHeight: 0,
    width: "100%",
  },
});
