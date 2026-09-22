# synthesis-front

Frontend Next.js da plataforma **synthesis**, conectado à API Django Ninja Extra.

## Executar localmente

```bash
cp .env.example .env.local
npm ci
npm run dev
```

O frontend fica em `http://localhost:3000` e usa, por padrão, a API em
`http://localhost:8000/api`. O backend deve estar executando, com as migrações
e o comando `seed_synthesis` aplicados.

## Compartilhar uma prévia pela internet

O [cloudflared](https://developers.cloudflare.com/tunnel/downloads/) deve estar no `PATH` ou em
`.tools/cloudflared` na pasta do projeto. Na máquina atual, ele já está instalado em `~/.local/bin`.
Na pasta que contém `synthesis-back` e `synthesis-front`, execute:

```sh
# Se o PostgreSQL local ainda não estiver ativo:
docker compose -f synthesis-back/compose.yaml --env-file synthesis-back/.env up -d --wait postgres
python3 share-preview.py
```

O comando inicia Django, Next.js e um Quick Tunnel gratuito. Ele mostra um link HTTPS temporário
`*.trycloudflare.com`; compartilhe esse link apenas com as pessoas que devem testar a aplicação.
O backend fica em `127.0.0.1:8000` e o frontend em `127.0.0.1:3000`. Encerre tudo com Ctrl+C.
O link muda a cada execução e só funciona enquanto o computador, a conexão e o comando estiverem ativos.
Use contas e dados de teste nessa prévia.

Entre com o e-mail e a senha de um usuário criado no Django Admin. A aplicação usa
sessão Django em cookie `HttpOnly`, restaura a sessão após recarga e coordena logout
entre abas. Tokens legados eventualmente existentes no `localStorage` são removidos.

## Perfis e fluxos

- **Gestor:** cria relatos com fotos e edita somente os próprios relatos enquanto
  o ciclo estiver aberto ou reaberto.
- **Gerente:** abre e encerra ciclos, ajusta prazos, reabre períodos com justificativa,
  acompanha pendências, fecha a seleção ao gerar o rascunho, edita cards sem alterar
  os relatos originais e gera versões imutáveis do PDF.
- **Administrador:** cria e edita usuários, áreas e ciclos, encerra e reabre a coleta,
  e consulta os registros e a auditoria. Superusuários também administram grupos e permissões técnicas.

As telas exibem apenas ações aceitas pelo contrato da API. Erros de permissão,
estado do ciclo e validação de domínio são apresentados usando a mensagem
devolvida pelo backend.

## Modelos de relato

Novos relatos começam pela escolha de um modelo guiado: ação/evento, entrega/marco ou
atendimento/articulação. Cada modelo adapta perguntas, exemplos e instruções, mas todos produzem os mesmos
campos editoriais curtos. Contadores e uma prévia do card mostram o impacto do texto antes do envio.

Evidência e próximo passo são opcionais e podem aparecer na síntese. Informações complementares ficam
disponíveis para consulta no relato original, mas não são copiadas para o card nem para o PDF.

## Relatório executivo

O editor apresenta uma prévia em duas camadas. A primeira página reúne a leitura da semana, indicadores
automáticos, até três destaques, pontos de atenção e prioridades. As páginas seguintes preservam o detalhe
por área. A gerente classifica cada card e informa pedido de decisão, responsável e prazo quando aplicável;
a interface mostra as pendências que precisam ser resolvidas antes de gerar uma nova versão do PDF.

Antes da primeira versão, a gerente pode reabrir a seleção, restaurar cards retirados ou cancelar o
rascunho. Depois da publicação essas ações destrutivas ficam bloqueadas. No MVP, a entrega é manual:
a gerente baixa o PDF versionado, copia a mensagem padronizada e o anexa no canal institucional.

## Ciclos semanais

A gerente usa `/ciclos` para controlar o fluxo operacional sem acessar a administração técnica. A tela
permite abrir o próximo ciclo, ajustar o prazo de um ciclo ativo, encerrar a coleta e reabrir um período
encerrado com justificativa. O sistema exige o encerramento do ciclo ativo antes de abrir ou reabrir outro.

## Validação

```bash
npm run lint
npm run typecheck
npm test
npm run test:e2e
npm run test:e2e:integration
npm run build
```

O E2E usa Playwright, sobe um servidor Next.js isolado em `.next-e2e` e percorre o fluxo da gerente
com dados mockados. Na primeira execução, instale o Chromium e suas bibliotecas com
`npx playwright install --with-deps chromium` (ou prepare as dependências equivalentes na imagem de CI).

O comando `test:e2e:integration` sobe também o Django real em `127.0.0.1:8001`, um PostgreSQL 17 efêmero em
`tmpfs` e mídia descartável em `/tmp`. Ele valida sessão/CSRF, upload e edição por gestor, autorização de
objetos, seleção/edição/reordenação, duas versões reais de PDF, fechamento do ciclo, arquivos privados e o
CRUD administrativo com auditoria. O comando de preparação recusa qualquer banco diferente do banco de
aceite `synthesis_mvp_e2e`, isolado em `127.0.0.1:5434`.

O ambiente de desenvolvimento e a CI usam Node 22, registrado em `.nvmrc`. Em produção,
o frontend e a API devem ficar sob a mesma origem HTTPS; veja a documentação de implantação
do backend para o exemplo com Nginx e o artefato standalone do Next.

## Administração

O menu `/administracao` oferece busca, paginação, detalhes e formulários conectados à API:

- `/administracao/usuarios`: cadastro, edição, ativação, senha e acessos.
- `/administracao/areas`: nome, ordem e ativação, incluindo áreas inativas.
- `/administracao/prazos`: cadastro de ciclos, datas, encerramento e reabertura justificada.
- `/administracao/grupos`: grupos e permissões, editáveis por superusuários.
- `/administracao/permissoes`: catálogo de permissões técnicas.
- `/administracao/relatos`, `/fotos`, `/relatorios`, `/secoes`, `/cards`, `/versoes` e `/auditoria`
  (todos sob `/administracao`): consulta de registros, imagens, PDFs e histórico.

O backend precisa incluir a API `/api/administration`. As ações exibidas respeitam as capacidades
retornadas por ela. Exclusões exigem confirmação e vínculos protegidos são apresentados como erros.
Os campos técnicos de usuários aparecem somente para superusuários. Grupos e permissões técnicas
se aplicam ao Django Admin; o perfil continua determinando os fluxos de gestor, gerente e administrador.
