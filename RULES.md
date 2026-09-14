# Project Rules & Standards

## 1. Coding Guidelines
- **Framework**: Use React functional components and hooks (`useState`, `useEffect`, `useRef`).
- **Styling**: Exclusively use Tailwind CSS utility classes. Do not create custom `.css` files beyond the initial Tailwind setup.
- **TypeScript**: Use strict typing. Define interfaces for props and API responses in `/src/types.ts`.
- **File Structure**: Keep components modular in `/src/components/`, utility functions in `/src/lib/`, and backend logic in `/server.ts`.

## 2. Security Rules
- **API Keys**: The `GEMINI_API_KEY` MUST remain strictly on the server-side (`server.ts`).
- **Client Constraints**: Do NOT prefix sensitive keys with `VITE_`.
- **Permissions**: Request microphone access explicitly only when entering Live Mode, and release tracks properly on component unmount.

## 3. AI Usage Rules
- **Prompt Engineering**: Always pass explicit system instructions (e.g., personality, rules) to prevent the AI from breaking character.
- **Structured Output**: For deterministic data (like Trivia Questions), strictly enforce `responseSchema` and `application/json`.
- **Grounding**: Always attach the `googleSearch` tool for factual generation to prevent hallucinations.
- **Fallback Logic**: If the Live WebSocket disconnects or TTS fails to generate, gracefully catch the error, inform the user via standard UI text, and offer a retry button.
