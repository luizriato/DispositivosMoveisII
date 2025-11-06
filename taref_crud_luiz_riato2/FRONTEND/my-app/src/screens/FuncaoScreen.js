import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { 
  Provider, 
  Portal, 
  Dialog, 
  Paragraph, 
  Button 
} from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
// 1. Importar do serviço UNIFICADO
import { consultaFuncoes, deletarFuncao } from '../services/unifiedDatabase';
import { useDatabase } from '../contexts/DatabaseContext'; // 2. Importar o hook de contexto
import FuncaoFormModal from '../components/FuncaoFormModal';
import FuncaoDetailsModal from '../components/FuncaoDetailsModal';

export default function FuncaoScreen({ onNavigateBack }) {
  const [funcoes, setFuncoes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [showFormModal, setShowFormModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedFuncao, setSelectedFuncao] = useState(null);
  // const [db, setDb] = useState(null); // 3. REMOVIDO - Não gerenciamos mais o 'db' aqui

  // 4. Obter o tipo de banco (embora a unifiedDatabase já saiba)
  const { databaseType } = useDatabase();

  const [infoDialog, setInfoDialog] = useState({ visible: false, title: '', message: '' });
  const [deleteDialog, setDeleteDialog] = useState({ visible: false, funcao: null });

  useEffect(() => {
    // 5. Apenas carrega as funções. O banco já foi inicializado no Login.
    loadFuncoes();
  }, [databaseType]); // Recarrega se o tipo de banco mudar (opcional)

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

  // 6. REMOVIDO - initializeDatabase() não é mais necessário aqui.

  const loadFuncoes = async () => {
    // 7. Não precisa mais do 'database' como parâmetro
    setLoading(true);
    try {
      // 8. Chama a função unificada
      const funcoesList = await consultaFuncoes();
      setFuncoes(funcoesList);
    } catch (error) {
      console.error('Erro ao carregar funções:', error);
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
    showDeleteDialog(funcao);
  };

  const handleConfirmDelete = async () => {
    const { funcao } = deleteDialog;
    if (!funcao) return;

    // 9. Lógica para pegar o ID correto (Mongo usa _id, SQLite usa id_funcao)
    const idToDelete = funcao._id || funcao.id_funcao;

    hideDeleteDialog();
    try {
      // 10. Chama a função unificada sem o 'db'
      const success = await deletarFuncao(idToDelete);
      if (success) {
        showInfoDialog('Sucesso', 'Função excluída com sucesso');
        loadFuncoes();
      } else {
        showInfoDialog('Erro', 'Falha ao excluir função');
      }
    } catch (error) {
      console.error('Erro ao excluir função:', error);
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
        {/* 11. Pega o ID correto para exibição */}
        <Text style={styles.funcaoId}>ID: {item._id || item.id_funcao}</Text>
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
          // 12. Pega o ID correto para a key
          keyExtractor={(item) => (item._id || item.id_funcao).toString()}
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
          // 13. REMOVIDA prop 'database'. O Modal deve ser refatorado
          // para usar 'unifiedDatabase' internamente.
          // database={db} 
          onClose={() => setShowFormModal(false)}
          onSubmit={handleFormSubmit}
        />

        <FuncaoDetailsModal
          visible={showDetailsModal}
          funcao={selectedFuncao}
          onClose={() => setShowDetailsModal(false)}
        />

        <Portal>
          <Dialog visible={infoDialog.visible} onDismiss={hideInfoDialog}>
            <Dialog.Title>{infoDialog.title}</Dialog.Title>
            <Dialog.Content>
              <Paragraph>{infoDialog.message}</Paragraph>
            </Dialog.Content>
            <Dialog.Actions>
              <Button onPress={hideInfoDialog}>OK</Button>
            </Dialog.Actions>
          </Dialog>

          <Dialog visible={deleteDialog.visible} onDismiss={hideDeleteDialog}>
            <Dialog.Title>Confirmar Exclusão</Dialog.Title>
            <Dialog.Content>
              <Paragraph>
                {`Tem certeza que deseja excluir a função "${deleteDialog.funcao?.nome_funcao}"?`}
              </Paragraph>
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
  deleteWarning: {
    marginTop: 10,
    color: '#FF3B30', 
    fontWeight: 'bold',
  },
});