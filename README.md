# ponytail-omni-router
An AI Test Agent desktop application powered by OmniRouter.

## Local OmniRoute

Development uses the local OmniRoute endpoint at `http://127.0.0.1:20128/v1`.
The validated default model is `ddgw/gpt-5.4-mini`, served anonymously through
DuckDuckGo AI Chat. It requires no provider account, payment method, credits, or
billing setup.

Copy `.env.example` to an ignored `.env.local` file when overriding the local
endpoint or model. A key is optional for a loopback-only OmniRoute server. Any
remote endpoint requires `OMNIROUTE_API_KEY`; never commit that key.

## Character sprite

The approved character source, expression references, and consistency contract
live in [`assets/character`](assets/character/SPRITE.md). Runtime animation must
reuse the locked canonical body rather than generating or swapping independent
full-character images for each state.

## Run the app

Start OmniRoute on loopback so the unauthenticated local endpoint is not exposed
to the network:

```sh
OMNIROUTE_SERVER_HOST=127.0.0.1 omniroute serve --daemon --no-open
```

Then install and start the Electron app:

```sh
npm install
npm run dev
```

Select **Load local voice** once to download and cache the free quantized Kokoro
model. The app uses the `am_michael` voice and performs synthesis locally.
