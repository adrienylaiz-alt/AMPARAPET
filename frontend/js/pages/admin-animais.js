// Gerenciamento de animais: busca, filtros, paginação e exclusão.
// GET /api/admin/animais  ·  DELETE /api/admin/animais/{id}
import * as api from "../api.js";
import { iniciarAdmin } from "../layout.js";
import { icone } from "../icons.js";
import { avisar, confirmarExclusao, esc, etiquetaStatus, htmlEstadoErro, miniatura, montarPaginacao, rotulo, ROTULOS } from "../ui.js";

const POR_PAGINA = 10;
const main = await iniciarAdmin("animais");

const consulta = new URLSearchParams(location.search);
const estado = {
  busca: consulta.get("busca") || "",
  status: ROTULOS.status[consulta.get("status")] ? consulta.get("status") : "",
  porte: ROTULOS.porte[consulta.get("porte")] ? consulta.get("porte") : "",
  pagina: Math.max(1, Number(consulta.get("pagina")) || 1),
};

const opcoes = (tipo, vazio) => `<option value="">${vazio}</option>` +
  Object.entries(ROTULOS[tipo]).map(([v, r]) => `<option value="${v}">${r}</option>`).join("");

main.innerHTML = `
  <div class="admin__cabecalho">
    <h1 class="admin__titulo">Animais</h1>
    <a class="btn btn--acao btn--grande" href="animal.html">${icone("mais")} Cadastrar animal</a>
  </div>
  <form class="filtros-admin" id="form-filtros" role="search" aria-label="Filtrar animais">
    <label class="filtros-admin__busca">
      <span class="sr-only">Buscar por nome, raça ou cor</span>${icone("busca")}
      <input type="search" id="f-busca" placeholder="Buscar por nome, raça ou cor…" maxlength="80" autocomplete="off">
    </label>
    <div class="campo"><label class="sr-only" for="f-status">Status</label><select id="f-status">${opcoes("status", "Todos os status")}</select></div>
    <div class="campo"><label class="sr-only" for="f-porte">Porte</label><select id="f-porte">${opcoes("porte", "Todos os portes")}</select></div>
    <button type="submit" class="btn btn--acao btn--grande">${icone("funil")} Filtrar</button>
  </form>
  <section class="painel-cartao" aria-labelledby="t-lista">
    <div class="painel-cartao__topo">
      <h2 id="t-lista">Animais recentes</h2>
      <p class="painel-cartao__total" id="total" aria-live="polite"></p>
    </div>
    <div class="tabela-rolagem" id="lista" aria-live="polite" aria-busy="true"></div>
    <div id="paginacao"></div>
  </section>`;

const campoBusca = document.getElementById("f-busca");
const campoStatus = document.getElementById("f-status");
const campoPorte = document.getElementById("f-porte");
const lista = document.getElementById("lista");
campoBusca.value = estado.busca;
campoStatus.value = estado.status;
campoPorte.value = estado.porte;

function atualizarUrl() {
  const q = new URLSearchParams();
  if (estado.busca) q.set("busca", estado.busca);
  if (estado.status) q.set("status", estado.status);
  if (estado.porte) q.set("porte", estado.porte);
  if (estado.pagina > 1) q.set("pagina", estado.pagina);
  history.replaceState(null, "", location.pathname + (q.size ? `?${q}` : ""));
}

function linhas(itens) {
  return itens.map((a) => `<tr>
    <td data-rotulo="Foto">${miniatura(a)}</td>
    <td data-rotulo="Nome" class="tabela__nome">${esc(a.nome)}</td>
    <td data-rotulo="Espécie">${esc(rotulo("especie", a.especie))}</td>
    <td data-rotulo="Raça">${esc(a.raca)}</td>
    <td data-rotulo="Porte">${esc(rotulo("porte", a.porte))}</td>
    <td data-rotulo="Status">${etiquetaStatus(a.status)}</td>
    <td data-rotulo="Ações"><div class="acoes">
      <a class="acao" href="animal.html?id=${a.id}" aria-label="Editar ${esc(a.nome)}" title="Editar">${icone("lapis")}</a>
      <a class="acao" href="../animal.html?id=${a.id}" target="_blank" rel="noopener" aria-label="Ver página pública de ${esc(a.nome)}" title="Ver página pública">${icone("olho")}</a>
      <button type="button" class="acao" data-excluir="${a.id}" data-nome="${esc(a.nome)}" aria-label="Excluir ${esc(a.nome)}" title="Excluir">${icone("lixeira")}</button>
    </div></td></tr>`).join("");
}

