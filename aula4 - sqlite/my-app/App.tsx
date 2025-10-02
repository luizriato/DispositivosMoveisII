import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';
import { CriaBanco, CriaTabela, inserirUsuario, consultaUsuario, deletaUsuario, atualizaUsuario } from './Conf/Bd';
import { useEffect } from 'react';
import { SQLiteDatabase } from 'expo-sqlite';

export default function App() {

  const Main = async () => {
    const db = await CriaBanco();
    if (!db) {
      alert("Erro ao abrir banco");
      return; // garante que nunca vai chamar com undefined
    }
    alert('Banco criado/aberto');
    if (db) await CriaTabela(db);
    alert('Tabela criada');

    if (db) await consultaUsuario(db);    
      const registro = await consultaUsuario(db);
      if (registro.length > 0) {
        let listaUsuarios = "Usuários cadastrados:\n\n";
        for (const linhas of registro) {
          listaUsuarios += `ID: ${linhas.ID_US} | Nome: ${linhas.NOME_US} | Email: ${linhas.EMAIL_US}\n`;
        }
        alert(listaUsuarios);
      } else {
        alert("Nenhum usuário encontrado.");
      }


    const resp = await deletaUsuario(db, 1);

    if (resp) {
      alert('Usuário deletado');
    } else {
      alert('Erro ao deletar usuário');
    }
    
    alert(JSON.stringify(registro));

    const inserido = await inserirUsuario(db, "Luiz", "luiz.riato@outlook.com");
    if (inserido) {
      alert("Usuário inserido");
    } else {
      alert("Erro ao inserir usuário");
    }

    const atualizado = await atualizaUsuario(db, 1, "Luiz", "luiz.riato@outlook.com");
    if (atualizado) {
      alert("Usuário atualizado");
    } else {
      alert("Erro ao atualizar usuário");
    }
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
