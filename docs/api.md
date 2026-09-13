# API v1

Base: /api/v1. JSON; autenticação por cookie de sessão, expiração de 12 horas.
Todas as escritas, incluindo cadastro/login, exigem CSRF.
GET /auth/csrf/ retorna csrfToken e define o cookie; envie X-CSRFToken nas escritas.
Cadastro/login rotacionam o token: use csrfToken da resposta.
Frontend e API devem usar a mesma origem; Vite/nginx fazem o proxy.

| Método | Rota | Contrato |
| --- | --- | --- |
| GET | /health/ | Verifica conexão com o banco |
| GET | /auth/csrf/ | Obter CSRF |
| POST | /auth/register/ | username, email, password; 201 e sessão conectada |
| POST | /auth/login/ | username, password; 200 ou credenciais inválidas 400 |
| POST | /auth/logout/ | Invalida cookie de sessão; 204 |
| GET | /games/ | Catálogo ativo |
| POST | /game-sessions/ | game (slug), client_version: 1.0.0; 201 com id UUID |
| POST | /game-sessions/{id}/finish/ | score e metadata; 201, repetição idêntica 200, conflito 409 |
| POST | /game-sessions/{id}/abandon/ | Encerra sem placar; 204 |
| GET | /games/{slug}/ranking/ | page, period: all/day/week; count, next, previous, results |
| GET | /users/me/ | username, email, records e 20 últimos resultados válidos |
| GET | /users/me/achievements/ | Conquistas com unlocked_at ou null |

Rotas pessoais exigem sessão (403 sem autenticação). Sessões alheias retornam 404.
Campos desconhecidos são rejeitados; user/game do score são derivados da sessão no servidor.
Score é inteiro JSON não negativo; booleans, strings e floats são rejeitados.

Exemplo de finish do Snake:
```json
{"score":10,"metadata":{"foods":1,"duration_ms":1000,"outcome":"over"}}
```

Metadata comum: duration_ms inteiro e outcome over/won.
Snake acrescenta foods; Tetris acrescenta lines; Bomb Arena acrescenta crates e enemies.
Regras e limites completos: specs/implementation_decisions.yaml.
Validação verifica plausibilidade, não comprova que o navegador executou uma partida honesta.
Transação e bloqueio da sessão no PostgreSQL garantem no máximo um score por sessão.
Partidas expiradas após 24 horas e sessões abandonadas não aceitam novos resultados.

Ranking é de resultados, pode listar o mesmo jogador mais de uma vez.
Ordenação: score decrescente, created_at crescente, id crescente.
Somente resultados is_valid entram no ranking/perfil. Administradores podem invalidar placares.

Limites de aplicação: anônimos 120/min, autenticados 240/min, cadastro/login 10/min por IP.
O cache padrão é local ao processo; para múltiplas instâncias, usar limite de requisições
no proxy e/ou cache compartilhado antes de abrir tráfego público.

Referências: [sessões e CSRF no DRF](https://www.django-rest-framework.org/api-guide/authentication/#sessionauthentication)
e [transações Django](https://docs.djangoproject.com/en/6.0/topics/db/transactions/).
