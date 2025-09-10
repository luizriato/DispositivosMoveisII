import * as React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useState } from 'react';
import { Provider as PaperProvider, Button } from 'react-native-paper';  // <- PaperProvider e Button

export default function App() {
  const url = 'http://192.168.179.142:3000'; 
  const [dados, setDados] = useState(null); 

  const ExibirDados = async () => {
    try {
      const response = await fetch(url);
      const data = await response.json();
      console.log(data);
      setDados(data); 
    } catch (error) {
      console.error(error);
    }
  };

  const inserirUser = async () => {
    try {
      const response = await fetch(`${url}/inserir`, {
        method: 'POST',
        body: JSON.stringify({ name: 'Vitor' }),
        headers: {
          'Content-Type': 'application/json; charset=utf-8'
        }
      });
      const data = await response.json();
      console.log("Resposta do servidor:", data);
    } catch (error) {
      console.error("Erro no inserirUser:", error);
    }
  };
  
  const deletarUser = async () => {
    try {
      const response = await fetch(`${url}/deletar/68b8ca2b98dd96b57b08610a`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json; charset=utf-8'
        }
      });
      const data = await response.json();
      console.log("Resposta do servidor:", data);
    } catch (error) {
      console.error("Erro no deletarUser:", error);
    }
  };

  const limparDados = () => {
    setDados(null);
  };

  return (
    <PaperProvider>
      <View style={styles.container}>
        <Button 
          mode="contained" 
          onPress={ExibirDados} 
          style={styles.botao}>
          Exibir Dados
        </Button>

        <Button 
          mode="contained" 
          onPress={inserirUser} 
          style={styles.botao}>
          Inserir User
        </Button>

        <Button 
          mode="outlined" 
          onPress={limparDados} 
          style={styles.botao}>
          Limpar
        </Button>

        <Button 
          mode="contained" 
          buttonColor="red" 
          textColor="white"
          onPress={deletarUser} 
          style={styles.botao}>
          Deletar User
        </Button>

        {dados && (
          <Text style={{ marginTop: 20 }}>
            {JSON.stringify(dados, null, 2)}
          </Text>
        )}
      </View>
    </PaperProvider>
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
  botao: {
    marginVertical: 5,
    width: 220,
  },
});
