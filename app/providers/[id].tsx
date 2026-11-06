import { useCallback, useRef, useState } from "react";
import { useFocusEffect } from "@react-navigation/native";
import {
  Alert,
  Linking,
  Pressable,
  ScrollView,
  Share,
  StyleSheet,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";

import { AppText } from "@/components/atoms/AppText";
import { CategoryIcon } from "@/components/atoms/CategoryIcon";
import { ConfirmActionModal } from "@/components/molecules/ConfirmActionModal";
import { PortfolioGallery } from "@/components/molecules/PortfolioGallery";
import { ProviderLocationMap } from "@/components/molecules/ProviderLocationMap";
import { ScreenHeader } from "@/components/molecules/ScreenHeader";
import { ProviderProfileHeader } from "@/components/molecules/ProviderProfileHeader";
import { BottomNavigation } from "@/components/organisms/BottomNavigation";
import { useVoiceSearch } from "@/hooks/useVoiceSearch";
import {
  getPortfolio,
  PortfolioItem,
} from "@/services/portfolio.service";
import { getProviderById, setProviderFavorite, Provider } from "@/services/provider.service";
import { ApiError } from "@/services/api";
import { getAccessToken } from "@/utils/authStorage";
import { colors, radius, spacing } from "@/theme";
import { sanitizePhone } from "@/utils/phone";
import { getGenderLabel } from "@/utils/gender";
import { hasValidCoordinates } from "@/utils/providerDistance";

const WHATSAPP_DEFAULT_MESSAGE =
  "Olá, vim pelo aplicativo TemQuemFaz estou precisando dos seus serviços";

type ProviderWithMapLocation = Provider & {
  latitude: number;
  longitude: number;
  show_location_on_map: true;
};

function getProviderCategories(provider: Provider) {
  return provider.category_names?.length
    ? provider.category_names
    : ["Prestador de serviço"];
}

function getProviderLocation(provider: Provider) {
  return `${provider.city_name} - ${provider.uf}`;
}

function getProviderAddress(provider: Provider) {
  const streetWithNumber = [provider.street, provider.number]
    .filter(Boolean)
    .join(", ");
  const addressParts = [
    streetWithNumber,
    provider.neighborhood,
    provider.reference_point,
  ].filter(Boolean);

  return addressParts.join(" - ");
}

function hasProviderMapLocation(
  provider: Provider
): provider is ProviderWithMapLocation {
  return (
    provider.show_location_on_map === true && hasValidCoordinates(provider)
  );
}

function getProviderMapUrl(provider: ProviderWithMapLocation) {
  return `https://www.google.com/maps/search/?api=1&query=${provider.latitude},${provider.longitude}`;
}

function getWhatsAppNumber(phone: string) {
  const sanitizedPhone = sanitizePhone(phone);

  if (!sanitizedPhone) {
    return "";
  }

  return sanitizedPhone.length === 13 && sanitizedPhone.startsWith("55")
    ? sanitizedPhone
    : `55${sanitizedPhone}`;
}

export default function ProviderDetails() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [provider, setProvider] = useState<Provider | null>(null);
  const [portfolio, setPortfolio] = useState<PortfolioItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [portfolioLoading, setPortfolioLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [portfolioError, setPortfolioError] = useState<string | null>(null);
  const [whatsAppModalVisible, setWhatsAppModalVisible] = useState(false);
  const [savingFavorite, setSavingFavorite] = useState(false);
  const [favoriteFeedback, setFavoriteFeedback] = useState<{ name: string; saved: boolean } | null>(null);
  const favoriteRequest = useRef(false);
  const { handleVoiceSearch, isRecording, isTranscribing } = useVoiceSearch({
    onError: (message) => Alert.alert("Busca por voz", message),
    onTranscript: (text) =>
      router.push({
        pathname: "/providers",
        params: {
          search: text,
        },
      }),
  });
  const voiceNavigationLabel = isTranscribing
    ? "Processando"
    : isRecording
      ? "Finalizar"
      : "Falar serviço";
  const providerAddress = provider ? getProviderAddress(provider) : "";

  useFocusEffect(useCallback(() => {
    let isActive = true;

    async function loadProvider() {
      try {
        setLoading(true);
        setError(null);

        const data = await getProviderById(id);

        if (isActive) {
          setProvider(data);
        }
      } catch (error) {
        if (!isActive) {
          return;
        }

        console.log("Erro ao carregar detalhes do prestador:", error);
        setError("Não foi possível carregar o prestador.");
      } finally {
        if (isActive) {
          setLoading(false);
        }
      }
    }

    async function loadPortfolio() {
      try {
        setPortfolioLoading(true);
        setPortfolioError(null);

        const items = await getPortfolio(id);

        if (isActive) {
          setPortfolio(items);
        }
      } catch (error) {
        if (!isActive) {
          return;
        }

        console.log("Erro ao carregar portfolio:", error);
        setPortfolioError("Não foi possível carregar o portfólio.");
      } finally {
        if (isActive) {
          setPortfolioLoading(false);
        }
      }
    }

    if (id) {
      loadProvider();
      loadPortfolio();
    }

    return () => {
      isActive = false;
    };
  }, [id]));

  function promptFavoriteLogin() {
    Alert.alert("Entre na sua conta", "Faça login para salvar profissionais nos seus favoritos.", [
      { text: "Agora não", style: "cancel" },
      { text: "Fazer login", onPress: () => router.push("/(auth)/login") },
    ]);
  }

  async function handleFavorite() {
    if (!provider || loading || favoriteRequest.current) return;
    favoriteRequest.current = true;
    setSavingFavorite(true);
    try {
      if (!await getAccessToken()) {
        promptFavoriteLogin();
        return;
      }
      const isFavorite = await setProviderFavorite(provider.id, !provider.is_favorite);
      setProvider((current) => current?.id === provider.id ? { ...current, is_favorite: isFavorite } : current);
      setFavoriteFeedback({ name: provider.user.name, saved: isFavorite });
    } catch (error) {
      if (error instanceof ApiError && error.status === 401) {
        promptFavoriteLogin();
      } else {
        Alert.alert("Favoritos", "Não foi possível atualizar o favorito. Tente novamente.");
      }
    } finally {
      favoriteRequest.current = false;
      setSavingFavorite(false);
    }
  }

  function handleOpenOwnProfile() {
    router.push("/providers/profile");
  }

  async function handleOpenWhatsApp() {
    if (!provider) {
      return;
    }

    const whatsAppNumber = getWhatsAppNumber(provider.user.phone);

    if (!whatsAppNumber) {
      Alert.alert("WhatsApp", "Este prestador ainda não possui telefone.");
      return;
    }

    try {
      const message = encodeURIComponent(WHATSAPP_DEFAULT_MESSAGE);

      await Linking.openURL(`https://wa.me/${whatsAppNumber}?text=${message}`);
      setWhatsAppModalVisible(false);
    } catch (error) {
      console.log("Erro ao abrir WhatsApp:", error);
      Alert.alert("WhatsApp", "Não foi possível abrir o WhatsApp.");
    }
  }

  async function handleShareContact() {
    if (!provider) {
      return;
    }

    const whatsAppNumber = getWhatsAppNumber(provider.user.phone);

    try {
      await Share.share(
        {
          title: `Contato de ${provider.user.name}`,
          message: [
            `${provider.user.name} — ${getProviderCategories(provider).join(", ")}`,
            "Encontrei este profissional no TemQuemFaz!",
            "Fale com ele pelo WhatsApp:",
            `https://wa.me/${whatsAppNumber}`,
          ].join("\n"),
        },
        { dialogTitle: "Compartilhar contato" }
      );
    } catch {
      Alert.alert(
        "Compartilhar contato",
        "Não foi possível abrir o compartilhamento. Tente novamente."
      );
    }
  }

  async function handleOpenMap() {
    if (!provider || !hasProviderMapLocation(provider)) {
      return;
    }

    try {
      await Linking.openURL(getProviderMapUrl(provider));
    } catch (error) {
      console.log("Erro ao abrir mapa:", error);
      Alert.alert("Mapa", "Não foi possível abrir o mapa.");
    }
  }

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <ScreenHeader
          title="Detalhes do Prestador"
          style={styles.header}
          right={
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={provider?.is_favorite ? "Remover dos favoritos" : "Adicionar aos favoritos"}
              accessibilityState={{ disabled: loading || !provider || savingFavorite, busy: savingFavorite, selected: Boolean(provider?.is_favorite) }}
              disabled={loading || !provider || savingFavorite}
              onPress={handleFavorite}
              style={[styles.favoriteButton, savingFavorite && styles.favoriteButtonBusy]}
            >
              <Ionicons name={provider?.is_favorite ? "star" : "star-outline"} size={28} color={colors.primary} />
            </Pressable>
          }
        />

        {loading ? (
          <View style={styles.feedback}>
            <AppText color={colors.text.secondary}>
              Carregando prestador...
            </AppText>
          </View>
        ) : error || !provider ? (
          <View style={styles.feedback}>
            <AppText color={colors.text.secondary}>
              {error ?? "Prestador não encontrado."}
            </AppText>
          </View>
        ) : (
          <>
            <ProviderProfileHeader provider={provider} />

            {getGenderLabel(provider.gender) ? (
              <>
                <AppText style={styles.sectionTitle}>Gênero</AppText>
                <AppText style={styles.description}>
                  {getGenderLabel(provider.gender)}
                </AppText>
              </>
            ) : null}

            <AppText style={styles.sectionTitle}>Descrição do serviço</AppText>
            <AppText style={styles.description}>
              {provider.description ||
                "Este prestador ainda não adicionou uma descrição."}
            </AppText>

            <AppText style={styles.sectionTitle}>Categorias</AppText>
            <View style={styles.chips}>
              {getProviderCategories(provider).map((category) => (
                <View key={category} style={styles.chip}>
                  <CategoryIcon categoryName={category} size={18} />
                  <AppText style={styles.chipText}>{category}</AppText>
                </View>
              ))}
            </View>

            <AppText style={[styles.sectionTitle, styles.portfolioSectionTitle]}>
              Portfólio
            </AppText>
            {portfolioLoading ? (
              <AppText style={styles.portfolioFeedback}>
                Carregando portfólio...
              </AppText>
            ) : portfolioError ? (
              <AppText style={styles.portfolioFeedback}>
                {portfolioError}
              </AppText>
            ) : (
              <PortfolioGallery items={portfolio} author={provider} />
            )}

            <AppText style={styles.sectionTitle}>Localização</AppText>

            {hasProviderMapLocation(provider) ? (
              <>
                {providerAddress ? (
                  <AppText style={styles.mapAddress}>{providerAddress}</AppText>
                ) : null}

                <ProviderLocationMap
                  latitude={provider.latitude}
                  longitude={provider.longitude}
                  title={provider.user.name}
                  description={getProviderLocation(provider)}
                />

                <Pressable
                  accessibilityLabel="Abrir localização do prestador no mapa"
                  accessibilityRole="button"
                  style={styles.mapButton}
                  onPress={handleOpenMap}
                >
                  <Ionicons name="navigate" size={20} color={colors.primary} />
                  <AppText style={styles.mapButtonText}>Abrir no mapa</AppText>
                </Pressable>
              </>
            ) : (
              <AppText style={styles.mapAddress}>
                Localização não informada
              </AppText>
            )}

            <Pressable
              accessibilityLabel={`Conversar com ${provider.user.name} pelo WhatsApp`}
              accessibilityRole="button"
              style={styles.whatsAppButton}
              onPress={() => setWhatsAppModalVisible(true)}
            >
              <Ionicons name="logo-whatsapp" size={28} color={colors.white} />
              <AppText style={styles.whatsAppButtonText}>
                Falar no Whatsapp
              </AppText>
            </Pressable>
            <Pressable
              accessibilityLabel={`Compartilhar contato de ${provider.user.name}`}
              accessibilityRole="button"
              style={styles.mapButton}
              onPress={handleShareContact}
            >
              <Ionicons name="share-social-outline" size={24} color={colors.primary} />
              <AppText style={styles.mapButtonText}>Compartilhar contato</AppText>
            </Pressable>
          </>
        )}
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

      <ConfirmActionModal
        visible={favoriteFeedback !== null}
        variant="primary"
        iconName={favoriteFeedback?.saved ? "star" : "star-outline"}
        title={favoriteFeedback?.saved ? "Adicionado aos favoritos" : "Removido dos favoritos"}
        description={favoriteFeedback?.saved
          ? `Você favoritou ${favoriteFeedback.name}. Encontre este profissional em Meus favoritos, no seu perfil.`
          : `${favoriteFeedback?.name ?? "O prestador"} foi removido dos seus favoritos.`}
        confirmText="Entendi"
        showCancel={false}
        onCancel={() => setFavoriteFeedback(null)}
        onConfirm={() => setFavoriteFeedback(null)}
      />

      {provider ? (
        <ConfirmActionModal
          visible={whatsAppModalVisible}
          variant="primary"
          iconName="logo-whatsapp"
          title="Abrir conversa no WhatsApp?"
          description={`Você será redirecionado para o WhatsApp para conversar com ${provider.user.name}.`}
          confirmText="Abrir Whatsapp"
          onCancel={() => setWhatsAppModalVisible(false)}
          onConfirm={handleOpenWhatsApp}
        />
      ) : null}


    </View>
  );
}

