import React, { useState, useEffect } from 'react';
// NOVO: Importar o Alert para a caixa de diálogo de confirmação
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { Modal, Portal, Text, Button, Provider, List, ActivityIndicator } from 'react-native-paper';

const API_URL = 'http://192.168.179.42:3000'; 

const UserListScreen = () => {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [visible, setVisible] = useState(false);
  const [loading, setLoading] = useState(true);

  const showModal = (user) => {
    setSelectedUser(user);
    setVisible(true);
  };

  const hideModal = () => {
    setVisible(false);
    setSelectedUser(null);
  };

  useEffect(() => {
    fetch(API_URL)
      .then(response => response.json())
      .then(data => {
        setUsers(data);
      })
      .catch(error => console.error("Erro ao buscar dados:", error))
      .finally(() => setLoading(false));
  }, []);

  // NOVO: Função para deletar o usuário
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

  // NOVO: Função que mostra a confirmação antes de deletar
  const confirmDelete = (user) => {
    Alert.alert(
      "Confirmar Exclusão", // Título
      `Tem certeza que deseja deletar o usuário "${user.nome}"?`, // Mensagem
      [
        {
          text: "Cancelar",
          onPress: () => console.log("Deleção cancelada"),
          style: "cancel"
        },
        { 
          text: "Confirmar", 
          onPress: () => handleDelete(user._id),
          style: "destructive" // Deixa o texto vermelho no iOS
        }
      ],
      { cancelable: true } // Permite fechar clicando fora (Android)
    );
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
                    icon="trash-can-outline"
                    mode="contained" 
                    buttonColor={styles.deleteButton.backgroundColor} // Cor vermelha
                    onPress={() => confirmDelete(selectedUser)}>
                    Deletar
                  </Button>
                </View>

              </View>
            )}
          </Modal>
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
  modalName: {
    fontSize: 18,
    marginVertical: 10,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  modalButton: {
    flex: 1, // Faz os botões ocuparem espaço igual
    marginHorizontal: 5, // Adiciona um espaçamento entre eles
  },
  deleteButton: {
    backgroundColor: '#d9534f', // Um tom de vermelho
  },
});

export default UserListScreen;