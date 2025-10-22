import React, { useState, useEffect } from 'react';
import { ScrollView, View, StyleSheet, Alert } from 'react-native';
import { Modal, Text, Button, TextInput } from 'react-native-paper';

const UserFormModal = ({ visible, onDismiss, onSubmit, initialData, title, submitButtonText }) => {
    const [formData, setFormData] = useState(initialData);

    // Atualiza o formulário quando a propriedade `initialData` mudar
    useEffect(() => {
        setFormData(initialData);
    }, [initialData]);

    const handleInputChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleAddressChange = (field, value) => {
        setFormData(prev => ({
            ...prev,
            endereco: { ...prev.endereco, [field]: value }
        }));
    };

    const buscaCep = async (cep) => {
        const cepOnlyNumbers = cep.replace(/[^0-9]/g, '');
        handleAddressChange('cep', cepOnlyNumbers);
    
        if (cepOnlyNumbers.length !== 8) return;
    
        try {
            const response = await fetch(`https://viacep.com.br/ws/${cepOnlyNumbers}/json/`);
            const data = await response.json();
            if (!data.erro) {
                setFormData(prev => ({
                    ...prev,
                    endereco: {
                        ...prev.endereco,
                        logradouro: data.logradouro,
                        bairro: data.bairro,
                        localidade: data.localidade,
                        uf: data.uf,
                        complemento: data.complemento || ''
                    }
                }));
            } else {
                Alert.alert("Erro", "CEP não encontrado.");
            }
        } catch (error) {
            Alert.alert("Erro de Conexão", "Não foi possível buscar o CEP.");
        }
    };
    
    const handleSubmit = () => {
        if (!formData.nome.trim() || !formData.matricula.trim()) {
            return Alert.alert("Erro", "Matrícula e Nome são obrigatórios.");
        }
        onSubmit(formData);
    };

    return (
        <Modal visible={visible} onDismiss={onDismiss} contentContainerStyle={styles.containerStyle}>
            <ScrollView>
                <Text style={styles.modalTitle}>{title}</Text>
                <TextInput label="Matrícula" value={formData.matricula} onChangeText={t => handleInputChange('matricula', t)} style={styles.textInput} mode="outlined" />
                <TextInput label="Nome Completo" value={formData.nome} onChangeText={t => handleInputChange('nome', t)} style={styles.textInput} mode="outlined" />
                <TextInput label="Cursos (separados por vírgula)" value={formData.cursos} onChangeText={t => handleInputChange('cursos', t)} style={styles.textInput} mode="outlined" />
                
                <Text style={styles.formSectionTitle}>Endereço</Text>
                <TextInput label="CEP" value={formData.endereco.cep} onChangeText={buscaCep} keyboardType="numeric" maxLength={8} style={styles.textInput} mode="outlined" />
                <TextInput label="Logradouro" value={formData.endereco.logradouro} editable={false} style={styles.textInput} mode="outlined" />
                <TextInput label="Número" value={formData.endereco.numero} onChangeText={t => handleAddressChange('numero', t)} style={styles.textInput} mode="outlined" />
                <TextInput label="Bairro" value={formData.endereco.bairro} editable={false} style={styles.textInput} mode="outlined" />
                <TextInput label="Cidade" value={formData.endereco.localidade} editable={false} style={styles.textInput} mode="outlined" />
                <TextInput label="UF" value={formData.endereco.uf} editable={false} style={styles.textInput} mode="outlined" />
                
                <View style={styles.buttonContainer}>
                    <Button style={styles.modalButton} mode="contained" onPress={handleSubmit}>{submitButtonText}</Button>
                    <Button style={styles.modalButton} mode="outlined" onPress={onDismiss}>Cancelar</Button>
                </View>
            </ScrollView>
        </Modal>
    );
};

const styles = StyleSheet.create({
    containerStyle: { backgroundColor: 'white', padding: 20, margin: 20, borderRadius: 8, maxHeight: '90%' },
    modalTitle: { fontSize: 22, fontWeight: 'bold', marginBottom: 15, textAlign: 'center' },
    formSectionTitle: { fontSize: 18, fontWeight: '600', marginTop: 20, marginBottom: 10, borderTopWidth: 1, borderTopColor: '#eee', paddingTop: 15 },
    textInput: { marginBottom: 10 },
    buttonContainer: { marginTop: 20 },
    modalButton: { marginVertical: 5 },
});

export default UserFormModal;