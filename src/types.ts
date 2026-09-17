export type GameMode = 'setup' | 'classic' | 'live' | 'p2p_transfer';

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
