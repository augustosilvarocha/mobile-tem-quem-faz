import { Ionicons } from "@expo/vector-icons";
import {
  Modal,
  Pressable,
  StyleSheet,
  View,
} from "react-native";

import { AppText } from "@/components/atoms/AppText";
import { colors, radius, spacing } from "@/theme";

type ConfirmActionModalProps = {
  cancelText?: string;
  confirmText: string;
  description: string;
  iconName: keyof typeof Ionicons.glyphMap;
  loading?: boolean;
  onCancel: () => void;
  onConfirm: () => void;
  title: string;
  variant?: "danger" | "primary";
  visible: boolean;
};

export function ConfirmActionModal({
  cancelText = "Cancelar",
  confirmText,
  description,
  iconName,
  loading = false,
  onCancel,
  onConfirm,
  title,
  variant = "danger",
  visible,
}: ConfirmActionModalProps) {
  function handleCancel() {
    if (!loading) {
      onCancel();
    }
  }

  const actionColor = variant === "primary" ? colors.primary : colors.danger;

  return (
    <Modal
      animationType="fade"
      transparent
      visible={visible}
      statusBarTranslucent
      onRequestClose={handleCancel}
    >
      <View style={styles.overlay}>
        <Pressable style={styles.backdrop} onPress={handleCancel} />

        <View style={styles.card}>
          <View style={styles.iconCircle}>
            <Ionicons name={iconName} size={28} color={actionColor} />
          </View>

          <AppText style={styles.title}>{title}</AppText>
          <AppText style={styles.description}>{description}</AppText>

          <Pressable
            disabled={loading}
            style={[
              styles.confirmButton,
              { backgroundColor: actionColor },
              loading && styles.disabledButton,
            ]}
            onPress={onConfirm}
          >
            <AppText style={styles.confirmText}>
              {loading ? "Aguarde..." : confirmText}
            </AppText>
          </Pressable>

          <Pressable
            disabled={loading}
            style={[styles.cancelButton, loading && styles.disabledButton]}
            onPress={handleCancel}
          >
            <AppText style={[styles.cancelText, { color: actionColor }]}>
              {cancelText}
            </AppText>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },

  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.42)",
  },

  card: {
    width: "82%",
    maxWidth: 340,
    borderRadius: radius.md,
    backgroundColor: colors.white,
    padding: spacing.lg,
    alignItems: "center",
  },

  iconCircle: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: colors.background.card,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.md,
  },

  title: {
    color: colors.text.primary,
    fontWeight: "800",
    fontSize: 20,
    lineHeight: 24,
    textAlign: "center",
    marginBottom: spacing.xs,
  },

  description: {
    color: colors.text.secondary,
    textAlign: "center",
    fontSize: 15,
    lineHeight: 20,
    marginBottom: spacing.lg,
  },

  confirmButton: {
    width: "100%",
    height: 56,
    borderRadius: radius.sm,
    backgroundColor: colors.danger,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.sm,
  },

  confirmText: {
    color: colors.white,
    fontWeight: "800",
    fontSize: 16,
    lineHeight: 20,
  },

  cancelButton: {
    width: "100%",
    height: 54,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.white,
    alignItems: "center",
    justifyContent: "center",
  },

  cancelText: {
    color: colors.danger,
    fontWeight: "800",
    fontSize: 16,
    lineHeight: 20,
  },

  disabledButton: {
    opacity: 0.6,
  },
});
