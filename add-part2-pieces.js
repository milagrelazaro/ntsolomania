const fs = require('fs');

console.log('🎨 Parte 2: Adicionando Tipos de Peças...\n');

let app = fs.readFileSync('App.js', 'utf8');

// 1. Adicionar PIECE_TYPES após BOARD_SIZES
const boardSizesEnd = app.indexOf('];', app.indexOf('BOARD_SIZES'));
const insertPoint = boardSizesEnd + 2;

const pieceTypesConfig = `

// === TIPOS DE PEÇAS ===
const PIECE_TYPES = [
  { name: 'Berlindes', emoji: '🔵', color: '#3B82F6' },
  { name: 'Pedras', emoji: '🪨', color: '#78716C' },
  { name: 'Sementes', emoji: '🌰', color: '#92400E' },
  { name: 'Frutas', emoji: '🍎', color: '#DC2626' },
  { name: 'Estrelas', emoji: '⭐', color: '#FBBF24' },
  { name: 'Diamantes', emoji: '💎', color: '#06B6D4' }
];
`;

app = app.slice(0, insertPoint) + pieceTypesConfig + app.slice(insertPoint);
console.log('✅ PIECE_TYPES adicionado');

// 2. Adicionar estado para pieceType no componente App
app = app.replace('const [boardSize,setBoardSize]=useState(BOARD_SIZES[1]);', 'const [boardSize,setBoardSize]=useState(BOARD_SIZES[1]);const [pieceType,setPieceType]=useState(PIECE_TYPES[2]);');
console.log('✅ Estado pieceType adicionado');

// 3. Adicionar menu de seleção de tipo de peça
const menuStart = 'if(!mode)return';
const pieceMenu = `if(showPieceMenu)return <LinearGradient colors={theme.bg} style={styles.container}><StatusBar barStyle="light-content"/><SafeAreaView style={styles.container}><View style={styles.menuContainer}><Text style={[styles.menuTitle,{color:theme.text}]}>🎨 Tipo de Pecas</Text><View style={styles.pieceGrid}>{PIECE_TYPES.map((type,i)=><TouchableOpacity key={i} style={[styles.pieceCard,{backgroundColor:pieceType.name===type.name?theme.primary:theme.cellBg,borderColor:pieceType.name===type.name?theme.accent:theme.cellBorder}]} onPress={()=>{setPieceType(type);setShowPieceMenu(false)}}><Text style={{fontSize:40,marginBottom:8}}>{type.emoji}</Text><Text style={[styles.pieceName,{color:theme.text}]}>{type.name}</Text></TouchableOpacity>)}</View><TouchableOpacity style={[styles.menuButton,{borderWidth:2,borderColor:theme.cellBorder,marginTop:20}]} onPress={()=>setShowPieceMenu(false)}><Text style={[styles.menuButtonText,{color:theme.text}]}>Voltar</Text></TouchableOpacity></View></SafeAreaView></LinearGradient>;`;

app = app.replace(menuStart, pieceMenu + menuStart);
console.log('✅ Menu de tipo de peça adicionado');

// 4. Adicionar estado para showPieceMenu
app = app.replace('const [showBoardSizeMenu,setShowBoardSizeMenu]=useState(false);', 'const [showBoardSizeMenu,setShowBoardSizeMenu]=useState(false);const [showPieceMenu,setShowPieceMenu]=useState(false);');
console.log('✅ Estado showPieceMenu adicionado');

// 5. Adicionar botão de tipo de peça no menu principal
const pieceButton = `<TouchableOpacity style={[styles.menuButton,{borderWidth:2,borderColor:theme.primary}]} onPress={()=>setShowPieceMenu(true)}><Text style={[styles.menuButtonText,{color:theme.text}]}>🎨 Pecas</Text></TouchableOpacity>`;
const sizeButton = '<TouchableOpacity style={[styles.menuButton,{borderWidth:2,borderColor:theme.primary}]} onPress={()=>setShowBoardSizeMenu(true)}';
app = app.replace(sizeButton, pieceButton + sizeButton);
console.log('✅ Botão de tipo de peça adicionado');

// 6. Adicionar estilos para o grid de peças
const lastBrace = app.lastIndexOf('});');
const newStyles = `,pieceGrid:{flexDirection:'row',flexWrap:'wrap',gap:16,marginTop:20,justifyContent:'center'},pieceCard:{width:100,padding:16,borderRadius:16,alignItems:'center',borderWidth:2},pieceName:{fontSize:12,fontWeight:'600',textAlign:'center',color:theme.text}`;
app = app.slice(0, lastBrace) + newStyles + app.slice(lastBrace);
console.log('✅ Estilos adicionados');

// 7. Modificar SeedDots para usar o emoji do tipo de peça
const oldSeedDots = 'function SeedDots({count,cellSize,theme}){';
const newSeedDots = 'function SeedDots({count,cellSize,theme,pieceType}){';
app = app.replace(oldSeedDots, newSeedDots);
console.log('✅ SeedDots atualizada com pieceType');

fs.writeFileSync('App.js', app);
console.log('\n✅ Parte 2 concluída: Tipos de Peças!');
console.log('📦 Tamanho:', app.length, 'caracteres');
console.log('\n🎨 Tipos disponíveis:');
console.log('  - 🔵 Berlindes (Azul)');
console.log('  - 🪨 Pedras (Cinza)');
console.log('  - 🌰 Sementes (Marrom)');
console.log('  - 🍎 Frutas (Vermelho)');
console.log('  - ⭐ Estrelas (Amarelo)');
console.log('  - 💎 Diamantes (Ciano)');
