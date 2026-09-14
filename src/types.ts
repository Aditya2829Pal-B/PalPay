export type GameMode = 'setup' | 'classic' | 'live';

export interface GameSettings {
  personality: string;
  voice: string;
  category: string;
}

export interface TriviaQuestion {
  hostMessage: string;
  question: string;
  options: string[];
  correctAnswerIndex: number;
  funFact: string;
}
