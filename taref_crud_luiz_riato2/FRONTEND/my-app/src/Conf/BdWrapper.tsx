// Wrapper que adapta as funções do Bd.tsx para usar o serviço unificado
import { getDatabaseType, getDatabase } from '../services/unifiedDatabase';
import * as UnifiedDB from '../services/unifiedDatabase';
import * as SQLiteDB from './Bd';

// Função auxiliar para obter o database apropriado
async function getDB() {
  const dbType = getDatabaseType();
  if (dbType === 'mongodb') {
    return getDatabase();
  }
  // Para SQLite, ainda usa o método original
  return await SQLiteDB.CriaBanco();
}

// Wrapper para CriaBanco
export async function CriaBanco() {
  const dbType = getDatabaseType();
  if (dbType === 'mongodb') {
    return getDatabase();
  }
  return await SQLiteDB.CriaBanco();
}

// Wrapper para CriaTabelas
export async function CriaTabelas(database: any) {
  const dbType = getDatabaseType();
  if (dbType === 'mongodb') {
    // Para MongoDB, as coleções são criadas automaticamente
    return true;
  }
  return await SQLiteDB.CriaTabelas(database);
}

// --- CRUD: Funcao ---
export async function inserirFuncao(db: any, nome: string): Promise<number | null> {
  const dbType = getDatabaseType();
  if (dbType === 'mongodb') {
    return await UnifiedDB.inserirFuncao(nome);
  }
  return await SQLiteDB.inserirFuncao(db, nome);
}

export async function consultaFuncoes(db: any): Promise<any[]> {
  const dbType = getDatabaseType();
  if (dbType === 'mongodb') {
    return await UnifiedDB.consultaFuncoes();
  }
  return await SQLiteDB.consultaFuncoes(db);
}

export async function atualizarFuncao(db: any, id: number, nome: string): Promise<boolean> {
  const dbType = getDatabaseType();
  if (dbType === 'mongodb') {
    return await UnifiedDB.atualizarFuncao(id, nome);
  }
  return await SQLiteDB.atualizarFuncao(db, id, nome);
}

export async function deletarFuncao(db: any, id: number): Promise<boolean> {
  const dbType = getDatabaseType();
  if (dbType === 'mongodb') {
    return await UnifiedDB.deletarFuncao(id);
  }
  return await SQLiteDB.deletarFuncao(db, id);
}

// --- CRUD: Funcionario ---
export async function inserirFuncionario(
  db: any,
  nome: string,
  email: string,
  data_nascimento: string
): Promise<number | null> {
  const dbType = getDatabaseType();
  if (dbType === 'mongodb') {
    return await UnifiedDB.inserirFuncionario(nome, email, data_nascimento);
  }
  return await SQLiteDB.inserirFuncionario(db, nome, email, data_nascimento);
}

export async function consultaFuncionarios(db: any): Promise<any[]> {
  const dbType = getDatabaseType();
  if (dbType === 'mongodb') {
    return await UnifiedDB.consultaFuncionarios();
  }
  return await SQLiteDB.consultaFuncionarios(db);
}

export async function atualizarFuncionario(
  db: any,
  id: number,
  nome: string,
  email: string,
  data_nascimento: string
): Promise<boolean> {
  const dbType = getDatabaseType();
  if (dbType === 'mongodb') {
    return await UnifiedDB.atualizarFuncionario(id, nome, email, data_nascimento);
  }
  return await SQLiteDB.atualizarFuncionario(db, id, nome, email, data_nascimento);
}

export async function deletarFuncionario(db: any, id: number): Promise<boolean> {
  const dbType = getDatabaseType();
  if (dbType === 'mongodb') {
    return await UnifiedDB.deletarFuncionario(id);
  }
  return await SQLiteDB.deletarFuncionario(db, id);
}

// --- CRUD: Cargo ---
export async function inserirCargo(
  db: any,
  nome: string,
  idFuncionario: number,
  idFuncao: number
): Promise<number | null> {
  const dbType = getDatabaseType();
  if (dbType === 'mongodb') {
    return await UnifiedDB.inserirCargo(nome, idFuncionario, idFuncao);
  }
  return await SQLiteDB.inserirCargo(db, nome, idFuncionario, idFuncao);
}

