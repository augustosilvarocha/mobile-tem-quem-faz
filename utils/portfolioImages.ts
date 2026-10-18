export const MAX_PORTFOLIO_IMAGES = 10;

export type PortfolioImage = {
  id: number;
  image: string;
  position: number;
};

export type PortfolioImageDraft = {
  id?: number;
  uri: string;
  file?: File;
};

export function getPortfolioImageUris(item: {
  image?: string | null;
  images?: PortfolioImage[];
}): string[] {
  const images = item.images?.map((image) => image.image).filter(Boolean) ?? [];
  return images.length > 0 ? images : item.image ? [item.image] : [];
}

export function appendPortfolioImages(
  current: PortfolioImageDraft[],
  selected: PortfolioImageDraft[]
): PortfolioImageDraft[] {
  const images = [...current];
  const uris = new Set(current.map((image) => image.uri));

  for (const image of selected) {
    if (image.uri && !uris.has(image.uri) && images.length < MAX_PORTFOLIO_IMAGES) {
      images.push(image);
      uris.add(image.uri);
    }
  }

  return images;
}

export function getPortfolioImageChanges(images: PortfolioImageDraft[]) {
  return {
    retainedImageIds: images.flatMap((image) => image.id !== undefined ? [image.id] : []),
    newImages: images.filter((image) => image.id === undefined),
  };
}
