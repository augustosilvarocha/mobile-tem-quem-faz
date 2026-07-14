import type { ProviderCardData } from "@/hooks/useProviders";

export function normalizeCategoryName(categoryName?: string | null) {
  return (categoryName ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toLowerCase();
}

export function getOneProviderPerCategory(providers: ProviderCardData[] = []) {
  const representedCategories = new Set<string>();

  return providers.filter((provider) => {
    const providerCategoryNames = provider.categoryNames ?? [];
    const categoryNames = providerCategoryNames.length > 0
      ? providerCategoryNames
      : [provider.category];
    const hasNewCategory = categoryNames.some((categoryName) => {
      const normalizedCategory = normalizeCategoryName(categoryName);

      return normalizedCategory && !representedCategories.has(normalizedCategory);
    });

    if (!hasNewCategory) {
      return false;
    }

    categoryNames.forEach((categoryName) => {
      const normalizedCategory = normalizeCategoryName(categoryName);

      if (normalizedCategory) {
        representedCategories.add(normalizedCategory);
      }
    });

    return true;
  });
}
