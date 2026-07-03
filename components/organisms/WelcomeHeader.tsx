import { Image, StyleSheet, View } from "react-native";
import { AppText } from "@/components/atoms/AppText";
import { colors, spacing } from "@/theme";

type WelcomeHeaderProps = {
  showIllustration?: boolean;
};

export function WelcomeHeader({
  showIllustration = true,
}: WelcomeHeaderProps) {
  return (
    <View style={styles.container}>
      <Image
        source={require("../../assets/images/logo.png")}
        style={styles.logo}
        resizeMode="contain"
      />

      <AppText variant="subtitle" style={styles.subtitle}>
        Encontre prestadores de serviço{"\n"}
        <AppText variant="subtitle" color={colors.primary}>
          perto de você.
        </AppText>
      </AppText>

      {showIllustration && (
        <Image
          source={require("../../assets/images/auth-banner.png")}
          style={styles.illustration}
          resizeMode="contain"
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
  },

  logo: {
    width: 250,
    height: 186,
    marginTop: spacing.xl,
  },
  subtitle: {
    color: colors.secondary,
    textAlign: "center",
    marginBottom: spacing.sm,
  },

  illustration: {
    width: "100%",
    height: 250,
    marginTop: spacing.md,
  },
});