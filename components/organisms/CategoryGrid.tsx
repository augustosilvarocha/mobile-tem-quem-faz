import { StyleSheet, View } from "react-native";

import { CategoryCard } from "@/components/molecules/CategoryCard";
import type { Category } from "@/services/category.service";
import { spacing } from "@/theme";

type CategoryGridProps = {
  categories: Category[];
  onPressCategory?: (category: Category) => void;
  onPressMore?: () => void;
};

export function CategoryGrid({
  categories,
  onPressCategory,
  onPressMore,
}: CategoryGridProps) {
  return (
    <View style={styles.grid}>
      {categories.slice(0, 5).map((category) => (
        <CategoryCard
          key={category.id}
          title={category.name}
          image={category.image}
          onPress={() => onPressCategory?.(category)}
        />
      ))}

      <CategoryCard title="Ver mais" isMore onPress={onPressMore} />
    </View>
  );
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    rowGap: spacing.md,
  },
});
