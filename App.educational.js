import React, { useState, useEffect, useCallback, useRef } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, SafeAreaView, Modal, ScrollView, Dimensions, StatusBar, Animated, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';


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

const COLS=6,ROWS=4,TOTAL=ROWS*COLS,INITIAL_SEEDS=2;
const IDX={P2_DEF:0,P2_ATK:1,P1_ATK:2,P1_DEF:3};
const THEMES={savanna:{name:'Savana',primary:'#D97706',secondary:'#92400E',accent:'#FCD34D',bg:['#1C0F05','#2D1810'],boardBg:'rgba(139,69,19,0.3)',cellBg:'rgba(101,67,33,0.6)',cellBorder:'rgba(217,119,6,0.5)',seed:'#F59E0B',text:'#FEF3C7',emoji:'🌾'},sunset:{name:'Por do Sol',primary:'#DC2626',secondary:'#7C2D12',accent:'#FBBF24',bg:['#450A0A','#7C2D12'],boardBg:'rgba(153,27,27,0.3)',cellBg:'rgba(127,29,29,0.6)',cellBorder:'rgba(220,38,38,0.5)',seed:'#EF4444',text:'#FEE2E2',emoji:'🌅'},forest:{name:'Floresta',primary:'#059669',secondary:'#064E3B',accent:'#34D399',bg:['#022C22','#064E3B'],boardBg:'rgba(6,78,59,0.3)',cellBg:'rgba(6,95,70,0.6)',cellBorder:'rgba(5,150,105,0.5)',seed:'#10B981',text:'#D1FAE5',emoji:'🌳'},desert:{name:'Deserto',primary:'#CA8A04',secondary:'#713F12',accent:'#FDE047',bg:['#422006','#713F12'],boardBg:'rgba(113,63,18,0.3)',cellBg:'rgba(161,98,7,0.6)',cellBorder:'rgba(202,138,4,0.5)',seed:'#FACC15',text:'#FEF9C3',emoji:'🏜️'},ocean:{name:'Oceano',primary:'#0284C7',secondary:'#0C4A6E',accent:'#38BDF8',bg:['#082F49','#0C4A6E'],boardBg:'rgba(12,74,110,0.3)',cellBg:'rgba(7,89,133,0.6)',cellBorder:'rgba(2,132,199,0.5)',seed:'#0EA5E9',text:'#E0F2FE',emoji:'🌊'}};

function idxToRowCol(idx){return{row:Math.floor(idx/COLS),col:idx%COLS}}
function rowColToIdx(row,col){return row*COLS+col}
function nextIndex(idx,player){const{row,col}=idxToRowCol(idx);if(player===1){if(row===IDX.P1_DEF)return col<COLS-1?rowColToIdx(row,col+1):rowColToIdx(IDX.P1_ATK,COLS-1);if(row===IDX.P1_ATK)return col>0?rowColToIdx(row,col-1):rowColToIdx(IDX.P1_DEF,0)}else{if(row===IDX.P2_ATK)return col<COLS-1?rowColToIdx(row,col+1):rowColToIdx(IDX.P2_DEF,COLS-1);if(row===IDX.P2_DEF)return col>0?rowColToIdx(row,col-1):rowColToIdx(IDX.P2_ATK,0)}return idx}
function isPlayerSide(idx,player){const{row}=idxToRowCol(idx);return player===1?(row===IDX.P1_ATK||row===IDX.P1_DEF):(row===IDX.P2_ATK||row===IDX.P2_DEF)}
function isAttackRow(idx,player){const{row}=idxToRowCol(idx);return player===1?row===IDX.P1_ATK:row===IDX.P2_ATK}
function isDefenseRow(idx,player){const{row}=idxToRowCol(idx);return player===1?row===IDX.P1_DEF:row===IDX.P2_DEF}
function isCornerHole(idx){const{col}=idxToRowCol(idx);return col===0||col===COLS-1}
function isMiddleHole(idx){const{col}=idxToRowCol(idx);return col>=1&&col<=COLS-2}
function opponentAttackHouse(idx,player){const{col}=idxToRowCol(idx);return player===1?rowColToIdx(IDX.P2_ATK,col):rowColToIdx(IDX.P1_ATK,col)}
function opponentDefenseHouse(idx,player){const{col}=idxToRowCol(idx);return player===1?rowColToIdx(IDX.P2_DEF,col):rowColToIdx(IDX.P1_DEF,col)}
function createInitialBoard(){return Array(TOTAL).fill(INITIAL_SEEDS)}
function getPlayerIndices(player){const res=[];for(let i=0;i<TOTAL;i++)if(isPlayerSide(i,player))res.push(i);return res}
function countPlayerPieces(board,player){return getPlayerIndices(player).reduce((sum,idx)=>sum+board[idx],0)}
function isPhaseTwo(board){return board.every(c=>c<=1)}
function getValidMoves(board,player){const moves=[],indices=getPlayerIndices(player),phase2=isPhaseTwo(board);for(const idx of indices){if(board[idx]===0)continue;if(phase2){if(board[idx]===1)moves.push(idx)}else moves.push(idx)}return moves}

