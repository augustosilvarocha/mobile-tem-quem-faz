import { useCallback, useState } from "react";
import {
  Alert,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import { PortfolioGallery } from "@/components/molecules/PortfolioGallery";
import { ProviderProfileHeader } from "@/components/molecules/ProviderProfileHeader";
import { getPortfolio, PortfolioItem } from "@/services/portfolio.service";
import { router } from "expo-router";

import { AppText } from "@/components/atoms/AppText";
import { CategoryIcon } from "@/components/atoms/CategoryIcon";
import { ConfirmActionModal } from "@/components/molecules/ConfirmActionModal";
import { ScreenHeader } from "@/components/molecules/ScreenHeader";
import { BottomNavigation } from "@/components/organisms/BottomNavigation";
import { useVoiceSearch } from "@/hooks/useVoiceSearch";
import { getProviderById, Provider } from "@/services/provider.service";
import { colors, radius, spacing } from "@/theme";
import { clearAuthSession, getProviderId } from "@/utils/authStorage";

function getProviderCategories(provider: Provider) {
  return provider.category_names?.length
    ? provider.category_names
    : ["Prestador de serviço"];
}

function formatProviderSince(createdAt: string) {
  const date = new Date(createdAt);

  if (Number.isNaN(date.getTime())) {
    return "Prestador cadastrado";
  }

  const monthYear = new Intl.DateTimeFormat("pt-BR", {
    month: "long",
    year: "numeric",
  }).format(date);

  return `Prestador desde ${monthYear}`;
}

export default function OwnProviderProfile() {
  const [provider, setProvider] = useState<Provider | null>(null);
  const [portfolio, setPortfolio] = useState<PortfolioItem[]>([]);
  const [portfolioError, setPortfolioError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isGuest, setIsGuest] = useState(false);
  const [logoutModalVisible, setLogoutModalVisible] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
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

  useFocusEffect(useCallback(() => {
    let isActive = true;

    async function loadProvider() {
      try {
        setLoading(true);
        setError(null);
        setIsGuest(false);
        setPortfolioError(null);

        const providerId = await getProviderId();

        if (!providerId) {
          if (isActive) {
            setIsGuest(true);
          }
          return;
        }

        const data = await getProviderById(providerId);

        if (isActive) {
          setProvider(data);
        }
        try {
          const items = await getPortfolio(providerId);
          if (isActive) setPortfolio(items);
        } catch {
          if (isActive) setPortfolioError("Não foi possível carregar suas publicações.");
        }
      } catch (error) {
        if (!isActive) {
          return;
        }

        console.log("Erro ao carregar perfil:", error);
        setError("Não foi possível carregar seu perfil.");
      } finally {
        if (isActive) {
          setLoading(false);
        }
      }
    }

    loadProvider();

    return () => {
      isActive = false;
    };
  }, []));

  async function handleLogout() {
    try {
      setLoggingOut(true);
      await clearAuthSession();
      setLogoutModalVisible(false);
      router.replace("/");
    } finally {
      setLoggingOut(false);
    }
  }

  function handleEditProfile() {
    if (!provider) {
      return;
    }

    router.push({
      pathname: "/providers/edit",
      params: {
        providerId: String(provider.id),
      },
    });
  }

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <ScreenHeader
          right={
            <Pressable
              style={styles.logoutButton}
              onPress={() => setLogoutModalVisible(true)}
            >
              <Ionicons name="log-out-outline" size={16} color={colors.danger} />
              <AppText style={styles.logoutText}>Sair</AppText>
            </Pressable>
          }
          style={styles.header}
          title="Perfil"
        />

        {loading ? (
          <View style={styles.feedback}>
            <AppText color={colors.text.secondary}>Carregando perfil...</AppText>
          </View>
        ) : isGuest ? (
          <View style={styles.feedback}>
            <Image
              resizeMode="contain"
              source={require("../../assets/images/logo.png")}
              style={styles.guestLogo}
            />

            <Image
              resizeMode="contain"
              source={require("../../assets/images/cadastre-se.png")}
              style={styles.guestImage}
            />

            <AppText style={styles.guestTitle}>
              Faça parte do TemQuemFaz
            </AppText>
            <AppText color={colors.text.secondary} style={styles.feedbackText}>
              Cadastre seu perfil, mostre seus trabalhos e encontre novos clientes.
            </AppText>

            <Pressable
              style={styles.primaryButton}
              onPress={() => router.push("/(auth)/register-provider")}
            >
              <AppText color={colors.white} style={styles.primaryButtonText}>
                Cadastrar como prestador
              </AppText>
            </Pressable>
          </View>
        ) : error || !provider ? (
          <View style={styles.feedback}>
            <AppText color={colors.text.secondary} style={styles.feedbackText}>
              {error ?? "Perfil não encontrado."}
            </AppText>
          </View>
        ) : (
          <>
            <ProviderProfileHeader provider={provider} />
            <AppText style={styles.memberSince} color={colors.text.secondary}>
              {formatProviderSince(provider.created_at)}
            </AppText>
            <AppText variant="subtitle" style={styles.sectionTitle}>Descrição do serviço</AppText>
            <AppText style={styles.description}>{provider.description || "Você ainda não adicionou uma descrição."}</AppText>

            <AppText variant="subtitle" style={styles.sectionTitle}>
              Minhas categorias
            </AppText>
            <View style={styles.chips}>
              {getProviderCategories(provider).map((category) => (
                <View key={category} style={styles.chip}>
                  <CategoryIcon categoryName={category} size={18} />
                  <AppText style={styles.chipText}>{category}</AppText>
                </View>
              ))}
            </View>

            <Pressable style={styles.actionCard} onPress={handleEditProfile}>
              <View style={styles.actionIcon}>
                <Ionicons name="person-outline" size={24} color={colors.primary} />
              </View>

              <View style={styles.actionText}>
                <AppText style={styles.actionTitle}>Editar perfil</AppText>
                <AppText style={styles.actionDescription} color={colors.text.secondary}>
                  Altere suas informações.
                </AppText>
              </View>

              <Ionicons name="chevron-forward" size={24} color={colors.primary} />
            </Pressable>

            <Pressable
              style={styles.actionCard}
              onPress={() => router.push("/providers/portfolio")}
            >
              <View style={styles.actionIcon}>
                <Ionicons name="images-outline" size={24} color={colors.primary} />
              </View>

              <View style={styles.actionText}>
                <AppText style={styles.actionTitle}>Gerenciar portfólio</AppText>
                <AppText style={styles.actionDescription} color={colors.text.secondary}>
                  Adicione e organize seus trabalhos.
                </AppText>
              </View>

              <Ionicons name="chevron-forward" size={24} color={colors.primary} />
            </Pressable>

            <AppText variant="subtitle" style={styles.sectionTitle}>Minhas publicações</AppText>
            {portfolioError ? <AppText>{portfolioError}</AppText> : <PortfolioGallery items={portfolio} author={provider} />}

            <Pressable
              style={[styles.actionCard, styles.inviteCard]}
              onPress={() =>
                Alert.alert(
                  "Indique amigos",
                  "Em breve você poderá compartilhar seu convite."
                )
              }
            >
              <View style={styles.actionIcon}>
                <Ionicons name="people-outline" size={24} color={colors.primary} />
              </View>

              <View style={styles.actionText}>
                <AppText style={styles.actionTitle}>
                  Indique amigos e ganhe mais clientes
                </AppText>
                <AppText style={styles.actionDescription} color={colors.text.secondary}>
                  Compartilhe o TemQuemFaz e aumente suas oportunidades.
                </AppText>
              </View>
            </Pressable>
          </>
        )}
      </ScrollView>

      <BottomNavigation
        active="profile"
        onPressHome={() => router.replace("/home")}
        onPressVoice={handleVoiceSearch}
        onPressProfile={() => undefined}
        voiceActive={isRecording}
        voiceDisabled={isTranscribing}
        voiceIconName={isRecording ? "stop" : "mic"}
        voiceLabel={voiceNavigationLabel}
      />

      <ConfirmActionModal
        visible={logoutModalVisible}
        iconName="log-out-outline"
        title="Deseja realmente sair da conta?"
        description="Você precisará fazer login novamente para acessar sua conta."
        confirmText="Sair da conta"
        loading={loggingOut}
        onCancel={() => setLogoutModalVisible(false)}
        onConfirm={handleLogout}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },

  content: {
    flexGrow: 1,
    paddingHorizontal: spacing.screen,
    paddingTop: spacing.lg,
    paddingBottom: 118,
  },

  header: {
    marginBottom: spacing.lg,
  },

  logoutButton: {
    minHeight: 44,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.sm,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },

  logoutText: {
    color: colors.danger,
    fontWeight: "700",
    fontSize: 16,
    lineHeight: 22,
  },

  feedback: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
    paddingBottom: spacing.md,
  },

  feedbackText: {
    textAlign: "center",
  },

  guestImage: {
    width: 230,
    height: 230,
  },

  guestLogo: {
    width: 250,
    height: 140,
  },

  guestTitle: {
    color: colors.text.primary,
    fontWeight: "800",
    fontSize: 20,
    lineHeight: 24,
    textAlign: "center",
  },

  primaryButton: {
    width: "100%",
    minHeight: 56,
    borderRadius: radius.md,
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.md,
    alignItems: "center",
    justifyContent: "center",
  },

  primaryButtonText: {
    fontWeight: "700",
  },


  memberSince: {
    textAlign: "center",
    marginTop: 2,
    marginBottom: spacing.md,
  },









  description: { color: colors.text.primary, fontSize: 16, lineHeight: 22 },

  sectionTitle: {
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
    color: colors.text.primary,
    fontWeight: "800",
  },

  chips: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
    marginBottom: spacing.md,
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

  actionCard: {
    minHeight: 88,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    backgroundColor: colors.white,
    padding: spacing.md,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    marginTop: spacing.sm,
  },

  inviteCard: {
    minHeight: 88,
    backgroundColor: colors.background.card,
  },

  actionIcon: {
    width: 32,
    alignItems: "center",
  },

  actionText: {
    flex: 1,
    minWidth: 0,
  },

  actionTitle: {
    color: colors.text.primary,
    fontWeight: "800",
    fontSize: 16,
    lineHeight: 20,
  },

  actionDescription: {
    marginTop: spacing.xs,
    fontSize: 16,
    lineHeight: 22,
  },
});
