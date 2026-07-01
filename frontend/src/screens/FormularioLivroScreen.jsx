import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  Image,
} from 'react-native';
import { Picker } from '@react-native-picker/picker'; // será instalado
import api from '../services/api';

// Instalar: npx expo install @react-native-picker/picker

const statusList = [
  { label: 'Lendo', value: 'LENDO' },
  { label: 'Lido', value: 'LIDO' },
  { label: 'Quero ler', value: 'QUERO_LER' },
];

export default function FormularioLivroScreen({ route, navigation }) {
  const livroEdicao = route.params?.livro || null;
  const livroPreenchido = route.params?.livroPreenchido || null;
  const isEdit = !!livroEdicao;

  const [titulo, setTitulo] = useState('');
  const [autor, setAutor] = useState('');
  const [ano, setAno] = useState('');
  const [genero, setGenero] = useState('');
  const [isbn, setIsbn] = useState('');
  const [capaUrl, setCapaUrl] = useState('');
  const [status, setStatus] = useState('LENDO');
  const [nota, setNota] = useState('');
  const [comentario, setComentario] = useState('');
  const [loading, setLoading] = useState(false);
  

  useEffect(() => {
    if (livroEdicao) {
      setTitulo(livroEdicao.titulo || '');
      setAutor(livroEdicao.autor || '');
      setAno(livroEdicao.ano ? String(livroEdicao.ano) : '');
      setGenero(livroEdicao.genero || '');
      setIsbn(livroEdicao.isbn || '');
      setCapaUrl(livroEdicao.capaUrl || '');
      setStatus(livroEdicao.status || 'LENDO');
      setNota(livroEdicao.nota ? String(livroEdicao.nota) : '');
      setComentario(livroEdicao.comentario || '');
    } else if (livroPreenchido) {
      // Veio da tela "Buscar ISBN": pré-preenche, mas continua sendo um
      // livro novo (POST), não uma edição.
      setTitulo(livroPreenchido.titulo || '');
      setAutor(livroPreenchido.autor || '');
      setAno(livroPreenchido.ano ? String(livroPreenchido.ano) : '');
      setGenero(livroPreenchido.genero || '');
      setIsbn(livroPreenchido.isbn || '');
      setCapaUrl(livroPreenchido.capaUrl || '');
    }
  }, [livroEdicao, livroPreenchido]);


  const handleSalvar = async () => {
    if (!titulo.trim()) {
      Alert.alert('Erro', 'Título é obrigatório');
      return;
    }
    if (!autor.trim()) {
      Alert.alert('Erro', 'Autor é obrigatório');
      return;
    }
    const anoNum = parseInt(ano, 10);
    if (ano && (isNaN(anoNum) || anoNum < 1900 || anoNum > new Date().getFullYear())) {
      Alert.alert('Erro', 'Ano inválido (1900-ano atual)');
      return;
    }
    let notaNum = null;
    if (nota) {
      notaNum = parseInt(nota, 10);
      if (isNaN(notaNum) || notaNum < 1 || notaNum > 5) {
        Alert.alert('Erro', 'Nota deve ser um número entre 1 e 5');
        return;
      }
    }

    const livroData = {
      titulo: titulo.trim(),
      autor: autor.trim(),
      ano: anoNum || null,
      genero: genero.trim() || null,
      isbn: isbn.trim() || null,
      capaUrl: capaUrl.trim() || null,
      status,
      nota: notaNum,
      comentario: comentario.trim() || null,
    };

    setLoading(true);
    try {
      if (isEdit) {
        await api.put(`/livros/${livroEdicao.id}`, livroData);
        Alert.alert('Sucesso', 'Livro atualizado!');
      } else {
        await api.post('/livros', livroData);
        Alert.alert('Sucesso', 'Livro adicionado!');
      }
      navigation.goBack();
    } catch (error) {
      console.error(error);
      Alert.alert('Erro', 'Não foi possível salvar o livro.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      {capaUrl ? (
        <Image source={{ uri: capaUrl }} style={styles.capaPreview} resizeMode="contain" />
      ) : null}

      <Text style={styles.label}>ISBN</Text>
      <TextInput
        style={styles.input}
        value={isbn}
        onChangeText={setIsbn}
        keyboardType="numeric"
        placeholder="978..."
      />

      <Text style={styles.label}>Título *</Text>
      <TextInput style={styles.input} value={titulo} onChangeText={setTitulo} placeholder="Ex: Dom Casmurro" />

      <Text style={styles.label}>Autor *</Text>
      <TextInput style={styles.input} value={autor} onChangeText={setAutor} placeholder="Machado de Assis" />

      <Text style={styles.label}>Ano</Text>
      <TextInput style={styles.input} value={ano} onChangeText={setAno} keyboardType="numeric" placeholder="1899" />

      <Text style={styles.label}>Gênero</Text>
      <TextInput style={styles.input} value={genero} onChangeText={setGenero} placeholder="Romance" />

      <Text style={styles.label}>Status</Text>
      <Picker selectedValue={status} onValueChange={(itemValue) => setStatus(itemValue)} style={styles.picker}>
        {statusList.map((s) => (
          <Picker.Item key={s.value} label={s.label} value={s.value} />
        ))}
      </Picker>

      <Text style={styles.label}>Nota (1 a 5)</Text>
      <TextInput style={styles.input} value={nota} onChangeText={setNota} keyboardType="numeric" placeholder="5" />

      <Text style={styles.label}>Comentário</Text>
      <TextInput style={[styles.input, styles.textArea]} value={comentario} onChangeText={setComentario} multiline numberOfLines={4} placeholder="Minhas impressões..." />

      <TouchableOpacity style={styles.botaoSalvar} onPress={handleSalvar} disabled={loading}>
        <Text style={styles.botaoTexto}>{loading ? 'Salvando...' : 'Salvar'}</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', padding: 20 },
  capaPreview: { width: 100, height: 150, alignSelf: 'center', marginBottom: 16, borderRadius: 6, backgroundColor: '#eee' },
  label: { fontSize: 16, fontWeight: '600', color: '#534AB7', marginTop: 12, marginBottom: 4 },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 10,
    fontSize: 16,
    backgroundColor: '#f9f9f9',
  },
  picker: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    marginVertical: 4,
    backgroundColor: '#f9f9f9',
  },
  textArea: { height: 100, textAlignVertical: 'top' },
  botaoSalvar: {
    backgroundColor: '#534AB7',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginVertical: 24,
  },
  botaoTexto: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
});