import { getRequiredAccessToken } from "@/utils/authStorage";
import {
  getPortfolioImageChanges,
  MAX_PORTFOLIO_IMAGES,
  type PortfolioImage,
  type PortfolioImageDraft,
} from "@/utils/portfolioImages";
import { File } from "expo-file-system";

import { api, apiDelete, apiUpload } from "./api";
import { normalizeRemoteImageUrl } from "./mediaUrl";

export type PortfolioItem = {
  id: number;
  provider: number;
  title: string;
  description: string;
  image: string | null;
  images: PortfolioImage[];
  created_at: string;
};

export type SavePortfolioItemPayload = {
  title: string;
  description: string;
  images: PortfolioImageDraft[];
};

function normalizePortfolioItem(item: PortfolioItem): PortfolioItem {
  return {
    ...item,
    image: normalizeRemoteImageUrl(item.image),
    images: (item.images ?? []).map((image) => ({
      ...image,
      image: normalizeRemoteImageUrl(image.image) ?? image.image,
    })),
  };
}

function appendPortfolioFormData(
  formData: FormData,
  payload: SavePortfolioItemPayload
) {
  formData.append("title", payload.title.trim());
  formData.append("description", payload.description.trim());

  if (payload.images.length > MAX_PORTFOLIO_IMAGES) {
    throw new Error(`Cada publica\u00e7\u00e3o aceita at\u00e9 ${MAX_PORTFOLIO_IMAGES} fotos.`);
  }

  const { retainedImageIds, newImages } = getPortfolioImageChanges(payload.images);
  formData.append("retained_image_ids", JSON.stringify(retainedImageIds));

  for (const image of newImages) {
    const imageFile = image.file ?? new File(image.uri);
    formData.append("uploaded_images", imageFile, imageFile.name);
  }
}

export async function getPortfolio(
  providerId: number | string
): Promise<PortfolioItem[]> {
  const items = await api<PortfolioItem[]>(
    `/providers/${providerId}/portfolios/`
  );

  return items.map(normalizePortfolioItem);
}

export async function createPortfolioItem(
  providerId: number | string,
  payload: SavePortfolioItemPayload
): Promise<PortfolioItem> {
  const accessToken = await getRequiredAccessToken();
  const formData = new FormData();

  appendPortfolioFormData(formData, payload);

  const item = await apiUpload<PortfolioItem>(
    `/providers/${providerId}/portfolios/`,
    formData,
    { accessToken }
  );

  return normalizePortfolioItem(item);
}

export async function updatePortfolioItem(
  providerId: number | string,
  itemId: number | string,
  payload: SavePortfolioItemPayload
): Promise<PortfolioItem> {
  const accessToken = await getRequiredAccessToken();
  const formData = new FormData();

  appendPortfolioFormData(formData, payload);

  const item = await apiUpload<PortfolioItem>(
    `/providers/${providerId}/portfolios/${itemId}/`,
    formData,
    {
      accessToken,
      method: "PATCH",
    }
  );

  return normalizePortfolioItem(item);
}

export async function deletePortfolioItem(
  providerId: number | string,
  itemId: number | string
): Promise<void> {
  const accessToken = await getRequiredAccessToken();

  await apiDelete(
    `/providers/${providerId}/portfolios/${itemId}/`,
    accessToken
  );
}
