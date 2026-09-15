import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { WebSocketServer } from 'ws';
import { GoogleGenAI, LiveServerMessage, Modality } from '@google/genai';
import * as http from 'http';
import dotenv from 'dotenv';

dotenv.config();

const PORT = 3000;
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    }
  }
});

async function startServer() {
  const app = express();
  app.use(express.json());

  // GET /api/trivia -> Fetch a trivia question using gemini-3.5-flash with Google Search
  app.post('/api/trivia', async (req, res) => {
    try {
      const { personality, category } = req.body;
      const sysInstruction = `You are a trivia host with the following personality: ${personality}.
Your job is to generate a single interesting trivia question about the category: ${category}.
Provide the question, four multiple-choice options (A, B, C, D), and clearly indicate the correct answer.
Also, include a fun fact about the correct answer. You MUST use Google Search if necessary to ensure the fact and question are accurate and up to date.
Return the result in JSON format matching the following schema.`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.5-flash',
        contents: "Generate a trivia question.",
        config: {
          tools: [{ googleSearch: {} }],
          systemInstruction: sysInstruction,
          responseMimeType: 'application/json',
          responseSchema: {
            type: "OBJECT",
            properties: {
              hostMessage: { type: "STRING", description: "The host's introduction to the question, in character." },
              question: { type: "STRING" },
              options: {
                type: "ARRAY",
                items: { type: "STRING" },
                description: "The 4 options. Just the text, without A,B,C,D prefix."
              },
              correctAnswerIndex: { type: "INTEGER", description: "The index (0-3) of the correct option." },
              funFact: { type: "STRING", description: "A fun fact related to the answer, told in character." }
            },
            required: ["hostMessage", "question", "options", "correctAnswerIndex", "funFact"]
          }
        }
      });
      
      const text = response.text || "{}";
      const data = JSON.parse(text);
      res.json(data);
    } catch (error: any) {
      console.error("Error generating trivia:", error);
      const status = error.status === 'RESOURCE_EXHAUSTED' || error.status === 429 ? 429 : 500;
      const message = error.message || "An error occurred while generating the question.";
      res.status(status).json({ error: message });
    }
  });

  // POST /api/tts -> Generate speech for text
  app.post('/api/tts', async (req, res) => {
    try {
      const { text, voice = "Kore" } = req.body;
      
      const response = await ai.models.generateContent({
        model: 'gemini-3.1-flash-tts-preview',
        contents: [{ parts: [{ text }] }],
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: { voiceName: voice },
            },
          },
        },
      });

      const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
      if (base64Audio) {
        res.json({ audio: base64Audio });
      } else {
        res.status(500).json({ error: "Failed to generate audio" });
      }
    } catch (error: any) {
      console.error("Error generating TTS:", error);
      const status = error.status === 'RESOURCE_EXHAUSTED' || error.status === 429 ? 429 : 500;
      const message = error.message || "An error occurred while generating TTS.";
      res.status(status).json({ error: message });
    }
  });

  // HTTP server
  const server = http.createServer(app);

  // WebSocket Server for Live API
  const wss = new WebSocketServer({ server, path: '/live' });

  wss.on("connection", async (clientWs, req) => {
    try {
      const url = new URL(req.url || '', `http://${req.headers.host}`);
      const personality = url.searchParams.get('personality') || 'Friendly and helpful';
      const voice = url.searchParams.get('voice') || 'Zephyr';

      const session = await ai.live.connect({
        model: "gemini-3.1-flash-live-preview",
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: { prebuiltVoiceConfig: { voiceName: voice } },
          },
          systemInstruction: `You are a live trivia game host. Your personality is: ${personality}. You are currently in a live audio call with a contestant. Ask them trivia questions, react to their answers in character, and keep the game fun and engaging! Start by welcoming the user to the game in character.`,
        },
        callbacks: {
          onmessage: (message: LiveServerMessage) => {
            const audio = message.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data;
            if (audio) {
              clientWs.send(JSON.stringify({ audio }));
            }
            if (message.serverContent?.interrupted) {
              clientWs.send(JSON.stringify({ interrupted: true }));
            }
          },
        },
      });

      clientWs.on("message", (data) => {
        try {
          const parsed = JSON.parse(data.toString());
          if (parsed.audio) {
            session.sendRealtimeInput({
              audio: { data: parsed.audio, mimeType: "audio/pcm;rate=16000" },
            });
          }
        } catch (e) {
          console.error("Error processing client WS message", e);
        }
      });

      clientWs.on("close", () => {
        // session doesn't seem to have a clear close method directly exposed in the connect response, 
        // but typically you drop references or there might be session.close() if typed.
        if (typeof (session as any).close === 'function') {
          (session as any).close();
        }
      });
    } catch (e) {
      console.error("Live API connection failed", e);
      clientWs.close();
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  server.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
