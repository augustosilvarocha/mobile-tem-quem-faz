import { useEffect, useRef, useState } from "react";
import {
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import { useLocalSearchParams } from "expo-router";

import { VerificationHeader } from "@/components/organisms/VerificationHeader";
import { VerificationCard } from "@/components/organisms/VerificationCard";
import { colors, spacing } from "@/theme";
import { CreateProviderPayload } from "@/services/provider.service";

export default function Verification() {
  const scrollRef = useRef<ScrollView>(null);
  const cardOffsetY = useRef(0);
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);
  const { phone, registration } = useLocalSearchParams<{
    phone: string;
    registration?: string;
  }>();

  let registrationData: CreateProviderPayload | undefined;

  if (registration) {
    try {
      registrationData = JSON.parse(registration);
    } catch (err) {
      console.log("Erro ao ler dados de cadastro:", err);
    }
  }

  useEffect(() => {
    const showEvent = Platform.OS === "ios" ? "keyboardWillShow" : "keyboardDidShow";
    const hideEvent = Platform.OS === "ios" ? "keyboardWillHide" : "keyboardDidHide";
    const showSubscription = Keyboard.addListener(showEvent, () => {
      setIsKeyboardVisible(true);
    });
    const hideSubscription = Keyboard.addListener(hideEvent, () => {
      setIsKeyboardVisible(false);
      scrollRef.current?.scrollTo({ y: 0, animated: true });
    });

    return () => {
      showSubscription.remove();
      hideSubscription.remove();
    };
  }, []);

  function handleCodeFocus() {
    setIsKeyboardVisible(true);

    setTimeout(() => {
      scrollRef.current?.scrollTo({
        y: Math.max(0, cardOffsetY.current - spacing.sm),
        animated: true,
      });
    }, 250);
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
      style={styles.container}
    >
      <ScrollView
        ref={scrollRef}
        automaticallyAdjustKeyboardInsets={Platform.OS === "ios"}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <VerificationHeader compact={isKeyboardVisible} />

        <View
          onLayout={(event) => {
            cardOffsetY.current = event.nativeEvent.layout.y;
          }}
        >
          <VerificationCard
            phone={phone}
            registrationData={registrationData}
            onCodeFocus={handleCodeFocus}
          />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },

  content: {
    flexGrow: 1,
    paddingHorizontal: spacing.screen,
    paddingBottom: spacing.xl,
    backgroundColor: colors.background.primary,
  },
});
