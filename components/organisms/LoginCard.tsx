import { useState } from "react";
import { Pressable, StyleSheet, TextInput, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { AppText } from "@/components/atoms/AppText";
import { colors, radius, spacing, typography } from "@/theme";
import { router } from "expo-router";

export function LoginCard() {
  const [phone, setPhone] = useState("");
  const [error, setError] = useState("");

  function handleSubmit() {
    if (phone.length !== 11) {
      setError("Número de telefone inválido");
      return;
    }

    setError("");
    router.push("/(auth)/verification");
  }

  return (
    <View style={styles.card}>
      <AppText variant="subtitle" style={styles.title}>
        Entrar com WhatsApp
      </AppText>

      <AppText
        variant="field"
        color={colors.text.secondary}
        style={styles.description}
      >
        Informe o número do seu WhatsApp para{"\n"}
        receber um código de verificação.
      </AppText>

      <View style={styles.inputBox}>
        <Ionicons name="logo-whatsapp" size={32} color={colors.primary} />

        <AppText variant="field" style={styles.ddi}>
          +55
        </AppText>

        <View style={styles.inputDivider} />

        <TextInput
          value={phone}
          onChangeText={(text) => {
            setPhone(text.replace(/\D/g, ""));
            setError("");
          }}
          keyboardType="number-pad"
          maxLength={11}
          placeholder="99999999999"
          placeholderTextColor={colors.text.placeholder}
          style={styles.input}
        />
      </View>
      {error ? (
        <AppText variant="profession" color={colors.danger} style={styles.errorText}>
          {error}
        </AppText>
      ) : null}

      <Pressable style={styles.button} onPress={handleSubmit}>
        <AppText variant="button" color={colors.white} style={styles.buttonText}>
          Enviar código
        </AppText>

        <Ionicons name="arrow-forward" size={30} color={colors.white} />
      </Pressable>

      <View style={styles.infoBox}>
        <Ionicons name="lock-closed" size={18} color={colors.primary} />

        <AppText
          variant="profession"
          color={colors.text.secondary}
          style={styles.info}
        >
          Enviaremos um código de verificação{"\n"}
          no seu WhatsApp para confirmar.
        </AppText>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.white,
    borderRadius: radius.xl,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },

  title: {
    textAlign: "center",
    color: colors.text.primary,
    marginBottom: spacing.sm,
  },

  description: {
    textAlign: "center",
    marginBottom: spacing.md,
  },

  inputBox: {
    height: 58,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: spacing.md,
    marginBottom: spacing.md,
  },

  ddi: {
    marginLeft: spacing.sm,
    marginRight: spacing.sm,
    color: colors.text.primary,
  },

  inputDivider: {
    width: 1,
    height: 32,
    backgroundColor: colors.border,
    marginRight: spacing.sm,
  },

  input: {
    flex: 1,
    ...typography.field,
    color: colors.text.primary,
  },

  button: {
    height: 58,
    borderRadius: radius.md,
    backgroundColor: colors.primary,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.md,
  },

  buttonText: {
    fontSize: 20,
  },

  infoBox: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: spacing.md,
    gap: spacing.sm,
  },

  info: {
    textAlign: "center",
  },
  errorText: {
    marginTop: -spacing.sm,
    marginBottom: spacing.sm,
    textAlign: "center",
  },
});