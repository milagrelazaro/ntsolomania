import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  StyleSheet, View, Text, TouchableOpacity, SafeAreaView, Modal,
  ScrollView, Dimensions, StatusBar, Animated, Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

const COLS = 6;
const ROWS = 4;
const TOTAL = ROWS * COLS;
const INITIAL_SEEDS = 2;
const IDX = { P2_DEF: 0, P2_ATK: 1, P1_ATK: 2, P1_DEF: 3 };

const THEMES = {
  savanna: { name: 'Savana', primary: '#D97706', secondary: '#92400E', accent: '#FCD34D',
    bg: ['#1C0F05', '#2D1810'], boardBg: 'rgba(139, 69, 19, 0.3)', cellBg: 'rgba(101, 67, 33, 0.6)',
    cellBorder: 'rgba(217, 119, 6, 0.5)', seed: '#F59E0B', text: '#FEF3C7', emoji: 'ðŸŒ¾' },
  sunset: { name: 'Por do Sol', primary: '#DC2626', secondary: '#7C2D12', accent: '#FBBF24',
    bg: ['#450A0A', '#7C2D12'], boardBg: 'rgba(153, 27, 27, 0.3)', cellBg: 'rgba(127, 29, 29, 0.6)',
    cellBorder: 'rgba(220, 38, 38, 0.5)', seed: '#EF4444', text: '#FEE2E2', emoji: 'ðŸŒ…' },
  forest: { name: 'Floresta', primary: '#059669', secondary: '#064E3B', accent: '#34D399',
    bg: ['#022C22', '#064E3B'], boardBg: 'rgba(6, 78, 59, 0.3)', cellBg: 'rgba(6, 95, 70, 0.6)',
    cellBorder: 'rgba(5, 150, 105, 0.5)', seed: '#10B981', text: '#D1FAE5', emoji: 'ðŸŒ³' },
  desert: { name: 'Deserto', primary: '#CA8A04', secondary: '#713F12', accent: '#FDE047',
    bg: ['#422006', '#713F12'], boardBg: 'rgba(113, 63, 18, 0.3)', cellBg: 'rgba(161, 98, 7, 0.6)',
    cellBorder: 'rgba(202, 138, 4, 0.5)', seed: '#FACC15', text: '#FEF9C3', emoji: 'ðŸœï¸' },
  ocean: { name: 'Oceano', primary: '#0284C7', secondary: '#0C4A6E', accent: '#38BDF8',
    bg: ['#082F49', '#0C4A6E'], boardBg: 'rgba(12, 74, 110, 0.3)', cellBg: 'rgba(7, 89, 133, 0.6)',
    cellBorder: 'rgba(2, 132, 199, 0.5)', seed: '#0EA5E9', text: '#E0F2FE', emoji: 'ðŸŒŠ' },
};

function idxToRowCol(idx) { return { row: Math.floor(idx / COLS), col: idx % COLS }; }
function rowColToIdx(row, col) { return row * COLS + col; }

function nextIndex(idx, player) {
  const { row, col } = idxToRowCol(idx);
  if (player === 1) {
    if (row === IDX.P1_DEF) return col < COLS - 1 ? rowColToIdx(row, col + 1) : rowColToIdx(IDX.P1_ATK, COLS - 1);
    if (row === IDX.P1_ATK) return col > 0 ? rowColToIdx(row, col - 1) : rowColToIdx(IDX.P1_DEF, 0);
  } else {
    if (row === IDX.P2_ATK) return col < COLS - 1 ? rowColToIdx(row, col + 1) : rowColToIdx(IDX.P2_DEF, COLS - 1);
    if (row === IDX.P2_DEF) return col > 0 ? rowColToIdx(row, col - 1) : rowColToIdx(IDX.P2_ATK, 0);
  }
  return idx;
}

function isPlayerSide(idx, player) {
  const { row } = idxToRowCol(idx);
  return player === 1 ? (row === IDX.P1_ATK || row === IDX.P1_DEF) : (row === IDX.P2_ATK || row === IDX.P2_DEF);
}

function isAttackRow(idx, player) {
  const { row } = idxToRowCol(idx);
  return player === 1 ? row === IDX.P1_ATK : row === IDX.P2_ATK;
}

function opponentAttackHouse(idx, player) {
  const { col } = idxToRowCol(idx);
  return player === 1 ? rowColToIdx(IDX.P2_ATK, col) : rowColToIdx(IDX.P1_ATK, col);
}

function opponentDefenseHouse(idx, player) {
  const { col } = idxToRowCol(idx);
  return player === 1 ? rowColToIdx(IDX.P2_DEF, col) : rowColToIdx(IDX.P1_DEF, col);
}

function createInitialBoard() { return Array(TOTAL).fill(INITIAL_SEEDS); }

