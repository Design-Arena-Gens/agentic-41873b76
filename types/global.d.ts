import type {
  BrowserSpeechRecognition,
  SpeechRecognitionConstructor
} from "./speech";

declare global {
  type SpeechRecognition = BrowserSpeechRecognition;

  interface Window {
    SpeechRecognition?: SpeechRecognitionConstructor;
    webkitSpeechRecognition?: SpeechRecognitionConstructor;
  }
}
