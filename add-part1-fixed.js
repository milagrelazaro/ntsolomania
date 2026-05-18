const fs = require('fs');

console.log('📐 Parte 1: Adicionando Tamanhos de Tabuleiro (CORRIGIDO)...\n');

let app = fs.readFileSync('App.js', 'utf8');

// 1. Modificar COLS para ser dinâmico
app = app.replace('const COLS=6,ROWS=4,TOTAL=ROWS*COLS,INITIAL_SEEDS=2;', 'const ROWS=4,INITIAL_SEEDS=2;let COLS=6;let TOTAL=ROWS*COLS;');
console.log('✅ COLS modificado para ser dinâmico');

// 2. Adicionar BOARD_SIZES APÓS THEMES (buscando pelo fechamento correto)
const themesEnd = app.indexOf('ocean:{name:');
const insertPoint = app.indexOf('}', app.indexOf('}', themesEnd) + 1) + 1;

const boardSizesConfig = `

// === TAMANHOS DE TABULEIRO ===
const BOARD_SIZES = [
  { label: 'Iniciante 4x4', cols: 4, name: 'iniciante' },
  { label: 'Classico 4x6', cols: 6, name: 'classico' },
  { label: 'Medio 4x8', cols: 8, name: 'medio' },
  { label: 'Grande 4x10', cols: 10, name: 'grande' }
];

function idxToRowCol(idx){return{row:Math.floor(idx/COLS),col:idx%COLS}}
`;

app = app.slice(0, insertPoint) + boardSizesConfig + app.slice(insertPoint + 1);
console.log('✅ BOARD_SIZES adicionado após THEMES');

// 3. Adicionar estado para boardSize no componente App
const themeLine = 'const theme=THEMES[selectedTheme];';
const boardSizeState = `
  const [boardSize,setBoardSize]=useState(BOARD_SIZES[1]);
`;
app = app.replace(themeLine, themeLine + boardSizeState);
console.log('✅ Estado boardSize adicionado');

// 4. Adicionar useEffect para atualizar COLS quando boardSize mudar
const lastUseEffect = app.lastIndexOf('useEffect(()=>{if(mode===');
const insertEffect = app.indexOf('},[mode,currentPlayer', lastUseEffect);
const effectEnd = app.indexOf(';', insertEffect) + 1;

const updateBoardEffect = `
  useEffect(()=>{
    COLS=boardSize.cols;
    TOTAL=ROWS*COLS;
    resetGame();
  },[boardSize]);
`;

app = app.slice(0, effectEnd) + updateBoardEffect + app.slice(effectEnd);
console.log('✅ useEffect para atualizar tabuleiro adicionado');

// 5. Adicionar menu de seleção de tamanho no menu principal
const menuStart = 'if(!mode)return';
const sizeMenu = `if(showBoardSizeMenu)return <LinearGradient colors={theme.bg} style={styles.container}><StatusBar barStyle="light-content"/><SafeAreaView style={styles.container}><View style={styles.menuContainer}><Text style={[styles.menuTitle,{color:theme.text}]}>📐 Tamanho do Tabuleiro</Text>{BOARD_SIZES.map((size,i)=><TouchableOpacity key={i} style={[styles.menuButton,{backgroundColor:boardSize.cols===size.cols?theme.primary:theme.secondary}]} onPress={()=>{setBoardSize(size);setShowBoardSizeMenu(false)}}><Text style={styles.menuButtonText}>{size.label}</Text></TouchableOpacity>)}<TouchableOpacity style={[styles.menuButton,{borderWidth:2,borderColor:theme.cellBorder}]} onPress={()=>setShowBoardSizeMenu(false)}><Text style={[styles.menuButtonText,{color:theme.text}]}>Voltar</Text></TouchableOpacity></View></SafeAreaView></LinearGradient>;`;

app = app.replace(menuStart, sizeMenu + menuStart);
console.log('✅ Menu de tamanho adicionado');

// 6. Adicionar estado para showBoardSizeMenu
app = app.replace('const [showConfig,setShowConfig]=useState(false);', 'const [showConfig,setShowConfig]=useState(false);const [showBoardSizeMenu,setShowBoardSizeMenu]=useState(false);');
console.log('✅ Estado showBoardSizeMenu adicionado');

// 7. Adicionar botão de tamanho no menu principal
const sizeButton = `<TouchableOpacity style={[styles.menuButton,{borderWidth:2,borderColor:theme.primary}]} onPress={()=>setShowBoardSizeMenu(true)}><Text style={[styles.menuButtonText,{color:theme.text}]}>📐 Tamanho</Text></TouchableOpacity>`;
const configButton = '<TouchableOpacity style={[styles.menuButton,{borderWidth:2,borderColor:theme.primary}]} onPress={()=>setShowConfig(true)}';
app = app.replace(configButton, sizeButton + configButton);
console.log('✅ Botão de tamanho adicionado');

fs.writeFileSync('App.js', app);
console.log('\n✅ Parte 1 concluída: Tamanhos de Tabuleiro!');
console.log('📦 Tamanho:', app.length, 'caracteres');
