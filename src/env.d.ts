/// <reference types="vite/client" />

type AppConfig = {
  baseUrl: string;
  model: string;
  configured: boolean;
};

interface Window {
  desktop?: {
    getConfig: () => Promise<AppConfig>;
    chat: (prompt: string) => Promise<string>;
  };
}
