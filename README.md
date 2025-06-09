# Competitive Solitaire

A two-player competitive solitaire game where players race against each other to complete their solitaire games first. Each player has their own deck and game board, and they take turns making moves.

## Features

- Two-player competitive gameplay
- Real-time game state tracking
- Timer to track game duration
- Modern, responsive UI with animations
- Automatic move validation
- Visual feedback for valid moves

## How to Play

1. Each player has their own solitaire game board with:
   - A stock pile (face-down cards)
   - A waste pile (face-up cards from the stock)
   - Four foundation piles (where cards are built up by suit from Ace to King)
   - Seven tableau piles (where cards are built down by alternating colors)

2. Players take turns making moves. On your turn, you can:
   - Draw a card from your stock to your waste pile
   - Move the top card from your waste pile to a foundation or tableau pile
   - Move cards between tableau piles
   - Move cards from tableau piles to foundation piles

3. The first player to complete their foundation piles (all suits from Ace to King) wins!

## Rules

- Foundation piles must be built up by suit from Ace to King
- Tableau piles must be built down by alternating colors
- Only face-up cards can be moved
- A King can only be placed on an empty tableau pile
- An Ace can only be placed on an empty foundation pile

## Getting Started

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```
4. Open your browser and navigate to `http://localhost:5173`

## Technologies Used

- React
- TypeScript
- Vite
- Emotion (for styling)
- Framer Motion (for animations)
