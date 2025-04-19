# Configuração do Netlify para o Projeto XADREX

Este guia explica como configurar o Netlify para o projeto XADREX, focando na configuração do MongoDB.

## Variáveis de Ambiente no Netlify

É importante configurar as variáveis de ambiente no Netlify em vez de incluí-las no arquivo `netlify.toml`. Isso garante que informações sensíveis como credenciais do banco de dados não sejam expostas no controle de versão.

### Configurar Variáveis de Ambiente

1. No dashboard do Netlify, vá para seu site
2. Navegue até **Site settings** > **Environment variables**
3. Adicione as seguintes variáveis:

| Chave | Valor | Descrição |
|-------|-------|-----------|
| `MONGODB_URI` | `mongodb+srv://...` | URL de conexão do MongoDB Atlas |
| `MONGODB_CONNECT_TIMEOUT` | `30000` | Tempo limite para conexão (ms) |
| `MONGODB_SOCKET_TIMEOUT` | `75000` | Tempo limite para socket (ms) |

### Importante: Segurança

- **NUNCA** inclua credenciais diretas no arquivo `netlify.toml`, pois este arquivo é versionado no repositório
- Use MongoDB Atlas para produção, não tente conectar ao MongoDB local
- Certifique-se de adicionar o IP do Netlify (ou `0.0.0.0/0`) à lista de IPs permitidos no MongoDB Atlas

## Modo de Build do Netlify

O projeto está configurado para usar o plugin Next.js do Netlify que otimiza o build e o deploy de aplicações Next.js:

```toml
[[plugins]]
  package = "@netlify/plugin-nextjs"
```

## Solução de Problemas

Se houver falhas no build, verifique:

1. As variáveis de ambiente no painel do Netlify
2. Os logs de build para erros específicos
3. Se o MongoDB Atlas está acessível e o URI de conexão está correto
4. Se há erros de TypeScript que precisam ser corrigidos (como o erro de Fullscreen API)

## Atualizações de Segurança

Caso você precise atualizar a string de conexão do MongoDB:

1. Gere uma nova string de conexão no MongoDB Atlas
2. Atualize a variável de ambiente `MONGODB_URI` no Netlify
3. Acione um novo deploy manualmente ou enviando um commit

Isso garante que você possa atualizar credenciais sem precisar modificar o código. 