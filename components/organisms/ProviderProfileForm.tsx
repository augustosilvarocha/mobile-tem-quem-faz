import { TextInput } from "@/components/atoms/KeyboardAware";
import { useMemo, useState } from "react";
import {
  Alert,
  Image,
  Linking,
  Pressable,
  StyleSheet,
  View,
  Switch,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import * as Location from "expo-location";
import MapView, { Marker, type Region } from "@/components/atoms/NativeMap";

import { MapLocationPicker } from "@/components/molecules/MapLocationPicker";
import { AppText } from "@/components/atoms/AppText";
import { SelectField, SelectOption } from "@/components/molecules/SelectField";
import { CategorySelector } from "@/components/organisms/CategorySelector";
import { useCities } from "@/hooks/useCities";
import { useStates } from "@/hooks/useStates";
import { CreateProviderPayload } from "@/services/provider.service";
import { colors, radius, spacing, typography } from "@/theme";
import { formatPhone, isValidPhone, sanitizePhone } from "@/utils/phone";
import { persistLocalImage } from "@/utils/persistLocalImage";
import { canRenderNativeMap } from "@/utils/nativeMaps";
import { getCityCoordinates } from "@/utils/cityCoordinates";
import { hasValidCoordinates } from "@/utils/providerDistance";
import { GENDER_OPTIONS, ProviderGender } from "@/utils/gender";
import { formatCpf, isValidCpf, sanitizeCpf } from "@/utils/cpf";

export type ProviderProfileFormInitialValues = {
  cpf?: string;
  gender?: ProviderGender;
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
  const [cpf, setCpf] = useState(sanitizeCpf(initialValues?.cpf ?? ""));
  const [cpfError, setCpfError] = useState("");
  const [gender, setGender] = useState<ProviderGender>(initialValues?.gender ?? "");
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
  const [number, setNumber] = useState(
    (initialValues?.number ?? "").replace(/\D/g, "")
  );
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
  const showPersonalFields = !isRegistration || registrationStep === 1;
  const showServiceFields = !isRegistration || registrationStep === 2;

  const stateOptions: SelectOption[] = useMemo(
    () => states.map((state) => ({ id: state.uf, label: `${state.name} - ${state.uf}` })),
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
  const nativeMapsAvailable = canRenderNativeMap();
  const hasSelectedLocation = hasValidCoordinates({ latitude, longitude });

  if (!initialCityApplied && initialValues?.cityId && cities.length > 0) {
    const initialCity = cities.find((city) => city.id === initialValues.cityId);

    if (initialCity) {
      setSelectedState({ id: initialCity.uf, label: `${initialCity.state_name} - ${initialCity.uf}` });
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

  async function handleOpenMapPicker() {
    if (loadingLocation) return;
    if (hasSelectedLocation) {
      setMapRegion({ ...mapRegion, latitude: latitude!, longitude: longitude! });
      setMapPickerVisible(true);
      return;
    }

    const city = cities.find((item) => item.id === selectedCity?.id);
    let center = city ? getCityCoordinates(city.name, city.uf) : null;
    setLoadingLocation(true);
    try {
      if (await Location.hasServicesEnabledAsync()) {
        let permission = await Location.getForegroundPermissionsAsync();
        if (permission.status !== Location.PermissionStatus.GRANTED && permission.canAskAgain) {
          permission = await Location.requestForegroundPermissionsAsync();
        }
        if (permission.status === Location.PermissionStatus.GRANTED) {
          // Prefer a recent fix and limit GPS waiting time so the picker still opens.
          let timeout: ReturnType<typeof setTimeout> | undefined;
          try {
            const position = await Promise.race([
              (async () => {
                const recent = await Location.getLastKnownPositionAsync({
                  maxAge: 60_000,
                  requiredAccuracy: 5_000,
                });
                return recent ?? await Location.getCurrentPositionAsync({
                  accuracy: Location.Accuracy.Balanced,
                });
              })(),
              new Promise<null>((resolve) => { timeout = setTimeout(() => resolve(null), 5_000); }),
            ]);
            if (position && hasValidCoordinates(position.coords)) center = position.coords;
          } finally {
            clearTimeout(timeout);
          }
        }
      }
    } catch {
      // The selected city remains available when device location is unavailable.
    } finally {
      setLoadingLocation(false);
    }
    setMapRegion(center
      ? { ...center, latitudeDelta: 0.06, longitudeDelta: 0.06 }
      : mapRegion);
    setMapPickerVisible(true);
  }

  async function handleOpenLocationExternally() {
    if (!hasValidCoordinates({ latitude, longitude })) {
      return;
    }

    try {
      await Linking.openURL(
        `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`
      );
    } catch {
      Alert.alert("Mapa", "Não foi possível abrir a localização.");
    }
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

  function validatePersonalFields() {
    if (!isValidCpf(cpf)) {
      setCpfError("Informe um CPF válido.");
      return false;
    }
    setCpfError("");
    if (!isValidPhone(phone)) {
      setPhoneError("Número de telefone inválido.");
      return false;
    }

    setPhoneError("");

    if (!name.trim()) {
      Alert.alert("Atenção", "Informe seu nome completo.");
      return false;
    }

    return true;
  }

  function validateServiceFields() {
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
    if (!validatePersonalFields()) {
      return;
    }

    onRegistrationStepChange?.(2);
  }

  async function submitProfile() {
    if (!validatePersonalFields()) {
      if (isRegistration) {
        onRegistrationStepChange?.(1);
      }
      return;
    }

    if (!validateServiceFields()) return;

    if (!selectedCity) {
      return;
    }

    try {
      setSubmitting(true);

      await onSubmit({
        cpf,
        gender,
        phone,
        name,
        city: Number(selectedCity.id),
        photoUri: photoChanged ? photo : null,
        description,
        categories: selectedCategories,
        neighborhood: neighborhood,
        street: street,
        number: number,
        address_complement: addressComplement,
        reference_point: referencePoint,
        latitude: latitude,
        longitude: longitude,
        show_location_on_map: showLocationOnMap,
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
    return submitProfile();
  }

  return (
    <>
      <View style={styles.form}>
        {showPersonalFields ? (
          <>
            <AppText variant="profession" color={colors.text.secondary}>
              Preencha os campos indicados como obrigatórios.
            </AppText>
            <AppText variant="name" style={styles.label}>
              Nome completo (obrigatório)
            </AppText>
            <TextInput
              accessibilityLabel="Nome completo obrigatório"
              value={name}
              maxLength={100}
              onChangeText={setName}
              placeholder="Digite seu nome completo"
              placeholderTextColor={colors.text.placeholder}
              style={styles.input}
            />

            <AppText variant="name" style={styles.label}>
              CPF (obrigatório)
            </AppText>
            <TextInput
              accessibilityLabel="CPF obrigatório"
              value={formatCpf(cpf)}
              onChangeText={(text) => {
                setCpf(sanitizeCpf(text));
                setCpfError("");
              }}
              placeholder="000.000.000-00"
              placeholderTextColor={colors.text.placeholder}
              keyboardType="number-pad"
              maxLength={14}
              style={styles.input}
            />
            <AppText variant="profession" color={colors.text.secondary}>
              Seu CPF não será exibido no perfil público.
            </AppText>
            {cpfError ? (
              <AppText
                accessibilityLiveRegion="assertive"
                accessibilityRole="alert"
                variant="profession"
                color={colors.danger}
                style={styles.errorText}
              >
                {cpfError}
              </AppText>
            ) : null}
            <AppText variant="name" style={styles.label}>
              WhatsApp (obrigatório)
            </AppText>
            <TextInput
              accessibilityLabel="Número do WhatsApp obrigatório"
              value={formatPhone(phone)}
              onChangeText={(text) => {
                setPhone(sanitizePhone(text).slice(0, 11));
                setPhoneError("");
              }}
              placeholder="Ex.: (84) 99999-9999"
              placeholderTextColor={colors.text.placeholder}
              keyboardType="phone-pad"
              maxLength={16}
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
              Gênero (opcional)
            </AppText>
            <SelectField
              placeholder="Selecione o gênero"
              value={GENDER_OPTIONS.find((option) => option.id === gender) ?? null}
              options={GENDER_OPTIONS}
              onSelect={(option) => setGender(option.id as ProviderGender)}
              searchPlaceholder="Buscar gênero"
            />
            <AppText variant="profession" color={colors.text.secondary}>
              Se informado, será exibido no seu perfil público.
            </AppText>

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

            {isRegistration ? (
              <Pressable
                accessibilityLabel="Continuar para serviço e localização"
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

        {showServiceFields ? (
          <>
            <CategorySelector
              selectedCategories={selectedCategories}
              onChange={setSelectedCategories}
            />

            <AppText variant="name" style={styles.label}>
              Estado (obrigatório)
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
              Cidade (obrigatória)
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

        {showServiceFields ? (
          <>
            <AppText variant="subtitle" style={styles.sectionTitle}>
              Endereço do comércio
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

            {nativeMapsAvailable || hasSelectedLocation ? <Pressable
              accessibilityLabel={nativeMapsAvailable ? "Escolher a localização no mapa" : "Abrir localização no mapa"}
              accessibilityRole="button"
              accessibilityState={{ disabled: loadingLocation }}
              disabled={loadingLocation}
              style={[styles.locationButton, loadingLocation && styles.locationButtonDisabled]}
              onPress={nativeMapsAvailable ? handleOpenMapPicker : handleOpenLocationExternally}
            >
              <Ionicons name="map" size={20} color={colors.primary} />
              <AppText variant="profession" color={colors.primary}>
                {loadingLocation ? "Localizando..." : nativeMapsAvailable ? "Escolher no mapa" : "Abrir no mapa"}
              </AppText>
            </Pressable> : null}

            <AppText variant="name" style={styles.label}>
              Bairro (opcional)
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
              Rua (opcional)
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
              Número (opcional)
            </AppText>
            <TextInput
              accessibilityLabel="Número do endereço opcional"
              value={number}
              onChangeText={(text) => setNumber(text.replace(/\D/g, ""))}
              placeholder="Ex.: 120"
              placeholderTextColor={colors.text.placeholder}
              keyboardType="numeric"
              style={styles.input}
            />

            <AppText variant="name" style={styles.label}>
              Complemento (opcional)
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
              Ponto de referência (opcional)
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
              Localização no mapa (opcional)
            </AppText>

            {hasSelectedLocation && latitude !== null && longitude !== null ? (
              <View style={styles.locationPreviewContainer}>
                <AppText variant="name" style={styles.previewTitle}>
                  Confira se o ponto está correto
                </AppText>
                {nativeMapsAvailable ? <MapView
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
                </MapView> : <AppText color={colors.text.secondary}>Localização registrada.</AppText>}
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


          </>
        ) : null}
      </View>

      {nativeMapsAvailable && mapPickerVisible ? (
        <MapLocationPicker
          initialRegion={mapRegion}
          initialCoordinate={hasSelectedLocation ? { latitude: latitude!, longitude: longitude! } : null}
          onCancel={() => setMapPickerVisible(false)}
          onConfirm={(coordinate) => {
            handleSelectMapLocation(coordinate);
            setMapPickerVisible(false);
          }}
        />
      ) : null}
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

});
