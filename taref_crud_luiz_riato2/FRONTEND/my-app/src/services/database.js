import * as SQLite from "expo-sqlite";

// --- Tipos para os Registros ---
// Nota: Em JavaScript puro, usamos comentários JSDoc para documentar os tipos

/**
 * @typedef {Object} Usuario
 * @property {number} id
 * @property {string} nome
 * @property {string} email
 * @property {string} senha
 * @property {string} data_nascimento
 * @property {string} matricula
 * @property {string} endereco - JSON string
 */

/**
 * @typedef {Object} Funcao
 * @property {number} id_funcao
 * @property {string} nome_funcao
 */

/**
 * @typedef {Object} Cargo
 * @property {number} id_cargo
 * @property {string} nome_cargo
 * @property {number} id_funcionario_fk
 * @property {number} id_funcao_fk
 */

/**
 * @typedef {Object} CargoCompleto
 * @property {number} id_cargo
 * @property {string} nome_cargo
 * @property {number} id_funcionario_fk
 * @property {number} id_funcao_fk
 * @property {string} nome_funcionario
 * @property {string} nome_funcao
 */

// --- Funções do Banco ---

/**
 * Abre ou cria o banco de dados.
 */
async function CriaBanco() {
  try {
    const db = await SQLite.openDatabaseAsync("fatecVotorantim.db");
    console.log("Banco criado/aberto");
    return db;
  } catch (error) {
    console.log("Erro ao criar/abrir banco: " + error);
  }
}

/**
 * Cria as tabelas (Usuario, Funcao, Cargo) com os relacionamentos.
 */
async function CriaTabelas(database) {
  try {
    await database.execAsync(`
      PRAGMA journal_mode = WAL;
      PRAGMA foreign_keys = ON;

      -- Tabela Usuario (para login e cadastro)
      CREATE TABLE IF NOT EXISTS usuario (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nome VARCHAR(100) NOT NULL,
        email VARCHAR(100) UNIQUE NOT NULL,
        senha VARCHAR(255) NOT NULL,
        data_nascimento TEXT NOT NULL,
        matricula VARCHAR(50) UNIQUE,
        endereco TEXT -- JSON string
      );

      -- Tabela Função (Lado 1 da relação 1:1 com Cargo)
      CREATE TABLE IF NOT EXISTS funcao (
        id_funcao INTEGER PRIMARY KEY AUTOINCREMENT,
        nome_funcao VARCHAR(100) NOT NULL
      );

      -- Tabela Funcionário (Lado 1 da relação 1:N com Cargo)
      CREATE TABLE IF NOT EXISTS funcionario (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nome VARCHAR(100) NOT NULL,
        email VARCHAR(100) UNIQUE NOT NULL,
        data_nascimento TEXT NOT NULL
      );

      -- Tabela Cargo (Lado N de Funcionario, Lado 1 de Funcao)
      CREATE TABLE IF NOT EXISTS cargo (
        id_cargo INTEGER PRIMARY KEY AUTOINCREMENT,
        nome_cargo VARCHAR(100) NOT NULL,
        id_funcionario_fk INTEGER, 
        id_funcao_fk INTEGER UNIQUE, 
        FOREIGN KEY (id_funcionario_fk) REFERENCES funcionario (id)
          ON DELETE SET NULL,
        FOREIGN KEY (id_funcao_fk) REFERENCES funcao (id_funcao)
          ON DELETE CASCADE
      );
    `);
    console.log("Tabelas criadas com sucesso.");
  } catch (error) {
    console.log("Erro ao criar tabelas: " + error);
  }
}

// --- CRUD: Usuario ---

async function inserirUsuario(
  db,
  nome,
  email,
  senha,
  data_nascimento,
  matricula = null,
  endereco = null
) {
  try {
    console.log("Tentando inserir usuário:", { nome, email, data_nascimento });
    
    // Primeiro verifica se o email já existe
    const usuarioExistente = await buscarUsuarioPorEmail(db, email);
    if (usuarioExistente) {
      console.log("Email já existe:", email);
      return null;
    }
    
    const result = await db.runAsync(
      "INSERT INTO usuario (nome, email, senha, data_nascimento, matricula, endereco) VALUES (?, ?, ?, ?, ?, ?)",
      [nome, email, senha, data_nascimento, matricula, endereco]
    );
    console.log("Usuário inserido com sucesso, ID:", result.lastInsertRowId);
    return result.lastInsertRowId;
  } catch (error) {
    console.log("Erro ao inserir usuário: " + error);
    return null;
  }
}

async function consultaUsuarios(db) {
  try {
    return await db.getAllAsync("SELECT * FROM usuario ORDER BY nome");
  } catch (error) {
    console.log("Erro ao consultar usuários: " + error);
    return [];
  }
}

async function buscarUsuarioPorEmail(db, email) {
  try {
    const result = await db.getFirstAsync("SELECT * FROM usuario WHERE email = ?", [email]);
    return result;
  } catch (error) {
    console.log("Erro ao buscar usuário por email: " + error);
    return null;
  }
}

