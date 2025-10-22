# App CRUD com SQLite - FATEC Votorantim

## Funcionalidades Implementadas

### ✅ Tela Splash
- Animação de entrada com fade e scale
- Gradiente de fundo
- Logo da FATEC Votorantim
- Indicador de carregamento
- Transição automática após 3 segundos

### ✅ Sistema de Autenticação
- **Tela de Login**: Email e senha com validação
- **Tela de Cadastro**: Formulário completo com validações
- **Autenticação SQLite**: Verificação de credenciais no banco local
- **Navegação entre telas**: Login ↔ Cadastro

### ✅ Banco de Dados SQLite
- **Configuração completa**: Baseada no arquivo Bd.tsx fornecido
- **Tabelas criadas**:
  - `usuario`: Para autenticação e cadastro
  - `funcionario`: Para o CRUD de funcionários
  - `funcao`: Para funções dos funcionários
  - `cargo`: Para cargos com relacionamentos
- **Relacionamentos**: Chaves estrangeiras com regras de integridade
- **Inicialização automática**: Banco criado na primeira execução

### ✅ CRUD Completo
- **Create**: Cadastro de novos funcionários
- **Read**: Listagem com busca e filtros
- **Update**: Edição de dados existentes
- **Delete**: Remoção com confirmação
- **Interface moderna**: Material Design com React Native Paper

### ✅ Navegação
- **Stack Navigator**: Navegação entre telas
- **Autenticação**: Controle de acesso baseado em login
- **Logout**: Botão de sair com confirmação
- **Header**: Barra superior com ações

## Estrutura do Projeto

```
src/
├── components/          # Componentes reutilizáveis
│   ├── DeleteConfirmationDialog.js
│   ├── UserDetailsModal.js
│   ├── UserFormModal.js
│   └── UserList.js
├── navigation/         # Configuração de navegação
│   └── AppNavigator.js
├── screens/           # Telas da aplicação
│   ├── SplashScreen.js
│   ├── LoginScreen.js
│   ├── RegisterScreen.js
│   └── UserListScreen.js
├── services/          # Serviços e APIs
│   ├── database.js    # Configuração SQLite
│   └── sqliteService.js # Serviço CRUD
└── App.js            # Componente principal
```

## Tecnologias Utilizadas

- **React Native**: Framework principal
- **Expo**: Plataforma de desenvolvimento
- **SQLite**: Banco de dados local (expo-sqlite)
- **React Navigation**: Navegação entre telas
- **React Native Paper**: Componentes Material Design
- **Expo Linear Gradient**: Gradientes visuais

## Como Executar

1. **Instalar dependências**:
   ```bash
   npm install
   ```

2. **Executar o projeto**:
   ```bash
   npm start
   # ou
   expo start
   ```

3. **Executar no dispositivo**:
   - Android: `expo start --android`
   - iOS: `expo start --ios`

## Funcionalidades de Segurança

- **Validação de formulários**: Campos obrigatórios e formatos
- **Autenticação segura**: Verificação de credenciais
- **Confirmações**: Diálogos para ações destrutivas
- **Integridade de dados**: Relacionamentos e constraints

## Banco de Dados

### Tabela Usuario
- `id`: Chave primária
- `nome`: Nome completo
- `email`: Email único
- `senha`: Senha criptografada
- `data_nascimento`: Data de nascimento
- `matricula`: Matrícula opcional
- `endereco`: Endereço em JSON

### Tabela Funcionario
- `id`: Chave primária
- `nome`: Nome do funcionário
- `email`: Email único
- `data_nascimento`: Data de nascimento

### Relacionamentos
- **Funcionario → Cargo**: 1:N
- **Funcao → Cargo**: 1:1
- **Integridade referencial**: ON DELETE CASCADE/SET NULL

## Melhorias Implementadas

1. **Interface moderna**: Gradientes e animações
2. **UX aprimorada**: Feedback visual e confirmações
3. **Performance**: Banco local SQLite
4. **Segurança**: Validações e autenticação
5. **Navegação**: Fluxo intuitivo entre telas
6. **Responsividade**: Adaptação a diferentes telas

## Próximos Passos Sugeridos

- [ ] Implementar criptografia de senhas
- [ ] Adicionar recuperação de senha
- [ ] Implementar backup/restore
- [ ] Adicionar relatórios
- [ ] Implementar busca avançada
- [ ] Adicionar notificações push
