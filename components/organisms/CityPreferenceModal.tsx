import { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Modal,
  Pressable,
  StyleSheet,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as Location from "expo-location";

import { AppText } from "@/components/atoms/AppText";
import { SelectField, type SelectOption } from "@/components/molecules/SelectField";
import { useLocationPreference } from "@/contexts/LocationPreferenceContext";
import { useCities } from "@/hooks/useCities";
import { useStates } from "@/hooks/useStates";
import type { City } from "@/services/city.service";
import { colors, radius, spacing } from "@/theme";

type CityPreferenceModalProps = {
  visible: boolean;
  onClose: () => void;
};

function normalizeLocationName(value?: string | null) {
  return value
    ?.normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toLowerCase();
}

function findCityFromAddress(
  cities: City[],
  address: Location.LocationGeocodedAddress
) {
  const locationNames = [address.city, address.subregion, address.district]
    .map(normalizeLocationName)
    .filter(Boolean);
  const region = normalizeLocationName(address.region);
  const matchingCities = cities.filter((city) =>
    locationNames.includes(normalizeLocationName(city.name))
  );

  return (
    matchingCities.find(
      (city) =>
        normalizeLocationName(city.state_name) === region ||
        normalizeLocationName(city.uf) === region
    ) ?? (matchingCities.length === 1 ? matchingCities[0] : undefined)
  );
}

export function CityPreferenceModal({
  visible,
  onClose,
}: CityPreferenceModalProps) {
  const { preferredCity, setPreferredCity, setUserLocation } = useLocationPreference();
  const { states, loading: loadingStates } = useStates();
  const { cities, loading: loadingCities } = useCities();
  const [draftState, setDraftState] = useState<SelectOption | null>(null);
  const [draftCity, setDraftCity] = useState<SelectOption | null>(null);
  const [locating, setLocating] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!visible) {
      return;
    }

    setDraftState(
      preferredCity
        ? {
            id: preferredCity.uf,
            label: `${preferredCity.stateName} - ${preferredCity.uf}`,
          }
        : null
    );
    setDraftCity(
      preferredCity
        ? { id: preferredCity.id, label: preferredCity.name }
        : null
    );
  }, [preferredCity, visible]);

  const stateOptions: SelectOption[] = useMemo(
    () =>
      states.map((state) => ({
        id: state.uf,
        label: `${state.name} - ${state.uf}`,
      })),
    [states]
  );

  const cityOptions: SelectOption[] = useMemo(() => {
    if (!draftState) {
      return [];
    }

    return cities
      .filter((city) => city.uf === draftState.id)
      .map((city) => ({ id: city.id, label: city.name }));
  }, [cities, draftState]);

  function handleSelectState(state: SelectOption) {
    setDraftState(state);
    setDraftCity(null);
  }

  async function saveCity(city: City) {
    setSaving(true);

    await setPreferredCity({
      id: city.id,
      name: city.name,
      stateName: city.state_name,
      uf: city.uf,
    });

    setSaving(false);
    onClose();
  }

  async function handleApply() {
    const city = cities.find((item) => item.id === Number(draftCity?.id));

    if (!city) {
      Alert.alert("Escolha sua cidade", "Selecione o estado e a cidade.");
      return;
    }

    await saveCity(city);
  }

  async function handleUseCurrentLocation() {
    if (loadingCities || cities.length === 0) {
      Alert.alert("Aguarde", "As cidades ainda estão sendo carregadas.");
      return;
    }

    setLocating(true);

    try {
      const permission = await Location.requestForegroundPermissionsAsync();

      if (permission.status !== Location.PermissionStatus.GRANTED) {
        Alert.alert(
          "Permissão necessária",
          "Permita o acesso à localização para encontrar sua cidade."
        );
        return;
      }

      const servicesEnabled = await Location.hasServicesEnabledAsync();

      if (!servicesEnabled) {
        Alert.alert(
          "Localização desligada",
          "Ative a localização do celular e tente novamente."
        );
        return;
      }

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });
      setUserLocation(location.coords);
      const [address] = await Location.reverseGeocodeAsync({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });
      const city = address ? findCityFromAddress(cities, address) : undefined;

      if (!city) {
        Alert.alert(
          "Cidade não encontrada",
          "Não conseguimos identificar sua cidade. Escolha manualmente."
        );
        return;
      }

      await saveCity(city);
    } catch (error) {
      console.log("Erro ao identificar cidade atual:", error);
      Alert.alert(
        "Localização",
        "Não foi possível identificar sua cidade agora."
      );
    } finally {
      setLocating(false);
    }
  }

  async function handleClear() {
    setSaving(true);
    await setPreferredCity(null);
    setSaving(false);
    onClose();
  }

  const busy = locating || saving;

  return (
    <Modal
      animationType="slide"
      transparent
      visible={visible}
      onRequestClose={onClose}
    >
      <Pressable
        accessibilityLabel="Fechar seleção de cidade"
        accessibilityRole="button"
        style={styles.backdrop}
        onPress={onClose}
      />

      <View style={styles.sheet}>
        <View style={styles.header}>
          <AppText variant="subtitle" style={styles.title}>
            Escolha sua cidade
          </AppText>

          <Pressable
            accessibilityLabel="Fechar seleção de cidade"
            accessibilityRole="button"
            hitSlop={8}
            onPress={onClose}
          >
            <Ionicons name="close" size={26} color={colors.text.primary} />
          </Pressable>
        </View>

        <Pressable
          accessibilityLabel="Usar minha localização atual"
          accessibilityRole="button"
          accessibilityState={{ busy: locating, disabled: busy }}
          disabled={busy}
          style={[styles.locationButton, busy && styles.disabled]}
          onPress={handleUseCurrentLocation}
        >
          {locating ? (
            <ActivityIndicator color={colors.primary} />
          ) : (
            <Ionicons name="navigate" size={22} color={colors.primary} />
          )}
          <AppText style={styles.locationButtonText}>
            {locating ? "Identificando sua cidade..." : "Usar minha localização atual"}
          </AppText>
        </Pressable>

        <AppText style={styles.fieldLabel}>Estado</AppText>
        <SelectField
          placeholder="Selecione o estado"
          value={draftState}
          options={stateOptions}
          onSelect={handleSelectState}
          loading={loadingStates}
          searchPlaceholder="Buscar estado"
        />

        <AppText style={styles.fieldLabel}>Cidade</AppText>
        <SelectField
          placeholder="Selecione a cidade"
          value={draftCity}
          options={cityOptions}
          onSelect={setDraftCity}
          disabled={!draftState}
          loading={loadingCities}
          searchPlaceholder="Buscar cidade"
        />

        <Pressable
          accessibilityRole="button"
          accessibilityState={{ disabled: !draftCity || busy }}
          disabled={!draftCity || busy}
          style={[
            styles.applyButton,
            (!draftCity || busy) && styles.disabled,
          ]}
          onPress={handleApply}
        >
          {saving ? <ActivityIndicator color={colors.white} /> : null}
          <AppText style={styles.applyButtonText}>Confirmar cidade</AppText>
        </Pressable>

        {preferredCity ? (
          <Pressable
            accessibilityRole="button"
            disabled={busy}
            style={styles.clearButton}
            onPress={handleClear}
          >
            <AppText style={styles.clearButtonText}>Remover cidade escolhida</AppText>
          </Pressable>
        ) : null}
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
  },

  sheet: {
    maxHeight: "88%",
    backgroundColor: colors.white,
    borderTopLeftRadius: radius.md,
    borderTopRightRadius: radius.md,
    paddingHorizontal: spacing.screen,
    paddingTop: spacing.md,
    paddingBottom: spacing.xl,
  },

  header: {
    minHeight: 44,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: spacing.md,
  },

  title: {
    color: colors.text.primary,
  },

  locationButton: {
    minHeight: 56,
    borderWidth: 1,
    borderColor: colors.primary,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
  },

  locationButtonText: {
    flexShrink: 1,
    color: colors.primary,
    fontSize: 16,
    lineHeight: 22,
    fontWeight: "700",
    textAlign: "center",
  },

  fieldLabel: {
    marginTop: spacing.md,
    marginBottom: spacing.xs,
    color: colors.text.primary,
    fontSize: 16,
    lineHeight: 22,
    fontWeight: "700",
  },

  applyButton: {
    minHeight: 54,
    marginTop: spacing.lg,
    borderRadius: radius.md,
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.md,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
  },

  applyButtonText: {
    color: colors.white,
    fontSize: 16,
    lineHeight: 22,
    fontWeight: "700",
  },

  clearButton: {
    minHeight: 48,
    marginTop: spacing.sm,
    alignItems: "center",
    justifyContent: "center",
  },

  clearButtonText: {
    color: colors.primary,
    fontSize: 16,
    lineHeight: 22,
    fontWeight: "700",
  },

  disabled: {
    opacity: 0.6,
  },
});
