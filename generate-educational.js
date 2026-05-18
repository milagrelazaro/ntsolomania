const fs = require('fs');

console.log('🎓 Gerando Ntxuva Educativo...\n');

// Ler o App.js atual
let app = fs.readFileSync('App.js', 'utf8');

// Configuracoes educativas para adicionar
const educationalConfig = `
// === CONFIGURACOES EDUCATIVAS ===
const BOARD_SIZES = [
  { label: 'Iniciante 4x4', cols: 4, name: 'iniciante' },
  { label: 'Classico 4x6', cols: 6, name: 'classico' },
  { label: 'Medio 4x8', cols: 8, name: 'medio' },
  { label: 'Grande 4x10', cols: 10, name: 'grande' }
];

const PIECE_TYPES = [
  { name: 'Berlindes', emoji: '🔵', color: '#3B82F6' },
  { name: 'Pedras', emoji: '🪨', color: '#78716C' },
  { name: 'Sementes', emoji: '🌰', color: '#92400E' },
  { name: 'Frutas', emoji: '🍎', color: '#DC2626' },
  { name: 'Estrelas', emoji: '⭐', color: '#FBBF24' },
  { name: 'Diamantes', emoji: '💎', color: '#06B6D4' }
];

const AI_LEVELS = [
  { name: 'Facil', icon: '👶', difficulty: 0.3, desc: 'IA comete erros' },
  { name: 'Normal', icon: '🎯', difficulty: 0.7, desc: 'IA equilibrada' },
  { name: 'Dificil', icon: '🧠', difficulty: 1.0, desc: 'IA otimizada' },
  { name: 'Professor', icon: '👨‍🏫', difficulty: 0.8, teaches: true, desc: 'IA que ensina' }
];

const ACHIEVEMENTS = [
  { id: 'first_win', name: 'Primeira Vitoria', icon: '🥉', desc: 'Ganhar o primeiro jogo' },
  { id: 'capture_master', name: 'Mestre das Capturas', icon: '🥈', desc: 'Capturar 20+ pecas numa partida', target: 20 },
  { id: 'strategist', name: 'Estrategista', icon: '🥇', desc: 'Vencer sem perder pecas' },
  { id: 'perfectionist', name: 'Perfeccionista', icon: '💎', desc: 'Vencer em menos de 20 jogadas', target: 20 },
  { id: 'dedicated', name: 'Aprendiz Dedicado', icon: '🌟', desc: 'Completar todos os tutoriais' }
];

function evaluateMoveQuality(board, idx, player) {
  const steps = calculateMoveSteps(board, idx, player);
  const finalBoard = steps[steps.length - 1].board;
  
  let score = 0;
  const opponent = player === 1 ? 2 : 1;
  
  // Capturas
  const oppBefore = countPlayerPieces(board, opponent);
  const oppAfter = countPlayerPieces(finalBoard, opponent);
  const captured = oppBefore - oppAfter;
  score += captured * 50;
  
  // Pecas proprias
  const ownAfter = countPlayerPieces(finalBoard, player);
  score += ownAfter * 2;
  
  // Controle de pontas
  const { col } = idxToRowCol(idx);
  if (col === 0 || col === COLS - 1) score += 10;
  
  // Penalidade por exposicao
  if (finalBoard[idx] > 0 && isAttackRow(idx, player)) score -= 5;
  
  return { score, captured, quality: score > 40 ? 'excelente' : score > 20 ? 'boa' : score > 0 ? 'media' : 'ruim' };
}

function getMoveAdvice(board, idx, player, quality) {
  const messages = {
    excelente: [
      '🎯 Otima jogada! Vais capturar pecas!',
      '🌟 Excelente! Esta e uma jogada estrategica!',
      '💎 Perfeito! Mantem o controle do jogo!'
    ],
    boa: [
      '👍 Boa jogada! Continua assim!',
      '✨ Bem pensado! Estas no caminho certo!',
      '🎮 Jogada solida! Mantem a estrategia!'
    ],
    media: [
      '🤔 Jogada aceitavel, mas podes fazer melhor',
      '💡 Tenta procurar jogadas que capturem pecas',
      '📚 Lembra-te: controlar as pontas e importante'
    ],
    ruim: [
      '⚠️ Cuidado! Esta jogada pode ser arriscada',
      '🚨 Atencao! Podes estar a expor as tuas pecas',
      '💭 Pensa melhor! Ha opcoes mais seguras'
    ]
  };
  
  const list = messages[quality] || messages.media;
  return list[Math.floor(Math.random() * list.length)];
}
`;

// Inserir as configuracoes educativas apos os imports
const importEnd = app.indexOf('const COLS=6,ROWS=4');
if (importEnd > 0) {
  const beforeConst = app.slice(0, importEnd);
  const afterConst = app.slice(importEnd);
  app = beforeConst + educationalConfig + '\n' + afterConst;
  console.log('✅ Configuracoes educativas adicionadas');
} else {
  console.log('❌ Erro: Nao encontrou ponto de insercao');
  console.log('Procurando por: const COLS=6,ROWS=4');
  process.exit(1);
}

// Salvar o arquivo educativo
fs.writeFileSync('App.educational.js', app);
console.log('✅ App.educational.js criado com sucesso!');
console.log('📦 Tamanho:', app.length, 'caracteres');
console.log('\n🎓 Funcionalidades adicionadas:');
console.log('  - 4 tamanhos de tabuleiro (4x4, 4x6, 4x8, 4x10)');
console.log('  - 6 tipos de pecas (Berlindes, Pedras, Sementes, Frutas, Estrelas, Diamantes)');
console.log('  - 4 niveis de IA (Facil, Normal, Dificil, Professor)');
console.log('  - Sistema de conquistas (5 conquistas)');
console.log('  - Analise de jogadas com dicas');
console.log('\n📝 Proximo passo: Copiar App.educational.js para App.js');
