export interface SpeechRecognitionAlternative {
  transcript: string;
  confidence: number;
}

export interface SpeechRecognitionResult {
  length: number;
  isFinal: boolean;
  item(index: number): SpeechRecognitionAlternative;
  [index: number]: SpeechRecognitionAlternative;
}

export interface SpeechRecognitionResultList {
  length: number;
  item(index: number): SpeechRecognitionResult;
  [index: number]: SpeechRecognitionResult;
}

export interface SpeechRecognitionEvent extends Event {
  readonly results: SpeechRecognitionResultList;
}

export interface SpeechRecognitionErrorEvent extends Event {
  error: string;
  message: string;
}

export interface BrowserSpeechRecognition extends EventTarget {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  maxAlternatives: number;
  start(): void;
  stop(): void;
  abort(): void;
  onaudioend?: () => void;
  onaudiostart?: () => void;
  onend?: () => void;
  onerror?: (event: SpeechRecognitionErrorEvent) => void;
  onresult?: (event: SpeechRecognitionEvent) => void;
  onsoundend?: () => void;
  onsoundstart?: () => void;
  onspeechend?: () => void;
  onspeechstart?: () => void;
}

export type SpeechRecognitionConstructor = new () => BrowserSpeechRecognition;
