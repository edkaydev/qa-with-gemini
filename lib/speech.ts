"use client";

import { useCallback, useEffect, useRef, useState } from "react";

type RecognitionAlternative = { transcript: string };
type RecognitionResult = { isFinal: boolean; 0: RecognitionAlternative };
type RecognitionResultList = {
  length: number;
  [index: number]: RecognitionResult;
};
type RecognitionEvent = {
  resultIndex: number;
  results: RecognitionResultList;
};
type RecognitionErrorEvent = { error: string };
type SpeechRecognitionLike = {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  maxAlternatives: number;
  onresult: ((event: RecognitionEvent) => void) | null;
  onerror: ((event: RecognitionErrorEvent) => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
  abort: () => void;
};
type RecognitionConstructor = new () => SpeechRecognitionLike;
type SpeechWindow = Window & {
  SpeechRecognition?: RecognitionConstructor;
  webkitSpeechRecognition?: RecognitionConstructor;
};

function recognitionConstructor(): RecognitionConstructor | null {
  if (typeof window === "undefined") return null;
  const scope = window as SpeechWindow;
  return scope.SpeechRecognition ?? scope.webkitSpeechRecognition ?? null;
}

export function useVoiceInput() {
  const [supported, setSupported] = useState(false);
  const [listening, setListening] = useState(false);
  const [finalText, setFinalText] = useState("");
  const [interimText, setInterimText] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [permissionBlocked, setPermissionBlocked] = useState(false);
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);
  const finalRef = useRef("");

  useEffect(() => {
    setSupported(Boolean(recognitionConstructor()));
    return () => {
      recognitionRef.current?.abort();
      recognitionRef.current = null;
    };
  }, []);

  const reset = useCallback(() => {
    finalRef.current = "";
    setFinalText("");
    setInterimText("");
    setError(null);
    setPermissionBlocked(false);
  }, []);

  const stop = useCallback(() => {
    recognitionRef.current?.stop();
    setListening(false);
  }, []);

  const start = useCallback(async () => {
    const Constructor = recognitionConstructor();
    if (!Constructor) {
      setError("Voice answers are not supported in this browser. Please type instead.");
      return;
    }

    recognitionRef.current?.abort();
    reset();

    if (typeof navigator !== "undefined" && navigator.mediaDevices?.getUserMedia) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        stream.getTracks().forEach((track) => track.stop());
      } catch {
        setPermissionBlocked(true);
        setListening(false);
        return;
      }
    }

    const recognition = new Constructor();
    recognition.lang = "en-UG";
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.maxAlternatives = 1;

    recognition.onresult = (event) => {
      let interim = "";
      for (let index = event.resultIndex; index < event.results.length; index += 1) {
        const result = event.results[index];
        const transcript = result?.[0]?.transcript ?? "";
        if (result?.isFinal) {
          finalRef.current += `${transcript} `;
        } else {
          interim += transcript;
        }
      }
      setFinalText(finalRef.current.trim());
      setInterimText(interim.trim());
    };

    recognition.onerror = (event) => {
      if (event.error === "no-speech") return;
      if (event.error === "not-allowed" || event.error === "service-not-allowed") {
        setPermissionBlocked(true);
      } else {
        setError("Voice answers had a problem. You can keep typing instead.");
      }
      setListening(false);
    };

    recognition.onend = () => setListening(false);
    recognitionRef.current = recognition;

    try {
      recognition.start();
      setListening(true);
    } catch {
      setError("The microphone could not start. Please type instead.");
      setListening(false);
    }
  }, [reset]);

  return {
    supported,
    listening,
    finalText,
    interimText,
    error,
    permissionBlocked,
    start,
    stop,
    reset,
  };
}
