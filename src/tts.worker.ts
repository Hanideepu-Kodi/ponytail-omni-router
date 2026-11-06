import type { KokoroTTS } from "kokoro-js";

const modelRevision = "1939ad2a8e416c0acfeecc08a694d14ef25f2231";
const voice = "am_michael";
const voiceBaseUrl = "https://huggingface.co/onnx-community/Kokoro-82M-v1.0-ONNX/resolve";
const mutableVoiceUrl = `${voiceBaseUrl}/main/voices/${voice}.bin`;
const pinnedVoiceUrl = `${voiceBaseUrl}/${modelRevision}/voices/${voice}.bin`;

let engine: KokoroTTS | undefined;

async function cachePinnedVoice() {
  const cache = await caches.open("kokoro-voices");
  let response = await cache.match(pinnedVoiceUrl);
  if (!response) {
    response = await fetch(pinnedVoiceUrl);
    if (!response.ok) throw new Error(`Voice download failed: HTTP ${response.status}`);
    await cache.put(pinnedVoiceUrl, response.clone());
  }
  await cache.put(mutableVoiceUrl, response);
}

self.onmessage = async (event: MessageEvent<{ type: "init" | "synthesize"; text?: string }>) => {
  try {
    if (event.data.type === "init") {
      if (!engine) {
        self.postMessage({ type: "stage", message: "Starting runtime" });
        const [{ KokoroTTS }, { env }] = await Promise.all([
          import("kokoro-js"),
          import("@huggingface/transformers"),
        ]);
        if (env.backends.onnx.wasm) env.backends.onnx.wasm.numThreads = 1;
        env.remotePathTemplate = `{model}/resolve/${modelRevision}/`;
        self.postMessage({ type: "stage", message: "Downloading model" });
        const [loadedEngine] = await Promise.all([
          KokoroTTS.from_pretrained("onnx-community/Kokoro-82M-v1.0-ONNX", {
            dtype: "q8",
            device: "wasm",
            progress_callback: (progress) => self.postMessage({ type: "progress", progress }),
          }),
          cachePinnedVoice(),
        ]);
        engine = loadedEngine;
        self.postMessage({ type: "stage", message: "Voice ready" });
      }
      self.postMessage({ type: "ready" });
      return;
    }

    if (!engine) throw new Error("Load the local voice before speaking.");
    const text = event.data.text?.trim();
    if (!text) throw new Error("There is no response to speak.");

    const result = await engine.generate(text, { voice });
    const samples = result.audio.slice();
    self.postMessage(
      { type: "audio", samples: samples.buffer, sampleRate: result.sampling_rate },
      { transfer: [samples.buffer] },
    );
  } catch (error) {
    self.postMessage({
      type: "error",
      message: error instanceof Error ? error.message : "Local voice failed.",
    });
  }
};
