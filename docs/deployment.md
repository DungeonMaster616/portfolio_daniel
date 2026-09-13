# Execução e publicação

## Pacote preparado

compose.yaml reúne PostgreSQL 17.11, Django/Gunicorn e nginx.
Frontend e API compartilham origem. O backend não publica a porta do banco nem a sua própria porta.
O frontend escuta apenas 127.0.0.1:8080. Use um proxy TLS confiável na frente em produção.

```powershell
Copy-Item .env.example .env
# Edite .env: senha PostgreSQL e chave Django, sem versionar os valores.
docker compose build
docker compose up -d db
docker compose run --rm backend python manage.py migrate --noinput
docker compose run --rm backend python manage.py collectstatic --noinput
docker compose up -d backend frontend
```

Em desenvolvimento via Compose, DEBUG=1 e ALLOWED_HOSTS devem incluir localhost/127.0.0.1.
Em produção: DEBUG=0, chave aleatória de pelo menos 50 caracteres, PostgreSQL, ALLOWED_HOSTS com domínio real,
CSRF_TRUSTED_ORIGINS com a origem HTTPS. A inicialização recusa configuração essencial ausente.
Não exponha nginx diretamente aceitando X-Forwarded-Proto de clientes não confiáveis:
o proxy TLS deve sobrescrever esse cabeçalho; mantenha o bind loopback.
Configure limites de requisição no proxy/cache compartilhado quando houver mais de um worker.
Revise versões/imagens e seus advisories antes de publicar.

## CI e GitHub Flow

O Git local está inicializado, sem commit ou remoto criado automaticamente.
No repositório escolhido, configure main protegida exigindo ci-gate e package.
O workflow usa ações fixadas por SHA e faz validação YAML/rastreabilidade/actionlint,
lint, tipagem, testes unitários, PostgreSQL (incluindo concorrência), auditorias de dependências,
E2E nos três motores e empacotamento após o gate.
Os relatórios JUnit não podem estar vazios nem conter falhas/skips.
A execução hospedada e a proteção de branch precisam ser verificadas no GitHub real.
Não existe cd.yml com deploy fictício: a ativação depende do destino confirmado.

## Procedimento de release e recuperação

1. Selecionar commit aprovado na CI e na revisão manual de acessibilidade/compatibilidade.
2. Gerar imagens identificadas pelo SHA e preservar a versão anterior.
3. Fazer backup PostgreSQL (pg_dump) e testar a restauração em base isolada.
4. Aplicar migrações em homologação, publicar assets e verificar /api/v1/health/, cadastro, login e ranking.
5. Em produção, executar o mesmo pacote após aprovação e conferir os mesmos fluxos.
6. Se o smoke falhar, retornar às imagens anteriores quando o esquema for compatível.
   Migrações incompatíveis exigem restauração do backup e aceite explícito da possível perda de gravações posteriores.
   Não executar reversão destrutiva automaticamente.

Ainda precisam ser definidos: hospedagem, domínio, TLS, credenciais, backup agendado,
monitoramento, retenção/exclusão de dados e responsáveis pela operação.

## PostgreSQL portátil de teste no Windows

Os binários EDB 17.11 podem ficar em .tools/pgsql; não são incluídos no Git.
Fonte: https://www.enterprisedb.com/download-postgresql-binaries
O script scripts/test_postgres.ps1 cria um cluster novo com SCRAM, usuário/senha temporários,
bind 127.0.0.1 e porta 55432, executa testes e encerra o processo em finally.
Não instala serviço e não toca em outros bancos. Os arquivos temporários ficam em .tools para inspeção.
-E2E acrescenta a suíte completa de navegador com esse PostgreSQL.
Não compartilhe os diretórios de dados/logs como artefatos públicos.

[Versões PostgreSQL suportadas](https://www.postgresql.org/support/versioning/).
