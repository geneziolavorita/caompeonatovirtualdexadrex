# XADREX - Aplicativo de Xadrez

Um aplicativo de xadrez com interface amigável que permite jogar contra outro jogador ou contra o computador.

## Funcionalidades

- Tabuleiro de xadrez interativo com peças
- Possibilidade de jogar contra outro jogador (no mesmo dispositivo)
- Possibilidade de jogar contra o computador (IA)
- Regras completas de xadrez (incluindo capturas, xeque, xeque-mate, etc.)
- Manual de instruções/regras integrado
- Interface para registro de nome do jogador
- Design responsivo para funcionar em diferentes dispositivos

## Tecnologias Utilizadas

- Next.js (React)
- TypeScript
- TailwindCSS para estilização
- Chess.js para lógica do jogo de xadrez

## Como Executar

1. Clone o repositório
2. Instale as dependências:
   ```
   npm install
   ```
3. Execute o servidor de desenvolvimento:
   ```
   npm run dev
   ```
4. Acesse o aplicativo em: [http://localhost:3000](http://localhost:3000)

## Estrutura do Projeto

- `/app` - Páginas da aplicação Next.js
- `/components` - Componentes React reutilizáveis
- `/lib` - Lógica do jogo e algoritmos
- `/public/pieces` - Imagens SVG das peças de xadrez

## Design

O design do aplicativo é inspirado em aplicativos de xadrez populares com:
- Preto e branco para o tabuleiro
- Acentos em dourado para detalhes
- Tonalidades de madeira para o cenário
- Gradientes sutis para profundidade 