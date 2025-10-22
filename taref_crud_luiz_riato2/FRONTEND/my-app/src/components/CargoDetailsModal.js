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

export default function CargoDetailsModal({
  visible,
  cargo,
  onClose,
}) {
  if (!cargo) return null;

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Ionicons name="close" size={24} color="#666" />
          </TouchableOpacity>
          <Text style={styles.title}>Detalhes do Cargo</Text>
          <View style={styles.placeholder} />
        </View>

        <ScrollView style={styles.content}>
          <View style={styles.detailsCard}>
            <View style={styles.iconContainer}>
              <Ionicons name="business" size={48} color="#007AFF" />
            </View>
            
            <Text style={styles.cargoNome}>{cargo.nome_cargo}</Text>
            
            <View style={styles.detailRow}>
              <Ionicons name="id-card" size={20} color="#666" />
              <Text style={styles.detailLabel}>ID:</Text>
              <Text style={styles.detailValue}>{cargo.id_cargo}</Text>
            </View>

            <View style={styles.detailRow}>
              <Ionicons name="person" size={20} color="#666" />
              <Text style={styles.detailLabel}>Funcionário:</Text>
              <Text style={styles.detailValue}>{cargo.nome_funcionario}</Text>
            </View>

            <View style={styles.detailRow}>
              <Ionicons name="briefcase" size={20} color="#666" />
              <Text style={styles.detailLabel}>Função:</Text>
              <Text style={styles.detailValue}>{cargo.nome_funcao}</Text>
            </View>
          </View>

          <View style={styles.infoCard}>
            <View style={styles.infoHeader}>
              <Ionicons name="information-circle" size={24} color="#007AFF" />
              <Text style={styles.infoTitle}>Sobre Cargos</Text>
            </View>
            <Text style={styles.infoText}>
              Os cargos representam as posições ocupadas pelos funcionários 
              dentro da organização. Cada cargo está associado a um funcionário 
              e uma função específica, criando a estrutura organizacional.
            </Text>
          </View>

          <View style={styles.relationshipCard}>
            <View style={styles.relationshipHeader}>
              <Ionicons name="link" size={24} color="#34C759" />
              <Text style={styles.relationshipTitle}>Relacionamentos</Text>
            </View>
            <View style={styles.relationshipItem}>
              <Ionicons name="person" size={16} color="#666" />
              <Text style={styles.relationshipText}>
                <Text style={styles.relationshipLabel}>Funcionário:</Text> {cargo.nome_funcionario}
              </Text>
            </View>
            <View style={styles.relationshipItem}>
              <Ionicons name="briefcase" size={16} color="#666" />
              <Text style={styles.relationshipText}>
                <Text style={styles.relationshipLabel}>Função:</Text> {cargo.nome_funcao}
              </Text>
            </View>
          </View>

          <View style={styles.warningCard}>
            <View style={styles.warningHeader}>
              <Ionicons name="warning" size={24} color="#FF9500" />
              <Text style={styles.warningTitle}>Atenção</Text>
            </View>
            <Text style={styles.warningText}>
              • Ao excluir um cargo, a associação entre funcionário e função será removida{'\n'}
              • Esta é uma ação irreversível{'\n'}
              • O funcionário e a função permanecerão no sistema
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
  cargoNome: {
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
    minWidth: 80,
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
  relationshipCard: {
    backgroundColor: '#F0F9FF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#34C759',
  },
  relationshipHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  relationshipTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#34C759',
    marginLeft: 8,
  },
  relationshipItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  relationshipText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 8,
    flex: 1,
  },
  relationshipLabel: {
    fontWeight: '600',
    color: '#333',
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
