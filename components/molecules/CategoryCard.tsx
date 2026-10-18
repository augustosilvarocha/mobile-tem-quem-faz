import { Image, Pressable, StyleSheet, View, ViewStyle, TextStyle, ImageStyle } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { AppText } from "@/components/atoms/AppText";
import { CategoryIcon } from "@/components/atoms/CategoryIcon";
import { colors, radius, spacing } from "@/theme";

type CategoryCardProps = {
  title: string;
  image?: string;
  selected?: boolean;
  isMore?: boolean;
  onPress?: () => void;
};

export function CategoryCard({
  title,
  image,
  selected = false,
  isMore = false,
  onPress,
}: CategoryCardProps) {
  return (
    <Pressable
      accessibilityLabel={isMore ? "Ver mais categorias" : title}
      accessibilityRole="button"
      accessibilityState={{ selected }}
      style={[
        styles.card,
        selected ? styles.selectedCard : undefined,
        isMore ? styles.moreCard : undefined,
      ]}
      onPress={onPress}
    >
      {isMore ? (
        <View style={styles.moreIconArea}>
          <View style={styles.plusCircle}>
            <Ionicons name="add" size={56} color={colors.primary} />
          </View>
        </View>
      ) : image ? (
        <Image
          source={{ uri: image }}
          style={styles.image}
          resizeMode="contain"
        />
      ) : (
        <View style={styles.imagePlaceholder}>
          <CategoryIcon categoryName={title} size={64} />
        </View>
      )}

      <AppText
        variant="name"
        style={styles.title}
        numberOfLines={2}
        ellipsizeMode="tail"
      >
        {title}
      </AppText>
    </Pressable>
  );
}

const styles = StyleSheet.create<{
  card: ViewStyle;
  selectedCard: ViewStyle;
  moreCard: ViewStyle;
  image: ImageStyle;
  imagePlaceholder: ViewStyle;
  moreIconArea: ViewStyle;
  plusCircle: ViewStyle;
  title: TextStyle;
}>({
  card: {
    width: "47%",
    minHeight: 176,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    alignItems: "center",
    justifyContent: "flex-start",
    paddingHorizontal: spacing.sm,
    paddingTop: spacing.sm,
    paddingBottom: spacing.sm,
  },

  selectedCard: {
    borderColor: colors.primary,
    borderWidth: 2,
  },

  moreCard: {
    backgroundColor: "#EAF7EF",
  },

  image: {
    width: 116,
    height: 116,
  },

  imagePlaceholder: {
    width: 116,
    height: 116,
    borderRadius: radius.md,
    backgroundColor: colors.background.card,
    alignItems: "center",
    justifyContent: "center",
  },

  moreIconArea: {
    width: 116,
    height: 116,
    alignItems: "center",
    justifyContent: "center",
  },

  plusCircle: {
    width: 96,
    height: 96,
    borderRadius: radius.full,
    backgroundColor: colors.white,
    alignItems: "center",
    justifyContent: "center",
  },

  title: {
    textAlign: "center",
    marginTop: spacing.xs,
    minHeight: 40,
    width: "100%",
    flexShrink: 0,
    textAlignVertical: "center",
    includeFontPadding: false,
  },
});
