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
- MongoDB para armazenamento de dados

## Como Executar

1. Clone o repositório
2. Instale as dependências:
   ```
   npm install
   ```
3. Configure o MongoDB:
   - Crie um arquivo `.env.local` com as variáveis de ambiente necessárias (veja `.env.example`)
   - Ou execute `node scripts/check-mongodb-config.js` para verificar a configuração
   - Para mais detalhes, veja o [Guia de Configuração do MongoDB](MONGODB_SETUP.md)
4. Execute o servidor de desenvolvimento:
   ```
   npm run dev
   ```
5. Acesse o aplicativo em: [http://localhost:3000](http://localhost:3000)

## Estrutura do Projeto

- `/app` - Páginas da aplicação Next.js
- `/components` - Componentes React reutilizáveis
- `/lib` - Lógica do jogo e algoritmos
- `/models` - Modelos de dados para MongoDB
- `/public/pieces` - Imagens SVG das peças de xadrez

## Design

O design do aplicativo é inspirado em aplicativos de xadrez populares com:
- Preto e branco para o tabuleiro
- Acentos em dourado para detalhes
- Tonalidades de madeira para o cenário
- Gradientes sutis para profundidade

## Scripts de Desenvolvimento

- `git-commit.bat` - Facilita o processo de commit das alterações
- `git-push.bat` - Automatiza o processo de enviar alterações para o GitHub
- `push-github.bat` - Versão simplificada para enviar para o GitHub
- `npm-clean.bat` - Limpa caches e reinstala dependências (solução de problemas)
- `scripts/check-mongodb.js` - Verifica se o MongoDB está instalado e configurado

## CI/CD

O projeto utiliza GitHub Actions para automação de integração contínua. Veja o arquivo `.github/workflows/main.yml` para mais detalhes 