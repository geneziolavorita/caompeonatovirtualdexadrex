# Guia Rápido do MongoDB para XADREX

Este guia contém instruções rápidas para configurar o MongoDB para o projeto XADREX.

## Configuração Rápida

1. **Verificar configuração atual**:
   ```bash
   node scripts/check-mongodb-config.js
   ```

2. **Testar conexão**:
   ```bash
   node scripts/test-mongodb-connection.js
   ```

3. **Arquivo de ambiente**:
   Crie um arquivo `.env.local` na raiz do projeto com:
   ```
   MONGODB_URI=mongodb://localhost:27017/xadrex
   MONGODB_URI_FALLBACK=mongodb://localhost:27017/xadrex
   NODE_ENV=development
   ```

## Solução de Problemas

Se ocorrer o erro `MONGODB_URI não definida no ambiente`:

1. Verifique se o arquivo `.env.local` existe e tem a variável `MONGODB_URI`
2. Reinicie o servidor Next.js com `npm run dev`
3. Se estiver usando Windows, use `set MONGODB_URI=mongodb://localhost:27017/xadrex` antes de iniciar

## Verificação Rápida

Para executar uma verificação completa das dependências e do MongoDB:

```bash
./check-dependencies.bat
```

## Para o GitHub

Antes de enviar para o GitHub, certifique-se de que:

1. O arquivo `.env.local` está no `.gitignore` 
2. Você configurou o segredo `MONGODB_URI` nas configurações do GitHub (Settings > Secrets > Actions)
3. Use o script de atualização para enviar ao GitHub:
   ```bash
   ./push-github.bat
   ```

Para mais detalhes, consulte o [Guia Completo de Configuração do MongoDB](MONGODB_SETUP.md). 