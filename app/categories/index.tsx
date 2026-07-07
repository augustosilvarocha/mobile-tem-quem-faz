import { useMemo, useState } from "react";
import {
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import { router } from "expo-router";

import { AppText } from "@/components/atoms/AppText";
import { CategoryCard } from "@/components/molecules/CategoryCard";
import { SearchInput } from "@/components/molecules/SearchInput";
import { useCategories } from "@/hooks/useCategories";
import { colors, spacing } from "@/theme";

export default function CategoriesScreen() {
  const [search, setSearch] = useState("");

  const { categories, loading, error } = useCategories();

  const filteredCategories = useMemo(() => {
    const text = search.trim().toLowerCase();

    if (!text) {
      return categories;
    }

    return categories.filter((category) =>
      category.name.toLowerCase().includes(text)
    );
  }, [categories, search]);

  return (
    <View style={styles.container}>
      <AppText style={styles.title}>Categorias</AppText>

      <SearchInput
        value={search}
        onChangeText={setSearch}
        placeholder="Buscar categoria"
        containerStyle={styles.searchContainer}
      />

      {loading ? (
        <View style={styles.center}>
          <AppText>Carregando categorias...</AppText>
        </View>
      ) : error ? (
        <View style={styles.center}>
          <AppText>{error}</AppText>
        </View>
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.content}
        >
          <View style={styles.grid}>
            {filteredCategories.map((category) => (
              <CategoryCard
                key={category.id}
                title={category.name}
                image={category.image}
                onPress={() =>
                  router.push({
                    pathname: "/categories/[id]",
                    params: {
                      id: category.id.toString(),
                      name: category.name,
                    },
                  })
                }
              />
            ))}
          </View>
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
  },

  title: {
    fontSize: 22,
    fontWeight: "700",
    marginBottom: spacing.md,
  },

  searchContainer: {
    marginBottom: spacing.lg,
  },

  content: {
    paddingBottom: spacing.xl,
  },

  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    rowGap: spacing.md,
  },

  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
