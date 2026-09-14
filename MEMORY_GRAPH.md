# Application Memory Graph

This document maps the state transitions, user preferences, and data flow of the AI Trivia Master application.

## 1. Global State
- **Mode**: `setup` | `classic` | `live`
- **Settings**: 
  - `personality` (String)
  - `voice` (String)
  - `category` (String)

## 2. Component State Memory
### SetupScreen
- Remembers user dropdown selections before committing to `GameSettings`.

### ClassicGame
- `question` (TriviaQuestion Object): Stores the current question, options, correct index, and fun fact.
- `selectedAnswer` (Number | Null): Tracks user's chosen option.
- `loading` (Boolean): Tracks API request status.
- `isPlayingAudio` (Boolean): Tracks TTS playback to prevent overlapping audio.

### LiveGame
- `isConnected` (Boolean): Tracks WebSocket readiness.
- `isMicMuted` (Boolean): Tracks user's local hardware state.
- **Audio Buffers**: Maintains a rolling queue of PCM audio chunks in the `AudioContext` timeline to ensure smooth playback.

## 3. Transition Graph
```text
[ APP LAUNCH ]
      |
      v
( SetupScreen ) <--------------------------------+
      |                                          |
      +---> User chooses Classic Mode            |
      |          |                               |
      |          v                               |
      |    ( ClassicGame )                       |
      |          |--> Fetches /api/trivia        |
      |          |--> Updates UI State           |
      |          |--> Fetches /api/tts           |
      |          +--> User clicks "Exit" --------+
      |
      +---> User chooses Live Mode               |
                 |                               |
                 v                               |
           ( LiveGame )                          |
                 |--> Prompts Mic Access         |
                 |--> Connects WebSocket         |
                 |--> Streams PCM Audio In/Out   |
                 +--> User clicks "Exit" --------+
```
