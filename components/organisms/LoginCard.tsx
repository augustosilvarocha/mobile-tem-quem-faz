import { useState } from "react";
import { Pressable, StyleSheet, TextInput, View } from "react-native";
import { FontAwesome, Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";

import { AppText } from "@/components/atoms/AppText";
import { colors, radius, spacing, typography } from "@/theme";
import { sanitizePhone, isValidPhone } from "@/utils/phone";
import { requestOtp } from "@/services/auth.service";

type LoginCardProps = {
  onPhoneFocus?: () => void;
  registering?: boolean;
};

export function LoginCard({ onPhoneFocus, registering = false }: LoginCardProps) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit() {
    if (loading) return;
    if (registering && !name.trim()) {
      setError("Informe seu nome.");
      return;
    }
    if (!isValidPhone(phone)) {
      setError("Número de telefone inválido");
      return;
    }

    setError("");

    try {
      setLoading(true);

      await requestOtp(phone);

      router.push({
        pathname: "/(auth)/verification",
        params: { phone, ...(registering ? { name: name.trim() } : {}) },
      });
    } catch (err: any) {
      console.log("Erro ao solicitar código:", err);
      setError(err.message || "Não foi possível enviar o código.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <View style={styles.card}>
      <AppText variant="subtitle" style={styles.title}>
        {registering ? "Crie sua conta" : "Faça login"}
      </AppText>

      <AppText
        variant="field"
        color={colors.text.secondary}
        style={styles.description}
      >
        Informe o número do seu WhatsApp para{"\n"}
        receber um código de verificação.
      </AppText>

      {registering ? (
        <View style={styles.inputBox}>
          <FontAwesome name="user-o" size={28} color={colors.primary} />
          <TextInput
            accessibilityLabel="Seu nome"
            autoCapitalize="words"
            autoComplete="name"
            editable={!loading}
            maxLength={100}
            onChangeText={(text) => { setName(text); setError(""); }}
            onFocus={onPhoneFocus}
            placeholder="Seu nome"
            placeholderTextColor={colors.text.placeholder}
            style={[styles.input, styles.nameInput]}
            textContentType="name"
            value={name}
          />
        </View>
      ) : null}

      <View style={styles.inputBox}>
        <Ionicons name="logo-whatsapp" size={32} color={colors.primary} />

        <AppText variant="field" style={styles.ddi}>
          +55
        </AppText>

        <View style={styles.inputDivider} />

        <TextInput
          value={phone}
          onFocus={onPhoneFocus}
          onChangeText={(text) => {
            setPhone(sanitizePhone(text));
            setError("");
          }}
          keyboardType="number-pad"
          maxLength={11}
          placeholder="84999999999"
          placeholderTextColor={colors.text.placeholder}
          style={styles.input}
        />
      </View>

      {error ? (
        <AppText variant="profession" color={colors.danger} style={styles.errorText}>
          {error}
        </AppText>
      ) : null}

      <Pressable
        style={[styles.button, loading && styles.buttonDisabled]}
        onPress={handleSubmit}
        disabled={loading}
      >
        <AppText variant="button" color={colors.white} style={styles.buttonText}>
          {loading ? "Enviando..." : "Enviar código"}
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
  nameInput: { marginLeft: spacing.sm },
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
    height: 64,
    borderRadius: radius.md,
    backgroundColor: colors.primary,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.md,
  },

  buttonDisabled: {
    opacity: 0.6,
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
