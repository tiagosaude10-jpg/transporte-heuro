# Auditoria e reestruturação — Transporte HEURO

## Situação encontrada

A aplicação possui uma base funcional, porém acumulou controladores e correções paralelas ao longo das versões. O principal risco não está em uma tela isolada, mas na sobreposição entre arquivos que alteram a mesma interface e interceptam os mesmos eventos.

## Entrada atual da aplicação

O `index.html` carrega atualmente:

- `style.css`
- `welcome-screen-fix-v16.css`
- `fixed-datetime.css`
- `app.js`
- `register-flow.js`
- `whatsapp-routing.js`
- um controlador embutido no próprio HTML para data e horário

## Responsabilidades atuais

### `app.js`

Controla a base funcional principal:

- telas e sessão;
- login e usuários;
- cadastro;
- solicitações;
- administração;
- configurações;
- armazenamento local;
- detalhes do transporte.

### `register-flow.js`

Apesar do nome, também funciona como segundo controlador geral:

- controla o fluxo do primeiro cadastro;
- reconstrói a tela de comando;
- cria barra inferior;
- cria telas e cartões via JavaScript;
- injeta CSS no documento;
- calcula indicadores;
- controla navegação e consulta.

### `whatsapp-routing.js`

A versão encontrada carrega uma cópia histórica do próprio módulo por CDN e instala interceptadores globais de clique. Esse comportamento deve ser migrado para um módulo local definitivo antes da remoção da ponte antiga.

## Problemas confirmados

1. Mais de um arquivo controla a navegação.
2. HTML e CSS são criados dinamicamente por JavaScript.
3. Existem interceptadores globais com captura de evento.
4. Um módulo atual depende de uma versão antiga hospedada externamente.
5. O PWA utilizava identificador variável por publicação.
6. O service worker apagava todos os caches e navegava novamente as páginas abertas.
7. A atualização do aplicativo dependia de parâmetros adicionados à URL.

## Alterações da primeira etapa

- criação de branch exclusiva de reestruturação;
- preservação integral da `main`;
- estabilização do `id`, `start_url` e `scope` do manifesto;
- substituição do mecanismo de limpeza forçada por cache versionado;
- remoção da navegação automática dos clientes durante a ativação do service worker;
- criação de uma estratégia de atualização previsível, com fallback offline básico.

## Arquitetura de destino

```text
index.html
style.css
app.js
manifest.json
service-worker.js
assets/
  images/
  icons/
js/
  auth.js
  navigation.js
  dashboard.js
  transport.js
  users.js
  history.js
  pdf.js
  whatsapp.js
```

A divisão poderá ser ajustada, mas cada responsabilidade deverá possuir um único controlador.

## Ordem segura de migração

1. PWA, manifesto e atualização.
2. Navegação e estrutura fixa das telas.
3. Login e primeiro cadastro.
4. Tela de comando.
5. Solicitação e anexos.
6. Execução, pendências, agenda e histórico.
7. Administração.
8. PDF e WhatsApp.
9. Consolidação do CSS.
10. Remoção dos arquivos antigos somente após testes.

## Regras de preservação

- nenhum recurso funcional será removido antes da migração;
- arquivos antigos permanecerão disponíveis durante a validação;
- cada etapa deverá ser testada em navegador, iPhone e Android;
- a branch de reestruturação não deverá substituir a `main` antes da aprovação;
- dados existentes em `localStorage`, `sessionStorage` e `IndexedDB` deverão continuar reconhecidos durante a migração.

## Próxima etapa técnica

Consolidar a navegação em um único controlador e retirar gradualmente do `register-flow.js` as responsabilidades que não pertencem ao cadastro. A tela de comando deverá passar a existir integralmente no HTML, sem reconstrução dinâmica e sem áreas invisíveis sobrepostas.
