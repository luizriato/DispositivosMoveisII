import * as SQLite from "expo-sqlite";

// Interface para os registros
export interface Usuario {
  ID_US: number;
  NOME_US: string;
  EMAIL_US: string;
}

async function CriaBanco() {
  try {
    const db = await SQLite.openDatabaseAsync("fatecVotorantim.db");
    console.log("Banco criado/aberto");
    return db;
  } catch (error) {
    console.log("Erro ao criar/abrir banco: " + error);
  }
}

async function CriaTabela(database: SQLite.SQLiteDatabase) {
  try {
    await database.execAsync(`
      PRAGMA journal_mode = WAL;
      CREATE TABLE IF NOT EXISTS USUARIO (
        ID_US INTEGER PRIMARY KEY AUTOINCREMENT,
        NOME_US VARCHAR(100),
        EMAIL_US VARCHAR(100)
      );
    `);
    console.log("Tabela criada");
  } catch (error) {
    console.log("Erro ao criar tabela: " + error);
  }
}

async function inserirUsuario(
  db: SQLite.SQLiteDatabase,
  nome: string,
  email: string
) {
  try {
    await db.runAsync("INSERT INTO USUARIO (NOME_US, EMAIL_US) VALUES (?, ?)", [
      nome,
      email,
    ]);
    console.log("Usuário inserido");
    return true;
  } catch (error) {
    console.log("Erro ao inserir: " + error);
    return false;
  }
}

async function consultaUsuario(
  db: SQLite.SQLiteDatabase
): Promise<Usuario[]> {
  try {
    const arrayReg = await db.getAllAsync<Usuario>(
      "SELECT ID_US, NOME_US, EMAIL_US FROM USUARIO"
    );
    return arrayReg;
  } catch (error) {
    console.log("Erro ao consultar usuário: " + error);
    return [];
  }
}

async function deletaUsuario(
  db: SQLite.SQLiteDatabase,
  id: number
) {
  try {
    await db.runAsync("DELETE FROM USUARIO WHERE ID_US = ?", [id]);
    return true;
  } catch (error) {
    console.log("Erro ao deletar usuário: " + error);
    return false;
  }
}

async function atualizaUsuario(
  db: SQLite.SQLiteDatabase,
  id: number,
  nome: string,
  email: string
) {
  try {
    await db.runAsync("UPDATE USUARIO SET NOME_US = ?, EMAIL_US = ? WHERE ID_US = ?", [nome, email, id]);
    return true;
  } catch (error) {
    console.log("Erro ao atualizar usuário: " + error);
    return false;
  }
}

export { CriaBanco, CriaTabela, inserirUsuario, consultaUsuario, deletaUsuario, atualizaUsuario };
