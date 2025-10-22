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

export default function FuncionarioDetailsModal({
  visible,
  funcionario,
  onClose,
}) {
  if (!funcionario) return null;

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR');
  };

  const calculateAge = (dateString) => {
    if (!dateString) return 'N/A';
    const birthDate = new Date(dateString);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    return age;
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Ionicons name="close" size={24} color="#666" />
          </TouchableOpacity>
          <Text style={styles.title}>Detalhes do Funcionário</Text>
          <View style={styles.placeholder} />
        </View>

        <ScrollView style={styles.content}>
          <View style={styles.detailsCard}>
            <View style={styles.iconContainer}>
              <Ionicons name="person" size={48} color="#007AFF" />
            </View>
            
            <Text style={styles.funcionarioNome}>{funcionario.nome}</Text>
            
            <View style={styles.detailRow}>
              <Ionicons name="mail" size={20} color="#666" />
              <Text style={styles.detailLabel}>Email:</Text>
              <Text style={styles.detailValue}>{funcionario.email}</Text>
            </View>

            <View style={styles.detailRow}>
              <Ionicons name="calendar" size={20} color="#666" />
              <Text style={styles.detailLabel}>Data de Nascimento:</Text>
              <Text style={styles.detailValue}>{formatDate(funcionario.data_nascimento)}</Text>
            </View>

            <View style={styles.detailRow}>
              <Ionicons name="time" size={20} color="#666" />
              <Text style={styles.detailLabel}>Idade:</Text>
              <Text style={styles.detailValue}>{calculateAge(funcionario.data_nascimento)} anos</Text>
            </View>

            <View style={styles.detailRow}>
              <Ionicons name="id-card" size={20} color="#666" />
              <Text style={styles.detailLabel}>ID:</Text>
              <Text style={styles.detailValue}>{funcionario.id}</Text>
            </View>
          </View>

          <View style={styles.infoCard}>
            <View style={styles.infoHeader}>
              <Ionicons name="information-circle" size={24} color="#007AFF" />
              <Text style={styles.infoTitle}>Informações</Text>
            </View>
            <Text style={styles.infoText}>
              Este funcionário pode ter cargos associados. Para gerenciar cargos, 
              acesse a tela de Cargos e filtre por este funcionário.
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
  funcionarioNome: {
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
});
