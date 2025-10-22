import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  // Alert, // Removido
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
import { CriaBanco, CriaTabelas, consultaFuncoes, deletarFuncao } from '../Conf/Bd';
import FuncaoFormModal from '../components/FuncaoFormModal';
import FuncaoDetailsModal from '../components/FuncaoDetailsModal';

export default function FuncaoScreen({ onNavigateBack }) {
  const [funcoes, setFuncoes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [showFormModal, setShowFormModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedFuncao, setSelectedFuncao] = useState(null);
  const [db, setDb] = useState(null);

  // 2. Estados para os Diálogos
  const [infoDialog, setInfoDialog] = useState({ visible: false, title: '', message: '' });
  const [deleteDialog, setDeleteDialog] = useState({ visible: false, funcao: null });

  useEffect(() => {
    initializeDatabase();
  }, []);

  // 3. Funções Auxiliares dos Diálogos
  const showInfoDialog = (title, message) => {
    setInfoDialog({ visible: true, title, message });
  };
  const hideInfoDialog = () => {
    setInfoDialog({ visible: false, title: '', message: '' });
  };

  const showDeleteDialog = (funcao) => {
    setDeleteDialog({ visible: true, funcao });
  };
  const hideDeleteDialog = () => {
    setDeleteDialog({ visible: false, funcao: null });
  };

  const initializeDatabase = async () => {
    try {
      const database = await CriaBanco();
      if (database) {
        await CriaTabelas(database);
        setDb(database);
        loadFuncoes(database);
      }
    } catch (error) {
      console.error('Erro ao inicializar banco:', error);
      // 4. Substituir Alert
      showInfoDialog('Erro', 'Falha ao inicializar banco de dados');
    }
  };

  const loadFuncoes = async (database = db) => {
    if (!database) return;
    
    setLoading(true);
    try {
      const funcoesList = await consultaFuncoes(database);
      setFuncoes(funcoesList);
    } catch (error) {
      console.error('Erro ao carregar funções:', error);
      // 4. Substituir Alert
      showInfoDialog('Erro', 'Falha ao carregar funções');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadFuncoes();
    setRefreshing(false);
  };

  // ... (outras funções handle... permanecem iguais) ...
  const handleAddFuncao = () => {
    setSelectedFuncao(null);
    setShowFormModal(true);
  };

  const handleEditFuncao = (funcao) => {
    setSelectedFuncao(funcao);
    setShowFormModal(true);
  };

  const handleViewFuncao = (funcao) => {
    setSelectedFuncao(funcao);
    setShowDetailsModal(true);
  };


  const handleDeleteFuncao = (funcao) => {
    // 4. Substituir Alert de confirmação
    showDeleteDialog(funcao);
  };

  // 3. Nova função para confirmar a exclusão
  const handleConfirmDelete = async () => {
    const { funcao } = deleteDialog;
    if (!funcao) return;

    hideDeleteDialog(); // Fecha o diálogo
    try {
      const success = await deletarFuncao(db, funcao.id_funcao);
      if (success) {
        // 4. Substituir Alert
        showInfoDialog('Sucesso', 'Função excluída com sucesso');
        loadFuncoes();
      } else {
        // 4. Substituir Alert
        showInfoDialog('Erro', 'Falha ao excluir função');
      }
    } catch (error) {
      console.error('Erro ao excluir função:', error);
      // 4. Substituir Alert
      showInfoDialog('Erro', 'Falha ao excluir função');
    }
  };

  const handleFormSubmit = () => {
    setShowFormModal(false);
    loadFuncoes();
  };

  const renderFuncao = ({ item }) => (
    <View style={styles.funcaoCard}>
      <View style={styles.funcaoInfo}>
        <Text style={styles.funcaoNome}>{item.nome_funcao}</Text>
        <Text style={styles.funcaoId}>ID: {item.id_funcao}</Text>
      </View>
      <View style={styles.funcaoActions}>
        <TouchableOpacity
          style={[styles.actionButton, styles.viewButton]}
          onPress={() => handleViewFuncao(item)}
        >
          <Ionicons name="eye" size={20} color="#007AFF" />
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionButton, styles.editButton]}
          onPress={() => handleEditFuncao(item)}
        >
          <Ionicons name="pencil" size={20} color="#FF9500" />
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionButton, styles.deleteButton]}
          onPress={() => handleDeleteFuncao(item)}
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
          <Text style={styles.title}>Funções</Text>
          <TouchableOpacity style={styles.addButton} onPress={handleAddFuncao}>
            <Ionicons name="add" size={24} color="white" />
          </TouchableOpacity>
        </View>

        <FlatList
          data={funcoes}
          keyExtractor={(item) => item.id_funcao.toString()}
          renderItem={renderFuncao}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="briefcase-outline" size={64} color="#ccc" />
              <Text style={styles.emptyText}>Nenhuma função cadastrada</Text>
              <Text style={styles.emptySubtext}>
                Toque no botão + para adicionar uma função
              </Text>
            </View>
          }
        />

        <FuncaoFormModal
          visible={showFormModal}
          funcao={selectedFuncao}
          database={db}
          onClose={() => setShowFormModal(false)}
          onSubmit={handleFormSubmit}
        />

        <FuncaoDetailsModal
          visible={showDetailsModal}
          funcao={selectedFuncao}
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
                {`Tem certeza que deseja excluir a função "${deleteDialog.funcao?.nome_funcao}"?`}
              </Paragraph>
              {/* Mensagem de aviso extra */}
              <Paragraph style={styles.deleteWarning}>
                Atenção: Esta ação também excluirá todos os cargos associados a esta função.
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
  funcaoCard: {
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
  funcaoInfo: {
    flex: 1,
  },
  funcaoNome: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  funcaoId: {
    fontSize: 12,
    color: '#999',
  },
  funcaoActions: {
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
  // Estilo para o aviso de exclusão
  deleteWarning: {
    marginTop: 10,
    color: '#FF3B30', // Cor de aviso
    fontWeight: 'bold',
  },
});