function calculateMoveSteps(board,idx,player){const steps=[];let b=[...board],seeds=b[idx];b[idx]=0;let current=idx;steps.push({type:'pickup',idx,count:seeds});let continueLoop=true;let safety=0;while(continueLoop&&safety<100){safety++;while(seeds>0){current=nextIndex(current,player);b[current]+=1;seeds-=1;steps.push({type:'drop',idx:current,board:[...b]})}if(b[current]===0){continueLoop=false;break}const hadSeedsBeforeDrop=b[current]>1;if(!hadSeedsBeforeDrop){continueLoop=false;break}if(isAttackRow(current,player)){const oppAtk=opponentAttackHouse(current,player),oppDef=opponentDefenseHouse(current,player);if(b[oppAtk]>0){let totalCaptured=b[oppAtk]+b[oppDef];steps.push({type:'capture',idx:current,oppAtk,oppDef,count:totalCaptured});b[oppAtk]=0;b[oppDef]=0;seeds=totalCaptured;continue}if(isMiddleHole(current)){continueLoop=false;break}if(isCornerHole(current)){const pickedSeeds=b[current]-1;b[current]=1;seeds=pickedSeeds;if(seeds>0){steps.push({type:'pickup',idx:current,count:seeds});continue}else{continueLoop=false;break}}}else if(isDefenseRow(current,player)){const pickedSeeds=b[current]-1;b[current]=1;seeds=pickedSeeds;if(seeds>0){steps.push({type:'pickup',idx:current,count:seeds});continue}else{continueLoop=false;break}}}steps.push({type:'complete',board:b});return steps}

function checkGameOver(board,currentPlayer){const p1Total=countPlayerPieces(board,1),p2Total=countPlayerPieces(board,2);if(p1Total===0)return{over:true,winner:2,reason:'Jogador 1 sem pecas'};if(p2Total===0)return{over:true,winner:1,reason:'Jogador 2 sem pecas'};const moves=getValidMoves(board,currentPlayer);if(moves.length===0){const opponent=currentPlayer===1?2:1;return{over:true,winner:opponent,reason:`Jogador ${currentPlayer} sem jogadas validas`}}return{over:false}}

function evaluateMove(board,idx,player){const steps=calculateMoveSteps(board,idx,player),finalBoard=steps[steps.length-1].board;let score=0;const opponent=player===1?2:1,oppBefore=countPlayerPieces(board,opponent),oppAfter=countPlayerPieces(finalBoard,opponent);score+=(oppBefore-oppAfter)*50;const ownAfter=countPlayerPieces(finalBoard,player);score+=ownAfter*2;return score}

function aiChooseMove(board,player){const moves=getValidMoves(board,player);if(moves.length===0)return null;let best=moves[0],bestScore=-Infinity;for(const idx of moves){const score=evaluateMove(board,idx,player);if(score>bestScore){bestScore=score;best=idx}}return best}

const{width:SCREEN_W,height:SCREEN_H}=Dimensions.get('window');
const CELL_SIZE=Math.min((SCREEN_W-24)/COLS-6,Math.max(68,(SCREEN_H-240)/ROWS-8));

