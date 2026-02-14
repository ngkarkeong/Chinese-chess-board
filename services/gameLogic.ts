import { Piece, Move, Color, PieceType } from '../types';
import { ROWS, COLS } from '../constants';

// --- Helpers ---
const isValidPos = (r: number, c: number) => r >= 0 && r < ROWS && c >= 0 && c < COLS;
const getPieceAt = (board: Piece[], r: number, c: number) => board.find(p => p.r === r && p.c === c);
const findPiece = (board: Piece[], type: PieceType, color: Color) => board.find(p => p.type === type && p.color === color);

// --- Raw Move Generation (Physics only, no check validation) ---
const getRawMoves = (piece: Piece, board: Piece[]): Move[] => {
  const moves: Move[] = [];
  const { r, c, type, color } = piece;

  const addMoveIfValid = (tr: number, tc: number): boolean => {
    if (!isValidPos(tr, tc)) return false;
    const target = getPieceAt(board, tr, tc);
    if (!target) {
      moves.push({ r: tr, c: tc });
      return true; // Continue sliding
    } else if (target.color !== color) {
      moves.push({ r: tr, c: tc });
      return false; // Stop sliding (capture)
    }
    return false; // Stop sliding (block)
  };

  if (type === 'k') { // King / General
    const drs = [-1, 1, 0, 0];
    const dcs = [0, 0, -1, 1];
    for (let i = 0; i < 4; i++) {
      const nr = r + drs[i];
      const nc = c + dcs[i];
      // Palace bounds: cols 3-5. Red rows 7-9, Black rows 0-2
      const inPalace = (nc >= 3 && nc <= 5) && ((color === 'r' ? nr >= 7 : nr <= 2));
      if (inPalace) addMoveIfValid(nr, nc);
    }
  } else if (type === 'a') { // Advisor
    const drs = [-1, -1, 1, 1];
    const dcs = [-1, 1, -1, 1];
    for (let i = 0; i < 4; i++) {
      const nr = r + drs[i];
      const nc = c + dcs[i];
      const inPalace = (nc >= 3 && nc <= 5) && ((color === 'r' ? nr >= 7 : nr <= 2));
      if (inPalace) addMoveIfValid(nr, nc);
    }
  } else if (type === 'e') { // Elephant
    const drs = [-2, -2, 2, 2];
    const dcs = [-2, 2, -2, 2];
    const eyes = [[-1, -1], [-1, 1], [1, -1], [1, 1]];
    for (let i = 0; i < 4; i++) {
      const nr = r + drs[i];
      const nc = c + dcs[i];
      // Cannot cross river: Red rows >=5, Black rows <=4
      const correctSide = (color === 'r' ? nr >= 5 : nr <= 4);
      if (isValidPos(nr, nc) && correctSide) {
        const eyeR = r + eyes[i][0];
        const eyeC = c + eyes[i][1];
        if (!getPieceAt(board, eyeR, eyeC)) addMoveIfValid(nr, nc);
      }
    }
  } else if (type === 'h') { // Horse
    const movesL = [
      { dr: -2, dc: -1, leg: { dr: -1, dc: 0 } }, { dr: -2, dc: 1, leg: { dr: -1, dc: 0 } },
      { dr: 2, dc: -1, leg: { dr: 1, dc: 0 } }, { dr: 2, dc: 1, leg: { dr: 1, dc: 0 } },
      { dr: -1, dc: -2, leg: { dr: 0, dc: -1 } }, { dr: 1, dc: -2, leg: { dr: 0, dc: -1 } },
      { dr: -1, dc: 2, leg: { dr: 0, dc: 1 } }, { dr: 1, dc: 2, leg: { dr: 0, dc: 1 } },
    ];
    movesL.forEach(m => {
      const nr = r + m.dr;
      const nc = c + m.dc;
      const legR = r + m.leg.dr;
      const legC = c + m.leg.dc;
      if (isValidPos(nr, nc) && !getPieceAt(board, legR, legC)) addMoveIfValid(nr, nc);
    });
  } else if (type === 'r') { // Rook / Chariot
    const dirs = [[-1, 0], [1, 0], [0, -1], [0, 1]];
    dirs.forEach(([dr, dc]) => {
      let curR = r + dr;
      let curC = c + dc;
      while (isValidPos(curR, curC)) {
        if (!addMoveIfValid(curR, curC)) break;
        curR += dr;
        curC += dc;
      }
    });
  } else if (type === 'c') { // Cannon
    const dirs = [[-1, 0], [1, 0], [0, -1], [0, 1]];
    dirs.forEach(([dr, dc]) => {
      let curR = r + dr;
      let curC = c + dc;
      let jumpCount = 0;
      while (isValidPos(curR, curC)) {
        const target = getPieceAt(board, curR, curC);
        if (!target) {
          if (jumpCount === 0) moves.push({ r: curR, c: curC });
        } else {
          jumpCount++;
          if (jumpCount === 2) {
            if (target.color !== color) moves.push({ r: curR, c: curC });
            break;
          }
        }
        curR += dr;
        curC += dc;
      }
    });
  } else if (type === 'p') { // Pawn / Soldier
    const forward = color === 'r' ? -1 : 1;
    // Crossed river? Red crosses if r <= 4. Black crosses if r >= 5.
    const crossedRiver = color === 'r' ? r <= 4 : r >= 5;
    addMoveIfValid(r + forward, c);
    if (crossedRiver) {
      addMoveIfValid(r, c - 1);
      addMoveIfValid(r, c + 1);
    }
  }

  return moves;
};

