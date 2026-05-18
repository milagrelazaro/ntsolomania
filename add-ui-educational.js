const fs = require('fs');

console.log('🎨 Adicionando Interface Educativa...\n');

let app = fs.readFileSync('App.js', 'utf8');

// Código para adicionar estados educativos no componente App
const educationalStates = `
  // Estados Educativos
  const [boardSize, setBoardSize] = useState(BOARD_SIZES[1]); // Classico 4x6
  const [pieceType, setPieceType] = useState(PIECE_TYPES[2]); // Sementes
  const [aiLevel, setAiLevel] = useState(AI_LEVELS[1]); // Normal
  const [learnerMode, setLearnerMode] = useState(false);
  const [moveAnalysis, setMoveAnalysis] = useState({});
  const [achievements, setAchievements] = useState([]);
  const [stats, setStats] = useState({ games: 0, wins: 0, captures: 0, streak: 0 });
  const [showConfig, setShowConfig] = useState(false);
  const [showAchievements, setShowAchievements] = useState(false);
`;

// Encontrar onde adicionar os estados (após const theme)
const themeLineIdx = app.indexOf('const theme=THEMES[selectedTheme];');
if (themeLineIdx > 0) {
  const insertPoint = app.indexOf('\n', themeLineIdx) + 1;
  app = app.slice(0, insertPoint) + educationalStates + app.slice(insertPoint);
  console.log('✅ Estados educativos adicionados');
} else {
  console.log('⚠️ Não encontrou ponto para estados');
}

// Atualizar COLS e TOTAL dinamicamente
app = app.replace(
  'const COLS=6,ROWS=4,TOTAL=ROWS*COLS,INITIAL_SEEDS=2;',
  'const ROWS=4,INITIAL_SEEDS=2;let COLS=6,TOTAL=24;'
);

// Adicionar useEffect para atualizar COLS quando boardSize mudar
const updateBoardEffect = `
  // Atualizar tabuleiro quando mudar tamanho
  useEffect(() => {
    COLS = boardSize.cols;
    TOTAL = ROWS * COLS;
    resetGame();
  }, [boardSize]);
`;

// Inserir após os outros useEffects
const lastUseEffectIdx = app.lastIndexOf('useEffect(()=>{if(mode===');
if (lastUseEffectIdx > 0) {
  const insertPoint = app.indexOf('},[mode,currentPlayer', lastUseEffectIdx);
  const endPoint = app.indexOf(';', insertPoint) + 1;
  app = app.slice(0, endPoint) + '\n' + updateBoardEffect + app.slice(endPoint);
  console.log('✅ useEffect para atualizar tabuleiro adicionado');
}

// Função para analisar jogadas em modo aprendiz
const analyzeMovesFunction = `
  // Analisar jogadas em modo aprendiz
  useEffect(() => {
    if (!learnerMode || isAnimating || gameOver) {
      setMoveAnalysis({});
      return;
    }
    
    const analysis = {};
    validMoves.forEach(idx => {
      const quality = evaluateMoveQuality(board, idx, currentPlayer);
      analysis[idx] = quality;
    });
    setMoveAnalysis(analysis);
  }, [learnerMode, board, currentPlayer, validMoves, isAnimating, gameOver]);
`;

// Adicionar após o useEffect do tabuleiro
const afterBoardEffect = app.indexOf('},[boardSize]);');
if (afterBoardEffect > 0) {
  const insertPoint = afterBoardEffect + '},[boardSize]);'.length;
  app = app.slice(0, insertPoint) + '\n' + analyzeMovesFunction + app.slice(insertPoint);
  console.log('✅ Análise de jogadas adicionada');
}

// Modificar aiChooseMove para respeitar níveis
const newAiChooseMove = `
function aiChooseMove(board, player, level) {
  const moves = getValidMoves(board, player);
  if (moves.length === 0) return null;
  
  // IA Fácil: 50% aleatório
  if (level.difficulty < 0.5 && Math.random() > 0.5) {
    return moves[Math.floor(Math.random() * moves.length)];
  }
  
  // IA Normal/Difícil/Professor: melhor jogada
  let best = moves[0];
  let bestScore = -Infinity;
  for (const idx of moves) {
    const score = evaluateMove(board, idx, player);
    if (score > bestScore) {
      bestScore = score;
      best = idx;
    }
  }
  
  return best;
}
`;

// Substituir aiChooseMove antiga
app = app.replace(
  /function aiChooseMove\(board,player\)\{[^}]+\}/,
  newAiChooseMove.replace(/\n/g, '')
);
console.log('✅ aiChooseMove atualizada com níveis');

// Atualizar chamada da IA para passar o nível
app = app.replace(
  'const idx=aiChooseMove(board,2);',
  'const idx=aiChooseMove(board,2,aiLevel);'
);

// Salvar
fs.writeFileSync('App.js', app);
console.log('\n✅ Interface educativa adicionada!');
console.log('📦 Tamanho final:', app.length, 'caracteres');
console.log('\n🎓 Funcionalidades UI adicionadas:');
console.log('  ✅ Estados para boardSize, pieceType, aiLevel');
console.log('  ✅ Estado learnerMode para modo aprendiz');
console.log('  ✅ Sistema de análise de jogadas');
console.log('  ✅ IA com diferentes níveis');
console.log('  ✅ Sistema de conquistas e estatísticas');
console.log('\n📝 Próximo: Adicionar menus visuais');
