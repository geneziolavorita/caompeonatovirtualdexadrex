# Configuração do MongoDB para o Projeto XADREX

Este guia explica como configurar o MongoDB para o projeto XADREX, incluindo instruções para ambiente local de desenvolvimento e para o GitHub.

## Requisitos

- MongoDB instalado localmente (recomendado para desenvolvimento) OU
- Uma conta MongoDB Atlas (recomendado para produção)
- Node.js 18 ou superior

## Configuração Local

### Instalando MongoDB Community Edition

#### Windows
1. Baixe o instalador do [MongoDB Community Server](https://www.mongodb.com/try/download/community)
2. Execute o instalador e siga as instruções (opção de instalação completa recomendada)
3. O MongoDB será executado como um serviço do Windows

#### macOS
```bash
# Usando Homebrew
brew tap mongodb/brew
brew install mongodb-community
brew services start mongodb-community
```

#### Linux (Ubuntu/Debian)
```bash
# Instale o MongoDB
sudo apt update
sudo apt install -y mongodb

# Inicie o serviço
sudo systemctl start mongodb
sudo systemctl enable mongodb
```

### Verificando a Instalação

Para testar se o MongoDB está funcionando:

```bash
# Verifique o status do serviço
mongod --version

# Conecte ao MongoDB
mongosh
```

Se o comando `mongosh` abrir um shell do MongoDB, a instalação está funcionando.

## Configuração do Projeto

1. Crie um arquivo `.env.local` na raiz do projeto com as seguintes variáveis:

```
MONGODB_URI=mongodb://localhost:27017/xadrex
MONGODB_URI_FALLBACK=mongodb://localhost:27017/xadrex
NODE_ENV=development
```

2. Execute o script de verificação do MongoDB:

```bash
node scripts/check-mongodb-config.js
```

3. Teste a conexão com o MongoDB:

```bash
node scripts/test-mongodb-connection.js
```

## Usando MongoDB Atlas (Opcional)

Para ambientes de produção, recomendamos o MongoDB Atlas:

1. Crie uma conta em [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Crie um novo cluster (a opção gratuita é suficiente para início)
3. Configure um usuário e senha
4. Configure a Lista de IPs Permitidos (adicione seu IP ou 0.0.0.0/0 para acesso de qualquer lugar)
5. Obtenha a string de conexão e substitua em `.env.local`:

```
MONGODB_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/xadrex?retryWrites=true&w=majority
MONGODB_URI_FALLBACK=mongodb://localhost:27017/xadrex
```

## Configuração para GitHub Actions

Para que seu CI/CD funcione corretamente com o MongoDB:

1. Vá para o seu repositório no GitHub
2. Acesse Settings > Secrets and variables > Actions
3. Adicione um novo repositório secret:
   - Nome: `MONGODB_URI`
   - Valor: sua string de conexão do MongoDB

O arquivo `.github/workflows/main.yml` já está configurado para usar essa variável secreta.

## Solução de Problemas

### Não consegue conectar ao MongoDB
- Verifique se o serviço MongoDB está rodando: `sudo systemctl status mongodb` (Linux) ou Serviços do Windows
- Verifique seu arquivo `.env.local`
- Para MongoDB Atlas: verifique se seu IP está na lista de IPs permitidos

### Erros no CI/CD
- Verifique se o segredo `MONGODB_URI` está configurado corretamente no GitHub
- Certifique-se de que a string de conexão usa o formato correto para o MongoDB que você está utilizando 