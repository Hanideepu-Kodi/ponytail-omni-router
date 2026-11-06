import { FormEvent, useEffect, useRef, useState } from "react";
import {
  ArrowRight,
  DownloadSimple,
  PlugsConnected,
  SpeakerHigh,
  WarningCircle,
} from "@phosphor-icons/react";

type AgentState =
  | "idle"
  | "listening"
  | "transcribing"
  | "thinking"
  | "speaking"
  | "error"
  | "offline";

type VoiceStatus = "unloaded" | "loading" | "ready" | "error";

const stateLabels: Record<AgentState, string> = {
  idle: "Ready",
  listening: "Listening",
  transcribing: "Transcribing",
  thinking: "Routing model",
  speaking: "Speaking",
  error: "Needs attention",
  offline: "OmniRoute offline",
};

export default function App() {
  const [config, setConfig] = useState<AppConfig>();
  const [agentState, setAgentState] = useState<AgentState>("idle");
  const [voiceStatus, setVoiceStatus] = useState<VoiceStatus>("unloaded");
  const [voiceProgress, setVoiceProgress] = useState(0);
  const [voiceDetail, setVoiceDetail] = useState("");
  const [prompt, setPrompt] = useState("");
  const [response, setResponse] = useState("");
  const [error, setError] = useState("");
  const workerRef = useRef<Worker | undefined>(undefined);
  const audioContextRef = useRef<AudioContext | undefined>(undefined);

  useEffect(() => {
    const loadConfig = window.desktop?.getConfig ?? (() => Promise.resolve({
      baseUrl: "Electron IPC required",
      model: "Preview mode",
      configured: false,
    }));

    loadConfig().then((next) => {
      setConfig(next);
      setAgentState(next.configured ? "idle" : "offline");
    });

    return () => {
      workerRef.current?.terminate();
      audioContextRef.current?.close();
    };
  }, []);

  function getWorker() {
    if (workerRef.current) return workerRef.current;

    const worker = new Worker(new URL("./tts.worker.ts", import.meta.url), { type: "module" });
    worker.onmessage = async (
      event: MessageEvent<
        | { type: "ready" }
        | { type: "error"; message: string }
        | { type: "progress"; progress: { progress?: number } }
        | { type: "stage"; message: string }
        | { type: "audio"; samples: ArrayBuffer; sampleRate: number }
      >,
    ) => {
      if (event.data.type === "stage") {
        setVoiceDetail(event.data.message);
        return;
      }
      if (event.data.type === "progress") {
        if (typeof event.data.progress.progress === "number") {
          setVoiceProgress(Math.round(event.data.progress.progress));
        }
        return;
      }
      if (event.data.type === "ready") {
        setVoiceStatus("ready");
        setVoiceProgress(100);
        setVoiceDetail("");
        setError("");
        return;
      }
      if (event.data.type === "error") {
        setVoiceStatus("error");
        setError(event.data.message);
        setAgentState("error");
        return;
      }

      const context = audioContextRef.current ?? new AudioContext();
      audioContextRef.current = context;
      if (context.state === "suspended") await context.resume();

      const values = new Float32Array(event.data.samples);
      const buffer = context.createBuffer(1, values.length, event.data.sampleRate);
      buffer.copyToChannel(values, 0);
      const source = context.createBufferSource();
      source.buffer = buffer;
      source.connect(context.destination);
      source.onended = () => setAgentState(config?.configured ? "idle" : "offline");
      setAgentState("speaking");
      source.start();
    };
    workerRef.current = worker;
    return worker;
  }

  function loadVoice() {
    setVoiceStatus("loading");
    setVoiceProgress(0);
    setVoiceDetail("");
    setError("");
    getWorker().postMessage({ type: "init" });
  }

  function handleVoiceAction() {
    if (voiceStatus === "ready") {
      speak("Hello. The local voice is ready.");
      return;
    }
    loadVoice();
  }

  function speak(text: string) {
    if (voiceStatus !== "ready") return;
    getWorker().postMessage({ type: "synthesize", text });
  }

  async function askAgent(event: FormEvent) {
    event.preventDefault();
    const message = prompt.trim();
    if (!message || !window.desktop) return;

    setError("");
    setResponse("");
    setAgentState("thinking");
    try {
      const answer = await window.desktop.chat(message);
      setResponse(answer);
      speak(answer);
      if (voiceStatus !== "ready") setAgentState("idle");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "The agent request failed.");
      setAgentState("error");
    }
  }

  const connected = Boolean(config?.configured);

  return (
    <div className="app-shell">
      <header className="top-bar">
        <div>
          <p className="eyebrow">AI test agent</p>
          <h1>Ponytail</h1>
        </div>
        <div className="top-actions">
          <div className={`connection ${connected ? "connected" : "disconnected"}`}>
            {connected ? <PlugsConnected size={18} /> : <WarningCircle size={18} />}
            <span>{connected ? config?.model : "API key required"}</span>
          </div>
        </div>
      </header>

      <main className="workspace">
        <section className={`agent-stage state-${agentState}`} aria-labelledby="agent-state">
          <div className="stage-heading">
            <p className="eyebrow light">Human animated model</p>
            <div className="state-label" id="agent-state" aria-live="polite">
              <span className="state-dot" />
              {stateLabels[agentState]}
            </div>
          </div>

          <div className="character-frame" aria-hidden="true">
            <img src="/character/canonical-master.png" alt="" className="character" />
          </div>

          <div className="voice-panel">
            <button
              className="primary-button"
              type="button"
              onClick={handleVoiceAction}
              disabled={voiceStatus === "loading" || agentState === "speaking"}
            >
              {voiceStatus === "ready" ? <SpeakerHigh size={24} weight="bold" /> : <DownloadSimple size={24} weight="bold" />}
              {voiceStatus === "unloaded" && "Load local voice (~90 MB)"}
              {voiceStatus === "loading" && (voiceProgress
                ? `Loading local voice (${voiceProgress}%)`
                : voiceDetail || "Loading local voice")}
              {voiceStatus === "ready" && "Test local voice"}
              {voiceStatus === "error" && "Retry local voice"}
            </button>
            <p>Kokoro runs on this device. No TTS account or billing.</p>
          </div>
        </section>

        <section className="conversation" aria-labelledby="conversation-title">
          <div className="conversation-heading">
            <p className="eyebrow">Current session</p>
            <h2 id="conversation-title">Test the agent</h2>
            <p>Send a text prompt through OmniRoute. When the local voice is ready, the response is spoken automatically.</p>
          </div>

          <form className="prompt-form" onSubmit={askAgent}>
            <label htmlFor="prompt">Message</label>
            <div className="prompt-row">
              <textarea
                id="prompt"
                value={prompt}
                onChange={(event) => setPrompt(event.target.value)}
                placeholder="Ask the agent to explain or test something…"
                rows={3}
              />
              <button className="send-button" type="submit" disabled={!prompt.trim() || agentState === "thinking"}>
                <ArrowRight size={22} weight="bold" />
                <span>Ask agent</span>
              </button>
            </div>
          </form>

          {error && (
            <div className="error-message" role="alert">
              <WarningCircle size={20} />
              <span>{error}</span>
            </div>
          )}

          <article className="response" aria-live="polite" aria-busy={agentState === "thinking"}>
            <div className="response-title">
              <h3>Response</h3>
              {response && voiceStatus === "ready" && agentState !== "speaking" && (
                <button className="text-button" type="button" onClick={() => speak(response)}>
                  <SpeakerHigh size={18} />
                  Speak response
                </button>
              )}
            </div>
            {agentState === "thinking" && <p className="muted">Routing your request through OmniRoute…</p>}
            {!response && agentState !== "thinking" && <p className="muted">The agent response will appear here.</p>}
            {response && <p className="response-copy">{response}</p>}
          </article>

          <footer className="session-meta">
            <span>{config?.baseUrl ?? "Loading endpoint…"}</span>
            <span>{config?.model ?? "Loading model…"}</span>
          </footer>
        </section>
      </main>
    </div>
  );
}
