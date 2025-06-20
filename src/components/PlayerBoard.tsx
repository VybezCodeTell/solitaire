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

const SectionLabel = styled.div`
  font-size: 1.1rem;
  font-weight: bold;
  margin-bottom: 0.5rem;
  color: #222;
  letter-spacing: 1px;

  @media (max-width: 600px) {
    font-size: 1rem;
    margin-bottom: 0.25rem;
  }
`;

const Area = styled.div<{ direction?: string }>`
  display: flex;
  flex-direction: ${props => props.direction || 'row'};
  align-items: flex-start;
  gap: 1rem;
  margin-bottom: 1rem;
  width: 100%;

  @media (max-width: 600px) {
    flex-direction: column;
    gap: 0.5rem;
    margin-bottom: 0.5rem;
  }
`;

interface PlayerBoardProps {
  stock: Card[];
  waste: Card[];
  foundations: Card[][];
  tableau: Card[][];
  onCardClick: (move: Move) => void;
  isActive: boolean;
  layout: 'desktop' | 'mobile';
  playerLabel: string;
}

const PlayerBoard: React.FC<PlayerBoardProps> = ({
  stock,
  waste,
  foundations,
  tableau,
  onCardClick,
  isActive,
  layout,
  playerLabel,
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
      {layout === 'desktop' ? (
        <>
          <SectionLabel>{playerLabel}</SectionLabel>
          <Area direction="row">
            <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: '1rem' }}>
              <div>
                <SectionLabel>Foundation</SectionLabel>
                <Row>
                  {foundations.map((stack, i) => (
                    <CardStack key={i}>
                      {stack.map((card) => (
                        <Card
                          faceUp={true}
                          suit={card.suit}
                          onClick={() => handleCardClick('foundation', i)}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          isSelected={isCardSelected('foundation', i)}
                          drag
                          dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
                          onDragStart={() => setDraggedCard({ type: 'foundation', index: i })}
                          onDragEnd={() => setDraggedCard(null)}
                        >
                          {card.rank}
                        </Card>
                      ))}
                    </CardStack>
                  ))}
                </Row>
              </div>
              <div>
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
                </Row>
                <div style={{ fontSize: '0.9rem', color: '#444', marginTop: '0.2rem' }}>Waste</div>
              </div>
            </div>
          </Area>
          <SectionLabel>Tableau</SectionLabel>
          <Row>
            {tableau.map((stack, i) => (
              <CardStack key={i}>
                {stack.map((card, cardIndex) => (
                  <div>
                    <AnimatePresence>
                      {draggedCard?.type === 'tableau' && 
                       draggedCard.index === i && 
                       draggedCard.cardIndex === cardIndex && 
                       getCardBelow('tableau', i, cardIndex) && (
                        <CardPreview
                          faceUp={getCardBelow('tableau', i, cardIndex)!.faceUp}
                          suit={getCardBelow('tableau', i, cardIndex)!.suit}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 0.5 }}
                          exit={{ opacity: 0 }}
                        >
                          {getCardBelow('tableau', i, cardIndex)!.rank}
                        </CardPreview>
                      )}
                    </AnimatePresence>
                    <Card
                      faceUp={card.faceUp}
                      suit={card.suit}
                      style={{ top: cardIndex * 20 }}
                      onClick={() => handleCardClick('tableau', i, cardIndex)}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      isSelected={isCardSelected('tableau', i, cardIndex)}
                      drag
                      dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
                      onDragStart={() => setDraggedCard({ type: 'tableau', index: i, cardIndex })}
                      onDragEnd={() => setDraggedCard(null)}
                    >
                      {card.rank}
                    </Card>
                  </div>
                ))}
              </CardStack>
            ))}
          </Row>
        </>
      ) : (
        <>
          <SectionLabel>{playerLabel}</SectionLabel>
          <SectionLabel>Tableau</SectionLabel>
          <Row>
            {tableau.map((stack, i) => (
              <CardStack key={i}>
                {stack.map((card, cardIndex) => (
                  <div>
                    <AnimatePresence>
                      {draggedCard?.type === 'tableau' && 
                       draggedCard.index === i && 
                       draggedCard.cardIndex === cardIndex && 
                       getCardBelow('tableau', i, cardIndex) && (
                        <CardPreview
                          faceUp={getCardBelow('tableau', i, cardIndex)!.faceUp}
                          suit={getCardBelow('tableau', i, cardIndex)!.suit}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 0.5 }}
                          exit={{ opacity: 0 }}
                        >
                          {getCardBelow('tableau', i, cardIndex)!.rank}
                        </CardPreview>
                      )}
                    </AnimatePresence>
                    <Card
                      faceUp={card.faceUp}
                      suit={card.suit}
                      style={{ top: cardIndex * 20 }}
                      onClick={() => handleCardClick('tableau', i, cardIndex)}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      isSelected={isCardSelected('tableau', i, cardIndex)}
                      drag
                      dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
                      onDragStart={() => setDraggedCard({ type: 'tableau', index: i, cardIndex })}
                      onDragEnd={() => setDraggedCard(null)}
                    >
                      {card.rank}
                    </Card>
                  </div>
                ))}
              </CardStack>
            ))}
          </Row>
          <Area direction="column">
            <div>
              <div style={{ marginBottom: '0.2rem' }}>Stock</div>
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
            </div>
            <div>
              <div style={{ marginBottom: '0.2rem' }}>Waste</div>
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
            </div>
          </Area>
          <SectionLabel>Foundation</SectionLabel>
          <Row>
            {foundations.map((stack, i) => (
              <CardStack key={i}>
                {stack.map((card) => (
                  <Card
                    faceUp={true}
                    suit={card.suit}
                    onClick={() => handleCardClick('foundation', i)}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    isSelected={isCardSelected('foundation', i)}
                    drag
                    dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
                    onDragStart={() => setDraggedCard({ type: 'foundation', index: i })}
                    onDragEnd={() => setDraggedCard(null)}
                  >
                    {card.rank}
                  </Card>
                ))}
              </CardStack>
            ))}
          </Row>
        </>
      )}
    </BoardContainer>
  );
};

export default PlayerBoard; 