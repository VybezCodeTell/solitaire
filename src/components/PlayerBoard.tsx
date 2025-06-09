import { useState } from 'react';
import styled from '@emotion/styled';
import { motion, AnimatePresence } from 'framer-motion';
import type { Card, Move } from '../types/game';

const BoardContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  width: 100%;

  @media (max-width: 600px) {
    gap: 0.5rem;
  }
`;

const Row = styled.div`
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
  width: 100%;
  box-sizing: border-box;

  @media (max-width: 600px) {
    gap: 0.25rem;
  }
`;

const CardStack = styled.div`
  position: relative;
  min-width: 60px;
  min-height: 90px;

  @media (max-width: 600px) {
    min-width: 36px;
    min-height: 54px;
  }
`;

const Card = styled(motion.div)<{ faceUp: boolean; suit: string; isSelected?: boolean }>`
  width: 60px;
  height: 90px;
  background: ${props => props.faceUp ? 'white' : '#2a2a2a'};
  border-radius: 4px;
  position: absolute;
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${props => props.faceUp ? (props.suit === 'hearts' || props.suit === 'diamonds' ? 'red' : 'black') : 'transparent'};
  cursor: pointer;
  user-select: none;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  font-size: 1.2rem;
  font-weight: bold;
  border: 2px solid ${props => props.isSelected ? '#4CAF50' : 'transparent'};
  transition: all 0.2s ease;
  z-index: 1;

  &:hover {
    transform: translateY(-5px);
  }

  @media (max-width: 600px) {
    width: 36px;
    height: 54px;
    font-size: 0.8rem;
    border-radius: 3px;
  }
`;

const CardPreview = styled(motion.div)<{ faceUp: boolean; suit: string }>`
  width: 60px;
  height: 90px;
  background: ${props => props.faceUp ? 'white' : '#2a2a2a'};
  border-radius: 4px;
  position: absolute;
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${props => props.faceUp ? (props.suit === 'hearts' || props.suit === 'diamonds' ? 'red' : 'black') : 'transparent'};
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  font-size: 1.2rem;
  font-weight: bold;
  opacity: 0.5;
  z-index: 0;

  @media (max-width: 600px) {
    width: 36px;
    height: 54px;
    font-size: 0.8rem;
    border-radius: 3px;
  }
