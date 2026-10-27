# TemQuemFaz — Mobile

O TemQuemFaz ajuda a encontrar prestadores de serviços locais. Pelo aplicativo, você pode buscar um serviço por texto ou voz, conhecer o profissional, ver seus trabalhos e entrar em contato pelo WhatsApp.

Quem presta serviços também pode se cadastrar, editar o perfil e publicar fotos dos trabalhos realizados.

## O que o aplicativo oferece

- Acesso como visitante e cadastro de prestadores.
- Busca por texto ou voz e filtros por categoria, estado e cidade.
- Perfil com foto, descrição, categorias e localização opcional no mapa.
- Portfólio com até dez fotos por publicação, título e descrição.
- Visualização das próprias publicações, com opções para editar e excluir.
- Publicações com autor, data, descrição completa e fotos ampliáveis.
- Contato com o prestador pelo WhatsApp.

A cidade escolhida fica salva no dispositivo e tem prioridade nos destaques. Prestadores de outras cidades ainda podem aparecer depois. Sem uma cidade escolhida, o app prioriza os mais próximos quando a localização está disponível.

As distâncias usam a posição real do celular, mesmo quando você escolhe outra cidade. Elas aparecem apenas para prestadores que compartilham coordenadas válidas.

## Tecnologias

O aplicativo usa Expo 54, React Native 0.81, React 19 e TypeScript, com navegação pelo Expo Router. Também usa bibliotecas do Expo para localização, áudio, fotos e armazenamento da sessão, além de React Native Maps, geolib, Reanimated e Gesture Handler.

## Como rodar

Você precisa de Node.js, npm, um celular com Expo Go compatível com o SDK 54 ou um emulador configurado, além do backend em execução.

Execute os comandos na pasta `mobile-tem-quem-faz`.

### 1. Instale as dependências

```bash
npm install
```

### 2. Configure o endereço da API

Crie um `.env` na raiz do mobile:

```env
EXPO_PUBLIC_API_URL=http://SEU_IP:8000/api
```

Substitua `SEU_IP` pelo IPv4 do computador que executa o backend. No Windows, use `ipconfig` e procure o adaptador Wi-Fi. Evite o endereço virtual do WSL/Hyper-V.

Mantenha o celular e o computador na mesma rede. No celular, `localhost` e `127.0.0.1` apontam para o próprio aparelho.

O `.env` do mobile é separado do `.env` do backend. Se houver um `.env.local`, confira se ele não está sobrescrevendo a URL. Configure o endereço mesmo que exista um IP padrão em `services/api.ts`, pois ele pode ser de outra rede.

Se o backend estiver rodando sem Docker, inicie-o com `python manage.py runserver 0.0.0.0:8000`. O Compose já faz isso.

### 3. Inicie o aplicativo

```bash
npm start
```

Abra o Expo Go e leia o QR code da sessão atual. Ao mudar o `.env`, pare o Expo e reinicie com o cache limpo:

```bash
npm start -- -c
```

Para iniciar sem consultas aos serviços do Expo:

```bash
npm start -- --offline -c
```

Nesse modo, a API e o MinIO continuam precisando estar acessíveis pela rede local.

## Testar com o backend na EC2

Para o deploy atual, use `EXPO_PUBLIC_API_URL=http://56.125.88.0/api`
no `.env` e reinicie o Expo. O perfil `preview` do `eas.json` usa esse
mesmo endereço. O plugin `plugins/withHttpApi.js` permite HTTP no APK
Android quando a URL configurada começa com `http://`.

Gere um novo APK com `npx eas-cli build --platform android --profile preview`.
Um APK já instalado mantém a URL usada no build. Ele abre sem Expo ou Metro
no computador, mas as funções de login, busca e fotos precisam do backend
acessível na EC2. HTTP é temporário para testes; a configuração de domínio
e HTTPS está no guia `docker/DEPLOY.md` do backend.

## Mapas no APK Android

O `app.config.js` aceita `GOOGLE_MAPS_API_KEY` e a coloca em
`android.config.googleMaps.apiKey`. Para habilitar o mapa dentro do APK,
configure uma chave com Maps SDK for Android habilitado e restrita ao pacote
`com.temquemfaz.app` e ao SHA-1 do certificado que assina o APK. A variável
deve estar disponível também no ambiente usado pelo build EAS.

Quando a chave não está configurada, o aplicativo usa o botão **Abrir no mapa**
para consultar a posição no aplicativo de mapas ou no navegador. O perfil,
a obtenção da localização pelo GPS e o cálculo de distância continuam disponíveis.
Os formulários também evitam montar o mapa nativo nessa situação.

No Expo Go, o mapa usa a configuração fornecida pelo próprio Expo Go. Alterações
no código e na configuração deste recurso precisam entrar em um novo APK para
atualizar a versão já instalada. A confirmação de um fechamento inesperado
no aparelho exige consultar o log do Android; a proteção por configuração
não substitui esse diagnóstico.

Referência da versão usada no projeto:
[react-native-maps no Expo SDK 54](https://github.com/expo/expo/blob/sdk-54/docs/pages/versions/v54.0.0/sdk/map-view.mdx).

## Login durante o desenvolvimento

O prestador entra com um código de verificação de telefone. Atualmente, o backend mostra esse código nos logs; ainda não há envio automático pelo WhatsApp.

Se estiver usando Docker, consulte o código na pasta do backend:

```bash
docker compose logs --tail 50 api
```

A opção de contato pelo WhatsApp, no perfil público, funciona separadamente do login.

## Comandos úteis

| Comando | Para que serve |
| --- | --- |
| `npm run android` | Abre o projeto no Android. |
| `npm run ios` | Abre no simulador iOS, em um Mac configurado. |
| `npm run web` | Inicia a versão para navegador. |
| `npm run lint` | Verifica o estilo do código. |
| `npx tsc --noEmit` | Verifica os tipos do TypeScript. |
| `node --test scripts/tests/*.test.cjs` | Testa as regras de fotos do portfólio e distância. |

## Organização do projeto

| Pasta | Conteúdo |
| --- | --- |
| `app/` | Telas e rotas de autenticação, início, categorias e prestadores. |
| `components/` | Componentes reutilizáveis, organizados em atoms, molecules e organisms. |
| `contexts/` | Cidade escolhida e localização do dispositivo. |
| `hooks/` | Carregamento de dados, busca e gravação de voz. |
| `services/` | Chamadas à API e cache de dados. |
| `theme/` | Cores, fontes, espaçamentos e bordas. |
| `utils/` | Funções de apoio, sessão, fotos e distância. |
| `scripts/tests/` | Testes automatizados. |
| `assets/` | Imagens, ícones e fontes. |

As telas usam hooks e serviços para conversar com a API Django. O arquivo `services/api.ts` centraliza o endereço do backend. O serviço de portfólio cuida dos uploads, e `services/mediaUrl.ts` adapta endereços locais de imagens ao host configurado na API.

## Se algo não funcionar

- **A API não carrega:** teste `http://SEU_IP:8000/api/docs/` no navegador do celular. Confira o IP, a rede e se o backend está iniciado.
- **As fotos não aparecem:** confira se o MinIO está acessível, normalmente pela porta 9000. Adaptar a URL não recupera arquivos que não foram salvos.
- **Publicações antigas ficaram sem foto:** atualize o backend, aplique as migrações e reenvie as fotos salvas como `null` pela versão anterior.
- **O app mostra telas antigas:** confira a pasta e a branch, execute `npm install` e reinicie com `npm start -- -c`.
- **O PowerShell bloqueia `npm.ps1`:** use `npm.cmd` no lugar de `npm` nos comandos.
