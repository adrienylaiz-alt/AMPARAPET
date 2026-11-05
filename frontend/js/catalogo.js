// Vitrine pública: filtros + grade de cartões + paginação. Usada na home e em animais.html.
import * as api from "./api.js";
import { icone } from "./icons.js";
import { debounce, esc, htmlEstadoErro, montarPaginacao, rotulo } from "./ui.js";

const PORTES = ["PEQUENO", "MEDIO", "GRANDE"];

function cartao(animal) {
  const femea = animal.sexo === "FEMEA";
  const foto = animal.foto_principal;
  const href = `animal.html?id=${animal.id}`;
  const castrado = animal.castrado ? (femea ? "Castrada" : "Castrado") : (femea ? "Não castrada" : "Não castrado");
  const vacinado = animal.vacinado ? (femea ? "Vacinada" : "Vacinado") : (femea ? "Não vacinada" : "Não vacinado");
  const item = (ok, texto) => `<span class="selo-saude ${ok ? "ok" : "nao"}">${icone(ok ? "certo" : "errado")}${texto}</span>`;
  const status = animal.status === "EM_PROCESSO"
    ? `<span class="selo-status selo-status--processo">${icone("pata")}Em processo</span>`
    : `<span class="selo-status">${icone("pata")}Disponível</span>`;
  return `<article class="cartao-animal">
    <a class="cartao-animal__foto" href="${href}" tabindex="-1" aria-hidden="true">
      ${foto
        ? `<img src="${esc(foto.miniatura_url)}" alt="" loading="lazy">`
        : `<span class="cartao-animal__sem-foto">${icone("pata")}</span>`}
      ${status}
    </a>
    <div class="cartao-animal__corpo">
      <h3 class="cartao-animal__nome">${esc(animal.nome)}</h3>
      <p class="cartao-animal__meta">${icone(animal.especie === "GATO" ? "gato" : "cao")}<span>${esc(rotulo("especie", animal.especie))}</span><i aria-hidden="true">·</i><span>${esc(rotulo("porte", animal.porte))} porte</span></p>
      <p class="cartao-animal__saude">${item(animal.castrado, castrado)}${item(animal.vacinado, vacinado)}</p>
      <a class="btn btn--contorno-verde btn--p" href="${href}">Ver detalhes<span class="sr-only"> de ${esc(animal.nome)}</span></a>
    </div>
  </article>`;
}

const esqueleto = (n) => Array.from({ length: n }, () => `<div class="cartao-animal cartao-animal--carregando" aria-hidden="true"><div class="cartao-animal__foto"></div><div class="cartao-animal__corpo"><i></i><i></i><i></i></div></div>`).join("");

/**
 * @param {HTMLElement} raiz  elemento onde o catálogo é montado
 * @param {{porPagina:number, sincronizarUrl?:boolean, paginar?:boolean, titulo?:string, linkVerTodos?:boolean}} opcoes
 */
