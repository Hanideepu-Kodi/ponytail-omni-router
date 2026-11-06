import type { KokoroTTS } from "kokoro-js";

let engine: KokoroTTS | undefined;

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
        self.postMessage({ type: "stage", message: "Downloading model" });
        engine = await KokoroTTS.from_pretrained("onnx-community/Kokoro-82M-v1.0-ONNX", {
          dtype: "q8",
          device: "wasm",
          progress_callback: (progress) => self.postMessage({ type: "progress", progress }),
        });
        self.postMessage({ type: "stage", message: "Voice ready" });
      }
      self.postMessage({ type: "ready" });
      return;
    }

    if (!engine) throw new Error("Load the local voice before speaking.");
    const text = event.data.text?.trim();
    if (!text) throw new Error("There is no response to speak.");

    const result = await engine.generate(text, { voice: "am_michael" });
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
