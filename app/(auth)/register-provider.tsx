import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import { useRef, useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";

import { AppText } from "@/components/atoms/AppText";
import {
  ProviderProfileForm,
  ProviderRegistrationStep,
} from "@/components/organisms/ProviderProfileForm";
import { requestOtp } from "@/services/auth.service";
import { CreateProviderPayload } from "@/services/provider.service";
import { colors, spacing } from "@/theme";

export default function ProviderRegister() {
  const [registrationStep, setRegistrationStep] =
    useState<ProviderRegistrationStep>(1);
  const scrollRef = useRef<ScrollView>(null);

  function handleRegistrationStepChange(step: ProviderRegistrationStep) {
    setRegistrationStep(step);
    setTimeout(() => scrollRef.current?.scrollTo({ y: 0, animated: true }), 0);
  }

  function handleBack() {
    if (registrationStep === 2) {
      handleRegistrationStepChange(1);
      return;
    }

    router.back();
  }

  async function handleRegisterProvider(payload: CreateProviderPayload) {
    try {
      await requestOtp(payload.phone);

      router.push({
        pathname: "/(auth)/verification",
        params: {
          phone: payload.phone,
          registration: JSON.stringify(payload),
        },
      });
    } catch (err: any) {
      console.log("Erro ao solicitar código:", err);
      Alert.alert(
        "Erro",
        err.message || "Não foi possível enviar o código de verificação."
      );
    }
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
    >
      <ScrollView
        ref={scrollRef}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Pressable
          accessibilityLabel={registrationStep === 2 ? "Voltar para os dados obrigatórios" : "Voltar"}
          accessibilityRole="button"
          style={styles.backButton}
          onPress={handleBack}
        >
          <Ionicons name="arrow-back" size={28} color={colors.text.primary} />
        </Pressable>

        <View style={styles.header}>
          <AppText variant="title" style={styles.registrationTitle}>
            Cadastro de prestador
          </AppText>

          <View
            accessibilityLabel={`Etapa ${registrationStep} de 2`}
            accessibilityRole="progressbar"
            accessibilityValue={{ min: 1, max: 2, now: registrationStep }}
            style={styles.progressInfo}
          >
            <View style={styles.progressTrack}>
              <View style={[styles.progressSegment, styles.progressSegmentActive]} />
              <View
                style={[
                  styles.progressSegment,
                  registrationStep === 2 && styles.progressSegmentActive,
                ]}
              />
            </View>

            <AppText style={styles.stepText} color={colors.text.secondary}>
              Etapa {registrationStep} de 2
            </AppText>
          </View>

          <AppText variant="subtitle" style={styles.title}>
            {registrationStep === 1
              ? "Dados obrigatórios"
              : "Endereço e localização"}
          </AppText>

          {registrationStep === 2 ? (
            <AppText style={styles.optionalText} color={colors.text.secondary}>
              Todos os dados desta etapa são opcionais. Você pode preencher somente o que souber ou pular esta etapa.
            </AppText>
          ) : null}
        </View>

        <ProviderProfileForm
          mode="registration"
          registrationStep={registrationStep}
          onRegistrationStepChange={handleRegistrationStepChange}
          submitLabel="Continuar para verificação"
          submittingLabel="Cadastrando..."
          onSubmit={handleRegisterProvider}
        />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },

  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: spacing.screen,
    paddingBottom: spacing.xl,
  },

  backButton: {
    marginTop: spacing.lg,
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
  },

  header: {
    alignItems: "flex-start",
    marginTop: spacing.sm,
    marginBottom: spacing.lg,
  },

  registrationTitle: {
    color: colors.text.primary,
    fontSize: 26,
    lineHeight: 32,
  },

  progressInfo: {
    width: "100%",
    marginTop: spacing.md,
  },

  progressTrack: {
    width: "100%",
    flexDirection: "row",
    gap: spacing.sm,
  },

  progressSegment: {
    flex: 1,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.border,
  },

  progressSegmentActive: {
    backgroundColor: colors.primary,
  },

  title: {
    color: colors.text.primary,
    marginTop: spacing.md,
  },

  optionalText: {
    marginTop: spacing.xs,
    fontSize: 16,
    lineHeight: 22,
  },

  stepText: {
    marginTop: spacing.sm,
    fontWeight: "700",
  },
});
