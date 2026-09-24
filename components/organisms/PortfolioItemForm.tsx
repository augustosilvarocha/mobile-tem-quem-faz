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
import { colors, radius, spacing } from "@/theme";

type PortfolioItemFormValues = {
  title: string;
  description: string;
  imageUri: string | null;
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
  imageUri: null,
};

export function PortfolioItemForm({
  initialValues = EMPTY_VALUES,
  onCancel,
  onSubmit,
  submitting = false,
}: PortfolioItemFormProps) {
  const [title, setTitle] = useState(initialValues.title);
  const [description, setDescription] = useState(initialValues.description);
  const [imageUri, setImageUri] = useState(initialValues.imageUri);

  async function handleChooseImage() {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (status !== ImagePicker.PermissionStatus.GRANTED) {
      Alert.alert(
        "Permissao necessaria",
        "Permita o acesso as fotos para escolher uma imagem."
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      allowsEditing: false,
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8,
    });

    if (!result.canceled) {
      setImageUri(result.assets[0].uri);
    }
  }

  function handleSubmit() {
    const normalizedTitle = title.trim();
    const normalizedDescription = description.trim();

    if (!normalizedTitle || !normalizedDescription) {
      Alert.alert(
        "Campos obrigatorios",
        "Preencha o titulo e a descricao do trabalho."
      );
      return;
    }

    onSubmit({
      title: normalizedTitle,
      description: normalizedDescription,
      imageUri,
    });
  }

  return (
    <View style={styles.container}>
      <AppText style={styles.label}>Imagem do trabalho</AppText>

      <Pressable
        accessibilityLabel="Escolher imagem do trabalho"
        accessibilityRole="button"
        disabled={submitting}
        onPress={handleChooseImage}
        style={({ pressed }) => [
          styles.imagePicker,
          pressed && styles.pressed,
          submitting && styles.disabled,
        ]}
      >
        {imageUri ? (
          <Image
            resizeMode="contain"
            source={{ uri: imageUri }}
            style={styles.image}
          />
        ) : (
          <View style={styles.imagePlaceholder}>
            <Ionicons
              name="image-outline"
              size={36}
              color={colors.primary}
            />
            <AppText style={styles.imagePlaceholderText}>
              Escolher imagem
            </AppText>
          </View>
        )}

        <View style={styles.imageAction}>
          <Ionicons name="images-outline" size={18} color={colors.white} />
        </View>
      </Pressable>

      <AppText style={styles.label}>Titulo</AppText>
      <TextInput
        editable={!submitting}
        maxLength={255}
        onChangeText={setTitle}
        placeholder="Ex.: Reforma de cozinha"
        placeholderTextColor={colors.text.secondary}
        style={styles.input}
        value={title}
      />

      <AppText style={styles.label}>Descricao</AppText>
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
          disabled={submitting}
          onPress={onCancel}
          style={[styles.cancelButton, submitting && styles.disabled]}
        >
          <AppText style={styles.cancelButtonText}>Cancelar</AppText>
        </Pressable>

        <Pressable
          disabled={submitting}
          onPress={handleSubmit}
          style={[styles.submitButton, submitting && styles.disabled]}
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

  imagePicker: {
    width: "100%",
    aspectRatio: 4 / 3,
    maxHeight: 280,
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

  imagePlaceholder: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
  },

  imagePlaceholderText: {
    color: colors.primary,
    fontWeight: "700",
  },

  imageAction: {
    position: "absolute",
    right: spacing.sm,
    bottom: spacing.sm,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
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
