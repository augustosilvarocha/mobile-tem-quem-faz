import { Image, Pressable, StyleSheet, View, ViewStyle, TextStyle, ImageStyle } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { AppText } from "@/components/atoms/AppText";
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
      style={[
        styles.card,
        selected ? styles.selectedCard : undefined,
        isMore ? styles.moreCard : undefined,
      ]}
      onPress={onPress}
    >
      {isMore ? (
        <View style={styles.plusCircle}>
          <Ionicons name="add" size={56} color={colors.primary} />
        </View>
      ) : image ? (
        <Image
          source={{ uri: image }}
          style={styles.image}
          resizeMode="contain"
        />
      ) : (
        <View style={styles.imagePlaceholder} />
      )}

      <AppText
        numberOfLines={2}
        ellipsizeMode="tail"
        style={[
          styles.title,
          isMore ? styles.moreText : undefined,
        ]}
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
  plusCircle: ViewStyle;
  title: TextStyle;
  moreText: TextStyle;
}>({
  card: {
    width: "47%",
    height: 180,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.md,
  },

  selectedCard: {
    borderColor: colors.primary,
    borderWidth: 2,
  },

  moreCard: {
    backgroundColor: "#EAF7EF",
  },

  image: {
    width: 120,
    height: 120,
  },

  imagePlaceholder: {
    width: 120,
    height: 120,
    borderRadius: radius.md,
    backgroundColor: colors.background.card,
  },

  plusCircle: {
    width: 100,
    height: 100,
    borderRadius: radius.full,
    backgroundColor: colors.white,
    alignItems: "center",
    justifyContent: "center",
  },

  title: {
    fontWeight: "700",
    color: colors.text.primary,
    textAlign: "center",
    lineHeight: 18,
    marginTop: spacing.sm,
    minHeight: 38,
    maxWidth: "100%",
  },

  moreText: {
    color: colors.primary,
    textAlignVertical: "center",
  },
});
