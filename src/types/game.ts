export type Suit = 'hearts' | 'diamonds' | 'clubs' | 'spades';
export type Rank = 'A' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | '10' | 'J' | 'Q' | 'K';

export interface Card {
  suit: Suit;
  rank: Rank;
  faceUp: boolean;
}

export interface Move {
  type: 'stock' | 'tableau' | 'foundation' | 'waste';
  from: {
    type: 'stock' | 'waste' | 'foundation' | 'tableau';
    index: number;
  };
  to: {
    type: 'foundation' | 'tableau' | 'waste';
    index: number;
  };
  cards: Card[];
  timestamp: number;
}

export interface PlayerState {
  tableau: Card[][];
  foundations: Card[][];
  stock: Card[];
  waste: Card[];
  timer: number;
  moveLog: Move[];
  stockPasses: number;
}

export interface GameState {
  player1: PlayerState;
  player2: PlayerState;
  currentPlayer: 1 | 2;
  startTime: number | null;
  endTime: number | null;
  winner: number | null;
  shuffleSeed: number;
  maxStockPasses: number;
  cardsPerDraw: 1 | 3;
}

export interface GameConfig {
  maxStockPasses: number;
  cardsPerDraw: 1 | 3;
} 