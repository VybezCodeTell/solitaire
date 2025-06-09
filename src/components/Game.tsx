import React, { useState, useEffect } from 'react';
import styled from '@emotion/styled';
import type { GameState, Move, GameConfig } from '../types/game';
import {
  initializeGame,
  makeMove,
  checkWinCondition,
  getGameProgress,
  updatePlayerTimer,
} from '../utils/gameLogic';
import PlayerBoard from './PlayerBoard';

const GameContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 2rem;
  min-height: 100vh;
  background: #1a1a1a;
  color: white;
  box-sizing: border-box;
  width: 100vw;
  max-width: 100vw;
  overflow-x: hidden;

  @media (max-width: 600px) {
    padding: 0.5rem;
  }
`;

const SplitBoard = styled.div`
  display: flex;
  flex-direction: column;
  width: 900px;
  max-width: 98vw;
  background: #e0e0e0;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.08);
  overflow: hidden;

  @media (max-width: 900px) {
    width: 100vw;
    border-radius: 0;
  }

  @media (max-width: 600px) {
    flex-direction: column;
    width: 100vw;
    background: #e0e0e0;
  }
`;

const PlayerSection = styled.section<{ borderBottom?: boolean }>`
  flex: 1;
  padding: 2rem 1.5rem 1.5rem 1.5rem;
  border-bottom: ${props => props.borderBottom ? '2px solid #bbb' : 'none'};
  background: #e0e0e0;
  position: relative;

  @media (max-width: 600px) {
    padding: 1rem 0.5rem;
    border-bottom: none;
    border-top: ${props => props.borderBottom ? '2px solid #bbb' : 'none'};
  }
`;

const SectionLabel = styled.h2`
  font-size: 1.3rem;
  font-weight: bold;
  margin: 0 0 0.5rem 0;
  color: #222;
  letter-spacing: 1px;

  @media (max-width: 600px) {
    font-size: 1.1rem;
    margin-bottom: 0.25rem;
  }
`;

const GameTitle = styled.h1`
  font-size: 2.2rem;
  font-weight: bold;
  margin-bottom: 1.5rem;
  color: #222;
  letter-spacing: 2px;
  text-align: center;

  @media (max-width: 600px) {
    font-size: 1.4rem;
    margin-bottom: 0.5rem;
  }
`;

const useIsMobile = () => {
  const [isMobile, setIsMobile] = React.useState(false);
  React.useEffect(() => {
    const check = () => setIsMobile(window.innerWidth <= 600);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);
  return isMobile;
};

const Game: React.FC = () => {
  const [gameState, setGameState] = useState<GameState>(() => {
    const config: GameConfig = {
      maxStockPasses: 3,
      cardsPerDraw: 1,
    };
    const state = initializeGame(config);
    return { ...state, startTime: Date.now() };
  });
  const isMobile = useIsMobile();

  // Update timers
  useEffect(() => {
    if (!gameState.startTime || gameState.endTime) return;

    const timer = setInterval(() => {
      setGameState(prevState => updatePlayerTimer(prevState));
    }, 100);

    return () => clearInterval(timer);
  }, [gameState.startTime, gameState.endTime]);

  const handleCardClick = (move: Move) => {
    const newState = makeMove(move, gameState);
    if (newState !== gameState) {
      if (checkWinCondition(newState)) {
        setGameState({
          ...newState,
          endTime: Date.now(),
          winner: newState.currentPlayer,
        });
      } else {
        setGameState({
          ...newState,
          currentPlayer: newState.currentPlayer === 1 ? 2 : 1,
        });
      }
    }
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const progress = getGameProgress(gameState);
  const maxScore = 52; // 13 cards * 4 suits
  const player1Progress = (progress.player1 / maxScore) * 100;
  const player2Progress = (progress.player2 / maxScore) * 100;

  return (
    <GameContainer>
      <GameTitle>TWO-PLAYER SOLITAIRE</GameTitle>
      <SplitBoard>
        <PlayerSection borderBottom={!isMobile}>
          <SectionLabel>Player 1</SectionLabel>
          <PlayerBoard
            stock={gameState.player1.stock}
            waste={gameState.player1.waste}
            foundations={gameState.player1.foundations}
            tableau={gameState.player1.tableau}
            onCardClick={handleCardClick}
            isActive={gameState.currentPlayer === 1}
            layout={isMobile ? 'mobile' : 'desktop'}
            playerLabel="Player 1"
          />
        </PlayerSection>
        <PlayerSection>
          <SectionLabel>Player 2</SectionLabel>
          <PlayerBoard
            stock={gameState.player2.stock}
            waste={gameState.player2.waste}
            foundations={gameState.player2.foundations}
            tableau={gameState.player2.tableau}
            onCardClick={handleCardClick}
            isActive={gameState.currentPlayer === 2}
            layout={isMobile ? 'mobile' : 'desktop'}
            playerLabel="Player 2"
          />
        </PlayerSection>
      </SplitBoard>
    </GameContainer>
  );
};

export default Game; 