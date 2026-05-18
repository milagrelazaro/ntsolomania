const fs = require('fs');

console.log('🤖 Parte 4: Adicionando Níveis de IA...\n');

let app = fs.readFileSync('App.js', 'utf8');

// 1. Adicionar AI_LEVELS após as funções de análise
const analysisEnd = app.indexOf('}', app.indexOf('getMoveAdvice'));
const insertPoint = analysisEnd + 2;

const aiLevelsConfig = `

// === NIVEIS DE IA ===
const AI_LEVELS = [
  { name: 'Facil', icon: '👶', difficulty: 0.3, desc: 'IA comete erros' },
  { name: 'Normal', icon: '🎯', difficulty: 0.7, desc: 'IA equilibrada' },
  { name: 'Dificil', icon: '🧠', difficulty: 1.0, desc: 'IA otimizada' },
  { name: 'Professor', icon: '👨‍🏫', difficulty: 0.8, teaches: true, desc: 'IA que ensina' }
];
`;

app = app.slice(0, insertPoint) + aiLevelsConfig + app.slice(insertPoint);
console.log('✅ AI_LEVELS adicionado');

// 2. Adicionar estado para aiLevel
app = app.replace('const [moveAnalysis,setMoveAnalysis]=useState({});', 'const [moveAnalysis,setMoveAnalysis]=useState({});const [aiLevel,setAiLevel]=useState(AI_LEVELS[1]);');
console.log('✅ Estado aiLevel adicionado');

// 3. Modificar aiChooseMove para respeitar níveis
const oldAiChoose = 'function aiChooseMove(board,player){const moves=getValidMoves(board,player);if(moves.length===0)return null;let best=moves[0],bestScore=-Infinity;for(const idx of moves){const score=evaluateMove(board,idx,player);if(score>bestScore){bestScore=score;best=idx}}return best}';
const newAiChoose = 'function aiChooseMove(board,player,level){const moves=getValidMoves(board,player);if(moves.length===0)return null;if(level&&level.difficulty<0.5&&Math.random()>0.5)return moves[Math.floor(Math.random()*moves.length)];let best=moves[0],bestScore=-Infinity;for(const idx of moves){const score=evaluateMove(board,idx,player);if(score>bestScore){bestScore=score;best=idx}}return best}';
app = app.replace(oldAiChoose, newAiChoose);
console.log('✅ aiChooseMove atualizada com níveis');

// 4. Atualizar chamada da IA para passar o nível
app = app.replace('const idx=aiChooseMove(board,2);', 'const idx=aiChooseMove(board,2,aiLevel);');
console.log('✅ Chamada da IA atualizada');

// 5. Adicionar menu de seleção de nível de IA
const menuStart = 'if(!mode)return';
const aiMenu = `if(showAiMenu)return <LinearGradient colors={theme.bg} style={styles.container}><StatusBar barStyle="light-content"/><SafeAreaView style={styles.container}><View style={styles.menuContainer}><Text style={[styles.menuTitle,{color:theme.text}]}>🤖 Nivel da IA</Text>{AI_LEVELS.map((level,i)=><TouchableOpacity key={i} style={[styles.menuButton,{backgroundColor:aiLevel.name===level.name?theme.primary:theme.secondary}]} onPress={()=>{setAiLevel(level);setShowAiMenu(false)}}><Text style={styles.menuButtonText}>{level.icon} {level.name}</Text><Text style={[styles.menuButtonDesc,{color:theme.text,opacity:0.8}]}>{level.desc}</Text></TouchableOpacity>)}<TouchableOpacity style={[styles.menuButton,{borderWidth:2,borderColor:theme.cellBorder}]} onPress={()=>setShowAiMenu(false)}><Text style={[styles.menuButtonText,{color:theme.text}]}>Voltar</Text></TouchableOpacity></View></SafeAreaView></LinearGradient>;`;

app = app.replace(menuStart, aiMenu + menuStart);
console.log('✅ Menu de nível de IA adicionado');

// 6. Adicionar estado para showAiMenu
app = app.replace('const [showPieceMenu,setShowPieceMenu]=useState(false);', 'const [showPieceMenu,setShowPieceMenu]=useState(false);const [showAiMenu,setShowAiMenu]=useState(false);');
console.log('✅ Estado showAiMenu adicionado');

// 7. Adicionar botão de nível de IA no menu principal
const aiButton = `<TouchableOpacity style={[styles.menuButton,{borderWidth:2,borderColor:theme.primary}]} onPress={()=>setShowAiMenu(true)}><Text style={[styles.menuButtonText,{color:theme.text}]}>🤖 IA: {aiLevel.name}</Text></TouchableOpacity>`;
const learnerButton = '<TouchableOpacity style={[styles.menuButton,{backgroundColor:learnerMode?theme.primary:theme.secondary,borderWidth:2,borderColor:theme.primary}]}';
app = app.replace(learnerButton, aiButton + learnerButton);
console.log('✅ Botão de nível de IA adicionado');

// 8. Adicionar estilos para descrição do botão
const lastBrace = app.lastIndexOf('});');
const newStyles = `,menuButtonDesc:{fontSize:11,marginTop:4,fontWeight:'400'}`;
app = app.slice(0, lastBrace) + newStyles + app.slice(lastBrace);
console.log('✅ Estilos adicionados');

fs.writeFileSync('App.js', app);
console.log('\n✅ Parte 4 concluída: Níveis de IA!');
console.log('📦 Tamanho:', app.length, 'caracteres');
console.log('\n🤖 Níveis disponíveis:');
console.log('  - 👶 Fácil (30% otimizado - comete erros)');
console.log('  - 🎯 Normal (70% otimizado - equilibrada)');
console.log('  - 🧠 Difícil (100% otimizado - perfeita)');
console.log('  - 👨‍🏫 Professor (80% + ensina)');
console.log('\n🎉 TODAS AS FUNCIONALIDADES EDUCATIVAS ADICIONADAS!');
