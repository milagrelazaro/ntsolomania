const fs = require('fs');

console.log('🔧 Adicionando funcionalidades educativas (versão segura)...\n');

let app = fs.readFileSync('App.js', 'utf8');

// 1. Adicionar configurações educativas após as THEMES (linha 8)
const themesEnd = app.indexOf('},ocean:');
const insertPoint = app.indexOf('}', themesEnd) + 2;
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

function evaluateMoveQuality(board, idx, player) {
  const steps = calculateMoveSteps(board, idx, player);
  const finalBoard = steps[steps.length - 1].board;
  
  let score = 0;
  const opponent = player === 1 ? 2 : 1;
  
  const oppBefore = countPlayerPieces(board, opponent);
  const oppAfter = countPlayerPieces(finalBoard, opponent);
  const captured = oppBefore - oppAfter;
  score += captured * 50;
  
  const ownAfter = countPlayerPieces(finalBoard, player);
  score += ownAfter * 2;
  
  const { col } = idxToRowCol(idx);
  if (col === 0 || col === COLS - 1) score += 10;
  
  if (finalBoard[idx] > 0 && isAttackRow(idx, player)) score -= 5;
  
  return { score, captured, quality: score > 40 ? 'excelente' : score > 20 ? 'boa' : score > 0 ? 'media' : 'ruim' };
}

function getMoveAdvice(quality) {
  const messages = {
    excelente: ['🎯 Otima jogada!', '🌟 Excelente!', '💎 Perfeito!'],
    boa: ['👍 Boa jogada!', '✨ Bem pensado!', '🎮 Jogada solida!'],
    media: ['🤔 Aceitavel', '💡 Podes fazer melhor', '📚 Melhora a estrategia'],
    ruim: ['⚠️ Cuidado!', '🚨 Arriscado!', '💭 Pensa melhor!']
  };
  const list = messages[quality] || messages.media;
  return list[Math.floor(Math.random() * list.length)];
}
`;

app = app.slice(0, insertPoint) + educationalConfig + '\n' + app.slice(insertPoint);
console.log('✅ Configuracoes educativas adicionadas');

// 2. Modificar aiChooseMove para usar níveis
const oldAi = 'function aiChooseMove(board,player){const moves=getValidMoves(board,player);if(moves.length===0)return null;let best=moves[0],bestScore=-Infinity;for(const idx of moves){const score=evaluateMove(board,idx,player);if(score>bestScore){bestScore=score;best=idx}}return best}';
const newAi = 'function aiChooseMove(board,player,level){const moves=getValidMoves(board,player);if(moves.length===0)return null;if(level&&level.difficulty<0.5&&Math.random()>0.5)return moves[Math.floor(Math.random()*moves.length)];let best=moves[0],bestScore=-Infinity;for(const idx of moves){const score=evaluateMove(board,idx,player);if(score>bestScore){bestScore=score;best=idx}}return best}';
app = app.replace(oldAi, newAi);
console.log('✅ aiChooseMove atualizada');

// 3. Adicionar estados educativos no componente App
const themeLine = 'const theme=THEMES[selectedTheme];';
const educationalStates = `
  const [boardSize,setBoardSize]=useState(BOARD_SIZES[1]);
  const [pieceType,setPieceType]=useState(PIECE_TYPES[2]);
  const [aiLevel,setAiLevel]=useState(AI_LEVELS[1]);
  const [learnerMode,setLearnerMode]=useState(false);
  const [moveAnalysis,setMoveAnalysis]=useState({});
  const [showConfig,setShowConfig]=useState(false);
