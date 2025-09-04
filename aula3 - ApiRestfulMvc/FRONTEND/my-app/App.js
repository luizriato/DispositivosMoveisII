import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, Button } from 'react-native';
import { useState } from 'react';

export default function App() {
  const url = 'http://192.168.179.142:3000'; 
  const [dados, setDados] = useState(null); 

  const ExibirDados = async (url) => {
    try {
      const response = await fetch(url);
      const data = await response.json();
      console.log(data);
      setDados(data); 
    } catch (error) {
      console.error(error);
    }
  }

  return (
    <View style={styles.container}>
      <Button title="Exibir Dados" onPress={() => ExibirDados(url)} />
      {dados && (
        <Text style={{ marginTop: 20 }}>
          {JSON.stringify(dados, null, 2)}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 20,
  },
});
