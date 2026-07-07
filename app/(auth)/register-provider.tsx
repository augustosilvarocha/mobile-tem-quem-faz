import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";

import { AppText } from "@/components/atoms/AppText";
import { ProviderProfileForm } from "@/components/organisms/ProviderProfileForm";
import { requestOtp } from "@/services/auth.service";
import { CreateProviderPayload } from "@/services/provider.service";
import { colors, spacing } from "@/theme";

export default function ProviderRegister() {
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
      console.log("Erro ao solicitar codigo:", err);
      Alert.alert(
        "Erro",
        err.message || "Nao foi possivel enviar o codigo de verificacao."
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
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Pressable style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={28} color={colors.text.primary} />
        </Pressable>

        <View style={styles.header}>
          <AppText variant="title" color={colors.primary}>
            TemQuemFaz
          </AppText>

          <AppText variant="subtitle" style={styles.title}>
            Cadastre seu perfil
          </AppText>

          <AppText variant="profession" color={colors.text.secondary}>
            Encontre clientes perto de voce.
          </AppText>
        </View>

        <ProviderProfileForm
          submitLabel="Cadastrar perfil"
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
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.xl,
  },

  backButton: {
    marginTop: spacing.lg,
  },

  header: {
    alignItems: "center",
    marginBottom: spacing.md,
  },

  title: {
    color: colors.text.primary,
    marginTop: spacing.sm,
  },
});
