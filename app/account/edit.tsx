import { useEffect, useState } from "react";
import { ActivityIndicator, Pressable, StyleSheet } from "react-native";
import { router } from "expo-router";
import { ScrollView, TextInput } from "@/components/atoms/KeyboardAware";
import { AppText } from "@/components/atoms/AppText";
import { ScreenHeader } from "@/components/molecules/ScreenHeader";
import { LoadingSkeleton } from "@/components/molecules/LoadingSkeleton";
import { ApiError } from "@/services/api";
import { getUserProfile, updateUserProfile } from "@/services/user.service";
import { saveUserName, saveUserPhone } from "@/utils/authStorage";
import { formatPhone } from "@/utils/phone";
import { colors, radius, spacing, typography } from "@/theme";

export default function EditAccount() {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [loaded, setLoaded] = useState(false);
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    let active = true;
    setLoading(true);
    setError("");
    getUserProfile().then((user) => {
      if (!active) return;
      setName(user.name);
      setPhone(user.phone);
      setLoaded(true);
    }).catch((error: unknown) => {
      if (!active) return;
      if (error instanceof ApiError && error.status === 404) {
        setError("A edi\u00e7\u00e3o de perfil ainda n\u00e3o est\u00e1 dispon\u00edvel no servidor. Tente novamente mais tarde.");
      } else if (error instanceof ApiError && error.status === 401) {
        setError("Sua sess\u00e3o expirou. Entre novamente na sua conta.");
      } else {
        setError("N\u00e3o foi poss\u00edvel carregar seu perfil. Verifique sua conex\u00e3o e tente novamente.");
      }
    }).finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [attempt]);
  async function handleSave() {
    if (saving || !loaded) return;
    if (!name.trim()) { setError("Informe seu nome."); return; }
    setSaving(true);
    setError("");
    try {
      const user = await updateUserProfile(name);
      await Promise.all([saveUserName(user.name), saveUserPhone(user.phone)]);
      router.back();
    } catch {
      setError("Não foi possível salvar seu perfil. Tente novamente.");
    } finally { setSaving(false); }
  }
  return <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
    <ScreenHeader title="Editar perfil" />
    {loading ? <LoadingSkeleton layout="form" /> : <>
      {loaded ? <>
        <AppText variant="name">Nome</AppText>
        <TextInput accessibilityLabel="Seu nome" value={name} onChangeText={setName} maxLength={100}
          autoCapitalize="words" autoComplete="name" editable={!saving} style={styles.input} />
        <AppText variant="name">WhatsApp</AppText>
        <AppText color={colors.text.secondary}>{formatPhone(phone)}</AppText>
        <AppText color={colors.text.secondary}>Este número é usado para entrar na sua conta.</AppText>
      </> : null}
      {error ? <AppText accessibilityRole="alert" accessibilityLiveRegion="polite" color={colors.danger}>{error}</AppText> : null}
      <Pressable accessibilityRole="button" accessibilityState={{ disabled: saving, busy: saving }} disabled={saving}
        style={[styles.button, saving && { opacity: 0.6 }]} onPress={loaded ? handleSave : () => setAttempt(attempt + 1)}>
        {saving ? <ActivityIndicator color={colors.white} /> : <AppText variant="button" color={colors.white}>{loaded ? "Salvar alterações" : "Tentar novamente"}</AppText>}
      </Pressable>
    </>}
  </ScrollView>;
}
const styles = StyleSheet.create({
  content: { flexGrow: 1, backgroundColor: colors.white, padding: spacing.md, gap: spacing.md },
  input: { ...typography.field, color: colors.text.primary, minHeight: 56, borderWidth: 1, borderColor: colors.border, borderRadius: radius.md, paddingHorizontal: spacing.md },
  button: { minHeight: 56, backgroundColor: colors.primary, borderRadius: radius.md, justifyContent: "center", alignItems: "center", padding: spacing.md, marginTop: spacing.md },
});
