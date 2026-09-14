import React, { useState, useEffect, useRef } from 'react';
import { GameSettings, TriviaQuestion } from '../types';
import { Volume2, Loader2, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { saveScore } from '../lib/scoreStore';

interface Props {
  settings: GameSettings;
  onExit: () => void;
}

export default function ClassicGame({ settings, onExit }: Props) {
  const [question, setQuestion] = useState<TriviaQuestion | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  
  const [sessionScore, setSessionScore] = useState(0);
  const audioContextRef = useRef<AudioContext | null>(null);

  const fetchQuestion = async () => {
    setLoading(true);
    setSelectedAnswer(null);
    try {
      const res = await fetch('/api/trivia', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ personality: settings.personality, category: settings.category })
      });
      const data = await res.json();
      setQuestion(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuestion();
    return () => {
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    }
  }, []);

  const handleExit = () => {
    if (sessionScore > 0) {
      saveScore(sessionScore, settings.category, settings.personality);
    }
    onExit();
  };

  const handleSelectAnswer = (idx: number) => {
    if (selectedAnswer !== null) return;
    setSelectedAnswer(idx);
    if (question && idx === question.correctAnswerIndex) {
      setSessionScore(s => s + 100);
    }
  };

  const playTTS = async (text: string) => {
    setIsPlayingAudio(true);
    try {
      const res = await fetch('/api/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, voice: settings.voice })
      });
      const { audio } = await res.json();
      
      if (!audio) throw new Error("No audio returned");

      if (!audioContextRef.current) {
        audioContextRef.current = new AudioContext({ sampleRate: 24000 });
      }
      const binary = atob(audio);
      const bytes = new Uint8Array(binary.length);
      for (let i = 0; i < binary.length; i++) {
        bytes[i] = binary.charCodeAt(i);
      }
      
      const buffer = new ArrayBuffer(bytes.length);
      const view = new DataView(buffer);
      for (let i = 0; i < bytes.length; i++) view.setUint8(i, bytes[i]);
      
      const int16Array = new Int16Array(buffer);
      const float32Array = new Float32Array(int16Array.length);
      for (let i = 0; i < int16Array.length; i++) {
        float32Array[i] = int16Array[i] / (int16Array[i] < 0 ? 0x8000 : 0x7fff);
      }
      
      const audioBuffer = audioContextRef.current.createBuffer(1, float32Array.length, 24000);
      audioBuffer.getChannelData(0).set(float32Array);
      
      const source = audioContextRef.current.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(audioContextRef.current.destination);
      source.onended = () => setIsPlayingAudio(false);
      source.start();
    } catch (e) {
      console.error("TTS playback failed:", e);
      setIsPlayingAudio(false);
    }
  };

  const isAnswerRevealed = selectedAnswer !== null;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col items-center p-6 font-sans">
      <header className="w-full max-w-2xl flex justify-between items-center mb-8">
        <button onClick={handleExit} className="text-slate-500 hover:text-slate-800 font-medium transition-colors">
          &larr; Exit
        </button>
        <div className="flex gap-4">
          <div className="px-4 py-2 bg-blue-100 rounded-full text-sm font-semibold tracking-wide text-blue-700">
            SCORE: {sessionScore}
          </div>
          <div className="px-4 py-2 bg-slate-200 rounded-full text-sm font-semibold tracking-wide text-slate-600">
            CLASSIC MODE
          </div>
        </div>
      </header>

      <main className="w-full max-w-2xl flex-1 flex flex-col relative">
        <AnimatePresence mode="wait">
          {loading ? (
            <motion.div 
              key="loading"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="flex-1 flex flex-col items-center justify-center gap-4"
            >
              <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
              <p className="text-slate-500">The host is preparing a question...</p>
            </motion.div>
          ) : question ? (
            <motion.div 
              key="question"
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
              className="flex-1 flex flex-col gap-6"
            >
              <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200 flex flex-col gap-4">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-blue-600 mb-2 uppercase tracking-widest">{settings.personality}</p>
                    <p className="text-lg italic text-slate-600">"{question.hostMessage}"</p>
                  </div>
                  <button 
                    onClick={() => playTTS(question.hostMessage + " " + question.question)}
                    disabled={isPlayingAudio}
                    className="ml-4 p-3 bg-blue-50 text-blue-600 rounded-full hover:bg-blue-100 disabled:opacity-50 transition-colors"
                  >
                    <Volume2 className="w-5 h-5" />
                  </button>
                </div>
                
                <h2 className="text-2xl font-bold mt-4 leading-snug">{question.question}</h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {question.options.map((opt, idx) => {
                  let btnClass = "p-5 rounded-2xl border-2 text-left transition-all font-medium text-lg ";
                  
                  if (!isAnswerRevealed) {
                    btnClass += "border-slate-200 hover:border-blue-500 bg-white shadow-sm hover:shadow-md";
                  } else {
                    if (idx === question.correctAnswerIndex) {
                      btnClass += "border-green-500 bg-green-50 text-green-800";
                    } else if (idx === selectedAnswer) {
                      btnClass += "border-red-500 bg-red-50 text-red-800";
                    } else {
                      btnClass += "border-slate-100 bg-slate-50 text-slate-400";
                    }
                  }

                  return (
                    <button 
                      key={idx}
                      disabled={isAnswerRevealed}
                      onClick={() => handleSelectAnswer(idx)}
                      className={btnClass}
                    >
                      {opt}
                    </button>
                  );
                })}
              </div>

              {isAnswerRevealed && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
                  className="bg-slate-800 text-white p-6 rounded-3xl mt-4"
                >
                  <div className="flex justify-between items-start gap-4">
                    <div>
                      <p className="font-semibold text-slate-300 mb-1 uppercase tracking-widest text-xs">Fun Fact</p>
                      <p className="text-lg leading-relaxed">{question.funFact}</p>
                    </div>
                    <button 
                      onClick={() => playTTS(question.funFact)}
                      disabled={isPlayingAudio}
                      className="p-3 bg-slate-700 text-white rounded-full hover:bg-slate-600 disabled:opacity-50 transition-colors shrink-0"
                    >
                      <Volume2 className="w-5 h-5" />
                    </button>
                  </div>
                  
                  <button 
                    onClick={fetchQuestion}
                    className="mt-6 w-full flex items-center justify-center gap-2 bg-blue-600 text-white py-4 rounded-xl hover:bg-blue-700 font-semibold"
                  >
                    Next Question
                    <ArrowRight className="w-5 h-5" />
                  </button>
                </motion.div>
              )}
            </motion.div>
          ) : null}
        </AnimatePresence>
      </main>
    </div>
  );
}