export function iniciarCatalogo(raiz, { porPagina, sincronizarUrl = false, paginar = false, titulo = "Animais disponíveis:", linkVerTodos = false }) {
  const estado = { busca: "", especie: "", portes: [], castrado: false, vacinado: false, pagina: 1 };

  if (sincronizarUrl) {
    const q = new URLSearchParams(location.search);
    estado.busca = q.get("busca") || "";
    estado.especie = ["CAO", "GATO"].includes(q.get("especie")) ? q.get("especie") : "";
    estado.portes = q.getAll("porte").filter((p) => PORTES.includes(p));
    estado.castrado = q.get("castrado") === "true";
    estado.vacinado = q.get("vacinado") === "true";
    estado.pagina = Math.max(1, Number(q.get("pagina")) || 1);
  }

  raiz.innerHTML = `
    <form class="filtros" role="search" aria-label="Filtros de animais" novalidate>
      <div class="filtros__linha">
        <label class="filtros__busca">
          <span class="sr-only">Buscar por nome, raça ou palavra-chave</span>
          ${icone("busca")}
          <input type="search" id="busca" name="busca" placeholder="Buscar por nome, raça ou cor…" autocomplete="off" maxlength="80">
        </label>
        <div class="filtros__grupo" role="group" aria-label="Espécie">
          <button type="button" class="chip chip--forte" data-especie="">${icone("pata")}Todos</button>
          <button type="button" class="chip chip--contorno" data-especie="CAO">${icone("cao")}Cachorros</button>
          <button type="button" class="chip chip--contorno" data-especie="GATO">${icone("gato")}Gatos</button>
        </div>
        <div class="filtros__grupo filtros__portes" role="group" aria-label="Porte">
          <span class="filtros__rotulo">Porte:</span>
          ${PORTES.map((p) => `<button type="button" class="chip chip--contorno" data-porte="${p}" aria-pressed="false">${rotulo("porte", p)}</button>`).join("")}
        </div>
      </div>
      <div class="filtros__linha filtros__linha--extra">
        <button type="button" class="chip chip--cinza" data-alternar="castrado" aria-pressed="false">Castrado</button>
        <button type="button" class="chip chip--cinza" data-alternar="vacinado" aria-pressed="false">Vacinado</button>
        <button type="button" class="filtros__limpar" id="limpar">Limpar filtros ${icone("atualizar")}</button>
      </div>
    </form>
    <div class="catalogo__cabecalho">
      <h2 class="catalogo__titulo" id="titulo-catalogo">${esc(titulo)}</h2>
      ${linkVerTodos ? `<a class="catalogo__ver-todos" id="ver-todos" href="animais.html">ver todos ${icone("setaDir")}</a>` : `<p class="catalogo__total" id="total" aria-live="polite"></p>`}
    </div>
    <div class="catalogo__grade" id="grade" aria-live="polite" aria-busy="true"></div>
    <div id="paginacao"></div>`;

  const campoBusca = raiz.querySelector("#busca");
  const grade = raiz.querySelector("#grade");
  const total = raiz.querySelector("#total");
  campoBusca.value = estado.busca;

  function refletirControles() {
    raiz.querySelectorAll("[data-especie]").forEach((b) => {
      const ativo = b.dataset.especie === estado.especie;
      b.classList.toggle("chip--forte", ativo);
      b.classList.toggle("chip--contorno", !ativo);
      b.setAttribute("aria-pressed", String(ativo));
    });
    raiz.querySelectorAll("[data-porte]").forEach((b) => {
      const ativo = estado.portes.includes(b.dataset.porte);
      b.classList.toggle("chip--forte", ativo);
      b.classList.toggle("chip--contorno", !ativo);
      b.setAttribute("aria-pressed", String(ativo));
    });
    raiz.querySelectorAll("[data-alternar]").forEach((b) => {
      const ativo = estado[b.dataset.alternar];
      b.classList.toggle("chip--forte", ativo);
      b.classList.toggle("chip--cinza", !ativo);
      b.setAttribute("aria-pressed", String(ativo));
    });
  }

  function atualizarUrl() {
    if (!sincronizarUrl) return;
    const q = new URLSearchParams();
    if (estado.busca) q.set("busca", estado.busca);
    if (estado.especie) q.set("especie", estado.especie);
    estado.portes.forEach((p) => q.append("porte", p));
    if (estado.castrado) q.set("castrado", "true");
    if (estado.vacinado) q.set("vacinado", "true");
    if (estado.pagina > 1) q.set("pagina", estado.pagina);
    history.replaceState(null, "", location.pathname + (q.size ? `?${q}` : ""));
  }

  let requisicao = 0;
  async function carregar() {
    const atual = ++requisicao;
    refletirControles();
    atualizarUrl();
    grade.setAttribute("aria-busy", "true");
    grade.innerHTML = esqueleto(porPagina > 4 ? Math.min(porPagina, 8) : porPagina);
    try {
      const dados = await api.listarAnimais({
        busca: estado.busca || undefined,
        especie: estado.especie || undefined,
        porte: estado.portes,
        castrado: estado.castrado ? true : undefined,
        vacinado: estado.vacinado ? true : undefined,
        pagina: estado.pagina,
        por_pagina: porPagina,
      });
      if (atual !== requisicao) return; // chegou uma resposta mais nova
      if (dados.itens.length === 0 && dados.total > 0 && estado.pagina > 1) {
        estado.pagina = 1;
        return carregar();
      }
      grade.setAttribute("aria-busy", "false");
      if (total) total.textContent = dados.total === 1 ? "1 animal encontrado" : `${dados.total} animais encontrados`;
      if (dados.itens.length === 0) {
        grade.innerHTML = `<div class="estado-vazio"><span>${icone("pata")}</span>
          <h3>Nenhum animal encontrado</h3>
          <p>Não há animais com esses filtros no momento. Tente mudar a busca ou limpar os filtros.</p>
          <button type="button" class="btn btn--contorno-verde btn--p" data-limpar>Limpar filtros</button></div>`;
      } else {
        grade.innerHTML = dados.itens.map(cartao).join("");
      }
      raiz.querySelector("#paginacao").innerHTML = paginar ? montarPaginacao(dados.pagina, dados.total, dados.por_pagina) : "";
    } catch (e) {
      if (atual !== requisicao) return;
      grade.setAttribute("aria-busy", "false");
      grade.innerHTML = htmlEstadoErro("Não foi possível carregar os animais", e.message,
        `<button type="button" class="btn btn--contorno-verde btn--p" data-tentar>Tentar de novo</button>`);
    }
  }

  function filtrar(mudanca) {
    Object.assign(estado, mudanca, { pagina: 1 });
    carregar();
  }
  function limpar() {
    campoBusca.value = "";
    filtrar({ busca: "", especie: "", portes: [], castrado: false, vacinado: false });
  }

  campoBusca.addEventListener("input", debounce(() => filtrar({ busca: campoBusca.value.trim() }), 350));
  raiz.querySelector("form").addEventListener("submit", (e) => e.preventDefault());
  raiz.addEventListener("click", (e) => {
    const alvo = e.target.closest("button");
    if (!alvo) return;
    if ("especie" in alvo.dataset) filtrar({ especie: alvo.dataset.especie });
    else if (alvo.dataset.porte) {
      const p = alvo.dataset.porte;
      filtrar({ portes: estado.portes.includes(p) ? estado.portes.filter((x) => x !== p) : [...estado.portes, p] });
    } else if (alvo.dataset.alternar) filtrar({ [alvo.dataset.alternar]: !estado[alvo.dataset.alternar] });
    else if (alvo.id === "limpar" || "limpar" in alvo.dataset) limpar();
    else if ("tentar" in alvo.dataset) carregar();
    else if (alvo.dataset.pagina) {
      estado.pagina = Number(alvo.dataset.pagina);
      carregar().then(() => raiz.querySelector("#titulo-catalogo").scrollIntoView({ behavior: "smooth", block: "start" }));
    }
  });

  if (location.hash === "#busca") campoBusca.focus();
  return carregar();
}
