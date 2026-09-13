# Análise de Requisitos — Portfolio Games

```yaml
documento:
  titulo: "Análise de Requisitos — Portfolio Games"
  versao: "1.0.0"
  status: "proposta inicial"
  idioma: "pt-BR"
  formato: "Markdown com especificações em YAML"
  projeto:
    nome: "Portfolio Games"
    tipo: "aplicação web de portfólio e jogos"
    responsavel: "Daniel Gomes"

visao_do_produto:
  problema: >-
    Criar um portfólio profissional que demonstre conhecimentos de desenvolvimento
    web, programação de jogos, algoritmos, APIs REST, banco de dados e testes.
  solucao: >-
    Uma plataforma acessível pelo navegador contendo páginas de apresentação e três
    jogos autorais: Snake, Tetris e Bomb Arena, este último apenas inspirado em jogos
    de arena com bombas e com identidade própria.
  objetivo_geral: >-
    Permitir que visitantes conheçam o desenvolvedor, executem os jogos diretamente
    no navegador e, quando autenticados, registrem pontuações, conquistas e estatísticas.
  proposta_de_valor:
    - "Reunir portfólio e demonstrações jogáveis em um único produto."
    - "Demonstrar domínio de HTML, CSS, TypeScript, Canvas, Django e APIs REST."
    - "Oferecer uma experiência simples, responsiva e sem instalação para o visitante."

escopo:
  incluido:
    - "Página inicial e apresentação do desenvolvedor."
    - "Catálogo com Snake, Tetris e Bomb Arena."
    - "Execução da lógica e renderização dos jogos no navegador."
    - "Controles por teclado; controles de toque avaliados por jogo."
    - "Cadastro, autenticação, encerramento de sessão e perfil de jogador."
    - "Registro de pontuações e estatísticas."
    - "Ranking global e melhores resultados pessoais."
    - "Sistema básico de conquistas."
    - "Links para repositórios e descrição técnica dos projetos."
    - "API REST entre frontend e backend."
    - "Testes automatizados essenciais e implantação web."
  fora_do_escopo_inicial:
    - "Aplicativos nativos para desktop ou celular."
    - "Modo multijogador em tempo real."
    - "Chat entre usuários."
    - "Compras, anúncios ou moedas pagas."
    - "Cópia de nomes, personagens, mapas, artes ou sons de jogos comerciais."
    - "Editor público de mapas."

stakeholders:
  - id: "STK-01"
    papel: "Desenvolvedor e administrador"
    interesse: "Construir, manter e apresentar o projeto no portfólio."
  - id: "STK-02"
    papel: "Visitante"
    interesse: "Conhecer o portfólio e jogar sem precisar criar conta."
  - id: "STK-03"
    papel: "Jogador cadastrado"
    interesse: "Salvar resultados, consultar estatísticas e participar de rankings."
  - id: "STK-04"
    papel: "Recrutador ou avaliador técnico"
    interesse: "Examinar funcionalidades, arquitetura, código e qualidade do projeto."

premissas:
  - "Os jogos serão single-player e funcionarão prioritariamente no navegador."
  - "O frontend usará HTML, CSS, TypeScript, Vite e Canvas API."
  - "O backend usará Django e Django REST Framework."
  - "PostgreSQL será usado em produção; SQLite poderá ser usado no desenvolvimento inicial."
  - "O usuário final não precisará instalar dependências para jogar."
  - "A primeira versão será construída na ordem Snake, Tetris e Bomb Arena."

restricoes:
  - "A interface deverá funcionar em navegadores modernos."
  - "A lógica principal dos jogos não dependerá do backend durante a partida."
  - "Bomb Arena deverá possuir nome, identidade visual, mapas, personagens e recursos próprios."
  - "Segredos, senhas e chaves não poderão ser armazenados no repositório."
  - "Pontuações enviadas pelo cliente não deverão ser consideradas totalmente confiáveis."

arquitetura_proposta:
  frontend:
    tecnologias: ["HTML5", "CSS3", "TypeScript", "Vite", "Canvas API"]
    responsabilidades:
      - "Interface, navegação, acessibilidade e responsividade."
      - "Entrada do jogador, game loop, regras, colisões, áudio e renderização."
      - "Consumo da API REST."
  backend:
    tecnologias: ["Python", "Django", "Django REST Framework"]
    responsabilidades:
      - "Usuários, autenticação, autorização e administração."
      - "Persistência e consulta de pontuações, conquistas e estatísticas."
      - "Validação, paginação e limitação de requisições."
  banco_de_dados:
    tecnologia_producao: "PostgreSQL"
    entidades_principais: ["User", "Game", "Score", "Achievement", "UserAchievement", "GameSession"]
  comunicacao:
    protocolo: "HTTPS"
    estilo: "API REST"
    formato: "JSON"

requisitos_funcionais:
  portfolio:
    - id: "RF-001"
      prioridade: "must"
      descricao: "O sistema deve exibir uma página inicial com apresentação, habilidades e projetos."
    - id: "RF-002"
      prioridade: "must"
      descricao: "O sistema deve apresentar cada jogo em um card com descrição, imagem, controles e ação para jogar."
    - id: "RF-003"
      prioridade: "should"
      descricao: "O sistema deve disponibilizar links para o GitHub e demais contatos profissionais definidos pelo responsável."
    - id: "RF-004"
      prioridade: "should"
      descricao: "Cada projeto deve possuir uma seção técnica com tecnologias, desafios e aprendizados."
  jogos_comuns:
    - id: "RF-010"
      prioridade: "must"
      descricao: "O visitante deve poder iniciar e jogar sem autenticação."
    - id: "RF-011"
      prioridade: "must"
      descricao: "Cada jogo deve oferecer iniciar, pausar, retomar, reiniciar e encerrar partida."
    - id: "RF-012"
      prioridade: "must"
      descricao: "O sistema deve apresentar instruções e controles antes ou durante a primeira partida."
    - id: "RF-013"
      prioridade: "must"
      descricao: "O jogo deve mostrar pontuação e estado atual da partida."
    - id: "RF-014"
      prioridade: "should"
      descricao: "O jogador deve poder ativar ou desativar sons e ajustar o volume."
    - id: "RF-015"
      prioridade: "could"
      descricao: "O sistema poderá salvar preferências locais, como volume, tema e controles."
  snake:
    - id: "RF-020"
      prioridade: "must"
      descricao: "A cobra deve se mover continuamente em uma grade conforme a direção escolhida."
    - id: "RF-021"
      prioridade: "must"
      descricao: "Ao coletar um alimento, a cobra deve crescer e a pontuação deve aumentar."
    - id: "RF-022"
      prioridade: "must"
      descricao: "A partida deve terminar quando a cobra colidir consigo mesma ou com um limite definido pelo modo de jogo."
    - id: "RF-023"
      prioridade: "should"
      descricao: "A velocidade deve poder aumentar progressivamente conforme a pontuação."
  tetris:
    - id: "RF-030"
      prioridade: "must"
      descricao: "O jogo deve gerar e movimentar peças em uma grade."
    - id: "RF-031"
      prioridade: "must"
      descricao: "O jogador deve poder mover, girar e acelerar a queda da peça quando a ação for válida."
    - id: "RF-032"
      prioridade: "must"
      descricao: "Linhas completas devem ser removidas e convertidas em pontuação."
    - id: "RF-033"
      prioridade: "must"
      descricao: "A partida deve terminar quando uma nova peça não puder ser inserida."
    - id: "RF-034"
      prioridade: "should"
      descricao: "O jogo deve exibir a próxima peça e permitir queda instantânea."
  bomb_arena:
    - id: "RF-040"
      prioridade: "must"
      descricao: "O jogador deve se movimentar em um mapa baseado em blocos."
    - id: "RF-041"
      prioridade: "must"
      descricao: "O jogador deve poder posicionar bombas com temporizador e alcance definidos."
    - id: "RF-042"
      prioridade: "must"
      descricao: "Explosões devem respeitar obstáculos, destruir blocos permitidos e afetar entidades alcançadas."
    - id: "RF-043"
      prioridade: "must"
      descricao: "O mapa deve distinguir chão, paredes permanentes e blocos destrutíveis."
    - id: "RF-044"
      prioridade: "must"
      descricao: "A partida deve possuir condição clara de vitória e derrota."
    - id: "RF-045"
      prioridade: "should"
      descricao: "Blocos destruídos poderão revelar power-ups definidos pelo jogo."
    - id: "RF-046"
      prioridade: "should"
      descricao: "Inimigos controlados pelo sistema devem possuir comportamento previsível e dificuldade progressiva."
  usuarios:
    - id: "RF-050"
      prioridade: "should"
      descricao: "O visitante deve poder criar uma conta com dados mínimos necessários."
    - id: "RF-051"
      prioridade: "should"
      descricao: "O usuário deve poder entrar e sair de sua conta com segurança."
    - id: "RF-052"
      prioridade: "should"
      descricao: "O usuário deve poder consultar seu perfil, recordes, partidas e conquistas."
    - id: "RF-053"
      prioridade: "could"
      descricao: "O usuário deve poder solicitar redefinição de senha."
  pontuacoes_e_ranking:
    - id: "RF-060"
      prioridade: "should"
      descricao: "Ao fim da partida, o frontend deve poder enviar o resultado do usuário autenticado à API."
    - id: "RF-061"
      prioridade: "should"
      descricao: "A API deve validar e armazenar resultados aceitos."
    - id: "RF-062"
      prioridade: "should"
      descricao: "O sistema deve exibir ranking paginado por jogo."
    - id: "RF-063"
      prioridade: "should"
      descricao: "O sistema deve destacar o melhor resultado pessoal do usuário autenticado."
    - id: "RF-064"
      prioridade: "could"
      descricao: "O ranking poderá possuir filtros de período, como diário, semanal e geral."
  conquistas:
    - id: "RF-070"
      prioridade: "could"
      descricao: "O sistema deve conceder conquistas quando critérios definidos forem satisfeitos."
    - id: "RF-071"
      prioridade: "could"
      descricao: "O perfil deve distinguir conquistas obtidas e ainda bloqueadas."
  administracao:
    - id: "RF-080"
      prioridade: "should"
      descricao: "O administrador deve poder gerenciar jogos, conquistas e resultados inválidos pelo Django Admin."

requisitos_nao_funcionais:
  - id: "RNF-001"
    categoria: "desempenho"
    requisito: "A interface principal deve ficar utilizável em até 3 segundos em conexão razoável, sem contar indisponibilidade externa."
    verificacao: "Auditoria automatizada e teste em ambiente de homologação."
  - id: "RNF-002"
    categoria: "desempenho"
    requisito: "Os jogos devem buscar renderização fluida, preferencialmente próxima de 60 FPS em equipamento compatível."
    verificacao: "Medição de quadros e teste manual em dispositivos-alvo."
  - id: "RNF-003"
    categoria: "responsividade"
    requisito: "As páginas do portfólio devem funcionar a partir de 320 px de largura."
    verificacao: "Testes em larguras representativas e navegadores modernos."
  - id: "RNF-004"
    categoria: "compatibilidade"
    requisito: "Suportar as duas versões estáveis mais recentes de Chrome, Firefox, Edge e Safari."
    verificacao: "Matriz de testes de navegador."
  - id: "RNF-005"
    categoria: "acessibilidade"
    requisito: "A interface do portfólio deve buscar conformidade WCAG 2.2 nível AA."
    verificacao: "Auditoria automática, navegação por teclado e revisão manual."
  - id: "RNF-006"
    categoria: "seguranca"
    requisito: "Dados em produção devem trafegar por HTTPS e endpoints protegidos devem exigir autenticação."
    verificacao: "Testes de configuração e autorização."
  - id: "RNF-007"
    categoria: "seguranca"
    requisito: "Entradas devem ser validadas no backend, com proteção contra CSRF, XSS, injeção e abuso de requisições."
    verificacao: "Testes automatizados, revisão e análise de dependências."
  - id: "RNF-008"
    categoria: "privacidade"
    requisito: "Coletar somente dados necessários e oferecer informações claras sobre seu uso."
    verificacao: "Revisão do modelo de dados e da política de privacidade."
  - id: "RNF-009"
    categoria: "manutenibilidade"
    requisito: "Frontend e backend devem ter módulos coesos, tipagem, lint e documentação de execução."
    verificacao: "CI e revisão de código."
  - id: "RNF-010"
    categoria: "qualidade"
    requisito: "Regras centrais dos jogos e endpoints críticos devem possuir testes automatizados."
    verificacao: "Pipeline de testes com relatório de sucesso."
  - id: "RNF-011"
    categoria: "observabilidade"
    requisito: "Erros do backend devem ser registrados sem expor dados sensíveis."
    verificacao: "Inspeção de logs e teste controlado de falhas."

regras_de_negocio:
  - id: "RN-001"
    regra: "Visitantes podem jogar, mas somente usuários autenticados podem registrar resultados no ranking online."
  - id: "RN-002"
    regra: "Cada resultado deve estar associado a exatamente um usuário e um jogo."
  - id: "RN-003"
    regra: "Pontuações devem ser números inteiros não negativos e respeitar limites plausíveis definidos por jogo."
  - id: "RN-004"
    regra: "Resultados duplicados para a mesma sessão devem ser rejeitados de forma idempotente."
  - id: "RN-005"
    regra: "O ranking padrão deve ordenar pontuação de forma decrescente e usar o registro mais antigo como desempate."
  - id: "RN-006"
    regra: "Uma conquista deve ser concedida apenas uma vez por usuário."
  - id: "RN-007"
    regra: "A pausa deve interromper atualizações da partida e não pode gerar vantagem de pontuação."
  - id: "RN-008"
    regra: "O placar final só deve ser enviado após o encerramento válido da sessão de jogo."
  - id: "RN-009"
    regra: "Bomb Arena deve utilizar propriedade intelectual original ou recursos com licença compatível."

modelo_de_dados:
  User:
    campos:
      - "id: UUID ou inteiro"
      - "username: string única"
      - "email: string única"
      - "password_hash: gerenciado pelo Django"
      - "date_joined: datetime"
  Game:
    campos:
      - "id: UUID ou inteiro"
      - "slug: string única"
      - "name: string"
      - "description: text"
      - "is_active: boolean"
  GameSession:
    campos:
      - "id: UUID"
      - "user_id: FK opcional"
      - "game_id: FK"
      - "started_at: datetime"
      - "finished_at: datetime opcional"
      - "status: started | completed | abandoned | rejected"
      - "client_version: string"
  Score:
    campos:
      - "id: UUID ou inteiro"
      - "session_id: FK única"
      - "user_id: FK"
      - "game_id: FK"
      - "score: inteiro não negativo"
      - "metadata: JSON validado por jogo"
      - "created_at: datetime"
      - "is_valid: boolean"
  Achievement:
    campos:
      - "id: UUID ou inteiro"
      - "game_id: FK opcional"
      - "code: string única"
      - "name: string"
      - "description: string"
      - "criteria: JSON"
  UserAchievement:
    campos:
      - "user_id: FK"
      - "achievement_id: FK"
      - "unlocked_at: datetime"
    restricao: "unique(user_id, achievement_id)"

api_rest_proposta:
  base_url: "/api/v1"
  endpoints:
    - metodo: "POST"
      rota: "/auth/register/"
      autenticacao: false
      finalidade: "Criar conta."
    - metodo: "POST"
      rota: "/auth/login/"
      autenticacao: false
      finalidade: "Autenticar usuário."
    - metodo: "POST"
      rota: "/auth/logout/"
      autenticacao: true
      finalidade: "Encerrar sessão."
    - metodo: "GET"
      rota: "/games/"
      autenticacao: false
      finalidade: "Listar jogos disponíveis."
    - metodo: "POST"
      rota: "/game-sessions/"
      autenticacao: true
      finalidade: "Iniciar sessão rastreável de jogo."
    - metodo: "POST"
      rota: "/game-sessions/{session_id}/finish/"
      autenticacao: true
      finalidade: "Finalizar sessão e enviar resultado."
    - metodo: "GET"
      rota: "/games/{slug}/ranking/"
      autenticacao: false
      finalidade: "Consultar ranking paginado."
    - metodo: "GET"
      rota: "/users/me/"
      autenticacao: true
      finalidade: "Consultar perfil e estatísticas pessoais."
    - metodo: "GET"
      rota: "/users/me/achievements/"
      autenticacao: true
      finalidade: "Consultar conquistas."

criterios_de_aceitacao:
  - id: "CA-001"
    relacionado_a: ["RF-010", "RF-011"]
    dado: "um visitante na página de um jogo"
    quando: "selecionar iniciar"
    entao: "a partida deve começar sem solicitar autenticação e aceitar os controles documentados"
  - id: "CA-002"
    relacionado_a: ["RF-021", "RF-022"]
    dado: "uma partida de Snake em andamento"
    quando: "a cobra coleta alimento ou colide de forma inválida"
    entao: "ela deve crescer e pontuar no primeiro caso, ou encerrar a partida no segundo"
  - id: "CA-003"
    relacionado_a: ["RF-031", "RF-032", "RF-033"]
    dado: "uma partida de Tetris em andamento"
    quando: "uma linha é completada ou uma nova peça não pode entrar"
    entao: "a linha deve ser removida e pontuada, ou a partida deve terminar, respectivamente"
  - id: "CA-004"
    relacionado_a: ["RF-041", "RF-042"]
    dado: "uma bomba posicionada em Bomb Arena"
    quando: "o temporizador termina"
    entao: "a explosão deve percorrer o alcance permitido e ser bloqueada pelos obstáculos definidos"
  - id: "CA-005"
    relacionado_a: ["RF-060", "RF-061"]
    dado: "um usuário autenticado com uma sessão válida concluída"
    quando: "o resultado é enviado"
    entao: "a API deve validar, persistir uma única vez e retornar confirmação"
  - id: "CA-006"
    relacionado_a: ["RF-062"]
    dado: "resultados válidos existentes"
    quando: "o ranking é consultado"
    entao: "os resultados devem aparecer paginados e ordenados conforme RN-005"

testes_previstos:
  frontend:
    unitarios:
      - "Movimento, colisões e crescimento do Snake."
      - "Rotação, colisões e remoção de linhas do Tetris."
      - "Propagação de explosões e colisões do Bomb Arena."
      - "Pontuação, pausa e transições de estado."
    integracao:
      - "Consumo da API e tratamento de sucesso, erro e indisponibilidade."
    interface:
      - "Navegação, controles, responsividade e acessibilidade básica."
  backend:
    unitarios:
      - "Modelos, validações e regras de pontuação."
    api:
      - "Autenticação, autorização, paginação, idempotência e respostas inválidas."
    seguranca:
      - "Acesso indevido, entrada malformada e limitação de requisições."
  ponta_a_ponta:
    - "Criar conta, entrar, jogar, salvar placar e visualizar ranking."

matriz_de_prioridade:
  metodo: "MoSCoW"
  must:
    - "Portfólio navegável."
    - "Snake funcional."
    - "Tetris funcional."
    - "Bomb Arena básico funcional."
    - "Jogos executados no navegador."
    - "Testes das regras centrais."
  should:
    - "Contas, API, resultados, ranking, perfil e administração."
    - "Responsividade e opções de áudio."
  could:
    - "Conquistas, filtros de ranking, PWA, toque e suporte a controle."
  wont_nesta_versao:
    - "Multijogador online, chat, compras e aplicativos nativos."

fases_de_entrega:
  - fase: 1
    nome: "Fundação e portfólio"
    entregas: ["Repositório", "Vite + TypeScript", "design base", "páginas do portfólio", "CI inicial"]
  - fase: 2
    nome: "Snake MVP"
    entregas: ["game loop", "entrada", "colisão", "pontuação", "game over", "testes"]
  - fase: 3
    nome: "Tetris MVP"
    entregas: ["grade", "peças", "rotação", "linhas", "níveis", "testes"]
  - fase: 4
    nome: "Bomb Arena MVP"
    entregas: ["mapa", "movimento", "bombas", "explosões", "inimigos", "vitória e derrota", "testes"]
  - fase: 5
    nome: "Backend e integração"
    entregas: ["Django", "API REST", "banco", "autenticação", "sessões", "pontuações", "ranking"]
  - fase: 6
    nome: "Qualidade e publicação"
    entregas: ["acessibilidade", "segurança", "otimização", "testes E2E", "documentação", "deploy"]

riscos:
  - id: "R-001"
    risco: "Escopo grande para uma primeira entrega."
    probabilidade: "alta"
    impacto: "alto"
    mitigacao: "Entregar cada jogo como MVP independente e adiar funcionalidades could."
  - id: "R-002"
    risco: "Complexidade elevada do Bomb Arena."
    probabilidade: "alta"
    impacto: "alto"
    mitigacao: "Começar com um mapa, um inimigo, uma fase e poucos power-ups."
  - id: "R-003"
    risco: "Manipulação de placares pelo cliente."
    probabilidade: "alta"
    impacto: "medio"
    mitigacao: "Sessões, limites plausíveis, telemetria mínima e sinalização de resultados suspeitos."
  - id: "R-004"
    risco: "Problemas de direitos autorais no jogo inspirado em Bomberman."
    probabilidade: "media"
    impacto: "alto"
    mitigacao: "Criar identidade, código, artes, sons, nomes e mapas próprios ou licenciados."
  - id: "R-005"
    risco: "Desempenho insuficiente em dispositivos móveis."
    probabilidade: "media"
    impacto: "medio"
    mitigacao: "Reduzir draw calls, reutilizar recursos, medir FPS e testar progressivamente."

dependencias:
  desenvolvimento:
    - "Node.js e npm"
    - "Vite e TypeScript"
    - "Python e ambiente virtual"
    - "Django e Django REST Framework"
    - "Git e GitHub"
  producao:
    - "Hospedagem do frontend"
    - "Hospedagem do backend"
    - "PostgreSQL"
    - "Domínio e HTTPS, quando aplicável"

definicao_de_pronto:
  - "Requisito implementado e associado a critério de aceitação."
  - "Testes relevantes aprovados localmente e na integração contínua."
  - "Código revisado, formatado e sem erros de lint ou tipagem."
  - "Interface testada por teclado e em tamanhos de tela definidos."
  - "Documentação e instruções de execução atualizadas."
  - "Nenhum segredo ou recurso sem licença adequada incluído no repositório."

questoes_em_aberto:
  - id: "QA-001"
    questao: "Qual será o nome definitivo e a identidade visual do portfólio?"
  - id: "QA-002"
    questao: "A autenticação usará sessão com cookie ou tokens?"
  - id: "QA-003"
    questao: "Quais navegadores e dispositivos serão obrigatórios na primeira versão?"
  - id: "QA-004"
    questao: "Os controles por toque e gamepad entram no MVP ou em uma versão posterior?"
  - id: "QA-005"
    questao: "Quais regras exatas de pontuação, dificuldade e conquistas serão adotadas por jogo?"
  - id: "QA-006"
    questao: "Qual será a estratégia de hospedagem e domínio?"
```

## Observação

Este documento representa a análise inicial do produto. As questões em aberto devem
ser decididas antes das respectivas funcionalidades entrarem em desenvolvimento.
Os identificadores devem ser preservados para permitir rastreabilidade entre requisitos,
issues, implementação e testes.
