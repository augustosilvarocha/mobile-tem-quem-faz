import { useEffect, useRef, useState } from "react";
import {
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";

import { AuthHeader } from "@/components/organisms/AuthHeader";
import { LoginCard } from "@/components/organisms/LoginCard";
import { RegistrationChoiceModal } from "@/components/molecules/RegistrationChoiceModal";
import { AppText } from "@/components/atoms/AppText";
import { useLocalSearchParams } from "expo-router";
import { colors, spacing } from "@/theme";

export default function Login() {
  const { registration } = useLocalSearchParams<{ registration?: string }>();
  const registering = registration === "user";
  const [registrationVisible, setRegistrationVisible] = useState(false);
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
        <AuthHeader compact={isKeyboardVisible} registering={registering} />
        <View
          onLayout={(event) => {
            cardOffsetY.current = event.nativeEvent.layout.y;
          }}
        >
          <LoginCard key={registration ?? "login"} registering={registering} onPhoneFocus={handlePhoneFocus} />
        </View>
        {!registering ? (
          <View style={styles.registrationSection}>
          <AppText color={colors.text.secondary} style={styles.registerLabel}>
            Ainda não tem uma conta?
          </AppText>
          <Pressable accessibilityRole="button" onPress={() => setRegistrationVisible(true)} style={styles.registerButton}>
            <AppText color={colors.primary} style={styles.registerText}>Cadastre-se aqui</AppText>
          </Pressable>
          </View>
        ) : null}
      </ScrollView>
      <RegistrationChoiceModal visible={registrationVisible} onClose={() => setRegistrationVisible(false)} />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  registrationSection: { marginTop: spacing.md },
  registerLabel: { textAlign: "center" },
  registerButton: { minHeight: 48, alignItems: "center", justifyContent: "center" },
  registerText: { fontSize: 24, lineHeight: 24, fontWeight: "700", textDecorationLine: "underline" },
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
