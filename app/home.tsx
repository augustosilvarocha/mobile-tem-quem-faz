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
import { useProviders } from "@/hooks/useProviders";
import { useVoiceSearch } from "@/hooks/useVoiceSearch";
import { colors, radius, spacing } from "@/theme";
import {
  clearAuthSession,
  getProviderId,
  getProviderName,
} from "@/utils/authStorage";
import {
  formatRecordingDuration,
  getOneProviderPerCategory,
} from "@/utils/providerDisplay";

const GUEST_GREETING = "Olá, seja bem-vindo ao TemQuemFaz";

export default function Home() {
  const { categories } = useCategories();
  const { providers } = useProviders();
  const [providerName, setProviderName] = useState<string | null>(null);
  const [isGuest, setIsGuest] = useState(false);
  const [search, setSearch] = useState("");
  const { durationMillis, handleVoiceSearch, isRecording, isTranscribing } = useVoiceSearch({
    onError: (message) => Alert.alert("Busca por voz", message),
    onTranscript: (text) => {
      setSearch(text);
      router.push({
        pathname: "/providers",
        params: {
          search: text,
        },
      });
    },
  });

  useEffect(() => {
    let isMounted = true;

    async function loadProviderName() {
      const [storedProviderId, storedProviderName] = await Promise.all([
        getProviderId(),
        getProviderName(),
      ]);

      if (isMounted) {
        setProviderName(storedProviderName);
        setIsGuest(!storedProviderId);
      }
    }

    loadProviderName();

    return () => {
      isMounted = false;
    };
  }, []);

  const greeting = providerName ? `Olá, ${providerName}!` : GUEST_GREETING;

  const recordingDuration = formatRecordingDuration(durationMillis);
  const voiceButtonLabel = isTranscribing
    ? "Processando audio..."
    : isRecording
      ? `Finalizar ${recordingDuration}`
      : "Buscar por voz";
  const voiceNavigationLabel = isTranscribing
    ? "Processando"
    : isRecording
      ? recordingDuration
      : "Busca por voz";

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

  async function handleGuestExit() {
    await clearAuthSession();
    router.replace("/");
  }

  async function handleOpenOwnProfile() {
    const providerId = await getProviderId();

    if (!providerId) {
      Alert.alert("Perfil", "Entre ou cadastre-se como prestador para acessar seu perfil.");
      return;
    }

    router.push("/providers/profile");
  }

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.locationRow}>
          <Ionicons name="location" size={16} color={colors.text.primary} />
          <AppText style={styles.location}>Pau dos Ferros - RN</AppText>

          {isGuest && (
            <Pressable
              accessibilityLabel="Sair do modo convidado e voltar à tela inicial"
              onPress={handleGuestExit}
              style={styles.guestExitButton}
            >
              <Ionicons
                name="log-out-outline"
                size={18}
                color={colors.primary}
              />
              <AppText style={styles.guestExitText}>Sair</AppText>
            </Pressable>
          )}
        </View>

        <AppText style={styles.greeting}>{greeting}</AppText>

        <AppText style={styles.title}>Qual serviço você procura hoje?</AppText>

        <SearchInput
          value={search}
          onChangeText={setSearch}
          onSubmitEditing={handleSearchSubmit}
          placeholder="Ex.: eletricista, pedreiro..."
          returnKeyType="search"
          iconSize={22}
          containerStyle={styles.searchBox}
          inputStyle={styles.searchInput}
          actionAccessibilityLabel="Pesquisar prestadores"
          actionDisabled={!search.trim()}
          onPressAction={handleSearchSubmit}
        />

        <Pressable
          disabled={isTranscribing}
          onPress={handleVoiceSearch}
          style={[
            styles.voiceButton,
            isRecording && styles.voiceButtonRecording,
            isTranscribing && styles.voiceButtonDisabled,
          ]}
        >
          <Ionicons
            name={isRecording ? "stop" : "mic"}
            size={22}
            color={colors.white}
          />

          <AppText style={styles.voiceButtonText}>{voiceButtonLabel}</AppText>
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
                pathname: "/providers/[id]",
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
        onPressVoice={handleVoiceSearch}
        onPressProfile={handleOpenOwnProfile}
        voiceActive={isRecording}
        voiceDisabled={isTranscribing}
        voiceIconName={isRecording ? "stop" : "mic"}
        voiceLabel={voiceNavigationLabel}
      />
    </View>
  );
}

const styles = StyleSheet.create<{
  container: ViewStyle;
  content: ViewStyle;
  locationRow: ViewStyle;
  location: TextStyle;
  guestExitButton: ViewStyle;
  guestExitText: TextStyle;
  greeting: TextStyle;
  title: TextStyle;
  searchBox: ViewStyle;
  searchInput: TextStyle;
  voiceButton: ViewStyle;
  voiceButtonDisabled: ViewStyle;
  voiceButtonRecording: ViewStyle;
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

  guestExitButton: {
    minHeight: 40,
    marginLeft: "auto",
    paddingHorizontal: spacing.xs,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
  },

  guestExitText: {
    color: colors.primary,
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
    height: 62,
    marginTop: spacing.md,
    backgroundColor: colors.primary,
    borderRadius: radius.md,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
  },

  voiceButtonDisabled: {
    opacity: 0.7,
  },

  voiceButtonRecording: {
    backgroundColor: colors.danger,
  },

  voiceButtonText: {
    color: colors.white,
    fontWeight: "700",
    fontSize: 18,
    lineHeight: 22,
  },
});
