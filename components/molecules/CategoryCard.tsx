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
        <View style={styles.imagePlaceholder} />
      )}

      <AppText
        variant="name"
        style={styles.title}
        numberOfLines={2}
        ellipsizeMode="tail"
        adjustsFontSizeToFit
        minimumFontScale={0.9}
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
    height: 188,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.sm,
    paddingTop: spacing.sm,
    paddingBottom: spacing.xl,
  },

  selectedCard: {
    borderColor: colors.primary,
    borderWidth: 2,
  },

  moreCard: {
    backgroundColor: "#EAF7EF",
  },

  image: {
    width: 124,
    height: 124,
  },

  imagePlaceholder: {
    width: 124,
    height: 124,
    borderRadius: radius.md,
    backgroundColor: colors.background.card,
  },

  moreIconArea: {
    width: 124,
    height: 124,
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
    marginTop: spacing.sm,
    minHeight: 40,
    maxHeight: 40,
    width: "100%",
    flexShrink: 0,
    textAlignVertical: "center",
    includeFontPadding: false,
  },
});
