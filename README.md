# ponytail-omni-router
An AI Test Agent desktop application powered by OmniRouter.

## Local OmniRoute

Development uses the local OmniRoute endpoint at `http://127.0.0.1:20128/v1`.
The validated default model is `ddgw/gpt-5.4-mini`, served anonymously through
DuckDuckGo AI Chat. It requires no provider account, payment method, credits, or
billing setup.

Copy `.env.example` to an ignored local environment file and add the project key
from OmniRoute's API Keys dashboard. Never commit that key.

## Character sprite

The approved character source, expression references, and consistency contract
live in [`assets/character`](assets/character/SPRITE.md). Runtime animation must
reuse the locked canonical body rather than generating or swapping independent
full-character images for each state.
