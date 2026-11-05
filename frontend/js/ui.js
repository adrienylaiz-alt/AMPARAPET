// Utilidades de interface: textos, rótulos, avisos (toast), modal e formatação.
import { icone } from "./icons.js";

export function esc(texto) {
  return String(texto ?? "").replace(/[&<>"']/g, (c) => (
    { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]
  ));
}

export function debounce(fn, ms = 350) {
  let t;
  return (...args) => {
    clearTimeout(t);
    t = setTimeout(() => fn(...args), ms);
  };
}

// ---------- Rótulos (iguais aos do Figma) ----------

export const ROTULOS = {
  especie: { CAO: "Cachorro", GATO: "Gato" },
  porte: { PEQUENO: "Pequeno", MEDIO: "Médio", GRANDE: "Grande" },
  sexo: { MACHO: "Macho", FEMEA: "Fêmea" },
  status: { DISPONIVEL: "Disponível", EM_PROCESSO: "Em processo", ADOTADO: "Adotado" },
};
export const rotulo = (tipo, valor) => ROTULOS[tipo][valor] || valor;

export function classeStatus(status) {
  return { DISPONIVEL: "disponivel", EM_PROCESSO: "processo", ADOTADO: "adotado" }[status] || "";
}

export function etiquetaStatus(status) {
  return `<span class="etiqueta etiqueta--${classeStatus(status)}">${esc(rotulo("status", status))}</span>`;
}

export function miniatura(animal) {
  const foto = animal.fotos?.[0];
  return foto
    ? `<img class="miniatura" src="${esc(foto.miniatura_url)}" alt="Foto de ${esc(animal.nome)}" loading="lazy">`
    : `<span class="miniatura miniatura--vazia" role="img" aria-label="Sem foto">${icone("pata")}</span>`;
}

// ---------- Componentes compartilhados ----------

// Bloco de erro da página (estado vazio em vermelho). `acao` é HTML opcional: botão "Tentar de novo", link de voltar etc.
export function htmlEstadoErro(titulo, mensagem, acao = "") {
  return `<div class="estado-vazio estado-vazio--erro" role="alert"><span>${icone("errado")}</span>
    <h3>${esc(titulo)}</h3><p>${esc(mensagem)}</p>${acao}</div>`;
}

// Paginação numerada, com "…" nos intervalos. Os botões trazem data-pagina; quem usa escuta o clique e recarrega.
// `primeira: true` acrescenta o botão "Primeira página" (usado na lista administrativa).
export function montarPaginacao(pagina, total, porPagina, { primeira = false } = {}) {
  const ultima = Math.max(1, Math.ceil(total / porPagina));
  if (ultima <= 1) return "";
  const nums = [];
  for (let p = 1; p <= ultima; p++) {
    if (p === 1 || p === ultima || Math.abs(p - pagina) <= 1) nums.push(p);
    else if (nums[nums.length - 1] !== "…") nums.push("…");
  }
  const seta = (alvo, nomeIcone, rotuloAria, desativado) =>
    `<button type="button" class="paginacao__botao" data-pagina="${alvo}" ${desativado ? "disabled" : ""} aria-label="${rotuloAria}">${icone(nomeIcone)}</button>`;
  const numero = (p) =>
    `<button type="button" class="paginacao__botao${p === pagina ? " ativo" : ""}" data-pagina="${p}"${p === pagina ? ' aria-current="page"' : ""}>${p}</button>`;
  return `<nav class="paginacao" aria-label="Paginação">
    ${primeira ? seta(1, "chevEsq", "Primeira página", pagina <= 1) : ""}
    ${seta(pagina - 1, "chevEsq", "Página anterior", pagina <= 1)}
    ${nums.map((p) => (p === "…" ? `<span class="paginacao__pontos">…</span>` : numero(p))).join("")}
    ${seta(pagina + 1, "chevDir", "Próxima página", pagina >= ultima)}
  </nav>`;
}

// ---------- Formatação ----------

