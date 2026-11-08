import { Pressable, StyleSheet, View } from "react-native";

import { AppText } from "@/components/atoms/AppText";
import { colors, spacing } from "@/theme";

type SectionProps = {
  title: string;
  actionText?: string;
  onPressAction?: () => void;
};

export function Section({ title, actionText, onPressAction }: SectionProps) {
  return (
    <View style={styles.container}>
      <AppText variant="subtitle" style={styles.title}>
        {title}
      </AppText>

      {actionText ? (
        <Pressable style={styles.actionButton} onPress={onPressAction}>
          <AppText variant="buttonSmall" style={styles.action}>
            {actionText}
          </AppText>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  title: {
    flex: 1,
    fontWeight: "800",
    color: colors.primary,
  },

  action: {
    fontWeight: "700",
    color: colors.primary,
  },

  actionButton: {
    flexShrink: 0,
    minHeight: 44,
    paddingHorizontal: spacing.sm,
    alignItems: "center",
    justifyContent: "center",
  },
});
