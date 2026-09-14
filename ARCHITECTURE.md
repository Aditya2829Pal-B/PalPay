# Architecture Design

## 1. Tech Stack Selection
- **Frontend**: React (with Vite) + Tailwind CSS
- **Backend**: Node.js + Express
- **AI Layer**: Google Gemini API (gemini-3.5-flash, gemini-3.1-flash-tts-preview, gemini-3.1-flash-live-preview)
- **Database**: None (Stateless/Client-side session state)

**Justification**: 
We choose React + Express because it balances fast, reactive frontend development with a secure backend. The backend Express server acts as a crucial security proxy, ensuring the `GEMINI_API_KEY` is never exposed to the client browser. Tailwind CSS ensures rapid, consistent styling.

## 2. System Diagram

```mermaid
graph TD
    Client[Browser / React UI] -->|HTTP POST| API_Trivia[/api/trivia]
    Client -->|HTTP POST| API_TTS[/api/tts]
    Client <-->|WebSocket w/ PCM Audio| API_Live[/live]
    
    API_Trivia -->|REST| Gemini_Search[Gemini 3.5 Flash + Search]
    API_TTS -->|REST| Gemini_TTS[Gemini 3.1 TTS]
    API_Live <-->|gRPC/WebSocket| Gemini_Live[Gemini 3.1 Live API]
```

## 3. Modules
- **Client UI (`/src/components`)**: 
  - `SetupScreen`: Collects user preferences.
  - `ClassicGame`: Manages turn-based trivia state.
  - `LiveGame`: Manages Web Audio API streams and WebSocket lifecycle.
- **Audio Processing (`/src/lib/audioUtils.ts`)**: 
  - Handles real-time conversion between Float32 PCM (browser) and Base64 (API format).
- **Backend Core (`/server.ts`)**: 
  - Securely proxies REST requests and WebSocket streams to Google's generative models.
