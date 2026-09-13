# Portfolio Games — Daniel Gomes

Portfólio com **Snake, Tetris e Bomb Arena**, jogos em Canvas/TypeScript e API Django REST.
Visitantes jogam sem conta; jogadores autenticados registram resultados, consultam ranking, perfil e conquistas.

## Executar no Windows

Requisitos usados na validação: Node 26.7.0 e Python 3.14.7.

No primeiro terminal, a partir da raiz:

```powershell
python -m venv backend/venv
backend/venv/Scripts/python.exe -m pip install -r backend/requirements-ci.txt
backend/venv/Scripts/python.exe backend/manage.py migrate
backend/venv/Scripts/python.exe backend/manage.py runserver 127.0.0.1:8000
```

No segundo terminal:

```powershell
cd frontend
npm ci
npm run dev
```

Abra a URL que o Vite informar (normalmente http://localhost:5173).
O proxy do Vite encaminha /api ao Django preservando Host e CSRF.
O banco local SQLite fica em backend/db.sqlite3 e não entra no Git.
Neste workspace, dependências e migrações locais já foram preparadas.

Para o administrador:

```powershell
backend/venv/Scripts/python.exe backend/manage.py createsuperuser
```

Acesse http://127.0.0.1:8000/admin/. Nenhuma conta ou senha padrão foi criada.

## Controles

| Jogo | Teclado | Objetivo |
| --- | --- | --- |
| Snake | Setas / WASD | Coletar alimento e evitar colisões |
| Tetris | Setas / WASD; Espaço para queda instantânea | Completar linhas |
| Bomb Arena | Setas / WASD; Espaço para bomba | Derrotar os três inimigos |
| Todos | P | Pausar / retomar |

Há botões de direção e ação para toque. Sons ficam desligados por padrão.
Sair da área do jogo ou trocar de aba pausa a partida.
Encerrar manualmente ou reiniciar abandona a sessão anterior sem registrar score.
Apenas o fim natural do jogo envia resultado; falhas permitem repetir o envio da mesma sessão.
Resultados pendentes ficam na página atual: não recarregue antes de tentar novamente.

## Testes

```powershell
backend/venv/Scripts/python.exe scripts/validate_specs.py
backend/venv/Scripts/python.exe -m ruff check backend
backend/venv/Scripts/python.exe -m ruff format --check backend scripts
cd backend
venv/Scripts/python.exe -m pytest
cd ../frontend
npm run lint
npm run typecheck
npm run test:ci -- --coverage
npx playwright install chromium firefox webkit
npm run test:e2e
npm run build
```

Playwright compila o frontend e inicia Django com banco temporário.
As portas 8000 e 4173 devem estar livres; ele não reutiliza seu servidor de desenvolvimento.
Os relatórios ficam em backend/reports e frontend/reports.
Para PostgreSQL portátil no Windows: powershell -File scripts/test_postgres.ps1 -E2E.
Para outras instalações PostgreSQL, configure POSTGRES_* e use uma base descartável test_* ou e2e_*.
A suíte de concorrência só é coletada quando POSTGRES_DB está configurada; a CI exige PostgreSQL.

## Personalização e publicação

Copie frontend/.env.example para frontend/.env.local e configure VITE_GITHUB_URL e VITE_CONTACT_URL.
Esses valores são públicos e incorporados no build. Não há links fictícios.
Django lê variáveis de ambiente do processo; .env é carregado pelo Docker Compose, não automaticamente no runserver.

Veja [implantação](docs/deployment.md), [contrato da API](docs/api.md) e
[estado da implementação](docs/status_implementacao.md).
O workflow CI e o empacotamento estão preparados. Deploy público e CD dependem da hospedagem,
domínio, segredos e configuração do repositório remoto.
# portfolio_daniel