function SeedDots({count,cellSize,theme}){if(count<=0)return null;if(count>12)return <View style={styles.seedStack}><Text style={[styles.seedCountLarge,{fontSize:cellSize*0.45,color:theme.accent}]}>{count}</Text><View style={[styles.seedDot,{position:'relative',marginTop:2,backgroundColor:theme.seed,width:cellSize*0.18,height:cellSize*0.18,borderRadius:cellSize*0.09}]}/></View>;const dots=[],radius=cellSize*0.28,cx=cellSize*0.42,cy=cellSize*0.42,dotSize=Math.max(10,cellSize*0.18);if(count===1)dots.push(<View key={0} style={[styles.seedDot,{top:cy-dotSize/2,left:cx-dotSize/2,backgroundColor:theme.seed,width:dotSize,height:dotSize,borderRadius:dotSize/2,shadowColor:theme.accent,shadowOffset:{width:0,height:2},shadowOpacity:0.6,shadowRadius:3,elevation:4}]}/>);else if(count===2){dots.push(<View key={0} style={[styles.seedDot,{top:cy-dotSize/2,left:cx-dotSize-2,backgroundColor:theme.seed,width:dotSize,height:dotSize,borderRadius:dotSize/2,shadowColor:theme.accent,shadowOffset:{width:0,height:2},shadowOpacity:0.6,shadowRadius:3,elevation:4}]}/>);dots.push(<View key={1} style={[styles.seedDot,{top:cy-dotSize/2,left:cx+2,backgroundColor:theme.seed,width:dotSize,height:dotSize,borderRadius:dotSize/2,shadowColor:theme.accent,shadowOffset:{width:0,height:2},shadowOpacity:0.6,shadowRadius:3,elevation:4}]}/>)}else{for(let i=0;i<count;i++){const angle=(i/count)*2*Math.PI-Math.PI/2,top=cy+radius*Math.sin(angle)-dotSize/2,left=cx+radius*Math.cos(angle)-dotSize/2;dots.push(<View key={i} style={[styles.seedDot,{top,left,backgroundColor:theme.seed,width:dotSize,height:dotSize,borderRadius:dotSize/2,shadowColor:theme.accent,shadowOffset:{width:0,height:2},shadowOpacity:0.5,shadowRadius:2,elevation:3}]}/>)}}return <View style={StyleSheet.absoluteFill}>{dots}</View>}

