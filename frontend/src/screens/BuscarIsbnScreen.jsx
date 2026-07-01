import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  Image,
  ActivityIndicator,
  Alert,
} from 'react-native';
import * as Clipboard from 'expo-clipboard';
import api from '../services/api';
 
export default function BuscarIsbnScreen({ navigation }) {
  const [titulo, setTitulo] = useState('');
  const [resultados, setResultados] = useState([]);
  const [loading, setLoading] = useState(false);
  const [buscou, setBuscou] = useState(false);
 
  const handleBuscar = async () => {
    if (!titulo.trim()) {
      Alert.alert('Erro', 'Digite o nome do livro');
      return;
    }
 
    setLoading(true);
    setBuscou(true);
    try {
      const { data } = await api.get('/livros/buscar-titulo', {
        params: { titulo: titulo.trim() },
      });
      setResultados(data);
    } catch (error) {
      setResultados([]);
      if (error.response?.status === 404) {
        Alert.alert('Não encontrado', 'Nenhum livro com ISBN foi encontrado para esse título.');
      } else {
        console.error(error);
        Alert.alert('Erro', 'Não foi possível buscar o livro.');
      }
    } finally {
      setLoading(false);
    }
  };
 
  const copiarIsbn = async (isbn) => {
    await Clipboard.setStringAsync(isbn);
    Alert.alert('Copiado', `ISBN ${isbn} copiado para a área de transferência.`);
  };

  const adicionarLivro = (item) => {
    navigation.navigate('FormularioLivro', { livroPreenchido: item });
  };
 
  const renderItem = ({ item }) => (
    <View style={styles.card}>
      {item.capaUrl ? (
        <Image source={{ uri: item.capaUrl }} style={styles.capa} resizeMode="contain" />
      ) : (
        <View style={[styles.capa, styles.capaPlaceholder]}>
          <Text style={styles.capaPlaceholderTexto}>Sem capa</Text>
        </View>
      )}
 
      <View style={styles.infoContainer}>
        <Text style={styles.titulo} numberOfLines={2}>{item.titulo}</Text>
        {item.autor ? <Text style={styles.autor} numberOfLines={1}>{item.autor}</Text> : null}
        {item.ano ? <Text style={styles.ano}>{item.ano}</Text> : null}
 
        <TouchableOpacity
          style={styles.isbnBotao}
          onPress={() => copiarIsbn(item.isbn)}
        >
          <Text style={styles.isbnTexto}>ISBN: {item.isbn}</Text>
          <Text style={styles.isbnCopiar}>Toque para copiar</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.adicionarBotao}
          onPress={() => adicionarLivro(item)}
        >
          <Text style={styles.adicionarTexto}>+ Adicionar aos meus livros</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
 
  return (
    <View style={styles.container}>
      <Text style={styles.label}>Nome do livro</Text>
      <View style={styles.linhaBusca}>
        <TextInput
          style={[styles.input, styles.inputBusca]}
          value={titulo}
          onChangeText={setTitulo}
          placeholder="Ex: Dom Casmurro"
          onSubmitEditing={handleBuscar}
          returnKeyType="search"
        />
        <TouchableOpacity style={styles.botaoBuscar} onPress={handleBuscar} disabled={loading}>
          <Text style={styles.botaoTexto}>{loading ? '...' : 'Buscar'}</Text>
        </TouchableOpacity>
      </View>
 
      {loading ? (
        <ActivityIndicator size="large" color="#534AB7" style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={resultados}
          keyExtractor={(item, index) => `${item.isbn}-${index}`}
          renderItem={renderItem}
          contentContainerStyle={{ paddingBottom: 24 }}
          ListEmptyComponent={
            buscou ? (
              <Text style={styles.vazio}>Nenhum resultado encontrado.</Text>
            ) : (
              <Text style={styles.vazio}>Digite o nome de um livro para buscar o ISBN.</Text>
            )
          }
        />
      )}
    </View>
  );
}
 
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', padding: 20 },
  label: { fontSize: 16, fontWeight: '600', color: '#534AB7', marginBottom: 4 },
  linhaBusca: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 16 },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 10,
    fontSize: 16,
    backgroundColor: '#f9f9f9',
  },
  inputBusca: { flex: 1 },
  botaoBuscar: {
    backgroundColor: '#534AB7',
    paddingVertical: 12,
    paddingHorizontal: 18,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  botaoTexto: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  card: {
    flexDirection: 'row',
    backgroundColor: '#f9f9f9',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#eee',
  },
  capa: { width: 60, height: 90, borderRadius: 4, backgroundColor: '#eee' },
  capaPlaceholder: { alignItems: 'center', justifyContent: 'center' },
  capaPlaceholderTexto: { fontSize: 10, color: '#999', textAlign: 'center' },
  infoContainer: { flex: 1, marginLeft: 12, justifyContent: 'center' },
  titulo: { fontSize: 16, fontWeight: 'bold', color: '#1f2937' },
  autor: { fontSize: 14, color: '#4b5563', marginTop: 2 },
  ano: { fontSize: 12, color: '#6b7280', marginTop: 2 },
  isbnBotao: {
    marginTop: 8,
    backgroundColor: '#E6F1FB',
    borderRadius: 6,
    paddingVertical: 6,
    paddingHorizontal: 10,
    alignSelf: 'flex-start',
  },
  isbnTexto: { fontSize: 13, fontWeight: '600', color: '#185FA5' },
  isbnCopiar: { fontSize: 10, color: '#185FA5', marginTop: 2 },
  adicionarBotao: {
    marginTop: 8,
    backgroundColor: '#534AB7',
    borderRadius: 6,
    paddingVertical: 6,
    paddingHorizontal: 10,
    alignSelf: 'flex-start',
  },
  adicionarTexto: { fontSize: 13, fontWeight: '600', color: '#fff' },
  vazio: { textAlign: 'center', marginTop: 50, fontSize: 16, color: '#888' },
});