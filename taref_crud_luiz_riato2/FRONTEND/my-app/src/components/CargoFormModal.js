import React, { useState, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ScrollView,
  TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';
import { inserirCargo, atualizarCargo } from '../Conf/Bd';

export default function CargoFormModal({
  visible,
  cargo,
  database,
  funcionarios,
  funcoes,
  onClose,
  onSubmit,
}) {
  const [nomeCargo, setNomeCargo] = useState('');
  const [selectedFuncionario, setSelectedFuncionario] = useState(null);
  const [selectedFuncao, setSelectedFuncao] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (cargo) {
      setNomeCargo(cargo.nome_cargo || '');
      setSelectedFuncionario(cargo.id_funcionario_fk || null);
      setSelectedFuncao(cargo.id_funcao_fk || null);
    } else {
      setNomeCargo('');
      setSelectedFuncionario(null);
      setSelectedFuncao(null);
    }
  }, [cargo, visible]);

  const validateForm = () => {
    if (!nomeCargo.trim()) {
      Alert.alert('Erro', 'Nome do cargo é obrigatório');
      return false;
    }
    if (!selectedFuncionario) {
      Alert.alert('Erro', 'Selecione um funcionário');
      return false;
    }
    if (!selectedFuncao) {
      Alert.alert('Erro', 'Selecione uma função');
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm() || !database) return;

    setLoading(true);
    try {
      if (cargo) {
        // Atualizar cargo existente
        const success = await atualizarCargo(
          database,
          cargo.id_cargo,
          nomeCargo.trim(),
          selectedFuncionario,
          selectedFuncao
        );
        if (success) {
          Alert.alert('Sucesso', 'Cargo atualizado com sucesso');
          onSubmit();
        } else {
          Alert.alert('Erro', 'Falha ao atualizar cargo. Verifique se a função já não está em uso.');
        }
      } else {
        // Inserir novo cargo
        const id = await inserirCargo(
          database,
          nomeCargo.trim(),
          selectedFuncionario,
          selectedFuncao
        );
        if (id) {
          Alert.alert('Sucesso', 'Cargo cadastrado com sucesso');
          onSubmit();
        } else {
          Alert.alert('Erro', 'Falha ao cadastrar cargo. Verifique se a função já não está em uso.');
        }
      }
    } catch (error) {
      console.error('Erro ao salvar cargo:', error);
      Alert.alert('Erro', 'Falha ao salvar cargo');
    } finally {
      setLoading(false);
    }
  };

  const getFuncionarioNome = (id) => {
    const funcionario = funcionarios.find(f => f.id === id);
    return funcionario ? funcionario.nome : 'N/A';
  };

  const getFuncaoNome = (id) => {
    const funcao = funcoes.find(f => f.id_funcao === id);
    return funcao ? funcao.nome_funcao : 'N/A';
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Ionicons name="close" size={24} color="#666" />
          </TouchableOpacity>
          <Text style={styles.title}>
            {cargo ? 'Editar Cargo' : 'Novo Cargo'}
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
              <Text style={styles.label}>Nome do Cargo *</Text>
              <TextInput
                style={styles.input}
                value={nomeCargo}
                onChangeText={setNomeCargo}
                placeholder="Digite o nome do cargo"
                autoCapitalize="words"
                maxLength={100}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Funcionário *</Text>
              <View style={styles.pickerContainer}>
                <Picker
                  selectedValue={selectedFuncionario}
                  onValueChange={setSelectedFuncionario}
                  style={styles.picker}
                >
                  <Picker.Item label="Selecione um funcionário" value={null} />
                  {funcionarios.map((funcionario) => (
                    <Picker.Item
                      key={funcionario.id}
                      label={funcionario.nome}
                      value={funcionario.id}
                    />
                  ))}
                </Picker>
              </View>
              {selectedFuncionario && (
                <Text style={styles.selectedText}>
                  Selecionado: {getFuncionarioNome(selectedFuncionario)}
                </Text>
              )}
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Função *</Text>
              <View style={styles.pickerContainer}>
                <Picker
                  selectedValue={selectedFuncao}
                  onValueChange={setSelectedFuncao}
                  style={styles.picker}
                >
                  <Picker.Item label="Selecione uma função" value={null} />
                  {funcoes.map((funcao) => (
                    <Picker.Item
                      key={funcao.id_funcao}
                      label={funcao.nome_funcao}
                      value={funcao.id_funcao}
                    />
                  ))}
                </Picker>
              </View>
              {selectedFuncao && (
                <Text style={styles.selectedText}>
                  Selecionada: {getFuncaoNome(selectedFuncao)}
                </Text>
              )}
            </View>

            <View style={styles.infoCard}>
              <View style={styles.infoHeader}>
                <Ionicons name="information-circle" size={20} color="#007AFF" />
                <Text style={styles.infoTitle}>Importante</Text>
              </View>
              <Text style={styles.infoText}>
                • Cada função pode ter apenas um cargo{'\n'}
                • Um funcionário pode ter múltiplos cargos{'\n'}
                • Verifique se a função selecionada não está já em uso
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
  pickerContainer: {
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    overflow: 'hidden',
  },
  picker: {
    height: 50,
  },
  selectedText: {
    fontSize: 12,
    color: '#007AFF',
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
