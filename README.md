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

Entre com o e-mail e a senha de um usuário criado no Django Admin. A aplicação usa
sessão Django em cookie `HttpOnly`, restaura a sessão após recarga e coordena logout
entre abas. Tokens legados eventualmente existentes no `localStorage` são removidos.

## Perfis e fluxos

- **Gestor:** cria relatos com fotos e edita somente os próprios relatos enquanto
  o ciclo estiver aberto ou reaberto.
- **Gerente:** acompanha pendências, fecha a seleção ao gerar o rascunho, edita
  cards sem alterar os relatos originais e gera versões imutáveis do PDF.
- **Administrador:** cria e edita usuários, áreas e ciclos, encerra e reabre a coleta,
  e consulta os registros e a auditoria. Superusuários também administram grupos e permissões técnicas.

As telas exibem apenas ações aceitas pelo contrato da API. Erros de permissão,
estado do ciclo e validação de domínio são apresentados usando a mensagem
devolvida pelo backend.

## Validação

```bash
npm run lint
npm run typecheck
npm test
npm run build
```

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
