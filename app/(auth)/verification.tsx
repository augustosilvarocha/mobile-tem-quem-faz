import { StyleSheet, View } from "react-native";

import { VerificationHeader } from "@/components/organisms/VerificationHeader";
import { VerificationCard } from "@/components/organisms/VerificationCard";
import { colors, spacing } from "@/theme";

export default function Verification() {
  return (
    <View style={styles.container}>
      <VerificationHeader />

      <VerificationCard />
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