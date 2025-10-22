import React from 'react';
import { Button, Dialog, Text } from 'react-native-paper';

const DeleteConfirmationDialog = ({ visible, onDismiss, onConfirm, userName }) => {
    return (
        <Dialog visible={visible} onDismiss={onDismiss}>
            <Dialog.Title>Confirmar Exclusão</Dialog.Title>
            <Dialog.Content>
                <Text>Tem certeza que deseja deletar o usuário "{userName}"?</Text>
            </Dialog.Content>
            <Dialog.Actions>
                <Button onPress={onDismiss}>Cancelar</Button>
                <Button textColor="#d9534f" onPress={onConfirm}>Confirmar</Button>
            </Dialog.Actions>
        </Dialog>
    );
};

export default DeleteConfirmationDialog;