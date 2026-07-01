import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { StatusBar } from 'expo-status-bar';
import ListaLivrosScreen from './src/screens/ListaLivrosScreen';
import FormularioLivroScreen from './src/screens/FormularioLivroScreen';
import DetalhesLivroScreen from './src/screens/DetalhesLivroScreen';
import LoginScreen from './src/screens/LoginScreen';
import CadastroScreen from './src/screens/CadastroScreen';
import BuscarIsbnScreen from './src/screens/BuscarIsbnScreen';

const Stack = createStackNavigator();

export default function App() {
  return (
    <>
      <NavigationContainer>
        <Stack.Navigator
          initialRouteName="Login"
          screenOptions={{
            headerStyle: { backgroundColor: '#534AB7' },
            headerTintColor: '#fff',
            headerTitleStyle: { fontWeight: 'bold' },
          }}
        >
          {/* Autenticação — sem header */}
          <Stack.Screen
            name="Login"
            component={LoginScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="Cadastro"
            component={CadastroScreen}
            options={{ headerShown: false }}
          />

          {/* App principal */}
          <Stack.Screen
            name="ListaLivros"
            component={ListaLivrosScreen}
            options={{ title: 'BookTrack - Meus Livros' }}
          />
          <Stack.Screen
            name="FormularioLivro"
            component={FormularioLivroScreen}
            options={({ route }) => ({
              title: route.params?.livro ? 'Editar Livro' : 'Novo Livro',
            })}
          />
          <Stack.Screen
            name="DetalhesLivro"
            component={DetalhesLivroScreen}
            options={{ title: 'Detalhes do Livro' }}
          />
          <Stack.Screen
          name="BuscarIsbn"
          component={BuscarIsbnScreen}
          options={{ title: 'Buscar ISBN' }}
          />

        </Stack.Navigator>
      </NavigationContainer>
      <StatusBar style="light" />
    </>
  );
}
