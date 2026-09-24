import { useMemo, useState } from "react";
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";

import { AppText } from "@/components/atoms/AppText";
import { ProviderCard } from "@/components/molecules/ProviderCard";
import { ScreenHeader } from "@/components/molecules/ScreenHeader";
import { SearchInput } from "@/components/molecules/SearchInput";
import { SelectField, SelectOption } from "@/components/molecules/SelectField";
import { useCategories } from "@/hooks/useCategories";
import { useCities } from "@/hooks/useCities";
import { ProviderCardData, useProviders } from "@/hooks/useProviders";
import { useStates } from "@/hooks/useStates";
import { colors, radius, spacing } from "@/theme";

function normalizeText(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toLowerCase();
}

function getProviderCategoryNames(provider: ProviderCardData) {
  return provider.categoryNames.length > 0
    ? provider.categoryNames
    : [provider.category];
}

function matchesSelectedFilters(
  provider: ProviderCardData,
  selectedCategory: SelectOption | null,
  selectedCity: SelectOption | null,
  selectedState: SelectOption | null
) {
  if (selectedCategory) {
    const categoryFilter = normalizeText(selectedCategory.label);
    const hasCategory = getProviderCategoryNames(provider).some(
      (category) => normalizeText(category) === categoryFilter
    );

    if (!hasCategory) {
      return false;
    }
  }

  const providerCity = normalizeText(provider.city);

  if (selectedCity && !providerCity.includes(normalizeText(selectedCity.label))) {
    return false;
  }

  if (selectedState && !providerCity.includes(normalizeText(String(selectedState.id)))) {
    return false;
  }

  return true;
}

