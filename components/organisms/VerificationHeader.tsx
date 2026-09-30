import { Image, Pressable, StyleSheet, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";

import { AppText } from "@/components/atoms/AppText";
import { colors, spacing } from "@/theme";

type VerificationHeaderProps = {
  compact?: boolean;
};

export function VerificationHeader({ compact = false }: VerificationHeaderProps) {
  return (
    <View style={[styles.container, compact && styles.compactContainer]}>
      <Pressable
        hitSlop={8}
        style={styles.backButton}
        onPress={() => router.back()}
      >
        <Ionicons name="arrow-back" size={30} color={colors.primary} />
      </Pressable>

      {!compact ? (
        <Image
          source={require("../../assets/images/logo.png")}
          style={styles.logo}
          resizeMode="contain"
        />
      ) : null}

      <AppText
        variant="title"
        style={[styles.title, compact && styles.compactTitle]}
      >
        Verifique seu{" "}
        <AppText variant="title" color={colors.primary}>
          WhatsApp
        </AppText>
      </AppText>

      {!compact ? (
        <>
          <AppText
            variant="field"
            color={colors.text.secondary}
            style={styles.description}
          >
            Enviamos um código de verificação{"\n"}
            para o número informado.
          </AppText>

          <Image
            source={require("../../assets/images/verification-banner.png")}
            style={styles.verificationImage}
            resizeMode="contain"
          />
        </>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    position: "relative",
  },

  compactContainer: {
    minHeight: 60,
    justifyContent: "center",
  },

  backButton: {
    position: "absolute",
    left: 0,
    zIndex: 10,
    width: 30,
    height: 48,
    alignItems: "center",
    justifyContent: "center",
  },

  logo: {
    width: 190,
    height: 145,
    marginTop: spacing.lg,
  },

  title: {
    color: colors.secondary,
    textAlign: "center",
    marginTop: -spacing.sm,
  },

  compactTitle: {
    marginTop: 0,
    paddingHorizontal: 48,
  },

  description: {
    textAlign: "center",
    marginTop: spacing.sm,
  },

  verificationImage: {
    width: "70%",
    height: 170,
    marginTop: spacing.md,
  },
});