export default function App(){const[mode,setMode]=useState(null);const[board,setBoard]=useState(()=>createInitialBoard());const[currentPlayer,setCurrentPlayer]=useState(1);const[gameOver,setGameOver]=useState(null);const[animationSteps,setAnimationSteps]=useState([]);const[currentStepIndex,setCurrentStepIndex]=useState(-1);const[isAnimating,setIsAnimating]=useState(false);const[currentAnimIdx,setCurrentAnimIdx]=useState(null);const[message,setMessage]=useState('');const[showHelp,setShowHelp]=useState(false);const[showSettings,setShowSettings]=useState(false);const[selectedTheme,setSelectedTheme]=useState('savanna');const[animationSpeed,setAnimationSpeed]=useState(500);const[soundEnabled,setSoundEnabled]=useState(true);const msgTimer=useRef(null);const pulseAnim=useRef(new Animated.Value(1)).current;const audioContextRef=useRef(null);const theme=THEMES[selectedTheme];

useEffect(()=>{Animated.loop(Animated.sequence([Animated.timing(pulseAnim,{toValue:1.05,duration:1000,useNativeDriver:true}),Animated.timing(pulseAnim,{toValue:1,duration:1000,useNativeDriver:true})])).start()},[]);

const playDropSound=useCallback(()=>{if(!soundEnabled||Platform.OS!=='web')return;try{if(!audioContextRef.current)audioContextRef.current=new(window.AudioContext||window.webkitAudioContext)();const ctx=audioContextRef.current,osc=ctx.createOscillator(),gain=ctx.createGain();osc.connect(gain);gain.connect(ctx.destination);osc.frequency.value=800;osc.type='sine';gain.gain.setValueAtTime(0.15,ctx.currentTime);gain.gain.exponentialRampToValueAtTime(0.01,ctx.currentTime+0.08);osc.start(ctx.currentTime);osc.stop(ctx.currentTime+0.08)}catch(e){}},[soundEnabled]);

const showMessage=useCallback(text=>{if(msgTimer.current)clearTimeout(msgTimer.current);setMessage(text);msgTimer.current=setTimeout(()=>setMessage(''),2500)},[]);

const resetGame=useCallback(()=>{setBoard(createInitialBoard());setCurrentPlayer(1);setGameOver(null);setIsAnimating(false);setCurrentAnimIdx(null);setAnimationSteps([]);setCurrentStepIndex(-1);setMessage('')},[]);

const executeMove=useCallback((idx,player)=>{if(gameOver||isAnimating)return;const moves=getValidMoves(board,player);if(!moves.includes(idx))return;const steps=calculateMoveSteps(board,idx,player);setAnimationSteps(steps);setCurrentStepIndex(0);setIsAnimating(true)},[board,gameOver,isAnimating]);

useEffect(()=>{if(!isAnimating||currentStepIndex<0||currentStepIndex>=animationSteps.length){if(isAnimating&&currentStepIndex>=animationSteps.length){const finalStep=animationSteps[animationSteps.length-1];setBoard(finalStep.board);setIsAnimating(false);setCurrentStepIndex(-1);setAnimationSteps([]);setCurrentAnimIdx(null);const nextPlayer=currentPlayer===1?2:1,over=checkGameOver(finalStep.board,nextPlayer);if(over.over)setGameOver(over);else setCurrentPlayer(nextPlayer)}return}const step=animationSteps[currentStepIndex];if(step.type==='drop'){playDropSound();setCurrentAnimIdx(step.idx);if(step.board)setBoard(step.board)}else if(step.type==='capture'){showMessage(`🎯 Capturou ${step.count} peca(s)!`);setCurrentAnimIdx(step.idx)}else if(step.type==='pickup')setCurrentAnimIdx(step.idx);const timer=setTimeout(()=>setCurrentStepIndex(prev=>prev+1),animationSpeed);return()=>clearTimeout(timer)},[isAnimating,currentStepIndex,animationSteps,animationSpeed,currentPlayer,playDropSound,showMessage]);

useEffect(()=>{if(mode==='single'&&currentPlayer===2&&!gameOver&&!isAnimating){const timer=setTimeout(()=>{const idx=aiChooseMove(board,2);if(idx!==null)executeMove(idx,2)},700);return()=>clearTimeout(timer)}},[mode,currentPlayer,board,gameOver,isAnimating,executeMove]);

const handleCellPress=idx=>{if(gameOver||isAnimating)return;if(mode==='single'&&currentPlayer!==1)return;if(!isPlayerSide(idx,currentPlayer))return;executeMove(idx,currentPlayer)};

const validMoves=getValidMoves(board,currentPlayer),phase2=isPhaseTwo(board),p1Count=countPlayerPieces(board,1),p2Count=countPlayerPieces(board,2);

const renderCell=idx=>{const count=board[idx],isValid=validMoves.includes(idx),isHighlighted=currentAnimIdx===idx,{row}=idxToRowCol(idx),isAtk=row===IDX.P1_ATK||row===IDX.P2_ATK;return <TouchableOpacity key={idx} onPress={()=>handleCellPress(idx)} activeOpacity={isValid&&!isAnimating&&!gameOver?0.6:1} disabled={!isValid||isAnimating||gameOver} style={[styles.cell,{width:CELL_SIZE,height:CELL_SIZE,borderColor:isAtk?theme.primary:theme.cellBorder,backgroundColor:theme.cellBg,borderWidth:isAtk?3:2},isHighlighted&&{borderColor:theme.accent,borderWidth:4,transform:[{scale:1.1}],shadowColor:theme.accent,shadowOffset:{width:0,height:0},shadowOpacity:0.8,shadowRadius:10,elevation:10},isValid&&!isAnimating&&!gameOver&&{opacity:1,borderColor:theme.accent},count===0&&{opacity:0.5}]}><View style={[styles.cellInner,{backgroundColor:'rgba(0,0,0,0.3)'}]}/><SeedDots count={count} cellSize={CELL_SIZE} theme={theme}/>{isHighlighted&&<View style={styles.animIndicator}><Text style={{fontSize:CELL_SIZE*0.4}}>✋</Text></View>}{count===0&&!isHighlighted&&<Text style={[styles.cellIndex,{color:theme.text}]}>{idx+1}</Text>}</TouchableOpacity>};

const renderRow=rowIndex=>{const cells=[];for(let col=0;col<COLS;col++)cells.push(renderCell(rowColToIdx(rowIndex,col)));return <View key={rowIndex} style={styles.rowCells}>{cells}</View>};

if(!mode)return <LinearGradient colors={theme.bg} style={styles.container}><StatusBar barStyle="light-content"/><SafeAreaView style={styles.container}><View style={styles.menuContainer}><Animated.Text style={[styles.menuEmoji,{transform:[{scale:pulseAnim}]}]}>{theme.emoji}</Animated.Text><Text style={[styles.menuTitle,{color:theme.text}]}>Ntxuva</Text><Text style={[styles.menuSubtitle,{color:theme.text,opacity:0.7}]}>O xadrez africano de Mocambique</Text><TouchableOpacity style={[styles.menuButton,{backgroundColor:theme.primary}]} onPress={()=>setMode('single')} activeOpacity={0.8}><Ionicons name="hardware-chip-outline" size={20} color="#fff"/><Text style={styles.menuButtonText}>Jogar contra o Computador</Text></TouchableOpacity><TouchableOpacity style={[styles.menuButton,{backgroundColor:theme.secondary}]} onPress={()=>setMode('multi')} activeOpacity={0.8}><Ionicons name="people-outline" size={20} color="#fff"/><Text style={styles.menuButtonText}>2 Jogadores (Local)</Text></TouchableOpacity><TouchableOpacity style={[styles.menuButton,{borderWidth:2,borderColor:theme.primary}]} onPress={()=>setShowSettings(true)} activeOpacity={0.8}><Ionicons name="settings-outline" size={20} color={theme.text}/><Text style={[styles.menuButtonText,{color:theme.text}]}>Configuracoes</Text></TouchableOpacity><TouchableOpacity style={[styles.menuButton,{borderWidth:2,borderColor:theme.cellBorder}]} onPress={()=>setShowHelp(true)} activeOpacity={0.8}><Ionicons name="information-circle-outline" size={20} color={theme.text}/><Text style={[styles.menuButtonText,{color:theme.text}]}>Como Jogar</Text></TouchableOpacity></View><Modal visible={showSettings} animationType="slide" transparent><View style={styles.modalOverlay}><View style={[styles.modalContent,{backgroundColor:theme.bg[1]}]}><View style={styles.modalHeader}><Text style={[styles.modalTitle,{color:theme.text}]}>Configuracoes</Text><TouchableOpacity onPress={()=>setShowSettings(false)} style={styles.modalClose}><Ionicons name="close" size={24} color={theme.text}/></TouchableOpacity></View><ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}><Text style={[styles.settingsLabel,{color:theme.text}]}>Tema</Text><View style={styles.themeGrid}>{Object.entries(THEMES).map(([key,t])=><TouchableOpacity key={key} style={[styles.themeCard,{backgroundColor:t.boardBg,borderColor:selectedTheme===key?t.accent:t.cellBorder,borderWidth:selectedTheme===key?3:1}]} onPress={()=>setSelectedTheme(key)}><Text style={styles.themeEmoji}>{t.emoji}</Text><Text style={[styles.themeName,{color:t.text}]}>{t.name}</Text></TouchableOpacity>)}</View><Text style={[styles.settingsLabel,{color:theme.text,marginTop:20}]}>Velocidade da Animacao</Text><View style={styles.speedButtons}>{[{label:'Muito Lenta',value:1200},{label:'Lenta',value:800},{label:'Normal',value:500},{label:'Rapida',value:300},{label:'Muito Rapida',value:150}].map(s=><TouchableOpacity key={s.value} style={[styles.speedButton,{backgroundColor:animationSpeed===s.value?theme.primary:theme.cellBg,borderColor:theme.cellBorder}]} onPress={()=>setAnimationSpeed(s.value)}><Text style={[styles.speedButtonText,{color:theme.text}]}>{s.label}</Text></TouchableOpacity>)}</View><View style={{marginTop:20}}><TouchableOpacity style={[styles.toggleButton,{backgroundColor:soundEnabled?theme.primary:theme.cellBg}]} onPress={()=>setSoundEnabled(!soundEnabled)}><Ionicons name={soundEnabled?'volume-high':'volume-mute'} size={20} color={theme.text}/><Text style={[styles.toggleButtonText,{color:theme.text}]}>Som {soundEnabled?'Ligado':'Desligado'}</Text></TouchableOpacity></View></ScrollView></View></View></Modal><Modal visible={showHelp} animationType="slide" transparent><View style={styles.modalOverlay}><View style={[styles.modalContent,{backgroundColor:theme.bg[1]}]}><View style={styles.modalHeader}><Text style={[styles.modalTitle,{color:theme.text}]}>Como Jogar</Text><TouchableOpacity onPress={()=>setShowHelp(false)} style={styles.modalClose}><Ionicons name="close" size={24} color={theme.text}/></TouchableOpacity></View><ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}><Text style={[styles.helpText,{color:theme.text}]}>Tabuleiro: 4 fileiras x 6 colunas. Cada jogador controla 12 casas: fileira de Defesa (exterior) e fileira de Ataque (interior).{String.fromCharCode(10,10)}Inicio: 2 pecas em cada casa.{String.fromCharCode(10,10)}Movimento: Escolhe uma casa do teu lado, recolhe todas as pecas e distribui 1 por casa no sentido anti-horario APENAS no teu lado (12 casas).{String.fromCharCode(10,10)}CAPTURA: Para comer, a ultima peca deve cair numa casa que JA TINHA pecas (nao vazia). Ao comer, levas APENAS os dados do inimigo (nao os da casa onde caiu) e continuas a distribuir.{String.fromCharCode(10,10)}QUANDO PARA: A jogada termina se: (1) Cai numa casa vazia, OU (2) Cai nos buracos do MEIO (colunas 2-5) da linha de Ataque com dados mas o inimigo nao tem nada na casa de Ataque.{String.fromCharCode(10,10)}QUANDO CONTINUA: Se cai nos buracos das PONTAS (colunas 1 e 6) da linha de Ataque com dados, OU em qualquer casa de Defesa com dados, recolhe os dados (menos 1 que fica) e continua.{String.fromCharCode(10,10)}Fase 2: Quando todas as casas tem no maximo 1 peca, cada peca move-se sozinha.{String.fromCharCode(10,10)}Objetivo: Deixar o adversario sem pecas ou sem jogadas validas.</Text></ScrollView></View></View></Modal></SafeAreaView></LinearGradient>;

