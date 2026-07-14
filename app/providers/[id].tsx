import { useEffect, useState } from "react";
import {
  Alert,
  Image,
  Linking,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";

import { AppText } from "@/components/atoms/AppText";
import { ConfirmActionModal } from "@/components/molecules/ConfirmActionModal";
import { ScreenHeader } from "@/components/molecules/ScreenHeader";
import { ZoomableImageModal } from "@/components/molecules/ZoomableImageModal";
import { BottomNavigation } from "@/components/organisms/BottomNavigation";
import { useVoiceSearch } from "@/hooks/useVoiceSearch";
import { getProviderById, Provider } from "@/services/provider.service";
import { colors, radius, spacing } from "@/theme";
import { getProviderId } from "@/utils/authStorage";
import { sanitizePhone } from "@/utils/phone";
import { formatRecordingDuration } from "@/utils/time";

const WHATSAPP_DEFAULT_MESSAGE =
  "Olá, vim pelo aplicativo TemQuemFaz estou precisando dos seus serviços";

function getProviderCategories(provider: Provider) {
  return provider.category_names?.length
    ? provider.category_names
    : ["Prestador de servico"];
}

function getProviderLocation(provider: Provider) {
  return `${provider.city_name} - ${provider.uf}`;
}

function getWhatsAppNumber(phone: string) {
  const sanitizedPhone = sanitizePhone(phone);

  if (!sanitizedPhone) {
    return "";
  }

  return sanitizedPhone.startsWith("55")
    ? sanitizedPhone
    : `55${sanitizedPhone}`;
}

export default function ProviderDetails() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [provider, setProvider] = useState<Provider | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [photoModalVisible, setPhotoModalVisible] = useState(false);
  const [whatsAppModalVisible, setWhatsAppModalVisible] = useState(false);
  const { durationMillis, handleVoiceSearch, isRecording, isTranscribing } = useVoiceSearch({
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
      ? formatRecordingDuration(durationMillis)
      : "Busca por voz";

  useEffect(() => {
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
        setError("Nao foi possivel carregar o prestador.");
      } finally {
        if (isActive) {
          setLoading(false);
        }
      }
    }

    if (id) {
      loadProvider();
    }

    return () => {
      isActive = false;
    };
  }, [id]);

  async function handleOpenOwnProfile() {
    const providerId = await getProviderId();

    if (!providerId) {
      Alert.alert(
        "Perfil",
        "Entre ou cadastre-se como prestador para acessar seu perfil."
      );
      return;
    }

    router.push("/providers/profile");
  }

  async function handleOpenWhatsApp() {
    if (!provider) {
      return;
    }

    const whatsAppNumber = getWhatsAppNumber(provider.user.phone);

    if (!whatsAppNumber) {
      Alert.alert("WhatsApp", "Este prestador ainda nao possui telefone.");
      return;
    }

    try {
      const message = encodeURIComponent(WHATSAPP_DEFAULT_MESSAGE);

      await Linking.openURL(`https://wa.me/${whatsAppNumber}?text=${message}`);
      setWhatsAppModalVisible(false);
    } catch (error) {
      console.log("Erro ao abrir WhatsApp:", error);
      Alert.alert("WhatsApp", "Nao foi possivel abrir o WhatsApp.");
    }
  }

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <ScreenHeader title="Detalhes do Prestador" style={styles.header} />

        {loading ? (
          <View style={styles.feedback}>
            <AppText color={colors.text.secondary}>
              Carregando prestador...
            </AppText>
          </View>
        ) : error || !provider ? (
          <View style={styles.feedback}>
            <AppText color={colors.text.secondary}>
              {error ?? "Prestador nao encontrado."}
            </AppText>
          </View>
        ) : (
          <>
            <View style={styles.profileCard}>
              {provider.photo ? (
                <Pressable
                  accessibilityLabel={`Ampliar foto de ${provider.name}`}
                  accessibilityRole="button"
                  onPress={() => setPhotoModalVisible(true)}
                  style={({ pressed }) => [
                    styles.avatarButton,
                    pressed && styles.avatarPressed,
                  ]}
                >
                  <Image
                    source={{ uri: provider.photo }}
                    style={styles.avatar}
                  />
                </Pressable>
              ) : (
                <View style={styles.avatarPlaceholder}>
                  <Ionicons name="person" size={32} color={colors.text.secondary} />
                </View>
              )}

              <View style={styles.cardInfo}>
                <AppText style={styles.providerName} numberOfLines={1}>
                  {provider.name}
                </AppText>
                <AppText style={styles.providerCategory} numberOfLines={1}>
                  {getProviderCategories(provider)[0]}
                </AppText>

                <View style={styles.locationRow}>
                  <Ionicons name="location" size={14} color={colors.primary} />
                  <AppText style={styles.location} numberOfLines={1}>
                    {getProviderLocation(provider)}
                  </AppText>
                </View>
              </View>
            </View>

            <AppText style={styles.sectionTitle}>Descrição do serviço</AppText>
            <View style={styles.descriptionBox}>
              <AppText style={styles.description}>
                {provider.description ||
                  "Este prestador ainda nao adicionou uma descricao."}
              </AppText>
            </View>

            <AppText style={styles.sectionTitle}>Categorias</AppText>
            <View style={styles.chips}>
              {getProviderCategories(provider).map((category) => (
                <View key={category} style={styles.chip}>
                  <Ionicons name="construct" size={18} color={colors.primary} />
                  <AppText style={styles.chipText}>{category}</AppText>
                </View>
              ))}
            </View>

            <Pressable
              style={styles.whatsAppButton}
              onPress={() => setWhatsAppModalVisible(true)}
            >
              <Ionicons name="logo-whatsapp" size={28} color={colors.white} />
              <AppText style={styles.whatsAppButtonText}>
                Falar no Whatsapp
              </AppText>
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

      {provider ? (
        <ConfirmActionModal
          visible={whatsAppModalVisible}
          variant="primary"
          iconName="logo-whatsapp"
          title="Abrir conversa no WhatsApp?"
          description={`Voce sera redirecionado para o WhatsApp para conversar com ${provider.name}.`}
          confirmText="Abrir Whatsapp"
          onCancel={() => setWhatsAppModalVisible(false)}
          onConfirm={handleOpenWhatsApp}
        />
      ) : null}

      {provider?.photo ? (
        <ZoomableImageModal
          imageUri={provider.photo}
          onClose={() => setPhotoModalVisible(false)}
          visible={photoModalVisible}
        />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
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

  profileCard: {
    minHeight: 124,
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

  avatarButton: {
    width: 78,
    height: 78,
    borderRadius: 39,
  },

  avatarPressed: {
    opacity: 0.75,
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

  locationRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: spacing.xs,
  },

  location: {
    color: colors.primary,
    fontWeight: "700",
  },

  sectionTitle: {
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
    color: colors.text.primary,
    fontWeight: "800",
    fontSize: 18,
    lineHeight: 22,
  },

  descriptionBox: {
    minHeight: 86,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    backgroundColor: colors.white,
    padding: spacing.md,
  },

  description: {
    color: colors.text.primary,
    fontSize: 15,
    lineHeight: 20,
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
    fontSize: 15,
    lineHeight: 20,
  },

  whatsAppButton: {
    height: 64,
    borderRadius: radius.md,
    backgroundColor: colors.primary,
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
