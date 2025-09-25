import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';
import { CriaBanco, CriaTabela, inserirUsuario, consultaUsuario } from './Conf/Bd';
import { useEffect } from 'react';
import { SQLiteDatabase } from 'expo-sqlite';

export default function App() {

  const Main = async () => {
    const db = await CriaBanco();
    alert('Banco criado/aberto');
    if (db) await CriaTabela(db);
    alert('Tabela criada');
    // if(db) await inserirUsuario(db,"Luiz","luiz.riato@outlook.com");
    // alert('Usuario inserido: ')
    if (db) await consultaUsuario(db);    
    const registro = consultaUsuario(db);
    for (const linhas of registro){
      console.log(linhas.ID_US, linhas.NOME_US, linhas.EMAIL_US)
    }
    alert(registro);
  };

useEffect(() => {
  Main();
},[])
  return (
    <View style={styles.container}>

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
