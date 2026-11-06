import { Modal, Pressable, ScrollView, StyleSheet, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";

import { AppText } from "@/components/atoms/AppText";
import { colors, radius, spacing } from "@/theme";

type Props = { visible: boolean; onClose: () => void };

export function RegistrationChoiceModal({ visible, onClose }: Props) {
  function selectRegistration(provider: boolean) {
    onClose();
    if (provider) {
      router.push("/(auth)/register-provider");
    } else {
      router.push({ pathname: "/(auth)/login", params: { registration: "user" } });
    }
  }

  return (
    <Modal transparent visible={visible} animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <Pressable accessibilityLabel="Fechar opções de cadastro" accessibilityRole="button" style={StyleSheet.absoluteFill} onPress={onClose} />
        <View style={styles.card} accessibilityViewIsModal>
          <ScrollView contentContainerStyle={styles.content}>
            <View style={styles.header}>
              <AppText variant="subtitle" style={styles.title}>Como você quer começar?</AppText>
              <Pressable accessibilityLabel="Fechar" accessibilityRole="button" onPress={onClose} style={styles.close}>
                <Ionicons name="close" size={24} color={colors.text.primary} />
              </Pressable>
            </View>
            <AppText color={colors.text.secondary}>Escolha a opção que combina com você.</AppText>
            <Pressable accessibilityRole="button" onPress={() => selectRegistration(false)} style={styles.option}>
              <Ionicons name="search-outline" size={28} color={colors.primary} />
              <View style={styles.optionText}>
                <AppText style={styles.optionTitle}>Encontrar serviços</AppText>
                <AppText color={colors.text.secondary}>Crie sua conta para encontrar profissionais e salvar seus favoritos.</AppText>
              </View>
              <Ionicons name="chevron-forward" size={22} color={colors.primary} />
            </Pressable>
            <Pressable accessibilityRole="button" onPress={() => selectRegistration(true)} style={styles.option}>
              <Ionicons name="briefcase-outline" size={28} color={colors.primary} />
              <View style={styles.optionText}>
                <AppText style={styles.optionTitle}>Oferecer serviços</AppText>
                <AppText color={colors.text.secondary}>Cadastre seu perfil de prestador e divulgue seu trabalho.</AppText>
              </View>
              <Ionicons name="chevron-forward" size={22} color={colors.primary} />
            </Pressable>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, justifyContent: "center", backgroundColor: "rgba(0,0,0,0.45)", padding: spacing.lg },
  card: { backgroundColor: colors.white, borderRadius: radius.lg, maxHeight: "85%", width: "100%", maxWidth: 480, alignSelf: "center" },
  content: { padding: spacing.lg, gap: spacing.sm },
  header: { flexDirection: "row", alignItems: "center", gap: spacing.sm },
  title: { flex: 1, color: colors.text.primary },
  close: { minWidth: 44, minHeight: 44, alignItems: "center", justifyContent: "center" },
  option: { flexDirection: "row", alignItems: "center", gap: spacing.sm, borderWidth: 1, borderColor: colors.border, borderRadius: radius.md, padding: spacing.md, marginTop: spacing.sm },
  optionText: { flex: 1, gap: spacing.xs },
  optionTitle: { fontWeight: "700", color: colors.primary },
});
