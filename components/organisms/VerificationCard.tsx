import { useRef, useState } from "react";
import {
  Pressable,
  StyleSheet,
  TextInput,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { AppText } from "@/components/atoms/AppText";
import { colors, radius, spacing, typography } from "@/theme";

const CODE_LENGTH = 6;

export function VerificationCard() {
  const [code, setCode] = useState("");
  const [error, setError] = useState("");

  const inputRef = useRef<TextInput>(null);

  function handleCodeChange(value: string) {
    const onlyNumbers = value.replace(/\D/g, "").slice(0, CODE_LENGTH);

    setCode(onlyNumbers);
    setError("");
  }

  function handleConfirm() {
    if (code.length !== CODE_LENGTH) {
      setError("Digite o código de 6 dígitos.");
      return;
    }

    setError("");

    // TODO: chamar API para validar código
    console.log("Código informado:", code);
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

      <Pressable style={styles.button} onPress={handleConfirm}>
        <AppText variant="button" color={colors.white} style={styles.buttonText}>
          Confirmar código
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

      <Pressable style={styles.resendButton}>
        <Ionicons name="refresh" size={24} color={colors.primary} />

        <AppText variant="button" color={colors.primary} style={styles.resendText}>
          Reenviar código
        </AppText>

        <AppText variant="field" color={colors.text.secondary}>
          (00:45)
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
    opacity: 0,
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
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
  },

  resendText: {
    fontSize: 18,
  },
});