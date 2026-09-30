import { useEffect, useRef, useState } from "react";
import { Alert, Pressable, StyleSheet, TextInput, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";

import { AppText } from "@/components/atoms/AppText";
import { colors, radius, spacing } from "@/theme";
import { requestOtp, verifyOtp } from "@/services/auth.service";
import { createProvider, CreateProviderPayload } from "@/services/provider.service";
import { saveProviderId, saveProviderName, saveTokens } from "@/utils/authStorage";

const CODE_LENGTH = 6;
const CODE_EXPIRATION_SECONDS = 5 * 60;

type VerificationCardProps = {
  onCodeFocus?: () => void;
  phone: string;
  registrationData?: CreateProviderPayload;
};

export function VerificationCard({
  onCodeFocus,
  phone,
  registrationData,
}: VerificationCardProps) {
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [remainingSeconds, setRemainingSeconds] = useState(
    CODE_EXPIRATION_SECONDS
  );

  const inputRef = useRef<TextInput>(null);

  useEffect(() => {
    if (remainingSeconds <= 0) {
      return;
    }

    const timeout = setTimeout(() => {
      setRemainingSeconds((current) => Math.max(0, current - 1));
    }, 1000);

    return () => clearTimeout(timeout);
  }, [remainingSeconds]);

  const formattedRemainingTime = `${Math.floor(remainingSeconds / 60)
    .toString()
    .padStart(2, "0")}:${(remainingSeconds % 60)
    .toString()
    .padStart(2, "0")}`;

  function handleCodeChange(value: string) {
    const onlyNumbers = value.replace(/\D/g, "").slice(0, CODE_LENGTH);

    setCode(onlyNumbers);
    setError("");
  }

  async function handleConfirm() {
    if (remainingSeconds === 0) {
      setError("O código expirou. Peça um novo código.");
      return;
    }

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
      setResending(true);
      await requestOtp(phone);
      setCode("");
      setError("");
      setRemainingSeconds(CODE_EXPIRATION_SECONDS);
      inputRef.current?.focus();
      Alert.alert("Código reenviado", "Um novo código foi enviado para o seu WhatsApp.");
    } catch (err) {
      console.log("Erro ao reenviar código:", err);
      Alert.alert("Erro", "Não foi possível reenviar o código.");
    } finally {
      setResending(false);
    }
  }

  return (
    <View style={styles.card}>
      <AppText variant="name" style={styles.title}>
        Código de verificação
      </AppText>

      <AppText style={styles.instructions} color={colors.text.secondary}>
        Digite ou cole os 6 números enviados para o seu WhatsApp.
      </AppText>

      <Pressable
        accessible={false}
        style={styles.codeContainer}
        onPress={() => inputRef.current?.focus()}
      >
        {Array.from({ length: CODE_LENGTH }).map((_, index) => {
          const digit = code[index];

          return (
            <View
              accessible={false}
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
          accessibilityHint="Você também pode colar o código recebido"
          accessibilityLabel="Código de verificação de 6 dígitos"
          accessibilityValue={{
            text: `${code.length} de ${CODE_LENGTH} dígitos preenchidos`,
          }}
          autoComplete="sms-otp"
          ref={inputRef}
          value={code}
          onChangeText={handleCodeChange}
          keyboardType="number-pad"
          maxLength={CODE_LENGTH}
          onFocus={onCodeFocus}
          onSubmitEditing={handleConfirm}
          style={styles.hiddenInput}
          textContentType="oneTimeCode"
        />
      </Pressable>

      {error ? (
        <AppText
          accessibilityLiveRegion="assertive"
          accessibilityRole="alert"
          variant="profession"
          color={colors.danger}
          style={styles.errorText}
        >
          {error}
        </AppText>
      ) : null}

      <View
        accessibilityLabel={
          remainingSeconds > 0
            ? `O código expira em ${formattedRemainingTime}`
            : "O código expirou"
        }
        accessible
        style={styles.timerBox}
      >
        <Ionicons name="shield-checkmark-outline" size={20} color={colors.primary} />

        <AppText variant="field" color={colors.text.secondary}>
          {remainingSeconds > 0
            ? `O código expira em ${formattedRemainingTime}`
            : "O código expirou"}
        </AppText>
      </View>

      <Pressable
        accessibilityLabel={loading ? "Verificando código" : "Confirmar código"}
        accessibilityRole="button"
        accessibilityState={{ disabled: loading }}
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

      <Pressable
        accessibilityLabel={resending ? "Reenviando código" : "Reenviar código"}
        accessibilityRole="button"
        accessibilityState={{ disabled: resending }}
        disabled={resending}
        style={[styles.resendButton, resending && styles.buttonDisabled]}
        onPress={handleResend}
      >
        <Ionicons name="refresh" size={24} color={colors.primary} />

        <AppText variant="button" color={colors.primary} style={styles.resendText}>
          {resending ? "Reenviando..." : "Reenviar código"}
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
    marginBottom: spacing.xs,
  },

  instructions: {
    marginBottom: spacing.md,
    fontSize: 16,
    lineHeight: 22,
  },

  codeContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: spacing.xs,
    marginBottom: spacing.sm,
  },

  codeBox: {
    flex: 1,
    minWidth: 38,
    maxWidth: 48,
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
    flexWrap: "wrap",
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
