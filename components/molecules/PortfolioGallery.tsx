import { useState } from "react";
import { StyleSheet, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { AppText } from "@/components/atoms/AppText";
import { PortfolioItem } from "@/services/portfolio.service";
import { colors, radius, spacing } from "@/theme";
import { getPortfolioImageUris } from "@/utils/portfolioImages";

import { PortfolioImageCarousel } from "./PortfolioImageCarousel";
import { ZoomableImageModal } from "./ZoomableImageModal";

type PortfolioGalleryProps = {
  items: PortfolioItem[];
};

export function PortfolioGallery({ items }: PortfolioGalleryProps) {
  const [selectedImages, setSelectedImages] = useState<{
    uris: string[];
    index: number;
  } | null>(null);

  if (items.length === 0) {
    return (
      <View style={styles.emptyState}>
        <Ionicons
          name="images-outline"
          size={28}
          color={colors.text.secondary}
        />
        <AppText style={styles.emptyText}>
          Este prestador ainda não adicionou trabalhos ao portfólio.
        </AppText>
      </View>
    );
  }

  return (
    <>
      <View style={styles.grid}>
        {items.map((item) => (
          <View key={item.id} style={styles.item}>
            <PortfolioImageCarousel
              imageUris={getPortfolioImageUris(item)}
              title={item.title}
              onPressImage={(index) => setSelectedImages({
                uris: getPortfolioImageUris(item),
                index,
              })}
            />

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

      {selectedImages ? (
        <ZoomableImageModal
          imageUri={selectedImages.uris[selectedImages.index]}
          imageUris={selectedImages.uris}
          initialIndex={selectedImages.index}
          onClose={() => setSelectedImages(null)}
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
