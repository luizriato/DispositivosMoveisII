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
import { 
  CriaBanco, 
  CriaTabelas, 
  consultaCargosCompletos, 
  deletarCargo,
  consultaFuncionarios,
  consultaFuncoes
} from '../Conf/Bd';
import CargoFormModal from '../components/CargoFormModal';
import CargoDetailsModal from '../components/CargoDetailsModal';

export default function CargoScreen({ onNavigateBack }) {
  const [cargos, setCargos] = useState([]);
  const [funcionarios, setFuncionarios] = useState([]);
  const [funcoes, setFuncoes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [showFormModal, setShowFormModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedCargo, setSelectedCargo] = useState(null);
  const [db, setDb] = useState(null);

  // 2. Estados para os Diálogos
  const [infoDialog, setInfoDialog] = useState({ visible: false, title: '', message: '' });
  const [deleteDialog, setDeleteDialog] = useState({ visible: false, cargo: null });

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

  const showDeleteDialog = (cargo) => {
    setDeleteDialog({ visible: true, cargo });
  };
  const hideDeleteDialog = () => {
    setDeleteDialog({ visible: false, cargo: null });
  };

  const initializeDatabase = async () => {
    try {
      const database = await CriaBanco();
      if (database) {
        await CriaTabelas(database);
        setDb(database);
        loadData(database);
      }
    } catch (error) {
      console.error('Erro ao inicializar banco:', error);
      // 4. Substituir Alert
      showInfoDialog('Erro', 'Falha ao inicializar banco de dados');
    }
  };

  const loadData = async (database = db) => {
    if (!database) return;
    
    setLoading(true);
    try {
      const [cargosList, funcionariosList, funcoesList] = await Promise.all([
        consultaCargosCompletos(database),
        consultaFuncionarios(database),
        consultaFuncoes(database)
      ]);
      
      setCargos(cargosList);
      setFuncionarios(funcionariosList);
      setFuncoes(funcoesList);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      // 4. Substituir Alert
      showInfoDialog('Erro', 'Falha ao carregar dados');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  // ... (outras funções handle... permanecem iguais) ...
  const handleAddCargo = () => {
    setSelectedCargo(null);
    setShowFormModal(true);
  };

  const handleEditCargo = (cargo) => {
    setSelectedCargo(cargo);
    setShowFormModal(true);
  };

  const handleViewCargo = (cargo) => {
    setSelectedCargo(cargo);
    setShowDetailsModal(true);
  };

  const handleDeleteCargo = (cargo) => {
    // 4. Substituir Alert de confirmação
    showDeleteDialog(cargo);
  };

  // 3. Nova função para confirmar a exclusão
  const handleConfirmDelete = async () => {
    const { cargo } = deleteDialog;
    if (!cargo) return;

    hideDeleteDialog(); // Fecha o diálogo
    try {
      const success = await deletarCargo(db, cargo.id_cargo);
      if (success) {
        // 4. Substituir Alert
        showInfoDialog('Sucesso', 'Cargo excluído com sucesso');
        loadData();
      } else {
        // 4. Substituir Alert
        showInfoDialog('Erro', 'Falha ao excluir cargo');
      }
    } catch (error) {
      console.error('Erro ao excluir cargo:', error);
      // 4. Substituir Alert
      showInfoDialog('Erro', 'Falha ao excluir cargo');
    }
  };

  const handleFormSubmit = () => {
    setShowFormModal(false);
    loadData();
  };

  const renderCargo = ({ item }) => (
    <View style={styles.cargoCard}>
      <View style={styles.cargoInfo}>
        <Text style={styles.cargoNome}>{item.nome_cargo}</Text>
        <View style={styles.cargoDetails}>
          <View style={styles.detailRow}>
            <Ionicons name="person" size={16} color="#666" />
            <Text style={styles.detailText}>{item.nome_funcionario}</Text>
          </View>
          <View style={styles.detailRow}>
            <Ionicons name="briefcase" size={16} color="#666" />
            <Text style={styles.detailText}>{item.nome_funcao}</Text>
          </View>
        </View>
      </View>
      <View style={styles.cargoActions}>
        <TouchableOpacity
          style={[styles.actionButton, styles.viewButton]}
          onPress={() => handleViewCargo(item)}
        >
          <Ionicons name="eye" size={20} color="#007AFF" />
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionButton, styles.editButton]}
          onPress={() => handleEditCargo(item)}
        >
          <Ionicons name="pencil" size={20} color="#FF9500" />
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionButton, styles.deleteButton]}
          onPress={() => handleDeleteCargo(item)}
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
          <Text style={styles.title}>Cargos</Text>
          <TouchableOpacity style={styles.addButton} onPress={handleAddCargo}>
            <Ionicons name="add" size={24} color="white" />
          </TouchableOpacity>
        </View>

        <FlatList
          data={cargos}
          keyExtractor={(item) => item.id_cargo.toString()}
          renderItem={renderCargo}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="business-outline" size={64} color="#ccc" />
              <Text style={styles.emptyText}>Nenhum cargo cadastrado</Text>
              <Text style={styles.emptySubtext}>
                Toque no botão + para adicionar um cargo
              </Text>
            </View>
          }
        />

        <CargoFormModal
          visible={showFormModal}
          cargo={selectedCargo}
          database={db}
          funcionarios={funcionarios}
          funcoes={funcoes}
          onClose={() => setShowFormModal(false)}
          onSubmit={handleFormSubmit}
        />

        <CargoDetailsModal
          visible={showDetailsModal}
          cargo={selectedCargo}
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
                {`Tem certeza que deseja excluir o cargo "${deleteDialog.cargo?.nome_cargo}"?`}
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
  cargoCard: {
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
  cargoInfo: {
    flex: 1,
  },
  cargoNome: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  cargoDetails: {
    gap: 4,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  detailText: {
    fontSize: 14,
    color: '#666',
  },
  cargoActions: {
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