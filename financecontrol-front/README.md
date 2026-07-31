# Finance Control MPT

Sistema web para controle financeiro pessoal, desenvolvido em **React + Vite**, com integração a uma API REST desenvolvida em **Java**.

## Objetivo

O projeto tem como objetivo fornecer uma plataforma para gerenciamento financeiro, permitindo o controle de receitas, despesas, contas, metas financeiras e investimentos, oferecendo uma interface moderna, intuitiva e responsiva.

## Tecnologias

- React
- Vite
- JavaScript
- React Router DOM
- Axios
- Hugeicons
- CSS3

## Instalação

### 1. Clone o repositório

```bash
git clone <url-do-repositorio>
```

### 2. Acesse a pasta

```bash
cd financecontrol-front
```

### 3. Instale as dependências

```bash
npm install
```

### 4. Execute o projeto

```bash
npm run dev
```

A aplicação estará disponível em:

```
http://localhost:5173
```

## Bibliotecas utilizadas

### React Router DOM

Responsável pelo gerenciamento das rotas da aplicação.

Instalação:

```bash
npm install react-router-dom
```

Exemplo:

```jsx
import { BrowserRouter, Routes, Route } from "react-router-dom";

<BrowserRouter>
  <Routes>
    <Route path="/" element={<Home />} />
  </Routes>
</BrowserRouter>;
```

### Axios

Responsável pela comunicação com a API Java.

Instalação:

```bash
npm install axios
```

Exemplo:

```javascript
import api from "./services/api";

api.get("/usuarios");
```

### Hugeicons

Biblioteca de ícones utilizada na interface.

Instalação:

```bash
npm install @hugeicons/react
npm install @hugeicons/core-free-icons
```

Exemplo:

```jsx
import { HugeiconsIcon, SaveMoneyDollarIcon } from "../assets/icons";

<HugeiconsIcon icon={SaveMoneyDollarIcon} size={32} color="var(--primary)" />;
```

## Estrutura do Projeto

```
financecontrol-front
│
├── public/
│
├── src/
│   │
│   ├── assets/
│   │   ├── fonts/
│   │   ├── icons/
│   │   │   └── index.jsx
│   │   └── images/
│   │
│   ├── components/
│   │   ├── common/
│   │   └── layout/
│   │
│   ├── constants/
│   ├── contexts/
│   ├── hooks/
│   ├── layouts/
│   ├── pages/
│   ├── routes/
│   ├── services/
│   ├── styles/
│   ├── utils/
│   │
│   ├── App.jsx
│   └── main.jsx
│
├── package.json
└── vite.config.js
```

## Organização das Pastas

### assets/

Armazena arquivos estáticos utilizados pela aplicação.

- **fonts/** → Fontes locais (caso utilizadas futuramente).
- **icons/** → Centraliza a exportação dos ícones da biblioteca Hugeicons.
- **images/** → Imagens, ilustrações e logos.

### components/

Componentes reutilizáveis da aplicação.

#### common/

Componentes genéricos.

Exemplos:

- Button
- Input
- Card
- Modal
- Loading

#### layout/

Componentes responsáveis pela estrutura da aplicação.

Exemplos:

- Header
- Sidebar
- Navbar
- Footer

### constants/

Constantes reutilizadas pela aplicação.

Exemplos:

- Rotas
- Menus
- Configurações
- Chaves de armazenamento

### contexts/

Contexts da aplicação utilizando a Context API.

Exemplos:

- Autenticação
- Tema (Light/Dark)
- Usuário

### hooks/

Custom Hooks.

Exemplos:

- useAuth()
- useTheme()
- useFetch()

### layouts/

Layouts compartilhados entre páginas.

Exemplos:

- MainLayout
- AuthLayout

### pages/

Páginas da aplicação.

Exemplos:

```
pages/

Home/

Login/

Dashboard/

Contas/

Receitas/

Despesas/

Metas/

Configuracoes/
```

### routes/

Configuração das rotas.

Exemplo:

```jsx
<Route path="/" element={<Home />} />
```

### services/

Responsável pela comunicação com a API.

Exemplo:

```
services/

api.js

authService.js

usuarioService.js
```

### styles/

Arquivos globais de estilo.

#### reset.css

Remove estilos padrões dos navegadores.

#### variables.css

Contém tokens reutilizáveis.

Exemplo:

```css
--font-primary
--radius-md
--space-4
--shadow-card
```

#### themes.css

Define as cores do tema Light e Dark.

Exemplo:

```css
--bg-primary
--primary
--text-primary
```

#### globals.css

Define estilos globais da aplicação.

Exemplo:

- Fonte padrão
- Background
- Cor do texto
- Estilos do body

### utils/

Funções utilitárias reutilizáveis.

Exemplos:

- Formatação de moeda
- Datas
- Validações

## Temas

O projeto possui suporte para:

- Light Mode
- Dark Mode

As cores são controladas por variáveis CSS, facilitando a manutenção e a implementação de novos temas.

## Convenções

- Utilizar componentes reutilizáveis sempre que possível.
- Evitar duplicação de código.
- Centralizar chamadas HTTP na pasta `services`.
- Centralizar ícones em `assets/icons/index.jsx`.
- Utilizar variáveis CSS para cores, espaçamentos e tipografia.
- Manter a organização das pastas conforme este documento.

## Equipe

Projeto desenvolvido como atividade do curso **+praTI**, com foco na aplicação de boas práticas de desenvolvimento Front-end utilizando React.
