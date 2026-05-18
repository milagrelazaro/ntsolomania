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
