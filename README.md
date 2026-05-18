# Ntxuva Game

O xadrez africano de Moçambique — agora no teu telemóvel.

## Setup

1. Instala dependências:
```bash
npm install
# ou
npx expo install
```

2. Corre em desenvolvimento:
```bash
npx expo start
```

## Build com EAS (Expo Application Services)

1. Instala o EAS CLI globalmente:
```bash
npm install -g eas-cli
```

2. Faz login na tua conta Expo:
```bash
eas login
```

3. Configura o projectId no `app.json` (obtido no dashboard do Expo):
```json
"extra": {
  "eas": {
    "projectId": "SEU-PROJECT-ID"
  }
}
```

4. Build para Android (APK):
```bash
eas build --platform android --profile preview
```

5. Build para iOS:
```bash
eas build --platform ios --profile production
```

## Regras do Jogo

- **Tabuleiro:** 4 fileiras × 6 colunas = 24 cavas
- **Início:** 2 peças em cada cava
- **Movimento:** Escolhe uma cava do teu lado, recolhe todas as peças e distribui 1 por cava no sentido **anti-horário**
- **Captura:** Se a última peça cair numa cava **vazia** da tua fileira de **Ataque**, capturas as peças do adversário na cava correspondente
- **Fase 2:** Quando todas as cavas têm no máximo 1 peça, cada peça move-se sozinha (1 cava de cada vez)
- **Objetivo:** Capturar todas as peças do adversário ou deixá-lo sem jogadas

## Modos de Jogo

- **Single Player:** Contra o computador (IA heurística)
- **Multiplayer Local:** 2 jogadores no mesmo dispositivo
