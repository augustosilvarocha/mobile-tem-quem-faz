import { useState } from "react";
import { Image, Modal, Pressable, ScrollView, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { AppText } from "@/components/atoms/AppText";
import { PortfolioItem } from "@/services/portfolio.service";
import { Provider } from "@/services/provider.service";
import { colors, spacing } from "@/theme";
import { getPortfolioImageUris } from "@/utils/portfolioImages";
import { PortfolioImageCarousel } from "./PortfolioImageCarousel";
import { ZoomableImageModal } from "./ZoomableImageModal";

type Props = { item: PortfolioItem; author: Pick<Provider, "name" | "photo">; onClose: () => void };

export function PortfolioPostModal({ item, author, onClose }: Props) {
  const [zoomIndex, setZoomIndex] = useState<number | null>(null);
  const images = getPortfolioImageUris(item);
  const date = new Date(item.created_at);
  return (
    <Modal visible animationType="slide" onRequestClose={onClose}>
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <AppText style={styles.headerTitle}>Publicação</AppText>
          <Pressable accessibilityRole="button" accessibilityLabel="Fechar publicação" onPress={onClose} style={styles.close}>
            <Ionicons name="close" size={26} color={colors.text.primary} />
          </Pressable>
        </View>
        <ScrollView contentContainerStyle={styles.content}>
          <View style={styles.authorRow}>
            {author.photo ? <Image source={{ uri: author.photo }} style={styles.avatar} /> : <View style={[styles.avatar, styles.placeholder]}><Ionicons name="person" size={24} color={colors.text.secondary} /></View>}
            <View style={styles.authorInfo}>
              <AppText style={styles.author}>{author.name}</AppText>
              <AppText style={styles.date}>{Number.isNaN(date.getTime()) ? "Portfólio" : date.toLocaleDateString("pt-BR", { day: "numeric", month: "long", year: "numeric" })}</AppText>
            </View>
          </View>
          <View style={styles.text}>
            <AppText style={styles.title}>{item.title}</AppText>
            {item.description ? <AppText style={styles.description}>{item.description}</AppText> : null}
          </View>
          {images.length ? <PortfolioImageCarousel imageUris={images} title={item.title} onPressImage={setZoomIndex} /> : <AppText style={styles.text}>Esta publicação não possui fotos.</AppText>}
        </ScrollView>
        {zoomIndex !== null ? <ZoomableImageModal imageUri={images[zoomIndex]} imageUris={images} initialIndex={zoomIndex} visible onClose={() => setZoomIndex(null)} /> : null}
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.white },
  header: { paddingLeft: spacing.md, paddingRight: spacing.xs, borderBottomWidth: 1, borderBottomColor: colors.border, flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  headerTitle: { fontWeight: "800", fontSize: 18 },
  close: { minWidth: 48, minHeight: 48, alignItems: "center", justifyContent: "center" },
  content: { paddingBottom: spacing.xl, width: "100%", maxWidth: 720, alignSelf: "center" },
  authorRow: { flexDirection: "row", alignItems: "center", gap: spacing.sm, padding: spacing.md },
  avatar: { width: 48, height: 48, borderRadius: 24 },
  placeholder: { backgroundColor: colors.background.card, alignItems: "center", justifyContent: "center" },
  authorInfo: { flex: 1 },
  author: { fontWeight: "800", color: colors.text.primary },
  date: { color: colors.text.secondary, fontSize: 13, marginTop: 2 },
  text: { paddingHorizontal: spacing.md, paddingBottom: spacing.md },
  title: { fontSize: 22, lineHeight: 28, fontWeight: "800", color: colors.text.primary },
  description: { fontSize: 16, lineHeight: 24, color: colors.text.primary, marginTop: spacing.sm },
});
