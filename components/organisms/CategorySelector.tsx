import { useMemo, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { AppText } from "@/components/atoms/AppText";
import { SearchInput } from "@/components/molecules/SearchInput";
import { useCategories } from "@/hooks/useCategories";
import { colors, radius, spacing, typography } from "@/theme";

type CategorySelectorProps = {
  selectedCategories: number[];
  onChange: (categories: number[]) => void;
};

export function CategorySelector({
  selectedCategories,
  onChange,
}: CategorySelectorProps) {
  const { categories, loading, error } = useCategories();
  const [search, setSearch] = useState("");

  const filteredCategories = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    return categories
      .filter((category) => {
        if (!normalizedSearch) {
          return true;
        }

        return category.name.toLowerCase().includes(normalizedSearch);
      })
      .slice(0, 6);
  }, [categories, search]);

  function toggleCategory(categoryId: number) {
    const isSelected = selectedCategories.includes(categoryId);

    if (isSelected) {
      onChange(selectedCategories.filter((id) => id !== categoryId));
      return;
    }

    onChange([...selectedCategories, categoryId]);
  }

  return (
    <View style={styles.container}>
      <AppText variant="subtitle" style={styles.title}>
        Categoria de serviço
      </AppText>

      <AppText
        variant="field"
        color={colors.text.secondary}
        style={styles.subtitle}
      >
        Selecione uma ou mais categorias
      </AppText>

      <SearchInput
        value={search}
        onChangeText={setSearch}
        placeholder="Buscar categoria"
        placeholderTextColor={colors.text.placeholder}
        iconName="search-outline"
        iconSize={22}
        containerStyle={styles.searchBox}
        inputStyle={styles.searchInput}
      />

      {loading && (
        <View style={styles.feedback}>
          <ActivityIndicator color={colors.primary} />
          <AppText variant="field" color={colors.text.secondary}>
            Carregando categorias...
          </AppText>
        </View>
      )}

      {!loading && error && (
        <AppText variant="field" color={colors.text.secondary}>
          {error}
        </AppText>
      )}

      {!loading && !error && (
        <View style={styles.grid}>
          {filteredCategories.map((category) => {
            const isSelected = selectedCategories.includes(category.id);

            return (
              <Pressable
                key={category.id}
                style={styles.categoryItem}
                onPress={() => toggleCategory(category.id)}
              >
                <Ionicons
                  name={isSelected ? "checkbox" : "square-outline"}
                  size={24}
                  color={isSelected ? colors.primary : colors.text.primary}
                />

                <Ionicons name="construct" size={22} color={colors.primary} />

                <AppText variant="field" style={styles.categoryText}>
                  {category.name}
                </AppText>
              </Pressable>
            );
          })}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: spacing.md,
  },

  title: {
    color: colors.text.primary,
    marginBottom: 2,
  },

  subtitle: {
    marginBottom: spacing.sm,
  },

  searchBox: {
    height: 54,
    paddingHorizontal: spacing.md,
    marginBottom: spacing.sm,
  },

  searchInput: {
    ...typography.field,
  },

  feedback: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    marginTop: spacing.xs,
  },

  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    rowGap: spacing.sm,
  },

  categoryItem: {
    width: "48%",
    minHeight: 62,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    backgroundColor: colors.white,
    paddingHorizontal: spacing.sm,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
  },

  categoryText: {
    flex: 1,
    color: colors.text.primary,
  },
});
