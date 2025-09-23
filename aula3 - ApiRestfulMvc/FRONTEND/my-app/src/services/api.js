import { Alert, Platform } from 'react-native';

const API_URL = Platform.OS === "android" ? "http://10.0.2.2:3000" : "http://localhost:3000";

// Função genérica para lidar com as requisições
const request = async (endpoint, options = {}) => {
    try {
        const response = await fetch(`${API_URL}${endpoint}`, options);
        const data = await response.json();
        if (!response.ok) {
            // Lança um erro que será capturado no bloco catch
            throw new Error(data.error || 'Ocorreu um erro na requisição.');
        }
        return data;
    } catch (error) {
        console.error(`API Error on ${options.method || 'GET'} ${endpoint}:`, error);
        Alert.alert("Erro de Conexão", error.message);
        // Retorna null ou um objeto de erro para que a UI possa lidar com a falha
        return { error: true, message: error.message };
    }
};

export const fetchUsers = () => {
    return request('/');
};

export const createUser = (userData) => {
    return request('/inserir', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData),
    });
};

export const updateUser = (userId, userData) => {
    return request(`/atualizar/${userId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData),
    });
};

export const deleteUser = (userId) => {
    return request(`/deletar/${userId}`, {
        method: 'DELETE',
    });
};