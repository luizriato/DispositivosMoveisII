import { Platform, Alert } from 'react-native';

// URL base da API, já com o prefixo /api/mongo
// Usa 10.0.2.2 para emulador Android
const MONGO_API_URL = Platform.OS === "android" 
    ? "http://10.0.2.2:3000/api/mongo" 
    : "http://localhost:3000/api/mongo";

// --- Funções de Conexão ---

/**
 * Simula a inicialização da conexão com a API
 * Retorna um objeto cliente ou null
 */
async function initMongoDatabase() {
  try {
    // Para React Native, apenas verificamos se a API está acessível (opcional)
    // A "conexão" real é feita em cada requisição fetch
    console.log("Inicializando serviço MongoDB (API)...");
    // Você pode adicionar um ping/health check aqui se quiser
    return { type: 'mongodb', connected: true };
  } catch (error) {
    console.log("Erro ao inicializar API MongoDB: " + error);
    return null;
  }
}

// Função wrapper para requisições fetch
async function request(endpoint, options = {}, isAuth = false) {
  try {
    const response = await fetch(`${MONGO_API_URL}${endpoint}`, options);
    
    // O 'response.ok' (status 200-299) não é suficiente para o login
    // Precisamos verificar o status 401 (Unauthorized) especificamente
    if (!response.ok) {
        if (response.status === 401 && isAuth) {
            // Se for 401 (Unauthorized) na autenticação, não é um "erro" de rede,
            // mas sim uma falha de login. Retornamos null para a lógica de login.
            console.log("Falha na autenticação (401): Usuário ou senha incorretos.");
            return null; 
        }
        // Para outros erros (400, 404, 500...)
        const errorData = await response.json();
        throw new Error(errorData.error || `Erro ${response.status}`);
    }

    // Se a resposta for OK, mas não tiver corpo (ex: DELETE)
    if (response.status === 204) {
        return { ok: true };
    }
    
    // Se for OK e tiver corpo
    return await response.json();

  } catch (error) {
    console.error(`Erro na API: ${options.method || 'GET'} ${endpoint}`, error);
    // Não use Alert.alert aqui, deixe a camada de UI (Screen) decidir
    // Apenas relance o erro para que a função chamadora (ex: handleRegister) possa pegá-lo
    throw error;
  }
}


// --- CRUD: Usuario ---

async function inserirUsuarioMongo(db, nome, email, senha, data_nascimento, matricula = null, endereco = null) {
  try {
    const data = await request('/usuario', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        nome,
        email,
        senha,
        data_nascimento,
        matricula,
        endereco
      })
    });
    // Se data for null ou não tiver _id, algo deu errado
    return data?._id || null;
  } catch (error) {
    console.log("Erro ao inserir usuário MongoDB: " + error.message);
    // Retorna null para indicar falha, a UI vai mostrar o Dialog de erro
    return null;
  }
}

async function consultaUsuariosMongo(db) {
  try {
    return await request('/usuario');
  } catch (error) {
    console.log("Erro ao consultar usuários MongoDB: " + error.message);
    return [];
  }
}

async function buscarUsuarioPorEmailMongo(db, email) {
  try {
    return await request(`/usuario/email/${email}`);
  } catch (error) {
    console.log("Erro ao buscar usuário por email MongoDB: " + error.message);
    return null;
  }
}

async function autenticarUsuarioMongo(db, email, senha) {
    try {
        // Passamos 'true' para indicar que esta é uma chamada de autenticação
        const data = await request('/usuario/auth', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, senha })
        }, true); // <--- true para isAuth

        // Se data for null (retornado pelo 401), ou não tiver user, a autenticação falhou
        if (!data || !data.user) {
            return null;
        }

        // Retorna o objeto do usuário (sem a senha, como o backend envia)
        return data.user;

    } catch (error) {
        // Erros de rede (servidor offline)
        console.log("Erro ao autenticar usuário MongoDB: " + error.message);
        Alert.alert("Erro de Conexão", "Não foi possível conectar ao servidor. Tente novamente.");
        return null;
    }
}


async function atualizarUsuarioMongo(db, id, nome, email, data_nascimento, matricula = null, endereco = null) {
  try {
    await request(`/usuario/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        nome,
        email,
        data_nascimento,
        matricula,
        endereco
      })
    });
    return true;
  } catch (error) {
    console.log("Erro ao atualizar usuário MongoDB: " + error.message);
    return false;
  }
}

async function deletarUsuarioMongo(db, id) {
  try {
    await request(`/usuario/${id}`, { method: 'DELETE' });
    return true;
  } catch (error) {
    console.log("Erro ao deletar usuário MongoDB: " + error.message);
    return false;
  }
}

// --- CRUD: Funcao ---

async function inserirFuncaoMongo(db, nome) {
  try {
    const data = await request('/funcao', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nome_funcao: nome })
    });
    return data?._id || null;
  } catch (error) {
    console.log("Erro ao inserir função MongoDB: " + error.message);
    return null;
  }
}

async function consultaFuncoesMongo(db) {
  try {
    return await request('/funcao');
  } catch (error) {
    console.log("Erro ao consultar funções MongoDB: " + error.message);
    return [];
  }
}

async function atualizarFuncaoMongo(db, id, nome) {
  try {
    await request(`/funcao/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nome_funcao: nome })
    });
    return true;
  } catch (error) {
    console.log("Erro ao atualizar função MongoDB: " + error.message);
    return false;
  }
}

