import { BASE_URL } from "./api";

type AudioSearchResponse = {
  text?: string;
  error?: string;
};

function getFileName(audioUri: string) {
  const uriFileName = audioUri.split("/").pop()?.split("?")[0];

  if (uriFileName?.includes(".")) {
    return uriFileName;
  }

  return "voice-search.m4a";
}

function getAudioMimeType(fileName: string) {
  const extension = fileName.split(".").pop()?.toLowerCase();

  switch (extension) {
    case "3gp":
      return "audio/3gpp";
    case "webm":
      return "audio/webm";
    case "wav":
      return "audio/wav";
    case "mp3":
      return "audio/mpeg";
    case "m4a":
    default:
      return "audio/m4a";
  }
}

async function parseAudioSearchResponse(response: Response) {
  const responseText = await response.text();

  if (!responseText) {
    return null;
  }

  try {
    return JSON.parse(responseText) as AudioSearchResponse;
  } catch {
    return null;
  }
}

export async function transcribeVoiceSearch(audioUri: string) {
  const fileName = getFileName(audioUri);
  const formData = new FormData();

  formData.append("audio", {
    uri: audioUri,
    name: fileName,
    type: getAudioMimeType(fileName),
  } as any);

  const response = await fetch(`${BASE_URL}/search/audio/`, {
    method: "POST",
    headers: {
      Accept: "application/json",
    },
    body: formData,
  });
  const data = await parseAudioSearchResponse(response);

  if (!response.ok) {
    throw new Error(data?.error || "Nao foi possivel transcrever o audio.");
  }

  const text = data?.text?.trim();

  if (!text) {
    throw new Error("Nao foi possivel entender o audio.");
  }

  return text;
}
