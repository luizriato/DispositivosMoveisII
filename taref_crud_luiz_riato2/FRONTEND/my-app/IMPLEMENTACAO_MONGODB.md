# Implementação da Escolha entre SQLite e MongoDB

## Resumo das Mudanças

Este documento descreve as mudanças implementadas para permitir que o usuário escolha entre usar SQLite ou MongoDB ao fazer login.

## Arquivos Criados

1. **`src/contexts/DatabaseContext.js`**
   - Contexto React para gerenciar qual banco de dados está sendo usado (SQLite ou MongoDB)
   - Permite que qualquer componente acesse e altere o tipo de banco

2. **`src/services/mongoService.js`**
   - Serviço completo com todas as funções CRUD para MongoDB
   - Implementado usando chamadas HTTP para uma API backend (padrão para React Native)
   - Todas as funções são equivalentes às do SQLite

3. **`src/services/unifiedDatabase.js`**
   - Serviço unificado que escolhe automaticamente entre SQLite e MongoDB
   - Todas as funções CRUD chamam o serviço apropriado baseado no tipo escolhido
   - Simplifica o uso nas telas e componentes

4. **`src/Conf/BdWrapper.tsx`**
   - Wrapper que adapta as funções do `Bd.tsx` para usar o serviço unificado
   - Mantém compatibilidade com código existente que usa `Bd.tsx`

## Arquivos Modificados

1. **`src/App.js`**
   - Adicionado `DatabaseProvider` para envolver toda a aplicação

2. **`src/screens/LoginScreen.js`**
   - Adicionado seletor de banco de dados (SQLite ou MongoDB) antes dos campos de login
   - Salva a escolha no contexto ao fazer login
   - Inicializa o banco escolhido antes de autenticar

3. **`src/screens/RegisterScreen.js`**
   - Atualizado para usar o serviço unificado
   - Usa o banco escolhido no login (ou SQLite por padrão)

4. **`src/navigation/AppNavigator.js`**
   - Atualizado para considerar o tipo de banco escolhido na inicialização

## Como Usar

### Para o Usuário

1. Ao abrir a tela de login, você verá um seletor para escolher entre SQLite e MongoDB
2. Selecione o banco desejado
3. Preencha email e senha
4. Faça login normalmente
5. Todo o CRUD funcionará com o banco escolhido

### Para Desenvolvedores

#### Configurar MongoDB

1. Crie um arquivo `.env` na raiz do projeto com:
   ```
   MONGO_API_URL=http://localhost:3000/api/mongo
   ```
   Ou configure sua URL de API MongoDB

2. Se você ainda não tem uma API backend para MongoDB, você precisará criar uma que:
   - Conecte ao MongoDB
   - Expõe endpoints REST para todas as operações CRUD
   - Endpoints esperados (veja `mongoService.js` para detalhes):
     - `GET /api/mongo/usuario`
     - `POST /api/mongo/usuario`
     - `PUT /api/mongo/usuario/:id`
     - `DELETE /api/mongo/usuario/:id`
     - E assim por diante para Funcao, Funcionario, Cargo, UsuarioSistema

#### Usar o Serviço Unificado

```javascript
import { 
  initDatabase, 
  consultaFuncionarios, 
  inserirFuncionario 
} from '../services/unifiedDatabase';

// Inicializar (geralmente feito no login)
await initDatabase('sqlite'); // ou 'mongodb'

// Usar as funções normalmente
const funcionarios = await consultaFuncionarios();
const novoId = await inserirFuncionario('Nome', 'email@test.com', '2000-01-01');
```

#### Usar o Contexto

```javascript
import { useDatabase } from '../contexts/DatabaseContext';

function MeuComponente() {
  const { databaseType, selectDatabase } = useDatabase();
  
  // Verificar qual banco está sendo usado
  console.log('Banco atual:', databaseType);
  
  // Mudar o banco (se necessário)
  selectDatabase('mongodb');
}
```

## Notas Importantes

1. **MongoDB requer API Backend**: Como estamos no React Native, o MongoDB não pode ser conectado diretamente. Você precisa de uma API backend que faça a conexão com o MongoDB.

2. **Compatibilidade**: O código existente que usa `Bd.tsx` continuará funcionando, mas será redirecionado para o serviço unificado quando MongoDB estiver selecionado.

3. **Persistência**: A escolha do banco é mantida apenas durante a sessão. Ao fechar e reabrir o app, o usuário precisará escolher novamente no login.

## Próximos Passos (Opcional)

1. **Persistir a escolha**: Salvar a escolha do banco no AsyncStorage para que o usuário não precise escolher toda vez
2. **API Backend**: Criar uma API Node.js/Express que conecta ao MongoDB e expõe os endpoints necessários
3. **Validação**: Adicionar validação de conexão MongoDB antes de permitir login
4. **Sincronização**: Implementar sincronização de dados entre SQLite e MongoDB se necessário

