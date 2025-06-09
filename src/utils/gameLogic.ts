import type {
  Card,
  GameState,
  Move,
  PlayerState,
  Rank,
  Suit,
  GameConfig,
} from "../types/game";

const SUITS: Suit[] = ["hearts", "diamonds", "clubs", "spades"];
const RANKS: Rank[] = [
  "A",
  "2",
  "3",
  "4",
  "5",
  "6",
  "7",
  "8",
  "9",
  "10",
  "J",
  "Q",
  "K",
];

// Deterministic shuffle using Fisher-Yates algorithm with seed
const seededShuffle = (array: Card[], seed: number): Card[] => {
  const shuffled = [...array];
  let currentSeed = seed;

  const random = () => {
    const x = Math.sin(currentSeed++) * 10000;
    return x - Math.floor(x);
  };

  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }

  return shuffled;
};

export const createDeck = (): Card[] => {
  const deck: Card[] = [];
  for (const suit of SUITS) {
    for (const rank of RANKS) {
      deck.push({ suit, rank, faceUp: false });
    }
  }
  return deck;
};

export const initializeGame = (config: GameConfig): GameState => {
  const shuffleSeed = Math.floor(Math.random() * 1000000);
  const deck = createDeck();
  const shuffledDeck = seededShuffle(deck, shuffleSeed);

  const initializePlayerState = (deck: Card[]): PlayerState => {
    const stock = deck.slice(0, 24);
    const waste: Card[] = [];
    const foundations: Card[][] = [[], [], [], []];
    const tableau: Card[][] = Array(7)
      .fill(null)
      .map((_, i) => {
        const cards = deck.slice(24 + i * 4, 24 + (i + 1) * 4);
        cards[cards.length - 1].faceUp = true;
        return cards;
      });

    return {
      tableau,
      foundations,
      stock,
      waste,
      timer: 0,
      moveLog: [],
      stockPasses: 0,
    };
  };

  return {
    player1: initializePlayerState(shuffledDeck),
    player2: initializePlayerState(shuffledDeck),
    currentPlayer: 1,
    startTime: null,
    endTime: null,
    winner: null,
    shuffleSeed,
    maxStockPasses: config.maxStockPasses,
    cardsPerDraw: config.cardsPerDraw,
  };
};

export const isValidMove = (move: Move, gameState: GameState): boolean => {
  const player =
    gameState.currentPlayer === 1 ? gameState.player1 : gameState.player2;
  const { from, to, cards } = move;

  // Check stock passes limit
  if (from.type === "stock" && player.stockPasses >= gameState.maxStockPasses) {
    return false;
  }

  // Get source cards
  let sourceCards: Card[] = [];
  switch (from.type) {
    case "stock":
      if (player.stock.length === 0) return false;
      sourceCards = [player.stock[player.stock.length - 1]];
      break;
    case "waste":
      if (player.waste.length === 0) return false;
      sourceCards = [player.waste[player.waste.length - 1]];
      break;
    case "foundation":
      if (player.foundations[from.index].length === 0) return false;
      sourceCards = [
        player.foundations[from.index][
          player.foundations[from.index].length - 1
        ],
      ];
      break;
    case "tableau":
      if (player.tableau[from.index].length === 0) return false;
      const tableauCards = player.tableau[from.index].slice(-cards.length);
      if (tableauCards.some((card) => !card.faceUp)) return false;
      sourceCards = tableauCards;
      break;
  }

  // Validate move to foundation
  if (to.type === "foundation") {
    if (sourceCards.length !== 1) return false;
    const card = sourceCards[0];
    const foundation = player.foundations[to.index];

    if (foundation.length === 0) {
      return card.rank === "A";
    }

    const topCard = foundation[foundation.length - 1];
    return (
      card.suit === topCard.suit &&
      RANKS.indexOf(card.rank) === RANKS.indexOf(topCard.rank) + 1
    );
  }

  // Validate move to tableau
  if (to.type === "tableau") {
    const tableau = player.tableau[to.index];
    const card = sourceCards[0];

    if (tableau.length === 0) {
      return card.rank === "K";
    }

    const topCard = tableau[tableau.length - 1];
    const isRed = (suit: Suit) => suit === "hearts" || suit === "diamonds";

    return (
      isRed(card.suit) !== isRed(topCard.suit) &&
      RANKS.indexOf(card.rank) === RANKS.indexOf(topCard.rank) - 1
    );
  }

  return false;
};

export const makeMove = (move: Move, gameState: GameState): GameState => {
  if (!isValidMove(move, gameState)) return gameState;

  const newState = JSON.parse(JSON.stringify(gameState)) as GameState;
  const player =
    newState.currentPlayer === 1 ? newState.player1 : newState.player2;

  // Add move to log
  const moveWithTimestamp = {
    ...move,
    timestamp: Date.now(),
  };
  player.moveLog.push(moveWithTimestamp);

  // Remove cards from source
  switch (move.from.type) {
    case "stock":
      player.stock.pop();
      if (player.stock.length === 0) {
        player.stockPasses++;
      }
      break;
    case "waste":
      player.waste.pop();
      break;
    case "foundation":
      player.foundations[move.from.index].pop();
      break;
    case "tableau":
      player.tableau[move.from.index] = player.tableau[move.from.index].slice(
        0,
        -move.cards.length
      );
      if (player.tableau[move.from.index].length > 0) {
        player.tableau[move.from.index][
          player.tableau[move.from.index].length - 1
        ].faceUp = true;
      }
      break;
  }

  // Add cards to destination
  switch (move.to.type) {
    case "foundation":
      player.foundations[move.to.index].push(move.cards[0]);
      break;
    case "tableau":
      player.tableau[move.to.index].push(...move.cards);
      break;
    case "waste":
      player.waste.push(move.cards[0]);
      break;
  }

  return newState;
};

export const checkWinCondition = (gameState: GameState): boolean => {
  const player =
    gameState.currentPlayer === 1 ? gameState.player1 : gameState.player2;
  return player.foundations.every((foundation) => foundation.length === 13);
};

export const isGameOver = (gameState: GameState): boolean => {
  return gameState.winner !== null;
};

export const getPlayerScore = (player: PlayerState): number => {
  return player.foundations.reduce(
    (score, foundation) => score + foundation.length,
    0
  );
};

export const getGameProgress = (
  gameState: GameState
): { player1: number; player2: number } => {
  return {
    player1: getPlayerScore(gameState.player1),
    player2: getPlayerScore(gameState.player2),
  };
};

export const getPlayerTime = (player: PlayerState): number => {
  return player.timer;
};

export const updatePlayerTimer = (gameState: GameState): GameState => {
  const newState = { ...gameState };
  const currentTime = Date.now();

  if (newState.startTime && !newState.endTime) {
    const elapsedTime = (currentTime - newState.startTime) / 1000;
    if (newState.currentPlayer === 1) {
      newState.player1.timer = elapsedTime;
    } else {
      newState.player2.timer = elapsedTime;
    }
  }

  return newState;
};