function getPlayerIndices(player) {
  const res = [];
  for (let i = 0; i < TOTAL; i++) if (isPlayerSide(i, player)) res.push(i);
  return res;
}

function countPlayerPieces(board, player) {
  return getPlayerIndices(player).reduce((sum, idx) => sum + board[idx], 0);
}

function isPhaseTwo(board) { return board.every((c) => c <= 1); }

function getValidMoves(board, player) {
  const moves = [];
  const indices = getPlayerIndices(player);
  const phase2 = isPhaseTwo(board);
  for (const idx of indices) {
    if (board[idx] === 0) continue;
    if (phase2) { if (board[idx] === 1) moves.push(idx); } else { moves.push(idx); }
  }
  return moves;
}
function calculateMoveSteps(board, idx, player) {
  const steps = [];
  let b = [...board];
  let seeds = b[idx];
  b[idx] = 0;
  let current = idx;
  steps.push({ type: 'pickup', idx, count: seeds });

  while (seeds > 0) {
    current = nextIndex(current, player);
    b[current] += 1;
    seeds -= 1;
    steps.push({ type: 'drop', idx: current, board: [...b] });
  }

  if (b[current] === 1 && isAttackRow(current, player)) {
    const oppAtk = opponentAttackHouse(current, player);
    const oppDef = opponentDefenseHouse(current, player);
    if (b[oppAtk] > 0) {
      let totalCaptured = b[oppAtk] + b[oppDef];
      steps.push({ type: 'capture', idx: current, oppAtk, oppDef, count: totalCaptured });
      b[oppAtk] = 0;
      b[oppDef] = 0;
      b[current] = 0;
      let toRedistribute = 1 + totalCaptured;
      let redistCurrent = current;
      while (toRedistribute > 0) {
        redistCurrent = nextIndex(redistCurrent, player);
        b[redistCurrent] += 1;
        toRedistribute -= 1;
        steps.push({ type: 'drop', idx: redistCurrent, board: [...b] });
      }

      let safety = 0;
      while (safety < 10) {
        if (b[redistCurrent] === 1 && isAttackRow(redistCurrent, player)) {
          const oppAtk2 = opponentAttackHouse(redistCurrent, player);
          const oppDef2 = opponentDefenseHouse(redistCurrent, player);
          if (b[oppAtk2] > 0) {
            let totalCaptured2 = b[oppAtk2] + b[oppDef2];
            steps.push({ type: 'capture', idx: redistCurrent, oppAtk: oppAtk2, oppDef: oppDef2, count: totalCaptured2 });
            b[oppAtk2] = 0;
            b[oppDef2] = 0;
            b[redistCurrent] = 0;
            let toRedistribute2 = 1 + totalCaptured2;
            while (toRedistribute2 > 0) {
              redistCurrent = nextIndex(redistCurrent, player);
              b[redistCurrent] += 1;
              toRedistribute2 -= 1;
              steps.push({ type: 'drop', idx: redistCurrent, board: [...b] });
            }
            safety++;
            continue;
          }
        }
        break;
      }
    }
  }

  steps.push({ type: 'complete', board: b });
  return steps;
}

function checkGameOver(board, currentPlayer) {
  const p1Total = countPlayerPieces(board, 1);
  const p2Total = countPlayerPieces(board, 2);
  if (p1Total === 0) return { over: true, winner: 2, reason: 'Jogador 1 sem pecas' };
  if (p2Total === 0) return { over: true, winner: 1, reason: 'Jogador 2 sem pecas' };
  const moves = getValidMoves(board, currentPlayer);
  if (moves.length === 0) {
    const opponent = currentPlayer === 1 ? 2 : 1;
    return { over: true, winner: opponent, reason: `Jogador ${currentPlayer} sem jogadas validas` };
  }
  return { over: false };
}

function evaluateMove(board, idx, player) {
  const steps = calculateMoveSteps(board, idx, player);
  const finalBoard = steps[steps.length - 1].board;
  let score = 0;
  const opponent = player === 1 ? 2 : 1;
  const oppBefore = countPlayerPieces(board, opponent);
  const oppAfter = countPlayerPieces(finalBoard, opponent);
  score += (oppBefore - oppAfter) * 50;
  const ownAfter = countPlayerPieces(finalBoard, player);
  score += ownAfter * 2;
  return score;
}

function aiChooseMove(board, player) {
  const moves = getValidMoves(board, player);
  if (moves.length === 0) return null;
  let best = moves[0];
  let bestScore = -Infinity;
  for (const idx of moves) {
    const score = evaluateMove(board, idx, player);
    if (score > bestScore) { bestScore = score; best = idx; }
  }
  return best;
}

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get('window');
const CELL_SIZE = Math.min((SCREEN_W - 24) / COLS - 6, Math.max(68, (SCREEN_H - 240) / ROWS - 8));
