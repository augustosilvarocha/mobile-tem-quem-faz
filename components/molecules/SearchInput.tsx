import { Ionicons } from "@expo/vector-icons";
import {
  Pressable,
  StyleSheet,
  TextInput,
  type StyleProp,
  type TextInputProps,
  type TextStyle,
  type ViewStyle,
  View,
} from "react-native";

import { colors, radius, spacing, typography } from "@/theme";

type SearchInputProps = Omit<TextInputProps, "style"> & {
  containerStyle?: StyleProp<ViewStyle>;
  iconColor?: string;
  iconName?: keyof typeof Ionicons.glyphMap;
  iconSize?: number;
  inputStyle?: StyleProp<TextStyle>;
  actionAccessibilityLabel?: string;
  actionDisabled?: boolean;
  actionIconName?: keyof typeof Ionicons.glyphMap;
  onPressAction?: () => void;
};

export function SearchInput({
  actionAccessibilityLabel = "Pesquisar",
  actionDisabled = false,
  actionIconName = "arrow-forward",
  containerStyle,
  iconColor = colors.text.secondary,
  iconName = "search",
  iconSize = 20,
  inputStyle,
  onPressAction,
  placeholderTextColor = colors.text.secondary,
  ...inputProps
}: SearchInputProps) {
  const showAction = Boolean(onPressAction);

  return (
    <View style={[styles.container, containerStyle]}>
      <Ionicons name={iconName} size={iconSize} color={iconColor} />

      <TextInput
        placeholderTextColor={placeholderTextColor}
        style={[styles.input, inputStyle]}
        {...inputProps}
      />

      {showAction ? (
        <Pressable
          accessibilityLabel={actionAccessibilityLabel}
          accessibilityRole="button"
          disabled={actionDisabled}
          hitSlop={8}
          onPress={onPressAction}
          style={({ pressed }) => [
            styles.actionButton,
            actionDisabled && styles.actionButtonDisabled,
            pressed && styles.actionButtonPressed,
          ]}
        >
          <Ionicons name={actionIconName} size={20} color={colors.white} />
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 54,
    backgroundColor: colors.white,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: spacing.sm,
    gap: spacing.sm,
  },

  input: {
    flex: 1,
    height: "100%",
    ...typography.field,
    color: colors.text.primary,
    paddingVertical: 0,
    textAlignVertical: "center",
  },

  actionButton: {
    width: 42,
    height: 42,
    borderRadius: radius.sm,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.primary,
  },

  actionButtonDisabled: {
    backgroundColor: colors.border,
  },

  actionButtonPressed: {
    opacity: 0.8,
  },
});
