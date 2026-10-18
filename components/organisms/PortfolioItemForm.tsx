import { useState } from "react";
import {
  Alert,
  Image,
  Pressable,
  StyleSheet,
  TextInput,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";

import { AppText } from "@/components/atoms/AppText";
import { SavePortfolioItemPayload } from "@/services/portfolio.service";
import {
  appendPortfolioImages,
  MAX_PORTFOLIO_IMAGES,
  type PortfolioImageDraft,
} from "@/utils/portfolioImages";
import { colors, radius, spacing } from "@/theme";

type PortfolioItemFormValues = {
  title: string;
  description: string;
  images: PortfolioImageDraft[];
};

type PortfolioItemFormProps = {
  initialValues?: PortfolioItemFormValues;
  onCancel: () => void;
  onSubmit: (payload: SavePortfolioItemPayload) => void | Promise<void>;
  submitting?: boolean;
};

const EMPTY_VALUES: PortfolioItemFormValues = {
  title: "",
  description: "",
  images: [],
};

export function PortfolioItemForm({
  initialValues = EMPTY_VALUES,
  onCancel,
  onSubmit,
  submitting = false,
}: PortfolioItemFormProps) {
  const [title, setTitle] = useState(initialValues.title);
  const [description, setDescription] = useState(initialValues.description);
  const [images, setImages] = useState(initialValues.images);
  const [choosingImages, setChoosingImages] = useState(false);

  async function handleChooseImages() {
    if (choosingImages || submitting || images.length >= MAX_PORTFOLIO_IMAGES) {
      return;
    }

    setChoosingImages(true);

    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (status !== ImagePicker.PermissionStatus.GRANTED) {
        Alert.alert(
          "Permissão necessária",
          "Permita o acesso às fotos para escolher as imagens."
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        allowsEditing: false,
        allowsMultipleSelection: true,
        mediaTypes: ["images"],
        orderedSelection: true,
        quality: 0.8,
        selectionLimit: MAX_PORTFOLIO_IMAGES - images.length,
      });

      if (!result.canceled) {
        setImages((current) => appendPortfolioImages(
          current,
          result.assets.map((asset) => ({ uri: asset.uri, file: asset.file }))
        ));
      }
    } catch {
      Alert.alert(
        "Fotos do trabalho",
        "Não foi possível abrir as fotos. Tente novamente."
      );
    } finally {
      setChoosingImages(false);
    }
  }

  function handleSubmit() {
    const normalizedTitle = title.trim();
    const normalizedDescription = description.trim();

    if (!normalizedTitle || !normalizedDescription) {
      Alert.alert(
        "Campos obrigatórios",
        "Preencha o título e a descrição do trabalho."
      );
      return;
    }

    onSubmit({
      title: normalizedTitle,
      description: normalizedDescription,
      images,
    });
  }

  return (
    <View style={styles.container}>
      <View style={styles.photoHeader}>
        <AppText style={styles.label}>Fotos do trabalho</AppText>
        <AppText color={colors.text.secondary}>
          {images.length}/{MAX_PORTFOLIO_IMAGES}
        </AppText>
      </View>

      <View style={styles.photoGrid}>
        {images.map((image, index) => (
          <View key={image.id ?? image.uri} style={styles.photoSlot}>
            <View style={styles.photo}>
              <Image
                accessibilityLabel={`Foto ${index + 1} do trabalho`}
                resizeMode="contain"
                source={{ uri: image.uri }}
                style={styles.image}
              />
              <Pressable
                accessibilityLabel={`Remover foto ${index + 1}`}
                accessibilityRole="button"
                disabled={submitting || choosingImages}
                hitSlop={4}
                onPress={() => setImages((current) => current.filter((_, position) => position !== index))}
                style={styles.removePhotoButton}
              >
                <Ionicons name="close" size={20} color={colors.white} />
              </Pressable>
            </View>
          </View>
        ))}
      </View>

      {images.length < MAX_PORTFOLIO_IMAGES ? (
        <Pressable
          accessibilityLabel="Adicionar fotos ao trabalho"
          accessibilityRole="button"
          disabled={submitting || choosingImages}
          onPress={handleChooseImages}
          style={({ pressed }) => [
            styles.addPhotosButton,
            pressed && styles.pressed,
            (submitting || choosingImages) && styles.disabled,
          ]}
        >
          <Ionicons name="images-outline" size={22} color={colors.primary} />
          <AppText style={styles.addPhotosText}>
            {choosingImages ? "Abrindo fotos..." : "Adicionar fotos"}
          </AppText>
        </Pressable>
      ) : null}

      <AppText style={styles.label}>Título</AppText>
      <TextInput
        editable={!submitting}
        maxLength={255}
        onChangeText={setTitle}
        placeholder="Ex.: Reforma de cozinha"
        placeholderTextColor={colors.text.secondary}
        style={styles.input}
        value={title}
      />

      <AppText style={styles.label}>Descrição</AppText>
      <TextInput
        editable={!submitting}
        multiline
        onChangeText={setDescription}
        placeholder="Conte brevemente como foi realizado o trabalho"
        placeholderTextColor={colors.text.secondary}
        style={[styles.input, styles.descriptionInput]}
        textAlignVertical="top"
        value={description}
      />

      <View style={styles.actions}>
        <Pressable
          disabled={submitting || choosingImages}
          onPress={onCancel}
          style={[styles.cancelButton, (submitting || choosingImages) && styles.disabled]}
        >
          <AppText style={styles.cancelButtonText}>Cancelar</AppText>
        </Pressable>

        <Pressable
          disabled={submitting || choosingImages}
          onPress={handleSubmit}
          style={[styles.submitButton, (submitting || choosingImages) && styles.disabled]}
        >
          <Ionicons name="checkmark" size={20} color={colors.white} />
          <AppText style={styles.submitButtonText}>
            {submitting ? "Salvando..." : "Salvar"}
          </AppText>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.sm,
  },

  label: {
    color: colors.text.primary,
    fontWeight: "700",
    fontSize: 15,
    lineHeight: 20,
    marginTop: spacing.xs,
  },

  photoHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  photoGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginHorizontal: -4,
  },

  photoSlot: {
    width: "33.333%",
    padding: 4,
  },

  photo: {
    aspectRatio: 1,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    backgroundColor: colors.background.card,
    overflow: "hidden",
  },

  image: {
    width: "100%",
    height: "100%",
  },

  removePhotoButton: {
    position: "absolute",
    right: spacing.sm,
    top: spacing.xs,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "rgba(0, 0, 0, 0.65)",
    alignItems: "center",
    justifyContent: "center",
  },

  addPhotosButton: {
    minHeight: 52,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
    paddingHorizontal: spacing.sm,
  },

  addPhotosText: {
    color: colors.primary,
    fontWeight: "700",
    flexShrink: 1,
  },

  input: {
    minHeight: 52,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    backgroundColor: colors.white,
    paddingHorizontal: spacing.md,
    color: colors.text.primary,
    fontSize: 15,
  },

  descriptionInput: {
    minHeight: 120,
    paddingTop: spacing.md,
    paddingBottom: spacing.md,
  },

  actions: {
    flexDirection: "row",
    gap: spacing.sm,
    marginTop: spacing.md,
  },

  cancelButton: {
    flex: 1,
    minHeight: 52,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    backgroundColor: colors.white,
    alignItems: "center",
    justifyContent: "center",
  },

  cancelButtonText: {
    color: colors.text.primary,
    fontWeight: "700",
  },

  submitButton: {
    flex: 1,
    minHeight: 52,
    borderRadius: radius.md,
    backgroundColor: colors.primary,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.xs,
  },

  submitButtonText: {
    color: colors.white,
    fontWeight: "800",
  },

  pressed: {
    opacity: 0.75,
  },

  disabled: {
    opacity: 0.6,
  },
});
