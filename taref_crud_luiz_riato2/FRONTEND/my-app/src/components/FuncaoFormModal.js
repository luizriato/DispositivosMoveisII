import React, { useState, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { inserirFuncao, atualizarFuncao } from '../Conf/Bd';

export default function FuncaoFormModal({
  visible,
  funcao,
  database,
  onClose,
  onSubmit,
}) {
  const [nomeFuncao, setNomeFuncao] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (funcao) {
      setNomeFuncao(funcao.nome_funcao || '');
    } else {
      setNomeFuncao('');
    }
  }, [funcao, visible]);

  const validateForm = () => {
    if (!nomeFuncao.trim()) {
      Alert.alert('Erro', 'Nome da função é obrigatório');
      return false;
    }
    if (nomeFuncao.trim().length < 3) {
      Alert.alert('Erro', 'Nome da função deve ter pelo menos 3 caracteres');
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm() || !database) return;

    setLoading(true);
    try {
      if (funcao) {
        // Atualizar função existente
        const success = await atualizarFuncao(
          database,
          funcao.id_funcao,
          nomeFuncao.trim()
        );
        if (success) {
          Alert.alert('Sucesso', 'Função atualizada com sucesso');
          onSubmit();
        } else {
          Alert.alert('Erro', 'Falha ao atualizar função');
        }
      } else {
        // Inserir nova função
        const id = await inserirFuncao(database, nomeFuncao.trim());
        if (id) {
          Alert.alert('Sucesso', 'Função cadastrada com sucesso');
          onSubmit();
        } else {
          Alert.alert('Erro', 'Falha ao cadastrar função');
        }
      }
    } catch (error) {
      console.error('Erro ao salvar função:', error);
      Alert.alert('Erro', 'Falha ao salvar função');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Ionicons name="close" size={24} color="#666" />
          </TouchableOpacity>
          <Text style={styles.title}>
            {funcao ? 'Editar Função' : 'Nova Função'}
          </Text>
          <TouchableOpacity
            onPress={handleSubmit}
            style={[styles.saveButton, loading && styles.saveButtonDisabled]}
            disabled={loading}
          >
            <Ionicons name="checkmark" size={24} color="white" />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content}>
          <View style={styles.form}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Nome da Função *</Text>
              <TextInput
                style={styles.input}
                value={nomeFuncao}
                onChangeText={setNomeFuncao}
                placeholder="Digite o nome da função"
                autoCapitalize="words"
                maxLength={100}
              />
              <Text style={styles.helperText}>
                Ex: Desenvolvedor, Analista, Gerente, etc.
              </Text>
            </View>

            <View style={styles.infoCard}>
              <View style={styles.infoHeader}>
                <Ionicons name="information-circle" size={20} color="#007AFF" />
                <Text style={styles.infoTitle}>Importante</Text>
              </View>
              <Text style={styles.infoText}>
                • Cada função pode ter apenas um cargo associado{'\n'}
                • Ao excluir uma função, todos os cargos associados serão removidos{'\n'}
                • O nome da função deve ser único e descritivo
              </Text>
            </View>
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
  saveButton: {
    backgroundColor: '#007AFF',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  saveButtonDisabled: {
    backgroundColor: '#ccc',
  },
  content: {
    flex: 1,
  },
  form: {
    padding: 16,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  input: {
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#333',
  },
  helperText: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
    fontStyle: 'italic',
  },
  infoCard: {
    backgroundColor: '#E3F2FD',
    borderRadius: 8,
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
    fontSize: 14,
    fontWeight: 'bold',
    color: '#007AFF',
    marginLeft: 8,
  },
  infoText: {
    fontSize: 12,
    color: '#666',
    lineHeight: 18,
  },
});