export function formatarTelefone(digitos) {
  const d = String(digitos || "").replace(/\D/g, "");
  const m = d.match(/^55(\d{2})(\d{4,5})(\d{4})$/);
  return m ? `(${m[1]}) ${m[2]}-${m[3]}` : d;
}

// "2 anos", "1 ano e 3 meses", "8 meses" ou só "3" (anos) -> data de nascimento aproximada (AAAA-MM-01).
// A API guarda a data, não a idade. Devolve null se o texto não for entendido.
export function idadeParaData(texto, hoje = new Date()) {
  const t = String(texto || "").trim().toLowerCase();
  if (!t) return null;
  if (/^menos de 1 m[eê]s$/.test(t)) return dataIso(hoje.getFullYear(), hoje.getMonth(), 1);
  let meses = 0;
  let reconhecido = false;
  if (/^\d+$/.test(t)) {
    meses = Number(t) * 12;
    reconhecido = true;
  } else {
    const resto = t.replace(/(\d+)\s*(anos?|a)\b/g, (_, n) => { meses += Number(n) * 12; reconhecido = true; return ""; })
      .replace(/(\d+)\s*(m[eê]s(?:es)?|m)\b/g, (_, n) => { meses += Number(n); reconhecido = true; return ""; });
    if (resto.replace(/[\s,e]+/g, "")) return null;
  }
  if (!reconhecido || meses > 40 * 12) return null;
  return dataIso(hoje.getFullYear(), hoje.getMonth() - meses, 1);
}

