import { useMemo, useState } from "react";
import {
  Alert,
  Image,
  Pressable,
  StyleSheet,
  TextInput,
  View,
  Switch,
  Modal,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import * as Location from "expo-location";
import MapView, { Marker, Region } from "react-native-maps";

import { AppText } from "@/components/atoms/AppText";
import { SelectField, SelectOption } from "@/components/molecules/SelectField";
import { CategorySelector } from "@/components/organisms/CategorySelector";
import { useCities } from "@/hooks/useCities";
import { useStates } from "@/hooks/useStates";
import { CreateProviderPayload } from "@/services/provider.service";
import { colors, radius, spacing, typography } from "@/theme";
import { isValidPhone, sanitizePhone } from "@/utils/phone";
import { persistLocalImage } from "@/utils/persistLocalImage";

export type ProviderProfileFormInitialValues = {
  categoryIds?: number[];
  cityId?: number;
  description?: string;
  name?: string;
  phone?: string;
  photoUri?: string | null;
  neighborhood?: string | null;
  street?: string | null;
  number?: string | null;
  address_complement?: string | null;
  reference_point?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  show_location_on_map?: boolean;
};

export type ProviderRegistrationStep = 1 | 2;

type ProviderProfileFormProps = {
  initialValues?: ProviderProfileFormInitialValues;
  mode?: "edit" | "registration";
  onRegistrationStepChange?: (step: ProviderRegistrationStep) => void;
  onSubmit: (payload: CreateProviderPayload) => Promise<void>;
  registrationStep?: ProviderRegistrationStep;
  submitLabel: string;
  submittingLabel: string;
};

export function ProviderProfileForm({
  initialValues,
  mode = "edit",
  onRegistrationStepChange,
  onSubmit,
  registrationStep = 1,
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
  const [neighborhood, setNeighborhood] = useState(initialValues?.neighborhood ?? "");
  const [street, setStreet] = useState(initialValues?.street ?? "");
  const [number, setNumber] = useState(initialValues?.number ?? "");
  const [addressComplement, setAddressComplement] = useState(initialValues?.address_complement ?? "");
  const [referencePoint, setReferencePoint] = useState(initialValues?.reference_point ?? "");
  const [latitude, setLatitude] = useState(initialValues?.latitude ?? null);
  const [longitude, setLongitude] = useState(initialValues?.longitude ?? null);
  const [showLocationOnMap, setShowLocationOnMap] = useState(initialValues?.show_location_on_map ?? false);
  const [loadingLocation, setLoadingLocation] = useState(false);
  const [mapPickerVisible, setMapPickerVisible] = useState(false);
  const [mapRegion, setMapRegion] = useState<Region>({
    latitude: latitude ?? -14.2350,
    longitude: longitude ?? -51.9253,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  });

  const { states, loading: loadingStates } = useStates();
  const { cities, loading: loadingCities } = useCities();
  const isRegistration = mode === "registration";
  const showRequiredFields = !isRegistration || registrationStep === 1;
  const showLocationFields = !isRegistration || registrationStep === 2;

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
  const hasSelectedLocation = latitude !== null && longitude !== null;

  if (!initialCityApplied && initialValues?.cityId && cities.length > 0) {
    const initialCity = cities.find((city) => city.id === initialValues.cityId);

    if (initialCity) {
      setSelectedState({ id: initialCity.uf, label: initialCity.uf });
      setSelectedCity({ id: initialCity.id, label: initialCity.name });
    }

    setInitialCityApplied(true);
  }

  function handleSelectState(option: SelectOption) {
    setSelectedState(option);
    setSelectedCity(null);
  }

  async function handlePickPhoto() {
    Alert.alert("Foto de perfil", "Escolha uma opção", [
      { text: "Câmera", onPress: takePhoto },
      { text: "Galeria", onPress: pickFromGallery },
      { text: "Cancelar", style: "cancel" },
    ]);
  }

  async function takePhoto() {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();

    if (status !== "granted") {
      Alert.alert(
        "Permissão necessária",
        "Precisamos de acesso à câmera para tirar a foto."
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
      setPhoto(persistLocalImage(result.assets[0].uri, "provider-photo"));
      setPhotoChanged(true);
    }
  }

  async function pickFromGallery() {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (status !== "granted") {
      Alert.alert(
        "Permissão necessária",
        "Precisamos de acesso à galeria para escolher a foto."
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
      setPhoto(persistLocalImage(result.assets[0].uri, "provider-photo"));
      setPhotoChanged(true);
    }
  }

  async function handleUserCurrentLocation() {
    try {
      setLoadingLocation(true);

      const permission = await Location.requestForegroundPermissionsAsync();

      if (permission.status !== Location.PermissionStatus.GRANTED) {
        Alert.alert(
          "Permissão negada",
          permission.canAskAgain
            ? "Não foi possível obter sua localização. Permita o acesso quando o aviso aparecer."
            : "A permissão de localização foi bloqueada. Habilite-a nas configurações do dispositivo."
        );
        return;
      }

      const locationServicesEnabled =
        await Location.hasServicesEnabledAsync();

      if (!locationServicesEnabled) {
        Alert.alert(
          "Localização desligada",
          "Ative a localização do dispositivo para marcar o local."
        );
        return;
      }

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      setLatitude(location.coords.latitude);
      setLongitude(location.coords.longitude);
      setMapRegion({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        latitudeDelta: 0.012,
        longitudeDelta: 0.012,
      });
      setShowLocationOnMap(true);
    } catch (error) {
      console.log("Erro ao obter localização:", error);
      Alert.alert(
        "Localização",
        "Não foi possível obter sua localização atual."
      );
    } finally {
      setLoadingLocation(false);
    }
  }

  function handleOpenMapPicker() {
    setMapRegion({
      latitude: latitude ?? mapRegion.latitude,
      longitude: longitude ?? mapRegion.longitude,
      latitudeDelta: mapRegion.latitudeDelta,
      longitudeDelta: mapRegion.longitudeDelta,
    });
    setMapPickerVisible(true);
  }

  function handleSelectMapLocation(coordinate: {
    latitude: number;
    longitude: number;
  }) {
    setLatitude(coordinate.latitude);
    setLongitude(coordinate.longitude);
    setMapRegion((current) => ({
      ...current,
      latitude: coordinate.latitude,
      longitude: coordinate.longitude,
    }));
    setShowLocationOnMap(true);
  }

  function handleConfirmMapLocation() {
    if (latitude === null || longitude === null) {
      Alert.alert("Mapa", "Marque um ponto no mapa antes de confirmar.");
      return;
    }
    setMapPickerVisible(false);
  }

  function handleToggleShowLocationOnMap(enabled: boolean) {
    if (enabled && !hasSelectedLocation) {
      Alert.alert(
        "Localização",
        "Use sua localização atual ou marque um ponto no mapa antes de exibir."
      );
      return;
    }

    setShowLocationOnMap(enabled);
  }

  function handleUseAddressOnly() {
    setLatitude(null);
    setLongitude(null);
    setShowLocationOnMap(false);
  }

  function validateRequiredFields() {
    if (!isValidPhone(phone)) {
      setPhoneError("Número de telefone inválido.");
      return false;
    }

    setPhoneError("");

    if (!name.trim()) {
      Alert.alert("Atenção", "Informe seu nome completo.");
      return false;
    }

    if (!selectedCity) {
      Alert.alert("Atenção", "Selecione o estado e a cidade.");
      return false;
    }

    if (selectedCategories.length === 0) {
      Alert.alert("Atenção", "Selecione ao menos uma categoria.");
      return false;
    }

    return true;
  }

  function handleContinueToLocation() {
    if (!validateRequiredFields()) {
      return;
    }

    onRegistrationStepChange?.(2);
  }

  async function submitProfile(includeLocation: boolean) {
    if (!validateRequiredFields()) {
      if (isRegistration) {
        onRegistrationStepChange?.(1);
      }
      return;
    }

    if (!selectedCity) {
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
        neighborhood: includeLocation ? neighborhood : "",
        street: includeLocation ? street : "",
        number: includeLocation ? number : "",
        address_complement: includeLocation ? addressComplement : "",
        reference_point: includeLocation ? referencePoint : "",
        latitude: includeLocation ? latitude : null,
        longitude: includeLocation ? longitude : null,
        show_location_on_map: includeLocation ? showLocationOnMap : false,
      });
    } catch (err: any) {
      console.log("Erro ao enviar dados do prestador:", err);
      Alert.alert(
        "Erro",
        err.message || "Não foi possível salvar os dados do prestador."
      );
    } finally {
      setSubmitting(false);
    }
  }

  function handleSubmit() {
    return submitProfile(true);
  }

  function handleSkipLocation() {
    return submitProfile(false);
  }

  return (
    <>
      <View style={styles.form}>
        {showRequiredFields ? (
          <>
            <AppText variant="name" style={styles.label}>
              Nome completo
            </AppText>
            <TextInput
              accessibilityLabel="Nome completo"
              value={name}
              onChangeText={setName}
              placeholder="Digite seu nome completo"
              placeholderTextColor={colors.text.placeholder}
              style={styles.input}
            />

            <AppText variant="name" style={styles.label}>
              WhatsApp
            </AppText>
            <TextInput
              accessibilityLabel="Número do WhatsApp"
              value={phone}
              onChangeText={(text) => {
                setPhone(sanitizePhone(text));
                setPhoneError("");
              }}
              placeholder="Digite somente os números"
              placeholderTextColor={colors.text.placeholder}
              keyboardType="phone-pad"
              maxLength={11}
              style={styles.input}
            />

            {phoneError ? (
              <AppText
                accessibilityLiveRegion="assertive"
                accessibilityRole="alert"
                variant="profession"
                color={colors.danger}
                style={styles.errorText}
              >
                {phoneError}
              </AppText>
            ) : null}

            <AppText variant="name" style={styles.label}>
              Estado
            </AppText>
            <SelectField
              placeholder="Selecione o estado"
              value={selectedState}
              options={stateOptions}
              onSelect={handleSelectState}
              loading={loadingStates}
              searchPlaceholder="Buscar estado"
            />

            <AppText variant="name" style={styles.label}>
              Cidade
            </AppText>
            <SelectField
              placeholder="Selecione a cidade"
              value={selectedCity}
              options={cityOptions}
              onSelect={setSelectedCity}
              disabled={!selectedState}
              loading={loadingCities}
              searchPlaceholder="Buscar cidade"
            />

            <CategorySelector
              selectedCategories={selectedCategories}
              onChange={setSelectedCategories}
            />

            {isRegistration ? (
              <Pressable
                accessibilityLabel="Continuar para endereço e localização"
                accessibilityRole="button"
                style={styles.button}
                onPress={handleContinueToLocation}
              >
                <AppText variant="button" color={colors.white}>
                  Continuar
                </AppText>
                <Ionicons name="arrow-forward" size={22} color={colors.white} />
              </Pressable>
            ) : null}
          </>
        ) : null}

        {!isRegistration ? (
          <>
            <AppText variant="name" style={styles.label}>
              Foto de perfil (opcional)
            </AppText>
            <Pressable
              accessibilityLabel={photo ? "Alterar foto de perfil" : "Adicionar foto de perfil"}
              accessibilityRole="button"
              style={styles.photoBox}
              onPress={handlePickPhoto}
            >
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
              Descrição do seu serviço (opcional)
            </AppText>
            <TextInput
              accessibilityLabel="Descrição do seu serviço"
              value={description}
              onChangeText={setDescription}
              placeholder="Conte um pouco sobre seus serviços"
              placeholderTextColor={colors.text.placeholder}
              multiline
              style={[styles.input, styles.textArea]}
            />
          </>
        ) : null}

        {showLocationFields ? (
          <>
            <AppText variant="subtitle" style={styles.sectionTitle}>
              Endereço do comércio
            </AppText>

            <AppText variant="name" style={styles.label}>
              Bairro
            </AppText>
            <TextInput
              accessibilityLabel="Bairro opcional"
              value={neighborhood}
              onChangeText={setNeighborhood}
              placeholder="Ex.: Centro"
              placeholderTextColor={colors.text.placeholder}
              style={styles.input}
            />

            <AppText variant="name" style={styles.label}>
              Rua
            </AppText>
            <TextInput
              accessibilityLabel="Rua opcional"
              value={street}
              onChangeText={setStreet}
              placeholder="Digite o nome da rua"
              placeholderTextColor={colors.text.placeholder}
              style={styles.input}
            />

            <AppText variant="name" style={styles.label}>
              Número
            </AppText>
            <TextInput
              accessibilityLabel="Número do endereço opcional"
              value={number}
              onChangeText={setNumber}
              placeholder="Ex.: 120"
              placeholderTextColor={colors.text.placeholder}
              keyboardType="numeric"
              style={styles.input}
            />

            <AppText variant="name" style={styles.label}>
              Complemento
            </AppText>
            <TextInput
              accessibilityLabel="Complemento do endereço opcional"
              value={addressComplement}
              onChangeText={setAddressComplement}
              placeholder="Ex.: Sala 2"
              placeholderTextColor={colors.text.placeholder}
              style={styles.input}
            />

            <AppText variant="name" style={styles.label}>
              Ponto de referência
            </AppText>
            <TextInput
              accessibilityLabel="Ponto de referência opcional"
              value={referencePoint}
              onChangeText={setReferencePoint}
              placeholder="Ex.: Próximo à praça"
              placeholderTextColor={colors.text.placeholder}
              style={styles.input}
            />

            <AppText variant="subtitle" style={styles.sectionTitle}>
              Localização no mapa
            </AppText>
            <AppText style={styles.locationHelp} color={colors.text.secondary}>
              Use a localização do celular ou escolha o ponto manualmente.
            </AppText>

            <Pressable
              accessibilityLabel="Usar a localização atual deste celular"
              accessibilityRole="button"
              accessibilityState={{ disabled: loadingLocation }}
              style={[
                styles.locationButton,
                loadingLocation && styles.locationButtonDisabled,
              ]}
              onPress={handleUserCurrentLocation}
              disabled={loadingLocation}
            >
              <Ionicons name="location" size={20} color={colors.primary} />
              <AppText variant="profession" color={colors.primary}>
                {loadingLocation
                  ? "Buscando localização..."
                  : hasSelectedLocation
                    ? "Atualizar localização atual"
                    : "Usar localização atual"}
              </AppText>
            </Pressable>

            <Pressable
              accessibilityLabel="Escolher a localização no mapa"
              accessibilityRole="button"
              style={styles.locationButton}
              onPress={handleOpenMapPicker}
            >
              <Ionicons name="map" size={20} color={colors.primary} />
              <AppText variant="profession" color={colors.primary}>
                Escolher no mapa
              </AppText>
            </Pressable>

            {hasSelectedLocation && latitude !== null && longitude !== null ? (
              <View style={styles.locationPreviewContainer}>
                <AppText variant="name" style={styles.previewTitle}>
                  Confira se o ponto está correto
                </AppText>
                <AppText style={styles.previewHelp} color={colors.text.secondary}>
                  Se estiver errado, toque em “Escolher no mapa” para ajustar.
                </AppText>
                <MapView
                  accessibilityLabel="Prévia da localização marcada"
                  pitchEnabled={false}
                  rotateEnabled={false}
                  scrollEnabled={false}
                  style={styles.locationPreview}
                  toolbarEnabled={false}
                  zoomEnabled={false}
                  region={{
                    latitude,
                    longitude,
                    latitudeDelta: 0.012,
                    longitudeDelta: 0.012,
                  }}
                >
                  <Marker coordinate={{ latitude, longitude }} />
                </MapView>
              </View>
            ) : (
              <AppText variant="profession" style={styles.locationStatus}>
                Nenhum ponto foi marcado no mapa.
              </AppText>
            )}

            {hasSelectedLocation ? (
              <>
                <Pressable
                  accessibilityLabel="Remover a localização marcada e usar somente o endereço"
                  accessibilityRole="button"
                  style={styles.locationButton}
                  onPress={handleUseAddressOnly}
                >
                  <Ionicons name="close-circle-outline" size={20} color={colors.primary} />
                  <AppText variant="profession" color={colors.primary}>
                    Remover marcação do mapa
                  </AppText>
                </Pressable>

                <View style={styles.switchRow}>
                  <AppText
                    variant="profession"
                    color={colors.text.primary}
                    style={styles.switchLabel}
                  >
                    Mostrar esta localização no perfil
                  </AppText>
                  <Switch
                    accessibilityLabel="Mostrar esta localização no perfil"
                    value={showLocationOnMap}
                    onValueChange={handleToggleShowLocationOnMap}
                  />
                </View>
              </>
            ) : null}

            <Pressable
              accessibilityLabel={submitting ? submittingLabel : submitLabel}
              accessibilityRole="button"
              accessibilityState={{ disabled: submitting }}
              style={[styles.button, submitting && styles.buttonDisabled]}
              onPress={handleSubmit}
              disabled={submitting}
            >
              <AppText variant="button" color={colors.white}>
                {submitting ? submittingLabel : submitLabel}
              </AppText>
            </Pressable>

            {isRegistration ? (
              <Pressable
                accessibilityLabel="Pular endereço e localização"
                accessibilityRole="button"
                accessibilityState={{ disabled: submitting }}
                disabled={submitting}
                style={styles.skipButton}
                onPress={handleSkipLocation}
              >
                <AppText variant="button" color={colors.primary}>
                  Pular esta etapa
                </AppText>
              </Pressable>
            ) : null}
          </>
        ) : null}
      </View>

      <Modal
        visible={mapPickerVisible}
        animationType="slide"
        onRequestClose={() => setMapPickerVisible(false)}
      >
        <View style={styles.mapPickerContainer}>
          <View style={styles.mapPickerHeader}>
            <Pressable
              accessibilityLabel="Fechar mapa"
              accessibilityRole="button"
              style={styles.mapPickerIconButton}
              onPress={() => setMapPickerVisible(false)}
            >
              <Ionicons name="close" size={24} color={colors.text.primary} />
            </Pressable>

            <AppText variant="name" color={colors.text.primary}>
              Escolher localização
            </AppText>

            <Pressable
              accessibilityLabel="Confirmar localização marcada"
              accessibilityRole="button"
              style={styles.mapPickerIconButton}
              onPress={handleConfirmMapLocation}
            >
              <Ionicons name="checkmark" size={24} color={colors.primary} />
            </Pressable>
          </View>

          <AppText style={styles.mapPickerHelp} color={colors.text.secondary}>
            Toque no mapa ou arraste o marcador até o local correto.
          </AppText>

          <MapView
            style={styles.mapPicker}
            initialRegion={mapRegion}
            onRegionChangeComplete={setMapRegion}
            onPress={(event) => {
              handleSelectMapLocation(event.nativeEvent.coordinate);
            }}
          >
            {latitude !== null && longitude !== null ? (
              <Marker
                coordinate={{ latitude, longitude }}
                draggable
                onDragEnd={(event) => {
                  handleSelectMapLocation(event.nativeEvent.coordinate);
                }}
              />
            ) : null}
          </MapView>
        </View>
      </Modal>
    </>
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

  sectionTitle: {
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
    minHeight: 60,
    borderRadius: radius.md,
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
    marginTop: spacing.md,
  },

  buttonDisabled: {
    opacity: 0.6,
  },

  errorText: {
    marginTop: -spacing.xs,
    marginBottom: spacing.xs,
  },

  skipButton: {
    minHeight: 52,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: spacing.md,
  },

  locationButton: {
    height: 52,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    backgroundColor: colors.white,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: spacing.sm,
  },

  locationButtonDisabled: {
    opacity: 0.6,
  },

  locationHelp: {
    marginTop: -spacing.xs,
    marginBottom: spacing.xs,
    fontSize: 16,
    lineHeight: 22,
  },

  locationStatus: {
    color: colors.text.secondary,
    textAlign: "center",
  },

  locationPreviewContainer: {
    marginTop: spacing.xs,
  },

  previewTitle: {
    color: colors.text.primary,
  },

  previewHelp: {
    marginTop: spacing.xs,
    marginBottom: spacing.sm,
    fontSize: 16,
    lineHeight: 22,
  },

  locationPreview: {
    width: "100%",
    height: 220,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
  },

  switchRow: {
    minHeight: 52,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    backgroundColor: colors.white,
    paddingHorizontal: spacing.md,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.sm,
  },

  switchLabel: {
    flex: 1,
  },

  mapPickerContainer: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },

  mapPickerHeader: {
    height: 72,
    paddingHorizontal: spacing.md,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },

  mapPickerIconButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.background.card,
  },

  mapPickerHelp: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    fontSize: 16,
    lineHeight: 22,
    textAlign: "center",
  },

  mapPicker: {
    flex: 1,
  },
});
