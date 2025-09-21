import React, { useState, useEffect } from 'react';
// NOVO: Importar o Alert para a caixa de diálogo de confirmação
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { Modal, Portal, Text, Button, Provider, List, ActivityIndicator, TextInput, FAB, Dialog } from 'react-native-paper';
import { Platform } from "react-native";

const API_URL =
  Platform.OS === "android"
    ? "http://192.168.0.97:3000" // celular na rede Wi-Fi
    : "http://localhost:3000";   // web/PC

    const UserListScreen = () => {
      const [users, setUsers] = useState([]);
      const [selectedUser, setSelectedUser] = useState(null);
      const [visible, setVisible] = useState(false);
      const [loading, setLoading] = useState(true);
      const [insertModalVisible, setInsertModalVisible] = useState(false);
      const [editModalVisible, setEditModalVisible] = useState(false);
      const [newUserName, setNewUserName] = useState('');
      const [editUserName, setEditUserName] = useState('');
      const [deleteDialogVisible, setDeleteDialogVisible] = useState(false);

  const showModal = (user) => {
    setSelectedUser(user);
    setVisible(true);
  };

  const hideModal = () => {
    setVisible(false);
    setSelectedUser(null);
  };

  useEffect(() => {
    fetchUsers().finally(() => setLoading(false));
  }, []);

  // Função para deletar o usuário
  const handleDelete = async (userId) => {
    try {
      const response = await fetch(`${API_URL}/deletar/${userId}`, {
        method: 'DELETE',
      });
      const result = await response.json();
      
      if (response.ok) {
        console.log(result.status); // Deve exibir "deletado com sucesso"
        // Atualiza a lista de usuários na tela, removendo o que foi deletado
        setUsers(currentUsers => currentUsers.filter(user => user._id !== userId));
        hideModal(); // Fecha o modal após o sucesso
      } else {
        Alert.alert("Erro", "Não foi possível deletar o usuário.");
      }
    } catch (error) {
      console.error("Erro ao deletar usuário:", error);
      Alert.alert("Erro de Conexão", "Não foi possível conectar ao servidor para deletar o usuário.");
    }
  };

  const confirmDelete = (user) => {
    setDeleteDialogVisible(true);
  };

  // Função para inserir novo usuário
  const handleInsertUser = async () => {
    if (!newUserName.trim()) {
      Alert.alert("Erro", "Por favor, digite um nome para o usuário.");
      return;
    }

    try {
      const response = await fetch(`${API_URL}/inserir`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name: newUserName.trim() }),
      });
      
      const result = await response.json();
      
      if (response.ok) {
        console.log(result.status); // Deve exibir "adicionado com sucesso"
        setNewUserName('');
        setInsertModalVisible(false);
        // Recarrega a lista de usuários
        fetchUsers();
        Alert.alert("Sucesso", "Usuário adicionado com sucesso!");
      } else {
        Alert.alert("Erro", "Não foi possível adicionar o usuário.");
      }
    } catch (error) {
      console.error("Erro ao inserir usuário:", error);
      Alert.alert("Erro de Conexão", "Não foi possível conectar ao servidor para adicionar o usuário.");
    }
  };

  // Função para editar usuário
  const handleEditUser = async () => {
    if (!editUserName.trim()) {
      Alert.alert("Erro", "Por favor, digite um nome para o usuário.");
      return;
    }

    try {
      const response = await fetch(`${API_URL}/atualizar/${selectedUser._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name: editUserName.trim() }),
      });
      
      const result = await response.json();
      
      if (response.ok) {
        console.log(result.status); // Deve exibir "atualizado com sucesso"
        setEditUserName('');
        setEditModalVisible(false);
        // Atualiza o usuário na lista local
        setUsers(currentUsers => 
          currentUsers.map(user => 
            user._id === selectedUser._id 
              ? { ...user, nome: editUserName.trim() }
              : user
          )
        );
        // Atualiza o usuário selecionado
        setSelectedUser({ ...selectedUser, nome: editUserName.trim() });
        Alert.alert("Sucesso", "Usuário atualizado com sucesso!");
      } else {
        Alert.alert("Erro", "Não foi possível atualizar o usuário.");
      }
    } catch (error) {
      console.error("Erro ao editar usuário:", error);
      Alert.alert("Erro de Conexão", "Não foi possível conectar ao servidor para atualizar o usuário.");
    }
  };

  // Função para recarregar a lista de usuários
  const fetchUsers = async () => {
    try {
      const response = await fetch(API_URL);
      const data = await response.json();
      setUsers(data);
    } catch (error) {
      console.error("Erro ao buscar dados:", error);
    }
  };

  // Função para abrir modal de edição
  const openEditModal = (user) => {
    setSelectedUser(user);
    setEditUserName(user.nome);
    setEditModalVisible(true);
    setVisible(false); // Fecha o modal de detalhes
  };

  const containerStyle = { backgroundColor: 'white', padding: 20, margin: 20, borderRadius: 8 };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator animating={true} size="large" />
      </View>
    );
  }

  return (
    <Provider>
      <View style={styles.container}>
        <Portal>
          {/* Modal de Detalhes do Usuário */}
          <Modal visible={visible} onDismiss={hideModal} contentContainerStyle={containerStyle}>
            {selectedUser && (
              <View>
                <Text style={styles.modalTitle}>Detalhes do Usuário</Text>
                <Text>ID: {selectedUser._id}</Text>
                <Text style={styles.modalName}>Nome: {selectedUser.nome}</Text>
                
                {/* ALTERADO: Botões de Ação */}
                <View style={styles.buttonContainer}>
                  <Button 
                    style={styles.modalButton}
                    icon="close-circle-outline"
                    mode="outlined" 
                    onPress={hideModal}>
                    Fechar
                  </Button>
                  <Button 
                    style={styles.modalButton}
                    icon="pencil-outline"
                    mode="contained" 
                    buttonColor="#007bff"
                    onPress={() => openEditModal(selectedUser)}>
                    Alterar
                  </Button>
                  <Button 
                    style={styles.modalButton}
                    icon="trash-can-outline"
                    mode="contained" 
                    buttonColor="#d9534f" // Cor vermelha, passada DIRETAMENTE
                    onPress={confirmDelete}>
                    Deletar
                  </Button>
                </View>

              </View>
            )}
          </Modal>

          {/* Modal para Inserir Novo Usuário */}
          <Modal visible={insertModalVisible} onDismiss={() => setInsertModalVisible(false)} contentContainerStyle={containerStyle}>
            <View>
              <Text style={styles.modalTitle}>Inserir Novo Usuário</Text>
              <TextInput
                label="Nome do usuário"
                value={newUserName}
                onChangeText={setNewUserName}
                style={styles.textInput}
                mode="outlined"
              />
              <View style={styles.buttonContainer}>
                <Button 
                  style={styles.modalButton}
                  icon="close-circle-outline"
                  mode="outlined" 
                  onPress={() => {
                    setInsertModalVisible(false);
                    setNewUserName('');
                  }}>
                  Cancelar
                </Button>
                <Button 
                  style={styles.modalButton}
                  icon="check-circle-outline"
                  mode="contained" 
                  buttonColor="#28a745"
                  onPress={handleInsertUser}>
                  Inserir
                </Button>
              </View>
            </View>
          </Modal>

          {/* Modal para Editar Usuário */}
          <Modal visible={editModalVisible} onDismiss={() => setEditModalVisible(false)} contentContainerStyle={containerStyle}>
            <View>
              <Text style={styles.modalTitle}>Editar Usuário</Text>
              <Text style={styles.modalSubtitle}>ID: {selectedUser?._id}</Text>
              <TextInput
                label="Nome do usuário"
                value={editUserName}
                onChangeText={setEditUserName}
                style={styles.textInput}
                mode="outlined"
              />
              <View style={styles.buttonContainer}>
                <Button 
                  style={styles.modalButton}
                  icon="close-circle-outline"
                  mode="outlined" 
                  onPress={() => {
                    setEditModalVisible(false);
                    setEditUserName('');
                  }}>
                  Cancelar
                </Button>
                <Button 
                  style={styles.modalButton}
                  icon="check-circle-outline"
                  mode="contained" 
                  buttonColor="#28a745"
                  onPress={handleEditUser}>
                  Salvar
                </Button>
              </View>
            </View>
          </Modal>
          <Dialog visible={deleteDialogVisible} onDismiss={() => setDeleteDialogVisible(false)}>
          <Dialog.Title>Confirmar Exclusão</Dialog.Title>
          <Dialog.Content>
            <Text variant="bodyMedium">
              Tem certeza que deseja deletar o usuário "{selectedUser?.nome}"?
            </Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setDeleteDialogVisible(false)}>Cancelar</Button>
            <Button 
              textColor="#d9534f" // Cor vermelha para o texto
              onPress={() => {
                setDeleteDialogVisible(false); // Fecha o diálogo
                handleDelete(selectedUser._id); // Executa a exclusão
              }}>
              Confirmar
            </Button>
          </Dialog.Actions>
        </Dialog>
        </Portal>

        <ScrollView>
          <List.Section>
            <List.Subheader>Clique em um usuário para ver os detalhes</List.Subheader>
            {users.map((user) => (
              <List.Item
                key={user._id}
                title={user.nome}
                description={`ID: ${user._id}`}
                left={props => <List.Icon {...props} icon="account" />}
                onPress={() => showModal(user)}
              />
            ))}
          </List.Section>
        </ScrollView>

        {/* Floating Action Button para inserir novo usuário */}
        <FAB
          style={styles.fab}
          icon="plus"
          onPress={() => setInsertModalVisible(true)}
        />
      </View>
    </Provider>
  );
};

// ALTERADO: Adicionados novos estilos para os botões do modal
const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 20,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  modalSubtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 10,
  },
  modalName: {
    fontSize: 18,
    marginVertical: 10,
  },
  textInput: {
    marginVertical: 10,
    backgroundColor: 'white',
  },
  buttonContainer: {
    flexDirection: 'collumn',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  modalButton: {
   marginVertical: 5, // Adiciona um espaçamento entre eles
  },
  // deleteButton: {
  //   backgroundColor: '#d9534f', // Um tom de vermelho
  // },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
    backgroundColor: '#007bff',
  },
});

export default UserListScreen;