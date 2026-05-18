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
    cellBorder: 'rgba(217, 119, 6, 0.5)', seed: '#F59E0B', text: '#FEF3C7', emoji: '🌾' },
  sunset: { name: 'Por do Sol', primary: '#DC2626', secondary: '#7C2D12', accent: '#FBBF24',
    bg: ['#450A0A', '#7C2D12'], boardBg: 'rgba(153, 27, 27, 0.3)', cellBg: 'rgba(127, 29, 29, 0.6)',
    cellBorder: 'rgba(220, 38, 38, 0.5)', seed: '#EF4444', text: '#FEE2E2', emoji: '🌅' },
  forest: { name: 'Floresta', primary: '#059669', secondary: '#064E3B', accent: '#34D399',
    bg: ['#022C22', '#064E3B'], boardBg: 'rgba(6, 78, 59, 0.3)', cellBg: 'rgba(6, 95, 70, 0.6)',
    cellBorder: 'rgba(5, 150, 105, 0.5)', seed: '#10B981', text: '#D1FAE5', emoji: '🌳' },
  desert: { name: 'Deserto', primary: '#CA8A04', secondary: '#713F12', accent: '#FDE047',
    bg: ['#422006', '#713F12'], boardBg: 'rgba(113, 63, 18, 0.3)', cellBg: 'rgba(161, 98, 7, 0.6)',
    cellBorder: 'rgba(202, 138, 4, 0.5)', seed: '#FACC15', text: '#FEF9C3', emoji: '🏜️' },
  ocean: { name: 'Oceano', primary: '#0284C7', secondary: '#0C4A6E', accent: '#38BDF8',
    bg: ['#082F49', '#0C4A6E'], boardBg: 'rgba(12, 74, 110, 0.3)', cellBg: 'rgba(7, 89, 133, 0.6)',
    cellBorder: 'rgba(2, 132, 199, 0.5)', seed: '#0EA5E9', text: '#E0F2FE', emoji: '🌊' },
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
