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

  @media (max-width: 600px) {
    padding: 0.5rem;
  }
`;

const GameBoard = styled.div`
  display: flex;
  gap: 2rem;
  margin-top: 2rem;

  @media (max-width: 900px) {
    flex-direction: column;
    gap: 1rem;
    width: 100%;
    align-items: center;
  }
`;

const PlayerBoardWrapper = styled.div<{ isActive: boolean }>`
  padding: 1rem;
  border-radius: 8px;
  background: ${props => props.isActive ? '#2a2a2a' : '#1a1a1a'};
  border: 2px solid ${props => props.isActive ? '#4a4a4a' : 'transparent'};
  transition: all 0.3s ease;
  width: 400px;
  max-width: 95vw;
  box-sizing: border-box;

  @media (max-width: 600px) {
    width: 100%;
    padding: 0.5rem;
  }
`;

const GameStatus = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  margin-bottom: 2rem;
  width: 100%;

  @media (max-width: 600px) {
    gap: 0.5rem;
    margin-bottom: 1rem;
  }
`;

const ProgressBar = styled.div`
  width: 200px;
  height: 20px;
  background: #333;
  border-radius: 10px;
  overflow: hidden;
  margin: 0.5rem 0;

  @media (max-width: 600px) {
    width: 100%;
    min-width: 120px;
    height: 16px;
  }
`;

const Progress = styled.div<{ width: number }>`
  width: ${props => props.width}%;
  height: 100%;
  background: #4CAF50;
  transition: width 0.3s ease;
`;

const Timer = styled.div`
  font-size: 1.2rem;
  font-weight: bold;
  margin: 0.5rem 0;

  @media (max-width: 600px) {
    font-size: 1rem;
  }
`;

const Game: React.FC = () => {
  const [gameState, setGameState] = useState<GameState>(() => {
    const config: GameConfig = {
      maxStockPasses: 3,
      cardsPerDraw: 1,
    };
    const state = initializeGame(config);
    return { ...state, startTime: Date.now() };
  });

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
      <h1>Competitive Solitaire</h1>
      <GameStatus>
        {gameState.winner ? (
          <h2>Player {gameState.winner} wins!</h2>
        ) : (
          <h2>Current Player: {gameState.currentPlayer}</h2>
        )}
        <div>
          <h3>Player 1</h3>
          <Timer>Time: {formatTime(gameState.player1.timer)}</Timer>
          <ProgressBar>
            <Progress width={player1Progress} />
          </ProgressBar>
          <p>{progress.player1} / {maxScore} cards</p>
          <p>Stock Passes: {gameState.player1.stockPasses} / {gameState.maxStockPasses}</p>
        </div>
        <div>
          <h3>Player 2</h3>
          <Timer>Time: {formatTime(gameState.player2.timer)}</Timer>
          <ProgressBar>
            <Progress width={player2Progress} />
          </ProgressBar>
          <p>{progress.player2} / {maxScore} cards</p>
          <p>Stock Passes: {gameState.player2.stockPasses} / {gameState.maxStockPasses}</p>
        </div>
      </GameStatus>
      <GameBoard>
        <PlayerBoardWrapper isActive={gameState.currentPlayer === 1}>
          <h3>Player 1</h3>
          <PlayerBoard
            stock={gameState.player1.stock}
            waste={gameState.player1.waste}
            foundations={gameState.player1.foundations}
            tableau={gameState.player1.tableau}
            onCardClick={handleCardClick}
            isActive={gameState.currentPlayer === 1}
          />
        </PlayerBoardWrapper>
        <PlayerBoardWrapper isActive={gameState.currentPlayer === 2}>
          <h3>Player 2</h3>
          <PlayerBoard
            stock={gameState.player2.stock}
            waste={gameState.player2.waste}
            foundations={gameState.player2.foundations}
            tableau={gameState.player2.tableau}
            onCardClick={handleCardClick}
            isActive={gameState.currentPlayer === 2}
          />
        </PlayerBoardWrapper>
      </GameBoard>
    </GameContainer>
  );
};

export default Game; 