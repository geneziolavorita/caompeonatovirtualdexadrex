# GitHub Actions Workflow para XADREX

Este diretório contém as configurações de CI/CD (Integração Contínua/Entrega Contínua) para o projeto XADREX.

## Configuração Necessária

Para que os workflows funcionem corretamente, você precisa configurar alguns segredos no seu repositório GitHub:

### Segredos Obrigatórios

1. **MONGODB_URI**: String de conexão para seu banco de dados MongoDB
   - Exemplo para MongoDB Atlas: `mongodb+srv://<username>:<password>@<cluster>.mongodb.net/xadrex?retryWrites=true&w=majority`
   - Exemplo para MongoDB local: `mongodb://localhost:27017/xadrex` (não recomendado para produção)

### Como Configurar Segredos no GitHub

1. No seu repositório, vá para **Settings**
2. No menu lateral, clique em **Secrets and variables > Actions**
3. Clique no botão **New repository secret**
4. Adicione o nome do segredo (`MONGODB_URI`) e o valor correspondente
5. Clique em **Add secret** para salvar

## Workflow Principal (main.yml)

O arquivo `main.yml` define o fluxo de CI/CD principal, que inclui:

- Instalação de dependências
- Compilação do projeto
- Execução de testes (quando implementados)
- Cache de dependências para melhorar a velocidade das execuções futuras

Este workflow é executado automaticamente quando:
- Código é enviado para as branches `main` ou `master`
- Um pull request é aberto para as branches `main` ou `master`

## Personalização

Para adicionar etapas de deploy ou outras automações, você pode editar o arquivo `main.yml` e descomentar/adicionar as etapas necessárias. 