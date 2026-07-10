import { useRef, useState } from "react";
import { Alert, Pressable, StyleSheet, TextInput, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";

import { AppText } from "@/components/atoms/AppText";
import { colors, radius, spacing } from "@/theme";
import { requestOtp, verifyOtp } from "@/services/auth.service";
import { createProvider, CreateProviderPayload } from "@/services/provider.service";
import { saveProviderId, saveProviderName, saveTokens } from "@/utils/authStorage";

const CODE_LENGTH = 6;

type VerificationCardProps = {
  phone: string;
  registrationData?: CreateProviderPayload;
};

export function VerificationCard({ phone, registrationData }: VerificationCardProps) {
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const inputRef = useRef<TextInput>(null);

  function handleCodeChange(value: string) {
    const onlyNumbers = value.replace(/\D/g, "").slice(0, CODE_LENGTH);

    setCode(onlyNumbers);
    setError("");
  }

  async function handleConfirm() {
    if (code.length !== CODE_LENGTH) {
      setError("Digite o código de 6 dígitos.");
      return;
    }

    setError("");

    try {
      setLoading(true);

      const result = await verifyOtp(phone, code);

      if (result.account_exists) {
        if (result.access && result.refresh) {
          await saveTokens(result.access, result.refresh);
        }

        await saveProviderName(result.provider_name ?? "");
        if (result.provider_id) {
          await saveProviderId(result.provider_id);
        }

        router.replace("/home");
        return;
      }

      if (!registrationData) {
        setError("Conta de prestador não encontrada. Realize o cadastro.");
        return;
      }

      const provider = await createProvider(registrationData);

      if (provider.access && provider.refresh) {
        await saveTokens(provider.access, provider.refresh);
      }

      await saveProviderName(provider.name);
      await saveProviderId(provider.id);

      router.replace("/home");
    } catch (err: any) {
      console.log("Erro ao verificar código:", err);
      setError(err.message || "Código inválido ou expirado.");
    } finally {
      setLoading(false);
    }
  }

  async function handleResend() {
    try {
      await requestOtp(phone);
      Alert.alert("Código reenviado", "Um novo código foi enviado para o seu WhatsApp.");
    } catch (err) {
      console.log("Erro ao reenviar código:", err);
      Alert.alert("Erro", "Não foi possível reenviar o código.");
    }
  }

  return (
    <View style={styles.card}>
      <AppText variant="name" style={styles.title}>
        Código de verificação
      </AppText>

      <Pressable
        style={styles.codeContainer}
        onPress={() => inputRef.current?.focus()}
      >
        {Array.from({ length: CODE_LENGTH }).map((_, index) => {
          const digit = code[index];

          return (
            <View
              key={index}
              style={[
                styles.codeBox,
                digit && styles.codeBoxFilled,
                error && styles.codeBoxError,
              ]}
            >
              <AppText variant="subtitle" style={styles.codeText}>
                {digit || ""}
              </AppText>
            </View>
          );
        })}

        <TextInput
          ref={inputRef}
          value={code}
          onChangeText={handleCodeChange}
          keyboardType="number-pad"
          maxLength={CODE_LENGTH}
          style={styles.hiddenInput}
          autoFocus
        />
      </Pressable>

      {error ? (
        <AppText
          variant="profession"
          color={colors.danger}
          style={styles.errorText}
        >
          {error}
        </AppText>
      ) : null}

      <View style={styles.timerBox}>
        <Ionicons name="shield-checkmark-outline" size={20} color={colors.primary} />

        <AppText variant="field" color={colors.text.secondary}>
          O código expira em{" "}
          <AppText variant="field" color={colors.primary}>
            04:57
          </AppText>
        </AppText>
      </View>

      <Pressable
        style={[styles.button, loading && styles.buttonDisabled]}
        onPress={handleConfirm}
        disabled={loading}
      >
        <AppText variant="button" color={colors.white} style={styles.buttonText}>
          {loading ? "Verificando..." : "Confirmar código"}
        </AppText>

        <Ionicons name="arrow-forward" size={30} color={colors.white} />
      </Pressable>

      <View style={styles.resendBox}>
        <View style={styles.line} />

        <AppText variant="profession" color={colors.text.secondary}>
          Não recebeu o código?
        </AppText>

        <View style={styles.line} />
      </View>

      <Pressable style={styles.resendButton} onPress={handleResend}>
        <Ionicons name="refresh" size={24} color={colors.primary} />

        <AppText variant="button" color={colors.primary} style={styles.resendText}>
          Reenviar código
        </AppText>
      </Pressable>
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
    color: colors.text.primary,
    marginBottom: spacing.md,
  },

  codeContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: spacing.sm,
  },

  codeBox: {
    width: 44,
    height: 54,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    alignItems: "center",
    justifyContent: "center",
  },

  codeBoxFilled: {
    borderColor: colors.primary,
  },

  codeBoxError: {
    borderColor: colors.danger,
  },

  codeText: {
    color: colors.text.primary,
  },

  hiddenInput: {
    position: "absolute",
    width: "100%",
    height: 54,
    opacity: 0.01,
    color: "transparent",
  },

  errorText: {
    textAlign: "center",
    marginBottom: spacing.sm,
  },

  timerBox: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: spacing.xs,
    marginBottom: spacing.md,
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

  resendBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  },

  line: {
    flex: 1,
    height: 1,
    backgroundColor: colors.border,
  },

  resendButton: {
    minHeight: 48,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
  },

  resendText: {
    fontSize: 18,
  },
});
