# 🚀 CRUD de Usuários - React Native & Node.js

Este é um projeto Full Stack que consiste em uma aplicação mobile (frontend) para gerenciamento de usuários e uma API REST (backend) para controlar os dados. A aplicação permite realizar operações de Criar, Ler, Atualizar e Excluir (CRUD) usuários.

O principal diferencial é a inclusão de um formulário de endereço com integração à API **ViaCEP**, que preenche automaticamente os campos de endereço a partir da digitação do CEP.

---

## ✨ Features

-   **Listagem de Usuários**: Visualiza todos os usuários cadastrados no banco de dados.
-   **Cadastro de Usuário**: Adiciona um novo usuário com os seguintes dados:
    -   Matrícula
    -   Nome Completo
    -   Cursos (múltiplos, separados por vírgula)
    -   Endereço completo
-   **Atualização de Usuário**: Edita as informações de um usuário existente.
-   **Exclusão de Usuário**: Remove um usuário do sistema com diálogo de confirmação.
-   **Integração com ViaCEP**: Preenchimento automático de logradouro, bairro, cidade e estado ao digitar um CEP válido.

---

## 🛠️ Tecnologias Utilizadas

O projeto é dividido em duas partes principais:

**Frontend (Mobile)**
-   [React Native](https://reactnative.dev/)
-   [Expo](https://expo.dev/)
-   [React Native Paper](https://reactnativepaper.com/) (para componentes de UI)

**Backend (Servidor)**
-   [Node.js](https://nodejs.org/en/)
-   [Express.js](https://expressjs.com/pt-br/) (para o servidor API)
-   [MongoDB](https://www.mongodb.com/) (banco de dados NoSQL)
-   [Mongoose](https://mongoosejs.com/) (para modelagem dos dados do MongoDB)
-   [Dotenv](https://github.com/motdotla/dotenv) (para gerenciar variáveis de ambiente)

---

## 📋 Pré-requisitos

Antes de começar, você vai precisar ter instalado em sua máquina:
-   [Node.js](https://nodejs.org/en/) (que já vem com o npm)
-   [MongoDB](https://www.mongodb.com/try/download/community) (você pode instalar localmente ou usar um serviço em nuvem como o MongoDB Atlas)
-   O aplicativo **Expo Go** no seu celular (disponível na [App Store](https://apps.apple.com/us/app/expo-go/id982107779) e [Play Store](https://play.google.com/store/apps/details?id=host.exp.exponent&hl=pt_BR&gl=US))

---

## ⚙️ Como Executar o Projeto

Siga os passos abaixo para configurar e rodar a aplicação localmente.

### 1. Clonar o Repositório

```bash
git clone [https://github.com/luizriato/DispositivosMoveisII.git](https://github.com/luizriato/DispositivosMoveisII.git)
cd nome-do-projeto
```

### 2. Configurando o Backend (Servidor)

O backend é responsável por se conectar ao banco de dados e fornecer os dados para o aplicativo.

**a) Navegue até a pasta do servidor:**
*Supondo que seus arquivos de backend estão em uma pasta chamada `backend`.*
```bash
cd backend
```

**b) Instale as dependências:**
```bash
npm install
```

**c) Crie e configure o arquivo `.env`:**
Este arquivo é crucial para armazenar suas variáveis de ambiente de forma segura, como a chave de conexão do banco de dados.

Crie um arquivo chamado `.env` na raiz da pasta `backend` e adicione o seguinte conteúdo:

```env
# String de conexão do seu banco de dados MongoDB
# Se for local: MONGODB_URI=mongodb://localhost:27017/nome-do-banco
# Se for do Atlas: MONGODB_URI=mongodb+srv://<user>:<password>@cluster.mongodb.net/test
MONGODB_URI=SUA_CONNECTION_STRING_DO_MONGODB

# Porta em que o servidor irá rodar
PORT=3000
```
> **Importante:** Substitua `SUA_CONNECTION_STRING_DO_MONGODB` pela string de conexão real do seu banco de dados MongoDB.

**d) Inicie o servidor:**
Execute o comando abaixo para iniciar a API. O arquivo principal do servidor deve se chamar `server.js` (ou `index.js`, ajuste conforme o seu projeto).

```bash
node server.js
```

Se tudo der certo, você verá a mensagem `MongoDB connected...` e `Example app listening on http://localhost:3000` no seu terminal.

### 3. Configurando o Frontend (Aplicativo Mobile)

Com o backend rodando, agora vamos iniciar o aplicativo React Native.

**a) Navegue até a pasta do frontend:**
*Abra um **novo terminal** e, da raiz do projeto, navegue até a pasta do app (vamos chamá-la de `frontend`).*
```bash
cd frontend
```

**b) Instale as dependências:**
```bash
npm install
```

**c) Inicie o ambiente de desenvolvimento Expo:**
Este comando irá iniciar o Metro Bundler, que é responsável por "montar" seu aplicativo.

```bash
npx expo start
```

**d) Execute o aplicativo:**
Após o comando anterior, uma página será aberta no seu navegador e um QR Code aparecerá no terminal.
1.  Abra o aplicativo **Expo Go** no seu celular.
2.  Escaneie o QR Code exibido no terminal.
3.  O aplicativo será carregado no seu celular. Certifique-se de que seu computador e seu celular estão na **mesma rede Wi-Fi**.

Pronto! Agora você tem o backend e o frontend rodando e pode testar todas as funcionalidades da aplicação.