export async function consultaCargos(db: any): Promise<any[]> {
  const dbType = getDatabaseType();
  if (dbType === 'mongodb') {
    return await UnifiedDB.consultaCargos();
  }
  return await SQLiteDB.consultaCargos(db);
}

export async function consultaCargosCompletos(db: any): Promise<any[]> {
  const dbType = getDatabaseType();
  if (dbType === 'mongodb') {
    return await UnifiedDB.consultaCargosCompletos();
  }
  return await SQLiteDB.consultaCargosCompletos(db);
}

export async function atualizarCargo(
  db: any,
  idCargo: number,
  nome: string,
  idFuncionario: number,
  idFuncao: number
): Promise<boolean> {
  const dbType = getDatabaseType();
  if (dbType === 'mongodb') {
    return await UnifiedDB.atualizarCargo(idCargo, nome, idFuncionario, idFuncao);
  }
  return await SQLiteDB.atualizarCargo(db, idCargo, nome, idFuncionario, idFuncao);
}

export async function deletarCargo(db: any, id: number): Promise<boolean> {
  const dbType = getDatabaseType();
  if (dbType === 'mongodb') {
    return await UnifiedDB.deletarCargo(id);
  }
  return await SQLiteDB.deletarCargo(db, id);
}

// --- CRUD: UsuarioSistema ---
export async function inserirUsuarioSistema(
  db: any,
  login: string,
  senha: string,
  idFuncionario: number,
  ativo: boolean = true
): Promise<number | null> {
  const dbType = getDatabaseType();
  if (dbType === 'mongodb') {
    return await UnifiedDB.inserirUsuarioSistema(login, senha, idFuncionario, ativo);
  }
  return await SQLiteDB.inserirUsuarioSistema(db, login, senha, idFuncionario, ativo);
}

export async function consultaUsuariosSistema(db: any): Promise<any[]> {
  const dbType = getDatabaseType();
  if (dbType === 'mongodb') {
    return await UnifiedDB.consultaUsuariosSistema();
  }
  return await SQLiteDB.consultaUsuariosSistema(db);
}

export async function consultaUsuariosSistemaCompletos(db: any): Promise<any[]> {
  const dbType = getDatabaseType();
  if (dbType === 'mongodb') {
    return await UnifiedDB.consultaUsuariosSistemaCompletos();
  }
  return await SQLiteDB.consultaUsuariosSistemaCompletos(db);
}

export async function buscarUsuarioSistemaPorLogin(db: any, login: string): Promise<any | null> {
  const dbType = getDatabaseType();
  if (dbType === 'mongodb') {
    // MongoDB não tem essa função específica no unified, mas podemos adicionar se necessário
    const usuarios = await UnifiedDB.consultaUsuariosSistema();
    return usuarios.find(u => u.login === login) || null;
  }
  return await SQLiteDB.buscarUsuarioSistemaPorLogin(db, login);
}

export async function atualizarUsuarioSistema(
  db: any,
  id: number,
  login: string,
  senha: string,
  ativo: boolean,
  idFuncionario: number
): Promise<boolean> {
  const dbType = getDatabaseType();
  if (dbType === 'mongodb') {
    return await UnifiedDB.atualizarUsuarioSistema(id, login, senha, ativo, idFuncionario);
  }
  return await SQLiteDB.atualizarUsuarioSistema(db, id, login, senha, ativo, idFuncionario);
}

export async function atualizarUltimoAcesso(db: any, id: number): Promise<boolean> {
  const dbType = getDatabaseType();
  if (dbType === 'mongodb') {
    return await UnifiedDB.atualizarUltimoAcesso(id);
  }
  return await SQLiteDB.atualizarUltimoAcesso(db, id);
}

export async function deletarUsuarioSistema(db: any, id: number): Promise<boolean> {
  const dbType = getDatabaseType();
  if (dbType === 'mongodb') {
    return await UnifiedDB.deletarUsuarioSistema(id);
  }
  return await SQLiteDB.deletarUsuarioSistema(db, id);
}

