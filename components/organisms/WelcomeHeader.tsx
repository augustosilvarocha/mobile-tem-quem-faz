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
  const responsiveStyles = createResponsiveStyles(layout);
  return (
    <View style={[styles.container, responsiveStyles.container]}>
      <Image
        source={require("../../assets/images/logo.png")}
        style={[styles.logo, responsiveStyles.logo]}
        resizeMode="contain"
      />

      <AppText
        variant="subtitle"
        style={[
          styles.subtitle,
          responsiveStyles.subtitle,
        ]}
      >
        Encontre prestadores de serviço{"\n"}
        <AppText
          variant="subtitle"
          color={colors.primary}
          style={responsiveStyles.subtitle}
        >
          perto de você.
        </AppText>
      </AppText>

      {showIllustration && (
        <Image
          source={require("../../assets/images/auth-banner.png")}
          style={[
            styles.illustration,
            responsiveStyles.illustration,
          ]}
          resizeMode="contain"
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexShrink: 0,
    alignItems: "center",
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
    width: "100%",
    marginBottom: -16,
    borderWidth: 1,
    borderColor: colors.background.primary,
    borderRadius: 16,
  },
});

function createResponsiveStyles(layout: WelcomeLayout) {
  return StyleSheet.create({
    container: { paddingHorizontal: layout.horizontalPadding },
    logo: { width: layout.logoWidth, height: layout.logoHeight },
    subtitle: {
      fontSize: layout.subtitleFontSize,
      lineHeight: layout.subtitleLineHeight,
    },
    illustration: {
      height: layout.illustrationMaxHeight,
      marginTop: layout.gap,
    },
  });
}
