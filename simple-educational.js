const fs = require('fs');

console.log('🔧 Adicionando funcionalidades educativas simples...\n');

let app = fs.readFileSync('App.js', 'utf8');

// Inserir configurações educativas APÓS a definição completa de THEMES
const themesEnd = app.indexOf('emoji:\':🌊\'}');
const insertPoint = themesEnd + 'emoji:\':🌊\'}'.length;

const educationalConfig = `

// === CONFIGURACOES EDUCATIVAS ===
const BOARD_SIZES = [
  { label: 'Iniciante 4x4', cols: 4 },
  { label: 'Classico 4x6', cols: 6 },
  { label: 'Medio 4x8', cols: 8 },
  { label: 'Grande 4x10', cols: 10 }
];

const PIECE_TYPES = [
  { name: 'Berlindes', emoji: '🔵' },
  { name: 'Pedras', emoji: '🪨' },
  { name: 'Sementes', emoji: '🌰' },
  { name: 'Frutas', emoji: '🍎' },
  { name: 'Estrelas', emoji: '⭐' },
  { name: 'Diamantes', emoji: '💎' }
];

const AI_LEVELS = [
  { name: 'Facil', icon: '👶', difficulty: 0.3 },
  { name: 'Normal', icon: '🎯', difficulty: 0.7 },
  { name: 'Dificil', icon: '🧠', difficulty: 1.0 },
  { name: 'Professor', icon: '👨‍🏫', difficulty: 0.8 }
];

function evaluateMoveQuality(board, idx, player) {
  const steps = calculateMoveSteps(board, idx, player);
  const finalBoard = steps[steps.length - 1].board;
  let score = 0;
  const opponent = player === 1 ? 2 : 1;
  const oppBefore = countPlayerPieces(board, opponent);
  const oppAfter = countPlayerPieces(finalBoard, opponent);
  score += (oppBefore - oppAfter) * 50;
  score += countPlayerPieces(finalBoard, player) * 2;
  const { col } = idxToRowCol(idx);
  if (col === 0 || col === COLS - 1) score += 10;
  return { score, quality: score > 40 ? 'excelente' : score > 20 ? 'boa' : score > 0 ? 'media' : 'ruim' };
}
`;

app = app.slice(0, insertPoint) + educationalConfig + app.slice(insertPoint);
console.log('✅ Configuracoes educativas adicionadas');

// Adicionar estados educativos
const themeLine = 'const theme=THEMES[selectedTheme];';
const educationalStates = `
  const [boardSize,setBoardSize]=useState(BOARD_SIZES[1]);
  const [pieceType,setPieceType]=useState(PIECE_TYPES[2]);
  const [aiLevel,setAiLevel]=useState(AI_LEVELS[1]);
  const [showConfig,setShowConfig]=useState(false);
`;
app = app.replace(themeLine, themeLine + educationalStates);
console.log('✅ Estados educativos adicionados');

// Adicionar menu de configuração simples
const menuStart = 'if(!mode)return';
const configMenu = `if(showConfig)return <LinearGradient colors={theme.bg} style={styles.container}><StatusBar barStyle="light-content"/><SafeAreaView style={styles.container}><View style={styles.menuContainer}><Text style={[styles.menuTitle,{color:theme.text}]}>⚙️ Configuracoes</Text><ScrollView style={{width:'100%',maxWidth:400}}><Text style={[styles.settingsLabel,{color:theme.text}]}>Tamanho</Text>{BOARD_SIZES.map((size,i)=><TouchableOpacity key={i} style={[styles.menuButton,{backgroundColor:boardSize.cols===size.cols?theme.primary:theme.secondary}]} onPress={()=>setBoardSize(size)}><Text style={styles.menuButtonText}>{size.label}</Text></TouchableOpacity>)}<Text style={[styles.settingsLabel,{color:theme.text,marginTop:20}]}>Pecas</Text><View style={styles.configGrid}>{PIECE_TYPES.map((type,i)=><TouchableOpacity key={i} style={[styles.configCard,{backgroundColor:pieceType.name===type.name?theme.primary:theme.cellBg}]} onPress={()=>setPieceType(type)}><Text style={{fontSize:28}}>{type.emoji}</Text><Text style={[styles.configLabel,{color:theme.text}]}>{type.name}</Text></TouchableOpacity>)}</View><Text style={[styles.settingsLabel,{color:theme.text,marginTop:20}]}>IA</Text><View style={styles.configGrid}>{AI_LEVELS.map((level,i)=><TouchableOpacity key={i} style={[styles.configCard,{backgroundColor:aiLevel.name===level.name?theme.primary:theme.cellBg}]} onPress={()=>setAiLevel(level)}><Text style={{fontSize:24}}>{level.icon}</Text><Text style={[styles.configLabel,{color:theme.text}]}>{level.name}</Text></TouchableOpacity>)}</View><TouchableOpacity style={[styles.menuButton,{backgroundColor:theme.primary,marginTop:30}]} onPress={()=>setShowConfig(false)}><Text style={styles.menuButtonText}>Pronto</Text></TouchableOpacity></ScrollView></View></SafeAreaView></LinearGradient>;`;
app = app.replace(menuStart, configMenu + menuStart);
console.log('✅ Menu de configuracao adicionado');

// Adicionar botão de configuração
const configButton = `<TouchableOpacity style={[styles.menuButton,{borderWidth:2,borderColor:theme.primary}]} onPress={()=>setShowConfig(true)}><Text style={[styles.menuButtonText,{color:theme.text}]}>⚙️ Configuracoes</Text></TouchableOpacity>`;
const helpButton = '<TouchableOpacity style={[styles.menuButton,{borderWidth:2,borderColor:theme.cellBorder}]} onPress={()=>setShowHelp(true)}';
app = app.replace(helpButton, configButton + helpButton);
console.log('✅ Botao de configuracao adicionado');

// Adicionar estilos
const lastBrace = app.lastIndexOf('});');
const newStyles = `,configGrid:{flexDirection:'row',flexWrap:'wrap',gap:12,marginTop:12},configCard:{width:90,padding:12,borderRadius:12,alignItems:'center',borderWidth:2,borderColor:theme.cellBorder},configLabel:{fontSize:11,fontWeight:'600',textAlign:'center',marginTop:4,color:theme.text}`;
app = app.slice(0, lastBrace) + newStyles + app.slice(lastBrace);
console.log('✅ Estilos adicionados');

fs.writeFileSync('App.js', app);
console.log('\n✅ Funcionalidades educativas simples adicionadas!');
console.log('📦 Tamanho:', app.length, 'caracteres');
