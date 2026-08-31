import { useEffect, useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
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
import { ProviderProfileForm } from "@/components/organisms/ProviderProfileForm";
import {
  CreateProviderPayload,
  deleteProvider,
  getProviderById,
  Provider,
  updateProvider,
} from "@/services/provider.service";
import { colors, radius, spacing } from "@/theme";
import {
  clearAuthSession,
  getProviderId,
  saveProviderId,
  saveProviderName,
} from "@/utils/authStorage";

export default function EditProviderProfile() {
  const { providerId: providerIdParam } = useLocalSearchParams<{
    providerId?: string;
  }>();
  const [provider, setProvider] = useState<Provider | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    let isActive = true;

    async function loadProvider() {
      try {
        setLoading(true);
        setError(null);

        const providerId = providerIdParam ?? (await getProviderId());

        if (!providerId) {
          if (isActive) {
            setError("Entre como prestador para editar seu perfil.");
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

        console.log("Erro ao carregar perfil para edicao:", error);
        setError("Nao foi possivel carregar os dados do perfil.");
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
  }, [providerIdParam]);

  async function handleUpdateProvider(payload: CreateProviderPayload) {
    if (!provider) {
      return;
    }

    const updatedProvider = await updateProvider(provider.id, payload);

    await saveProviderName(updatedProvider.name);
    await saveProviderId(updatedProvider.id);

    router.replace("/providers/profile");
  }

  async function handleDeleteProvider() {
    if (!provider) {
      return;
    }

    try {
      setDeleting(true);
      await deleteProvider(provider.id);
      await clearAuthSession();
      setDeleteModalVisible(false);
      router.replace("/");
    } catch (error) {
      console.log("Erro ao excluir conta:", error);
      Alert.alert("Erro", "Nao foi possivel excluir a conta.");
    } finally {
      setDeleting(false);
    }
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <ScreenHeader
          style={styles.header}
          subtitle="Atualize seus dados de prestador."
          title="Editar perfil"
        />

        {loading ? (
          <View style={styles.feedback}>
            <AppText color={colors.text.secondary}>Carregando dados...</AppText>
          </View>
        ) : error || !provider ? (
          <View style={styles.feedback}>
            <AppText color={colors.text.secondary}>
              {error ?? "Perfil nao encontrado."}
            </AppText>
          </View>
        ) : (
          <>
            <ProviderProfileForm
              initialValues={{
                categoryIds: provider.categories,
                cityId: provider.city,
                description: provider.description,
                name: provider.name,
                phone: provider.user.phone,
                photoUri: provider.photo,
                neighborhood: provider.neighborhood,
                street: provider.street,
                number: provider.number,
                address_complement: provider.address_complement,
                reference_point: provider.reference_point,
                latitude: provider.latitude,
                longitude: provider.longitude,
                show_location_on_map: provider.show_location_on_map,
              }}
              submitLabel="Salvar alteracoes"
              submittingLabel="Salvando..."
              onSubmit={handleUpdateProvider}
            />

            <Pressable
              style={styles.deleteButton}
              onPress={() => setDeleteModalVisible(true)}
            >
              <Ionicons name="trash-outline" size={20} color={colors.danger} />
              <AppText style={styles.deleteButtonText}>Excluir conta</AppText>
            </Pressable>
          </>
        )}
      </ScrollView>

      <ConfirmActionModal
        visible={deleteModalVisible}
        iconName="trash-outline"
        title="Deseja excluir sua conta?"
        description="Essa acao remove seu perfil de prestador e nao pode ser desfeita."
        confirmText="Excluir conta"
        loading={deleting}
        onCancel={() => setDeleteModalVisible(false)}
        onConfirm={handleDeleteProvider}
      />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },

  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: spacing.screen,
    paddingBottom: spacing.xl,
  },

  header: {
    marginTop: spacing.lg,
    marginBottom: spacing.md,
  },

  feedback: {
    paddingTop: spacing.xl,
    alignItems: "center",
  },

  deleteButton: {
    height: 58,
    borderWidth: 1,
    borderColor: colors.danger,
    borderRadius: radius.md,
    backgroundColor: colors.white,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: spacing.sm,
    marginTop: spacing.md,
  },

  deleteButtonText: {
    color: colors.danger,
    fontWeight: "800",
  },
});
