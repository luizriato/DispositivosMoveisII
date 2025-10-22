import React, { useState } from 'react';
import { View, StyleSheet, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
// 1. Importar Portal e Dialog
import { 
  TextInput, 
  Button, 
  Text, 
  Card, 
  Title, 
  Paragraph,
  Portal,
  Dialog 
} from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import { inserirUsuario, initDatabase } from '../services/database';

const RegisterScreen = ({ onRegisterSuccess, onNavigateToLogin }) => {
  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    senha: '',
    confirmarSenha: '',
    data_nascimento: '',
    matricula: '',
  });
  const [loading, setLoading] = useState(false);

  // 2. Adicionar estados para o Dialog
  const [dialogVisible, setDialogVisible] = useState(false);
  const [dialogTitle, setDialogTitle] = useState('');
  const [dialogMessage, setDialogMessage] = useState('');
  const [onDialogDismiss, setOnDialogDismiss] = useState(null);

  // 3. Funções auxiliares para controlar o Dialog
  const showDialog = (title, message, onDismissCallback = null) => {
    setDialogTitle(title);
    setDialogMessage(message);
    setOnDialogDismiss(() => onDismissCallback); // Armazena a função de callback
    setDialogVisible(true);
  };

  const hideDialog = () => {
    setDialogVisible(false);
    // Executa a ação armazenada (se houver) ao fechar
    if (typeof onDialogDismiss === 'function') {
      onDialogDismiss();
    }
    setOnDialogDismiss(null); // Limpa a ação
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const validateForm = () => {
    const { nome, email, senha, confirmarSenha, data_nascimento } = formData;
    
    if (!nome.trim() || !email.trim() || !senha.trim() || !data_nascimento.trim()) {
      showDialog('Erro', 'Por favor, preencha todos os campos obrigatórios.');
      return false;
    }

    if (senha !== confirmarSenha) {
      showDialog('Erro', 'As senhas não coincidem.');
      return false;
    }

    if (senha.length < 6) {
      showDialog('Erro', 'A senha deve ter pelo menos 6 caracteres.');
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      showDialog('Erro', 'Por favor, insira um email válido.');
      return false;
    }

    return true;
  };

  const handleRegister = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      const db = await initDatabase();
      const { nome, email, senha, data_nascimento, matricula } = formData;
      
      const userId = await inserirUsuario(
        db,
        nome.trim(),
        email.trim(),
        senha,
        data_nascimento,
        matricula.trim() || null,
        null
      );
      
      if (userId) {
        // 4. Substituir Alert.alert e passar o callback
        showDialog(
          'Sucesso', 
          'Usuário cadastrado com sucesso!', 
          () => onRegisterSuccess({ id: userId, nome, email }) // Ação executada ao fechar
        );
      } else {
        // 4. Substituir Alert.alert
        showDialog('Erro', 'Erro ao cadastrar usuário. Email já existe ou dados inválidos.');
      }
    } catch (error) {
      console.error('Erro no cadastro:', error);
      // 4. Substituir Alert.alert
      showDialog('Erro', 'Ocorreu um erro ao cadastrar. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <LinearGradient
      colors={['#667eea', '#764ba2']}
      style={styles.container}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <Card style={styles.card}>
            <Card.Content style={styles.cardContent}>
              <Title style={styles.title}>Criar Conta</Title>
              <Paragraph style={styles.subtitle}>
                Preencha os dados para se cadastrar
              </Paragraph>

              <TextInput
                label="Nome *"
                value={formData.nome}
                onChangeText={(value) => handleInputChange('nome', value)}
                mode="outlined"
                style={styles.input}
                left={<TextInput.Icon icon="account" />}
              />

              <TextInput
                label="Email *"
                value={formData.email}
                onChangeText={(value) => handleInputChange('email', value)}
                mode="outlined"
                keyboardType="email-address"
                autoCapitalize="none"
                style={styles.input}
                left={<TextInput.Icon icon="email" />}
              />

              <TextInput
                label="Data de Nascimento *"
                value={formData.data_nascimento}
                onChangeText={(value) => handleInputChange('data_nascimento', value)}
                mode="outlined"
                placeholder="YYYY-MM-DD"
                style={styles.input}
                left={<TextInput.Icon icon="calendar" />}
              />

              <TextInput
                label="Matrícula"
                value={formData.matricula}
                onChangeText={(value) => handleInputChange('matricula', value)}
                mode="outlined"
                style={styles.input}
                left={<TextInput.Icon icon="card-account-details" />}
              />

              <TextInput
                label="Senha *"
                value={formData.senha}
                onChangeText={(value) => handleInputChange('senha', value)}
                mode="outlined"
                secureTextEntry
                style={styles.input}
                left={<TextInput.Icon icon="lock" />}
              />

              <TextInput
                label="Confirmar Senha *"
                value={formData.confirmarSenha}
                onChangeText={(value) => handleInputChange('confirmarSenha', value)}
                mode="outlined"
                secureTextEntry
                style={styles.input}
                left={<TextInput.Icon icon="lock-check" />}
              />

              <Button
                mode="contained"
                onPress={handleRegister}
                loading={loading}
                disabled={loading}
                style={styles.registerButton}
                contentStyle={styles.buttonContent}
              >
                Cadastrar
              </Button>

              <View style={styles.loginContainer}>
                <Text style={styles.loginText}>Já tem uma conta?</Text>
                <Button
                  mode="text"
                  onPress={onNavigateToLogin}
                  style={styles.loginButton}
                >
                  Faça login
                </Button>
              </View>
            </Card.Content>
          </Card>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* 5. Adicionar o Portal com o Dialog */}
      <Portal>
        <Dialog visible={dialogVisible} onDismiss={hideDialog}>
          <Dialog.Title>{dialogTitle}</Dialog.Title>
          <Dialog.Content>
            <Paragraph>{dialogMessage}</Paragraph>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={hideDialog}>OK</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </LinearGradient>
  );
};

// ... (seus estilos permanecem os mesmos)
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
  },
  card: {
    elevation: 8,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
  },
  cardContent: {
    padding: 24,
  },
  title: {
    textAlign: 'center',
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  subtitle: {
    textAlign: 'center',
    fontSize: 16,
    color: '#666',
    marginBottom: 32,
  },
  input: {
    marginBottom: 16,
    backgroundColor: 'transparent',
  },
  registerButton: {
    marginTop: 8,
    marginBottom: 24,
    borderRadius: 8,
  },
  buttonContent: {
    paddingVertical: 8,
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loginText: {
    color: '#666',
    fontSize: 16,
  },
  loginButton: {
    marginLeft: 8,
  },
});

export default RegisterScreen;