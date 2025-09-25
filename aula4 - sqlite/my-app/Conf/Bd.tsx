import * as SQLite from 'expo-sqlite';

async function CriaBanco() {
  try {
    const db = await SQLite.openDatabaseAsync('fatecVotorantim.db');
    console.log('Banco criado/aberto');
    return db;
  } catch (error) {
    console.log('Erro ao criar/abrir banco: ' + error);
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
    console.log('Tabela criada');
  } catch (error) {
    console.log('Erro ao criar tabela: ' + error);
  }
}

async function inserirUsuario(
  db: SQLite.SQLiteDatabase,
  nome: string,
  email: string
) {
  try {
    await db.runAsync(
      "INSERT INTO USUARIO (NOME_US, EMAIL_US) VALUES (?, ?)",
      [nome, email]   // aqui precisa ser array
    );
    console.log("Usuário inserido");
  } catch (error) {
    console.log('Erro ao inserir: ' + error);
  }
}

async function consultaUsuario(db:SQLite.SQLiteDatabase){
    try{
        let arrayReg = await db.getAllSync("SELECT * FROM USUARIO");
        return arrayReg;
    } catch (error){
        console.log("erro ao consultar usuario")
    }
}

export { CriaBanco, CriaTabela, inserirUsuario, consultaUsuario }; 
