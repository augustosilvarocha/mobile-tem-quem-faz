import { ScrollView } from "@/components/atoms/KeyboardAware";
import { useEffect, useState } from "react";
import { Redirect } from "expo-router";
import { getAccessToken } from "@/utils/authStorage";
import { StyleSheet, useWindowDimensions, View } from "react-native";
import { WelcomeHeader } from "@/components/organisms/WelcomeHeader";
import { WelcomeActions } from "@/components/organisms/WelcomeActions";
import { colors } from "@/theme";
import { getWelcomeLayout } from "@/utils/welcomeLayout";

export default function Welcome() {
  const [authenticated, setAuthenticated] = useState<boolean | null>(null);
  useEffect(() => {
    let active = true;
    getAccessToken().then((token) => {
      if (active) setAuthenticated(Boolean(token));
    }).catch(() => { if (active) setAuthenticated(false); });
    return () => { active = false; };
  }, []);
  const window = useWindowDimensions();
  const [frame, setFrame] = useState<{ width: number; height: number } | null>(null);
  const layout = getWelcomeLayout({
    width: frame?.width ?? Math.min(window.width, 600),
    height: frame?.height ?? window.height,
    fontScale: window.fontScale,
  });

  if (authenticated === null) return null;
  if (authenticated) return <Redirect href="/home" />;

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
        <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
          <WelcomeHeader layout={layout} />
          <WelcomeActions layout={layout} />
        </ScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  scroll: {
    flex: 1,
  },
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