// --- Safety Checks (Check, Flying General) ---

const isSquareAttacked = (board: Piece[], tr: number, tc: number, attackerColor: Color): boolean => {
  const attackers = board.filter(p => p.color === attackerColor);
  for (const piece of attackers) {
    const moves = getRawMoves(piece, board);
    if (moves.some(m => m.r === tr && m.c === tc)) return true;
  }
  return false;
};

const isGeneralFlying = (board: Piece[]): boolean => {
  const redKing = findPiece(board, 'k', 'r');
  const blackKing = findPiece(board, 'k', 'b');
  if (!redKing || !blackKing || redKing.c !== blackKing.c) return false;

  for (let r = Math.min(redKing.r, blackKing.r) + 1; r < Math.max(redKing.r, blackKing.r); r++) {
    if (getPieceAt(board, r, redKing.c)) return false; // Blocked
  }
  return true; // Generals facing each other
};

export const isBoardSafe = (board: Piece[], playerColor: Color): boolean => {
  const king = findPiece(board, 'k', playerColor);
  if (!king) return false; // Should not happen

  if (isGeneralFlying(board)) return false;

  const attackerColor = playerColor === 'r' ? 'b' : 'r';
  if (isSquareAttacked(board, king.r, king.c, attackerColor)) return false;

  return true;
};

// --- Public Interface ---

export const getFilteredValidMoves = (piece: Piece, board: Piece[]): Move[] => {
  const rawMoves = getRawMoves(piece, board);
  return rawMoves.filter(move => {
    // Simulate move
    const tempBoard = board.map(p => ({ ...p })); // Deep copy structure (simple obj)
    const movingPiece = tempBoard.find(p => p.id === piece.id)!;
    
    // Remove captured
    const capturedIdx = tempBoard.findIndex(p => p.r === move.r && p.c === move.c);
    if (capturedIdx !== -1) tempBoard.splice(capturedIdx, 1);

    movingPiece.r = move.r;
    movingPiece.c = move.c;

    return isBoardSafe(tempBoard, piece.color);
  });
};

export const checkForWin = (board: Piece[], nextTurn: Color): { isCheck: boolean, isMate: boolean, isStale: boolean } => {
  const isCheck = !isBoardSafe(board, nextTurn);
  
  const hasValidMoves = board
    .filter(p => p.color === nextTurn)
    .some(p => getFilteredValidMoves(p, board).length > 0);

  return {
    isCheck,
    isMate: isCheck && !hasValidMoves,
    isStale: !isCheck && !hasValidMoves
  };
};