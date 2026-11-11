import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";

// SecureStore is native-only. Browser sessions must survive closing a tab.
export const storage = {
  async getItemAsync(key: string): Promise<string | null> {
    return Platform.OS === "web"
      ? (typeof localStorage === "undefined" ? null : localStorage.getItem(key))
      : SecureStore.getItemAsync(key);
  },
  async setItemAsync(key: string, value: string): Promise<void> {
    if (Platform.OS === "web") localStorage.setItem(key, value);
    else await SecureStore.setItemAsync(key, value);
  },
  async deleteItemAsync(key: string): Promise<void> {
    if (Platform.OS === "web") localStorage.removeItem(key);
    else await SecureStore.deleteItemAsync(key);
  },
};
