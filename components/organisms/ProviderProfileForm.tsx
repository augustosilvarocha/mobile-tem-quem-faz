import { useEffect, useMemo, useState } from "react";
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

  async function handleUserCurrentLocation() {
    try {
      setLoadingLocation(true);

      const permission = await Location.requestForegroundPermissionsAsync();

      if (permission.status !== Location.PermissionStatus.GRANTED) {
        Alert.alert(
          "Permissao negada",
          permission.canAskAgain
            ? "Nao foi possivel obter sua localizacao. Tente permitir o acesso quando o aviso aparecer."
            : "A permissao de localizacao foi bloqueada. Habilite a permissao nas configuracoes do dispositivo."
        );
        return;
      }

      const locationServicesEnabled =
        await Location.hasServicesEnabledAsync();

      if (!locationServicesEnabled) {
        Alert.alert(
          "Localizacao desligada",
          "Ative a localizacao do dispositivo para marcar o local."
        );
        return;
      }

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      setLatitude(location.coords.latitude);
      setLongitude(location.coords.longitude);
      setShowLocationOnMap(true);
    } catch (error) {
      console.log("Erro ao obter localizacao:", error);
      Alert.alert(
        "Localizacao",
        "Nao foi possivel obter sua localizacao atual."
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
        "Localizacao",
        "Use sua localizacao atual ou marque um ponto no mapa antes de exibir."
      );
      return;
    }

    setShowLocationOnMap(enabled);
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
        neighborhood,
        street,
        number,
        address_complement: addressComplement,
        reference_point: referencePoint,
        latitude,
        longitude,
        show_location_on_map: showLocationOnMap,
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
  <>
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
        Endereco do comercio
      </AppText>

      <TextInput
        value={neighborhood}
        onChangeText={setNeighborhood}
        placeholder="Bairro"
        placeholderTextColor={colors.text.placeholder}
        style={styles.input}
      />

      <TextInput
        value={street}
        onChangeText={setStreet}
        placeholder="Rua"
        placeholderTextColor={colors.text.placeholder}
        style={styles.input}
      />

      <View style={styles.inputRow}>
        <TextInput
          value={number}
          onChangeText={setNumber}
          placeholder="Numero"
          placeholderTextColor={colors.text.placeholder}
          keyboardType="numeric"
          style={[styles.input, styles.numberInput]}
        />

        <TextInput
          value={addressComplement}
          onChangeText={setAddressComplement}
          placeholder="Complemento"
          placeholderTextColor={colors.text.placeholder}
          style={[styles.input, styles.flexInput]}
        />
      </View>

      <TextInput
        value={referencePoint}
        onChangeText={setReferencePoint}
        placeholder="Ponto de referencia"
        placeholderTextColor={colors.text.placeholder}
        style={styles.input}
      />

      <Pressable
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
            ? "Buscando localizacao..."
            : hasSelectedLocation
              ? "Atualizar minha localizacao atual"
              : "Usar minha localizacao atual"}
        </AppText>
      </Pressable>

      <Pressable style={styles.locationButton} onPress={handleOpenMapPicker}>
        <Ionicons name="map" size={20} color={colors.primary} />
        <AppText variant="profession" color={colors.primary}>
          Marcar no mapa
        </AppText>
      </Pressable>

      {hasSelectedLocation ? (
        <AppText variant="profession" style={styles.locationStatus}>
          Localizacao marcada para exibicao no mapa.
        </AppText>
      ) : null}

      <View style={styles.switchRow}>
        <AppText variant="profession" color={colors.text.primary}>
          Exibir localizacao no mapa
        </AppText>

        <Switch
          value={showLocationOnMap}
          onValueChange={handleToggleShowLocationOnMap}
        />
      </View>

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

    <Modal
      visible={mapPickerVisible}
      animationType="slide"
      onRequestClose={() => setMapPickerVisible(false)}
    >
      <View style={styles.mapPickerContainer}>
        <View style={styles.mapPickerHeader}>
          <Pressable
            style={styles.mapPickerIconButton}
            onPress={() => setMapPickerVisible(false)}
          >
            <Ionicons name="close" size={24} color={colors.text.primary} />
          </Pressable>

          <AppText variant="name" color={colors.text.primary}>
            Marcar local
          </AppText>

          <Pressable
            style={styles.mapPickerIconButton}
            onPress={handleConfirmMapLocation}
          >
            <Ionicons name="checkmark" size={24} color={colors.primary} />
          </Pressable>
        </View>

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
  inputRow: {
    flexDirection: "row",
    gap: spacing.sm,
  },

  numberInput: {
    width: 110,
  },

  flexInput: {
    flex: 1,
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
    marginTop: -spacing.xs,
    color: colors.text.secondary,
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

  mapPicker: {
    flex: 1,
  },
  });
