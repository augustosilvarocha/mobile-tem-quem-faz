import { ScrollView } from "@/components/atoms/KeyboardAware";
import {
  Alert,
  Keyboard,
  Linking,
  Pressable,
  StyleSheet,
  useWindowDimensions,
  View,
  type TextStyle,
  type ViewStyle,
} from "react-native";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useFocusEffect } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";

import { AppText } from "@/components/atoms/AppText";
import { ProviderCard } from "@/components/molecules/ProviderCard";
import { SearchInput } from "@/components/molecules/SearchInput";
import { Section } from "@/components/molecules/Section";
import { BottomNavigation } from "@/components/organisms/BottomNavigation";
import { CategoryGrid } from "@/components/organisms/CategoryGrid";
import { CityPreferenceModal } from "@/components/organisms/CityPreferenceModal";
import { useLocationPreference } from "@/contexts/LocationPreferenceContext";
import { useCategories } from "@/hooks/useCategories";
import { useProviders } from "@/hooks/useProviders";
import { useVoiceSearch } from "@/hooks/useVoiceSearch";
import { searchCategories, type Category } from "@/services/category.service";
import { colors, radius, spacing } from "@/theme";
import { getAccessToken, getUserName, subscribeAuthSession } from "@/utils/authStorage";
import { goBack } from "@/utils/navigation";
import {
  getOneProviderPerCategory,
} from "@/utils/providerDisplay";
import { formatRecordingDuration } from "@/utils/time";

const GUEST_GREETING = "Seja bem-vindo ao TemQuemFaz";
const TUTORIAL_VIDEO_URL = process.env.EXPO_PUBLIC_TUTORIAL_VIDEO_URL?.trim()
  || "https://youtu.be/Q3LXcJmImNg";

function normalizeSearchText(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();
}

