import './style.css'
import { catalog, setupPlayground } from './playground'
import { setupAccount, setupRanking } from './account'

type PageId = 'cadastro' | 'jogos'

const options = catalog.map(g => `<option value="${g.slug}">${g.name}</option>`).join('')
document.querySelector<HTMLDivElement>('#app')!.innerHTML = `
<a class="skip" href="#main">Pular para o conteúdo</a>
<header>
  <a class="brand" href="#cadastro" data-page-link="cadastro">DG<span> / playground</span></a>
  <nav aria-label="Navegação principal">
    <a href="#cadastro" data-page-link="cadastro">Cadastro</a>
    <a href="#jogos" data-page-link="jogos">Jogos</a>
  </nav>
</header>
<main id="main">
  <div id="page-cadastro" class="page" data-page="cadastro">
    <section id="conta">
      <p class="eyebrow">CADASTRO E CONTA</p>
      <h2>Guarde suas conquistas.</h2>
      <p id="account-message" role="status"></p>
      <form id="auth-form">
        <label>Nome de usuário<input name="username" autocomplete="username" required minlength="3" maxlength="30"></label>
        <label>E-mail (para cadastro)<input name="email" type="email" autocomplete="email" maxlength="254"></label>
        <label>Senha<input name="password" type="password" autocomplete="current-password" required maxlength="128"></label>
        <div class="actions"><button type="submit" id="login">Entrar</button><button type="submit" id="register">Criar conta</button><a class="button secondary" href="#jogos" data-page-link="jogos">Ir para Jogos ↗</a></div>
      </form>
      <button id="logout" hidden>Sair da conta</button>
      <div id="profile" hidden>
        <h3 id="username"></h3>
        <h4>Recordes pessoais</h4>
        <ul id="records"></ul>
        <h4>Conquistas</h4>
        <ul id="achievements"></ul>
        <details><summary>Últimas 20 partidas registradas</summary><ul id="history"></ul></details>
      </div>
      <details><summary>Como seus dados são usados</summary><p>O cadastro usa nome de usuário, e-mail e senha protegida por hash. O ranking publica apenas nome de usuário, pontuação e data. O cookie de sessão mantém sua conta conectada por até 12 horas; o cookie CSRF protege ações da conta. Som e volume ficam apenas no seu navegador. Não há publicidade ou rastreadores externos.</p><p>Os resultados passam por verificações de plausibilidade e podem ser invalidados pelo administrador. Redefinição de senha por e-mail ainda não está disponível.</p></details>
    </section>
  </div>

  <div id="page-jogos" class="page" data-page="jogos" hidden>
    <section id="projetos">
      <p class="eyebrow">01 / PROJETOS</p>
      <h2>Pequenos jogos. Grandes desafios.</h2>
      <div class="cards">
        ${catalog.map(g => `<article><div class="art ${g.style}" role="img" aria-label="Ilustração geométrica de ${g.name}">${g.art}</div><span class="badge">JOGÁVEL</span><h3>${g.name}</h3><p>${g.description}</p><a class="button" data-game="${g.slug}" href="#snake">Jogar ${g.name} →</a><details><summary>Controles e projeto</summary><p>${g.controls}</p><p>${g.technical}</p></details></article>`).join('')}
      </div>
    </section>
    <section id="snake">
      <p class="eyebrow">02 / PLAYGROUND</p>
      <label for="game-select">Escolha o jogo</label>
      <select id="game-select">${options}</select>
      <h2 id="game-title">Vamos jogar Snake.</h2>
      <div class="playground">
        <div>
          <canvas id="board" width="500" height="500" tabindex="0" aria-label="Tabuleiro de Snake" aria-describedby="instructions">Seu navegador precisa suportar Canvas para jogar.</canvas>
          <p class="meta">A partida pausa ao sair desta área ou trocar de aba.</p>
        </div>
        <div class="panel">
          <p class="eyebrow">PONTUAÇÃO</p>
          <strong id="score">0</strong>
          <p id="status" role="status"></p>
          <p id="instructions"></p>
          <p><b>P</b> pausa ou retoma. Os botões abaixo também controlam o jogo.</p>
          <div class="actions"><button id="start">Iniciar</button><button id="pause" disabled>Pausar</button><button id="end" disabled>Encerrar</button></div>
          <div class="touch" aria-label="Controles de direção"><button data-dir="up" aria-label="Mover para cima ou girar peça">↑</button><div><button data-dir="left" aria-label="Mover para esquerda">←</button><button data-dir="down" aria-label="Mover para baixo">↓</button><button data-dir="right" aria-label="Mover para direita">→</button></div></div>
          <button id="special" hidden>Plantar bomba</button>
          <div class="audio"><label><input id="sound" type="checkbox"> Ativar sons</label><label for="volume">Volume</label><input id="volume" type="range" min="0" max="1" step=".05" value=".2"></div>
          <p id="online-message" class="meta">Jogue sem cadastro ou entre para registrar resultados.</p>
        </div>
      </div>
      <div id="results" class="results" role="region" aria-label="Envio dos resultados"></div>
    </section>
    <section id="ranking">
      <p class="eyebrow">03 / RANKING</p>
      <h2>Seu próximo recorde começa aqui.</h2>
      <div class="filters"><label>Jogo<select id="ranking-game">${options}</select></label><label>Período<select id="ranking-period"><option value="all">Geral</option><option value="day">Últimas 24 horas</option><option value="week">Últimos 7 dias</option></select></label><button id="ranking-refresh">Atualizar ranking</button></div>
      <p id="ranking-message" role="status"></p>
      <table><caption>Resultados por pontuação; empates favorecem o registro mais antigo.</caption><thead><tr><th scope="col">Posição</th><th scope="col">Jogador</th><th scope="col">Pontos</th></tr></thead><tbody id="ranking-rows"></tbody></table>
      <div class="actions"><button id="previous" disabled>Anterior</button><button id="next" disabled>Próxima</button></div>
    </section>
  </div>
</main>
<footer>Daniel Gomes <span>Portfolio Games · Feito para explorar</span></footer>
`

function resolvePage(): PageId {
  const hash = window.location.hash.replace(/^#/, '').toLowerCase()
  const path = window.location.pathname.replace(/^\/+|\/+$/g, '').toLowerCase()
  if (['jogos', 'projetos', 'snake', 'ranking'].includes(hash) || ['jogos', 'games'].includes(path)) return 'jogos'
  return 'cadastro'
}

function showPage(page: PageId) {
  document.querySelectorAll<HTMLElement>('[data-page]').forEach(section => {
    section.hidden = section.dataset.page !== page
  })
  document.querySelectorAll<HTMLAnchorElement>('header nav a[data-page-link]').forEach(link => {
    if (link.dataset.pageLink === page) link.setAttribute('aria-current', 'page')
    else link.removeAttribute('aria-current')
  })
}

document.querySelectorAll<HTMLAnchorElement>('[data-page-link]').forEach(link => {
  link.addEventListener('click', event => {
    event.preventDefault()
    const target = link.dataset.pageLink as PageId
    window.history.pushState(null, '', '#' + target)
    showPage(target)
    window.scrollTo({ top: 0 })
  })
})

window.addEventListener('hashchange', () => showPage(resolvePage()))
window.addEventListener('popstate', () => showPage(resolvePage()))
showPage(resolvePage())

setupPlayground(); setupAccount(); setupRanking()
