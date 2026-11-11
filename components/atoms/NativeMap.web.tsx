import type { ComponentType } from "react";
import { View } from "react-native";
import type { MapViewProps, MapMarkerProps } from "react-native-maps";

export type { Region } from "react-native-maps";

// Web callers already display an address and an external map link.
export default function NativeMap({ style }: MapViewProps) {
  return <View style={style} />;
}

export const Marker: ComponentType<MapMarkerProps> = () => null;
