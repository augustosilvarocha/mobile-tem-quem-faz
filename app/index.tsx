import { useState } from "react";
import { StyleSheet, useWindowDimensions, View } from "react-native";
import { WelcomeHeader } from "@/components/organisms/WelcomeHeader";
import { WelcomeActions } from "@/components/organisms/WelcomeActions";
import { colors } from "@/theme";
import { getWelcomeLayout } from "@/utils/welcomeLayout";

export default function Welcome() {
  const window = useWindowDimensions();
  const [frame, setFrame] = useState<{ width: number; height: number } | null>(null);
  const layout = getWelcomeLayout({
    width: frame?.width ?? Math.min(window.width, 600),
    height: frame?.height ?? window.height,
    fontScale: window.fontScale,
  });

  return (
    <View style={styles.container}>
      <View
        style={styles.content}
        onLayout={({ nativeEvent: { layout: nextFrame } }) => {
          setFrame((current) =>
            current?.width === nextFrame.width && current.height === nextFrame.height
              ? current
              : { width: nextFrame.width, height: nextFrame.height }
          );
        }}
      >
        <WelcomeHeader layout={layout} />
        <WelcomeActions layout={layout} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  content: {
    flex: 1,
    width: "100%",
    maxWidth: 600,
    alignSelf: "center",
  },
});
