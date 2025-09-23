import React from 'react';
import { ScrollView } from 'react-native';
import { List } from 'react-native-paper';

const UserList = ({ users, onUserPress }) => {
    return (
        <ScrollView>
            <List.Section>
                <List.Subheader>Clique em um usuário para ver os detalhes</List.Subheader>
                {users.map((user) => (
                    <List.Item
                        key={user._id}
                        title={user.nome}
                        description={`Matrícula: ${user.matricula}`}
                        left={props => <List.Icon {...props} icon="account-circle" />}
                        onPress={() => onUserPress(user)}
                    />
                ))}
            </List.Section>
        </ScrollView>
    );
};

export default UserList;