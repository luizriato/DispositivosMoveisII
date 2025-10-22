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
import { autenticarUsuario, initDatabase } from '../services/database';

const LoginScreen = ({ onLoginSuccess, onNavigateToRegister }) => {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [loading, setLoading] = useState(false);

  // 2. Adicionar estados para o Dialog
  const [dialogVisible, setDialogVisible] = useState(false);
  const [dialogTitle, setDialogTitle] = useState('');
  const [dialogMessage, setDialogMessage] = useState('');
  // Estado para guardar a ação a ser executada ao fechar o diálogo
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

  const handleLogin = async () => {
    if (!email.trim() || !senha.trim()) {
      showDialog('Erro', 'Por favor, preencha todos os campos.');
      return;
    }

    setLoading(true);
    try {
      const db = await initDatabase();
      const usuario = await autenticarUsuario(db, email.trim(), senha);
      
      if (usuario) {
        showDialog('Sucesso', 'Login realizado com sucesso!', () => {
          onLoginSuccess(usuario);
        });
      } else {
        showDialog('Erro', 'Email ou senha incorretos. Verifique seus dados e tente novamente.');
      }
    } catch (error) {
      console.error('Erro no login:', error);
      showDialog('Erro', 'Ocorreu um erro ao fazer login. Tente novamente.');
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
              <Title style={styles.title}>Bem-vindo!</Title>
              <Paragraph style={styles.subtitle}>
                Faça login para continuar
              </Paragraph>

              <TextInput
                label="Email"
                value={email}
                onChangeText={setEmail}
                mode="outlined"
                keyboardType="email-address"
                autoCapitalize="none"
                style={styles.input}
                left={<TextInput.Icon icon="email" />}
              />

              <TextInput
                label="Senha"
                value={senha}
                onChangeText={setSenha}
                mode="outlined"
                secureTextEntry
                style={styles.input}
                left={<TextInput.Icon icon="lock" />}
              />

              <Button
                mode="contained"
                onPress={handleLogin}
                loading={loading}
                disabled={loading}
                style={styles.loginButton}
                contentStyle={styles.buttonContent}
              >
                Entrar
              </Button>

              <View style={styles.registerContainer}>
                <Text style={styles.registerText}>Não tem uma conta?</Text>
                <Button
                  mode="text"
                  onPress={onNavigateToRegister}
                  style={styles.registerButton}
                >
                  Cadastre-se
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
  loginButton: {
    marginTop: 8,
    marginBottom: 24,
    borderRadius: 8,
  },
  buttonContent: {
    paddingVertical: 8,
  },
  registerContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  registerText: {
    color: '#666',
    fontSize: 16,
  },
  registerButton: {
    marginLeft: 8,
  },
});

export default LoginScreen;