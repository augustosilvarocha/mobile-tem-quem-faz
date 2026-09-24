import { useState } from "react";
import { Image, Pressable, StyleSheet, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { AppText } from "@/components/atoms/AppText";
import { PortfolioItem } from "@/services/portfolio.service";
import { colors, radius, spacing } from "@/theme";

import { ZoomableImageModal } from "./ZoomableImageModal";

type PortfolioGalleryProps = {
  items: PortfolioItem[];
};

export function PortfolioGallery({ items }: PortfolioGalleryProps) {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  if (items.length === 0) {
    return (
      <View style={styles.emptyState}>
        <Ionicons
          name="images-outline"
          size={28}
          color={colors.text.secondary}
        />
        <AppText style={styles.emptyText}>
          Este prestador ainda nao adicionou trabalhos ao portfolio.
        </AppText>
      </View>
    );
  }

  return (
    <>
      <View style={styles.grid}>
        {items.map((item) => (
          <View key={item.id} style={styles.item}>
            {item.image ? (
              <Pressable
                accessibilityLabel={`Ampliar imagem de ${item.title}`}
                accessibilityRole="button"
                onPress={() => setSelectedImage(item.image)}
                style={({ pressed }) => [
                  styles.imageButton,
                  pressed && styles.pressed,
                ]}
              >
                <Image
                  resizeMode="contain"
                  source={{ uri: item.image }}
                  style={styles.image}
                />
              </Pressable>
            ) : (
              <View style={styles.imagePlaceholder}>
                <Ionicons
                  name="image-outline"
                  size={32}
                  color={colors.text.secondary}
                />
              </View>
            )}

            <View style={styles.itemContent}>
              <AppText style={styles.title} numberOfLines={2}>
                {item.title}
              </AppText>
              <AppText style={styles.description} numberOfLines={3}>
                {item.description}
              </AppText>
            </View>
          </View>
        ))}
      </View>

      {selectedImage ? (
        <ZoomableImageModal
          imageUri={selectedImage}
          onClose={() => setSelectedImage(null)}
          visible
        />
      ) : null}
    </>
  );
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
  },

  item: {
    width: "48%",
    minWidth: 0,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    backgroundColor: colors.white,
    overflow: "hidden",
  },

  imageButton: {
    width: "100%",
    aspectRatio: 1,
    backgroundColor: colors.background.card,
  },

  image: {
    width: "100%",
    height: "100%",
  },

  imagePlaceholder: {
    width: "100%",
    aspectRatio: 1,
    backgroundColor: colors.background.card,
    alignItems: "center",
    justifyContent: "center",
  },

  pressed: {
    opacity: 0.75,
  },

  itemContent: {
    padding: spacing.sm,
  },

  title: {
    color: colors.text.primary,
    fontWeight: "800",
    fontSize: 15,
    lineHeight: 19,
  },

  description: {
    color: colors.text.secondary,
    fontSize: 13,
    lineHeight: 18,
    marginTop: spacing.xs,
  },

  emptyState: {
    minHeight: 128,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    backgroundColor: colors.white,
    padding: spacing.md,
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
  },

  emptyText: {
    color: colors.text.secondary,
    fontSize: 14,
    lineHeight: 19,
    textAlign: "center",
  },
});
