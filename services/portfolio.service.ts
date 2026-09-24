import { getRequiredAccessToken } from "@/utils/authStorage";
import { File } from "expo-file-system";

import { api, apiDelete, apiUpload } from "./api";
import { normalizeRemoteImageUrl } from "./mediaUrl";

export type PortfolioItem = {
  id: number;
  provider: number;
  title: string;
  description: string;
  image: string | null;
  created_at: string;
};

export type SavePortfolioItemPayload = {
  title: string;
  description: string;
  imageUri?: string | null;
};

function normalizePortfolioItem(item: PortfolioItem): PortfolioItem {
  return {
    ...item,
    image: normalizeRemoteImageUrl(item.image),
  };
}

function appendPortfolioFormData(
  formData: FormData,
  payload: SavePortfolioItemPayload
) {
  formData.append("title", payload.title.trim());
  formData.append("description", payload.description.trim());

  if (payload.imageUri) {
    const imageFile = new File(payload.imageUri);

    formData.append("image", imageFile, imageFile.name);
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
