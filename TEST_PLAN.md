# Test Planning

## 1. Unit Tests
- **Target**: `/src/lib/audioUtils.ts`
- **Cases**:
  - `pcmToBase64`: Ensure a known Float32Array converts exactly to the expected Base64 PCM16 string.
  - `base64ToPcm`: Ensure valid Base64 decodes back to normalized Float32 values (-1.0 to 1.0).

## 2. Integration Tests
- **Target**: Express API Routes (`/server.ts`)
- **Cases**:
  - `POST /api/trivia`: Verify it returns a 200 OK with valid JSON matching the `TriviaQuestion` interface.
  - `POST /api/tts`: Verify it returns a 200 OK with a valid Base64 string payload.
  - `WS /live`: Verify the WebSocket accepts a connection, correctly parses incoming `audio` frames, and relays `LiveServerMessage` objects back.

## 3. End-to-End (E2E) Tests
- **Target**: User Flows
- **Cases**:
  1. **Classic Flow**: User selects "Pirate", "General Knowledge" -> Clicks "Play Classic" -> UI loads -> Question renders -> Selects Answer -> Correct answer revealed -> Fun fact plays audio.
  2. **Live Flow**: User selects "Sarcastic", "History" -> Clicks "Live" -> Browser prompts for Mic -> Connection establishes -> User speaks -> App plays audio response.
  3. **Edge Cases**: Network disconnect during live call, API rate limit exceeded during trivia generation.