export default function ProvidersScreen() {
  const { search: searchParam } = useLocalSearchParams<{
    search?: string;
  }>();
  const routeSearch = searchParam?.trim() ?? "";
  const isSearchMode = Boolean(routeSearch);
  const [search, setSearch] = useState(routeSearch);
  const [previousRouteSearch, setPreviousRouteSearch] = useState(routeSearch);
  const [filtersVisible, setFiltersVisible] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<SelectOption | null>(null);
  const [selectedState, setSelectedState] = useState<SelectOption | null>(null);
  const [selectedCity, setSelectedCity] = useState<SelectOption | null>(null);
  const [draftCategory, setDraftCategory] = useState<SelectOption | null>(null);
  const [draftState, setDraftState] = useState<SelectOption | null>(null);
  const [draftCity, setDraftCity] = useState<SelectOption | null>(null);

  const { categories, loading: loadingCategories } = useCategories();
  const { states, loading: loadingStates } = useStates();
  const { cities, loading: loadingCities } = useCities();
  const { providers, loading, error } = useProviders(
    isSearchMode
      ? {
          searchText: routeSearch,
        }
      : {
          category: selectedCategory?.label,
          city: selectedCity?.label,
          uf: selectedState ? String(selectedState.id) : undefined,
        }
  );

  if (routeSearch !== previousRouteSearch) {
    setPreviousRouteSearch(routeSearch);
    setSearch(routeSearch);
  }

  const categoryOptions: SelectOption[] = useMemo(
    () => categories.map((category) => ({ id: category.id, label: category.name })),
    [categories]
  );

  const stateOptions: SelectOption[] = useMemo(
    () => states.map((state) => ({ id: state.uf, label: state.uf })),
    [states]
  );

  const cityOptions: SelectOption[] = useMemo(() => {
    if (!draftState) {
      return [];
    }

    return cities
      .filter((city) => city.uf === draftState.id)
      .map((city) => ({ id: city.id, label: city.name }));
  }, [cities, draftState]);

  const filteredProviders = useMemo(() => {
    if (isSearchMode) {
      return providers.filter((provider) =>
        matchesSelectedFilters(
          provider,
          selectedCategory,
          selectedCity,
          selectedState
        )
      );
    }

    const text = normalizeText(search);

    if (!text) {
      return providers;
    }

    return providers.filter((provider) => {
      const searchableText = normalizeText(
        `${provider.name} ${provider.category} ${provider.city}`
      );

      return searchableText.includes(text);
    });
  }, [
    isSearchMode,
    providers,
    search,
    selectedCategory,
    selectedCity,
    selectedState,
  ]);

  const activeFiltersCount = [
    selectedCategory,
    selectedState,
    selectedCity,
  ].filter(Boolean).length;
  const title = routeSearch ? "Resultados da busca" : "Todos os prestadores";

  function handleOpenFilters() {
    setDraftCategory(selectedCategory);
    setDraftState(selectedState);
    setDraftCity(selectedCity);
    setFiltersVisible(true);
  }

  function handleSelectDraftState(option: SelectOption) {
    setDraftState(option);
    setDraftCity(null);
  }

  function handleApplyFilters() {
    setSelectedCategory(draftCategory);
    setSelectedState(draftState);
    setSelectedCity(draftCity);
    setFiltersVisible(false);
  }

  function handleClearFilters() {
    setDraftCategory(null);
    setDraftState(null);
    setDraftCity(null);
    setSelectedCategory(null);
    setSelectedState(null);
    setSelectedCity(null);
    setFiltersVisible(false);
  }

  function handleSearchSubmit() {
    const query = search.trim();

    if (!query) {
      router.replace("/providers");
      return;
    }

    router.replace({
      pathname: "/providers",
      params: {
        search: query,
      },
    });
  }

  return (
    <View style={styles.container}>
      <ScreenHeader title={title} style={styles.header} />

      <SearchInput
        value={search}
        onChangeText={setSearch}
        onSubmitEditing={isSearchMode ? handleSearchSubmit : undefined}
        placeholder={isSearchMode ? "Buscar servico" : "Buscar prestador"}
        returnKeyType={isSearchMode ? "search" : undefined}
        actionAccessibilityLabel="Pesquisar prestadores"
        onPressAction={isSearchMode ? handleSearchSubmit : undefined}
        containerStyle={styles.searchContainer}
      />

      <View style={styles.resultsRow}>
        <AppText style={styles.resultsText}>
          {filteredProviders.length} resultados encontrados
        </AppText>

        <Pressable style={styles.filterButton} onPress={handleOpenFilters}>
          <Ionicons name="filter" size={16} color={colors.primary} />
          <AppText style={styles.filterText}>
            {activeFiltersCount ? `Filtros (${activeFiltersCount})` : "Filtros"}
          </AppText>
        </Pressable>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        {loading ? (
          <View style={styles.emptyContainer}>
            <AppText style={styles.emptyText}>Carregando prestadores...</AppText>
          </View>
        ) : error ? (
          <View style={styles.emptyContainer}>
            <AppText style={styles.emptyText}>{error}</AppText>
          </View>
        ) : filteredProviders.length === 0 ? (
          <View style={styles.emptyContainer}>
            <AppText style={styles.emptyText}>
              Nenhum prestador encontrado.
            </AppText>
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

      <Modal
        visible={filtersVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setFiltersVisible(false)}
      >
        <Pressable
          style={styles.modalBackdrop}
          onPress={() => setFiltersVisible(false)}
        />

        <View style={styles.filterSheet}>
          <View style={styles.filterHeader}>
            <AppText style={styles.filterTitle}>Filtros</AppText>

            <Pressable style={styles.clearButton} onPress={handleClearFilters}>
              <AppText style={styles.clearText}>Limpar</AppText>
            </Pressable>
          </View>

          <AppText style={styles.fieldLabel}>Categoria</AppText>
          <SelectField
            placeholder="Selecione uma categoria"
            value={draftCategory}
            options={categoryOptions}
            onSelect={setDraftCategory}
            loading={loadingCategories}
            searchPlaceholder="Buscar categoria"
          />

          <AppText style={styles.fieldLabel}>Estado</AppText>
          <SelectField
            placeholder="Selecione um estado"
            value={draftState}
            options={stateOptions}
            onSelect={handleSelectDraftState}
            loading={loadingStates}
            searchPlaceholder="Buscar estado"
          />

          <AppText style={styles.fieldLabel}>Cidade</AppText>
          <SelectField
            placeholder="Selecione uma cidade"
            value={draftCity}
            options={cityOptions}
            onSelect={setDraftCity}
            disabled={!draftState}
            loading={loadingCities}
            searchPlaceholder="Buscar cidade"
          />

          <Pressable style={styles.applyButton} onPress={handleApplyFilters}>
            <AppText style={styles.applyButtonText}>Aplicar filtros</AppText>
          </Pressable>
        </View>
      </Modal>
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
    marginBottom: spacing.sm,
  },

  resultsRow: {
    minHeight: 40,
    marginBottom: spacing.sm,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.sm,
  },

  resultsText: {
    flex: 1,
    color: colors.primary,
    fontWeight: "700",
    fontSize: 14,
    lineHeight: 18,
  },

  filterButton: {
    minHeight: 42,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.sm,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: colors.white,
  },

  filterText: {
    color: colors.primary,
    fontWeight: "700",
    fontSize: 14,
    lineHeight: 18,
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

  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.42)",
  },

  filterSheet: {
    backgroundColor: colors.white,
    borderTopLeftRadius: radius.md,
    borderTopRightRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
    paddingBottom: spacing.xl,
  },

  filterHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: spacing.sm,
  },

  filterTitle: {
    color: colors.text.primary,
    fontWeight: "800",
  },

  clearText: {
    color: colors.primary,
    fontWeight: "800",
    fontSize: 14,
    lineHeight: 18,
  },

  clearButton: {
    minHeight: 44,
    paddingHorizontal: spacing.sm,
    alignItems: "center",
    justifyContent: "center",
  },

  fieldLabel: {
    color: colors.text.primary,
    fontWeight: "700",
    fontSize: 14,
    lineHeight: 18,
    marginTop: spacing.sm,
    marginBottom: spacing.xs,
  },

  applyButton: {
    height: 60,
    borderRadius: radius.md,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
    marginTop: spacing.lg,
  },

  applyButtonText: {
    color: colors.white,
    fontWeight: "800",
  },
});
