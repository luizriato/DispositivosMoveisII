import React from 'react';
import { ScrollView, View, StyleSheet } from 'react-native';
import { Modal, Text, Button } from 'react-native-paper';

const UserDetailsModal = ({ user, visible, onDismiss, onEdit, onDelete }) => {
    if (!user) return null;

    return (
        <Modal visible={visible} onDismiss={onDismiss} contentContainerStyle={styles.containerStyle}>
            <ScrollView>
                <Text style={styles.modalTitle}>Detalhes do Usuário</Text>
                <Text style={styles.detailText}>ID: {user._id}</Text>
                <Text style={styles.detailText}>Matrícula: {user.matricula}</Text>
                <Text style={styles.detailText}>Nome: {user.nome}</Text>
                <Text style={styles.detailText}>Cursos: {user.cursos?.join(', ') || 'Nenhum'}</Text>
                {user.endereco && (
                    <>
                        <Text style={styles.formSectionTitle}>Endereço</Text>
                        <Text style={styles.detailText}>{user.endereco.logradouro}, {user.endereco.numero}</Text>
                        <Text style={styles.detailText}>{user.endereco.bairro} - {user.endereco.localidade}/{user.endereco.uf}</Text>
                        <Text style={styles.detailText}>CEP: {user.endereco.cep}</Text>
                    </>
                )}
                <View style={styles.buttonContainer}>
                    <Button style={styles.modalButton} icon="pencil-outline" mode="contained" onPress={() => onEdit(user)}>Alterar</Button>
                    <Button style={styles.modalButton} icon="trash-can-outline" mode="contained" buttonColor="#d9534f" onPress={onDelete}>Deletar</Button>
                    <Button style={styles.modalButton} icon="close-circle-outline" mode="outlined" onPress={onDismiss}>Fechar</Button>
                </View>
            </ScrollView>
        </Modal>
    );
};

const styles = StyleSheet.create({
    containerStyle: { backgroundColor: 'white', padding: 20, margin: 20, borderRadius: 8, maxHeight: '90%' },
    modalTitle: { fontSize: 22, fontWeight: 'bold', marginBottom: 15, textAlign: 'center' },
    detailText: { fontSize: 16, marginBottom: 8 },
    formSectionTitle: { fontSize: 18, fontWeight: '600', marginTop: 20, marginBottom: 10, borderTopWidth: 1, borderTopColor: '#eee', paddingTop: 15 },
    buttonContainer: { marginTop: 20 },
    modalButton: { marginVertical: 5 },
});

export default UserDetailsModal;