`;

interface PlayerBoardProps {
  stock: Card[];
  waste: Card[];
  foundations: Card[][];
  tableau: Card[][];
  onCardClick: (move: Move) => void;
  isActive: boolean;
}

const PlayerBoard: React.FC<PlayerBoardProps> = ({
  stock,
  waste,
  foundations,
  tableau,
  onCardClick,
  isActive,
}) => {
  const [selectedCard, setSelectedCard] = useState<{
    type: 'waste' | 'foundation' | 'tableau';
    index: number;
    cardIndex?: number;
  } | null>(null);

  const [draggedCard, setDraggedCard] = useState<{
    type: 'waste' | 'foundation' | 'tableau';
    index: number;
    cardIndex?: number;
  } | null>(null);

  const handleStockClick = () => {
    if (!isActive || stock.length === 0) return;
    onCardClick({
      type: 'stock',
      from: { type: 'stock', index: 0 },
      to: { type: 'waste', index: 0 },
      cards: [stock[stock.length - 1]],
      timestamp: Date.now()
    });
  };

  const handleCardClick = (
    type: 'waste' | 'foundation' | 'tableau',
    index: number,
    cardIndex?: number
  ) => {
    if (!isActive) return;

    if (selectedCard) {
      // If a card is already selected, try to make a move
      const move: Move = {
        type: selectedCard.type,
        from: {
          type: selectedCard.type,
          index: selectedCard.index,
        },
        to: {
          type: type,
          index: index,
        },
        cards: getSelectedCards(selectedCard),
        timestamp: Date.now()
      };

      onCardClick(move);
      setSelectedCard(null);
    } else {
      // Select a card
      const cards = getCards(type, index);
      if (cards.length > 0) {
        setSelectedCard({ type, index, cardIndex });
      }
    }
  };

  const getCards = (type: 'waste' | 'foundation' | 'tableau', index: number): Card[] => {
    switch (type) {
      case 'waste':
        return waste.length > 0 ? [waste[waste.length - 1]] : [];
      case 'foundation':
        return foundations[index].length > 0 ? [foundations[index][foundations[index].length - 1]] : [];
      case 'tableau':
        return tableau[index].length > 0 ? [tableau[index][tableau[index].length - 1]] : [];
    }
  };

  const getSelectedCards = (selected: {
    type: 'waste' | 'foundation' | 'tableau';
    index: number;
    cardIndex?: number;
  }): Card[] => {
    switch (selected.type) {
      case 'waste':
        return waste.length > 0 ? [waste[waste.length - 1]] : [];
      case 'foundation':
        return foundations[selected.index].length > 0
          ? [foundations[selected.index][foundations[selected.index].length - 1]]
          : [];
      case 'tableau':
        if (selected.cardIndex !== undefined) {
          return tableau[selected.index].slice(selected.cardIndex);
        }
        return tableau[selected.index].length > 0
          ? [tableau[selected.index][tableau[selected.index].length - 1]]
          : [];
    }
  };

  const isCardSelected = (
    type: 'waste' | 'foundation' | 'tableau',
    index: number,
    cardIndex?: number
  ) => {
    return (
      selectedCard?.type === type &&
      selectedCard?.index === index &&
      selectedCard?.cardIndex === cardIndex
    );
  };

  const getCardBelow = (
    type: 'waste' | 'foundation' | 'tableau',
    index: number,
    cardIndex?: number
  ): Card | null => {
    switch (type) {
      case 'tableau':
        if (cardIndex !== undefined && cardIndex > 0) {
          return tableau[index][cardIndex - 1];
        }
        return null;
      default:
        return null;
    }
  };

  return (
    <BoardContainer>
      <Row>
        <CardStack>
          <Card
            faceUp={false}
            suit=""
            onClick={handleStockClick}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {stock.length}
          </Card>
        </CardStack>
        <CardStack>
          {waste.length > 0 && (
            <Card
              faceUp={true}
              suit={waste[waste.length - 1].suit}
              onClick={() => handleCardClick('waste', 0)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              isSelected={isCardSelected('waste', 0)}
              drag
              dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
              onDragStart={() => setDraggedCard({ type: 'waste', index: 0 })}
              onDragEnd={() => setDraggedCard(null)}
            >
              {waste[waste.length - 1].rank}
            </Card>
          )}
        </CardStack>
        {foundations.map((foundation, i) => (
          <CardStack key={i}>
            {foundation.length > 0 && (
              <Card
                faceUp={true}
                suit={foundation[foundation.length - 1].suit}
                onClick={() => handleCardClick('foundation', i)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                isSelected={isCardSelected('foundation', i)}
                drag
                dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
                onDragStart={() => setDraggedCard({ type: 'foundation', index: i })}
                onDragEnd={() => setDraggedCard(null)}
              >
                {foundation[foundation.length - 1].rank}
              </Card>
            )}
          </CardStack>
        ))}
      </Row>
      <Row>
        {tableau.map((pile, i) => (
          <CardStack key={i}>
            {pile.map((card, j) => (
              <div key={j}>
                <AnimatePresence>
                  {draggedCard?.type === 'tableau' && 
                   draggedCard.index === i && 
                   draggedCard.cardIndex === j && 
                   getCardBelow('tableau', i, j) && (
                    <CardPreview
                      faceUp={getCardBelow('tableau', i, j)!.faceUp}
                      suit={getCardBelow('tableau', i, j)!.suit}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 0.5 }}
                      exit={{ opacity: 0 }}
                    >
                      {getCardBelow('tableau', i, j)!.rank}
                    </CardPreview>
                  )}
                </AnimatePresence>
                <Card
                  faceUp={card.faceUp}
                  suit={card.suit}
                  style={{ top: j * 20 }}
                  onClick={() => handleCardClick('tableau', i, j)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  isSelected={isCardSelected('tableau', i, j)}
                  drag
                  dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
                  onDragStart={() => setDraggedCard({ type: 'tableau', index: i, cardIndex: j })}
                  onDragEnd={() => setDraggedCard(null)}
                >
                  {card.rank}
                </Card>
              </div>
            ))}
          </CardStack>
        ))}
      </Row>
    </BoardContainer>
  );
};

export default PlayerBoard; 