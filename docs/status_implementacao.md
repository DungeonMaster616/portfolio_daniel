# Estado da implementação

Atualizado em 2026-09-12. O estado inicial encontrado era apenas o template Vite e o
scaffold Django. O produto local está funcional; publicação pública ainda não foi realizada.

## Implementado

- Portfólio responsivo com apresentação, catálogo, detalhes técnicos e três jogos jogáveis.
- Snake: movimento, crescimento, colisões, score e velocidade progressiva.
- Tetris: sete peças, sacola embaralhada, rotação, quedas, linhas, score, preview e níveis.
- Bomb Arena: mapa original, bombas, explosões, reação em cadeia, inimigos, power-up e vitória.
- Ciclo comum completo, teclado e botões para toque; som, volume e preferências locais opcionais.
- Django REST: catálogo, cadastro, login/logout, sessões, ranking com períodos, perfil e conquistas.
- Sessão por cookie, CSRF explícito, validação estrita, throttling e placares plausíveis.
- Finish idempotente: 201 inicial, 200 para repetição idêntica e 409 para conflito.
- Admin para jogos, conquistas, sessões e invalidação de placares.
- Configuração por ambiente, PostgreSQL em produção e proteções para HTTPS/HSTS.
- Dockerfiles, Compose, nginx same-origin, endpoint de saúde e roteiro de recuperação.
- CI com especificações, lint, tipos, PostgreSQL, auditorias, E2E e empacotamento.
- Git local inicializado em `main`, ainda sem commit ou remoto.

## Evidências locais aprovadas

- Especificações: YAML, origem/hash, 48 IDs ativos e 27 cenários mapeados.
- Frontend: ESLint, TypeScript e build Vite aprovados.
- Motores: 15 testes; linhas 100%, statements 96,56% e branches 87,41%.
- API SQLite: 12 testes aprovados.
- API PostgreSQL 17.11: 13 testes, incluindo concorrência real do finish.
- E2E: 21 testes em Chromium, Firefox e WebKit.
- Axe WCAG A/AA e viewport de 320 px aprovados nos três motores.
- npm audit e pip-audit sem vulnerabilidades conhecidas.
- Workflow aprovado no actionlint; JUnit presente, com testes e sem skips.
- Migrações sem alterações pendentes; banco SQLite local migrado.

## Pendências que exigem dados ou ambiente externo

1. Informar GitHub/contato para `VITE_GITHUB_URL` e `VITE_CONTACT_URL` (RF-003).
2. Escolher hospedagem, domínio/TLS, backup, monitoramento, retenção e exclusão de dados.
3. Criar remoto, publicar branch, confirmar a CI hospedada e proteger `main`.
4. Fazer revisão manual de acessibilidade, toque, FPS e navegadores Edge/Safari reais.
5. Executar homologação, smoke, restauração de backup e rollback no destino escolhido.

## Opcionais não adotados

- Redefinição de senha por e-mail (RF-053): depende de provedor e política de conta.
- PWA/offline, gamepad e personalização de controles.

`release_scope.yaml` mantém `completed_phases` vazio porque as fases exigem aceite integral,
incluindo CI hospedada e verificações externas. IDs ativos indicam comportamento implementado
e mapeado, não aceite final de toda afirmação ampla do cenário original.

Consulte `docs/specs/implementation_decisions.yaml`, `docs/api.md` e `docs/deployment.md`.
