import React from 'react';
import { Provider as PaperProvider } from 'react-native-paper';
import AppNavigator from './navigation/AppNavigator';
import { DatabaseProvider } from './contexts/DatabaseContext';

export default function App() {
  return (
    <DatabaseProvider>
      <PaperProvider>
        <AppNavigator />
      </PaperProvider>
    </DatabaseProvider>
  );
}