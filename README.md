# 📚 BookTrack
 
Aplicativo mobile para controle de leitura, desenvolvido como projeto integrador do curso de Desenvolvimento de Software da SENAC RIO. Permite ao usuário cadastrar, organizar e acompanhar os livros que está lendo, já leu ou pretende ler, com busca automática de dados via ISBN.
 
## ✨ Funcionalidades
 
- **Autenticação de usuários** com login, cadastro e sessão via JWT
- **CRUD completo de livros**: adicionar, editar, visualizar detalhes e excluir
- **Organização por status**: Lendo, Lido e Quero Ler, com filtro na lista principal
- **Avaliação por estrelas** (1 a 5) e campo de comentários pessoais sobre cada livro
- **Busca de livros por ISBN ou título**, com preenchimento automático de título, autor, ano, gênero e capa a partir de uma API externa de catálogo de livros
- **Adição direta pela busca**: ao encontrar um livro pesquisado, é possível adicioná-lo aos seus registros com um toque, sem digitar os dados manualmente
- **Capa do livro em miniatura** na lista principal e em destaque na tela de detalhes
## 🛠️ Tecnologias
 
**Backend**
- Java 17 + Spring Boot
- Spring Data JPA / Hibernate
- MySQL
- Spring Security + JWT (autenticação stateless)
- Integração com API externa de busca de livros (Open Library)
**Frontend**
- React Native (JavaScript) com Expo
- React Navigation (Stack Navigator)
- Axios para consumo da API
- AsyncStorage para persistência do token de sessão
## 📁 Estrutura do repositório
 
```
projeto-integrador-book/
├── backend/     # API REST em Spring Boot
└── frontend/    # Aplicativo mobile em React Native (Expo)
```
 
Cada pasta é independente e possui suas próprias dependências e instruções de execução.
 
## 🚀 Como rodar o projeto
 
### Backend
 
1. Configure um banco MySQL local e crie o banco de dados usado pela aplicação
2. Ajuste as credenciais em `backend/src/main/resources/application.properties`
3. Na pasta `backend`, execute:
```bash
   mvn spring-boot:run
```
4. A API sobe por padrão em `http://localhost:8081`
### Frontend
 
1. Na pasta `frontend`, instale as dependências:
```bash
   npm install
```
2. Inicie o projeto com Expo:
```bash
   npx expo start
```
3. Abra no emulador Android/iOS ou no aplicativo Expo Go
> **Observação:** para rodar em emulador Android com o backend na mesma máquina, o app já está configurado para acessar `http://10.0.2.2:8081` (endereço que o emulador usa para se referir ao `localhost` do computador host).
 
## 🎓 Contexto acadêmico
 
Projeto desenvolvido para a disciplina de Projeto Integrador do curso de Desenvolvimento de Software da SENAC RIO, com o objetivo de aplicar, em um único produto, conceitos de desenvolvimento mobile, backend, modelagem de dados e integração com APIs externas.
 
