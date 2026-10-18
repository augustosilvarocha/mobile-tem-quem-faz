import type { ComponentProps } from "react";
import type { MaterialCommunityIcons } from "@expo/vector-icons";

import { normalizeCategoryName } from "@/utils/providerDisplay";

type CategoryIconName = ComponentProps<typeof MaterialCommunityIcons>["name"];

const categoryIconNames = new Map<string, CategoryIconName>([
  ["baba", "baby-face-outline"],
  ["cabeleireira", "hair-dryer"],
  ["cabeleireiro", "content-cut"],
  ["barbeiro", "razor-double-edge"],
  ["chaveiro", "key-variant"],
  ["cuidadora de idosos", "hand-heart"],
  ["cuidador de idosos", "hand-heart"],
  ["dedetizador", "bug-outline"],
  ["dedetizadora", "bug-outline"],
  ["dedetizacao", "bug-outline"],
  ["eletricista", "lightning-bolt"],
  ["encanador", "pipe-wrench"],
  ["encanadora", "pipe-wrench"],
  ["entregador de agua", "water"],
  ["entregadora de agua", "water"],
  ["entregador de gas", "gas-cylinder"],
  ["entregadora de gas", "gas-cylinder"],
  ["faxineira", "broom"],
  ["faxineiro", "broom"],
  ["diarista", "broom"],
  ["impressao e xerox", "printer"],
  ["jardineiro", "shovel"],
  ["jardineira", "shovel"],
  ["limpador de piscina", "pool"],
  ["limpadora de piscina", "pool"],
  ["manicure", "hand-back-right-outline"],
  ["pedicure", "hand-back-right-outline"],
  ["marceneiro", "hand-saw"],
  ["marceneira", "hand-saw"],
  ["mecanico", "car-wrench"],
  ["mecanica", "car-wrench"],
  ["pedreiro", "wall"],
  ["pedreira", "wall"],
  ["pintor", "format-paint"],
  ["pintora", "format-paint"],
  ["professor particular", "book-open-variant"],
  ["professora particular", "book-open-variant"],
  ["tecnico em informatica", "desktop-tower-monitor"],
  ["tecnica em informatica", "desktop-tower-monitor"],
  ["vidraceiro", "window-closed-variant"],
  ["vidraceira", "window-closed-variant"],
]);

export function getCategoryIconName(categoryName: string): CategoryIconName {
  return (
    categoryIconNames.get(normalizeCategoryName(categoryName)) ??
    "briefcase-outline"
  );
}
