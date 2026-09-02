# 🍴 Giro Culinário

O **Giro Culinário** é uma plataforma web full stack para **explorar e compartilhar receitas de diversas culinárias do mundo** (brasileira, italiana, mediterrânea e oriental).

O projeto une um **frontend** em HTML, CSS e JavaScript puro com um **backend** em Node.js e Express, oferecendo:

- **Login e cadastro** de usuários com senhas criptografadas
- **Receitas armazenadas no banco de dados** (ingredientes, modo de preparo e mídia), servidas por uma página única e dinâmica
- **Favoritar receitas** e visualizá-las no perfil
- **Comentar e avaliar receitas** com estrelas
- **Busca dinâmica** por nome de receita
- **Banco de dados relacional** com CRUD de usuários, comentários, favoritos e receitas

---

## Tecnologias utilizadas

- **Frontend:** HTML5, CSS3, JavaScript (DOM, Fetch API)
- **Backend:** Node.js, Express
- **Banco de dados:** SQLite (dev) / Postgres (produção) via Sequelize (ORM)
- **Autenticação:** bcryptjs (hash de senha) + express-session (sessões persistidas no banco via connect-session-sequelize)
- **Mídia:** imagens e vídeos servidos via CDN (ImageKit)

---

## Arquitetura de receitas

Diferente de uma página HTML fixa por receita, o Giro Culinário guarda cada receita como um registro no banco (tabela `Receitas`, com ingredientes e modo de preparo em formato estruturado) e usa **uma única página dinâmica** (`TodasReceitas/receita.html`) que busca o conteúdo pela API conforme o `id` na URL (`/receita/:id`). O mesmo vale para as listagens (Home, categorias, Explorar): são grids que buscam os dados da API, não cards escritos à mão.

Isso significa que adicionar uma receita nova não exige escrever HTML — só um novo registro na tabela `Receitas`.

---

## Como rodar o projeto localmente

### Pré-requisitos
- [Node.js](https://nodejs.org/) 18 ou superior instalado

### 1. Clonar o repositório
```bash
git clone https://github.com/Ahnnyh/Giro-Culinario.git
cd Giro-Culinario
```

### 2. Instalar as dependências
```bash
npm install
```

### 3. Configurar as variáveis de ambiente
```bash
cp .env.example .env
```
No mínimo, defina um `SESSION_SECRET` próprio no `.env`.

### 4. Popular o banco com as receitas
```bash
node scripts/seed-receitas.js
```
Isso lê `scripts/receitas-seed.json` (já gerado) e cria as 20 receitas no banco.

### 5. Rodar o servidor
```bash
npm start
```
O servidor sobe em `http://localhost:3000` (ou na porta definida em `PORT`).

### 6. Acessar a aplicação
- `http://localhost:3000/login` — tela de login
- `http://localhost:3000/cadastro` — criar uma conta
- `http://localhost:3000/TodasReceitas/Home.html` — página inicial

---

## Estrutura do projeto

```
Giro-Culinario/
├── Backend/
│   ├── config/           # Configuração do banco de dados (SQLite/Postgres)
│   ├── controllers/
│   ├── models/           # User, Comentario, Favorito, Receita
│   ├── routes/
│   └── server.js
├── scripts/              # Ferramentas de migração (extração e seed de receitas, imagens para CDN)
├── Javascript/
├── PaginaCulinarias/     # Páginas por tipo de culinária (grid dinâmico)
├── TodasReceitas/        # Home, perfil, e a página dinâmica de receita
├── Login e CadastroLogin/
├── css/
└── IMG/                  # Imagens locais (em migração para CDN — veja scripts/)
```

---

## Funcionalidades

- Sistema de autenticação com bcrypt e sessões persistidas em banco
- Receitas dinâmicas: uma página, dados vindos do banco
- Favoritos vinculados ao usuário logado
- CRUD de comentários com nota (estrelas), vinculado a usuário e receita
- Busca em tempo real de receitas por nome
- Layout responsivo (grid, flexbox e media queries)
- Integração frontend ↔ backend via API REST

---

## Deploy em produção

Localmente o projeto usa SQLite (arquivo único, zero configuração). Em produção, a aplicação detecta automaticamente a variável de ambiente `DATABASE_URL` e passa a usar **Postgres** — necessário porque a maioria dos serviços de hospedagem gratuitos usa disco temporário, e um banco em arquivo (SQLite) seria apagado a cada deploy.

Passos para colocar no ar (exemplo com [Render](https://render.com)):

1. Crie um banco Postgres gratuito (Render, [Supabase](https://supabase.com) ou [Neon](https://neon.tech)) e copie a Connection String.
2. Crie um **Web Service** no Render apontando para este repositório.
   - Build Command: `npm install`
   - Start Command: `npm start`
3. Defina as variáveis de ambiente no painel do serviço:
   - `DATABASE_URL` → a connection string do passo 1
   - `SESSION_SECRET` → um valor aleatório e secreto
   - `NODE_ENV` → `production`
4. Deploy. Na primeira subida, rode `node scripts/seed-receitas.js` (via shell do próprio serviço, ou como um "Job" do Render) para popular a tabela de receitas.

Nenhuma URL precisa ser trocada no código: o frontend já usa caminhos relativos e o backend decide o banco com base no ambiente.

---

## Scripts de migração

Ferramentas de uso pontual, usadas para migrar o projeto de páginas estáticas para o formato atual:

- `scripts/extract-recipes-from-html.js` — extrai ingredientes/preparo das antigas páginas HTML (já usado; mantido como referência)
- `scripts/seed-receitas.js` — popula a tabela `Receitas` a partir de `scripts/receitas-seed.json`
- `scripts/migrate-images-to-imagekit.js` — envia as imagens locais para o ImageKit (CDN)
- `scripts/replace-image-links.js` — substitui as referências locais de imagem pelas URLs do CDN em todo o projeto (incluindo `receitas-seed.json`)

---

## Roadmap / melhorias planejadas

- [ ] Concluir a migração das imagens e vídeos para o CDN e remover a pasta `IMG/` do repositório
- [ ] Limpar o histórico do Git (banco SQLite e mídias antigas já commitados)
- [ ] Tela de administração para cadastrar receitas direto pela interface
- [ ] Adicionar rate limiting nas rotas de login
- [ ] Adicionar favicon e tags Open Graph para compartilhamento em redes sociais

---

## Autora

**Ana Clara Souza Santos**
[github.com/Ahnnyh](https://github.com/Ahnnyh)
