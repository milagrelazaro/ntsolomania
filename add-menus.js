const fs = require('fs');

console.log('🎨 Adicionando Menus Visuais...\n');

let app = fs.readFileSync('App.js', 'utf8');

// Menu de Configuração - inserir antes do menu principal
const configMenu = `
// Menu de Configuracao
if(showConfig)return <LinearGradient colors={theme.bg} style={styles.container}><StatusBar barStyle="light-content"/><SafeAreaView style={styles.container}><View style={styles.menuContainer}><Text style={[styles.menuTitle,{color:theme.text,marginBottom:30}]}>⚙️ Configuracoes</Text><ScrollView showsVerticalScrollIndicator={false} style={{width:'100%',maxWidth:400}}><Text style={[styles.settingsLabel,{color:theme.text}]}>Tamanho do Tabuleiro</Text><View style={styles.configGrid}>{BOARD_SIZES.map((size,i)=><TouchableOpacity key={i} style={[styles.configCard,{backgroundColor:boardSize.name===size.name?theme.primary:theme.cellBg,borderColor:boardSize.name===size.name?theme.accent:theme.cellBorder}]} onPress={()=>setBoardSize(size)}><Text style={[styles.configLabel,{color:theme.text}]}>{size.label}</Text><Text style={[styles.configDesc,{color:theme.text,opacity:0.7}]}>{size.cols}x4 = {size.cols*4} casas</Text></TouchableOpacity>)}</View><Text style={[styles.settingsLabel,{color:theme.text,marginTop:20}]}>Tipo de Pecas</Text><View style={styles.configGrid}>{PIECE_TYPES.map((type,i)=><TouchableOpacity key={i} style={[styles.configCard,{backgroundColor:pieceType.name===type.name?theme.primary:theme.cellBg,borderColor:pieceType.name===type.name?theme.accent:theme.cellBorder}]} onPress={()=>setPieceType(type)}><Text style={{fontSize:32,marginBottom:4}}>{type.emoji}</Text><Text style={[styles.configLabel,{color:theme.text}]}>{type.name}</Text></TouchableOpacity>)}</View><Text style={[styles.settingsLabel,{color:theme.text,marginTop:20}]}>Nivel da IA</Text><View style={styles.configGrid}>{AI_LEVELS.map((level,i)=><TouchableOpacity key={i} style={[styles.configCard,{backgroundColor:aiLevel.name===level.name?theme.primary:theme.cellBg,borderColor:aiLevel.name===level.name?theme.accent:theme.cellBorder}]} onPress={()=>setAiLevel(level)}><Text style={{fontSize:28,marginBottom:4}}>{level.icon}</Text><Text style={[styles.configLabel,{color:theme.text}]}>{level.name}</Text><Text style={[styles.configDesc,{color:theme.text,opacity:0.7,fontSize:10}]}>{level.desc}</Text></TouchableOpacity>)}</View><View style={{marginTop:30}}><TouchableOpacity style={[styles.toggleButton,{backgroundColor:learnerMode?theme.primary:theme.cellBg,borderColor:theme.cellBorder}]} onPress={()=>setLearnerMode(!learnerMode)}><Ionicons name={learnerMode?'school':'school-outline'} size={20} color={theme.text}/><Text style={[styles.toggleButtonText,{color:theme.text}]}>Modo Aprendiz {learnerMode?'Ligado':'Desligado'}</Text></TouchableOpacity></View></ScrollView><TouchableOpacity style={[styles.menuButton,{backgroundColor:theme.primary,marginTop:30}]} onPress={()=>setShowConfig(false)}><Ionicons name="checkmark-circle" size={20} color="#fff"/><Text style={styles.menuButtonText}>Pronto</Text></TouchableOpacity></View></SafeAreaView></LinearGradient>;
`;

// Encontrar o menu principal (if(!mode)return)
const menuIdx = app.indexOf('if(!mode)return');
if (menuIdx > 0) {
  app = app.slice(0, menuIdx) + configMenu + '\n' + app.slice(menuIdx);
  console.log('✅ Menu de configuração adicionado');
} else {
  console.log('⚠️ Não encontrou menu principal');
}

// Adicionar botão de configuração no menu principal
const configButton = `<TouchableOpacity style={[styles.menuButton,{borderWidth:2,borderColor:theme.accent}]} onPress={()=>setShowConfig(true)} activeOpacity={0.8}><Ionicons name="settings" size={20} color={theme.text}/><Text style={[styles.menuButtonText,{color:theme.text}]}>Configuracoes Educativas</Text></TouchableOpacity>`;

