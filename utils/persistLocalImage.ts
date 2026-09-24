import { File, Paths } from "expo-file-system";

export function persistLocalImage(uri: string, prefix: string) {
  const source = new File(uri);
  const extension = source.extension || ".jpg";
  const destination = new File(
    Paths.cache,
    `${prefix}-${Date.now()}${extension}`
  );

  source.copy(destination);

  return destination.uri;
}
