import { useState, useCallback, useRef, useEffect } from 'react';

declare global {
  interface Window {
    SpeechRecognition?: typeof SpeechRecognition;
    webkitSpeechRecognition?: typeof SpeechRecognition;
  }
}

const SpeechRecognitionAPI =
  typeof window !== 'undefined'
    ? window.SpeechRecognition || window.webkitSpeechRecognition
    : undefined;

export function useSpeechRecognition(options?: { language?: string }) {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [error, setError] = useState<string | null>(null);
  const recognitionRef = useRef<InstanceType<NonNullable<typeof SpeechRecognitionAPI>> | null>(null);

  const supported = !!SpeechRecognitionAPI;
  const language = options?.language ?? 'it-IT';

  const stopListening = useCallback(() => {
    const rec = recognitionRef.current;
    if (rec) {
      rec.stop();
      recognitionRef.current = null;
    }
    setIsListening(false);
  }, []);

  const startListening = useCallback(
    (onResult?: (text: string) => void) => {
      if (!SpeechRecognitionAPI) {
        setError('Il riconoscimento vocale non è supportato in questo browser');
        return;
      }
      setError(null);
      setTranscript('');

      const recognition = new SpeechRecognitionAPI();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = language;
      recognitionRef.current = recognition;

      recognition.onstart = () => setIsListening(true);
      recognition.onend = () => {
        setIsListening(false);
        recognitionRef.current = null;
      };
      recognition.onerror = (e: { error: string }) => {
        if (e.error === 'not-allowed') {
          setError('Microfono non autorizzato');
        } else {
          setError('Errore riconoscimento vocale');
        }
        setIsListening(false);
        recognitionRef.current = null;
      };
      recognition.onresult = (event: SpeechRecognitionEvent) => {
        const last = event.results.length - 1;
        const text = event.results[last][0].transcript.trim();
        setTranscript(text);
        onResult?.(text);
      };

      try {
        recognition.start();
      } catch (err) {
        setError('Impossibile avviare il microfono');
      }
    },
    [language]
  );

  useEffect(() => {
    return () => {
      const rec = recognitionRef.current;
      if (rec) rec.abort();
    };
  }, []);

  return { isListening, transcript, startListening, stopListening, supported, error };
}
