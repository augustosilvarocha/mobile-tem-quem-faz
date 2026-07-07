import { StyleSheet, View } from "react-native";
import { useLocalSearchParams } from "expo-router";

import { VerificationHeader } from "@/components/organisms/VerificationHeader";
import { VerificationCard } from "@/components/organisms/VerificationCard";
import { colors, spacing } from "@/theme";
import { CreateProviderPayload } from "@/services/provider.service";

export default function Verification() {
  const { phone, registration } = useLocalSearchParams<{
    phone: string;
    registration?: string;
  }>();

  let registrationData: CreateProviderPayload | undefined;

  if (registration) {
    try {
      registrationData = JSON.parse(registration);
    } catch (err) {
      console.log("Erro ao ler dados de cadastro:", err);
    }
  }

  return (
    <View style={styles.container}>
      <VerificationHeader />

      <VerificationCard phone={phone} registrationData={registrationData} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.background.primary,
  },
});