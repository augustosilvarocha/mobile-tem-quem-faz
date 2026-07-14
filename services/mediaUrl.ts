import { BASE_URL } from "./api";

const LOCAL_STORAGE_HOSTS = new Set(["localhost", "127.0.0.1", "0.0.0.0", "minio"]);
const SIGNED_URL_PARAMS = [
  "AWSAccessKeyId",
  "Signature",
  "Expires",
  "X-Amz-Algorithm",
  "X-Amz-Credential",
  "X-Amz-Date",
  "X-Amz-Expires",
  "X-Amz-Signature",
  "X-Amz-SignedHeaders",
];

function getApiUrl() {
  return new URL(BASE_URL);
}

function getApiOrigin() {
  return BASE_URL.replace(/\/api\/?$/, "");
}

function hasSignedUrlParams(url: URL) {
  return SIGNED_URL_PARAMS.some((param) => url.searchParams.has(param));
}

export function normalizeRemoteImageUrl(image: string | null | undefined) {
  if (!image) {
    return null;
  }

  if (image.startsWith("/")) {
    return `${getApiOrigin()}${image}`;
  }

  try {
    const imageUrl = new URL(image);
    const apiUrl = getApiUrl();
    const isLocalStorageHost = LOCAL_STORAGE_HOSTS.has(imageUrl.hostname);

    if (isLocalStorageHost) {
      imageUrl.hostname = apiUrl.hostname;

      if (hasSignedUrlParams(imageUrl)) {
        imageUrl.search = "";
      }
    }

    return imageUrl.toString();
  } catch {
    return image;
  }
}
