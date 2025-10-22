import React from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function FuncaoDetailsModal({
  visible,
  funcao,
  onClose,
}) {
  if (!funcao) return null;

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Ionicons name="close" size={24} color="#666" />
          </TouchableOpacity>
          <Text style={styles.title}>Detalhes da Função</Text>
          <View style={styles.placeholder} />
        </View>

        <ScrollView style={styles.content}>
          <View style={styles.detailsCard}>
            <View style={styles.iconContainer}>
              <Ionicons name="briefcase" size={48} color="#007AFF" />
            </View>
            
            <Text style={styles.funcaoNome}>{funcao.nome_funcao}</Text>
            
            <View style={styles.detailRow}>
              <Ionicons name="id-card" size={20} color="#666" />
              <Text style={styles.detailLabel}>ID:</Text>
              <Text style={styles.detailValue}>{funcao.id_funcao}</Text>
            </View>
          </View>

          <View style={styles.infoCard}>
            <View style={styles.infoHeader}>
              <Ionicons name="information-circle" size={24} color="#007AFF" />
              <Text style={styles.infoTitle}>Sobre Funções</Text>
            </View>
            <Text style={styles.infoText}>
              As funções representam as responsabilidades ou papéis que podem ser 
              atribuídos aos funcionários através dos cargos. Cada função pode ter 
              apenas um cargo associado, garantindo a unicidade.
            </Text>
          </View>

          <View style={styles.warningCard}>
            <View style={styles.warningHeader}>
              <Ionicons name="warning" size={24} color="#FF9500" />
              <Text style={styles.warningTitle}>Atenção</Text>
            </View>
            <Text style={styles.warningText}>
              • Ao excluir uma função, todos os cargos associados serão removidos automaticamente{'\n'}
              • Esta é uma ação irreversível{'\n'}
              • Verifique se não há cargos importantes associados antes de excluir
            </Text>
          </View>
        </ScrollView>
      </View>
    </Modal>
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
  closeButton: {
    padding: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  detailsCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  iconContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  funcaoNome: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 24,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  detailLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
    marginLeft: 12,
    minWidth: 40,
  },
  detailValue: {
    fontSize: 16,
    color: '#333',
    flex: 1,
    marginLeft: 8,
  },
  infoCard: {
    backgroundColor: '#E3F2FD',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#007AFF',
  },
  infoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#007AFF',
    marginLeft: 8,
  },
  infoText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  warningCard: {
    backgroundColor: '#FFF3E0',
    borderRadius: 12,
    padding: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#FF9500',
  },
  warningHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  warningTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FF9500',
    marginLeft: 8,
  },
  warningText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
});
