# AmparaPet

Sistema de adoção de animais do Abrigo Toca de Assis (Ivaiporã - PR).
Projeto Integrador de ADS — UNIVALE 2026.

## Acesso rápido

Com o sistema ligado (`AmparaPet.exe` → **Iniciar**):

| | Endereço |
|---|---|
| Site | http://localhost:5500/ |
| Área administrativa | http://localhost:5500/admin/login.html |
| Documentação da API (Swagger) | http://localhost:8000/docs |

**Login do administrador:**

- E-mail: `admin@amparapet.local`
- Senha: `trocar123`

Esse é o administrador criado na primeira vez que o sistema liga (definido no `.env`). Troque a senha antes de usar de verdade.

## Estrutura

| Pasta | O que é |
|-------|---------|
| `backend/` | API em Python (FastAPI) com banco MySQL |
| `frontend/` | Site e área administrativa (HTML, CSS e JavaScript), que consomem a API |

A interface de teste antiga (`frontend-teste/`), usada antes do front oficial, ficou guardada na branch `versao-ultrapassada`.

## Como rodar

Não precisa instalar nada. O Python e o MySQL ficam dentro da pasta do projeto (`python/` e `mysql/`), então funciona em qualquer Windows 10/11 64 bits.

1. Abra o `AmparaPet.exe` e clique em **Iniciar** (ou rode o `iniciar.bat`).
2. O navegador abre o site sozinho. Os endereços e o login estão no [Acesso rápido](#acesso-rápido).
3. Pra desligar: **Parar** no painel ou `parar.bat`.

Se clonou do GitHub, a primeira execução baixa o Python e o MySQL (precisa de internet). Essas pastas não vão pro repositório porque são pesadas.

Na primeira vez que o sistema liga, o banco já vem com 8 animais de exemplo (com fotos), que ficam em `backend/app/exemplos/`. Pra começar sem eles, coloque `CARREGAR_EXEMPLOS=0` no `.env` antes de ligar.

### Arquivos .bat

| Arquivo | O que faz |
|---------|-----------|
| `iniciar.bat` | Liga o MySQL, o site e a API (com `--reload`). A janela aberta é a API. |
| `parar.bat` | Desliga o site, a API e o MySQL. |
| `frontend.bat` | Liga só o site, na porta 5500 (a API precisa estar ligada). |
| `testar.bat` | Roda os testes no banco `amparapet_teste`. |
| `mysql.bat` | Abre o console do MySQL no banco `amparapet`. |
| `instalar.bat` | Reinstala as bibliotecas do `requirements.txt`. |

O `AmparaPet.exe` faz a mesma coisa que os `.bat`, só que com uma janela. O código dele está em `scripts/painel/Painel.cs` e é compilado com `scripts/compilar_painel.ps1`.

No VS Code também dá: F5 sobe a API com depurador, e tem tarefas prontas em Terminal → Executar Tarefa.

## Banco de dados

MySQL 8.4 rodando em `127.0.0.1:3307`, banco `amparapet`, usuário `amparapet` / senha `amparapet`. A porta é 3307 pra não conflitar com outro MySQL/XAMPP instalado.

As tabelas são criadas pela própria API quando ela sobe.

![DER](docs/der.png)

| Tabela | Conteúdo |
|--------|----------|
| `animais` | Dados dos animais, status e contador de cliques de interesse |
| `fotos` | Fotos de cada animal (a de menor `ordem` é a principal) |
| `historico_status` | Mudanças de status com data, usuário e observação |
| `usuarios` | Administradores |
| `sessoes` | Sessões de login (só o hash do token) |
| `tentativas_login` | Usado pra bloquear depois de 5 erros |
| `configuracoes` | Endereço, horários, WhatsApp e textos do abrigo |

Pra zerar tudo: `parar.bat`, apagar `mysql\data\` e `uploads\` e rodar `iniciar.bat` de novo. O banco volta com o admin e os animais de exemplo.

## API

### Públicas

| Método | Rota | Uso |
|--------|------|-----|
| GET | `/api/animais` | Vitrine. Filtros: `especie`, `porte`, `sexo`, `castrado`, `vacinado`, `status`, `busca`, `pagina`, `por_pagina` |
| GET | `/api/animais/{id}` | Detalhes do animal com fotos e links |
| POST | `/api/animais/{id}/interesse` | Conta o clique e devolve o link do WhatsApp |
| GET | `/api/abrigo` | Dados do abrigo e "como adotar" |
| GET | `/api/opcoes` | Valores aceitos nos campos (CAO, GATO, PEQUENO...) |

### Admin

Login em `POST /api/auth/login` com `{"email": "...", "senha": "..."}`. O token vem na resposta e vai no cabeçalho `Authorization: Bearer <token>`. Se der 401, a sessão expirou.

| Método | Rota | Uso |
|--------|------|-----|
| POST | `/api/auth/logout` | Sair |
| GET | `/api/auth/eu` | Usuário logado |
| PUT | `/api/auth/senha` | Trocar senha |
| GET | `/api/admin/painel` | Totais e animais mais procurados |
| GET/POST | `/api/admin/animais` | Listar / cadastrar |
| GET/PATCH/DELETE | `/api/admin/animais/{id}` | Ver / editar / excluir |
| PATCH | `/api/admin/animais/{id}/status` | Mudar status (`DISPONIVEL`, `EM_PROCESSO`, `ADOTADO`) |
| GET | `/api/admin/animais/{id}/historico` | Histórico de status |
| POST | `/api/admin/animais/{id}/fotos` | Upload (campo `fotos`, JPG/PNG/WEBP até 5 MB) |
| PUT | `/api/admin/animais/{id}/fotos/ordem` | `{"ids": [3, 1, 2]}`, a primeira vira a principal |
| DELETE | `/api/admin/fotos/{id}` | Remover foto |
| GET/PUT | `/api/admin/abrigo` | Dados do abrigo |
| GET/POST/PATCH/DELETE | `/api/admin/usuarios` | Administradores |

Algumas coisas pra quem mexer no front:

- A idade é calculada a partir de `data_nascimento` (se só souber mês/ano, manda `AAAA-MM-01`).
- Na vitrine use `miniatura_url`; na página do animal, `url`.
- Os links de compartilhar usam o campo `url_pagina_animal` dos dados do abrigo, que por padrão aponta pro `SITE_URL` do `.env`. Quando o site estiver no ar, é só trocar ele no admin.
- `whatsapp_interesse` vem `null` enquanto o número do abrigo não for cadastrado.
- No `frontend/`, o endereço da API fica em `js/config.js` e todas as chamadas passam por `js/api.js`, que já manda o token.

## Testes

```bash
testar.bat
```

Os testes ficam em `backend/tests/` (pytest) e usam o banco `amparapet_teste`, então não mexem nos dados reais.

O código segue o [Ruff](https://docs.astral.sh/ruff/) (configurado no `pyproject.toml`). Pra checar e formatar:

```bash
python\python -m pip install -r backend\requirements-dev.txt
python\python -m ruff check . && python\python -m ruff format .
```

## Configuração

Fica no `.env`, criado a partir do `.env.example` na primeira execução. Pra publicar: apontar `DATABASE_URL` pro MySQL hospedado, colocar uma senha forte em `ADMIN_INICIAL_SENHA`, restringir `CORS_ORIGENS` ao endereço do front, colocar o endereço real do site em `SITE_URL` e ajustar o `API_URL` em `frontend/js/config.js`.

Pra usar outro MySQL (XAMPP, por exemplo), é só mudar o `DATABASE_URL`:

```
DATABASE_URL=mysql+pymysql://usuario:senha@127.0.0.1:3306/amparapet?charset=utf8mb4
```

## Problemas comuns

- **Abri o HTML com dois cliques e a página ficou em branco (ou com uma faixa vermelha):** o site precisa ser aberto pelo endereço http://localhost:5500/, com o sistema ligado. Pelo arquivo direto o navegador bloqueia os scripts.
- **localhost:5500 não abre:** o site não está ligado. Use o **Iniciar** do painel, o `iniciar.bat` ou o `frontend.bat`.
- **O site abre mas não aparece nenhum animal:** a API (porta 8000) ou o MySQL estão desligados. Rode o `iniciar.bat` de novo.
- **"MySQL nao subiu":** olhe o `mysql\mysql.log`. Normalmente é a porta 3307 ocupada.
- **Windows bloqueia o AmparaPet.exe:** clique em "Mais informações" → "Executar assim mesmo" (acontece quando a pasta vem de um ZIP).
- **Esqueci a senha do admin:** no `mysql.bat`, rode `DELETE FROM usuarios;` e reinicie a API. O admin do `.env` é recriado com a senha do [Acesso rápido](#acesso-rápido).
- **Mudei o `models.py` e a tabela não mudou:** a API só cria tabelas que não existem. Faça um `ALTER TABLE` ou zere o banco.
- 
