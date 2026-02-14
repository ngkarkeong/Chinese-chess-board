export type Color = 'r' | 'b'; // Red | Black
export type PieceType = 'k' | 'a' | 'e' | 'h' | 'r' | 'c' | 'p'; // King (General), Advisor, Elephant, Horse, Rook (Chariot), Cannon, Pawn (Soldier)

export interface Position {
  r: number;
  c: number;
}

export interface Piece extends Position {
  id: string;
  type: PieceType;
  color: Color;
}

export interface Move {
  r: number;
  c: number;
}

export interface GameState {
  pieces: Piece[];
  turn: Color;
  selectedId: string | null;
  validMoves: Move[];
  lastMove: { from: Position; to: Position } | null;
  winner: string | null;
  isCheck: boolean;
}