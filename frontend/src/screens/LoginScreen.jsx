import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../services/api';

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [loading, setLoading] = useState(false);
  const [senhaVisivel, setSenhaVisivel] = useState(false);

  const handleLogin = async () => {
    if (!email.trim()) {
      Alert.alert('Erro', 'E-mail é obrigatório');
      return;
    }
    if (!senha) {
      Alert.alert('Erro', 'Senha é obrigatória');
      return;
    }

    setLoading(true);
    try {
      const response = await api.post('/auth/login', {
        email: email.trim().toLowerCase(),
        senha,
      });

      await AsyncStorage.setItem('token', response.data.token);
      
      navigation.replace('ListaLivros'); // ajuste para a rota principal do seu app
    } catch (error) {
      console.error(error);
      const mensagem =
        error.response?.data?.message || 'E-mail ou senha incorretos.';
      Alert.alert('Erro ao entrar', mensagem);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView
      contentContainerStyle={styles.container}
      keyboardShouldPersistTaps="handled"
    >
      <View style={styles.header}>
        <Text style={styles.titulo}>Bem-vindo de volta</Text>
        <Text style={styles.subtitulo}>Entre na sua conta para continuar</Text>
      </View>

      <Text style={styles.label}>E-mail</Text>
      <TextInput
        style={styles.input}
        value={email}
        onChangeText={setEmail}
        placeholder="seuemail@exemplo.com"
        keyboardType="email-address"
        autoCapitalize="none"
        autoCorrect={false}
      />

      <Text style={styles.label}>Senha</Text>
      <View style={styles.inputSenhaContainer}>
        <TextInput
          style={styles.inputSenha}
          value={senha}
          onChangeText={setSenha}
          placeholder="Sua senha"
          secureTextEntry={!senhaVisivel}
          autoCapitalize="none"
        />
        <TouchableOpacity
          onPress={() => setSenhaVisivel(!senhaVisivel)}
          style={styles.toggleSenha}
        >
          <Text style={styles.toggleSenhaTexto}>
            {senhaVisivel ? 'Ocultar' : 'Mostrar'}
          </Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        style={styles.botaoPrincipal}
        onPress={handleLogin}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.botaoPrincipalTexto}>Entrar</Text>
        )}
      </TouchableOpacity>

      <View style={styles.divisorContainer}>
        <View style={styles.divisorLinha} />
        <Text style={styles.divisorTexto}>ou</Text>
        <View style={styles.divisorLinha} />
      </View>

      <TouchableOpacity
        style={styles.botaoSecundario}
        onPress={() => navigation.navigate('Cadastro')}
      >
        <Text style={styles.botaoSecundarioTexto}>Criar uma conta</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: '#fff',
    padding: 24,
    justifyContent: 'center',
  },
  header: {
    marginBottom: 32,
  },
  titulo: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 6,
  },
  subtitulo: {
    fontSize: 15,
    color: '#6b7280',
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#534AB7',
    marginTop: 16,
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#f9f9f9',
    color: '#1f2937',
  },
  inputSenhaContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    backgroundColor: '#f9f9f9',
  },
  inputSenha: {
    flex: 1,
    padding: 12,
    fontSize: 16,
    color: '#1f2937',
  },
  toggleSenha: {
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  toggleSenhaTexto: {
    color: '#534AB7',
    fontWeight: '600',
    fontSize: 14,
  },
  botaoPrincipal: {
    backgroundColor: '#534AB7',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 28,
  },
  botaoPrincipalTexto: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  divisorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 24,
  },
  divisorLinha: {
    flex: 1,
    height: 1,
    backgroundColor: '#e5e7eb',
  },
  divisorTexto: {
    marginHorizontal: 12,
    color: '#9ca3af',
    fontSize: 14,
  },
  botaoSecundario: {
    borderWidth: 1.5,
    borderColor: '#534AB7',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  botaoSecundarioTexto: {
    color: '#534AB7',
    fontSize: 16,
    fontWeight: '600',
  },
});
