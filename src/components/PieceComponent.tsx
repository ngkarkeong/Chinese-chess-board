import React from 'react';
import { Piece } from '../types';
import { PIECE_LABELS } from '../constants';

interface PieceComponentProps {
  piece: Piece;
  isSelected: boolean;
  isLastMove: boolean;
  isInCheck: boolean;
  onClick: (id: string) => void;
}

const PieceComponent: React.FC<PieceComponentProps> = ({ piece, isSelected, isLastMove, isInCheck, onClick }) => {
  const isRed = piece.color === 'r';
  
  // Base styles
  const baseClasses = "w-full h-full rounded-full flex items-center justify-center shadow-[2px_3px_5px_rgba(0,0,0,0.4)] border-2 font-serif select-none cursor-pointer relative transition-all duration-300";
  
  let colorClasses = isRed 
    ? "bg-[#f4e4bc] border-[#b92c2c] text-[#c00]" 
    : "bg-[#f4e4bc] border-[#333] text-[#111]";
  
  let ringStyle = '';
  const ringClass = isRed ? "border-[#b92c2c]/30" : "border-[#333]/30";

  // State modifiers
  if (isInCheck) {
    colorClasses = "bg-red-400 border-red-800 text-white animate-pulse";
    ringStyle = "ring-4 ring-red-600";
  } else if (isSelected) {
    ringStyle = "ring-4 ring-green-400 scale-110 z-30";
  } else if (isLastMove) {
    ringStyle = "ring-2 ring-blue-400";
  }

  return (
    <div
      onClick={(e) => {
        e.stopPropagation();
        onClick(piece.id);
      }}
      className={`absolute z-20 flex items-center justify-center p-[3px] transition-all duration-300 ${isSelected ? 'scale-110 z-30' : 'hover:scale-105'}`}
      style={{
        width: '11.11%',
        height: '10%',
        left: `${piece.c * 11.11}%`,
        top: `${piece.r * 10}%`
      }}
    >
      <div className={`${baseClasses} ${colorClasses} ${ringStyle}`}>
        <div className={`absolute inset-[2px] rounded-full border ${ringClass}`}></div>
        <span className="text-xl sm:text-2xl md:text-3xl font-bold leading-none translate-y-[-1px]">
          {PIECE_LABELS[piece.color][piece.type]}
        </span>
      </div>
    </div>
  );
};

export default PieceComponent;