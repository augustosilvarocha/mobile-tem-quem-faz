import type { ReactNode } from "react";
import {
  Pressable,
  StyleSheet,
  View,
  type StyleProp,
  type TextStyle,
  type ViewStyle,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";

import { AppText } from "@/components/atoms/AppText";
import { colors, spacing } from "@/theme";

type ScreenHeaderProps = {
  onBackPress?: () => void;
  right?: ReactNode;
  style?: StyleProp<ViewStyle>;
  subtitle?: string;
  title: string;
  titleStyle?: StyleProp<TextStyle>;
};

export function ScreenHeader({
  onBackPress = () => router.back(),
  right,
  style,
  subtitle,
  title,
  titleStyle,
}: ScreenHeaderProps) {
  return (
    <View style={[styles.container, style]}>
      <Pressable
        accessibilityLabel="Voltar"
        accessibilityRole="button"
        hitSlop={8}
        onPress={onBackPress}
        style={styles.backButton}
      >
        <Ionicons name="chevron-back" size={28} color={colors.text.primary} />
      </Pressable>

      <View style={styles.textContainer}>
        <AppText
          numberOfLines={1}
          style={[styles.title, titleStyle]}
          variant="title"
        >
          {title}
        </AppText>

        {subtitle ? (
          <AppText color={colors.text.secondary} numberOfLines={2}>
            {subtitle}
          </AppText>
        ) : null}
      </View>

      {right ? <View style={styles.right}>{right}</View> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },

  backButton: {
    width: 28,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
  },

  textContainer: {
    flex: 1,
  },

  title: {
    color: colors.text.primary,
    fontSize: 24,
    fontWeight: "700",
    lineHeight: 28,
  },

  right: {
    marginLeft: spacing.sm,
  },
});
