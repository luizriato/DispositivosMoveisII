import * as SQLite from "expo-sqlite";

// --- Interfaces para os Registros ---

export interface Usuario {
  id: number;
  nome: string;
  email: string;
  senha: string;
  data_nascimento: string;
  matricula: string;
  endereco: string; // JSON string
}

export interface Funcao {
  id_funcao: number;
  nome_funcao: string;
}

export interface Cargo {
  id_cargo: number;
  nome_cargo: string;
  id_funcionario_fk: number;
  id_funcao_fk: number;
}

/**
 * Interface para consultas com JOIN, trazendo nomes de outras tabelas.
 */
export interface CargoCompleto extends Cargo {
  nome_funcionario: string;
  nome_funcao: string;
}

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
    const result = await db.runAsync(
      "INSERT INTO usuario (nome, email, senha, data_nascimento, matricula, endereco) VALUES (?, ?, ?, ?, ?, ?)",
      [nome, email, senha, data_nascimento, matricula, endereco]
    );
    console.log("Usuário inserido, ID:", result.lastInsertRowId);
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
    const result = await db.getFirstAsync(
      "SELECT * FROM usuario WHERE email = ? AND senha = ?", 
      [email, senha]
    );
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

export async function initDatabase() {
  if (!database) {
    database = await CriaBanco();
    await CriaTabelas(database);
  }
  return database;
}

// --- Exportações ---
export {
  CriaBanco,
  CriaTabelas,
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
