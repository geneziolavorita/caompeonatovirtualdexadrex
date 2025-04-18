# Configuração do MongoDB para o Sistema de Xadrez

Este sistema utiliza MongoDB como banco de dados. Você pode usar uma instalação local do MongoDB ou o MongoDB Atlas (serviço em nuvem).

## Opção 1: MongoDB Atlas (Recomendado para produção)

1. Crie uma conta em [MongoDB Atlas](https://www.mongodb.com/cloud/atlas/register)
2. Crie um novo cluster (o plano gratuito é suficiente para início)
3. Configure a Network Access para permitir conexões do seu IP ou use 0.0.0.0/0 para permitir qualquer IP (não recomendado para produção)
4. Crie um usuário de banco de dados em Database Access
5. Obtenha a string de conexão em Databases > Connect > Connect your application
6. Substitua no arquivo `.env.local` a variável `MONGODB_URI` pela string de conexão obtida:

```
MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.example.mongodb.net/xadrex?retryWrites=true&w=majority
```

Lembre-se de substituir `<username>` e `<password>` pelos dados do seu usuário criado no MongoDB Atlas.

## Opção 2: MongoDB Local (Para desenvolvimento)

1. [Instale o MongoDB Community Edition](https://www.mongodb.com/docs/manual/administration/install-community/) no seu sistema
2. Inicie o serviço do MongoDB
3. Use a configuração padrão no `.env.local`:

```
MONGODB_URI=mongodb://localhost:27017/xadrex
```

## Verificando a Conexão

Após configurar o MongoDB, inicie a aplicação e verifique no console do servidor se aparece a mensagem "Conectado ao MongoDB". 