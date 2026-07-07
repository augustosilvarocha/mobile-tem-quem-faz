import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
  type TextStyle,
  type ViewStyle,
} from "react-native";
import { useEffect, useMemo, useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";

import { AppText } from "@/components/atoms/AppText";
import { ProviderCard } from "@/components/molecules/ProviderCard";
import { SearchInput } from "@/components/molecules/SearchInput";
import { Section } from "@/components/molecules/Section";
import { BottomNavigation } from "@/components/organisms/BottomNavigation";
import { CategoryGrid } from "@/components/organisms/CategoryGrid";
import { useCategories } from "@/hooks/useCategories";
import { ProviderCardData, useProviders } from "@/hooks/useProviders";
import { colors, radius, spacing } from "@/theme";
import { getProviderId, getProviderName } from "@/utils/authStorage";

const GUEST_GREETING = "Olá, seja bem-vindo ao TemQuemFaz";

function normalizeCategoryName(categoryName: string) {
  return categoryName
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toLowerCase();
}

function getOneProviderPerCategory(providers: ProviderCardData[]) {
  const representedCategories = new Set<string>();

  return providers.filter((provider) => {
    const categoryNames =
      provider.categoryNames.length > 0
        ? provider.categoryNames
        : [provider.category];
    const hasNewCategory = categoryNames.some((categoryName) => {
      const normalizedCategory = normalizeCategoryName(categoryName);

      return normalizedCategory && !representedCategories.has(normalizedCategory);
    });

    if (!hasNewCategory) {
      return false;
    }

    categoryNames.forEach((categoryName) => {
      const normalizedCategory = normalizeCategoryName(categoryName);

      if (normalizedCategory) {
        representedCategories.add(normalizedCategory);
      }
    });

    return true;
  });
}

export default function Home() {
  const { categories } = useCategories();
  const { providers } = useProviders();
  const [providerName, setProviderName] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  useEffect(() => {
    let isMounted = true;

    async function loadProviderName() {
      const storedProviderName = await getProviderName();

      if (isMounted) {
        setProviderName(storedProviderName);
      }
    }

    loadProviderName();

    return () => {
      isMounted = false;
    };
  }, []);

  const greeting = providerName ? `Olá, ${providerName}!` : GUEST_GREETING;

  const featuredProviders = useMemo(
    () => getOneProviderPerCategory(providers),
    [providers]
  );

  function handleSearchSubmit() {
    const query = search.trim();

    if (!query) {
      return;
    }

    router.push({
      pathname: "/providers",
      params: {
        search: query,
      },
    });
  }

  async function handleOpenOwnProfile() {
    const providerId = await getProviderId();

    if (!providerId) {
      Alert.alert("Perfil", "Entre ou cadastre-se como prestador para acessar seu perfil.");
      return;
    }

    router.push("/provider/profile");
  }

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.locationRow}>
          <Ionicons name="location" size={16} color={colors.text.primary} />
          <AppText style={styles.location}>Pau dos Ferros - RN</AppText>
        </View>

        <AppText style={styles.greeting}>{greeting}</AppText>

        <AppText style={styles.title}>Qual serviço você procura hoje?</AppText>

        <SearchInput
          value={search}
          onChangeText={setSearch}
          onSubmitEditing={handleSearchSubmit}
          placeholder="Ex.: eletricista, pedreiro, encanador..."
          returnKeyType="search"
          iconSize={22}
          containerStyle={styles.searchBox}
          inputStyle={styles.searchInput}
          actionAccessibilityLabel="Pesquisar prestadores"
          actionDisabled={!search.trim()}
          onPressAction={handleSearchSubmit}
        />

        <Pressable style={styles.voiceButton}>
          <Ionicons name="mic" size={22} color={colors.white} />

          <AppText style={styles.voiceButtonText}>Buscar por voz</AppText>
        </Pressable>

        <Section title="Categorias principais" />

        <CategoryGrid
          categories={categories}
          onPressCategory={(category) =>
            router.push({
              pathname: "/categories/[id]",
              params: {
                id: category.id.toString(),
                name: category.name,
              },
            })
          }
          onPressMore={() => router.push("/categories")}
        />

        <Section
          title="Prestadores perto de você"
          actionText="Ver todos"
          onPressAction={() => router.push("/providers" as never)}
        />

        {featuredProviders.map((provider) => (
          <ProviderCard
            key={provider.id}
            name={provider.name}
            category={provider.category}
            city={provider.city}
            photo={provider.photo}
            onPress={() =>
              router.push({
                pathname: "/provider/[id]",
                params: {
                  id: provider.id.toString(),
                },
              })
            }
          />
        ))}
      </ScrollView>

      <BottomNavigation
        active="home"
        onPressHome={() => router.replace("/home")}
        onPressVoice={() => console.log("Buscar por voz")}
        onPressProfile={handleOpenOwnProfile}
      />
    </View>
  );
}

const styles = StyleSheet.create<{
  container: ViewStyle;
  content: ViewStyle;
  locationRow: ViewStyle;
  location: TextStyle;
  greeting: TextStyle;
  title: TextStyle;
  searchBox: ViewStyle;
  searchInput: TextStyle;
  voiceButton: ViewStyle;
  voiceButtonText: TextStyle;
}>({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },

  content: {
    padding: spacing.lg,
    paddingBottom: 110,
  },

  locationRow: {
    marginTop: spacing.md,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },

  location: {
    color: colors.text.primary,
    fontWeight: "700",
  },

  greeting: {
    marginTop: spacing.lg,
    color: colors.primary,
    fontWeight: "700",
    fontSize: 18,
    lineHeight: 22,
  },

  title: {
    marginTop: spacing.sm,
    marginBottom: spacing.md,
    color: colors.text.primary,
    fontWeight: "800",
    fontSize: 26,
    lineHeight: 32,
  },

  searchBox: {
    height: 52,
    paddingHorizontal: spacing.md,
  },

  searchInput: {
    flex: 1,
    color: colors.text.primary,
    fontSize: 16,
    lineHeight: 20,
  },

  voiceButton: {
    height: 54,
    marginTop: spacing.md,
    backgroundColor: colors.primary,
    borderRadius: radius.md,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
  },

  voiceButtonText: {
    color: colors.white,
    fontWeight: "700",
    fontSize: 18,
    lineHeight: 22,
  },
});