// Inserir antes do botão "Como Jogar"
const helpButtonIdx = app.indexOf('<TouchableOpacity style={[styles.menuButton,{borderWidth:2,borderColor:theme.cellBorder}]} onPress={()=>setShowHelp(true)}');
if (helpButtonIdx > 0) {
  app = app.slice(0, helpButtonIdx) + configButton + app.slice(helpButtonIdx);
  console.log('✅ Botão de configuração adicionado ao menu');
}

// Adicionar estilos para os novos componentes
const newStyles = `,configGrid:{flexDirection:'row',flexWrap:'wrap',gap:12,marginTop:12},configCard:{width:100,padding:12,borderRadius:12,alignItems:'center',justifyContent:'center',borderWidth:2},configLabel:{fontSize:12,fontWeight:'600',textAlign:'center'},configDesc:{fontSize:10,textAlign:'center',marginTop:2}`;

// Inserir antes do último }
const lastBraceIdx = app.lastIndexOf('});');
if (lastBraceIdx > 0) {
  app = app.slice(0, lastBraceIdx) + newStyles + app.slice(lastBraceIdx);
  console.log('✅ Estilos adicionados');
}

// Modificar renderCell para mostrar cores do modo aprendiz
const learnerModeRender = `
const renderCell=idx=>{const count=board[idx],isValid=validMoves.includes(idx),isHighlighted=currentAnimIdx===idx,{row}=idxToRowCol(idx),isAtk=row===IDX.P1_ATK||row===IDX.P2_ATK;const analysis=moveAnalysis[idx];let borderColor=isAtk?theme.primary:theme.cellBorder;if(learnerMode&&analysis){if(analysis.quality==='excelente')borderColor='#10B981';else if(analysis.quality==='boa')borderColor='#FBBF24';else if(analysis.quality==='media')borderColor='#F97316';else if(analysis.quality==='ruim')borderColor='#EF4444';}return <TouchableOpacity key={idx} onPress={()=>handleCellPress(idx)} activeOpacity={isValid&&!isAnimating&&!gameOver?0.6:1} disabled={!isValid||isAnimating||gameOver} style={[styles.cell,{width:CELL_SIZE,height:CELL_SIZE,borderColor,backgroundColor:theme.cellBg,borderWidth:isAtk?3:2},isHighlighted&&{borderColor:theme.accent,borderWidth:4,transform:[{scale:1.1}],shadowColor:theme.accent,shadowOffset:{width:0,height:0},shadowOpacity:0.8,shadowRadius:10,elevation:10},isValid&&!isAnimating&&!gameOver&&{opacity:1},count===0&&{opacity:0.5}]}><View style={[styles.cellInner,{backgroundColor:'rgba(0,0,0,0.3)'}]}/><SeedDots count={count} cellSize={CELL_SIZE} theme={theme}/>{isHighlighted&&<View style={styles.animIndicator}><Text style={{fontSize:CELL_SIZE*0.4}}>✋</Text></View>}{learnerMode&&analysis&&<View style={{position:'absolute',top:2,right:2,backgroundColor:borderColor,borderRadius:8,padding:2,minWidth:20}}><Text style={{color:'#fff',fontSize:9,fontWeight:'bold',textAlign:'center'}}>{Math.round(analysis.score)}</Text></View>}{count===0&&!isHighlighted&&<Text style={[styles.cellIndex,{color:theme.text}]}>{idx+1}</Text>}</TouchableOpacity>};
`;

// Substituir renderCell antiga
const renderCellIdx = app.indexOf('const renderCell=idx=>');
if (renderCellIdx > 0) {
  const endIdx = app.indexOf('};', renderCellIdx) + 2;
  app = app.slice(0, renderCellIdx) + learnerModeRender + app.slice(endIdx);
  console.log('✅ renderCell atualizada com modo aprendiz');
}

// Salvar
fs.writeFileSync('App.js', app);
console.log('\n✅ Menus visuais adicionados!');
console.log('📦 Tamanho final:', app.length, 'caracteres');
console.log('\n🎨 Interface completa:');
console.log('  ✅ Menu de configuração com seleção visual');
console.log('  ✅ Seleção de tamanho de tabuleiro (4 opções)');
console.log('  ✅ Seleção de tipo de peças (6 opções)');
console.log('  ✅ Seleção de nível de IA (4 opções)');
console.log('  ✅ Toggle para Modo Aprendiz');
console.log('  ✅ Cores nas jogadas (Verde/Amarelo/Laranja/Vermelho)');
console.log('  ✅ Pontuação visível em cada casa');
console.log('\n🎮 Pronto para testar!');
