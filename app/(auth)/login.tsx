import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
} from "react-native";

import { AuthHeader } from "@/components/organisms/AuthHeader";
import { LoginCard } from "@/components/organisms/LoginCard";
import { ProviderRegisterCard } from "@/components/molecules/ProviderRegisterCard";
import { colors, spacing } from "@/theme";

export default function Login() {
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
        <AuthHeader />
        <LoginCard />
        <ProviderRegisterCard />
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
    paddingBottom: spacing.xl ?? spacing.lg,
  },
});