import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
// 1. Importar componentes do React Native Paper
import { 
  Provider, 
  Portal, 
  Dialog, 
  Paragraph, 
  Button 
} from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { CriaBanco, CriaTabelas, consultaFuncionarios, deletarFuncionario } from '../Conf/Bd';
import FuncionarioFormModal from '../components/FuncionarioFormModal';
import FuncionarioDetailsModal from '../components/FuncionarioDetailsModal';

export default function FuncionarioScreen({ onNavigateBack }) {
  const [funcionarios, setFuncionarios] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [showFormModal, setShowFormModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedFuncionario, setSelectedFuncionario] = useState(null);
  const [db, setDb] = useState(null);

  // --- 2. Estados para os Diálogos ---
  const [infoDialog, setInfoDialog] = useState({ visible: false, title: '', message: '' });
  const [deleteDialog, setDeleteDialog] = useState({ visible: false, funcionario: null });

  useEffect(() => {
    initializeDatabase();
  }, []);

  // --- 3. Funções Auxiliares dos Diálogos ---
  const showInfoDialog = (title, message) => {
    setInfoDialog({ visible: true, title, message });
  };
  const hideInfoDialog = () => {
    setInfoDialog({ visible: false, title: '', message: '' });
  };

  const showDeleteDialog = (funcionario) => {
    setDeleteDialog({ visible: true, funcionario });
  };
  const hideDeleteDialog = () => {
    setDeleteDialog({ visible: false, funcionario: null });
  };

  const initializeDatabase = async () => {
    try {
      const database = await CriaBanco();
      if (database) {
        await CriaTabelas(database);
        setDb(database);
        loadFuncionarios(database);
      }
    } catch (error) {
      console.error('Erro ao inicializar banco:', error);
      showInfoDialog('Erro', 'Falha ao inicializar banco de dados');
    }
  };

  const loadFuncionarios = async (database = db) => {
    if (!database) return;
    
    setLoading(true);
    try {
      const funcionariosList = await consultaFuncionarios(database);
      setFuncionarios(funcionariosList);
    } catch (error) {
      console.error('Erro ao carregar funcionários:', error);
      showInfoDialog('Erro', 'Falha ao carregar funcionários');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadFuncionarios();
    setRefreshing(false);
  };

  // ... (outras funções handle... permanecem iguais) ...
  const handleAddFuncionario = () => {
    setSelectedFuncionario(null);
    setShowFormModal(true);
  };

  const handleEditFuncionario = (funcionario) => {
    setSelectedFuncionario(funcionario);
    setShowFormModal(true);
  };

  const handleViewFuncionario = (funcionario) => {
    setSelectedFuncionario(funcionario);
    setShowDetailsModal(true);
  };


  const handleDeleteFuncionario = (funcionario) => {
    showDeleteDialog(funcionario);
  };

  // 3. Nova função para confirmar a exclusão
  const handleConfirmDelete = async () => {
    const { funcionario } = deleteDialog;
    if (!funcionario) return;

    hideDeleteDialog(); // Fecha o diálogo
    try {
      const success = await deletarFuncionario(db, funcionario.id);
      if (success) {
        showInfoDialog('Sucesso', 'Funcionário excluído com sucesso');
        loadFuncionarios();
      } else {
        showInfoDialog('Erro', 'Falha ao excluir funcionário');
      }
    } catch (error) {
      console.error('Erro ao excluir funcionário:', error);
      showInfoDialog('Erro', 'Falha ao excluir funcionário');
    }
  };


  const handleFormSubmit = () => {
    setShowFormModal(false);
    loadFuncionarios();
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR');
  };

  const renderFuncionario = ({ item }) => (
    <View style={styles.funcionarioCard}>
      <View style={styles.funcionarioInfo}>
        <Text style={styles.funcionarioNome}>{item.nome}</Text>
        <Text style={styles.funcionarioEmail}>{item.email}</Text>
        <Text style={styles.funcionarioData}>
          Nascimento: {formatDate(item.data_nascimento)}
        </Text>
      </View>
      <View style={styles.funcionarioActions}>
        <TouchableOpacity
          style={[styles.actionButton, styles.viewButton]}
          onPress={() => handleViewFuncionario(item)}
        >
          <Ionicons name="eye" size={20} color="#007AFF" />
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionButton, styles.editButton]}
          onPress={() => handleEditFuncionario(item)}
        >
          <Ionicons name="pencil" size={20} color="#FF9500" />
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionButton, styles.deleteButton]}
          onPress={() => handleDeleteFuncionario(item)}
        >
          <Ionicons name="trash" size={20} color="#FF3B30" />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    // 2. Adicionar Provider
    <Provider> 
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={onNavigateBack}>
            <Ionicons name="arrow-back" size={24} color="#333" />
          </TouchableOpacity>
          <Text style={styles.title}>Funcionários</Text>
          <TouchableOpacity style={styles.addButton} onPress={handleAddFuncionario}>
            <Ionicons name="add" size={24} color="white" />
          </TouchableOpacity>
        </View>

        <FlatList
          data={funcionarios}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderFuncionario}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="people-outline" size={64} color="#ccc" />
              <Text style={styles.emptyText}>Nenhum funcionário cadastrado</Text>
              <Text style={styles.emptySubtext}>
                Toque no botão + para adicionar um funcionário
              </Text>
            </View>
          }
        />

        <FuncionarioFormModal
          visible={showFormModal}
          funcionario={selectedFuncionario}
          database={db}
          onClose={() => setShowFormModal(false)}
          onSubmit={handleFormSubmit}
        />

        <FuncionarioDetailsModal
          visible={showDetailsModal}
          funcionario={selectedFuncionario}
          onClose={() => setShowDetailsModal(false)}
        />

        {/* 5. Adicionar o Portal e os Diálogos */}
        <Portal>
          {/* Diálogo de Informação (Erro/Sucesso) */}
          <Dialog visible={infoDialog.visible} onDismiss={hideInfoDialog}>
            <Dialog.Title>{infoDialog.title}</Dialog.Title>
            <Dialog.Content>
              <Paragraph>{infoDialog.message}</Paragraph>
            </Dialog.Content>
            <Dialog.Actions>
              <Button onPress={hideInfoDialog}>OK</Button>
            </Dialog.Actions>
          </Dialog>

          {/* Diálogo de Confirmação (Excluir) */}
          <Dialog visible={deleteDialog.visible} onDismiss={hideDeleteDialog}>
            <Dialog.Title>Confirmar Exclusão</Dialog.Title>
            <Dialog.Content>
              <Paragraph>
                {`Tem certeza que deseja excluir o funcionário "${deleteDialog.funcionario?.nome}"?`}
              </Paragraph>
            </Dialog.Content>
            <Dialog.Actions>
              <Button onPress={hideDeleteDialog}>Cancelar</Button>
              <Button onPress={handleConfirmDelete} color="#FF3B30">Excluir</Button>
            </Dialog.Actions>
          </Dialog>
        </Portal>
      </View>
    </Provider>
  );
}

// ... (seus estilos permanecem os mesmos)
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  backButton: {
    padding: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  addButton: {
    backgroundColor: '#007AFF',
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  funcionarioCard: {
    backgroundColor: 'white',
    margin: 8,
    padding: 16,
    borderRadius: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  funcionarioInfo: {
    flex: 1,
  },
  funcionarioNome: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  funcionarioEmail: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
  },
  funcionarioData: {
    fontSize: 12,
    color: '#999',
  },
  funcionarioActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  viewButton: {
    backgroundColor: '#E3F2FD',
  },
  editButton: {
    backgroundColor: '#FFF3E0',
  },
  deleteButton: {
    backgroundColor: '#FFEBEE',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyText: {
    fontSize: 18,
    color: '#666',
    marginTop: 16,
    textAlign: 'center',
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999',
    marginTop: 8,
    textAlign: 'center',
  },
});