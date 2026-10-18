import { useEffect, useRef, useState } from "react";
import {
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { AppText } from "@/components/atoms/AppText";
import { colors, spacing } from "@/theme";

type PortfolioImageCarouselProps = {
  imageUris: string[];
  title: string;
  onPressImage: (index: number) => void;
};

export function PortfolioImageCarousel({
  imageUris,
  title,
  onPressImage,
}: PortfolioImageCarouselProps) {
  const scrollRef = useRef<ScrollView>(null);
  const [width, setWidth] = useState(0);
  const [activeIndex, setActiveIndex] = useState(0);
  const imageKey = imageUris.join("\n");
  const currentIndex = Math.min(activeIndex, Math.max(0, imageUris.length - 1));

  useEffect(() => {
    setActiveIndex(0);
    scrollRef.current?.scrollTo({ x: 0, animated: false });
  }, [imageKey, width]);

  function showImage(index: number) {
    setActiveIndex(index);
    scrollRef.current?.scrollTo({ x: index * width, animated: true });
  }

  return (
    <View
      onLayout={(event) => setWidth(event.nativeEvent.layout.width)}
      style={styles.container}
    >
      {imageUris.length > 0 && width > 0 ? (
        <ScrollView
          ref={scrollRef}
          horizontal
          nestedScrollEnabled
          pagingEnabled
          scrollEventThrottle={16}
          showsHorizontalScrollIndicator={false}
          onScroll={(event) => setActiveIndex(Math.max(0, Math.min(
            imageUris.length - 1,
            Math.round(event.nativeEvent.contentOffset.x / width)
          )))}
        >
          {imageUris.map((uri, index) => (
            <Pressable
              accessibilityLabel={`Ampliar foto ${index + 1} de ${title}`}
              accessibilityRole="button"
              key={`${index}:${uri}`}
              onPress={() => onPressImage(index)}
              style={{ width, height: width }}
            >
              <Image
                resizeMode="contain"
                source={{ uri }}
                style={styles.image}
              />
            </Pressable>
          ))}
        </ScrollView>
      ) : (
        <View style={styles.placeholder}>
          <Ionicons name="image-outline" size={32} color={colors.text.secondary} />
        </View>
      )}

      {imageUris.length > 1 ? (
        <>
          <View pointerEvents="none" style={styles.counter}>
            <AppText style={styles.counterText}>
              {currentIndex + 1}/{imageUris.length}
            </AppText>
          </View>
          <Pressable
            accessibilityLabel={`Foto anterior de ${title}`}
            accessibilityRole="button"
            disabled={currentIndex === 0}
            onPress={() => showImage(currentIndex - 1)}
            style={[styles.arrow, styles.previous, currentIndex === 0 && styles.disabled]}
          >
            <Ionicons name="chevron-back" size={20} color={colors.white} />
          </Pressable>
          <Pressable
            accessibilityLabel={`Próxima foto de ${title}`}
            accessibilityRole="button"
            disabled={currentIndex === imageUris.length - 1}
            onPress={() => showImage(currentIndex + 1)}
            style={[styles.arrow, styles.next, currentIndex === imageUris.length - 1 && styles.disabled]}
          >
            <Ionicons name="chevron-forward" size={20} color={colors.white} />
          </Pressable>
        </>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
    aspectRatio: 1,
    backgroundColor: colors.background.card,
    overflow: "hidden",
  },
  image: { width: "100%", height: "100%" },
  placeholder: { flex: 1, alignItems: "center", justifyContent: "center" },
  counter: {
    position: "absolute",
    right: spacing.xs,
    top: spacing.xs,
    width: 44,
    height: 24,
    paddingHorizontal: spacing.xs,
    borderRadius: 4,
    backgroundColor: "rgba(0, 0, 0, 0.65)",
    alignItems: "center",
    justifyContent: "center",
  },
  counterText: { fontSize: 12, lineHeight: 16, color: colors.white },
  arrow: {
    position: "absolute",
    top: "50%",
    marginTop: -16,
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(0, 0, 0, 0.65)",
  },
  previous: { left: spacing.xs },
  next: { right: spacing.xs },
  disabled: { opacity: 0.3 },
});
