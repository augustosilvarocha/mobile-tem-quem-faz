import Constants, { ExecutionEnvironment } from "expo-constants";
import { Platform } from "react-native";

export function canRenderNativeMap(): boolean {
  if (Platform.OS === "ios") {
    return true;
  }

  return (
    Platform.OS === "android" &&
    (Constants.executionEnvironment === ExecutionEnvironment.StoreClient ||
      Constants.expoConfig?.extra?.googleMapsAndroidEnabled === true)
  );
}
