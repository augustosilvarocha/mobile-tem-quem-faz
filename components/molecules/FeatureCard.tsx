import { StyleSheet, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { AppText } from "@/components/atoms/AppText";
import { colors, radius, spacing } from "@/theme";

type FeatureCardProps = {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  description: string;
};

export function FeatureCard({ icon, title, description }: FeatureCardProps) {
  return (
    <View style={styles.container}>
      <View style={styles.iconCircle}>
        <Ionicons name={icon} size={32} color={colors.primary} />
      </View>

      <View style={styles.titleArea}>
        <AppText variant="name" style={styles.title} numberOfLines={2}>
          {title}
        </AppText>
      </View>

      <AppText
        variant="profession"
        color={colors.text.secondary}
        style={styles.description}
      >
        {description}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    paddingHorizontal: spacing.xs,
  },

  iconCircle: {
    width: 54,
    height: 54,
    borderRadius: radius.full,
    backgroundColor: colors.background.secondary,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.sm,
  },

  title: {
    textAlign: "center",
    fontSize: 15,
    lineHeight: 19,
  },

  titleArea: {
    minHeight: 38,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 4,
  },

  description: {
    minHeight: 54,
    textAlign: "center",
    fontSize: 13,
    lineHeight: 18,
  },
});
