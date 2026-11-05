// Dashboard: GET /api/admin/painel (totais) e GET /api/admin/animais (recentes).
import * as api from "../api.js";
import { iniciarAdmin } from "../layout.js";
import { icone } from "../icons.js";
import { esc, etiquetaStatus, htmlEstadoErro, miniatura, rotulo } from "../ui.js";

const main = await iniciarAdmin("dashboard");

const INDICADORES = [
  { chave: "total", titulo: "Total de animais", icone: "pata", classe: "preenchido" },
  { chave: "disponiveis", titulo: "Disponíveis", icone: "coracao", classe: "preenchido" },
  { chave: "em_processo", titulo: "Em processo de adoção", icone: "relogio", classe: "contorno" },
  { chave: "adotados", titulo: "Adotados", icone: "selo", classe: "contorno" },
];

main.innerHTML = `
  <h1 class="admin__titulo">Dashboard</h1>
  <section class="indicadores" aria-label="Indicadores" id="indicadores">
    ${INDICADORES.map((i) => `<article class="indicador">
      <span class="indicador__icone indicador__icone--${i.classe}">${icone(i.icone)}</span>
      <h2>${i.titulo}</h2>
      <p class="indicador__valor" data-chave="${i.chave}">—</p></article>`).join("")}
  </section>
  <section class="painel-cartao acesso" aria-labelledby="t-acesso">
    <h2 id="t-acesso">Acesso rápido</h2>
    <div class="acesso__itens">
      <a class="acesso__item" href="animal.html"><span class="acesso__icone">${icone("mais")}</span><span><strong>Cadastrar novo animal</strong>Adicione um novo pet ao sistema</span></a>
      <a class="acesso__item" href="animais.html"><span class="acesso__icone">${icone("lista")}</span><span><strong>Gerenciar animais</strong>Visualize e edite os cadastros</span></a>
    </div>
  </section>
  <section class="painel-cartao" aria-labelledby="t-recentes">
    <div class="painel-cartao__topo">
      <h2 id="t-recentes">Animais recentes</h2>
      <a class="link-ver-todos" href="animais.html">Ver todos ${icone("setaDir")}</a>
    </div>
    <div class="tabela-rolagem" id="recentes" aria-live="polite" aria-busy="true"></div>
  </section>`;

const areaRecentes = document.getElementById("recentes");

function erroNaArea(area, e, aoTentar) {
  area.setAttribute("aria-busy", "false");
  area.innerHTML = htmlEstadoErro("Não foi possível carregar", e.message,
    `<button type="button" class="btn btn--contorno btn--p">Tentar de novo</button>`);
  area.querySelector("button").addEventListener("click", aoTentar);
}

async function carregarIndicadores() {
  try {
    const painel = await api.obterPainel();
    document.querySelectorAll("[data-chave]").forEach((el) => { el.textContent = painel[el.dataset.chave]; });
  } catch (e) {
    document.getElementById("indicadores").insertAdjacentHTML("afterend",
      `<p class="aviso-inline" role="alert">Não foi possível carregar os indicadores: ${esc(e.message)}</p>`);
  }
}

async function carregarRecentes() {
  areaRecentes.setAttribute("aria-busy", "true");
  areaRecentes.innerHTML = `<p class="carregando">Carregando…</p>`;
  try {
    const { itens } = await api.listarAnimaisAdmin({ por_pagina: 5 });
    areaRecentes.setAttribute("aria-busy", "false");
    if (!itens.length) {
      areaRecentes.innerHTML = `<div class="estado-vazio"><span>${icone("pata")}</span><h3>Nenhum animal cadastrado</h3>
        <p>Cadastre o primeiro animal para ele aparecer aqui.</p><a class="btn btn--acao btn--p" href="animal.html">Cadastrar animal</a></div>`;
      return;
    }
    areaRecentes.innerHTML = `<table class="tabela tabela--empilhavel">
      <thead><tr><th scope="col">Foto</th><th scope="col">Nome</th><th scope="col">Espécie</th><th scope="col">Porte</th><th scope="col">Status</th></tr></thead>
      <tbody>${itens.map((a) => `<tr>
        <td data-rotulo="Foto">${miniatura(a)}</td>
        <td data-rotulo="Nome"><a href="animal.html?id=${a.id}">${esc(a.nome)}</a></td>
        <td data-rotulo="Espécie">${esc(rotulo("especie", a.especie))}</td>
        <td data-rotulo="Porte">${esc(rotulo("porte", a.porte))}</td>
        <td data-rotulo="Status">${etiquetaStatus(a.status)}</td></tr>`).join("")}</tbody></table>`;
  } catch (e) {
    erroNaArea(areaRecentes, e, carregarRecentes);
  }
}

carregarIndicadores();
carregarRecentes();
