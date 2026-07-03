import { Text, TextProps } from "react-native";
import { colors, typography } from "@/theme";

type AppTextProps = TextProps & {
  variant?: keyof typeof typography;
  color?: string;
};

export function AppText({
  variant = "field",
  color = colors.text.primary,
  style,
  children,
  ...props
}: AppTextProps) {
  return (
    <Text
      style={[
        typography[variant],
        {
          color,
        },
        style,
      ]}
      {...props}
    >
      {children}
    </Text>
  );
}