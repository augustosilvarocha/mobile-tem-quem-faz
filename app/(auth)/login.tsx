import { useEffect, useRef, useState } from "react";
import {
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";

import { AuthHeader } from "@/components/organisms/AuthHeader";
import { LoginCard } from "@/components/organisms/LoginCard";
import { ProviderRegisterCard } from "@/components/molecules/ProviderRegisterCard";
import { colors, spacing } from "@/theme";

export default function Login() {
  const scrollRef = useRef<ScrollView>(null);
  const cardOffsetY = useRef(0);
  const focusScrollTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);

  useEffect(() => {
    const showEvent = Platform.OS === "ios" ? "keyboardWillShow" : "keyboardDidShow";
    const hideEvent = Platform.OS === "ios" ? "keyboardWillHide" : "keyboardDidHide";
    const showSubscription = Keyboard.addListener(showEvent, () => {
      setIsKeyboardVisible(true);
    });
    const hideSubscription = Keyboard.addListener(hideEvent, () => {
      if (focusScrollTimeout.current !== null) {
        clearTimeout(focusScrollTimeout.current);
      }
      setIsKeyboardVisible(false);
      scrollRef.current?.scrollTo({ y: 0, animated: true });
    });

    return () => {
      showSubscription.remove();
      hideSubscription.remove();
      if (focusScrollTimeout.current !== null) {
        clearTimeout(focusScrollTimeout.current);
      }
    };
  }, []);

  function handlePhoneFocus() {
    setIsKeyboardVisible(true);

    if (focusScrollTimeout.current !== null) {
      clearTimeout(focusScrollTimeout.current);
    }
    focusScrollTimeout.current = setTimeout(() => {
      scrollRef.current?.scrollTo({
        y: Math.max(0, cardOffsetY.current - spacing.sm),
        animated: true,
      });
    }, 250);
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
    >
      <ScrollView
        ref={scrollRef}
        automaticallyAdjustKeyboardInsets={Platform.OS === "ios"}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <AuthHeader compact={isKeyboardVisible} />
        <View
          onLayout={(event) => {
            cardOffsetY.current = event.nativeEvent.layout.y;
          }}
        >
          <LoginCard onPhoneFocus={handlePhoneFocus} />
        </View>
        <ProviderRegisterCard />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },

  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: spacing.screen,
    paddingBottom: spacing.xl ?? spacing.lg,
  },
});
