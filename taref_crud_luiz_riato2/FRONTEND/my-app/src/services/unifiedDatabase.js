// --- Importa os dois serviços de banco de dados ---
import * as sqlite from './database.js'; // Nosso serviço SQLite
import * as mongo from './mongoService.js'; // Nosso NOVO serviço de API Mongo

// --- Variáveis de estado para controlar qual banco está ativo ---
let currentDb = null;
let currentType = 'sqlite'; // 'sqlite' ou 'mongodb'

/**
 * Inicializa o banco de dados apropriado.
 * Esta função é chamada pela UI (ex: RegisterScreen) com o tipo escolhido.
 */
export async function initDatabase(type = 'sqlite') {
  console.log(`Inicializando banco de dados unificado: ${type}`);
  currentType = type;
  
  try {
    if (type === 'sqlite') {
      currentDb = await sqlite.initDatabase();
    } else {
      currentDb = await mongo.initMongoDatabase();
    }
    return currentDb;
  } catch (error) {
    console.error(`Falha ao inicializar o banco de dados ${type}:`, error);
    throw error;
  }
}

/**
 * Retorna o tipo de banco de dados atualmente ativo.
 */
export function getDatabaseType() {
  return currentType;
}

/**
 * Reseta o banco de dados SQLite (não afeta o Mongo).
 */
export async function resetDatabase() {
    if (currentType === 'sqlite') {
        console.log("Resetando banco de dados SQLite...");
        currentDb = await sqlite.resetDatabase();
        return currentDb;
    }
    console.log("Reset de banco de dados não aplicável para MongoDB.");
}

// --- Funções CRUD Unificadas ---
// Cada função abaixo é um "interruptor" que chama a versão
// do SQLite ou do Mongo baseado no 'currentType'.

// --- Usuario ---

export async function inserirUsuario(nome, email, senha, data_nascimento, matricula = null, endereco = null) {
  if (currentType === 'sqlite') {
    return sqlite.inserirUsuario(currentDb, nome, email, senha, data_nascimento, matricula, endereco);
  } else {
    // A função mongo não precisa do 'db' (é null), mas mantemos a assinatura
    return mongo.inserirUsuarioMongo(currentDb, nome, email, senha, data_nascimento, matricula, endereco);
  }
}

export async function autenticarUsuario(email, senha) {
  if (currentType === 'sqlite') {
    // Note: a versão SQLite não criptografa senhas, a Mongo sim!
    // Para SQLite, a senha é texto puro (como no seu database.js)
    return sqlite.autenticarUsuario(currentDb, email, senha);
  } else {
    return mongo.autenticarUsuarioMongo(currentDb, email, senha);
  }
}

export async function consultaUsuarios() {
  if (currentType === 'sqlite') {
    return sqlite.consultaUsuarios(currentDb);
  } else {
    return mongo.consultaUsuariosMongo(currentDb);
  }
}

export async function buscarUsuarioPorEmail(email) {
  if (currentType === 'sqlite') {
    return sqlite.buscarUsuarioPorEmail(currentDb, email);
  } else {
    return mongo.buscarUsuarioPorEmailMongo(currentDb, email);
  }
}

export async function atualizarUsuario(id, nome, email, data_nascimento, matricula = null, endereco = null) {
  if (currentType === 'sqlite') {
    return sqlite.atualizarUsuario(currentDb, id, nome, email, data_nascimento, matricula, endereco);
  } else {
    return mongo.atualizarUsuarioMongo(currentDb, id, nome, email, data_nascimento, matricula, endereco);
  }
}

export async function deletarUsuario(id) {
  if (currentType === 'sqlite') {
    return sqlite.deletarUsuario(currentDb, id);
  } else {
    return mongo.deletarUsuarioMongo(currentDb, id);
  }
}

// --- Funcao ---

export async function inserirFuncao(nome) {
  if (currentType === 'sqlite') {
    return sqlite.inserirFuncao(currentDb, nome);
  } else {
    return mongo.inserirFuncaoMongo(currentDb, nome);
  }
}

export async function consultaFuncoes() {
  if (currentType === 'sqlite') {
    return sqlite.consultaFuncoes(currentDb);
  } else {
    return mongo.consultaFuncoesMongo(currentDb);
  }
}

export async function atualizarFuncao(id, nome) {
  if (currentType === 'sqlite') {
    return sqlite.atualizarFuncao(currentDb, id, nome);
  } else {
    return mongo.atualizarFuncaoMongo(currentDb, id, nome);
  }
}

export async function deletarFuncao(id) {
  if (currentType === 'sqlite') {
    return sqlite.deletarFuncao(currentDb, id);
  } else {
    return mongo.deletarFuncaoMongo(currentDb, id);
  }
}

// --- Funcionario ---

export async function inserirFuncionario(nome, email, data_nascimento) {
  if (currentType === 'sqlite') {
    return sqlite.inserirFuncionario(currentDb, nome, email, data_nascimento);
  } else {
    return mongo.inserirFuncionarioMongo(currentDb, nome, email, data_nascimento);
  }
}

export async function consultaFuncionarios() {
  if (currentType === 'sqlite') {
    return sqlite.consultaFuncionarios(currentDb);
  } else {
    return mongo.consultaFuncionariosMongo(currentDb);
  }
}

export async function atualizarFuncionario(id, nome, email, data_nascimento) {
  if (currentType === 'sqlite') {
    return sqlite.atualizarFuncionario(currentDb, id, nome, email, data_nascimento);
  } else {
    return mongo.atualizarFuncionarioMongo(currentDb, id, nome, email, data_nascimento);
  }
}

export async function deletarFuncionario(id) {
  if (currentType === 'sqlite') {
    return sqlite.deletarFuncionario(currentDb, id);
  } else {
    return mongo.deletarFuncionarioMongo(currentDb, id);
  }
}

// --- Cargo ---

export async function inserirCargo(nome, idFuncionario, idFuncao) {
  if (currentType === 'sqlite') {
    return sqlite.inserirCargo(currentDb, nome, idFuncionario, idFuncao);
  } else {
    return mongo.inserirCargoMongo(currentDb, nome, idFuncionario, idFuncao);
  }
}

export async function consultaCargos() {
  if (currentType === 'sqlite') {
    return sqlite.consultaCargos(currentDb);
  } else {
    return mongo.consultaCargosMongo(currentDb);
  }
}

export async function consultaCargosCompletos() {
  if (currentType === 'sqlite') {
    return sqlite.consultaCargosCompletos(currentDb);
  } else {
    return mongo.consultaCargosCompletosMongo(currentDb);
  }
}

export async function atualizarCargo(idCargo, nome, idFuncionario, idFuncao) {
  if (currentType === 'sqlite') {
    return sqlite.atualizarCargo(currentDb, idCargo, nome, idFuncionario, idFuncao);
  } else {
    return mongo.atualizarCargoMongo(currentDb, idCargo, nome, idFuncionario, idFuncao);
  }
}

export async function deletarCargo(id) {
  if (currentType === 'sqlite') {
    return sqlite.deletarCargo(currentDb, id);
  } else {
    return mongo.deletarCargoMongo(currentDb, id);
  }
}