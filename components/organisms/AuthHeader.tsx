import { Image, Pressable, StyleSheet, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";

import { AppText } from "@/components/atoms/AppText";
import { colors, spacing } from "@/theme";

export function AuthHeader() {
  return (
    <View style={styles.container}>
      <Pressable style={styles.backButton} onPress={() => router.back()}>
        <Ionicons name="arrow-back" size={30} color={colors.primary} />
      </Pressable>

      <Image
        source={require("../../assets/images/logo.png")}
        style={styles.logo}
        resizeMode="contain"
      />

      <AppText variant="title" style={styles.title}>
        Login do{" "}
        <AppText variant="title" color={colors.primary}>
          prestador
        </AppText>
      </AppText>

      <AppText
        variant="field"
        color={colors.text.secondary}
        style={styles.description}
      >
        Entre para gerenciar seus serviços,{"\n"}
        atendimentos e seu perfil.
      </AppText>

      <Image
        source={require("../../assets/images/provider-login.png")}
        style={styles.providerImage}
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

  providerImage: {
    width: "75%",
    height: 230,
    marginTop: spacing.sm,
  },
});