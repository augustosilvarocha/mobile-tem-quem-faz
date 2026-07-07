import { useEffect, useState } from "react";
import {
  Alert,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";

import { AppText } from "@/components/atoms/AppText";
import { ConfirmActionModal } from "@/components/molecules/ConfirmActionModal";
import { BottomNavigation } from "@/components/organisms/BottomNavigation";
import { getProviderById, Provider } from "@/services/provider.service";
import { colors, radius, spacing } from "@/theme";
import { clearAuthSession, getProviderId } from "@/utils/authStorage";

function getFirstName(name: string) {
  return name.trim().split(/\s+/)[0] || name;
}

function getProviderCategories(provider: Provider) {
  return provider.category_names?.length
    ? provider.category_names
    : ["Prestador de servico"];
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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [logoutModalVisible, setLogoutModalVisible] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  useEffect(() => {
    let isActive = true;

    async function loadProvider() {
      try {
        setLoading(true);
        setError(null);

        const providerId = await getProviderId();

        if (!providerId) {
          if (isActive) {
            setError("Entre como prestador para acessar seu perfil.");
          }
          return;
        }

        const data = await getProviderById(providerId);

        if (isActive) {
          setProvider(data);
        }
      } catch (error) {
        if (!isActive) {
          return;
        }

        console.log("Erro ao carregar perfil:", error);
        setError("Nao foi possivel carregar seu perfil.");
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
  }, []);

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
      pathname: "/provider/edit",
      params: {
        providerId: String(provider.id),
      },
    });
  }

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Pressable style={styles.backButton} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={22} color={colors.text.primary} />
          </Pressable>

          <AppText style={styles.headerTitle}>Perfil</AppText>

          <Pressable
            style={styles.logoutButton}
            onPress={() => setLogoutModalVisible(true)}
          >
            <Ionicons name="log-out-outline" size={16} color={colors.danger} />
            <AppText style={styles.logoutText}>Sair</AppText>
          </Pressable>
        </View>

        {loading ? (
          <View style={styles.feedback}>
            <AppText color={colors.text.secondary}>Carregando perfil...</AppText>
          </View>
        ) : error || !provider ? (
          <View style={styles.feedback}>
            <AppText color={colors.text.secondary} style={styles.feedbackText}>
              {error ?? "Perfil nao encontrado."}
            </AppText>

            <Pressable
              style={styles.primaryButton}
              onPress={() => router.push("/(auth)/login")}
            >
              <AppText color={colors.white} style={styles.primaryButtonText}>
                Entrar ou cadastrar
              </AppText>
            </Pressable>
          </View>
        ) : (
          <>
            <AppText style={styles.greeting}>Ola, {getFirstName(provider.name)}!</AppText>
            <AppText style={styles.memberSince} color={colors.text.secondary}>
              {formatProviderSince(provider.created_at)}
            </AppText>

            <View style={styles.profileCard}>
              {provider.photo ? (
                <Image source={{ uri: provider.photo }} style={styles.avatar} />
              ) : (
                <View style={styles.avatarPlaceholder}>
                  <Ionicons name="person" size={34} color={colors.text.secondary} />
                </View>
              )}

              <View style={styles.cardInfo}>
                <AppText style={styles.providerName} numberOfLines={1}>
                  {provider.name}
                </AppText>
                <AppText style={styles.providerCategory} numberOfLines={1}>
                  {getProviderCategories(provider)[0]}
                </AppText>

                <View style={styles.infoRow}>
                  <Ionicons name="location" size={14} color={colors.primary} />
                  <AppText style={styles.infoText} numberOfLines={1}>
                    {provider.city_name} - {provider.uf}
                  </AppText>
                </View>
              </View>
            </View>

            <AppText style={styles.sectionTitle}>Minhas categorias</AppText>
            <View style={styles.chips}>
              {getProviderCategories(provider).map((category) => (
                <View key={category} style={styles.chip}>
                  <Ionicons name="construct" size={14} color={colors.primary} />
                  <AppText style={styles.chipText}>{category}</AppText>
                </View>
              ))}
            </View>

            <Pressable style={styles.actionCard} onPress={handleEditProfile}>
              <View style={styles.actionIcon}>
                <Ionicons name="person-outline" size={20} color={colors.primary} />
              </View>

              <View style={styles.actionText}>
                <AppText style={styles.actionTitle}>Editar perfil</AppText>
                <AppText style={styles.actionDescription} color={colors.text.secondary}>
                  Altere suas informacoes.
                </AppText>
              </View>

              <Ionicons name="chevron-forward" size={20} color={colors.primary} />
            </Pressable>

            <Pressable
              style={[styles.actionCard, styles.inviteCard]}
              onPress={() =>
                Alert.alert(
                  "Indique amigos",
                  "Em breve voce podera compartilhar seu convite."
                )
              }
            >
              <View style={styles.actionIcon}>
                <Ionicons name="people-outline" size={22} color={colors.primary} />
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
        onPressVoice={() => console.log("Buscar por voz")}
        onPressProfile={() => undefined}
      />

      <ConfirmActionModal
        visible={logoutModalVisible}
        iconName="log-out-outline"
        title="Deseja realmente sair da conta?"
        description="Voce precisara fazer login novamente para acessar sua conta."
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
    padding: spacing.lg,
    paddingBottom: 118,
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: spacing.lg,
  },

  backButton: {
    width: 34,
    height: 34,
    alignItems: "center",
    justifyContent: "center",
  },

  headerTitle: {
    flex: 1,
    color: colors.text.primary,
    fontWeight: "700",
  },

  logoutButton: {
    height: 30,
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
    fontSize: 12,
    lineHeight: 16,
  },

  feedback: {
    paddingTop: spacing.xl,
    alignItems: "center",
    gap: spacing.md,
  },

  feedbackText: {
    textAlign: "center",
  },

  primaryButton: {
    minHeight: 46,
    borderRadius: radius.md,
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.md,
    alignItems: "center",
    justifyContent: "center",
  },

  primaryButtonText: {
    fontWeight: "700",
  },

  greeting: {
    color: colors.text.primary,
    fontWeight: "800",
    fontSize: 18,
    lineHeight: 22,
  },

  memberSince: {
    marginTop: 2,
    marginBottom: spacing.md,
  },

  profileCard: {
    minHeight: 112,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    backgroundColor: colors.white,
    padding: spacing.md,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
  },

  avatar: {
    width: 78,
    height: 78,
    borderRadius: 39,
  },

  avatarPlaceholder: {
    width: 78,
    height: 78,
    borderRadius: 39,
    backgroundColor: colors.background.card,
    alignItems: "center",
    justifyContent: "center",
  },

  cardInfo: {
    flex: 1,
    minWidth: 0,
  },

  providerName: {
    color: colors.text.primary,
    fontWeight: "800",
  },

  providerCategory: {
    color: colors.text.secondary,
    marginTop: 2,
  },

  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: spacing.xs,
  },

  infoText: {
    color: colors.primary,
    fontWeight: "700",
  },

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
    minHeight: 28,
    borderRadius: radius.sm,
    backgroundColor: colors.background.card,
    paddingHorizontal: spacing.sm,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
  },

  chipText: {
    color: colors.primary,
    fontWeight: "700",
    fontSize: 12,
    lineHeight: 16,
  },

  actionCard: {
    minHeight: 66,
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
    minHeight: 76,
    backgroundColor: colors.background.card,
  },

  actionIcon: {
    width: 28,
    alignItems: "center",
  },

  actionText: {
    flex: 1,
    minWidth: 0,
  },

  actionTitle: {
    color: colors.text.primary,
    fontWeight: "800",
    fontSize: 13,
    lineHeight: 17,
  },

  actionDescription: {
    marginTop: 2,
    fontSize: 11,
    lineHeight: 15,
  },
});
