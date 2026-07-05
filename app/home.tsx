import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
  type TextStyle,
  type ViewStyle,
} from "react-native";
import { useEffect, useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";

import { AppText } from "@/components/atoms/AppText";
import { ProviderCard } from "@/components/molecules/ProviderCard";
import { Section } from "@/components/molecules/Section";
import { BottomNavigation } from "@/components/organisms/BottomNavigation";
import { CategoryGrid } from "@/components/organisms/CategoryGrid";
import { useCategories } from "@/hooks/useCategories";
import { useProviders } from "@/hooks/useProviders";
import { colors, radius, spacing } from "@/theme";
import { getProviderName } from "@/utils/authStorage";

const GUEST_GREETING = "Olá, seja bem-vindo ao TemQuemFaz";

export default function Home() {
  const { categories } = useCategories();
  const { providers } = useProviders();
  const [providerName, setProviderName] = useState<string | null>(null);

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

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.locationRow}>
          <Ionicons name="location" size={16} color={colors.text.primary} />
          <AppText style={styles.location}>Pau dos Ferros - RN</AppText>
        </View>

        <AppText style={styles.greeting}>{greeting}</AppText>

        <AppText style={styles.title}>Qual serviço você procura hoje?</AppText>

        <View style={styles.searchBox}>
          <Ionicons name="search" size={22} color={colors.text.secondary} />

          <TextInput
            placeholder="Ex.: eletricista, pedreiro, encanador..."
            placeholderTextColor={colors.text.secondary}
            style={styles.searchInput}
          />
        </View>

        <Pressable style={styles.voiceButton}>
          <Ionicons name="mic" size={22} color={colors.white} />

          <AppText style={styles.voiceButtonText}>Buscar por voz</AppText>
        </Pressable>

        <Section title="Categorias principais" />

        <CategoryGrid
          categories={categories}
          onPressCategory={(category) => {
            console.log("Categoria:", category);
          }}
          onPressMore={() => {
            console.log("Ver mais categorias");
          }}
        />

        <Section
          title="Prestadores perto de você"
          actionText="Ver todos"
          onPressAction={() => {
            console.log("Ver todos prestadores");
          }}
        />

        {providers.map((provider) => (
          <ProviderCard
            key={provider.id}
            name={provider.name}
            category={provider.category}
            city={provider.city}
            photo={provider.photo}
            onPress={() => {
              console.log("Abrir perfil:", provider.id);
            }}
          />
        ))}
      </ScrollView>

      <BottomNavigation
        active="home"
        onPressHome={() => router.replace("/home")}
        onPressVoice={() => console.log("Buscar por voz")}
        onPressProfile={() => {
          Alert.alert("Perfil", "Você não tem perfil.");
        }}
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
    backgroundColor: colors.white,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: spacing.md,
    gap: spacing.sm,
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
