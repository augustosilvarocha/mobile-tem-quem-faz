import { Image, Pressable, StyleSheet, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";

import { AppText } from "@/components/atoms/AppText";
import { colors, spacing } from "@/theme";

export function VerificationHeader() {
  return (
    <View style={styles.container}>
      <Pressable
        hitSlop={8}
        style={styles.backButton}
        onPress={() => router.back()}
      >
        <Ionicons name="arrow-back" size={30} color={colors.primary} />
      </Pressable>

      <Image
        source={require("../../assets/images/logo.png")}
        style={styles.logo}
        resizeMode="contain"
      />

      <AppText variant="title" style={styles.title}>
        Verifique seu{" "}
        <AppText variant="title" color={colors.primary}>
          WhatsApp
        </AppText>
      </AppText>

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
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    position: "relative",
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
