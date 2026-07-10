import { useCallback, useState } from "react";
import {
  RecordingPresets,
  requestRecordingPermissionsAsync,
  setAudioModeAsync,
  useAudioRecorder,
  useAudioRecorderState,
} from "expo-audio";

import { transcribeVoiceSearch } from "@/services/voice-search.service";

type UseVoiceSearchOptions = {
  onError?: (message: string) => void;
  onTranscript: (text: string) => void;
};

export function useVoiceSearch({ onError, onTranscript }: UseVoiceSearchOptions) {
  const recorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY);
  const recorderState = useAudioRecorderState(recorder, 250);
  const [isTranscribing, setIsTranscribing] = useState(false);

  const handleError = useCallback(
    (error: unknown) => {
      const message =
        error instanceof Error
          ? error.message
          : "Nao foi possivel concluir a busca por voz.";

      onError?.(message);
    },
    [onError]
  );

  const startRecording = useCallback(async () => {
    try {
      const permission = await requestRecordingPermissionsAsync();

      if (!permission.granted) {
        onError?.("Permita o acesso ao microfone para usar a busca por voz.");
        return;
      }

      await setAudioModeAsync({
        allowsRecording: true,
        interruptionMode: "doNotMix",
        playsInSilentMode: true,
        shouldPlayInBackground: false,
        shouldRouteThroughEarpiece: false,
      });
      await recorder.prepareToRecordAsync();
      recorder.record();
    } catch (error) {
      handleError(error);
    }
  }, [handleError, onError, recorder]);

  const stopRecording = useCallback(async () => {
    try {
      await recorder.stop();

      const audioUri = recorder.uri || recorder.getStatus().url;

      if (!audioUri) {
        throw new Error("Nao foi possivel localizar o audio gravado.");
      }

      setIsTranscribing(true);

      const transcript = await transcribeVoiceSearch(audioUri);

      onTranscript(transcript);
    } catch (error) {
      handleError(error);
    } finally {
      setIsTranscribing(false);
      try {
        await setAudioModeAsync({
          allowsRecording: false,
          playsInSilentMode: true,
        });
      } catch (error) {
        console.log("Erro ao restaurar modo de audio:", error);
      }
    }
  }, [handleError, onTranscript, recorder]);

  const handleVoiceSearch = useCallback(async () => {
    if (isTranscribing) {
      return;
    }

    if (recorderState.isRecording) {
      await stopRecording();
      return;
    }

    await startRecording();
  }, [isTranscribing, recorderState.isRecording, startRecording, stopRecording]);

  return {
    durationMillis: recorderState.durationMillis,
    handleVoiceSearch,
    isRecording: recorderState.isRecording,
    isTranscribing,
  };
}