function dataIso(ano, mesZero, dia) {
  const d = new Date(ano, mesZero, dia);
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

// ---------- Avisos ----------

function areaAvisos() {
  let area = document.getElementById("avisos");
  if (!area) {
    area = document.createElement("div");
    area.id = "avisos";
    area.className = "avisos";
    area.setAttribute("aria-live", "polite");
    document.body.append(area);
  }
  return area;
}

export function avisar(mensagem, tipo = "sucesso", ms = 5000) {
  const item = document.createElement("div");
  item.className = `aviso aviso--${tipo}`;
  item.setAttribute("role", tipo === "erro" ? "alert" : "status");
  item.innerHTML = `${icone(tipo === "erro" ? "errado" : "certo")}<span>${esc(mensagem).replace(/\n/g, "<br>")}</span>
    <button type="button" class="aviso__fechar" aria-label="Fechar aviso">${icone("fechar")}</button>`;
  const remover = () => item.remove();
  item.querySelector("button").addEventListener("click", remover);
  areaAvisos().append(item);
  if (ms) setTimeout(remover, ms);
}

// Aviso guardado para a próxima página (ex.: depois de salvar e voltar para a lista).
export function avisarNaProximaPagina(mensagem, tipo = "sucesso") {
  sessionStorage.setItem("amparapet_flash", JSON.stringify({ tipo, msg: mensagem }));
}

export function mostrarAvisoPendente() {
  try {
    const bruto = sessionStorage.getItem("amparapet_flash");
    if (!bruto) return;
    sessionStorage.removeItem("amparapet_flash");
    const { tipo, msg } = JSON.parse(bruto);
    avisar(msg, tipo);
  } catch { /* ignorado */ }
}

// ---------- Modal ----------

const FOCAVEIS = 'button:not([disabled]), [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';

// Abre um modal centralizado sobre fundo escurecido. Devolve { fechar, caixa }.
export function abrirModal({ html, aoFechar }) {
  const anterior = document.activeElement;
  const fundo = document.createElement("div");
  fundo.className = "modal-fundo";
  fundo.innerHTML = `<div class="modal" role="dialog" aria-modal="true">${html}</div>`;
  const caixa = fundo.firstElementChild;
  let aberto = true;

  const fechar = () => {
    if (!aberto) return;
    aberto = false;
    document.removeEventListener("keydown", teclas);
    fundo.remove();
    document.body.classList.remove("sem-rolagem");
    anterior?.focus?.();
    aoFechar?.();
  };
  const teclas = (e) => {
    if (e.key === "Escape") fechar();
    if (e.key === "Tab") { // mantém o foco dentro do modal
      const itens = [...caixa.querySelectorAll(FOCAVEIS)];
      if (!itens.length) return;
      const primeiro = itens[0], ultimo = itens[itens.length - 1];
      if (e.shiftKey && document.activeElement === primeiro) { e.preventDefault(); ultimo.focus(); }
      else if (!e.shiftKey && document.activeElement === ultimo) { e.preventDefault(); primeiro.focus(); }
    }
  };
  fundo.addEventListener("mousedown", (e) => { if (e.target === fundo) fechar(); });
  document.addEventListener("keydown", teclas);
  document.body.append(fundo);
  document.body.classList.add("sem-rolagem");
  return { fechar, caixa };
}

// Modal de confirmação de exclusão (3.png). `aoConfirmar` deve devolver uma Promise.
export function confirmarExclusao({ nome, aoConfirmar }) {
  const { caixa, fechar } = abrirModal({
    html: `
      <button type="button" class="modal__fechar" data-fechar aria-label="Fechar">${icone("fechar")}</button>
      <span class="modal__icone">${icone("pata")}</span>
      <h2 class="modal__titulo" id="modal-titulo">Confirmar exclusão</h2>
      <p class="modal__texto">Tem certeza que deseja excluir o animal <strong>${esc(nome)}</strong>? Esta ação não pode ser desfeita.</p>
      <p class="modal__nota">As fotos e o histórico de status também serão apagados.</p>
      <p class="modal__erro" role="alert" hidden></p>
      <div class="modal__acoes">
        <button type="button" class="btn btn--contorno" data-fechar>Cancelar</button>
        <button type="button" class="btn btn--acao" data-confirmar>Excluir</button>
      </div>`,
  });
  caixa.setAttribute("aria-labelledby", "modal-titulo");
  const confirmar = caixa.querySelector("[data-confirmar]");
  const erro = caixa.querySelector(".modal__erro");
  caixa.querySelectorAll("[data-fechar]").forEach((b) => b.addEventListener("click", fechar));
  confirmar.addEventListener("click", async () => {
    confirmar.disabled = true;
    confirmar.textContent = "Excluindo…";
    erro.hidden = true;
    try {
      await aoConfirmar();
      fechar();
    } catch (e) {
      erro.textContent = e.message;
      erro.hidden = false;
      confirmar.disabled = false;
      confirmar.textContent = "Excluir";
    }
  });
  caixa.querySelector("[data-fechar]").focus();
  return { fechar };
}

// Modal simples de confirmação genérica (ex.: remover foto).
export function confirmar({ titulo, texto, rotuloConfirmar = "Confirmar", aoConfirmar }) {
  const { caixa, fechar } = abrirModal({
    html: `
      <button type="button" class="modal__fechar" data-fechar aria-label="Fechar">${icone("fechar")}</button>
      <span class="modal__icone">${icone("pata")}</span>
      <h2 class="modal__titulo" id="modal-titulo">${esc(titulo)}</h2>
      <p class="modal__texto">${esc(texto)}</p>
      <p class="modal__erro" role="alert" hidden></p>
      <div class="modal__acoes">
        <button type="button" class="btn btn--contorno" data-fechar>Cancelar</button>
        <button type="button" class="btn btn--acao" data-confirmar>${esc(rotuloConfirmar)}</button>
      </div>`,
  });
  caixa.setAttribute("aria-labelledby", "modal-titulo");
  const botao = caixa.querySelector("[data-confirmar]");
  const erro = caixa.querySelector(".modal__erro");
  caixa.querySelectorAll("[data-fechar]").forEach((b) => b.addEventListener("click", fechar));
  botao.addEventListener("click", async () => {
    botao.disabled = true;
    erro.hidden = true;
    try {
      await aoConfirmar();
      fechar();
    } catch (e) {
      erro.textContent = e.message;
      erro.hidden = false;
      botao.disabled = false;
    }
  });
  caixa.querySelector("[data-fechar]").focus();
}
