import React, { useState, useEffect } from 'react';
import Board from './components/Board';
import { getInitialSetup } from './constants';
import { Piece, Color, Move, Position } from './types';
import { getFilteredValidMoves, checkForWin, isBoardSafe } from './services/gameLogic';
import { Info, RotateCcw, X } from 'lucide-react';

const App: React.FC = () => {
  const [pieces, setPieces] = useState<Piece[]>(getInitialSetup());
  const [turn, setTurn] = useState<Color>('r');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [validMoves, setValidMoves] = useState<Move[]>([]);
  const [lastMove, setLastMove] = useState<{ from: Position; to: Position } | null>(null);
  const [winner, setWinner] = useState<string | null>(null);
  const [showRules, setShowRules] = useState(false);
  const [checkPosition, setCheckPosition] = useState<Position | null>(null);

  // Logic to determine check status
  useEffect(() => {
    // Is the current player in check?
    if (!isBoardSafe(pieces, turn)) {
        const king = pieces.find(p => p.type === 'k' && p.color === turn);
        if (king) setCheckPosition({ r: king.r, c: king.c });
    } else {
        setCheckPosition(null);
    }
  }, [pieces, turn]);

  const handleReset = () => {
    setPieces(getInitialSetup());
    setTurn('r');
    setSelectedId(null);
    setValidMoves([]);
    setLastMove(null);
    setWinner(null);
    setCheckPosition(null);
  };

  const handlePieceClick = (id: string) => {
    if (winner) return;
    const piece = pieces.find(p => p.id === id);
    if (!piece) return;

    // Capture logic: if clicking opponent's piece and it's a valid move
    if (piece.color !== turn) {
      if (selectedId && validMoves.some(m => m.r === piece.r && m.c === piece.c)) {
        executeMove(piece.r, piece.c);
      }
      return;
    }

    // Select/Deselect Logic
    if (selectedId === id) {
      setSelectedId(null);
      setValidMoves([]);
    } else {
      setSelectedId(id);
      setValidMoves(getFilteredValidMoves(piece, pieces));
    }
  };

  const handleSquareClick = (r: number, c: number) => {
    if (winner || !selectedId) return;
    
    // Validate if clicked square is a valid move
    if (validMoves.some(m => m.r === r && m.c === c)) {
      executeMove(r, c);
    } else {
        // If clicking empty space invalidly, deselect
        setSelectedId(null);
        setValidMoves([]);
    }
  };

  const executeMove = (targetR: number, targetC: number) => {
    if (!selectedId) return;
    const movingPiece = pieces.find(p => p.id === selectedId);
    if (!movingPiece) return;

    // Check capture
    const targetPiece = pieces.find(p => p.r === targetR && p.c === targetC);
    
    // Update Pieces
    const nextPieces = pieces
      .filter(p => p.id !== movingPiece.id && p.id !== targetPiece?.id) // Remove moved piece old pos and captured piece
      .concat([{ ...movingPiece, r: targetR, c: targetC }]); // Add moved piece new pos

    setPieces(nextPieces);
    setLastMove({ from: { r: movingPiece.r, c: movingPiece.c }, to: { r: targetR, c: targetC } });
    
    // Immediate win if King captured (rare, usually checkmate logic handles it, but safety net)
    if (targetPiece?.type === 'k') {
      setWinner(`${turn === 'r' ? 'Red' : 'Black'} Wins!`);
      return;
    }

    // Prepare next turn
    const nextTurn = turn === 'r' ? 'b' : 'r';
    setTurn(nextTurn);
    setSelectedId(null);
    setValidMoves([]);

    // Check for Win/Stalemate
    const { isMate, isStale } = checkForWin(nextPieces, nextTurn);
    if (isMate) {
        setWinner(`${turn === 'r' ? 'Red' : 'Black'} Wins! (Checkmate)`);
    } else if (isStale) {
        setWinner(`Draw! (Stalemate)`);
    }
  };

  return (
    <div className="bg-stone-100 min-h-screen flex flex-col items-center justify-center p-4 font-sans select-none">
      {/* Header */}
      <div className="w-full max-w-[600px] flex items-center justify-between mb-4 bg-white p-4 rounded-xl shadow-md z-10">
        <div className="flex items-center gap-4">
          <div className={`px-4 py-2 rounded-lg font-bold text-lg transition-colors border ${turn === 'r' ? 'bg-red-100 text-red-600 border-red-200' : 'text-gray-400 border-transparent'}`}>
            Red Turn
          </div>
          <div className={`px-4 py-2 rounded-lg font-bold text-lg transition-colors border ${turn === 'b' ? 'bg-gray-800 text-white border-gray-600' : 'text-gray-400 border-transparent'}`}>
            Black Turn
          </div>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setShowRules(true)} className="p-2 text-gray-600 hover:bg-gray-100 rounded-full" title="Rules">
            <Info size={24} />
          </button>
          <button onClick={handleReset} className="p-2 text-gray-600 hover:bg-gray-100 rounded-full" title="Reset Game">
            <RotateCcw size={24} />
          </button>
        </div>
      </div>

      {/* Check Message */}
      <div className={`w-full max-w-[500px] text-center mb-2 text-xl font-extrabold text-yellow-600 transition-opacity duration-300 bg-yellow-100 p-2 rounded-lg border border-yellow-300 shadow-inner ${checkPosition && !winner ? 'opacity-100' : 'opacity-0 hidden'}`}>
        {turn === 'r' ? 'Red' : 'Black'} is in CHECK!
      </div>

      {/* Board */}
      <Board 
        pieces={pieces}
        selectedId={selectedId}
        validMoves={validMoves}
        lastMove={lastMove}
        checkPosition={checkPosition}
        onPieceClick={handlePieceClick}
        onSquareClick={handleSquareClick}
      />

      <p className="mt-4 text-stone-500 text-sm italic">
        Tip: Red moves first. Click a piece to see valid moves.
      </p>

      {/* Winner Modal */}
      {winner && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white p-8 rounded-2xl shadow-2xl text-center">
            <h2 className="text-4xl font-bold mb-4 text-gray-800">{winner}</h2>
            <button onClick={handleReset} className="px-6 py-3 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition-colors shadow-lg">
              Play Again
            </button>
          </div>
        </div>
      )}

      {/* Rules Modal */}
      {showRules && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto relative">
            <button onClick={() => setShowRules(false)} className="absolute top-4 right-4 text-gray-500 hover:text-black">
              <X size={24} />
            </button>
            <div className="p-6">
              <h3 className="text-2xl font-bold mb-4 text-gray-800">How to Play Xiangqi</h3>
              <div className="space-y-4 text-gray-600 text-sm leading-relaxed">
                <p><strong>Goal:</strong> Capture the enemy General (King).</p>
                <ul className="list-disc pl-5 space-y-2">
                  <li><strong>General (King):</strong> Moves 1 step orthogonally within the Palace. <em>Cannot face opposing General directly.</em></li>
                  <li><strong>Advisor:</strong> Moves 1 step diagonally within the Palace.</li>
                  <li><strong>Elephant:</strong> Moves 2 steps diagonally. Cannot cross the river. Blocked by "eye".</li>
                  <li><strong>Horse:</strong> Moves one forward/back/side, then one diagonal (L-shape). Can be blocked.</li>
                  <li><strong>Chariot (Rook):</strong> Moves any distance orthogonally.</li>
                  <li><strong>Cannon:</strong> Moves like a Chariot, needs to jump 1 piece to capture.</li>
                  <li><strong>Soldier:</strong> Moves forward 1 step. After river, can also move sideways.</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;