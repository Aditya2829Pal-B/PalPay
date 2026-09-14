import React, { useState } from 'react';
import { GameMode, GameSettings } from '../types';
import { Play, Mic } from 'lucide-react';
import Scoreboard from './Scoreboard';

interface Props {
  onStart: (mode: GameMode, settings: GameSettings) => void;
}

const PERSONALITIES = [
  "Friendly and helpful",
  "Sarcastic British Host",
  "Enthusiastic Game Show Announcer",
  "Grumpy Pirate",
  "Mysterious Alien Explorer"
];

const VOICES = ["Kore", "Zephyr", "Puck", "Charon", "Fenrir"];
const CATEGORIES = ["General Knowledge", "Science & Nature", "History", "Pop Culture", "Geography"];

export default function SetupScreen({ onStart }: Props) {
  const [personality, setPersonality] = useState(PERSONALITIES[0]);
  const [voice, setVoice] = useState(VOICES[0]);
  const [category, setCategory] = useState(CATEGORIES[0]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50 text-slate-800 p-6 font-sans">
      <div className="w-full max-w-xl bg-white p-8 rounded-3xl shadow-sm border border-slate-200">
        <h1 className="text-3xl font-bold text-center mb-8 tracking-tight">AI Trivia Master</h1>
        
        <div className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-600 block">Host Personality</label>
            <select 
              value={personality}
              onChange={(e) => setPersonality(e.target.value)}
              className="w-full p-3 bg-slate-100 border-none rounded-xl focus:ring-2 focus:ring-blue-500 transition-shadow appearance-none"
            >
              {PERSONALITIES.map(p => <option key={p} value={p}>{p}</option>)}
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-600 block">Host Voice</label>
            <select 
              value={voice}
              onChange={(e) => setVoice(e.target.value)}
              className="w-full p-3 bg-slate-100 border-none rounded-xl focus:ring-2 focus:ring-blue-500 transition-shadow appearance-none"
            >
              {VOICES.map(v => <option key={v} value={v}>{v}</option>)}
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-600 block">Trivia Category</label>
            <select 
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full p-3 bg-slate-100 border-none rounded-xl focus:ring-2 focus:ring-blue-500 transition-shadow appearance-none"
            >
              {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          <div className="pt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <button 
              onClick={() => onStart('classic', { personality, voice, category })}
              className="flex items-center justify-center gap-2 bg-slate-800 text-white p-4 rounded-2xl hover:bg-slate-700 transition-colors font-medium"
            >
              <Play className="w-5 h-5" />
              Play Classic Mode
            </button>
            <button 
              onClick={() => onStart('live', { personality, voice, category })}
              className="flex items-center justify-center gap-2 bg-blue-600 text-white p-4 rounded-2xl hover:bg-blue-700 transition-colors font-medium"
            >
              <Mic className="w-5 h-5" />
              Start Live Audio Call
            </button>
          </div>
        </div>
      </div>
      <Scoreboard />
    </div>
  );
}
