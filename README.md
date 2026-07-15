# TemQuemFaz - Mobile

Aplicativo mobile em Expo/React Native para buscar prestadores de servicos locais, pesquisar por texto ou voz, visualizar perfis, falar pelo WhatsApp e cadastrar/gerenciar perfil de prestador.

## Tecnologias

- Expo 54
- React Native 0.81
- React 19
- TypeScript
- Expo Router
- expo-location
- expo-audio
- expo-image-picker
- expo-secure-store
- React Native Reanimated
- React Native Gesture Handler
- Inter como fonte principal

## Pre-requisitos

- Node.js
- npm
- Expo CLI via `npx expo`
- Backend do TemQuemFaz rodando
- Celular com Expo Go ou emulador Android/iOS

## Como rodar

### 1. Instale as dependencias

```bash
npm install
```

### 2. Configure a URL da API

O app usa `EXPO_PUBLIC_API_URL` quando a variavel existe. Crie um arquivo `.env.local` na raiz do mobile:

```env
EXPO_PUBLIC_API_URL=http://SEU_IP:8000/api
```

Exemplo em rede local:

```env
EXPO_PUBLIC_API_URL=http://192.168.1.2:8000/api
```

Se estiver usando celular fisico, `127.0.0.1` aponta para o proprio celular, nao para o computador. Use o IP da maquina que esta rodando o backend e inicie o Django com:

```bash
python manage.py runserver 0.0.0.0:8000
```

### 3. Inicie o Expo

```bash
npm start
```

Tambem existem atalhos:

```bash
npm run android
npm run ios
npm run web
```

## Scripts

| Comando | Descricao |
| --- | --- |
| `npm start` | Inicia o Expo. |
| `npm run android` | Abre no Android. |
| `npm run ios` | Abre no iOS. |
| `npm run web` | Abre no navegador. |
| `npm run lint` | Executa lint do Expo. |
| `npx tsc --noEmit` | Verifica TypeScript sem gerar arquivos. |

## Funcionalidades

- Entrada como visitante.
- Login de prestador por codigo enviado ao WhatsApp.
- Cadastro e edicao de perfil de prestador.
- Listagem de categorias.
- Listagem e filtros de prestadores por categoria, estado e cidade.
- Busca textual por linguagem natural usando a API.
- Busca por voz com gravacao de audio e transcricao no backend.
- Visualizacao de perfil do prestador.
- Abertura de conversa no WhatsApp.
- Armazenamento seguro de tokens e dados do prestador.

## Estrutura

```text
mobile-tem-quem-faz/
+-- app/                  # Rotas e telas do Expo Router
|   +-- (auth)/           # Login, cadastro e verificacao
|   +-- categories/       # Lista e detalhe de categorias
|   +-- providers/        # Lista, detalhe, perfil e edicao de prestadores
|   +-- home.tsx          # Tela principal
+-- assets/               # Imagens, icones e fontes
+-- components/           # Componentes reutilizaveis
|   +-- atoms/
|   +-- molecules/
|   +-- organisms/
|   +-- ui/
+-- hooks/                # Regras de carregamento, busca e voz
+-- services/             # Comunicacao com a API e cache
+-- theme/                # Cores, espacamentos, bordas e tipografia
+-- utils/                # Funcoes auxiliares
+-- app.json
+-- package.json
+-- tsconfig.json
```

## Camadas principais

- `services/api.ts`: centraliza URL da API e chamadas HTTP.
- `services/provider.service.ts`: busca, cadastra, edita e remove prestadores.
- `services/category.service.ts`, `city.service.ts` e `state.service.ts`: carregam dados basicos com cache.
- `services/voice-search.service.ts`: envia audio para `/api/search/audio/`.
- `hooks/useProviders.ts`: busca prestadores, aplica filtros e organiza dados para cards.
- `hooks/useVoiceSearch.ts`: controla gravacao, transcricao e retorno da busca por voz.
- `utils/authStorage.ts`: salva tokens e dados do prestador no SecureStore.
- `theme/`: mantem identidade visual reutilizavel.
- `components/`: monta a interface em atoms, molecules e organisms.

## Fluxo de comunicacao

```text
Tela -> Hook -> Service -> API Django -> Banco/MinIO -> Service -> Hook -> Tela
```

Exemplo: na Home, a busca chama `useProviders`, que usa `provider.service.ts`, que chama a API Django e devolve prestadores prontos para os cards.

## Observacoes

- Para imagens vindas do MinIO, `services/mediaUrl.ts` normaliza URLs como `localhost`, `127.0.0.1`, `0.0.0.0` e `minio` para o host configurado na API.
- Para busca por voz, o app envia `multipart/form-data` para `/api/search/audio/`.
- Para login/cadastro de prestador, o app usa `/api/auth/request-code/` e `/api/auth/verify-code/`.
