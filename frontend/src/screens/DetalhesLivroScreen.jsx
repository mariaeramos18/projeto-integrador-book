import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, Image } from 'react-native';
import api from '../services/api';

const renderEstrelas = (nota) => {
  if (!nota) return null;
  return (
    <View style={{ flexDirection: 'row', marginVertical: 8 }}>
      {[1, 2, 3, 4, 5].map((posicao) => (
        <Text key={posicao} style={{ fontSize: 22, color: '#f59e0b' }}>
          {posicao <= nota ? '★' : '☆'}
        </Text>
      ))}
    </View>
  );
};

export default function DetalhesLivroScreen({ route, navigation }) {
  const { livro } = route.params;

  const handleExcluir = () => {
    Alert.alert('Confirmar', 'Tem certeza que deseja excluir este livro?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Excluir',
        style: 'destructive',
        onPress: async () => {
          try {
            await api.delete(`/livros/${livro.id}`);
            Alert.alert('Sucesso', 'Livro excluído!');
            navigation.goBack(); // volta para lista
          } catch (error) {
            Alert.alert('Erro', 'Não foi possível excluir.');
          }
        },
      },
    ]);
  };

  const statusExibicao = livro.status === 'QUERO_LER' ? 'QUERO LER' : livro.status;
  const corStatus = {
    LENDO: '#185FA5',
    LIDO: '#3B6D11',
    QUERO_LER: '#854F0B',
  }[livro.status] || '#000';

  return (
    <View style={styles.container}>
      {livro.capaUrl ? (
        <Image source={{ uri: livro.capaUrl }} style={styles.capa} resizeMode="contain" />
      ) : null}
      <Text style={styles.titulo}>{livro.titulo}</Text>
      <Text style={styles.autor}>Por {livro.autor}</Text>
      {livro.ano && <Text style={styles.detalhe}>📅 Ano: {livro.ano}</Text>}
      {livro.genero && <Text style={styles.detalhe}>📚 Gênero: {livro.genero}</Text>}
      <View style={[styles.statusContainer, { backgroundColor: corStatus + '20' }]}>
        <Text style={[styles.statusTexto, { color: corStatus }]}>{statusExibicao}</Text>
      </View>
      {livro.nota && renderEstrelas(livro.nota)}
      {livro.comentario && <Text style={styles.comentario}>✏️ {livro.comentario}</Text>}
      <Text style={styles.criadoEm}>Adicionado em: {new Date(livro.criadoEm).toLocaleDateString()}</Text>

      <View style={styles.botoesContainer}>
        <TouchableOpacity
          style={[styles.botao, styles.botaoEditar]}
          onPress={() => navigation.navigate('FormularioLivro', { livro })}
        >
          <Text style={styles.botaoTexto}>Editar</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.botao, styles.botaoExcluir]}
          onPress={handleExcluir}
        >
          <Text style={styles.botaoTexto}>Excluir</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', padding: 20 },
  capa: { width: 120, height: 180, alignSelf: 'center', marginBottom: 16, borderRadius: 6, backgroundColor: '#eee' },
  titulo: { fontSize: 26, fontWeight: 'bold', color: '#1f2937', marginBottom: 8 },
  autor: { fontSize: 18, color: '#4b5563', marginBottom: 16 },
  detalhe: { fontSize: 16, marginVertical: 4, color: '#374151' },
  statusContainer: { alignSelf: 'flex-start', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, marginVertical: 12 },
  statusTexto: { fontWeight: 'bold', fontSize: 14 },
  comentario: { fontSize: 16, fontStyle: 'italic', backgroundColor: '#f3f4f6', padding: 12, borderRadius: 12, marginVertical: 12 },
  criadoEm: { fontSize: 12, color: '#9ca3af', marginTop: 20 },
  botoesContainer: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 30 },
  botao: { flex: 1, paddingVertical: 12, borderRadius: 8, alignItems: 'center', marginHorizontal: 6 },
  botaoEditar: { backgroundColor: '#534AB7' },
  botaoExcluir: { backgroundColor: '#dc2626' },
  botaoTexto: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
});