return <LinearGradient colors={theme.bg} style={styles.container}><StatusBar barStyle="light-content"/><SafeAreaView style={styles.container}><View style={[styles.header,{backgroundColor:theme.boardBg,borderBottomColor:theme.cellBorder}]}><View style={styles.headerLeft}><Text style={styles.headerEmoji}>{theme.emoji}</Text><Text style={[styles.headerTitle,{color:theme.text}]}>Ntxuva</Text>{phase2&&<View style={[styles.phaseBadge,{backgroundColor:theme.primary}]}><Text style={styles.phaseBadgeText}>Fase 2</Text></View>}</View><View style={styles.headerRight}>{message?<View style={[styles.messageBadge,{backgroundColor:theme.primary}]}><Text style={styles.messageText}>{message}</Text></View>:null}<TouchableOpacity onPress={resetGame} style={styles.iconButton}><Ionicons name="refresh-outline" size={18} color={theme.text}/></TouchableOpacity><TouchableOpacity onPress={()=>{setMode(null);resetGame()}} style={styles.iconButton}><Ionicons name="close-outline" size={18} color={theme.text}/></TouchableOpacity></View></View><View style={styles.scores}><View style={[styles.scoreCard,{backgroundColor:currentPlayer===2?theme.primary+'40':theme.cellBg,borderColor:currentPlayer===2?theme.accent:theme.cellBorder}]}><Ionicons name={mode==='single'?'hardware-chip-outline':'person-outline'} size={18} color={theme.accent}/><View><Text style={[styles.scoreLabel,{color:theme.text,opacity:0.7}]}>JOGADOR 2</Text><Text style={[styles.scoreValue,{color:theme.accent}]}>{p2Count} pecas</Text></View></View><Text style={[styles.vsText,{color:theme.text,opacity:0.5}]}>VS</Text><View style={[styles.scoreCard,{backgroundColor:currentPlayer===1?theme.primary+'40':theme.cellBg,borderColor:currentPlayer===1?theme.accent:theme.cellBorder}]}><Ionicons name="person-outline" size={18} color={theme.accent}/><View><Text style={[styles.scoreLabel,{color:theme.text,opacity:0.7}]}>JOGADOR 1</Text><Text style={[styles.scoreValue,{color:theme.accent}]}>{p1Count} pecas</Text></View></View></View><View style={styles.turnRow}>{gameOver?<Text style={[styles.turnTextGameOver,{color:theme.accent}]}>Fim de jogo!</Text>:mode==='single'&&currentPlayer===2?<Text style={[styles.turnText,{color:theme.text}]}>Computador a pensar...</Text>:<Text style={[styles.turnText,{color:theme.text}]}>Vez do <Text style={{color:theme.accent}}>Jogador {currentPlayer}</Text></Text>}</View><ScrollView contentContainerStyle={styles.boardScroll} showsVerticalScrollIndicator={false}><View style={[styles.board,{backgroundColor:theme.boardBg,borderColor:theme.cellBorder}]}><View style={styles.sideSection}>{renderRow(IDX.P2_DEF)}{renderRow(IDX.P2_ATK)}</View><View style={[styles.divider,{backgroundColor:theme.primary}]}/><View style={styles.sideSection}>{renderRow(IDX.P1_ATK)}{renderRow(IDX.P1_DEF)}</View></View><View style={styles.colNumbers}>{Array.from({length:COLS},(_,i)=><Text key={i} style={[styles.colNumber,{color:theme.text,opacity:0.5}]}>{i+1}</Text>)}</View></ScrollView><Modal visible={!!gameOver} transparent animationType="fade"><View style={styles.modalOverlay}><View style={[styles.gameOverCard,{backgroundColor:theme.bg[1],borderColor:theme.accent}]}><Ionicons name="trophy" size={48} color={theme.accent}/><Text style={[styles.gameOverTitle,{color:theme.text}]}>{mode==='single'&&gameOver?.winner===2?'Computador venceu!':`Jogador ${gameOver?.winner} venceu!`}</Text><Text style={[styles.gameOverReason,{color:theme.text,opacity:0.7}]}>{gameOver?.reason}</Text><View style={styles.gameOverButtons}><TouchableOpacity style={[styles.gameOverBtnPrimary,{backgroundColor:theme.primary}]} onPress={resetGame}><Text style={styles.gameOverBtnPrimaryText}>Jogar Novamente</Text></TouchableOpacity><TouchableOpacity style={[styles.gameOverBtnSecondary,{backgroundColor:theme.secondary}]} onPress={()=>{setMode(null);resetGame()}}><Text style={styles.gameOverBtnSecondaryText}>Menu</Text></TouchableOpacity></View></View></View></Modal></SafeAreaView></LinearGradient>}

