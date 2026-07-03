import { useMemo, useState } from "react";
import {
    Pressable,
    StyleSheet,
    TextInput,
    View,
    KeyboardAvoidingView,
    ScrollView,
    Platform,
    Alert,
    Image,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";

import { AppText } from "@/components/atoms/AppText";
import { colors, radius, spacing, typography } from "@/theme";
import { CategorySelector } from "@/components/organisms/CategorySelector";
import { SelectField, SelectOption } from "@/components/molecules/SelectField";
import { useStates } from "@/hooks/useStates";
import { useCities } from "@/hooks/useCities";
import * as ImagePicker from "expo-image-picker";

export default function ProviderRegister() {
    const [selectedCategories, setSelectedCategories] = useState<number[]>([]);
    const [photo, setPhoto] = useState<string | null>(null);
    const [selectedState, setSelectedState] = useState<SelectOption | null>(null);
    const [selectedCity, setSelectedCity] = useState<SelectOption | null>(null);

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
            setPhoto(result.assets[0].uri);
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
            setPhoto(result.assets[0].uri);
        }
    }

    function handleRegisterProvider() {
        const payload = {
            categories: selectedCategories,
            photo,
            state: selectedState?.id,
            city: selectedCity?.id,
        };

        console.log("Dados do prestador:", payload);
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
                <Pressable style={styles.backButton} onPress={() => router.back()}>
                    <Ionicons name="arrow-back" size={28} color={colors.text.primary} />
                </Pressable>

                <View style={styles.header}>
                    <AppText variant="title" color={colors.primary}>
                        TemQuemFaz
                    </AppText>

                    <AppText variant="subtitle" style={styles.title}>
                        Cadastre seu perfil
                    </AppText>

                    <AppText variant="profession" color={colors.text.secondary}>
                        Encontre clientes perto de você.
                    </AppText>
                </View>

                <View style={styles.form}>
                    <TextInput
                        placeholder="Nome completo"
                        placeholderTextColor={colors.text.placeholder}
                        style={styles.input}
                    />

                    <TextInput
                        placeholder="WhatsApp"
                        placeholderTextColor={colors.text.placeholder}
                        keyboardType="phone-pad"
                        style={styles.input}
                    />

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
                        Descrição do seu serviço
                    </AppText>

                    <TextInput
                        placeholder="Fale sobre seus serviços..."
                        placeholderTextColor={colors.text.placeholder}
                        multiline
                        style={[styles.input, styles.textArea]}
                    />

                    <CategorySelector
                        selectedCategories={selectedCategories}
                        onChange={setSelectedCategories}
                    />

                    <Pressable style={styles.button} onPress={handleRegisterProvider}>
                        <AppText variant="button" color={colors.white}>
                            Cadastrar perfil
                        </AppText>
                    </Pressable>
                </View>
            </ScrollView>
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
        paddingHorizontal: spacing.md,
        paddingBottom: spacing.xl ?? spacing.lg,
    },

    backButton: {
        marginTop: spacing.lg,
    },

    header: {
        alignItems: "center",
        marginBottom: spacing.md,
    },

    title: {
        color: colors.text.primary,
        marginTop: spacing.sm,
    },

    form: {
        gap: spacing.sm,
    },

    input: {
        height: 46,
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
        height: 64,
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
        height: 90,
        paddingTop: spacing.sm,
        textAlignVertical: "top",
    },

    button: {
        height: 50,
        borderRadius: radius.md,
        backgroundColor: colors.primary,
        alignItems: "center",
        justifyContent: "center",
        marginTop: spacing.md,
    },
});