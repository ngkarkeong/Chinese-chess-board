import React from 'react';
import { Piece, Move, Position } from '../types';
import Grid from './Grid';
import PieceComponent from './PieceComponent';
import { ROWS, COLS } from '../constants';

interface BoardProps {
  pieces: Piece[];
  selectedId: string | null;
  validMoves: Move[];
  lastMove: { from: Position, to: Position } | null;
  checkPosition: Position | null;
  onPieceClick: (id: string) => void;
  onSquareClick: (r: number, c: number) => void;
}

const Board: React.FC<BoardProps> = ({ 
  pieces, selectedId, validMoves, lastMove, checkPosition, onPieceClick, onSquareClick 
}) => {
  
  // Create clickable grid layer
  const renderClickLayer = () => {
    const gridSquares = [];
    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        gridSquares.push(
          <div
            key={`${r}-${c}`}
            className="outline-none"
            style={{ width: '11.11%', height: '10%', cursor: 'pointer' }}
            onClick={() => onSquareClick(r, c)}
          />
        );
      }
    }
    return gridSquares;
  };

  return (
    <div className="board-container relative shadow-2xl rounded-lg overflow-hidden wood-texture w-full max-w-[500px] aspect-[9/10]">
      <Grid />

      {/* Pieces Layer */}
      <div className="absolute inset-0 z-20 pointer-events-none">
        {pieces.map(piece => {
            const isLast = lastMove && (
                (lastMove.from.r === piece.r && lastMove.from.c === piece.c) || 
                (lastMove.to.r === piece.r && lastMove.to.c === piece.c)
            );
            const isCheck = checkPosition && checkPosition.r === piece.r && checkPosition.c === piece.c;

            return (
                <div key={piece.id} className="pointer-events-auto contents">
                    <PieceComponent
                        piece={piece}
                        isSelected={selectedId === piece.id}
                        isLastMove={!!isLast}
                        isInCheck={!!isCheck}
                        onClick={onPieceClick}
                    />
                </div>
            )
        })}
      </div>

      {/* Indicators Layer */}
      <div className="absolute inset-0 z-20 pointer-events-none">
        {validMoves.map((m, idx) => {
          const isCapture = pieces.some(p => p.r === m.r && p.c === m.c);
          return (
            <div
              key={`move-${idx}`}
              className="absolute flex items-center justify-center pointer-events-auto cursor-pointer"
              style={{
                width: '11.11%',
                height: '10%',
                left: `${m.c * 11.11}%`,
                top: `${m.r * 10}%`
              }}
              onClick={(e) => {
                e.stopPropagation();
                onSquareClick(m.r, m.c);
              }}
            >
              {isCapture ? (
                <div className="w-full h-full border-4 border-red-500/50 rounded-full animate-pulse"></div>
              ) : (
                <div className="w-4 h-4 bg-green-500 rounded-full shadow-sm hover:scale-150 transition-transform"></div>
              )}
            </div>
          );
        })}
      </div>

      {/* Click Grid Layer */}
      <div className="absolute inset-0 z-10 flex flex-wrap content-start">
        {renderClickLayer()}
      </div>
    </div>
  );
};

export default Board;