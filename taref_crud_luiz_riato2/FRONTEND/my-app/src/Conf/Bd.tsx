import * as SQLite from "expo-sqlite";

// --- Interfaces para os Registros ---

export interface Funcao {
  id_funcao: number;
  nome_funcao: string;
}

export interface Funcionario {
  id: number;
  nome: string;
  email: string;
  data_nascimento: string; // SQLite não tem tipo DATE, usamos TEXT (formato 'YYYY-MM-DD')
}

export interface UsuarioSistema {
  id_usuario: number;
  login: string;
  senha: string;
  ativo: boolean;
  id_funcionario_fk: number;
  data_criacao: string;
  ultimo_acesso: string;
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

export interface UsuarioSistemaCompleto extends UsuarioSistema {
  nome_funcionario: string;
  email_funcionario: string;
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
 * Cria as tabelas (Funcao, Funcionario, Cargo, UsuarioSistema) com os relacionamentos.
 */
async function CriaTabelas(database: SQLite.SQLiteDatabase) {
  try {
    await database.execAsync(`
      PRAGMA journal_mode = WAL;
      PRAGMA foreign_keys = ON; -- Habilita a checagem de chaves estrangeiras

      -- Tabela Função (Lado 1 da relação 1:1 com Cargo)
      CREATE TABLE IF NOT EXISTS funcao (
        id_funcao INTEGER PRIMARY KEY AUTOINCREMENT,
        nome_funcao VARCHAR(100) NOT NULL
      );

      -- Tabela Funcionário (Lado 1 da relação 1:N com Cargo e 1:1 com UsuarioSistema)
      CREATE TABLE IF NOT EXISTS funcionario (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nome VARCHAR(100) NOT NULL,
        email VARCHAR(100) UNIQUE NOT NULL,
        data_nascimento TEXT NOT NULL -- Formato 'YYYY-MM-DD'
      );

      -- Tabela Cargo (Lado N de Funcionario, Lado 1 de Funcao)
      CREATE TABLE IF NOT EXISTS cargo (
        id_cargo INTEGER PRIMARY KEY AUTOINCREMENT,
        nome_cargo VARCHAR(100) NOT NULL,
        
        -- Chave para funcionario (Relação 1:N)
        id_funcionario_fk INTEGER, 
        
        -- Chave para funcao (Relação 1:1, garantida pelo UNIQUE)
        id_funcao_fk INTEGER UNIQUE, 
        
        FOREIGN KEY (id_funcionario_fk) REFERENCES funcionario (id)
          ON DELETE SET NULL, -- Se o funcionário for deletado, o cargo fica sem dono
          
        FOREIGN KEY (id_funcao_fk) REFERENCES funcao (id_funcao)
          ON DELETE CASCADE -- Se a função for deletada, o cargo também é (Exemplo de regra)
      );

      -- Tabela UsuarioSistema (Relação 1:1 com Funcionario)
      CREATE TABLE IF NOT EXISTS usuario_sistema (
        id_usuario INTEGER PRIMARY KEY AUTOINCREMENT,
        login VARCHAR(50) UNIQUE NOT NULL,
        senha VARCHAR(255) NOT NULL,
        ativo BOOLEAN DEFAULT 1,
        id_funcionario_fk INTEGER UNIQUE NOT NULL,
        data_criacao TEXT NOT NULL, -- Formato 'YYYY-MM-DD HH:MM:SS'
        ultimo_acesso TEXT, -- Formato 'YYYY-MM-DD HH:MM:SS'
        
        FOREIGN KEY (id_funcionario_fk) REFERENCES funcionario (id)
          ON DELETE CASCADE -- Se o funcionário for deletado, o usuário do sistema também é
      );
    `);
    console.log("Tabelas (funcao, funcionario, cargo, usuario_sistema) criadas com sucesso.");
  } catch (error) {
    console.log("Erro ao criar tabelas: " + error);
  }
}

// --- CRUD: Funcao ---

async function inserirFuncao(
  db: SQLite.SQLiteDatabase,
  nome: string
): Promise<number | null> {
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

async function consultaFuncoes(db: SQLite.SQLiteDatabase): Promise<Funcao[]> {
  try {
    return await db.getAllAsync<Funcao>("SELECT * FROM funcao ORDER BY nome_funcao");
  } catch (error) {
    console.log("Erro ao consultar funções: " + error);
    return [];
  }
}

async function atualizarFuncao(
  db: SQLite.SQLiteDatabase,
  id: number,
  nome: string
) {
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

async function deletarFuncao(db: SQLite.SQLiteDatabase, id: number) {
  try {
    // Cuidado: A regra ON DELETE CASCADE no 'cargo' fará com que cargos ligados sejam deletados.
    await db.runAsync("DELETE FROM funcao WHERE id_funcao = ?", [id]);
    return true;
  } catch (error) {
    console.log("Erro ao deletar função: " + error);
    return false;
  }
}

// --- CRUD: Funcionario ---

async function inserirFuncionario(
  db: SQLite.SQLiteDatabase,
  nome: string,
  email: string,
  data_nascimento: string
): Promise<number | null> {
  try {
    const result = await db.runAsync(
      "INSERT INTO funcionario (nome, email, data_nascimento) VALUES (?, ?, ?)",
      [nome, email, data_nascimento]
    );
    console.log("Funcionário inserido, ID:", result.lastInsertRowId);
    return result.lastInsertRowId;
  } catch (error) {
    // Pode falhar se o email for duplicado (UNIQUE constraint)
    console.log("Erro ao inserir funcionário: " + error);
    return null;
  }
}

async function consultaFuncionarios(
  db: SQLite.SQLiteDatabase
): Promise<Funcionario[]> {
  try {
    return await db.getAllAsync<Funcionario>("SELECT * FROM funcionario ORDER BY nome");
  } catch (error) {
    console.log("Erro ao consultar funcionários: " + error);
    return [];
  }
}

async function atualizarFuncionario(
  db: SQLite.SQLiteDatabase,
  id: number,
  nome: string,
  email: string,
  data_nascimento: string
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

async function deletarFuncionario(db: SQLite.SQLiteDatabase, id: number) {
  try {
    // A regra ON DELETE SET NULL fará com que 'cargo.id_funcionario_fk' vire NULL
    await db.runAsync("DELETE FROM funcionario WHERE id = ?", [id]);
    return true;
  } catch (error) {
    console.log("Erro ao deletar funcionário: " + error);
    return false;
  }
}

// --- CRUD: Cargo ---

async function inserirCargo(
  db: SQLite.SQLiteDatabase,
  nome: string,
  idFuncionario: number,
  idFuncao: number
): Promise<number | null> {
  try {
    const result = await db.runAsync(
      "INSERT INTO cargo (nome_cargo, id_funcionario_fk, id_funcao_fk) VALUES (?, ?, ?)",
      [nome, idFuncionario, idFuncao]
    );
    console.log("Cargo inserido, ID:", result.lastInsertRowId);
    return result.lastInsertRowId;
  } catch (error) {
    // Erro comum aqui será a violação da constraint UNIQUE (1:1) no id_funcao_fk
    console.log("Erro ao inserir cargo: " + error);
    return null;
  }
}

/**
 * Consulta simples, retorna apenas os IDs das chaves estrangeiras.
 */
async function consultaCargos(db: SQLite.SQLiteDatabase): Promise<Cargo[]> {
  try {
    return await db.getAllAsync<Cargo>("SELECT * FROM cargo ORDER BY nome_cargo");
  } catch (error) {
    console.log("Erro ao consultar cargos: " + error);
    return [];
  }
}

/**
 * Consulta avançada com JOINs para trazer os nomes do funcionário e da função.
 */
async function consultaCargosCompletos(
  db: SQLite.SQLiteDatabase
): Promise<CargoCompleto[]> {
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
    return await db.getAllAsync<CargoCompleto>(query);
  } catch (error) {
    console.log("Erro ao consultar cargos completos: " + error);
    return [];
  }
}

async function atualizarCargo(
  db: SQLite.SQLiteDatabase,
  idCargo: number,
  nome: string,
  idFuncionario: number,
  idFuncao: number
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

async function deletarCargo(db: SQLite.SQLiteDatabase, id: number) {
  try {
    await db.runAsync("DELETE FROM cargo WHERE id_cargo = ?", [id]);
    return true;
  } catch (error) {
    console.log("Erro ao deletar cargo: " + error);
    return false;
  }
}

// --- CRUD: UsuarioSistema ---

async function inserirUsuarioSistema(
  db: SQLite.SQLiteDatabase,
  login: string,
  senha: string,
  idFuncionario: number,
  ativo: boolean = true
): Promise<number | null> {
  try {
    const dataAtual = new Date().toISOString().slice(0, 19).replace('T', ' ');
    const result = await db.runAsync(
      "INSERT INTO usuario_sistema (login, senha, ativo, id_funcionario_fk, data_criacao) VALUES (?, ?, ?, ?, ?)",
      [login, senha, ativo ? 1 : 0, idFuncionario, dataAtual]
    );
    console.log("Usuário do sistema inserido, ID:", result.lastInsertRowId);
    return result.lastInsertRowId;
  } catch (error) {
    console.log("Erro ao inserir usuário do sistema: " + error);
    return null;
  }
}

async function consultaUsuariosSistema(db: SQLite.SQLiteDatabase): Promise<UsuarioSistema[]> {
  try {
    return await db.getAllAsync<UsuarioSistema>("SELECT * FROM usuario_sistema ORDER BY login");
  } catch (error) {
    console.log("Erro ao consultar usuários do sistema: " + error);
    return [];
  }
}

async function consultaUsuariosSistemaCompletos(db: SQLite.SQLiteDatabase): Promise<UsuarioSistemaCompleto[]> {
  const query = `
    SELECT
      us.id_usuario,
      us.login,
      us.senha,
      us.ativo,
      us.id_funcionario_fk,
      us.data_criacao,
      us.ultimo_acesso,
      f.nome AS nome_funcionario,
      f.email AS email_funcionario
    FROM usuario_sistema us
    INNER JOIN funcionario f ON us.id_funcionario_fk = f.id
    ORDER BY us.login
  `;
  try {
    return await db.getAllAsync<UsuarioSistemaCompleto>(query);
  } catch (error) {
    console.log("Erro ao consultar usuários do sistema completos: " + error);
    return [];
  }
}

async function buscarUsuarioSistemaPorLogin(db: SQLite.SQLiteDatabase, login: string): Promise<UsuarioSistema | null> {
  try {
    const result = await db.getFirstAsync<UsuarioSistema>(
      "SELECT * FROM usuario_sistema WHERE login = ?",
      [login]
    );
    return result;
  } catch (error) {
    console.log("Erro ao buscar usuário do sistema por login: " + error);
    return null;
  }
}

async function atualizarUsuarioSistema(
  db: SQLite.SQLiteDatabase,
  id: number,
  login: string,
  senha: string,
  ativo: boolean,
  idFuncionario: number
): Promise<boolean> {
  try {
    await db.runAsync(
      "UPDATE usuario_sistema SET login = ?, senha = ?, ativo = ?, id_funcionario_fk = ? WHERE id_usuario = ?",
      [login, senha, ativo ? 1 : 0, idFuncionario, id]
    );
    return true;
  } catch (error) {
    console.log("Erro ao atualizar usuário do sistema: " + error);
    return false;
  }
}

async function atualizarUltimoAcesso(db: SQLite.SQLiteDatabase, id: number): Promise<boolean> {
  try {
    const dataAtual = new Date().toISOString().slice(0, 19).replace('T', ' ');
    await db.runAsync(
      "UPDATE usuario_sistema SET ultimo_acesso = ? WHERE id_usuario = ?",
      [dataAtual, id]
    );
    return true;
  } catch (error) {
    console.log("Erro ao atualizar último acesso: " + error);
    return false;
  }
}

async function deletarUsuarioSistema(db: SQLite.SQLiteDatabase, id: number): Promise<boolean> {
  try {
    await db.runAsync("DELETE FROM usuario_sistema WHERE id_usuario = ?", [id]);
    return true;
  } catch (error) {
    console.log("Erro ao deletar usuário do sistema: " + error);
    return false;
  }
}

// --- Exportações ---
export {
  CriaBanco,
  CriaTabelas,
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
  // UsuarioSistema
  inserirUsuarioSistema,
  consultaUsuariosSistema,
  consultaUsuariosSistemaCompletos,
  buscarUsuarioSistemaPorLogin,
  atualizarUsuarioSistema,
  atualizarUltimoAcesso,
  deletarUsuarioSistema,
};