`;
app = app.replace(themeLine, themeLine + educationalStates);
console.log('✅ Estados educativos adicionados');

// 4. Adicionar menu de configuração antes do menu principal
const menuStart = 'if(!mode)return';
const configMenu = `if(showConfig)return <LinearGradient colors={theme.bg} style={styles.container}><StatusBar barStyle="light-content"/><SafeAreaView style={styles.container}><View style={styles.menuContainer}><Text style={[styles.menuTitle,{color:theme.text,marginBottom:30}]}>⚙️ Configuracoes</Text><ScrollView showsVerticalScrollIndicator={false} style={{width:'100%',maxWidth:400}}><Text style={[styles.settingsLabel,{color:theme.text}]}>Tamanho</Text><View style={styles.configGrid}>{BOARD_SIZES.map((size,i)=><TouchableOpacity key={i} style={[styles.configCard,{backgroundColor:boardSize.name===size.name?theme.primary:theme.cellBg,borderColor:boardSize.name===size.name?theme.accent:theme.cellBorder}]} onPress={()=>setBoardSize(size)}><Text style={[styles.configLabel,{color:theme.text}]}>{size.label}</Text></TouchableOpacity>)}</View><Text style={[styles.settingsLabel,{color:theme.text,marginTop:20}]}>Pecas</Text><View style={styles.configGrid}>{PIECE_TYPES.map((type,i)=><TouchableOpacity key={i} style={[styles.configCard,{backgroundColor:pieceType.name===type.name?theme.primary:theme.cellBg,borderColor:pieceType.name===type.name?theme.accent:theme.cellBorder}]} onPress={()=>setPieceType(type)}><Text style={{fontSize:28}}>{type.emoji}</Text><Text style={[styles.configLabel,{color:theme.text}]}>{type.name}</Text></TouchableOpacity>)}</View><Text style={[styles.settingsLabel,{color:theme.text,marginTop:20}]}>IA</Text><View style={styles.configGrid}>{AI_LEVELS.map((level,i)=><TouchableOpacity key={i} style={[styles.configCard,{backgroundColor:aiLevel.name===level.name?theme.primary:theme.cellBg,borderColor:aiLevel.name===level.name?theme.accent:theme.cellBorder}]} onPress={()=>setAiLevel(level)}><Text style={{fontSize:24}}>{level.icon}</Text><Text style={[styles.configLabel,{color:theme.text}]}>{level.name}</Text></TouchableOpacity>)}</View><TouchableOpacity style={[styles.menuButton,{backgroundColor:theme.primary,marginTop:30}]} onPress={()=>setShowConfig(false)}><Text style={styles.menuButtonText}>Pronto</Text></TouchableOpacity></ScrollView></View></SafeAreaView></LinearGradient>;`;
app = app.replace(menuStart, configMenu + menuStart);
console.log('✅ Menu de configuração adicionado');

// 5. Adicionar botão de configuração no menu principal
const configButton = `<TouchableOpacity style={[styles.menuButton,{borderWidth:2,borderColor:theme.primary}]} onPress={()=>setShowConfig(true)}><Text style={[styles.menuButtonText,{color:theme.text}]}>⚙️ Configuracoes</Text></TouchableOpacity>`;
const helpButton = '<TouchableOpacity style={[styles.menuButton,{borderWidth:2,borderColor:theme.cellBorder}]} onPress={()=>setShowHelp(true)}';
app = app.replace(helpButton, configButton + helpButton);
console.log('✅ Botão de configuração adicionado');

// 6. Adicionar estilos
const lastBrace = app.lastIndexOf('});');
const newStyles = `,configGrid:{flexDirection:'row',flexWrap:'wrap',gap:12,marginTop:12},configCard:{width:90,padding:12,borderRadius:12,alignItems:'center',borderWidth:2},configLabel:{fontSize:11,fontWeight:'600',textAlign:'center',marginTop:4}`;
app = app.slice(0, lastBrace) + newStyles + app.slice(lastBrace);
console.log('✅ Estilos adicionados');

// 7. Atualizar chamada da IA
app = app.replace('const idx=aiChooseMove(board,2);', 'const idx=aiChooseMove(board,2,aiLevel);');
console.log('✅ Chamada da IA atualizada');

fs.writeFileSync('App.js', app);
console.log('\n✅ Funcionalidades educativas adicionadas com sucesso!');
console.log('📦 Tamanho:', app.length, 'caracteres');
