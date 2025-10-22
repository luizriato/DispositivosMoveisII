import { 
  initDatabase, 
  consultaFuncionarios, 
  inserirFuncionario, 
  atualizarFuncionario, 
  deletarFuncionario 
} from './database';

// Função para converter dados do SQLite para o formato esperado pela UI
const convertFuncionarioToUser = (funcionario) => {
  return {
    _id: funcionario.id,
    nome: funcionario.nome,
    email: funcionario.email,
    data_nascimento: funcionario.data_nascimento,
    matricula: funcionario.matricula || '',
    cursos: '', // Campo não usado no SQLite, mas mantido para compatibilidade
    endereco: funcionario.endereco ? JSON.parse(funcionario.endereco) : {
      cep: '', logradouro: '', numero: '', complemento: '', 
      bairro: '', localidade: '', uf: ''
    }
  };
};

// Função para converter dados da UI para o formato do SQLite
const convertUserToFuncionario = (userData) => {
  return {
    nome: userData.nome,
    email: userData.email,
    data_nascimento: userData.data_nascimento || userData.endereco?.data_nascimento || '',
    matricula: userData.matricula || '',
    endereco: userData.endereco ? JSON.stringify(userData.endereco) : null
  };
};

export const fetchUsers = async () => {
  try {
    const db = await initDatabase();
    const funcionarios = await consultaFuncionarios(db);
    return funcionarios.map(convertFuncionarioToUser);
  } catch (error) {
    console.error('Erro ao buscar usuários:', error);
    return { error: true, message: 'Erro ao buscar usuários' };
  }
};

export const createUser = async (userData) => {
  try {
    const db = await initDatabase();
    const funcionarioData = convertUserToFuncionario(userData);
    
    const userId = await inserirFuncionario(
      db,
      funcionarioData.nome,
      funcionarioData.email,
      funcionarioData.data_nascimento
    );
    
    if (userId) {
      const newUser = convertFuncionarioToUser({
        id: userId,
        ...funcionarioData
      });
      return { user: newUser };
    } else {
      return { error: true, message: 'Erro ao criar usuário' };
    }
  } catch (error) {
    console.error('Erro ao criar usuário:', error);
    return { error: true, message: 'Erro ao criar usuário' };
  }
};

export const updateUser = async (userId, userData) => {
  try {
    const db = await initDatabase();
    const funcionarioData = convertUserToFuncionario(userData);
    
    const success = await atualizarFuncionario(
      db,
      userId,
      funcionarioData.nome,
      funcionarioData.email,
      funcionarioData.data_nascimento
    );
    
    if (success) {
      const updatedUser = convertFuncionarioToUser({
        id: userId,
        ...funcionarioData
      });
      return { user: updatedUser };
    } else {
      return { error: true, message: 'Erro ao atualizar usuário' };
    }
  } catch (error) {
    console.error('Erro ao atualizar usuário:', error);
    return { error: true, message: 'Erro ao atualizar usuário' };
  }
};

export const deleteUser = async (userId) => {
  try {
    const db = await initDatabase();
    const success = await deletarFuncionario(db, userId);
    
    if (success) {
      return { success: true };
    } else {
      return { error: true, message: 'Erro ao deletar usuário' };
    }
  } catch (error) {
    console.error('Erro ao deletar usuário:', error);
    return { error: true, message: 'Erro ao deletar usuário' };
  }
};
