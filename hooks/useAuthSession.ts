import { useEffect } from "react";
import { AppState } from "react-native";
import { useRootNavigationState } from "expo-router";

import { renewAuthSession, getTokenExpiration } from "@/services/session.service";
import { getAccessToken, subscribeAuthSession } from "@/utils/authStorage";

export function useAuthSession(enabled: boolean) {
  const navigation = useRootNavigationState();

  useEffect(() => {
    if (!enabled || !navigation?.key) return;

    let active = true;
    let revision = 0;
    let timer: ReturnType<typeof setTimeout> | undefined;

    async function checkSession() {
      const currentRevision = ++revision;
      clearTimeout(timer);
      const token = await getAccessToken();
      if (!active || currentRevision !== revision || !token) return;

      const expiresAt = getTokenExpiration(token);
      const remaining = expiresAt === null ? 0 : expiresAt - Date.now();

      if (remaining <= 0) {
        await renewAuthSession(token);
        if (active && currentRevision === revision) timer = setTimeout(checkSessionSafely, 30_000);
        return;
      }

      timer = setTimeout(checkSessionSafely, Math.min(remaining, 2_147_483_647));
    }

    function checkSessionSafely() {
      checkSession().catch((error) => {
        console.log("Erro ao verificar sessão:", error);
        if (active) timer = setTimeout(checkSessionSafely, 30_000);
      });
    }

    const unsubscribe = subscribeAuthSession(checkSessionSafely);
    const subscription = AppState.addEventListener("change", (state) => {
      if (state === "active") checkSessionSafely();
    });
    checkSessionSafely();

    return () => {
      active = false;
      clearTimeout(timer);
      unsubscribe();
      subscription.remove();
    };
  }, [enabled, navigation?.key]);
}
