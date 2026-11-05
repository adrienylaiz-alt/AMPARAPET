// Relatórios: usa só o que a API oferece em GET /api/admin/painel
// (totais por status, cliques em "Tenho interesse" e animais mais procurados).
import * as api from "../api.js";
import { iniciarAdmin } from "../layout.js";
import { icone } from "../icons.js";
import { esc, htmlEstadoErro } from "../ui.js";

const main = await iniciarAdmin("relatorios");

main.innerHTML = `
  <h1 class="admin__titulo">Relatórios</h1>
  <div id="conteudo-relatorio" aria-live="polite" aria-busy="true"><p class="carregando">Carregando…</p></div>`;
const area = document.getElementById("conteudo-relatorio");

function desenhar(p) {
  const partes = [
    { chave: "disponiveis", rotulo: "Disponíveis", classe: "disponivel" },
    { chave: "em_processo", rotulo: "Em processo de adoção", classe: "processo" },
    { chave: "adotados", rotulo: "Adotados", classe: "adotado" },
  ];
  const maximo = Math.max(1, ...p.mais_procurados.map((a) => a.cliques));
  area.setAttribute("aria-busy", "false");
  area.innerHTML = `
    <section class="indicadores indicadores--tres">
      <article class="indicador"><span class="indicador__icone indicador__icone--preenchido">${icone("pata")}</span><h2>Total de animais</h2><p class="indicador__valor">${p.total}</p></article>
      <article class="indicador"><span class="indicador__icone indicador__icone--preenchido">${icone("coracao")}</span><h2>Cliques em “Tenho interesse”</h2><p class="indicador__valor">${p.cliques_interesse_total}</p></article>
      <article class="indicador"><span class="indicador__icone indicador__icone--contorno">${icone("selo")}</span><h2>Adotados</h2><p class="indicador__valor">${p.adotados}</p></article>
    </section>
    <section class="painel-cartao" aria-labelledby="t-situacao">
      <h2 id="t-situacao">Situação dos animais</h2>
      ${p.total === 0 ? `<p class="vazio-texto">Ainda não há animais cadastrados.</p>` : `
      <div class="barra-situacao" role="img" aria-label="${partes.map((x) => `${x.rotulo}: ${p[x.chave]}`).join("; ")}">
        ${partes.filter((x) => p[x.chave] > 0).map((x) => `<span class="barra-situacao__parte etiqueta--${x.classe}" style="flex:${p[x.chave]}">${p[x.chave]}</span>`).join("")}
      </div>
      <ul class="legenda">${partes.map((x) => `<li><span class="legenda__cor etiqueta--${x.classe}"></span>${x.rotulo}: <strong>${p[x.chave]}</strong> (${Math.round((p[x.chave] / p.total) * 100)}%)</li>`).join("")}</ul>`}
    </section>
    <section class="painel-cartao" aria-labelledby="t-procurados">
      <h2 id="t-procurados">Animais mais procurados</h2>
      ${p.mais_procurados.length === 0
        ? `<p class="vazio-texto">Nenhum clique em “Tenho interesse” registrado até agora.</p>`
        : `<ol class="ranking">${p.mais_procurados.map((a, i) => `<li>
            <span class="ranking__posicao">${i + 1}</span>
            <a href="animal.html?id=${a.id}">${esc(a.nome)}</a>
            <span class="ranking__barra"><span style="width:${Math.max(4, (a.cliques / maximo) * 100)}%"></span></span>
            <strong>${a.cliques} ${a.cliques === 1 ? "clique" : "cliques"}</strong></li>`).join("")}</ol>`}
    </section>`;
}

async function carregar() {
  try {
    desenhar(await api.obterPainel());
  } catch (e) {
    area.setAttribute("aria-busy", "false");
    area.innerHTML = htmlEstadoErro("Não foi possível carregar os relatórios", e.message,
      `<button type="button" class="btn btn--contorno btn--p">Tentar de novo</button>`);
    area.querySelector("button").addEventListener("click", carregar);
  }
}
carregar();
