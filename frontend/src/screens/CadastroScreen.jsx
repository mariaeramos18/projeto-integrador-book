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
import api from '../services/api';

export default function CadastroScreen({ navigation }) {
  const [nome, setNome] = useState('');
  const [telefone, setTelefone] = useState('');
  const [dataNascimento, setDataNascimento] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');
  const [senhaVisivel, setSenhaVisivel] = useState(false);
  const [loading, setLoading] = useState(false);

  const formatarTelefone = (valor) => {
    const numeros = valor.replace(/\D/g, '').slice(0, 11);
    if (numeros.length <= 2) return `(${numeros}`;
    if (numeros.length <= 7) return `(${numeros.slice(0, 2)}) ${numeros.slice(2)}`;
    if (numeros.length <= 11)
      return `(${numeros.slice(0, 2)}) ${numeros.slice(2, 7)}-${numeros.slice(7)}`;
    return valor;
  };

  const formatarData = (valor) => {
    const numeros = valor.replace(/\D/g, '').slice(0, 8);
    if (numeros.length <= 2) return numeros;
    if (numeros.length <= 4) return `${numeros.slice(0, 2)}/${numeros.slice(2)}`;
    return `${numeros.slice(0, 2)}/${numeros.slice(2, 4)}/${numeros.slice(4)}`;
  };

  const validarData = (data) => {
    if (!data) return true; // campo opcional
    const partes = data.split('/');
    if (partes.length !== 3) return false;
    const [dia, mes, ano] = partes.map(Number);
    const d = new Date(ano, mes - 1, dia);
    return (
      d.getFullYear() === ano &&
      d.getMonth() === mes - 1 &&
      d.getDate() === dia &&
      ano >= 1900 &&
      ano <= new Date().getFullYear()
    );
  };

  const handleCadastro = async () => {
    if (!nome.trim()) {
      Alert.alert('Erro', 'Nome completo é obrigatório');
      return;
    }
    if (!email.trim()) {
      Alert.alert('Erro', 'E-mail é obrigatório');
      return;
    }
    if (!/\S+@\S+\.\S+/.test(email)) {
      Alert.alert('Erro', 'E-mail inválido');
      return;
    }
    if (dataNascimento && !validarData(dataNascimento)) {
      Alert.alert('Erro', 'Data de nascimento inválida (DD/MM/AAAA)');
      return;
    }
    if (!senha) {
      Alert.alert('Erro', 'Senha é obrigatória');
      return;
    }
    if (senha.length < 6) {
      Alert.alert('Erro', 'A senha deve ter pelo menos 6 caracteres');
      return;
    }
    if (senha !== confirmarSenha) {
      Alert.alert('Erro', 'As senhas não coincidem');
      return;
    }

    // Converte DD/MM/AAAA → AAAA-MM-DD para envio ao back-end
    let dataNascimentoISO = null;
    if (dataNascimento) {
      const [dia, mes, ano] = dataNascimento.split('/');
      dataNascimentoISO = `${ano}-${mes}-${dia}`;
    }

    const dadosUsuario = {
      nome: nome.trim(),
      email: email.trim().toLowerCase(),
      senha,
      telefone: telefone.replace(/\D/g, '') || null,
      dataNascimento: dataNascimentoISO,
    };

    setLoading(true);
    try {
      await api.post('/auth/cadastro', dadosUsuario);
      Alert.alert('Conta criada!', 'Seu cadastro foi realizado com sucesso.', [
        { text: 'Entrar', onPress: () => navigation.replace('Login') },
      ]);
    } catch (error) {
      console.error(error);
      const mensagem =
        error.response?.data?.message || 'Não foi possível criar a conta.';
      Alert.alert('Erro no cadastro', mensagem);
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
        <Text style={styles.titulo}>Criar conta</Text>
        <Text style={styles.subtitulo}>Preencha os dados para se cadastrar</Text>
      </View>

      <Text style={styles.label}>Nome completo *</Text>
      <TextInput
        style={styles.input}
        value={nome}
        onChangeText={setNome}
        placeholder="Seu nome completo"
        autoCapitalize="words"
      />

      <Text style={styles.label}>E-mail *</Text>
      <TextInput
        style={styles.input}
        value={email}
        onChangeText={setEmail}
        placeholder="seuemail@exemplo.com"
        keyboardType="email-address"
        autoCapitalize="none"
        autoCorrect={false}
      />

      <Text style={styles.label}>Telefone</Text>
      <TextInput
        style={styles.input}
        value={telefone}
        onChangeText={(v) => setTelefone(formatarTelefone(v))}
        placeholder="(11) 91234-5678"
        keyboardType="phone-pad"
      />

      <Text style={styles.label}>Data de nascimento</Text>
      <TextInput
        style={styles.input}
        value={dataNascimento}
        onChangeText={(v) => setDataNascimento(formatarData(v))}
        placeholder="DD/MM/AAAA"
        keyboardType="numeric"
      />

      <Text style={styles.label}>Senha *</Text>
      <View style={styles.inputSenhaContainer}>
        <TextInput
          style={styles.inputSenha}
          value={senha}
          onChangeText={setSenha}
          placeholder="Mínimo 6 caracteres"
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

      <Text style={styles.label}>Confirmar senha *</Text>
      <TextInput
        style={styles.input}
        value={confirmarSenha}
        onChangeText={setConfirmarSenha}
        placeholder="Repita a senha"
        secureTextEntry={!senhaVisivel}
        autoCapitalize="none"
      />

      <TouchableOpacity
        style={styles.botaoPrincipal}
        onPress={handleCadastro}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.botaoPrincipalTexto}>Criar conta</Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.linkVoltar}
        onPress={() => navigation.navigate('Login')}
      >
        <Text style={styles.linkVoltarTexto}>
          Já tem uma conta?{' '}
          <Text style={styles.linkVoltarDestaque}>Entrar</Text>
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: '#fff',
    padding: 24,
  },
  header: {
    marginTop: 16,
    marginBottom: 28,
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
    marginTop: 32,
    marginBottom: 16,
  },
  botaoPrincipalTexto: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  linkVoltar: {
    alignItems: 'center',
    paddingVertical: 8,
    marginBottom: 24,
  },
  linkVoltarTexto: {
    fontSize: 15,
    color: '#6b7280',
  },
  linkVoltarDestaque: {
    color: '#534AB7',
    fontWeight: '700',
  },
});
