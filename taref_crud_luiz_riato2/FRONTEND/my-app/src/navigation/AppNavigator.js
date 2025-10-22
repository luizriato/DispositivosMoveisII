import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { View, StyleSheet, ActivityIndicator } from 'react-native';

import SplashScreen from '../screens/SplashScreen';
import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import UserListScreen from '../screens/UserListScreen';
import FuncionarioScreen from '../screens/FuncionarioScreen';
import FuncaoScreen from '../screens/FuncaoScreen';
import CargoScreen from '../screens/CargoScreen';
import UsuarioSistemaScreen from '../screens/UsuarioSistemaScreen';
import { initDatabase, resetDatabase } from '../services/database';

const Stack = createStackNavigator();

const AppNavigator = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    initializeApp();
  }, []);

  const initializeApp = async () => {
    try {
      // Inicializa o banco de dados
      console.log('Inicializando banco de dados...');
      await initDatabase();
      console.log('Banco de dados inicializado com sucesso');
      
      
      // Simula um tempo de carregamento para a splash screen
      setTimeout(() => {
        setIsLoading(false);
      }, 3000);
    } catch (error) {
      console.error('Erro ao inicializar app:', error);
      console.log('Tentando resetar o banco de dados...');
      
      try {
        await resetDatabase();
        console.log('Banco de dados resetado com sucesso');
      } catch (resetError) {
        console.error('Erro ao resetar banco:', resetError);
      }
      
      setIsLoading(false);
    }
  };

  const handleLoginSuccess = (user) => {
    setCurrentUser(user);
    setIsAuthenticated(true);
  };

  const handleRegisterSuccess = (user) => {
    setCurrentUser(user);
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setIsAuthenticated(false);
  };

  if (isLoading) {
    return <SplashScreen onFinish={() => setIsLoading(false)} />;
  }

  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
        }}
      >
        {!isAuthenticated ? (
          // Telas de autenticação
          <>
            <Stack.Screen name="Login">
              {({ navigation }) => (
                <LoginScreen
                  onLoginSuccess={handleLoginSuccess}
                  onNavigateToRegister={() => navigation.navigate('Register')}
                />
              )}
            </Stack.Screen>
            <Stack.Screen name="Register">
              {({ navigation }) => (
                <RegisterScreen
                  onRegisterSuccess={handleRegisterSuccess}
                  onNavigateToLogin={() => navigation.navigate('Login')}
                />
              )}
            </Stack.Screen>
          </>
        ) : (
          // Telas principais após login
          <>
            <Stack.Screen name="UserList">
              {({ navigation }) => (
                <UserListScreen 
                  currentUser={currentUser}
                  onLogout={handleLogout}
                  onNavigateToFuncionarios={() => navigation.navigate('Funcionarios')}
                  onNavigateToFuncoes={() => navigation.navigate('Funcoes')}
                  onNavigateToCargos={() => navigation.navigate('Cargos')}
                  onNavigateToUsuariosSistema={() => navigation.navigate('UsuariosSistema')}
                />
              )}
            </Stack.Screen>
            <Stack.Screen name="Funcionarios">
              {({ navigation }) => (
                <FuncionarioScreen 
                  onNavigateBack={() => navigation.goBack()}
                />
              )}
            </Stack.Screen>
            <Stack.Screen name="Funcoes">
              {({ navigation }) => (
                <FuncaoScreen 
                  onNavigateBack={() => navigation.goBack()}
                />
              )}
            </Stack.Screen>
            <Stack.Screen name="Cargos">
              {({ navigation }) => (
                <CargoScreen 
                  onNavigateBack={() => navigation.goBack()}
                />
              )}
            </Stack.Screen>
            <Stack.Screen name="UsuariosSistema">
              {({ navigation }) => (
                <UsuarioSistemaScreen 
                  onNavigateBack={() => navigation.goBack()}
                />
              )}
            </Stack.Screen>
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;