async function autenticarUsuario(db, email, senha) {
  try {
    console.log("Tentando autenticar usuário:", email);
    const result = await db.getFirstAsync(
      "SELECT * FROM usuario WHERE email = ? AND senha = ?", 
      [email, senha]
    );
    
    if (result) {
      console.log("Usuário autenticado com sucesso:", result.nome);
    } else {
      console.log("Usuário não encontrado ou senha incorreta");
    }
    
    return result;
  } catch (error) {
    console.log("Erro ao autenticar usuário: " + error);
    return null;
  }
}

async function atualizarUsuario(
  db,
  id,
  nome,
  email,
  data_nascimento,
  matricula = null,
  endereco = null
) {
  try {
    await db.runAsync(
      "UPDATE usuario SET nome = ?, email = ?, data_nascimento = ?, matricula = ?, endereco = ? WHERE id = ?",
      [nome, email, data_nascimento, matricula, endereco, id]
    );
    return true;
  } catch (error) {
    console.log("Erro ao atualizar usuário: " + error);
    return false;
  }
}

async function deletarUsuario(db, id) {
  try {
    await db.runAsync("DELETE FROM usuario WHERE id = ?", [id]);
    return true;
  } catch (error) {
    console.log("Erro ao deletar usuário: " + error);
    return false;
  }
}

// --- CRUD: Funcao ---

async function inserirFuncao(db, nome) {
  try {
    const result = await db.runAsync(
      "INSERT INTO funcao (nome_funcao) VALUES (?)",
      [nome]
    );
    console.log("Função inserida, ID:", result.lastInsertRowId);
    return result.lastInsertRowId;
  } catch (error) {
    console.log("Erro ao inserir função: " + error);
    return null;
  }
}

async function consultaFuncoes(db) {
  try {
    return await db.getAllAsync("SELECT * FROM funcao ORDER BY nome_funcao");
  } catch (error) {
    console.log("Erro ao consultar funções: " + error);
    return [];
  }
}

async function atualizarFuncao(db, id, nome) {
  try {
    await db.runAsync("UPDATE funcao SET nome_funcao = ? WHERE id_funcao = ?", [
      nome,
      id,
    ]);
    return true;
  } catch (error) {
    console.log("Erro ao atualizar função: " + error);
    return false;
  }
}

async function deletarFuncao(db, id) {
  try {
    await db.runAsync("DELETE FROM funcao WHERE id_funcao = ?", [id]);
    return true;
  } catch (error) {
    console.log("Erro ao deletar função: " + error);
    return false;
  }
}

// --- CRUD: Funcionario ---

async function inserirFuncionario(
  db,
  nome,
  email,
  data_nascimento
) {
  try {
    const result = await db.runAsync(
      "INSERT INTO funcionario (nome, email, data_nascimento) VALUES (?, ?, ?)",
      [nome, email, data_nascimento]
    );
    console.log("Funcionário inserido, ID:", result.lastInsertRowId);
    return result.lastInsertRowId;
  } catch (error) {
    console.log("Erro ao inserir funcionário: " + error);
    return null;
  }
}

async function consultaFuncionarios(db) {
  try {
    return await db.getAllAsync("SELECT * FROM funcionario ORDER BY nome");
  } catch (error) {
    console.log("Erro ao consultar funcionários: " + error);
    return [];
  }
}

async function atualizarFuncionario(
  db,
  id,
  nome,
  email,
  data_nascimento
) {
  try {
    await db.runAsync(
      "UPDATE funcionario SET nome = ?, email = ?, data_nascimento = ? WHERE id = ?",
      [nome, email, data_nascimento, id]
    );
    return true;
  } catch (error) {
    console.log("Erro ao atualizar funcionário: " + error);
    return false;
  }
}

async function deletarFuncionario(db, id) {
  try {
    await db.runAsync("DELETE FROM funcionario WHERE id = ?", [id]);
    return true;
  } catch (error) {
    console.log("Erro ao deletar funcionário: " + error);
    return false;
  }
}

// --- CRUD: Cargo ---

async function inserirCargo(
  db,
  nome,
  idFuncionario,
  idFuncao
) {
  try {
    const result = await db.runAsync(
      "INSERT INTO cargo (nome_cargo, id_funcionario_fk, id_funcao_fk) VALUES (?, ?, ?)",
      [nome, idFuncionario, idFuncao]
    );
    console.log("Cargo inserido, ID:", result.lastInsertRowId);
    return result.lastInsertRowId;
  } catch (error) {
    console.log("Erro ao inserir cargo: " + error);
    return null;
  }
}

async function consultaCargos(db) {
  try {
    return await db.getAllAsync("SELECT * FROM cargo ORDER BY nome_cargo");
  } catch (error) {
    console.log("Erro ao consultar cargos: " + error);
    return [];
  }
}