export default function Home() {
  const { width: windowWidth } = useWindowDimensions();
  const [containerWidth, setContainerWidth] = useState<number | null>(null);
  const availableWidth = Math.max(0, (containerWidth ?? windowWidth) - spacing.lg * 2);
  // Preserve 22 on a 390-unit screen; scale between 18 and 28 on other widths.
  const titleFontSize = Math.max(18, Math.min(28, Math.round(22 * availableWidth / 342)));
  const { categories } = useCategories();
  const { providers } = useProviders();
  const {
    loading: loadingLocationPreference,
    preferredCity,
    userLocation,
  } = useLocationPreference();

  const [providerName, setProviderName] = useState<string | null>(null);
  const [isGuest, setIsGuest] = useState<boolean | null>(null);
  const [cityModalVisible, setCityModalVisible] = useState(false);
  const [search, setSearch] = useState("");
  const [suggestionsVisible, setSuggestionsVisible] = useState(false);
  const [matchedCategories, setMatchedCategories] = useState<{
    query: string;
    categories: Category[];
  } | null>(null);
  const selectingSuggestion = useRef(false);
  const { durationMillis, handleVoiceSearch, isRecording, isTranscribing } = useVoiceSearch({
    onError: (message) => Alert.alert("Busca por voz", message),
    onTranscript: (text) => {
      setSearch(text);
      setSuggestionsVisible(false);
      router.push({
        pathname: "/providers",
        params: {
          search: text,
        },
      });
    },
  });

  useFocusEffect(useCallback(() => {
    let isMounted = true;

    async function loadSession() {
      const [token, storedProviderName] = await Promise.all([getAccessToken(), getUserName()]);

      if (isMounted) {
        setIsGuest(!token);
        setProviderName(token ? storedProviderName : null);
      }
    }

    const refreshSession = () => {
      loadSession().catch((error) => console.log("Erro ao carregar sessão da home:", error));
    };
    const unsubscribe = subscribeAuthSession(refreshSession);
    refreshSession();

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, []));

  const greeting = providerName ? `Boas-vindas, ${providerName}!` : GUEST_GREETING;

  const recordingDuration = formatRecordingDuration(durationMillis);
  const voiceButtonLabel = isTranscribing
    ? "Entendendo o que você falou..."
    : isRecording
      ? `Finalizar gravação ${recordingDuration}`
      : "Falar o serviço que preciso";
  const voiceHelperText = isRecording
    ? "Fale agora e toque novamente para finalizar."
    : 'Toque no microfone e diga, por exemplo: "Preciso de um eletricista".';
  const voiceNavigationLabel = isTranscribing
    ? "Processando"
    : isRecording
      ? "Finalizar"
      : "Falar serviço";

  const featuredProviders = useMemo(
    () => getOneProviderPerCategory(providers),
    [providers]
  );
  const locationLabel = loadingLocationPreference
    ? "Carregando cidade..."
    : preferredCity
      ? `${preferredCity.name} - ${preferredCity.uf}`
      : "Escolha sua cidade";

  useEffect(() => {
    const query = normalizeSearchText(search);

    if (!suggestionsVisible || !query) {
      return;
    }

    let isActive = true;
    const timeout = setTimeout(() => {
      searchCategories(search)
        .then((matches) => {
          if (isActive) {
            setMatchedCategories({ query, categories: matches });
          }
        })
        .catch(() => {
          if (isActive) {
            setMatchedCategories(null);
          }
        });
    }, 250);

    return () => {
      isActive = false;
      clearTimeout(timeout);
    };
  }, [search, suggestionsVisible]);

  const searchSuggestions = useMemo(() => {
    const query = normalizeSearchText(search);

    if (!suggestionsVisible || !query) {
      return [];
    }

    if (matchedCategories?.query === query) {
      return matchedCategories.categories;
    }

    return categories.filter((category) => {
      const name = normalizeSearchText(category.name);

      return query.length === 1 ? name.startsWith(query) : name.includes(query);
    });
  }, [categories, search, suggestionsVisible, matchedCategories]);

  function handleSearchSubmit(value: string) {
    const query = value.trim();

    if (!query) {
      return;
    }

    setSearch(query);
    setSuggestionsVisible(false);
    Keyboard.dismiss();

    router.push({
      pathname: "/providers",
      params: {
        search: query,
      },
    });
  }

  function handleSearchBlur() {
    if (!selectingSuggestion.current) {
      setSuggestionsVisible(false);
    }
  }

  function handleHomeVoiceSearch() {
    setSuggestionsVisible(false);
    Keyboard.dismiss();
    return handleVoiceSearch();
  }

  function handleOpenOwnProfile() {
    router.push("/providers/profile");
  }

  async function handleOpenTutorial() {
    if (!TUTORIAL_VIDEO_URL) {
      Alert.alert("Como usar o aplicativo", "O vídeo tutorial estará disponível em breve.");
      return;
    }

    try {
      await Linking.openURL(TUTORIAL_VIDEO_URL);
    } catch {
      Alert.alert("Não foi possível abrir o vídeo", "Tente novamente em alguns instantes.");
    }
  }

  const tutorialButton = (
    <Pressable
      accessibilityLabel="Assistir ao tutorial de uso do aplicativo"
      accessibilityHint="Abre o vídeo no YouTube"
      accessibilityRole="button"
      hitSlop={6}
      onPress={handleOpenTutorial}
      style={({ pressed }) => [styles.tutorialButton, pressed && styles.tutorialButtonPressed]}
    >
      <Ionicons name="play-circle-outline" size={24} color={colors.primary} />
      <AppText style={styles.tutorialLabel}>Como usar</AppText>
    </Pressable>
  );

  return (
    <View
      style={styles.container}
      onLayout={({ nativeEvent: { layout } }) => setContainerWidth(layout.width)}
    >
      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        {isGuest !== false ? <View style={styles.headerRow}>
        {isGuest === true ? <Pressable
          accessibilityLabel="Voltar"
          accessibilityRole="button"
          hitSlop={8}
          onPress={goBack}
          style={styles.backButton}
        >
          <Ionicons name="chevron-back" size={28} color={colors.text.primary} />
        </Pressable> : null}

          {tutorialButton}
        </View> : null}

        <View style={styles.locationRow}>
          <Pressable
            accessibilityLabel={
              preferredCity
                ? `Cidade escolhida: ${locationLabel}. Toque para alterar.`
                : "Escolha sua cidade"
            }
            accessibilityRole="button"
            accessibilityState={{ disabled: loadingLocationPreference }}
            disabled={loadingLocationPreference}
            style={styles.locationSelector}
            onPress={() => setCityModalVisible(true)}
          >
            <Ionicons name="location" size={18} color={colors.primary} />
            <AppText style={styles.location} numberOfLines={2}>
              {locationLabel}
            </AppText>
            <Ionicons
              name="chevron-down"
              size={20}
              color={colors.text.secondary}
            />
          </Pressable>
          {isGuest === false ? tutorialButton : null}
        </View>

        <AppText style={styles.greeting}>{greeting}</AppText>

        <AppText style={[
          styles.title,
          { fontSize: titleFontSize, lineHeight: Math.round(titleFontSize * 32 / 22) },
        ]}>
          Qual serviço você procura hoje?
        </AppText>

        <SearchInput
          value={search}
          onChangeText={(text) => {
            setSearch(text);
            setSuggestionsVisible(true);
          }}
          onFocus={() => setSuggestionsVisible(true)}
          onBlur={handleSearchBlur}
          onSubmitEditing={() => handleSearchSubmit(search)}
          accessibilityLabel="Buscar serviço"
          placeholder="Ex.: pintor, babá..."
          returnKeyType="search"
          iconSize={22}
          containerStyle={styles.searchBox}
          inputStyle={styles.searchInput}
          actionAccessibilityLabel="Pesquisar prestadores"
          actionDisabled={!search.trim()}
          onPressAction={() => handleSearchSubmit(search)}
        />

        {searchSuggestions.length > 0 ? (
          <ScrollView
            style={styles.suggestions}
            nestedScrollEnabled
            keyboardShouldPersistTaps="handled"
          >
            {searchSuggestions.map((category, index) => (
              <Pressable
                accessibilityLabel={`Buscar ${category.name}`}
                accessibilityRole="button"
                key={category.id}
                onPressIn={() => {
                  selectingSuggestion.current = true;
                }}
                onPressOut={() => {
                  selectingSuggestion.current = false;
                }}
                onPress={() => handleSearchSubmit(category.name)}
                style={({ pressed }) => [
                  styles.suggestion,
                  index > 0 && styles.suggestionBorder,
                  pressed && styles.suggestionPressed,
                ]}
              >
                <Ionicons
                  name="search-outline"
                  size={20}
                  color={colors.text.secondary}
                />
                <AppText style={styles.suggestionText}>{category.name}</AppText>
                <Ionicons
                  name="chevron-forward"
                  size={18}
                  color={colors.primary}
                />
              </Pressable>
            ))}
          </ScrollView>
        ) : null}

        <Pressable
          accessibilityHint={
            isRecording
              ? "Finaliza a gravação e procura prestadores"
              : 'Diga algo como "Preciso de um eletricista"'
          }
          accessibilityLabel={voiceButtonLabel}
          accessibilityRole="button"
          accessibilityState={{ disabled: isTranscribing }}
          disabled={isTranscribing}
          onPress={handleHomeVoiceSearch}
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

        <AppText style={styles.voiceHelperText}>{voiceHelperText}</AppText>

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
          title={
            userLocation && !preferredCity
              ? "Prestadores mais próximos"
              : "Prestadores de serviço"
          }
          actionText="Ver todos"
          titleStyle={styles.providersTitle}
          onPressAction={() => router.push("/providers" as never)}
        />

        {featuredProviders.map((provider) => (
          <ProviderCard
            key={provider.id}
            name={provider.name}
            category={provider.category}
            city={provider.city}
            photo={provider.photo}
            distanceKm={provider.distanceKm}
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
        onPressVoice={handleHomeVoiceSearch}
        onPressProfile={handleOpenOwnProfile}
        voiceActive={isRecording}
        voiceDisabled={isTranscribing}
        voiceIconName={isRecording ? "stop" : "mic"}
        voiceLabel={voiceNavigationLabel}
      />

      {cityModalVisible ? (
        <CityPreferenceModal
          visible
          onClose={() => setCityModalVisible(false)}
        />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create<{
  container: ViewStyle;
  content: ViewStyle;
  headerRow: ViewStyle;
  tutorialButton: ViewStyle;
  tutorialButtonPressed: ViewStyle;
  tutorialLabel: TextStyle;
  locationRow: ViewStyle;
  backButton: ViewStyle;
  locationSelector: ViewStyle;
  location: TextStyle;
  greeting: TextStyle;
  providersTitle: TextStyle;
  title: TextStyle;
  searchBox: ViewStyle;
  searchInput: TextStyle;
  suggestions: ViewStyle;
  suggestion: ViewStyle;
  suggestionBorder: ViewStyle;
  suggestionPressed: ViewStyle;
  suggestionText: TextStyle;
  voiceButton: ViewStyle;
  voiceButtonDisabled: ViewStyle;
  voiceButtonRecording: ViewStyle;
  voiceButtonText: TextStyle;
  voiceHelperText: TextStyle;
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
    marginTop: spacing.xs,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },

  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.sm,
  },

  tutorialButton: {
    marginLeft: "auto",
    flexShrink: 0,
    minHeight: 38,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    paddingHorizontal: 6,
    borderRadius: radius.md,
    backgroundColor: colors.background.card,
  },

  tutorialButtonPressed: {
    opacity: 0.7,
  },

  tutorialLabel: {
    color: colors.primary,
    fontSize: 12,
    lineHeight: 20,
    fontWeight: "700",
  },

  locationSelector: {
    minHeight: 44,
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
  },

  backButton: {
    width: 28,
    minHeight: 44,
    marginLeft: -spacing.sm,
    alignSelf: "flex-start",
    alignItems: "center",
    justifyContent: "center",
  },

  location: {
    flexShrink: 1,
    color: colors.text.primary,
    fontWeight: "700",
    fontSize: 14,
    lineHeight: 22,
  },

  providersTitle: {
    fontSize: 18,
    lineHeight: 22,
  },

  greeting: {
    marginTop: spacing.sm,
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

  suggestions: {
    maxHeight: 240,
    marginTop: spacing.xs,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    backgroundColor: colors.white,
    overflow: "hidden",
  },

  suggestion: {
    minHeight: 48,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },

  suggestionBorder: {
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },

  suggestionPressed: {
    backgroundColor: colors.background.card,
  },

  suggestionText: {
    flex: 1,
    color: colors.text.primary,
    fontSize: 16,
    lineHeight: 22,
  },

  voiceButton: {
    minHeight: 64,
    marginTop: spacing.md,
    backgroundColor: colors.primary,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
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
    lineHeight: 24,
    textAlign: "center",
  },

  voiceHelperText: {
    marginTop: spacing.sm,
    color: colors.text.secondary,
    fontSize: 16,
    lineHeight: 22,
    textAlign: "center",
  },
});
