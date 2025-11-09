"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import clsx from "clsx";
import { AgentResponse } from "@/lib/types";
import { useAgentStore } from "@/lib/state/agentStore";
import { formatRelativeTime } from "@/lib/utils";
import type { SpeechRecognitionEvent } from "@/types/speech";

interface VoiceAgentConsoleProps {
  onTasksGenerated?: (tasks: AgentResponse["payload"]) => void;
}

function getSpeechRecognition(): SpeechRecognition | null {
  if (typeof window === "undefined") return null;
  const SpeechRecognitionConstructor =
    window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SpeechRecognitionConstructor) return null;
  const recognition = new SpeechRecognitionConstructor();
  recognition.lang = "en-IN";
  recognition.continuous = false;
  recognition.interimResults = false;
  recognition.maxAlternatives = 1;
  return recognition;
}

function speak(text: string) {
  if (typeof window === "undefined") return;
  const synth = window.speechSynthesis;
  if (!synth) return;
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.rate = 1;
  utterance.pitch = 1;
  utterance.lang = "en-IN";
  synth.cancel();
  synth.speak(utterance);
}

export default function VoiceAgentConsole({
  onTasksGenerated
}: VoiceAgentConsoleProps) {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [statusMessage, setStatusMessage] = useState(
    "Say “Jarvis, create Amazon listings for today's products.”"
  );
  const [isLoading, setIsLoading] = useState(false);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const controllerRef = useRef<AbortController | null>(null);
  const { logs, addLog, addTask, setLastResponse, updateTaskStatus } =
    useAgentStore();

  const speechSupported = useMemo(
    () => typeof window !== "undefined" && Boolean(getSpeechRecognition()),
    []
  );

  useEffect(() => {
    recognitionRef.current = getSpeechRecognition();
    return () => {
      recognitionRef.current?.abort();
      controllerRef.current?.abort();
    };
  }, []);

  const handleCommand = async (command: string) => {
    const trimmed = command.trim();
    if (!trimmed) return;

    addLog({ speaker: "user", content: trimmed });
    setTranscript("");
    setIsLoading(true);
    setStatusMessage("Processing your command...");

    controllerRef.current?.abort();
    const controller = new AbortController();
    controllerRef.current = controller;

    try {
      const response = await fetch("/api/agent", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ prompt: trimmed }),
        signal: controller.signal
      });

      const payload = (await response.json()) as AgentResponse;
      setLastResponse(payload);
      addLog({ speaker: "agent", content: payload.message, meta: payload });
      speak(payload.message);
      setStatusMessage(payload.message);

      if (payload.payload?.tasks && Array.isArray(payload.payload.tasks)) {
        payload.payload.tasks.forEach((task: any) => {
          const created = addTask({
            title: task.title,
            marketplace: task.marketplace ?? "generic",
            status: task.status ?? "pending",
            priority: task.priority ?? "medium",
            dueDate: task.dueDate,
            notes: task.notes
          });
          if (task.status && task.status !== "pending") {
            updateTaskStatus(created.id, task.status);
          }
        });
        onTasksGenerated?.(payload.payload);
      }
    } catch (error) {
      console.error(error);
      const fallback =
        error instanceof Error ? error.message : "Unable to process command.";
      setStatusMessage(fallback);
      addLog({ speaker: "agent", content: fallback });
      speak(fallback);
    } finally {
      setIsLoading(false);
    }
  };

  const startListening = () => {
    const recognition = recognitionRef.current;
    if (!recognition) {
      setStatusMessage("Speech recognition not supported in this browser.");
      return;
    }
    setIsListening(true);
    recognition.start();
    recognition.onresult = (event: SpeechRecognitionEvent) => {
      const result = event.results[0]?.[0];
      if (result?.transcript) {
        handleCommand(result.transcript);
      }
    };
    recognition.onerror = (event) => {
      console.error(event);
      setStatusMessage("I couldn't capture that. Try again.");
      setIsListening(false);
    };
    recognition.onend = () => {
      setIsListening(false);
    };
  };

  const stopListening = () => {
    recognitionRef.current?.stop();
    setIsListening(false);
  };

  return (
    <section className="glass-panel rounded-3xl p-6 lg:p-8">
      <header className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-primary-100">
            Jarvis Commerce Command Center
          </h2>
          <p className="text-sm text-slate-300">{statusMessage}</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            className={clsx(
              "button-primary",
              isListening && "bg-red-500 hover:bg-red-400"
            )}
            onClick={isListening ? stopListening : startListening}
            type="button"
            disabled={isLoading}
          >
            {isListening ? "Stop Listening" : "Start Voice"}
          </button>
          <button
            className="button-secondary"
            type="button"
            onClick={() => handleCommand(transcript)}
            disabled={!transcript || isLoading}
          >
            Run Text Command
          </button>
        </div>
      </header>

      <div className="mt-6 grid gap-6 lg:grid-cols-[2fr,1fr]">
        <div className="space-y-4">
          <label className="block text-sm font-medium text-slate-200">
            Quick Type Command
          </label>
          <textarea
            className="h-32 w-full rounded-xl border border-slate-700 bg-slate-900/60 px-4 py-3 text-sm text-slate-100 shadow-inner focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-400"
            placeholder="Example: Prepare catalog listings for five new t-shirts on Amazon and update Flipkart stock levels."
            value={transcript}
            onChange={(event) => setTranscript(event.target.value)}
          />
          <p className="text-xs text-slate-400">
            Hints: Ask Jarvis to create marketplace tasks, prepare catalog
            sheets, or summarise performance.
          </p>
        </div>

        <aside className="rounded-2xl border border-slate-700/60 bg-slate-900/40 p-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-slate-200">
              Voice Link
            </span>
            <span
              className={clsx(
                "h-3 w-3 rounded-full",
                speechSupported ? "bg-emerald-400" : "bg-amber-500"
              )}
            />
          </div>
          <p className="mt-2 text-xs text-slate-400">
            {speechSupported
              ? "Voice recognition ready. Tap start to speak."
              : "Browser does not support speech. Use text commands instead."}
          </p>
          <div className="mt-4 space-y-2">
            <p className="text-xs text-slate-300">
              Recent:
            </p>
            <ul className="space-y-2">
              {logs
                .slice(-4)
                .reverse()
                .map((log) => (
                  <li
                    key={log.id}
                    className="rounded-lg border border-slate-700/60 bg-slate-900/40 p-2 text-xs text-slate-200"
                  >
                    <div className="flex justify-between">
                      <span className="font-semibold uppercase tracking-wide text-primary-200">
                        {log.speaker}
                      </span>
                      <span className="text-[10px] text-slate-500">
                        {formatRelativeTime(log.timestamp)}
                      </span>
                    </div>
                    <p className="mt-1 line-clamp-3 text-slate-300">
                      {log.content}
                    </p>
                  </li>
                ))}
            </ul>
          </div>
        </aside>
      </div>
    </section>
  );
}
