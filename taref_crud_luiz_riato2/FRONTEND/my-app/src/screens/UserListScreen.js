import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
// 1. Importar Dialog e Paragraph
import { 
  Provider, 
  Portal, 
  FAB, 
  ActivityIndicator, 
  Appbar, 
  Button,
  Dialog, 
  Paragraph, 
  Card,
  Title,
  Text
} from 'react-native-paper';

// import UserList from '../components/UserList';
import UserDetailsModal from '../components/UserDetailsModal';
import UserFormModal from '../components/UserFormModal';
import DeleteConfirmationDialog from '../components/DeleteConfirmationDialog';
import * as api from '../services/sqliteService';

// Estrutura padrão para um novo usuário, não muda.
const defaultUserForm = {
    matricula: '', nome: '', cursos: '',
    endereco: { cep: '', logradouro: '', numero: '', complemento: '', bairro: '', localidade: '', uf: '' }
};

const UserListScreen = ({ currentUser, onLogout, onNavigateToFuncionarios, onNavigateToFuncoes, onNavigateToCargos, onNavigateToUsuariosSistema }) => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);

    // --- ESTADO REESTRUTURADO ---
    const [selectedUser, setSelectedUser] = useState(null);
    const [editingUser, setEditingUser] = useState(null);
    const [isDetailsVisible, setIsDetailsVisible] = useState(false);
    const [isInsertVisible, setIsInsertVisible] = useState(false);
    const [isEditVisible, setIsEditVisible] = useState(false);
    const [isDeleteVisible, setIsDeleteVisible] = useState(false);

    // 2. Estados para os novos diálogos
    // Para alertas simples (Sucesso, Erro)
    const [infoDialog, setInfoDialog] = useState({ visible: false, title: '', message: '' });
    // Para a confirmação de logout
    const [logoutDialogVisible, setLogoutDialogVisible] = useState(false);

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

    // 3. Funções auxiliares para o diálogo de informação
    const showInfoDialog = (title, message) => {
      setInfoDialog({ visible: true, title, message });
    };
    const hideInfoDialog = () => {
      setInfoDialog({ visible: false, title: '', message: '' });
    };

    // 4. Funções auxiliares para o diálogo de logout
    const showLogoutDialog = () => setLogoutDialogVisible(true);
    const hideLogoutDialog = () => setLogoutDialogVisible(false);
    
    const handleConfirmLogout = () => {
        hideLogoutDialog();
        onLogout(); // Chama a função original de logout
    };


    // --- Handlers de Ações (Lógica da API) ---
    const handleInsert = async (userData) => {
        const result = await api.createUser(userData);
        if (result && !result.error) {
            setUsers(current => [...current, result.user]);
            closeAllModals();
            showInfoDialog("Sucesso", "Usuário adicionado!");
        }
    };

    const handleUpdate = async (userData) => {
        const result = await api.updateUser(userData._id, userData);
        if (result && !result.error) {
            setUsers(current => current.map(u => (u._id === userData._id ? result.user : u)));
            closeAllModals();
            showInfoDialog("Sucesso", "Usuário atualizado!");
        }
    };
    
    const handleDelete = async () => {
        if (!selectedUser) return;
        const result = await api.deleteUser(selectedUser._id);
        if (result && !result.error) {
            setUsers(current => current.filter(u => u._id !== selectedUser._id));
            closeAllModals();
            showInfoDialog("Sucesso", "Usuário deletado.");
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
        const userToEdit = {
            ...user,
            cursos: Array.isArray(user.cursos) ? user.cursos.join(', ') : '',
            endereco: user.endereco || defaultUserForm.endereco
        };
        setEditingUser(userToEdit);
        setIsDetailsVisible(false); 
        setIsEditVisible(true);     
    };

    const handleConfirmDelete = () => {
        setIsDetailsVisible(false);
        setIsDeleteVisible(true);
    };

    if (loading) {
        return <View style={styles.centered}><ActivityIndicator animating={true} size="large" /></View>;
    }

    const handleLogout = () => {
        showLogoutDialog();
    };


    return (
        <Provider>
            <View style={styles.container}>
                <Appbar.Header>
                    <Appbar.Content title="Sistema de Gestão" />
                    <Appbar.Action icon="logout" onPress={handleLogout} />
                </Appbar.Header>
                
                <ScrollView style={styles.content}>
                    <View style={styles.menuContainer}>
                        <Title style={styles.menuTitle}>Gerenciamento</Title>
                        
                        <Card style={styles.menuCard} onPress={onNavigateToFuncionarios}>
                            <Card.Content style={styles.cardContent}>
                                <Text style={styles.cardIcon}>👥</Text>
                                <Title style={styles.cardTitle}>Funcionários</Title>
                                <Paragraph style={styles.cardDescription}>
                                    Gerenciar funcionários da empresa
                                </Paragraph>
                            </Card.Content>
                        </Card>

                        <Card style={styles.menuCard} onPress={onNavigateToFuncoes}>
                            <Card.Content style={styles.cardContent}>
                                <Text style={styles.cardIcon}>💼</Text>
                                <Title style={styles.cardTitle}>Funções</Title>
                                <Paragraph style={styles.cardDescription}>
                                    Gerenciar funções organizacionais
                                </Paragraph>
                            </Card.Content>
                        </Card>

                        <Card style={styles.menuCard} onPress={onNavigateToCargos}>
                            <Card.Content style={styles.cardContent}>
                                <Text style={styles.cardIcon}>🏢</Text>
                                <Title style={styles.cardTitle}>Cargos</Title>
                                <Paragraph style={styles.cardDescription}>
                                    Gerenciar cargos e posições
                                </Paragraph>
                            </Card.Content>
                        </Card>

                        <Card style={styles.menuCard} onPress={onNavigateToUsuariosSistema}>
                            <Card.Content style={styles.cardContent}>
                                <Text style={styles.cardIcon}>👤</Text>
                                <Title style={styles.cardTitle}>Usuários do Sistema</Title>
                                <Paragraph style={styles.cardDescription}>
                                    Gerenciar usuários do sistema
                                </Paragraph>
                            </Card.Content>
                        </Card>
                    </View>
                </ScrollView>
                <Portal>
                    {/* ... (Modal de Detalhes) ... */}
                    <UserDetailsModal
                        visible={isDetailsVisible}
                        user={selectedUser}
                        onDismiss={closeAllModals}
                        onEdit={handleOpenEdit}
                        onDelete={handleConfirmDelete}
                    />
                    {/* ... (Modal de Inserção) ... */}
                    <UserFormModal
                        visible={isInsertVisible}
                        onDismiss={closeAllModals}
                        onSubmit={handleInsert}
                        initialData={defaultUserForm}
                        title="Inserir Novo Usuário"
                        submitButtonText="Inserir"
                    />
                    {/* ... (Modal de Edição) ... */}
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
                    {/* ... (Diálogo de Deletar) ... */}
                    <DeleteConfirmationDialog
                        visible={isDeleteVisible}
                        userName={selectedUser?.nome}
                        onDismiss={closeAllModals}
                        onConfirm={handleDelete}
                    />

                    {/* 6. Adicionar os novos Diálogos ao Portal */}
                    <Dialog visible={infoDialog.visible} onDismiss={hideInfoDialog}>
                        <Dialog.Title>{infoDialog.title}</Dialog.Title>
                        <Dialog.Content>
                            <Paragraph>{infoDialog.message}</Paragraph>
                        </Dialog.Content>
                        <Dialog.Actions>
                            <Button onPress={hideInfoDialog}>OK</Button>
                        </Dialog.Actions>
                    </Dialog>

                    <Dialog visible={logoutDialogVisible} onDismiss={hideLogoutDialog}>
                        <Dialog.Title>Logout</Dialog.Title>
                        <Dialog.Content>
                            <Paragraph>Tem certeza que deseja sair?</Paragraph>
                        </Dialog.Content>
                        <Dialog.Actions>
                            <Button onPress={hideLogoutDialog}>Cancelar</Button>
                            <Button onPress={handleConfirmLogout}>Sair</Button>
                        </Dialog.Actions>
                    </Dialog>

                </Portal>

                {/* <UserList users={users} onUserPress={handleOpenDetails} /> */}

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
    content: { flex: 1, padding: 16 },
    menuContainer: { gap: 16 },
    menuTitle: { 
        fontSize: 24, 
        fontWeight: 'bold', 
        marginBottom: 16,
        textAlign: 'center',
        color: '#333'
    },
    menuCard: { 
        marginBottom: 8,
        elevation: 2,
        borderRadius: 8
    },
    cardContent: { 
        flexDirection: 'row', 
        alignItems: 'center',
        padding: 16
    },
    cardIcon: { 
        fontSize: 32, 
        marginRight: 16 
    },
    cardTitle: { 
        fontSize: 18, 
        fontWeight: 'bold',
        flex: 1,
        color: '#333'
    },
    cardDescription: { 
        fontSize: 14, 
        color: '#666',
        marginTop: 4
    },
});

export default UserListScreen;