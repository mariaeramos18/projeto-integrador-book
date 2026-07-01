import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  RefreshControl,
  Image,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../services/api';

const statusOptions = ['TODOS', 'LENDO', 'LIDO', 'QUERO_LER'];

const statusColors = {
  LENDO: { bg: '#E6F1FB', text: '#185FA5' },
  LIDO: { bg: '#EAF3DE', text: '#3B6D11' },
  QUERO_LER: { bg: '#FAEEDA', text: '#854F0B' },
};

const renderEstrelas = (nota) => {
  if (!nota) return null;
  return (
    <View style={{ flexDirection: 'row' }}>
      {[1, 2, 3, 4, 5].map((posicao) => (
        <Text key={posicao} style={{ fontSize: 14, color: '#f59e0b' }}>
          {posicao <= nota ? '★' : '☆'}
        </Text>
      ))}
    </View>
  );
};

export default function ListaLivrosScreen({ navigation }) {
  const [livros, setLivros] = useState([]);
  const [filtro, setFiltro] = useState('TODOS');
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const handleLogout = () => {
    Alert.alert('Sair', 'Deseja sair da sua conta?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Sair',
        style: 'destructive',
        onPress: async () => {
          await AsyncStorage.removeItem('token');
          navigation.replace('Login');
        },
      },
    ]);
  };

  // Adiciona botão de logout no header
  React.useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <TouchableOpacity onPress={handleLogout} style={{ marginRight: 16 }}>
          <Text style={{ color: '#fff', fontSize: 14, fontWeight: '600' }}>Sair</Text>
        </TouchableOpacity>
      ),
    });
  }, [navigation]);

    React.useLayoutEffect(() => {
      navigation.setOptions({
        headerRight: () => (
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <TouchableOpacity
              onPress={() => navigation.navigate('BuscarIsbn')}
              style={{ marginRight: 16 }}
            >
              <Text style={{ color: '#fff', fontSize: 14, fontWeight: '600' }}>Buscar ISBN</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={handleLogout} style={{ marginRight: 16 }}>
              <Text style={{ color: '#fff', fontSize: 14, fontWeight: '600' }}>Sair</Text>
            </TouchableOpacity>
          </View>
        ),
      });
    }, [navigation]);


  const carregarLivros = async () => {
    setLoading(true);
    try {
      let url = '/livros';
      if (filtro !== 'TODOS') {
        url += `?status=${filtro}`;
      }
      const response = await api.get(url);
      setLivros(response.data);
    } catch (error) {
      console.error(error);
      Alert.alert('Erro', 'Não foi possível carregar os livros.');
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      carregarLivros();
    }, [filtro])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await carregarLivros();
    setRefreshing(false);
  };

  const renderItem = ({ item }) => {
    const cor = statusColors[item.status] || { bg: '#ddd', text: '#000' };
    return (
      <TouchableOpacity
        style={[styles.card, { backgroundColor: cor.bg }]}
        onPress={() => navigation.navigate('DetalhesLivro', { livro: item })}
      >
        {item.capaUrl ? (
          <Image source={{ uri: item.capaUrl }} style={styles.capaMini} resizeMode="cover" />
        ) : (
          <View style={[styles.capaMini, styles.capaMiniPlaceholder]}>
            <Text style={styles.capaMiniPlaceholderTexto}>Sem{'\n'}capa</Text>
          </View>
        )}
        <View style={styles.infoContainer}>
          <Text style={styles.titulo}>{item.titulo}</Text>
          <Text style={styles.autor}>{item.autor}</Text>
          <View style={styles.statusBadge}>
            <Text style={[styles.statusText, { color: cor.text }]}>
              {item.status === 'QUERO_LER' ? 'QUERO LER' : item.status}
            </Text>
          </View>
          {renderEstrelas(item.nota)}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.filtroContainer}>
        {statusOptions.map((opcao) => (
          <TouchableOpacity
            key={opcao}
            style={[styles.filtroBotao, filtro === opcao && styles.filtroAtivo]}
            onPress={() => setFiltro(opcao)}
          >
            <Text style={[styles.filtroTexto, filtro === opcao && styles.filtroTextoAtivo]}>
              {opcao === 'QUERO_LER' ? 'QUERO LER' : opcao}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {loading && !refreshing ? (
        <ActivityIndicator size="large" color="#534AB7" style={{ marginTop: 50 }} />
      ) : (
        <FlatList
          data={livros}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderItem}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          ListEmptyComponent={<Text style={styles.vazio}>Nenhum livro encontrado.</Text>}
        />
      )}

      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate('FormularioLivro', { livro: null })}
      >
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  filtroContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderColor: '#eee',
  },
  filtroBotao: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: '#e0e0e0',
  },
  filtroAtivo: {
    backgroundColor: '#534AB7',
  },
  filtroTexto: {
    color: '#333',
    fontWeight: '500',
  },
  filtroTextoAtivo: {
    color: '#fff',
  },
  card: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginTop: 12,
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  capaMini: {
    width: 50,
    height: 74,
    borderRadius: 4,
    backgroundColor: '#eee',
  },
  capaMiniPlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  capaMiniPlaceholderTexto: {
    fontSize: 9,
    color: '#999',
    textAlign: 'center',
  },
  infoContainer: {
    flex: 1,
    marginLeft: 12,
    justifyContent: 'center',
  },
  titulo: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  autor: {
    fontSize: 14,
    color: '#4b5563',
    marginTop: 4,
  },
  statusBadge: {
    marginTop: 8,
    alignSelf: 'flex-start',
  },
  statusText: {
    fontWeight: '600',
    fontSize: 12,
  },
  vazio: {
    textAlign: 'center',
    marginTop: 50,
    fontSize: 16,
    color: '#888',
  },
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#534AB7',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 6,
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  fabText: {
    fontSize: 32,
    color: '#fff',
    fontWeight: 'bold',
    lineHeight: 40,
  },
});