async function consultaCargosCompletos(db) {
  const query = `
    SELECT
      c.id_cargo,
      c.nome_cargo,
      c.id_funcionario_fk,
      c.id_funcao_fk,
      COALESCE(f.nome, 'N/A') AS nome_funcionario,
      COALESCE(fu.nome_funcao, 'N/A') AS nome_funcao
    FROM cargo c
    LEFT JOIN funcionario f ON c.id_funcionario_fk = f.id
    LEFT JOIN funcao fu ON c.id_funcao_fk = fu.id_funcao
    ORDER BY c.nome_cargo
  `;
  try {
    return await db.getAllAsync(query);
  } catch (error) {
    console.log("Erro ao consultar cargos completos: " + error);
    return [];
  }
}

async function atualizarCargo(
  db,
  idCargo,
  nome,
  idFuncionario,
  idFuncao
) {
  try {
    await db.runAsync(
      "UPDATE cargo SET nome_cargo = ?, id_funcionario_fk = ?, id_funcao_fk = ? WHERE id_cargo = ?",
      [nome, idFuncionario, idFuncao, idCargo]
    );
    return true;
  } catch (error) {
    console.log("Erro ao atualizar cargo: " + error);
    return false;
  }
}

async function deletarCargo(db, id) {
  try {
    await db.runAsync("DELETE FROM cargo WHERE id_cargo = ?", [id]);
    return true;
  } catch (error) {
    console.log("Erro ao deletar cargo: " + error);
    return false;
  }
}

// --- Inicialização do Banco ---
let database = null;

/**
 * Função para verificar se as tabelas existem e têm a estrutura correta
 */
async function verificarEstruturaBanco(db) {
  try {
    // Verifica se a tabela usuario existe e tem as colunas corretas
    const result = await db.getFirstAsync(`
      SELECT name FROM sqlite_master 
      WHERE type='table' AND name='usuario'
    `);
    
    if (!result) {
      console.log("Tabela usuario não existe, recriando...");
      return false;
    }
    
    // Verifica se as colunas existem
    const columns = await db.getAllAsync(`PRAGMA table_info(usuario)`);
    const columnNames = columns.map(col => col.name);
    
    const requiredColumns = ['id', 'nome', 'email', 'senha', 'data_nascimento', 'matricula', 'endereco'];
    const missingColumns = requiredColumns.filter(col => !columnNames.includes(col));
    
    if (missingColumns.length > 0) {
      console.log("Colunas faltando na tabela usuario:", missingColumns);
      return false;
    }
    
    return true;
  } catch (error) {
    console.log("Erro ao verificar estrutura do banco:", error);
    return false;
  }
}

/**
 * Função para recriar o banco de dados
 */
async function recriarBanco() {
  try {
    const db = await CriaBanco();
    
    // Remove todas as tabelas existentes
    await db.execAsync(`
      DROP TABLE IF EXISTS cargo;
      DROP TABLE IF EXISTS funcionario;
      DROP TABLE IF EXISTS funcao;
      DROP TABLE IF EXISTS usuario;
    `);
    
    // Recria as tabelas
    await CriaTabelas(db);
    console.log("Banco de dados recriado com sucesso");
    return db;
  } catch (error) {
    console.log("Erro ao recriar banco:", error);
    return null;
  }
}

async function initDatabase() {
  if (!database) {
    database = await CriaBanco();
    
    // Verifica se a estrutura está correta
    const estruturaCorreta = await verificarEstruturaBanco(database);
    
    if (!estruturaCorreta) {
      console.log("Estrutura do banco incorreta, recriando...");
      database = await recriarBanco();
    }
  }
  return database;
}

/**
 * Função para forçar a recriação do banco de dados
 * Use esta função se houver problemas persistentes
 */
async function resetDatabase() {
  try {
    database = null;
    const db = await CriaBanco();
    
    // Remove todas as tabelas existentes
    await db.execAsync(`
      DROP TABLE IF EXISTS cargo;
      DROP TABLE IF EXISTS funcionario;
      DROP TABLE IF EXISTS funcao;
      DROP TABLE IF EXISTS usuario;
    `);
    
    // Recria as tabelas
    await CriaTabelas(db);
    database = db;
    console.log("Banco de dados resetado com sucesso");
    return db;
  } catch (error) {
    console.log("Erro ao resetar banco:", error);
    return null;
  }
}

// --- Exportações ---
export {
  CriaBanco,
  CriaTabelas,
  initDatabase,
  resetDatabase,
  // Usuario
  inserirUsuario,
  consultaUsuarios,
  buscarUsuarioPorEmail,
  autenticarUsuario,
  atualizarUsuario,
  deletarUsuario,
  // Funcao
  inserirFuncao,
  consultaFuncoes,
  atualizarFuncao,
  deletarFuncao,
  // Funcionario
  inserirFuncionario,
  consultaFuncionarios,
  atualizarFuncionario,
  deletarFuncionario,
  // Cargo
  inserirCargo,
  consultaCargos,
  consultaCargosCompletos,
  atualizarCargo,
  deletarCargo,
};
