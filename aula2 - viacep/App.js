import * as React from 'react';
import { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, TextInput } from 'react-native-paper';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

const MyComponent = () => {
  const [cep, setCep] = useState('');
  const [endereco, setEndereco] = useState(null);
  const [numero, setNumero] = useState('');

  const buscaCep = (value) => {
    setCep(value);

    if (value.length === 8) {
      let url = `https://viacep.com.br/ws/${value}/json/`;
      fetch(url)
        .then((response) => response.json())
        .then((data) => {
          if (!data.erro) {
            setEndereco(data);
          } else {
            setEndereco(null);
          }
        })
        .catch((error) => {
          console.error('Erro ao buscar cep: ', error);
          setEndereco(null);
        });
    } else {
      setEndereco(null);
    }
  };

  return (
    <View style={styles.container}>
      <Text variant="displaySmall" style={styles.label}>
        CEP
      </Text>
      <TextInput
        mode="outlined"
        label="Digite o CEP"
        placeholder="00000000"
        value={cep}
        onChangeText={buscaCep}
        style={styles.input}
        keyboardType="numeric"
      />

      {endereco && (
        <View style={styles.boxEndereco}>
          <TextInput
            mode="outlined"
            label="Logradouro"
            value={endereco.logradouro}
            editable={false}
            left={<TextInput.Icon icon={() => <MaterialCommunityIcons name="map-marker" size={20} color="red" />} />}
            style={styles.input}
          />
          <TextInput
            mode="outlined"
            label="Estado"
            value={endereco.uf}
            editable={false}
            left={<TextInput.Icon icon={() => <MaterialCommunityIcons name="map" size={20} color="purple" />} />}
            style={styles.input}
          />
          <TextInput
            mode="outlined"
            label="Bairro"
            value={endereco.bairro}
            editable={false}
            left={<TextInput.Icon icon={() => <MaterialCommunityIcons name="home-city" size={20} color="blue" />} />}
            style={styles.input}
          />
          <TextInput
            mode="outlined"
            label="Cidade"
            value={endereco.localidade}
            editable={false}
            left={<TextInput.Icon icon={() => <MaterialCommunityIcons name="city" size={20} color="green" />} />}
            style={styles.input}
          />
          <TextInput
            mode="outlined"
            label="CEP"
            value={endereco.cep}
            editable={false}
            left={<TextInput.Icon icon={() => <MaterialCommunityIcons name="numeric" size={20} color="orange" />} />}
            style={styles.input}
          />
          <TextInput
            mode="outlined"
            label="Número"
            placeholder="Digite o número"
            value={numero}
            onChangeText={setNumero}
            left={<TextInput.Icon icon={() => <MaterialCommunityIcons name="home" size={20} color="brown" />} />}
            style={styles.input}
          />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 16,
  },
  label: {
    marginBottom: 8,
    marginLeft: '5%',
  },
  input: {
    width: '90%',
    maxWidth: 400,
    alignSelf: 'center',
    marginBottom: 10,
  },
  boxEndereco: {
    marginTop: 20,
  },
});

export default MyComponent;
