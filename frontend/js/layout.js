// Estrutura comum das páginas: cabeçalho e rodapé do site, e a casca da área administrativa.
import * as api from "./api.js";
import { icone, logo } from "./icons.js";
import { esc, formatarTelefone, mostrarAvisoPendente } from "./ui.js";

// ---------- Rodapé (dados reais do abrigo vindos da API) ----------

function linkInstagram(valor) {
  const v = String(valor || "").trim();
  if (!v) return "";
  if (/^https?:\/\//i.test(v)) return v;
  return `https://instagram.com/${v.replace(/^@/, "")}`;
}

export async function montarRodape(alvo) {
  let abrigo = null;
  try {
    abrigo = await api.obterAbrigo();
  } catch { /* o rodapé continua só com a marca se a API estiver fora */ }

  const endereco = abrigo
    ? `<div class="rodape__bloco rodape__endereco">
        <span class="rodape__pino">${icone("local")}</span>
        <div><strong>Endereço do abrigo:</strong>
        <p>${esc(abrigo.endereco)}<br>${esc(abrigo.cidade)}</p></div>
      </div>` : "";
  const telefone = abrigo?.whatsapp ? formatarTelefone(abrigo.whatsapp) : "";
  const digitos = String(abrigo?.whatsapp || "").replace(/\D/g, ""); // para o link tel:
  const contato = abrigo
    ? `<div class="rodape__bloco rodape__contato">
        <strong>Contato:</strong>
        ${telefone ? `<p><a href="tel:+${digitos}">${icone("telefone")} ${esc(telefone)}</a></p>
        <p><a href="https://wa.me/${esc(abrigo.whatsapp)}" target="_blank" rel="noopener">${icone("whatsapp")} Chamar no WhatsApp</a></p>` : ""}
        ${abrigo.horario_funcionamento ? `<p>${esc(abrigo.horario_funcionamento)}</p>` : ""}
      </div>` : "";
  const insta = abrigo ? linkInstagram(abrigo.instagram) : "";
  const redes = [
    abrigo?.whatsapp ? `<a href="https://wa.me/${esc(abrigo.whatsapp)}" target="_blank" rel="noopener" aria-label="WhatsApp">${icone("whatsapp")}</a>` : "",
    insta ? `<a href="${esc(insta)}" target="_blank" rel="noopener" aria-label="Instagram">${icone("instagram")}</a>` : "",
  ].join("");

  alvo.className = "rodape";
  alvo.id = "contato";
  // .container dá ao rodapé a mesma largura e as mesmas margens laterais do conteúdo das páginas.
  alvo.innerHTML = `<div class="rodape__interno container">
    <div class="rodape__marca">${logo({ claro: true, tagline: true })}</div>
    ${endereco}${contato}
    ${redes ? `<div class="rodape__bloco rodape__redes"><strong>Siga-nos</strong><div>${redes}</div></div>` : ""}
  </div>`;
}

// ---------- Site público ----------

const NAV_PUBLICO = [
  { id: "inicio", rotulo: "Início", href: "index.html" },
  { id: "animais", rotulo: "Animais", href: "animais.html" },
  { id: "como-adotar", rotulo: "Como adotar", href: "como-adotar.html" },
  { id: "contato", rotulo: "Contato", href: "#contato" },
];

// Cabeçalho do site público. `ativo` marca o link da página atual (aria-current + sublinhado de .cabecalho--simples).
export function montarCabecalho(alvo, { ativo } = {}) {
  const links = NAV_PUBLICO.map((l) =>
    `<a href="${l.href}" class="${l.id === ativo ? "ativo" : ""}"${l.id === ativo ? ' aria-current="page"' : ""}>${l.rotulo}</a>`).join("");
  const acoes = `
    <a class="cabecalho__busca" href="animais.html#busca" aria-label="Buscar animais">${icone("busca")}</a>
    <a class="btn btn--verde btn--p cabecalho__acao" href="animais.html">${icone("pata")} Ver animais</a>
    <a class="btn btn--escuro btn--p" href="admin/login.html">${icone("usuario")} Área administrativa</a>`;

  alvo.className = "cabecalho cabecalho--simples";
  alvo.innerHTML = `<div class="cabecalho__interno">
    <a class="cabecalho__logo" href="index.html" aria-label="AmparaPet — página inicial">
      ${logo()}
      <span class="logo__texto"><span class="logo__ampara">Ampara</span><span class="logo__pet">Pet</span></span>
    </a>
    <button type="button" class="cabecalho__menu" aria-label="Abrir menu" aria-expanded="false" aria-controls="nav-publico">${icone("menu")}</button>
    <nav class="cabecalho__nav" id="nav-publico" aria-label="Principal">${links}</nav>
    <div class="cabecalho__acoes">${acoes}</div>
  </div>`;

  // Menu hambúrguer (telas até 1180px, ver site.css): abre e fecha pelo botão, ao escolher um link e com a tecla Esc.
  const botao = alvo.querySelector(".cabecalho__menu");
  const alternar = (abrir) => {
    alvo.classList.toggle("cabecalho--aberto", abrir);
    botao.setAttribute("aria-expanded", String(abrir));
  };
  botao.addEventListener("click", () => alternar(!alvo.classList.contains("cabecalho--aberto")));
  alvo.querySelectorAll(".cabecalho__nav a").forEach((a) => a.addEventListener("click", () => alternar(false)));
  document.addEventListener("keydown", (e) => { if (e.key === "Escape") alternar(false); });
}

export function iniciarSite({ ativo } = {}) {
  montarCabecalho(document.getElementById("cabecalho"), { ativo });
  const rodape = montarRodape(document.getElementById("rodape"));
  mostrarAvisoPendente();
  return rodape;
}

// ---------- Área administrativa ----------

const NAV_ADMIN = [
  { id: "dashboard", rotulo: "Dashboard", href: "index.html", icone: "painel" },
  { id: "animais", rotulo: "Animais", href: "animais.html", icone: "animais" },
  { id: "cadastrar", rotulo: "Cadastrar", href: "animal.html", icone: "cadastrar" },
  { id: "relatorios", rotulo: "Relatórios", href: "relatorios.html", icone: "relatorios" },
  { id: "configuracoes", rotulo: "Configurações", href: "configuracoes.html", icone: "engrenagem" },
  { id: "site", rotulo: "Ver site", href: "../index.html", icone: "inicio" },
];

export async function sairDoSistema() {
  try { await api.sair(); } catch { /* sessão já inválida: segue para o login */ }
  api.limparToken();
  location.href = "login.html";
}

// Monta barra lateral, topo e rodapé. Exige login. Devolve o <main> onde a página escreve.
export async function iniciarAdmin(ativo) {
  if (!api.obterToken()) {
    location.replace("login.html");
    return new Promise(() => {}); // interrompe a página enquanto redireciona
  }
  const itens = NAV_ADMIN.map((l) =>
    `<a href="${l.href}" class="lateral__item${l.id === ativo ? " ativo" : ""}"${l.id === ativo ? ' aria-current="page"' : ""}>${icone(l.icone)}<span>${l.rotulo}</span></a>`).join("");

  document.body.classList.add("admin");
  document.body.innerHTML = `
    <a class="pular-para-conteudo" href="#conteudo">Ir para o conteúdo</a>
    <aside class="lateral" id="lateral" aria-label="Menu administrativo">
      <a class="lateral__logo" href="index.html" aria-label="AmparaPet — dashboard">
        ${logo({ claro: true })}
        <span class="logo__texto"><span class="logo__ampara">Ampara</span><span class="logo__pet">Pet</span></span>
      </a>
      <nav class="lateral__nav">${itens}</nav>
      <button type="button" class="lateral__item lateral__sair" id="btn-sair">${icone("sair")}<span>Sair</span></button>
    </aside>
    <div class="lateral__fundo" id="lateral-fundo" hidden></div>
    <div class="admin__coluna">
      <header class="topo">
        <button type="button" class="topo__menu" id="btn-menu" aria-label="Abrir menu" aria-expanded="false" aria-controls="lateral">${icone("menu")}</button>
        <div class="topo__perfil">
          <button type="button" class="topo__usuario" id="btn-perfil" aria-haspopup="menu" aria-expanded="false">
            <span id="nome-usuario">Admin</span>${icone("chevDuplo")}
          </button>
          <span class="topo__avatar">${icone("usuario")}</span>
          <div class="topo__menu-perfil" id="menu-perfil" role="menu" hidden>
            <a role="menuitem" href="configuracoes.html">${icone("engrenagem")} Configurações</a>
            <button type="button" role="menuitem" id="btn-sair-topo">${icone("sair")} Sair</button>
          </div>
        </div>
      </header>
      <main class="admin__principal" id="conteudo" tabindex="-1"></main>
      <footer id="rodape"></footer>
    </div>`;

  const lateral = document.getElementById("lateral");
  const fundo = document.getElementById("lateral-fundo");
  const botaoMenu = document.getElementById("btn-menu");
  const alternarMenu = (abrir) => {
    lateral.classList.toggle("aberta", abrir);
    fundo.hidden = !abrir;
    botaoMenu.setAttribute("aria-expanded", String(abrir));
    document.body.classList.toggle("sem-rolagem", abrir);
  };
  botaoMenu.addEventListener("click", () => alternarMenu(!lateral.classList.contains("aberta")));
  fundo.addEventListener("click", () => alternarMenu(false));
  document.addEventListener("keydown", (e) => { if (e.key === "Escape") { alternarMenu(false); fecharPerfil(); } });

  const botaoPerfil = document.getElementById("btn-perfil");
  const menuPerfil = document.getElementById("menu-perfil");
  function fecharPerfil() {
    menuPerfil.hidden = true;
    botaoPerfil.setAttribute("aria-expanded", "false");
  }
  botaoPerfil.addEventListener("click", (e) => {
    e.stopPropagation();
    menuPerfil.hidden = !menuPerfil.hidden;
    botaoPerfil.setAttribute("aria-expanded", String(!menuPerfil.hidden));
  });
  document.addEventListener("click", fecharPerfil);
  document.getElementById("btn-sair").addEventListener("click", sairDoSistema);
  document.getElementById("btn-sair-topo").addEventListener("click", sairDoSistema);

  montarRodape(document.getElementById("rodape"));
  mostrarAvisoPendente();

  try {
    const usuario = await api.usuarioLogado();
    document.getElementById("nome-usuario").textContent = usuario.nome;
  } catch (e) {
    if (e.status !== 401) document.getElementById("nome-usuario").textContent = "Admin";
  }
  return document.getElementById("conteudo");
}