const styles=StyleSheet.create({container:{flex:1},menuContainer:{flex:1,alignItems:'center',justifyContent:'center',padding:24},menuEmoji:{fontSize:64,marginBottom:16},menuTitle:{fontSize:42,fontWeight:'bold',marginBottom:8,letterSpacing:2},menuSubtitle:{fontSize:15,textAlign:'center',maxWidth:320,marginBottom:40},menuButton:{flexDirection:'row',alignItems:'center',justifyContent:'center',gap:10,width:'100%',maxWidth:340,paddingVertical:16,paddingHorizontal:24,borderRadius:16,marginBottom:14,shadowColor:'#000',shadowOffset:{width:0,height:4},shadowOpacity:0.3,shadowRadius:6,elevation:6},menuButtonText:{color:'#fff',fontSize:16,fontWeight:'700'},header:{flexDirection:'row',alignItems:'center',justifyContent:'space-between',paddingHorizontal:16,paddingVertical:12,borderBottomWidth:2},headerLeft:{flexDirection:'row',alignItems:'center',gap:10},headerEmoji:{fontSize:22},headerTitle:{fontSize:18,fontWeight:'700',letterSpacing:1},headerRight:{flexDirection:'row',alignItems:'center',gap:8},phaseBadge:{paddingHorizontal:10,paddingVertical:3,borderRadius:12,marginLeft:8},phaseBadgeText:{color:'#fff',fontSize:11,fontWeight:'700'},messageBadge:{paddingHorizontal:12,paddingVertical:5,borderRadius:10,marginRight:6},messageText:{color:'#fff',fontSize:12,fontWeight:'600'},iconButton:{padding:8,borderRadius:10},scores:{flexDirection:'row',alignItems:'center',justifyContent:'center',gap:18,paddingVertical:14},scoreCard:{flexDirection:'row',alignItems:'center',gap:12,paddingHorizontal:18,paddingVertical:12,borderRadius:14,borderWidth:2},scoreLabel:{fontSize:10,fontWeight:'800',letterSpacing:1.2},scoreValue:{fontSize:18,fontWeight:'bold'},vsText:{fontSize:12,fontWeight:'bold'},turnRow:{alignItems:'center',paddingBottom:10},turnText:{fontSize:14,fontWeight:'500'},turnTextGameOver:{fontSize:14,fontWeight:'700'},boardScroll:{alignItems:'center',paddingHorizontal:8,paddingBottom:12},board:{borderRadius:22,padding:14,borderWidth:2,shadowColor:'#000',shadowOffset:{width:0,height:6},shadowOpacity:0.4,shadowRadius:8,elevation:8},sideSection:{gap:7},divider:{height:3,marginVertical:12,borderRadius:2},rowCells:{flexDirection:'row',gap:7},cell:{borderRadius:CELL_SIZE/2,alignItems:'center',justifyContent:'center',overflow:'hidden',shadowColor:'#000',shadowOffset:{width:0,height:2},shadowOpacity:0.3,shadowRadius:4,elevation:4},cellInner:{position:'absolute',top:4,left:4,right:4,bottom:4,borderRadius:CELL_SIZE/2-4},cellIndex:{fontSize:11,fontWeight:'600',opacity:0.5},seedDot:{position:'absolute'},seedStack:{position:'absolute',alignItems:'center',justifyContent:'center'},seedCountLarge:{fontWeight:'bold'},animIndicator:{position:'absolute',top:-CELL_SIZE*0.3,alignSelf:'center',zIndex:100},colNumbers:{flexDirection:'row',gap:7,marginTop:8,paddingLeft:2},colNumber:{width:CELL_SIZE,textAlign:'center',fontSize:11,fontWeight:'600'},modalOverlay:{flex:1,backgroundColor:'rgba(0,0,0,0.8)',alignItems:'center',justifyContent:'center',padding:24},modalContent:{borderRadius:24,width:'100%',maxWidth:420,padding:24,borderWidth:2,borderColor:'rgba(255,255,255,0.1)'},modalHeader:{flexDirection:'row',alignItems:'center',justifyContent:'space-between',marginBottom:16},modalTitle:{fontSize:22,fontWeight:'bold'},modalClose:{padding:4},modalBody:{maxHeight:400},helpText:{fontSize:14,lineHeight:22},settingsLabel:{fontSize:16,fontWeight:'bold',marginBottom:12},themeGrid:{flexDirection:'row',flexWrap:'wrap',gap:12},themeCard:{width:100,padding:16,borderRadius:16,alignItems:'center',justifyContent:'center'},themeEmoji:{fontSize:32,marginBottom:6},themeName:{fontSize:12,fontWeight:'600'},speedButtons:{flexDirection:'column',gap:10},speedButton:{paddingVertical:12,borderRadius:12,alignItems:'center',borderWidth:1},speedButtonText:{fontSize:13,fontWeight:'600'},toggleButton:{flexDirection:'row',alignItems:'center',justifyContent:'center',gap:10,paddingVertical:12,borderRadius:12,borderWidth:1},toggleButtonText:{fontSize:14,fontWeight:'600'},gameOverCard:{borderRadius:24,padding:36,alignItems:'center',width:'100%',maxWidth:340,borderWidth:3},gameOverTitle:{fontSize:24,fontWeight:'bold',marginTop:14,marginBottom:6,textAlign:'center'},gameOverReason:{fontSize:14,marginBottom:24,textAlign:'center'},gameOverButtons:{flexDirection:'row',gap:14},gameOverBtnPrimary:{paddingVertical:12,paddingHorizontal:20,borderRadius:14},gameOverBtnPrimaryText:{color:'#fff',fontWeight:'700',fontSize:14},gameOverBtnSecondary:{paddingVertical:12,paddingHorizontal:20,borderRadius:14},gameOverBtnSecondaryText:{color:'#fff',fontWeight:'700',fontSize:14}});
