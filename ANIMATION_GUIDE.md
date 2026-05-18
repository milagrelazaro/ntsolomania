# Guia de Implementação de Animações Realistas - Ntxuva

## Mudanças Necessárias no App.js

### 1. Adicionar Estados para Animação
```javascript
const [animationSteps, setAnimationSteps] = useState([]);
const [currentStepIndex, setCurrentStepIndex] = useState(-1);
const [isAnimating, setIsAnimating] = useState(false);
```

### 2. Ajustar Velocidades
```javascript
const SPEED_OPTIONS = [
  { label: 'Muito Lenta', value: 1200 },
  { label: 'Lenta', value: 800 },
  { label: 'Normal', value: 500 },
  { label: 'Rápida', value: 300 },
  { label: 'Muito Rápida', value: 150 },
];
```

### 3. Função para Tocar Som (Web Audio API)
```javascript
const playDropSound = useCallback(() => {
  if (!soundEnabled) return;
  const audioContext = new (window.AudioContext || window.webkitAudioContext)();
  const oscillator = audioContext.createOscillator();
  const gainNode = audioContext.createGain();
  
  oscillator.connect(gainNode);
  gainNode.connect(audioContext.destination);
  
  oscillator.frequency.value = 800;
  oscillator.type = 'sine';
  
  gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
  gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
  
  oscillator.start(audioContext.currentTime);
  oscillator.stop(audioContext.currentTime + 0.1);
}, [soundEnabled]);
```

### 4. Executar Animação Passo a Passo
```javascript
const executeMove = useCallback((idx, player) => {
  if (gameOver || isAnimating) return;
  const moves = getValidMoves(board, player);
  if (!moves.includes(idx)) return;

  const steps = calculateMoveSteps(board, idx, player);
  setAnimationSteps(steps);
  setCurrentStepIndex(0);
  setIsAnimating(true);
}, [board, gameOver, isAnimating]);

useEffect(() => {
  if (!isAnimating || currentStepIndex < 0 || currentStepIndex >= animationSteps.length) {
    if (isAnimating && currentStepIndex >= animationSteps.length) {
      // Animação completa
      const finalStep = animationSteps[animationSteps.length - 1];
      setBoard(finalStep.board);
      setIsAnimating(false);
      setCurrentStepIndex(-1);
      setAnimationSteps([]);
      
      const nextPlayer = currentPlayer === 1 ? 2 : 1;
      const over = checkGameOver(finalStep.board, nextPlayer);
      if (over.over) {
        setGameOver(over);
      } else {
        setCurrentPlayer(nextPlayer);
      }
    }
    return;
  }

  const step = animationSteps[currentStepIndex];
  
  if (step.type === 'drop') {
    playDropSound();
    setCurrentAnimIdx(step.idx);
    if (step.board) {
      setBoard(step.board);
    }
  } else if (step.type === 'capture') {
    showMessage(`🎯 Capturou ${step.count} peça(s)!`);
    setCurrentAnimIdx(step.idx);
  } else if (step.type === 'pickup') {
    setCurrentAnimIdx(step.idx);
  }

  const timer = setTimeout(() => {
    setCurrentStepIndex(prev => prev + 1);
  }, animationSpeed);

  return () => clearTimeout(timer);
}, [isAnimating, currentStepIndex, animationSteps, animationSpeed]);
```

### 5. Renderizar Indicador Visual na Célula
```javascript
const renderCell = (idx) => {
  const count = board[idx];
  const isValid = validMoves.includes(idx);
  const isAnimating = currentAnimIdx === idx;
  const { row } = idxToRowCol(idx);
  const isAtk = row === IDX.P1_ATK || row === IDX.P2_ATK;

  return (
    <TouchableOpacity
      key={idx}
      onPress={() => handleCellPress(idx)}
      style={[
        styles.cell,
        {
          width: CELL_SIZE,
          height: CELL_SIZE,
          borderColor: isAtk ? theme.primary : theme.cellBorder,
          backgroundColor: theme.cellBg,
          borderWidth: isAtk ? 3 : 2,
        },
        isAnimating && { 
          borderColor: theme.accent, 
          borderWidth: 4,
          transform: [{ scale: 1.1 }],
          shadowColor: theme.accent,
          shadowOffset: { width: 0, height: 0 },
          shadowOpacity: 0.8,
          shadowRadius: 10,
          elevation: 10,
        },
        isValid && !animating && !gameOver && { borderColor: theme.accent },
      ]}
    >
      <View style={[styles.cellInner, { backgroundColor: 'rgba(0,0,0,0.3)' }]} />
      <SeedDots count={count} cellSize={CELL_SIZE} theme={theme} />
      {isAnimating && (
        <View style={styles.animIndicator}>
          <Text style={{ fontSize: CELL_SIZE * 0.4 }}>✋</Text>
        </View>
      )}
      {count === 0 && !isAnimating && (
        <Text style={[styles.cellIndex, { color: theme.text }]}>{idx + 1}</Text>
      )}
    </TouchableOpacity>
  );
};
```

### 6. Estilos Adicionais
```javascript
animIndicator: {
  position: 'absolute',
  top: -CELL_SIZE * 0.3,
  alignSelf: 'center',
  zIndex: 100,
},
```

## Resultado Esperado
- Cada peça é colocada uma de cada vez
- Som de "clique" ao colocar cada peça
- Indicador visual (mão) mostra onde a peça está sendo colocada
- Velocidade configurável (5 opções)
- Animação suave e realista
