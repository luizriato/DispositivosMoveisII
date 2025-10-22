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
import { inserirUsuarioSistema, atualizarUsuarioSistema } from '../Conf/Bd';

export default function UsuarioSistemaFormModal({
  visible,
  usuario,
  database,
  funcionarios,
  onClose,
  onSubmit,
}) {
  const [login, setLogin] = useState('');
  const [senha, setSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');
  const [selectedFuncionario, setSelectedFuncionario] = useState(null);
  const [ativo, setAtivo] = useState(true);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (usuario) {
      setLogin(usuario.login || '');
      setSenha('');
      setConfirmarSenha('');
      setSelectedFuncionario(usuario.id_funcionario_fk || null);
      setAtivo(usuario.ativo);
    } else {
      setLogin('');
      setSenha('');
      setConfirmarSenha('');
      setSelectedFuncionario(null);
      setAtivo(true);
    }
  }, [usuario, visible]);

  const validateForm = () => {
    if (!login.trim()) {
      Alert.alert('Erro', 'Login é obrigatório');
      return false;
    }
    if (!usuario && !senha.trim()) {
      Alert.alert('Erro', 'Senha é obrigatória');
      return false;
    }
    if (!usuario && senha !== confirmarSenha) {
      Alert.alert('Erro', 'Senhas não coincidem');
      return false;
    }
    if (!selectedFuncionario) {
      Alert.alert('Erro', 'Selecione um funcionário');
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm() || !database) return;

    setLoading(true);
    try {
      if (usuario) {
        // Atualizar usuário existente
        const success = await atualizarUsuarioSistema(
          database,
          usuario.id_usuario,
          login.trim(),
          senha.trim() || usuario.senha, // Se não informou nova senha, mantém a atual
          ativo,
          selectedFuncionario
        );
        if (success) {
          Alert.alert('Sucesso', 'Usuário do sistema atualizado com sucesso');
          onSubmit();
        } else {
          Alert.alert('Erro', 'Falha ao atualizar usuário do sistema. Verifique se o login já não está em uso.');
        }
      } else {
        // Inserir novo usuário
        const id = await inserirUsuarioSistema(
          database,
          login.trim(),
          senha.trim(),
          selectedFuncionario,
          ativo
        );
        if (id) {
          Alert.alert('Sucesso', 'Usuário do sistema cadastrado com sucesso');
          onSubmit();
        } else {
          Alert.alert('Erro', 'Falha ao cadastrar usuário do sistema. Verifique se o login já não está em uso.');
        }
      }
    } catch (error) {
      console.error('Erro ao salvar usuário do sistema:', error);
      Alert.alert('Erro', 'Falha ao salvar usuário do sistema');
    } finally {
      setLoading(false);
    }
  };

  const getFuncionarioNome = (id) => {
    const funcionario = funcionarios.find(f => f.id === id);
    return funcionario ? funcionario.nome : 'N/A';
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Ionicons name="close" size={24} color="#666" />
          </TouchableOpacity>
          <Text style={styles.title}>
            {usuario ? 'Editar Usuário do Sistema' : 'Novo Usuário do Sistema'}
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
              <Text style={styles.label}>Login *</Text>
              <TextInput
                style={styles.input}
                value={login}
                onChangeText={setLogin}
                placeholder="Digite o login do usuário"
                autoCapitalize="none"
                maxLength={50}
              />
            </View>

            {!usuario && (
              <>
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Senha *</Text>
                  <TextInput
                    style={styles.input}
                    value={senha}
                    onChangeText={setSenha}
                    placeholder="Digite a senha"
                    secureTextEntry
                    maxLength={255}
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Confirmar Senha *</Text>
                  <TextInput
                    style={styles.input}
                    value={confirmarSenha}
                    onChangeText={setConfirmarSenha}
                    placeholder="Confirme a senha"
                    secureTextEntry
                    maxLength={255}
                  />
                </View>
              </>
            )}

            {usuario && (
              <>
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Nova Senha (opcional)</Text>
                  <TextInput
                    style={styles.input}
                    value={senha}
                    onChangeText={setSenha}
                    placeholder="Deixe em branco para manter a senha atual"
                    secureTextEntry
                    maxLength={255}
                  />
                </View>
              </>
            )}

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
              <Text style={styles.label}>Status</Text>
              <View style={styles.pickerContainer}>
                <Picker
                  selectedValue={ativo}
                  onValueChange={setAtivo}
                  style={styles.picker}
                >
                  <Picker.Item label="Ativo" value={true} />
                  <Picker.Item label="Inativo" value={false} />
                </Picker>
              </View>
            </View>

            <View style={styles.infoCard}>
              <View style={styles.infoHeader}>
                <Ionicons name="information-circle" size={20} color="#007AFF" />
                <Text style={styles.infoTitle}>Importante</Text>
              </View>
              <Text style={styles.infoText}>
                • Cada funcionário pode ter apenas um usuário do sistema{'\n'}
                • O login deve ser único no sistema{'\n'}
                • Usuários inativos não podem fazer login{'\n'}
                • A senha é obrigatória apenas para novos usuários
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
