import { Piece, PieceType, Color } from './types';

export const ROWS = 10;
export const COLS = 9;

export const PIECE_LABELS: Record<Color, Record<PieceType, string>> = {
  r: { k: '帥', a: '仕', e: '相', h: '馬', r: '車', c: '炮', p: '兵' },
  b: { k: '將', a: '士', e: '象', h: '馬', r: '車', c: '炮', p: '卒' }
};

const generateId = () => Math.random().toString(36).substr(2, 9);

export const getInitialSetup = (): Piece[] => {
  const setup: Omit<Piece, 'id'>[] = [
    // Black Pieces
    { r: 0, c: 0, type: 'r', color: 'b' }, { r: 0, c: 1, type: 'h', color: 'b' }, { r: 0, c: 2, type: 'e', color: 'b' }, { r: 0, c: 3, type: 'a', color: 'b' }, { r: 0, c: 4, type: 'k', color: 'b' }, { r: 0, c: 5, type: 'a', color: 'b' }, { r: 0, c: 6, type: 'e', color: 'b' }, { r: 0, c: 7, type: 'h', color: 'b' }, { r: 0, c: 8, type: 'r', color: 'b' },
    { r: 2, c: 1, type: 'c', color: 'b' }, { r: 2, c: 7, type: 'c', color: 'b' },
    { r: 3, c: 0, type: 'p', color: 'b' }, { r: 3, c: 2, type: 'p', color: 'b' }, { r: 3, c: 4, type: 'p', color: 'b' }, { r: 3, c: 6, type: 'p', color: 'b' }, { r: 3, c: 8, type: 'p', color: 'b' },
    
    // Red Pieces
    { r: 9, c: 0, type: 'r', color: 'r' }, { r: 9, c: 1, type: 'h', color: 'r' }, { r: 9, c: 2, type: 'e', color: 'r' }, { r: 9, c: 3, type: 'a', color: 'r' }, { r: 9, c: 4, type: 'k', color: 'r' }, { r: 9, c: 5, type: 'a', color: 'r' }, { r: 9, c: 6, type: 'e', color: 'r' }, { r: 9, c: 7, type: 'h', color: 'r' }, { r: 9, c: 8, type: 'r', color: 'r' },
    { r: 7, c: 1, type: 'c', color: 'r' }, { r: 7, c: 7, type: 'c', color: 'r' },
    { r: 6, c: 0, type: 'p', color: 'r' }, { r: 6, c: 2, type: 'p', color: 'r' }, { r: 6, c: 4, type: 'p', color: 'r' }, { r: 6, c: 6, type: 'p', color: 'r' }, { r: 6, c: 8, type: 'p', color: 'r' },
  ];
  return setup.map(p => ({ ...p, id: generateId() }));
};