async function deletarFuncaoMongo(db, id) {
  try {
    await request(`/funcao/${id}`, { method: 'DELETE' });
    return true;
  } catch (error) {
    console.log("Erro ao deletar função MongoDB: " + error.message);
    return false;
  }
}

// --- CRUD: Funcionario ---

async function inserirFuncionarioMongo(db, nome, email, data_nascimento) {
  try {
    const data = await request('/funcionario', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        nome,
        email,
        data_nascimento
      })
    });
    return data?._id || null;
  } catch (error) {
    console.log("Erro ao inserir funcionário MongoDB: " + error.message);
    return null;
  }
}

async function consultaFuncionariosMongo(db) {
  try {
    return await request('/funcionario');
  } catch (error) {
    console.log("Erro ao consultar funcionários MongoDB: " + error.message);
    return [];
  }
}

async function atualizarFuncionarioMongo(db, id, nome, email, data_nascimento) {
  try {
    await request(`/funcionario/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        nome,
        email,
        data_nascimento
      })
    });
    return true;
  } catch (error) {
    console.log("Erro ao atualizar funcionário MongoDB: " + error.message);
    return false;
  }
}

async function deletarFuncionarioMongo(db, id) {
  try {
    await request(`/funcionario/${id}`, { method: 'DELETE' });
    return true;
  } catch (error) {
    console.log("Erro ao deletar funcionário MongoDB: " + error.message);
    return false;
  }
}

// --- CRUD: Cargo ---

async function inserirCargoMongo(db, nome, idFuncionario, idFuncao) {
  try {
    const data = await request('/cargo', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        nome_cargo: nome,
        id_funcionario_fk: idFuncionario,
        id_funcao_fk: idFuncao
      })
    });
    return data?._id || null;
  } catch (error) {
    console.log("Erro ao inserir cargo MongoDB: " + error.message);
    return null;
  }
}

async function consultaCargosMongo(db) {
  try {
    return await request('/cargo');
  } catch (error) {
    console.log("Erro ao consultar cargos MongoDB: " + error.message);
    return [];
  }
}

async function consultaCargosCompletosMongo(db) {
  try {
    return await request('/cargo/completo');
  } catch (error) {
    console.log("Erro ao consultar cargos completos MongoDB: " + error.message);
    return [];
  }
}

async function atualizarCargoMongo(db, idCargo, nome, idFuncionario, idFuncao) {
  try {
    await request(`/cargo/${idCargo}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        nome_cargo: nome,
        id_funcionario_fk: idFuncionario,
        id_funcao_fk: idFuncao
      })
    });
    return true;
  } catch (error) {
    console.log("Erro ao atualizar cargo MongoDB: " + error.message);
    return false;
  }
}

async function deletarCargoMongo(db, id) {
  try {
    await request(`/cargo/${id}`, { method: 'DELETE' });
    return true;
  } catch (error) {
    console.log("Erro ao deletar cargo MongoDB: " + error.message);
    return false;
  }
}

// --- CRUD: UsuarioSistema ---
// (Adicione aqui se necessário, seguindo o padrão acima)
// Ex:
// async function inserirUsuarioSistemaMongo(...)
// ...

// Função para criar tabelas/coleções (apenas para manter a interface)
async function CriaTabelasMongo(db) {
  console.log("Coleções MongoDB são criadas dinamicamente.");
  return true;
}

export {
  initMongoDatabase,
  CriaTabelasMongo,
  // Usuario
  inserirUsuarioMongo,
  consultaUsuariosMongo,
  buscarUsuarioPorEmailMongo,
  autenticarUsuarioMongo,
  atualizarUsuarioMongo,
  deletarUsuarioMongo,
  // Funcao
  inserirFuncaoMongo,
  consultaFuncoesMongo,
  atualizarFuncaoMongo,
  deletarFuncaoMongo,
  // Funcionario
  inserirFuncionarioMongo,
  consultaFuncionariosMongo,
  atualizarFuncionarioMongo,
  deletarFuncionarioMongo,
  // Cargo
  inserirCargoMongo,
  consultaCargosMongo,
  consultaCargosCompletosMongo,
  atualizarCargoMongo,
  deletarCargoMongo,
  // ... (exporte as de UsuarioSistema se as adicionar)
};