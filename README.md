# 🍴 Giro Culinário



O **Giro Culinário** é um projeto web criado para **explorar e compartilhar receitas de diversas culinárias do mundo**.  
Ele une **frontend moderno** com **backend robusto**, oferecendo funcionalidades completas como:  

- **Login e Cadastro** com segurança  
- **Favoritar receitas** e visualizar no perfil  
- **Comentar e avaliar receitas** em tempo real  
- **Busca dinâmica** por nome ou categoria  
- **Banco relacional** com CRUD de usuários, comentários e favoritos  

Projeto ideal para estudos e prática em **desenvolvimento web fullstack**, integrando APIs REST, banco de dados e manipulação de DOM.

---

## Como rodar o projeto

### 1. Clonar o repositório

git clone https://github.com/Ahnnyh/Giro-Culinario
cd giro-culinario 

### 2. Instalar dependências

Na raiz do projeto (onde está o package.json):

npm install

### Principais dependências

express → servidor backend

sequelize → ORM para banco relacional

sqlite3 → banco de dados leve

bcryptjs → criptografia de senha

cors → comunicação frontend ↔ backend

express-session → gerenciamento de sessão

### 3. Rodar o backend
cd Backend-receitas
node server.js


Servidor disponível em:
👉 http://localhost:3000

### 4. Rodar o frontend

Basta abrir o arquivo:

TodasReceitas/Home.html


no navegador.
(O frontend se conecta ao backend via fetch API).

### 📂 Estrutura do Projeto
Giro Culinario/
├── Backend-receitas/         # Servidor, banco e rotas da API
│   ├── controllers/          # Lógica (login, comentários, favoritos)
│   ├── models/               # Sequelize models (User, Comentario, Favorito)
│   ├── routes/               # Rotas da API REST
│   ├── server.js             # Inicializa o servidor
│   └── database.sqlite       # Banco de dados local
│
├── css/                      # Estilos (style.css)
├── IMG/                      # Imagens do site
├── Javascript/               # Scripts JS do frontend
│   ├── header.js             # Menu login/logout
│   ├── main.js               # Menu mobile
│   ├── pesquisa.js           # Busca dinâmica
│   ├── receitas.js           # Lógica de receitas
│   ├── script.js             # Comentários e avaliações
│   └── video.js              # Banner de vídeo
│
├── Login e CadastroLogin/    # Telas de login, cadastro, termos
├── TodasReceitas/            # Páginas HTML de receitas e perfil
├── PaginaCulinarias/         # Páginas de categorias por culinária
├── package.json              # Dependências do Node.js

### Funcionalidades

Sistema de autenticação com bcrypt e sessões

Favoritos vinculados ao usuário

CRUD de comentários com vínculo ao usuário e receita

Busca em tempo real de receitas

Layout responsivo com grid, flexbox e media queries

Integração frontend ↔ backend via API REST

### Layout

 **Home Page:** banner em vídeo, categorias e receitas em destaque

 **Perfil:** dados do usuário, favoritos e comentários

 **Receitas:** ingredientes, preparo, comentários e avaliações

 ### Tecnologias Utilizadas

**Frontend:** HTML5, CSS3, JavaScript (DOM, fetch API)

**Backend:** Node.js, Express, Sequelize, SQLite

**Segurança:** bcryptjs, express-session

**Comunicação:** APIs REST