let requisicao = 0;
async function carregar() {
  const atual = ++requisicao;
  atualizarUrl();
  lista.setAttribute("aria-busy", "true");
  lista.innerHTML = `<p class="carregando">Carregando…</p>`;
  try {
    const dados = await api.listarAnimaisAdmin({
      busca: estado.busca || undefined,
      status: estado.status || undefined,
      porte: estado.porte || undefined,
      pagina: estado.pagina,
      por_pagina: POR_PAGINA,
    });
    if (atual !== requisicao) return;
    // a última linha da última página foi excluída: volta uma página
    if (!dados.itens.length && dados.total > 0 && estado.pagina > 1) {
      estado.pagina = Math.ceil(dados.total / POR_PAGINA);
      return carregar();
    }
    lista.setAttribute("aria-busy", "false");
    document.getElementById("total").textContent = dados.total === 1 ? "1 animal" : `${dados.total} animais`;
    if (!dados.itens.length) {
      const filtrado = estado.busca || estado.status || estado.porte;
      lista.innerHTML = `<div class="estado-vazio"><span>${icone("pata")}</span>
        <h3>${filtrado ? "Nenhum animal encontrado" : "Nenhum animal cadastrado"}</h3>
        <p>${filtrado ? "Nenhum cadastro corresponde à busca. Tente outros filtros." : "Cadastre o primeiro animal do abrigo."}</p>
        ${filtrado ? "" : `<a class="btn btn--acao btn--p" href="animal.html">Cadastrar animal</a>`}</div>`;
      document.getElementById("paginacao").innerHTML = "";
      return;
    }
    lista.innerHTML = `<table class="tabela tabela--empilhavel">
      <thead><tr><th scope="col">Foto</th><th scope="col">Nome</th><th scope="col">Espécie</th><th scope="col">Raça</th><th scope="col">Porte</th><th scope="col">Status</th><th scope="col">Ações</th></tr></thead>
      <tbody>${linhas(dados.itens)}</tbody></table>`;
    document.getElementById("paginacao").innerHTML = montarPaginacao(dados.pagina, dados.total, POR_PAGINA, { primeira: true });
  } catch (e) {
    if (atual !== requisicao) return;
    lista.setAttribute("aria-busy", "false");
    lista.innerHTML = htmlEstadoErro("Não foi possível carregar os animais", e.message,
      `<button type="button" class="btn btn--contorno btn--p" data-tentar>Tentar de novo</button>`);
  }
}

document.getElementById("form-filtros").addEventListener("submit", (e) => {
  e.preventDefault();
  Object.assign(estado, { busca: campoBusca.value.trim(), status: campoStatus.value, porte: campoPorte.value, pagina: 1 });
  carregar();
});

main.addEventListener("click", (e) => {
  const botao = e.target.closest("button");
  if (!botao) return;
  if (botao.dataset.pagina) {
    estado.pagina = Number(botao.dataset.pagina);
    carregar().then(() => document.getElementById("t-lista").scrollIntoView({ behavior: "smooth", block: "start" }));
  } else if ("tentar" in botao.dataset) {
    carregar();
  } else if (botao.dataset.excluir) {
    const id = Number(botao.dataset.excluir);
    const nome = botao.dataset.nome;
    confirmarExclusao({
      nome,
      aoConfirmar: async () => {
        await api.excluirAnimal(id);
        avisar(`${nome} foi excluído.`);
        carregar();
      },
    });
  }
});

carregar();
