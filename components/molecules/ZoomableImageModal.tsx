import { useEffect, useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import { Modal, Pressable, StyleSheet, useWindowDimensions, View } from "react-native";
import {
  Gesture,
  GestureDetector,
  GestureHandlerRootView,
} from "react-native-gesture-handler";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { AppText } from "@/components/atoms/AppText";
import { colors, spacing } from "@/theme";

type ZoomableImageModalProps = {
  imageUri: string;
  imageUris?: string[];
  initialIndex?: number;
  onClose: () => void;
  visible: boolean;
};

function clamp(value: number, minimum: number, maximum: number) {
  "worklet";
  return Math.min(Math.max(value, minimum), maximum);
}

export function ZoomableImageModal({
  imageUri,
  imageUris,
  initialIndex = 0,
  onClose,
  visible,
}: ZoomableImageModalProps) {
  const { height, width } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const [activeIndex, setActiveIndex] = useState(initialIndex);
  const images = imageUris?.length ? imageUris : [imageUri];
  const currentIndex = Math.max(0, Math.min(activeIndex, images.length - 1));
  const imageSize = Math.max(width, height);
  const scale = useSharedValue(1);
  const savedScale = useSharedValue(1);
  const translationX = useSharedValue(0);
  const translationY = useSharedValue(0);
  const savedTranslationX = useSharedValue(0);
  const savedTranslationY = useSharedValue(0);

  useEffect(() => {
    setActiveIndex(initialIndex);
    scale.value = 1;
    savedScale.value = 1;
    translationX.value = 0;
    translationY.value = 0;
    savedTranslationX.value = 0;
    savedTranslationY.value = 0;
  }, [imageUri, initialIndex, visible, scale, savedScale, translationX, translationY, savedTranslationX, savedTranslationY]);

  function resetZoom() {
    scale.value = 1;
    savedScale.value = 1;
    translationX.value = 0;
    translationY.value = 0;
    savedTranslationX.value = 0;
    savedTranslationY.value = 0;
  }

  function handleClose() {
    resetZoom();
    onClose();
  }

  function showImage(index: number) {
    resetZoom();
    setActiveIndex(index);
  }

  const pinchGesture = Gesture.Pinch()
    .onUpdate((event) => {
      scale.value = clamp(savedScale.value * event.scale, 1, 4);
    })
    .onEnd(() => {
      savedScale.value = scale.value;

      const maximumOffset = (imageSize * (scale.value - 1)) / 2;
      translationX.value = withTiming(
        clamp(translationX.value, -maximumOffset, maximumOffset)
      );
      translationY.value = withTiming(
        clamp(translationY.value, -maximumOffset, maximumOffset)
      );
      savedTranslationX.value = translationX.value;
      savedTranslationY.value = translationY.value;
    });

  const panGesture = Gesture.Pan()
    .onUpdate((event) => {
      if (scale.value <= 1) {
        return;
      }

      const maximumOffset = (imageSize * (scale.value - 1)) / 2;
      translationX.value = clamp(
        savedTranslationX.value + event.translationX,
        -maximumOffset,
        maximumOffset
      );
      translationY.value = clamp(
        savedTranslationY.value + event.translationY,
        -maximumOffset,
        maximumOffset
      );
    })
    .onEnd(() => {
      savedTranslationX.value = translationX.value;
      savedTranslationY.value = translationY.value;
    });

  const doubleTapGesture = Gesture.Tap()
    .numberOfTaps(2)
    .maxDuration(250)
    .onEnd((_event, success) => {
      if (!success) {
        return;
      }

      if (scale.value > 1) {
        scale.value = withTiming(1);
        savedScale.value = 1;
        translationX.value = withTiming(0);
        translationY.value = withTiming(0);
        savedTranslationX.value = 0;
        savedTranslationY.value = 0;
        return;
      }

      scale.value = withTiming(2);
      savedScale.value = 2;
    });

  const composedGesture = Gesture.Simultaneous(
    pinchGesture,
    panGesture,
    doubleTapGesture
  );

  const animatedImageStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translationX.value },
      { translateY: translationY.value },
      { scale: scale.value },
    ],
  }));

  return (
    <Modal
      animationType="fade"
      navigationBarTranslucent
      onRequestClose={handleClose}
      statusBarTranslucent
      transparent
      visible={visible}
    >
      <GestureHandlerRootView style={styles.root}>
        <View style={styles.overlay}>
          <GestureDetector gesture={composedGesture}>
            <Animated.Image
              resizeMode="contain"
              source={{ uri: images[currentIndex] }}
              style={[
                styles.image,
                { height, width },
                animatedImageStyle,
              ]}
            />
          </GestureDetector>

          <Pressable
            accessibilityLabel="Fechar foto"
            hitSlop={12}
            onPress={handleClose}
            style={[styles.closeButton, { top: insets.top + spacing.sm }]}
          >
            <Ionicons name="close" color={colors.white} size={30} />
          </Pressable>

          {images.length > 1 ? (
            <View style={[styles.galleryControls, { bottom: insets.bottom + spacing.md }]}>
              <Pressable
                accessibilityLabel="Foto anterior"
                accessibilityRole="button"
                disabled={currentIndex === 0}
                onPress={() => showImage(currentIndex - 1)}
                style={[styles.galleryButton, currentIndex === 0 && styles.disabled]}
              >
                <Ionicons name="chevron-back" color={colors.white} size={26} />
              </Pressable>
              <AppText color={colors.white}>
                {currentIndex + 1} / {images.length}
              </AppText>
              <Pressable
                accessibilityLabel="Próxima foto"
                accessibilityRole="button"
                disabled={currentIndex === images.length - 1}
                onPress={() => showImage(currentIndex + 1)}
                style={[styles.galleryButton, currentIndex === images.length - 1 && styles.disabled]}
              >
                <Ionicons name="chevron-forward" color={colors.white} size={26} />
              </Pressable>
            </View>
          ) : (
            <AppText
              color={colors.white}
              style={[styles.hint, { bottom: insets.bottom + spacing.lg }]}
            >
              Use dois dedos ou toque duas vezes para ampliar
            </AppText>
          )}
        </View>
      </GestureHandlerRootView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },

  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.96)",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },

  image: {
    maxWidth: "100%",
    maxHeight: "100%",
  },

  closeButton: {
    position: "absolute",
    right: spacing.md,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(255, 255, 255, 0.14)",
    alignItems: "center",
    justifyContent: "center",
  },

  hint: {
    position: "absolute",
    left: spacing.screen,
    right: spacing.screen,
    textAlign: "center",
    fontSize: 13,
    opacity: 0.8,
  },

  galleryControls: {
    position: "absolute",
    left: spacing.screen,
    right: spacing.screen,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  galleryButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "rgba(255, 255, 255, 0.14)",
    alignItems: "center",
    justifyContent: "center",
  },

  disabled: { opacity: 0.3 },
});
