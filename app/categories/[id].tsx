import { useMemo, useState } from "react";
import {
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import { router, useLocalSearchParams } from "expo-router";

import { AppText } from "@/components/atoms/AppText";
import { ProviderCard } from "@/components/molecules/ProviderCard";
import { ScreenHeader } from "@/components/molecules/ScreenHeader";
import { SearchInput } from "@/components/molecules/SearchInput";
import { useCategories } from "@/hooks/useCategories";
import { useProviders } from "@/hooks/useProviders";
import { colors, spacing } from "@/theme";

export default function CategoryProvidersScreen() {
  const { id, name } = useLocalSearchParams<{
    id: string;
    name?: string;
  }>();

  const [search, setSearch] = useState("");
  const {
    categories,
    loading: loadingCategories,
    error: categoriesError,
  } = useCategories();

  const selectedCategory = useMemo(
    () => categories.find((category) => category.id.toString() === id),
    [categories, id]
  );
  const categoryName = name?.trim() || selectedCategory?.name || "";
  const {
    providers,
    loading: loadingProviders,
    error: providersError,
  } = useProviders({
    category: categoryName,
    enabled: Boolean(categoryName),
  });

  const filteredProviders = useMemo(() => {
    const text = search.trim().toLowerCase();

    if (!text) {
      return providers;
    }

    return providers.filter((provider) =>
      provider.name.toLowerCase().includes(text)
    );
  }, [providers, search]);

  const isResolvingCategory = !categoryName && loadingCategories;
  const isLoading = isResolvingCategory || loadingProviders;
  const error = (!categoryName ? categoriesError : null) || providersError;
  const title = categoryName || (loadingCategories ? "Carregando..." : "Categoria");
  const emptyMessage =
    providers.length === 0
      ? "Não existem prestadores desse serviço cadastrados no nosso aplicativo."
      : "Nenhum prestador encontrado.";

  return (
    <View style={styles.container}>
      <ScreenHeader title={title} style={styles.header} />

      <SearchInput
        value={search}
        onChangeText={setSearch}
        placeholder="Buscar prestador"
        containerStyle={styles.searchContainer}
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        {isLoading ? (
          <View style={styles.emptyContainer}>
            <AppText style={styles.emptyText}>Carregando prestadores...</AppText>
          </View>
        ) : error ? (
          <View style={styles.emptyContainer}>
            <AppText style={styles.emptyText}>{error}</AppText>
          </View>
        ) : filteredProviders.length === 0 ? (
          <View style={styles.emptyContainer}>
            <AppText style={styles.emptyText}>{emptyMessage}</AppText>
          </View>
        ) : (
          filteredProviders.map((provider) => (
            <ProviderCard
              key={provider.id}
              name={provider.name}
              category={provider.category}
              city={provider.city}
              photo={provider.photo}
              onPress={() =>
                router.push({
                  pathname: "/providers/[id]",
                  params: {
                    id: provider.id.toString(),
                  },
                })
              }
            />
          ))
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
    paddingHorizontal: spacing.screen,
    paddingTop: spacing.md,
  },

  header: {
    marginBottom: spacing.md,
  },

  searchContainer: {
    marginBottom: spacing.md,
  },

  content: {
    paddingBottom: spacing.xl,
  },

  emptyContainer: {
    paddingTop: spacing.xl,
    alignItems: "center",
  },

  emptyText: {
    color: colors.text.secondary,
    textAlign: "center",
  },
});
