import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { Provider, Portal, FAB, ActivityIndicator } from 'react-native-paper';

import UserList from '../components/UserList';
import UserDetailsModal from '../components/UserDetailsModal';
import UserFormModal from '../components/UserFormModal';
import DeleteConfirmationDialog from '../components/DeleteConfirmationDialog';
import * as api from '../services/api';

// Estrutura padrão para um novo usuário, não muda.
const defaultUserForm = {
    matricula: '', nome: '', cursos: '',
    endereco: { cep: '', logradouro: '', numero: '', complemento: '', bairro: '', localidade: '', uf: '' }
};

const UserListScreen = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);

    // --- ESTADO REESTRUTURADO ---
    // Estado para saber qual usuário está sendo visto nos detalhes
    const [selectedUser, setSelectedUser] = useState(null);
    // Estado separado para os dados do formulário de edição
    const [editingUser, setEditingUser] = useState(null);

    // Estados de visibilidade separados para cada modal
    const [isDetailsVisible, setIsDetailsVisible] = useState(false);
    const [isInsertVisible, setIsInsertVisible] = useState(false);
    const [isEditVisible, setIsEditVisible] = useState(false);
    const [isDeleteVisible, setIsDeleteVisible] = useState(false);

    // Carregar usuários iniciais
    useEffect(() => {
        loadUsers();
    }, []);

    const loadUsers = async () => {
        setLoading(true);
        const result = await api.fetchUsers();
        if (Array.isArray(result)) {
            setUsers(result);
        }
        setLoading(false);
    };

    // --- Handlers de Ações (Lógica da API) ---
    const handleInsert = async (userData) => {
        const result = await api.createUser(userData);
        if (result && !result.error) {
            setUsers(current => [...current, result.user]);
            closeAllModals();
            Alert.alert("Sucesso", "Usuário adicionado!");
        }
    };

    const handleUpdate = async (userData) => {
        const result = await api.updateUser(userData._id, userData);
        if (result && !result.error) {
            setUsers(current => current.map(u => (u._id === userData._id ? result.user : u)));
            closeAllModals();
            Alert.alert("Sucesso", "Usuário atualizado!");
        }
    };
    
    const handleDelete = async () => {
        if (!selectedUser) return;
        const result = await api.deleteUser(selectedUser._id);
        if (result && !result.error) {
            setUsers(current => current.filter(u => u._id !== selectedUser._id));
            closeAllModals();
            Alert.alert("Sucesso", "Usuário deletado.");
        }
    };

    // --- Controle de Modais (Funções que abrem e fecham) ---
    const closeAllModals = () => {
        setIsDetailsVisible(false);
        setIsInsertVisible(false);
        setIsEditVisible(false);
        setIsDeleteVisible(false);
        setSelectedUser(null);
        setEditingUser(null);
    };

    const handleOpenDetails = (user) => {
        setSelectedUser(user);
        setIsDetailsVisible(true);
    };
    
    const handleOpenInsert = () => {
        setIsInsertVisible(true);
    };

    const handleOpenEdit = (user) => {
        // Prepara os dados para o formulário de edição
        const userToEdit = {
            ...user,
            cursos: Array.isArray(user.cursos) ? user.cursos.join(', ') : '',
            endereco: user.endereco || defaultUserForm.endereco
        };
        setEditingUser(userToEdit);
        setIsDetailsVisible(false); // Fecha o modal de detalhes
        setIsEditVisible(true);     // Abre o modal de edição
    };

    const handleConfirmDelete = () => {
        setIsDetailsVisible(false); // Fecha o modal de detalhes
        setIsDeleteVisible(true);   // Abre o diálogo de confirmação
    };

    if (loading) {
        return <View style={styles.centered}><ActivityIndicator animating={true} size="large" /></View>;
    }

    return (
        <Provider>
            <View style={styles.container}>
                <Portal>
                    {/* O modal de detalhes usa o 'selectedUser' e 'isDetailsVisible' */}
                    <UserDetailsModal
                        visible={isDetailsVisible}
                        user={selectedUser}
                        onDismiss={closeAllModals}
                        onEdit={handleOpenEdit}
                        onDelete={handleConfirmDelete}
                    />
                    {/* O modal de inserção usa 'defaultUserForm' e 'isInsertVisible' */}
                    <UserFormModal
                        visible={isInsertVisible}
                        onDismiss={closeAllModals}
                        onSubmit={handleInsert}
                        initialData={defaultUserForm}
                        title="Inserir Novo Usuário"
                        submitButtonText="Inserir"
                    />
                    {/* O modal de edição só é montado se houver um 'editingUser' */}
                    {editingUser && (
                        <UserFormModal
                            visible={isEditVisible}
                            onDismiss={closeAllModals}
                            onSubmit={handleUpdate}
                            initialData={editingUser}
                            title="Editar Usuário"
                            submitButtonText="Salvar"
                        />
                    )}
                    <DeleteConfirmationDialog
                        visible={isDeleteVisible}
                        userName={selectedUser?.nome}
                        onDismiss={closeAllModals}
                        onConfirm={handleDelete}
                    />
                </Portal>

                <UserList users={users} onUserPress={handleOpenDetails} />

                <FAB
                    style={styles.fab}
                    icon="plus"
                    onPress={handleOpenInsert}
                />
            </View>
        </Provider>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1 },
    centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    fab: { position: 'absolute', margin: 16, right: 0, bottom: 0 },
});

export default UserListScreen;