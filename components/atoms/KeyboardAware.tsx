import { createContext, forwardRef, useCallback, useContext, useEffect, useImperativeHandle, useRef, useState } from "react";
import {
  Keyboard,
  Platform,
  StyleSheet,
  ScrollView as NativeScrollView,
  TextInput as NativeTextInput,
  type ScrollViewProps,
  type TextInputProps,
} from "react-native";

const RevealInput = createContext<(input: NativeTextInput | null) => void>(() => {});

// Type and value exports let existing refs keep using the native instance type.
export type ScrollView = NativeScrollView;
// eslint-disable-next-line @typescript-eslint/no-redeclare
export const ScrollView = forwardRef<NativeScrollView, ScrollViewProps>(function KeyboardAwareScrollView(
  { children, ...props }, forwardedRef
) {
  const ref = useRef<NativeScrollView>(null);
  const focused = useRef<NativeTextInput | null>(null);
  const [webKeyboardInset, setWebKeyboardInset] = useState(0);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  useImperativeHandle(forwardedRef, () => ref.current!);
  const reveal = useCallback((input: NativeTextInput | null = focused.current) => {
    focused.current = input;
    clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      if (!focused.current?.isFocused()) return;
      if (Platform.OS === "web") {
        const input = document.activeElement;
        if (!input?.matches("input, textarea")) return;
        const viewport = window.visualViewport;
        const bounds = input.getBoundingClientRect();
        const bottom = (viewport?.height ?? window.innerHeight) + (viewport?.offsetTop ?? 0) - 24;
        const top = (viewport?.offsetTop ?? 0) + 16;
        const scrollNode = ref.current?.getScrollableNode() as HTMLElement | undefined;
        if (scrollNode && bounds.bottom > bottom) scrollNode.scrollTop += bounds.bottom - bottom;
        else if (scrollNode && bounds.top < top) scrollNode.scrollTop -= top - bounds.top;
      } else {
        if (Keyboard.isVisible()) ref.current?.scrollResponderScrollNativeHandleToKeyboard(focused.current, 32, true);
      }
    }, 150);
  }, []);
  useEffect(() => {
    const onKeyboardChange = () => {
      if (Platform.OS === "web" && window.visualViewport) {
        setWebKeyboardInset(Math.max(0, window.innerHeight - window.visualViewport.height - window.visualViewport.offsetTop));
      }
      reveal();
    };
    const subscription = Keyboard.addListener("keyboardDidShow", onKeyboardChange);
    const viewport = Platform.OS === "web" ? window.visualViewport : null;
    viewport?.addEventListener("resize", onKeyboardChange);
    return () => {
      clearTimeout(timer.current);
      subscription.remove();
      viewport?.removeEventListener("resize", onKeyboardChange);
    };
  }, [reveal]);
  return (
    <RevealInput.Provider value={reveal}>
      <NativeScrollView
        ref={ref}
        keyboardShouldPersistTaps="handled"
        automaticallyAdjustKeyboardInsets={Platform.OS === "ios"}
        {...props}
        contentContainerStyle={[
          props.contentContainerStyle,
          webKeyboardInset > 0 && {
            paddingBottom: webKeyboardInset + 32 + (Number(StyleSheet.flatten(props.contentContainerStyle)?.paddingBottom) || 0),
          },
        ]}
      >
        {children}
      </NativeScrollView>
    </RevealInput.Provider>
  );
});

export type TextInput = NativeTextInput;
// eslint-disable-next-line @typescript-eslint/no-redeclare
export const TextInput = forwardRef<NativeTextInput, TextInputProps>(function KeyboardAwareInput(
  { onFocus, onContentSizeChange, ...props }, ref
) {
  const reveal = useContext(RevealInput);
  const input = useRef<NativeTextInput>(null);
  useImperativeHandle(ref, () => input.current!);
  return <NativeTextInput
    {...props}
    ref={input}
    onFocus={(event) => { onFocus?.(event); reveal(input.current); }}
    onContentSizeChange={(event) => {
      onContentSizeChange?.(event);
      if (input.current?.isFocused()) reveal(input.current);
    }}
  />;
});
