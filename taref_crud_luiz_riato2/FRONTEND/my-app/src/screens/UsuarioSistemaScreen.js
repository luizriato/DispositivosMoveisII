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
import { 
  CriaBanco, 
  CriaTabelas, 
  consultaUsuariosSistemaCompletos, 
  deletarUsuarioSistema,
  consultaFuncionarios
} from '../Conf/Bd';
import UsuarioSistemaFormModal from '../components/UsuarioSistemaFormModal';
import UsuarioSistemaDetailsModal from '../components/UsuarioSistemaDetailsModal';

export default function UsuarioSistemaScreen({ onNavigateBack }) {
  const [usuarios, setUsuarios] = useState([]);
  const [funcionarios, setFuncionarios] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [showFormModal, setShowFormModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedUsuario, setSelectedUsuario] = useState(null);
  const [db, setDb] = useState(null);

  // Estados para os Diálogos
  const [infoDialog, setInfoDialog] = useState({ visible: false, title: '', message: '' });
  const [deleteDialog, setDeleteDialog] = useState({ visible: false, usuario: null });

  useEffect(() => {
    initializeDatabase();
  }, []);

  // Funções Auxiliares dos Diálogos
  const showInfoDialog = (title, message) => {
    setInfoDialog({ visible: true, title, message });
  };
  const hideInfoDialog = () => {
    setInfoDialog({ visible: false, title: '', message: '' });
  };

  const showDeleteDialog = (usuario) => {
    setDeleteDialog({ visible: true, usuario });
  };
  const hideDeleteDialog = () => {
    setDeleteDialog({ visible: false, usuario: null });
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
      showInfoDialog('Erro', 'Falha ao inicializar banco de dados');
    }
  };

  const loadData = async (database = db) => {
    if (!database) return;
    
    setLoading(true);
    try {
      const [usuariosList, funcionariosList] = await Promise.all([
        consultaUsuariosSistemaCompletos(database),
        consultaFuncionarios(database)
      ]);
      
      setUsuarios(usuariosList);
      setFuncionarios(funcionariosList);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
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

  const handleAddUsuario = () => {
    setSelectedUsuario(null);
    setShowFormModal(true);
  };

  const handleEditUsuario = (usuario) => {
    setSelectedUsuario(usuario);
    setShowFormModal(true);
  };

  const handleViewUsuario = (usuario) => {
    setSelectedUsuario(usuario);
    setShowDetailsModal(true);
  };

  const handleDeleteUsuario = (usuario) => {
    showDeleteDialog(usuario);
  };

  const handleConfirmDelete = async () => {
    const { usuario } = deleteDialog;
    if (!usuario) return;

    hideDeleteDialog();
    try {
      const success = await deletarUsuarioSistema(db, usuario.id_usuario);
      if (success) {
        showInfoDialog('Sucesso', 'Usuário do sistema excluído com sucesso');
        loadData();
      } else {
        showInfoDialog('Erro', 'Falha ao excluir usuário do sistema');
      }
    } catch (error) {
      console.error('Erro ao excluir usuário do sistema:', error);
      showInfoDialog('Erro', 'Falha ao excluir usuário do sistema');
    }
  };

  const handleFormSubmit = () => {
    setShowFormModal(false);
    loadData();
  };

  const renderUsuario = ({ item }) => (
    <View style={styles.usuarioCard}>
      <View style={styles.usuarioInfo}>
        <Text style={styles.usuarioLogin}>{item.login}</Text>
        <View style={styles.usuarioDetails}>
          <View style={styles.detailRow}>
            <Ionicons name="person" size={16} color="#666" />
            <Text style={styles.detailText}>{item.nome_funcionario}</Text>
          </View>
          <View style={styles.detailRow}>
            <Ionicons name="mail" size={16} color="#666" />
            <Text style={styles.detailText}>{item.email_funcionario}</Text>
          </View>
          <View style={styles.detailRow}>
            <Ionicons name={item.ativo ? "checkmark-circle" : "close-circle"} size={16} color={item.ativo ? "#4CAF50" : "#F44336"} />
            <Text style={[styles.detailText, { color: item.ativo ? "#4CAF50" : "#F44336" }]}>
              {item.ativo ? "Ativo" : "Inativo"}
            </Text>
          </View>
        </View>
      </View>
      <View style={styles.usuarioActions}>
        <TouchableOpacity
          style={[styles.actionButton, styles.viewButton]}
          onPress={() => handleViewUsuario(item)}
        >
          <Ionicons name="eye" size={20} color="#007AFF" />
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionButton, styles.editButton]}
          onPress={() => handleEditUsuario(item)}
        >
          <Ionicons name="pencil" size={20} color="#FF9500" />
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionButton, styles.deleteButton]}
          onPress={() => handleDeleteUsuario(item)}
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
          <Text style={styles.title}>Usuários do Sistema</Text>
          <TouchableOpacity style={styles.addButton} onPress={handleAddUsuario}>
            <Ionicons name="add" size={24} color="white" />
          </TouchableOpacity>
        </View>

        <FlatList
          data={usuarios}
          keyExtractor={(item) => item.id_usuario.toString()}
          renderItem={renderUsuario}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="people-outline" size={64} color="#ccc" />
              <Text style={styles.emptyText}>Nenhum usuário do sistema cadastrado</Text>
              <Text style={styles.emptySubtext}>
                Toque no botão + para adicionar um usuário
              </Text>
            </View>
          }
        />

        <UsuarioSistemaFormModal
          visible={showFormModal}
          usuario={selectedUsuario}
          database={db}
          funcionarios={funcionarios}
          onClose={() => setShowFormModal(false)}
          onSubmit={handleFormSubmit}
        />

        <UsuarioSistemaDetailsModal
          visible={showDetailsModal}
          usuario={selectedUsuario}
          onClose={() => setShowDetailsModal(false)}
        />

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
                {`Tem certeza que deseja excluir o usuário "${deleteDialog.usuario?.login}"?`}
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
  usuarioCard: {
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
  usuarioInfo: {
    flex: 1,
  },
  usuarioLogin: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  usuarioDetails: {
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
  usuarioActions: {
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
