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
import { inserirFuncionario, atualizarFuncionario } from '../Conf/Bd';

export default function FuncionarioFormModal({
  visible,
  funcionario,
  database,
  onClose,
  onSubmit,
}) {
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [dataNascimento, setDataNascimento] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (funcionario) {
      setNome(funcionario.nome || '');
      setEmail(funcionario.email || '');
      setDataNascimento(funcionario.data_nascimento || '');
    } else {
      setNome('');
      setEmail('');
      setDataNascimento('');
    }
  }, [funcionario, visible]);

  const validateForm = () => {
    if (!nome.trim()) {
      Alert.alert('Erro', 'Nome é obrigatório');
      return false;
    }
    if (!email.trim()) {
      Alert.alert('Erro', 'Email é obrigatório');
      return false;
    }
    if (!email.includes('@')) {
      Alert.alert('Erro', 'Email deve ter um formato válido');
      return false;
    }
    if (!dataNascimento.trim()) {
      Alert.alert('Erro', 'Data de nascimento é obrigatória');
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm() || !database) return;

    setLoading(true);
    try {
      if (funcionario) {
        // Atualizar funcionário existente
        const success = await atualizarFuncionario(
          database,
          funcionario.id,
          nome.trim(),
          email.trim(),
          dataNascimento.trim()
        );
        if (success) {
          Alert.alert('Sucesso', 'Funcionário atualizado com sucesso');
          onSubmit();
        } else {
          Alert.alert('Erro', 'Falha ao atualizar funcionário');
        }
      } else {
        // Inserir novo funcionário
        const id = await inserirFuncionario(
          database,
          nome.trim(),
          email.trim(),
          dataNascimento.trim()
        );
        if (id) {
          Alert.alert('Sucesso', 'Funcionário cadastrado com sucesso');
          onSubmit();
        } else {
          Alert.alert('Erro', 'Falha ao cadastrar funcionário. Verifique se o email já não está em uso.');
        }
      }
    } catch (error) {
      console.error('Erro ao salvar funcionário:', error);
      Alert.alert('Erro', 'Falha ao salvar funcionário');
    } finally {
      setLoading(false);
    }
  };

  const formatDateInput = (text) => {
    // Remove caracteres não numéricos
    const numbers = text.replace(/\D/g, '');
    
    // Aplica máscara DD/MM/YYYY
    if (numbers.length <= 2) {
      return numbers;
    } else if (numbers.length <= 4) {
      return `${numbers.slice(0, 2)}/${numbers.slice(2)}`;
    } else {
      return `${numbers.slice(0, 2)}/${numbers.slice(2, 4)}/${numbers.slice(4, 8)}`;
    }
  };

  const handleDateChange = (text) => {
    const formatted = formatDateInput(text);
    setDataNascimento(formatted);
  };

  const convertToDatabaseFormat = (dateString) => {
    // Converte DD/MM/YYYY para YYYY-MM-DD
    const parts = dateString.split('/');
    if (parts.length === 3) {
      return `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`;
    }
    return dateString;
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Ionicons name="close" size={24} color="#666" />
          </TouchableOpacity>
          <Text style={styles.title}>
            {funcionario ? 'Editar Funcionário' : 'Novo Funcionário'}
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
              <Text style={styles.label}>Nome *</Text>
              <TextInput
                style={styles.input}
                value={nome}
                onChangeText={setNome}
                placeholder="Digite o nome completo"
                autoCapitalize="words"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Email *</Text>
              <TextInput
                style={styles.input}
                value={email}
                onChangeText={setEmail}
                placeholder="Digite o email"
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Data de Nascimento *</Text>
              <TextInput
                style={styles.input}
                value={dataNascimento}
                onChangeText={handleDateChange}
                placeholder="DD/MM/AAAA"
                keyboardType="numeric"
                maxLength={10}
              />
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
});
