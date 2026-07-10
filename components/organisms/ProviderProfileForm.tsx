import { useEffect, useMemo, useState } from "react";
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
import { SelectField, SelectOption } from "@/components/molecules/SelectField";
import { CategorySelector } from "@/components/organisms/CategorySelector";
import { useCities } from "@/hooks/useCities";
import { useStates } from "@/hooks/useStates";
import { CreateProviderPayload } from "@/services/provider.service";
import { colors, radius, spacing, typography } from "@/theme";
import { isValidPhone, sanitizePhone } from "@/utils/phone";

export type ProviderProfileFormInitialValues = {
  categoryIds?: number[];
  cityId?: number;
  description?: string;
  name?: string;
  phone?: string;
  photoUri?: string | null;
};

type ProviderProfileFormProps = {
  initialValues?: ProviderProfileFormInitialValues;
  onSubmit: (payload: CreateProviderPayload) => Promise<void>;
  submitLabel: string;
  submittingLabel: string;
};

export function ProviderProfileForm({
  initialValues,
  onSubmit,
  submitLabel,
  submittingLabel,
}: ProviderProfileFormProps) {
  const [name, setName] = useState(initialValues?.name ?? "");
  const [description, setDescription] = useState(
    initialValues?.description ?? ""
  );
  const [phone, setPhone] = useState(
    sanitizePhone(initialValues?.phone ?? "")
  );
  const [phoneError, setPhoneError] = useState("");
  const [selectedCategories, setSelectedCategories] = useState<number[]>(
    () => initialValues?.categoryIds ?? []
  );
  const [photo, setPhoto] = useState<string | null>(
    initialValues?.photoUri ?? null
  );
  const [photoChanged, setPhotoChanged] = useState(false);
  const [selectedState, setSelectedState] = useState<SelectOption | null>(null);
  const [selectedCity, setSelectedCity] = useState<SelectOption | null>(null);
  const [initialCityApplied, setInitialCityApplied] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const { states, loading: loadingStates } = useStates();
  const { cities, loading: loadingCities } = useCities();

  const stateOptions: SelectOption[] = useMemo(
    () => states.map((state) => ({ id: state.uf, label: state.uf })),
    [states]
  );

  const cityOptions: SelectOption[] = useMemo(() => {
    if (!selectedState) {
      return [];
    }

    return cities
      .filter((city) => city.uf === selectedState.id)
      .map((city) => ({ id: city.id, label: city.name }));
  }, [cities, selectedState]);

  useEffect(() => {
    if (initialCityApplied || !initialValues?.cityId || cities.length === 0) {
      return;
    }

    const city = cities.find((city) => city.id === initialValues.cityId);

    if (!city) {
      return;
    }

    setSelectedState({ id: city.uf, label: city.uf });
    setSelectedCity({ id: city.id, label: city.name });
    setInitialCityApplied(true);
  }, [cities, initialCityApplied, initialValues?.cityId]);

  function handleSelectState(option: SelectOption) {
    setSelectedState(option);
    setSelectedCity(null);
  }

  async function handlePickPhoto() {
    Alert.alert("Foto de perfil", "Escolha uma opcao", [
      { text: "Camera", onPress: takePhoto },
      { text: "Galeria", onPress: pickFromGallery },
      { text: "Cancelar", style: "cancel" },
    ]);
  }

  async function takePhoto() {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();

    if (status !== "granted") {
      Alert.alert(
        "Permissao necessaria",
        "Precisamos de acesso a camera para tirar a foto."
      );
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });

    if (!result.canceled) {
      setPhoto(result.assets[0].uri);
      setPhotoChanged(true);
    }
  }

  async function pickFromGallery() {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (status !== "granted") {
      Alert.alert(
        "Permissao necessaria",
        "Precisamos de acesso a galeria para escolher a foto."
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });

    if (!result.canceled) {
      setPhoto(result.assets[0].uri);
      setPhotoChanged(true);
    }
  }

  async function handleSubmit() {
    if (!isValidPhone(phone)) {
      setPhoneError("Numero de telefone invalido");
      return;
    }

    setPhoneError("");

    if (!name.trim()) {
      Alert.alert("Atencao", "Informe seu nome completo.");
      return;
    }

    if (!selectedCity) {
      Alert.alert("Atencao", "Selecione o estado e a cidade.");
      return;
    }

    if (selectedCategories.length === 0) {
      Alert.alert("Atencao", "Selecione ao menos uma categoria.");
      return;
    }

    try {
      setSubmitting(true);

      await onSubmit({
        phone,
        name,
        city: Number(selectedCity.id),
        photoUri: photoChanged ? photo : null,
        description,
        categories: selectedCategories,
      });
    } catch (err: any) {
      console.log("Erro ao enviar dados do prestador:", err);
      Alert.alert(
        "Erro",
        err.message || "Nao foi possivel salvar os dados do prestador."
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <View style={styles.form}>
      <TextInput
        value={name}
        onChangeText={setName}
        placeholder="Nome completo"
        placeholderTextColor={colors.text.placeholder}
        style={styles.input}
      />

      <TextInput
        value={phone}
        onChangeText={(text) => {
          setPhone(sanitizePhone(text));
          setPhoneError("");
        }}
        placeholder="WhatsApp"
        placeholderTextColor={colors.text.placeholder}
        keyboardType="phone-pad"
        maxLength={11}
        style={styles.input}
      />

      {phoneError ? (
        <AppText
          variant="profession"
          color={colors.danger}
          style={styles.errorText}
        >
          {phoneError}
        </AppText>
      ) : null}

      <SelectField
        placeholder="Estado"
        value={selectedState}
        options={stateOptions}
        onSelect={handleSelectState}
        loading={loadingStates}
        searchPlaceholder="Buscar estado"
      />

      <SelectField
        placeholder="Cidade"
        value={selectedCity}
        options={cityOptions}
        onSelect={setSelectedCity}
        disabled={!selectedState}
        loading={loadingCities}
        searchPlaceholder="Buscar cidade"
      />

      <AppText variant="name" style={styles.label}>
        Foto de perfil
      </AppText>

      <Pressable style={styles.photoBox} onPress={handlePickPhoto}>
        {photo ? (
          <Image source={{ uri: photo }} style={styles.photoPreview} />
        ) : (
          <>
            <Ionicons name="camera" size={22} color={colors.primary} />
            <AppText variant="profession" color={colors.primary}>
              Adicionar foto
            </AppText>
          </>
        )}
      </Pressable>

      <AppText variant="name" style={styles.label}>
        Descricao do seu servico
      </AppText>

      <TextInput
        value={description}
        onChangeText={setDescription}
        placeholder="Fale sobre seus servicos..."
        placeholderTextColor={colors.text.placeholder}
        multiline
        style={[styles.input, styles.textArea]}
      />

      <CategorySelector
        selectedCategories={selectedCategories}
        onChange={setSelectedCategories}
      />

      <Pressable
        style={[styles.button, submitting && styles.buttonDisabled]}
        onPress={handleSubmit}
        disabled={submitting}
      >
        <AppText variant="button" color={colors.white}>
          {submitting ? submittingLabel : submitLabel}
        </AppText>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  form: {
    gap: spacing.sm,
  },

  input: {
    height: 56,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.white,
    ...typography.field,
    color: colors.text.primary,
  },

  label: {
    marginTop: spacing.sm,
    color: colors.text.primary,
  },

  photoBox: {
    height: 82,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    backgroundColor: colors.white,
    alignItems: "center",
    justifyContent: "center",
    gap: 2,
    overflow: "hidden",
  },

  photoPreview: {
    width: "100%",
    height: "100%",
  },

  textArea: {
    height: 112,
    paddingTop: spacing.sm,
    textAlignVertical: "top",
  },

  button: {
    height: 60,
    borderRadius: radius.md,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
    marginTop: spacing.md,
  },

  buttonDisabled: {
    opacity: 0.6,
  },

  errorText: {
    marginTop: -spacing.xs,
    marginBottom: spacing.xs,
  },
});
