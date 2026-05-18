const fs = require('fs');

console.log('🎓 Parte 3: Adicionando Modo Aprendiz...\n');

let app = fs.readFileSync('App.js', 'utf8');

// 1. Adicionar função de análise de jogadas após PIECE_TYPES
const pieceTypesEnd = app.indexOf('];', app.indexOf('PIECE_TYPES'));
const insertPoint = pieceTypesEnd + 2;

const analysisFunctions = `

// === ANALISE DE JOGADAS ===
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
  
  // Peças próprias
  const ownAfter = countPlayerPieces(finalBoard, player);
  score += ownAfter * 2;
  
  // Controle de pontas
  const { col } = idxToRowCol(idx);
  if (col === 0 || col === COLS - 1) score += 10;
  
  // Penalidade por exposição
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

app = app.slice(0, insertPoint) + analysisFunctions + app.slice(insertPoint);
console.log('✅ Funções de análise adicionadas');

// 2. Adicionar estado para learnerMode e moveAnalysis
app = app.replace('const [showPieceMenu,setShowPieceMenu]=useState(false);', 'const [showPieceMenu,setShowPieceMenu]=useState(false);const [learnerMode,setLearnerMode]=useState(false);const [moveAnalysis,setMoveAnalysis]=useState({});');
console.log('✅ Estados learnerMode e moveAnalysis adicionados');

// 3. Adicionar useEffect para analisar jogadas em modo aprendiz
const lastUseEffect = app.lastIndexOf('useEffect(()=>{');
const insertEffect = app.indexOf('},[boardSize]);', lastUseEffect);
const effectEnd = insertEffect + '},[boardSize]);'.length;

const analysisEffect = `
  useEffect(()=>{
    if(!learnerMode||isAnimating||gameOver){
      setMoveAnalysis({});
      return;
    }
    const analysis={};
    validMoves.forEach(idx=>{
      const quality=evaluateMoveQuality(board,idx,currentPlayer);
      analysis[idx]=quality;
    });
    setMoveAnalysis(analysis);
  },[learnerMode,board,currentPlayer,validMoves,isAnimating,gameOver]);
