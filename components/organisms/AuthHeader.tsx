import { Image, Pressable, StyleSheet, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";

import { AppText } from "@/components/atoms/AppText";
import { colors, spacing } from "@/theme";

type AuthHeaderProps = {
  compact?: boolean;
};

export function AuthHeader({ compact = false }: AuthHeaderProps) {
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
        Login do{" "}
        <AppText variant="title" color={colors.primary}>
          prestador
        </AppText>
      </AppText>

      {!compact ? (
        <>
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

  providerImage: {
    width: "75%",
    height: 230,
    marginTop: spacing.sm,
  },
});
