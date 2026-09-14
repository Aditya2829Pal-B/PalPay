import React, { useEffect, useState } from 'react';
import { getScores, ScoreEntry } from '../lib/scoreStore';
import { Trophy } from 'lucide-react';

export default function Scoreboard() {
  const [scores, setScores] = useState<ScoreEntry[]>([]);

  useEffect(() => {
    setScores(getScores().slice(0, 5)); // Show top 5
  }, []);

  if (scores.length === 0) {
    return null; // Don't show if no scores
  }

  return (
    <div className="w-full max-w-xl bg-white p-6 rounded-3xl shadow-sm border border-slate-200 mt-6">
      <div className="flex items-center gap-2 mb-4">
        <Trophy className="w-6 h-6 text-yellow-500" />
        <h2 className="text-xl font-bold tracking-tight">Top High Scores</h2>
      </div>
      <div className="space-y-3">
        {scores.map((s, i) => (
          <div key={s.id} className="flex justify-between items-center p-3 bg-slate-50 rounded-xl border border-slate-100">
            <div className="flex items-center gap-4">
              <span className="text-lg font-bold text-slate-400 w-4">{i + 1}</span>
              <div>
                <p className="font-semibold text-slate-800">{s.category}</p>
                <p className="text-xs text-slate-500">with {s.personality}</p>
              </div>
            </div>
            <div className="text-right">
              <span className="text-xl font-bold text-blue-600">{s.score}</span>
              <span className="text-sm font-medium text-blue-400 ml-1">pts</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