`;

app = app.slice(0, effectEnd) + analysisEffect + app.slice(effectEnd);
console.log('✅ useEffect de análise adicionado');

// 4. Adicionar botão toggle do Modo Aprendiz no menu principal
const learnerButton = `<TouchableOpacity style={[styles.menuButton,{backgroundColor:learnerMode?theme.primary:theme.secondary,borderWidth:2,borderColor:theme.primary}]} onPress={()=>setLearnerMode(!learnerMode)}><Text style={styles.menuButtonText}>{learnerMode?'🎓 Modo Aprendiz: ON':'🎓 Modo Aprendiz'}</Text></TouchableOpacity>`;
const pieceButton = '<TouchableOpacity style={[styles.menuButton,{borderWidth:2,borderColor:theme.primary}]} onPress={()=>setShowPieceMenu(true)}';
app = app.replace(pieceButton, learnerButton + pieceButton);
console.log('✅ Botão Modo Aprendiz adicionado');

// 5. Modificar renderCell para mostrar cores do modo aprendiz
const oldRenderCell = 'const renderCell=idx=>{const count=board[idx],isValid=validMoves.includes(idx),isHighlighted=currentAnimIdx===idx,{row}=idxToRowCol(idx),isAtk=row===IDX.P1_ATK||row===IDX.P2_ATK;let borderColor=isAtk?theme.primary:theme.cellBorder;';
const newRenderCell = 'const renderCell=idx=>{const count=board[idx],isValid=validMoves.includes(idx),isHighlighted=currentAnimIdx===idx,{row}=idxToRowCol(idx),isAtk=row===IDX.P1_ATK||row===IDX.P2_ATK;let borderColor=isAtk?theme.primary:theme.cellBorder;if(learnerMode&&moveAnalysis[idx]){const quality=moveAnalysis[idx].quality;if(quality===\'excelente\')borderColor=\'#10B981\';else if(quality===\'boa\')borderColor=\'#FBBF24\';else if(quality===\'media\')borderColor=\'#F97316\';else if(quality===\'ruim\')borderColor=\'#EF4444\';}';
app = app.replace(oldRenderCell, newRenderCell);
console.log('✅ renderCell atualizada com cores do modo aprendiz');

// 6. Adicionar pontuação visível nas casas em modo aprendiz
const oldCellInner = '<View style={[styles.cellInner,{backgroundColor:\'rgba(0,0,0,0.3)\'}]}/>';
const newCellInner = '<View style={[styles.cellInner,{backgroundColor:\'rgba(0,0,0,0.3)\'}]}/>{learnerMode&&moveAnalysis[idx]&&<View style={{position:\'absolute\',top:2,right:2,backgroundColor:borderColor,borderRadius:8,padding:2,minWidth:20}}><Text style={{color:\'#fff\',fontSize:9,fontWeight:\'bold\',textAlign:\'center\'}}>{Math.round(moveAnalysis[idx].score)}</Text></View>}';
app = app.replace(oldCellInner, newCellInner);
console.log('✅ Pontuação visível adicionada');

// 7. Adicionar mensagem educativa durante o jogo
const messageLine = 'const [message,setMessage]=useState(\'\');';
const learnerMessage = `
  const [learnerMessage,setLearnerMessage]=useState(\'\');
`;
app = app.replace(messageLine, messageLine + learnerMessage);
console.log('✅ Estado learnerMessage adicionado');

// 8. Atualizar handleCellPress para mostrar mensagem em modo aprendiz
const oldHandleCell = 'const handleCellPress=idx=>{if(!validMoves.includes(idx)||isAnimating||gameOver)return;setAnimationSteps(calculateMoveSteps(board,idx,currentPlayer));setCurrentStepIndex(0);setIsAnimating(true);setCurrentAnimIdx(null);setMessage(`Jogador ${currentPlayer} move`)};';
const newHandleCell = 'const handleCellPress=idx=>{if(!validMoves.includes(idx)||isAnimating||gameOver)return;if(learnerMode&&moveAnalysis[idx]){const quality=moveAnalysis[idx].quality;const advice=getMoveAdvice(quality);setLearnerMessage(advice);setTimeout(()=>setLearnerMessage(\'\'),2000);}setAnimationSteps(calculateMoveSteps(board,idx,currentPlayer));setCurrentStepIndex(0);setIsAnimating(true);setCurrentAnimIdx(null);setMessage(`Jogador ${currentPlayer} move`)};';
app = app.replace(oldHandleCell, newHandleCell);
console.log('✅ handleCellPress atualizada com mensagens educativas');

// 9. Adicionar exibição da mensagem educativa no jogo
const oldBoardView = '<View style={styles.gameArea}><View style={[styles.board,{width:BOARD_WIDTH,height:BOARD_HEIGHT,backgroundColor:theme.boardBg}]}>';
const newBoardView = '<View style={styles.gameArea}>{learnerMessage&&<View style={[styles.learnerMessage,{backgroundColor:theme.primary}]}><Text style={[styles.learnerMessageText,{color:theme.text}]}>{learnerMessage}</Text></View>}<View style={[styles.board,{width:BOARD_WIDTH,height:BOARD_HEIGHT,backgroundColor:theme.boardBg}]}>';
app = app.replace(oldBoardView, newBoardView);
console.log('✅ Mensagem educativa adicionada ao jogo');

// 10. Adicionar estilos para mensagem educativa
const lastBrace = app.lastIndexOf('});');
const newStyles = `,learnerMessage:{padding:16,borderRadius:12,marginBottom:16,alignItems:\'center\'},learnerMessageText:{fontSize:16,fontWeight:\'600\',textAlign:\'center\'}`;
app = app.slice(0, lastBrace) + newStyles + app.slice(lastBrace);
console.log('✅ Estilos de mensagem educativa adicionados');

fs.writeFileSync('App.js', app);
console.log('\n✅ Parte 3 concluída: Modo Aprendiz!');
console.log('📦 Tamanho:', app.length, 'caracteres');
console.log('\n🎓 Funcionalidades do Modo Aprendiz:');
console.log('  - 🟢 Verde = Excelente (+40 pontos)');
console.log('  - 🟡 Amarelo = Boa (+20 pontos)');
console.log('  - 🟠 Laranja = Média (0 pontos)');
console.log('  - 🔴 Vermelho = Ruim (-20 pontos)');
console.log('  - Pontuação visível em cada casa');
console.log('  - Mensagens educativas ao jogar');