const styles = StyleSheet.create({
  favoriteButton: { minWidth: 44, minHeight: 44, alignItems: "center", justifyContent: "center" },
  favoriteButtonBusy: { opacity: 0.5 },
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },

  content: {
    paddingHorizontal: spacing.screen,
    paddingTop: spacing.lg,
    paddingBottom: 118,
  },

  header: {
    marginBottom: spacing.lg,
  },

  feedback: {
    paddingTop: spacing.xl,
    alignItems: "center",
  },

  sectionTitle: {
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
    color: colors.text.primary,
    fontWeight: "800",
    fontSize: 18,
    lineHeight: 22,
  },

  description: {
    color: colors.text.primary,
    fontSize: 16,
    lineHeight: 22,
  },

  chips: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },

  chip: {
    minHeight: 40,
    borderRadius: radius.sm,
    backgroundColor: colors.background.card,
    paddingHorizontal: spacing.md,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },

  chipText: {
    color: colors.primary,
    fontWeight: "700",
    fontSize: 16,
    lineHeight: 22,
  },

  mapAddress: {
    color: colors.text.secondary,
    fontSize: 16,
    lineHeight: 22,
    marginBottom: spacing.sm,
  },

  portfolioFeedback: {
    color: colors.text.secondary,
    fontSize: 16,
    lineHeight: 22,
    paddingVertical: spacing.md,
  },

  portfolioSectionTitle: {
    marginTop: spacing.sm,
  },

  mapButton: {
    minHeight: 48,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    backgroundColor: colors.white,
    marginTop: spacing.sm,
    paddingHorizontal: spacing.md,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
  },

  mapButtonText: {
    color: colors.primary,
    fontWeight: "800",
    fontSize: 16,
    lineHeight: 22,
  },

  whatsAppButton: {
    height: 64,
    borderRadius: radius.md,
    backgroundColor: colors.primary,
    marginTop: spacing.lg,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
  },

  whatsAppButtonText: {
    color: colors.white,
    fontWeight: "800",
    fontSize: 18,
    lineHeight: 22,
  },
});
