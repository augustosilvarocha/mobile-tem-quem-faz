export type ProviderGender = "" | "female" | "male" | "non_binary" | "other";

export const GENDER_OPTIONS: { id: ProviderGender; label: string }[] = [
  { id: "", label: "Prefiro não informar" },
  { id: "female", label: "Feminino" },
  { id: "male", label: "Masculino" },
  { id: "non_binary", label: "Não binário" },
  { id: "other", label: "Outro" },
];

export function getGenderLabel(gender?: ProviderGender): string | undefined {
  return gender ? GENDER_OPTIONS.find((option) => option.id === gender)?.label : undefined;
}
