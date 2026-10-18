import { MaterialCommunityIcons } from "@expo/vector-icons";

import { colors } from "@/theme";
import { getCategoryIconName } from "@/utils/categoryIcons";

type CategoryIconProps = {
  categoryName: string;
  size?: number;
  color?: string;
};

export function CategoryIcon({
  categoryName,
  size = 20,
  color = colors.primary,
}: CategoryIconProps) {
  return (
    <MaterialCommunityIcons
      name={getCategoryIconName(categoryName)}
      size={size}
      color={color}
      accessible={false}
      importantForAccessibility="no"
    />
  );
}
