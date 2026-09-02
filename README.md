# synthesis-front

Frontend Next.js da plataforma **synthesis**, conectado à API Django Ninja Extra.

## Executar localmente

```bash
cp .env.example .env.local
npm install
npm run dev
```

O frontend fica em `http://localhost:3000` e usa, por padrão, a API em
`http://localhost:8000/api`. O backend deve estar executando, com as migrações
e o comando `seed_synthesis` aplicados.

Entre com o e-mail e a senha de um usuário criado no Django Admin. A aplicação
renova o access token automaticamente enquanto o refresh token for válido.

## Perfis e fluxos

- **Gestor:** cria relatos com fotos e edita somente os próprios relatos enquanto
  o ciclo estiver aberto ou reaberto.
- **Gerente:** acompanha pendências, fecha a seleção ao gerar o rascunho, edita
  cards sem alterar os relatos originais e gera versões imutáveis do PDF.
- **Administrador:** consulta áreas e usuários e reabre ciclos com justificativa
  e novo prazo futuro. Cadastros continuam sendo feitos no Django Admin.

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
