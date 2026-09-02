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

## Validação

```bash
npm run lint
npm run typecheck
npm test
npm run build
```
