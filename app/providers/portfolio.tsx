import { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { PortfolioPostModal } from "@/components/molecules/PortfolioPostModal";
import { getProviderById, Provider } from "@/services/provider.service";
import { AppText } from "@/components/atoms/AppText";
import { ConfirmActionModal } from "@/components/molecules/ConfirmActionModal";
import { ScreenHeader } from "@/components/molecules/ScreenHeader";
import { PortfolioItemForm } from "@/components/organisms/PortfolioItemForm";
import {
  createPortfolioItem,
  deletePortfolioItem,
  getPortfolio,
  PortfolioItem,
  SavePortfolioItemPayload,
  updatePortfolioItem,
} from "@/services/portfolio.service";
import { colors, radius, spacing } from "@/theme";
import { getProviderId } from "@/utils/authStorage";
import { getPortfolioImageUris } from "@/utils/portfolioImages";

function getErrorMessage(error: unknown, fallback: string) {
  return error instanceof Error ? error.message : fallback;
}

export default function ManagePortfolio() {
  const [providerId, setProviderId] = useState<string | null>(null);
  const [author, setAuthor] = useState<Provider | null>(null);
  const [previewItem, setPreviewItem] = useState<PortfolioItem | null>(null);
  const [items, setItems] = useState<PortfolioItem[]>([]);
  const [editingItem, setEditingItem] = useState<PortfolioItem | null>(null);
  const [deletingItem, setDeletingItem] = useState<PortfolioItem | null>(null);
  const [formVisible, setFormVisible] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const formInitialValues = useMemo(
    () =>
      editingItem
        ? {
            title: editingItem.title,
            description: editingItem.description,
            images: editingItem.images.map((image) => ({ id: image.id, uri: image.image })),
          }
        : undefined,
    [editingItem]
  );

  useEffect(() => {
    let isActive = true;

    async function loadPortfolio() {
      try {
        setLoading(true);
        setError(null);

        const currentProviderId = await getProviderId();

        if (!currentProviderId) {
          throw new Error("Entre como prestador para gerenciar o portfólio.");
        }

        const [portfolioItems, provider] = await Promise.all([getPortfolio(currentProviderId), getProviderById(currentProviderId)]);

        if (isActive) {
          setAuthor(provider);
          setProviderId(currentProviderId);
          setItems(portfolioItems);
        }
      } catch (error) {
        if (isActive) {
          setError(
            getErrorMessage(error, "Não foi possível carregar o portfólio.")
          );
        }
      } finally {
        if (isActive) {
          setLoading(false);
        }
      }
    }

    loadPortfolio();

    return () => {
      isActive = false;
    };
  }, []);

  function handleOpenCreate() {
    setEditingItem(null);
    setFormVisible(true);
  }

  function handleOpenEdit(item: PortfolioItem) {
    setEditingItem(item);
    setFormVisible(true);
  }

  function handleCloseForm() {
    if (submitting) {
      return;
    }

    setEditingItem(null);
    setFormVisible(false);
  }

  async function handleSubmit(payload: SavePortfolioItemPayload) {
    if (!providerId) {
      return;
    }

    try {
      setSubmitting(true);

      if (editingItem) {
        const updatedItem = await updatePortfolioItem(
          providerId,
          editingItem.id,
          payload
        );

        setItems((currentItems) =>
          currentItems.map((item) =>
            item.id === updatedItem.id ? updatedItem : item
          )
        );
      } else {
        const createdItem = await createPortfolioItem(providerId, payload);

        setItems((currentItems) => [createdItem, ...currentItems]);
      }

      setEditingItem(null);
      setFormVisible(false);
    } catch (error) {
      Alert.alert(
        "Portfólio",
        getErrorMessage(error, "Não foi possível salvar o trabalho.")
      );
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete() {
    if (!providerId || !deletingItem) {
      return;
    }

    try {
      setDeleting(true);
      await deletePortfolioItem(providerId, deletingItem.id);
      setItems((currentItems) =>
        currentItems.filter((item) => item.id !== deletingItem.id)
      );
      setDeletingItem(null);
    } catch (error) {
      Alert.alert(
        "Portfólio",
        getErrorMessage(error, "Não foi possível excluir o trabalho.")
      );
    } finally {
      setDeleting(false);
    }
  }

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        <ScreenHeader
          style={styles.header}
          subtitle="Mostre alguns dos trabalhos que você já realizou."
          title="Portfólio"
        />

        {loading ? (
          <AppText style={styles.feedback}>Carregando portfólio...</AppText>
        ) : error ? (
          <AppText style={styles.feedback}>{error}</AppText>
        ) : formVisible ? (
          <PortfolioItemForm
            key={editingItem?.id ?? "new"}
            initialValues={formInitialValues}
            onCancel={handleCloseForm}
            onSubmit={handleSubmit}
            submitting={submitting}
          />
        ) : (
          <>
            <Pressable style={styles.addButton} onPress={handleOpenCreate}>
              <Ionicons name="add" size={22} color={colors.white} />
              <AppText style={styles.addButtonText}>Adicionar trabalho</AppText>
            </Pressable>

            {items.length === 0 ? (
              <View style={styles.emptyState}>
                <Ionicons
                  name="images-outline"
                  size={32}
                  color={colors.text.secondary}
                />
                <AppText style={styles.emptyText}>
                  Seu portfólio ainda não possui trabalhos.
                </AppText>
              </View>
            ) : (
              <View style={styles.list}>
                {items.map((item) => (
                  <View key={item.id} style={styles.item}>
                    {getPortfolioImageUris(item).length > 0 ? (
                      <Pressable accessibilityRole="button" accessibilityLabel={`Ver fotos de ${item.title}`} onPress={() => setPreviewItem(item)} style={styles.image}>
                        <Image
                          resizeMode="contain"
                          source={{ uri: getPortfolioImageUris(item)[0] }}
                          style={styles.coverImage}
                        />
                        {getPortfolioImageUris(item).length > 1 ? (
                          <View style={styles.imageCount}>
                            <Ionicons name="images-outline" size={13} color={colors.white} />
                            <AppText style={styles.imageCountText}>
                              {getPortfolioImageUris(item).length}
                            </AppText>
                          </View>
                        ) : null}
                      </Pressable>
                    ) : (
                      <View style={styles.imagePlaceholder}>
                        <Ionicons
                          name="image-outline"
                          size={28}
                          color={colors.text.secondary}
                        />
                      </View>
                    )}

                    <View style={styles.itemContent}>
                      <Pressable accessibilityRole="button" accessibilityLabel={`Ver publicação: ${item.title}`} onPress={() => setPreviewItem(item)}>
                      <AppText style={styles.itemTitle} numberOfLines={2}>
                        {item.title}
                      </AppText>
                      <AppText style={styles.itemDescription} numberOfLines={3}>
                        {item.description}
                      </AppText>

                      </Pressable>
                      <View style={styles.itemActions}>
                        <Pressable accessibilityRole="button" accessibilityLabel={`Visualizar ${item.title}`} onPress={() => setPreviewItem(item)} style={styles.iconButton}>
                          <Ionicons name="eye-outline" size={22} color={colors.primary} />
                        </Pressable>
                        <Pressable
                          accessibilityLabel={`Editar ${item.title}`}
                          accessibilityRole="button"
                          hitSlop={8}
                          onPress={() => handleOpenEdit(item)}
                          style={styles.iconButton}
                        >
                          <Ionicons
                            name="pencil-outline"
                            size={20}
                            color={colors.primary}
                          />
                        </Pressable>

                        <Pressable
                          accessibilityLabel={`Excluir ${item.title}`}
                          accessibilityRole="button"
                          hitSlop={8}
                          onPress={() => setDeletingItem(item)}
                          style={styles.iconButton}
                        >
                          <Ionicons
                            name="trash-outline"
                            size={20}
                            color={colors.danger}
                          />
                        </Pressable>
                      </View>
                    </View>
                  </View>
                ))}
              </View>
            )}
          </>
        )}
      </ScrollView>

      {previewItem && author ? <PortfolioPostModal item={previewItem} author={author} onClose={() => setPreviewItem(null)} /> : null}

      <ConfirmActionModal
        confirmText="Excluir trabalho"
        description={`O trabalho ${deletingItem?.title ?? "selecionado"} será removido do seu portfólio.`}
        iconName="trash-outline"
        loading={deleting}
        onCancel={() => setDeletingItem(null)}
        onConfirm={handleDelete}
        title="Excluir este trabalho?"
        visible={Boolean(deletingItem)}
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
    paddingHorizontal: spacing.screen,
    paddingTop: spacing.lg,
    paddingBottom: spacing.xl,
  },

  header: {
    marginBottom: spacing.lg,
  },

  feedback: {
    color: colors.text.secondary,
    textAlign: "center",
    paddingVertical: spacing.xl,
  },

  addButton: {
    minHeight: 54,
    borderRadius: radius.md,
    backgroundColor: colors.primary,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
  },

  addButtonText: {
    color: colors.white,
    fontWeight: "800",
  },

  emptyState: {
    minHeight: 180,
    marginTop: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    backgroundColor: colors.white,
    padding: spacing.lg,
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
  },

  emptyText: {
    color: colors.text.secondary,
    textAlign: "center",
  },

  list: {
    gap: spacing.sm,
    marginTop: spacing.lg,
  },

  item: {
    minHeight: 132,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    backgroundColor: colors.white,
    padding: spacing.sm,
    flexDirection: "row",
    gap: spacing.md,
  },

  image: {
    width: 112,
    height: 112,
    borderRadius: radius.sm,
    backgroundColor: colors.background.card,
  },

  imagePlaceholder: {
    width: 112,
    height: 112,
    borderRadius: radius.sm,
    backgroundColor: colors.background.card,
    alignItems: "center",
    justifyContent: "center",
  },

  coverImage: { width: "100%", height: "100%", borderRadius: radius.sm },

  imageCount: {
    position: "absolute",
    right: spacing.xs,
    bottom: spacing.xs,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    minWidth: 44,
    gap: 4,
    height: 24,
    paddingHorizontal: spacing.xs,
    borderRadius: 4,
    backgroundColor: "rgba(0, 0, 0, 0.65)",
  },

  imageCountText: { fontSize: 12, lineHeight: 16, color: colors.white },

  itemContent: {
    flex: 1,
    minWidth: 0,
  },

  itemTitle: {
    color: colors.text.primary,
    fontWeight: "800",
    fontSize: 16,
    lineHeight: 20,
  },

  itemDescription: {
    color: colors.text.secondary,
    fontSize: 13,
    lineHeight: 18,
    marginTop: spacing.xs,
  },

  itemActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: spacing.sm,
    marginTop: "auto",
  },

  iconButton: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
});
