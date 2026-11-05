// Cadastro e edição de animal (5.png / 4.png).
// Cadastro: POST /api/admin/animais e, depois, POST /api/admin/animais/{id}/fotos (multipart).
// Edição:   GET/PATCH /api/admin/animais/{id}, fotos em /fotos, /fotos/ordem e DELETE /api/admin/fotos/{id}.
import * as api from "../api.js";
import { FOTO_MAX_MB, FOTO_MAX_POR_ANIMAL, FOTO_TIPOS } from "../config.js";
import { iniciarAdmin } from "../layout.js";
import { icone } from "../icons.js";
import { avisar, avisarNaProximaPagina, confirmar, esc, htmlEstadoErro, idadeParaData, ROTULOS } from "../ui.js";

const id = Number(new URLSearchParams(location.search).get("id")) || null;
const editando = id !== null;
const main = await iniciarAdmin("cadastrar");

const opcoes = (tipo) => Object.entries(ROTULOS[tipo]).map(([v, r]) => `<option value="${v}">${r}</option>`).join("");
const selecione = `<option value="" disabled selected hidden>Selecione</option>`;

function campo(idCampo, rotuloTexto, controle, { obrigatorio = true, ajuda = "" } = {}) {
  return `<div class="campo" data-campo="${idCampo}">
    <label for="${idCampo}">${rotuloTexto}${obrigatorio ? '<span class="obrigatorio" aria-hidden="true">*</span>' : ""}</label>
    ${controle}
    ${ajuda ? `<span class="campo__ajuda" id="${idCampo}-ajuda">${ajuda}</span>` : ""}
    <span class="campo__erro" id="${idCampo}-erro" role="alert" hidden></span>
  </div>`;
}
const req = (obrigatorio) => (obrigatorio ? " required" : "");

function montarFormulario() {
  main.innerHTML = `
    <a class="voltar-admin" href="animais.html">${icone("setaEsq")} Voltar</a>
    <h1 class="admin__titulo">${editando ? "Editar Animal" : "Cadastrar Animal"}</h1>
    <div id="estado-carga" aria-live="polite"></div>
    <form class="form-animal form-animal--${editando ? "editar" : "criar"}" id="form-animal" novalidate hidden>
      <section class="cartao-form area-info" aria-labelledby="t-info">
        <h2 id="t-info">Informações básicas</h2>
        <div class="grade-campos">
          ${campo("nome", "Nome", `<input type="text" id="nome" maxlength="80" placeholder="Digite o nome do animal" autocomplete="off"${req(true)}>`)}
          ${campo("idade", "Idade", `<input type="text" id="idade" maxlength="40" placeholder="Ex: 2 anos" autocomplete="off" aria-describedby="idade-ajuda"${req(true)}>`, { ajuda: "Ex.: 2 anos, 8 meses ou 1 ano e 3 meses" })}
          ${campo("especie", "Espécie", `<select id="especie"${req(true)}>${selecione}${opcoes("especie")}</select>`)}
          ${campo("raca", "Raça", `<input type="text" id="raca" maxlength="80" placeholder="Digite a raça" autocomplete="off" aria-describedby="raca-ajuda">`, { obrigatorio: false, ajuda: "Se ficar em branco, será salvo como SRD." })}
          ${campo("porte", "Porte", `<select id="porte"${req(true)}>${selecione}${opcoes("porte")}</select>`)}
          ${campo("cor", "Cor", `<input type="text" id="cor" maxlength="60" placeholder="Digite a cor" autocomplete="off"${req(true)}>`)}
          ${campo("sexo", "Sexo", `<select id="sexo"${req(true)}>${selecione}${opcoes("sexo")}</select>`)}
        </div>
      </section>

      <section class="cartao-form area-fotos" aria-labelledby="t-fotos">
        <h2 id="t-fotos">${editando ? '<span class="sr-only">Fotos</span>' : "Fotos"}</h2>
        <div id="fotos"></div>
      </section>

      <section class="cartao-form area-comp" aria-labelledby="t-comp">
        <h2 id="t-comp">Comportamento e descrição</h2>
        ${campo("comportamento", "Comportamento", `<input type="text" id="comportamento" placeholder="Ex.: Dócil e brincalhão" autocomplete="off"${req(true)}>`)}
        ${campo("descricao", "Descrição", `<textarea id="descricao" rows="6" placeholder="Conte mais sobre o animal..."${req(true)}></textarea>`)}
      </section>

      <section class="cartao-form area-saude" aria-labelledby="t-saude">
        <h2 id="t-saude">Saúde e disponibilidade</h2>
        ${campo("vacinado", "Vacinação", `<select id="vacinado"${req(true)}>${selecione}<option value="sim">Vacinado</option><option value="nao">Não vacinado</option></select>`)}
        ${campo("castrado", "Castração", `<select id="castrado"${req(true)}>${selecione}<option value="sim">Castrado</option><option value="nao">Não castrado</option></select>`)}
        ${campo("status", "Status", `<select id="status"${req(true)}>${selecione}${opcoes("status")}</select>`)}
        ${campo("vacinas_detalhes", "Detalhes das vacinas", `<input type="text" id="vacinas_detalhes" placeholder="Ex.: V10 e antirrábica em dia" autocomplete="off">`, { obrigatorio: false })}
        ${campo("necessidades_especiais", "Necessidades especiais", `<input type="text" id="necessidades_especiais" placeholder="Se houver" autocomplete="off">`, { obrigatorio: false })}
      </section>

      <div class="form-acoes">
        <a class="btn btn--contorno btn--grande" href="animais.html">Cancelar</a>
        <button type="submit" class="btn btn--acao btn--grande" id="btn-salvar">Salvar</button>
      </div>
    </form>`;
}

// ---------- Fotos ----------
// itens: fotos já salvas ({id, url, mini}) seguidas das novas ainda não enviadas ({arquivo, url, mini}).

const fotos = { itens: [], selecionada: 0 };
let originalIdade = "";

function validarArquivos(lista) {
  const aceitos = [];
  const recusados = [];
  const maximo = FOTO_MAX_MB * 1024 * 1024;
  for (const arquivo of lista) {
    const tipoOk = FOTO_TIPOS.includes(arquivo.type) || /\.(jpe?g|png|webp)$/i.test(arquivo.name);
    if (!tipoOk) recusados.push(`${arquivo.name}: use JPG, PNG ou WEBP`);
    else if (arquivo.size > maximo) recusados.push(`${arquivo.name}: passa de ${FOTO_MAX_MB} MB`);
    else if (fotos.itens.length + aceitos.length >= FOTO_MAX_POR_ANIMAL) recusados.push(`${arquivo.name}: limite de ${FOTO_MAX_POR_ANIMAL} fotos por animal`);
    else aceitos.push(arquivo);
  }
  if (recusados.length) avisar(`Algumas fotos não foram adicionadas:\n${recusados.join("\n")}`, "erro", 9000);
  return aceitos;
}

function adicionarArquivos(lista) {
  const aceitos = validarArquivos([...lista]);
  for (const arquivo of aceitos) {
    const url = URL.createObjectURL(arquivo);
    fotos.itens.push({ arquivo, url, mini: url });
  }
  if (aceitos.length) fotos.selecionada = fotos.itens.length - aceitos.length;
  desenharFotos();
}

function desenharFotos() {
  const area = document.getElementById("fotos");
  const sel = fotos.itens[fotos.selecionada];
  const miniaturas = fotos.itens.map((f, i) => `<li>
    <button type="button" class="foto-mini${i === fotos.selecionada ? " ativa" : ""}" data-indice="${i}" aria-label="Foto ${i + 1}${i === 0 ? " (principal)" : ""}${f.arquivo ? " — nova, ainda não enviada" : ""}" aria-pressed="${i === fotos.selecionada}">
      <img src="${esc(f.mini)}" alt="">${i === 0 ? '<span class="foto-mini__selo">Principal</span>' : ""}${f.arquivo && editando ? '<span class="foto-mini__selo foto-mini__selo--nova">Nova</span>' : ""}
    </button></li>`).join("");
  const mais = `<li><button type="button" class="foto-mais" data-adicionar aria-label="Adicionar fotos">${icone("mais")}</button></li>`;

  const podeTornarPrincipal = sel && fotos.selecionada > 0 && (!editando || sel.id);
  const acoes = sel ? `<div class="fotos__acoes">
      ${podeTornarPrincipal ? `<button type="button" class="btn btn--contorno btn--p" data-principal>${icone("estrela")} Tornar principal</button>` : ""}
      <button type="button" class="btn btn--contorno btn--p btn--perigo" data-remover>${icone("lixeira")} Remover foto</button>
    </div>` : "";

  const topo = editando
    ? `<div class="fotos__principal">${sel ? `<img src="${esc(sel.url)}" alt="Foto selecionada do animal">` : `<button type="button" class="fotos__vazio" data-adicionar>${icone("camera")}<span>Nenhuma foto. Clique para adicionar.</span></button>`}</div>`
    : `<button type="button" class="dropzone" data-adicionar>${icone("camera")}
        <span>Arraste e solte suas fotos aqui<br>ou clique para selecionar<br><small>JPG, PNG ou WEBP (máx. ${FOTO_MAX_MB}MB)</small></span></button>`;

  area.innerHTML = `${topo}
    <ul class="fotos__lista">${miniaturas}${mais}</ul>
    ${acoes}
    ${editando ? `<p class="campo__ajuda">JPG, PNG ou WEBP (máx. ${FOTO_MAX_MB}MB). Fotos novas são enviadas ao salvar.</p>` : ""}
    <input type="file" id="arquivos" accept="image/jpeg,image/png,image/webp" multiple hidden>`;
  const input = area.querySelector("#arquivos");
  input.addEventListener("change", () => { adicionarArquivos(input.files); });
}

function iniciarEventosFotos() {
  const area = document.getElementById("fotos");
  const cartao = area.closest(".cartao-form");
  area.addEventListener("click", (e) => {
    const botao = e.target.closest("button");
    if (!botao) return;
    if ("adicionar" in botao.dataset) area.querySelector("#arquivos").click();
    else if (botao.dataset.indice !== undefined) { fotos.selecionada = Number(botao.dataset.indice); desenharFotos(); }
    else if ("principal" in botao.dataset) tornarPrincipal();
    else if ("remover" in botao.dataset) removerSelecionada();
  });
  for (const evento of ["dragenter", "dragover"]) {
    cartao.addEventListener(evento, (e) => { e.preventDefault(); cartao.classList.add("arrastando"); });
  }
  for (const evento of ["dragleave", "drop"]) {
    cartao.addEventListener(evento, (e) => {
      e.preventDefault();
      if (evento === "dragleave" && cartao.contains(e.relatedTarget)) return;
      cartao.classList.remove("arrastando");
    });
  }
  cartao.addEventListener("drop", (e) => { if (e.dataTransfer?.files?.length) adicionarArquivos(e.dataTransfer.files); });
}

async function tornarPrincipal() {
  const sel = fotos.itens[fotos.selecionada];
  if (!editando) {
    fotos.itens.unshift(...fotos.itens.splice(fotos.selecionada, 1));
    fotos.selecionada = 0;
    return desenharFotos();
  }
  const salvas = fotos.itens.filter((f) => f.id);
  const ordem = [sel.id, ...salvas.filter((f) => f.id !== sel.id).map((f) => f.id)];
  try {
    const animal = await api.reordenarFotos(id, ordem);
    sincronizarFotosSalvas(animal.fotos);
    fotos.selecionada = 0;
    desenharFotos();
    avisar("Foto principal atualizada.");
  } catch (e) {
    avisar(e.message, "erro");
  }
}

function removerSelecionada() {
  const sel = fotos.itens[fotos.selecionada];
  const tirar = () => {
    if (sel.arquivo) URL.revokeObjectURL(sel.url);
    fotos.itens.splice(fotos.selecionada, 1);
    fotos.selecionada = Math.max(0, Math.min(fotos.selecionada, fotos.itens.length - 1));
    desenharFotos();
  };
  if (!sel.id) return tirar();
  confirmar({
    titulo: "Remover foto",
    texto: "Esta foto será apagada definitivamente do animal. Deseja continuar?",
    rotuloConfirmar: "Remover",
    aoConfirmar: async () => {
      await api.removerFoto(sel.id);
      tirar();
      avisar("Foto removida.");
    },
  });
}

// Troca as fotos salvas pelas devolvidas pela API, mantendo as novas no fim da lista.
function sincronizarFotosSalvas(fotosApi) {
  const novas = fotos.itens.filter((f) => f.arquivo);
  fotos.itens = [...fotosApi.map((f) => ({ id: f.id, url: f.url, mini: f.miniatura_url })), ...novas];
}

// ---------- Formulário ----------

const el = (nome) => document.getElementById(nome);
const CAMPOS_OBRIGATORIOS = ["nome", "idade", "especie", "porte", "cor", "sexo", "comportamento", "descricao", "vacinado", "castrado", "status"];

function marcarErro(nome, mensagem) {
  const grupo = document.querySelector(`[data-campo="${nome}"]`);
  const aviso = el(`${nome}-erro`);
  const controle = el(nome);
  grupo.classList.toggle("campo--invalido", Boolean(mensagem));
  aviso.hidden = !mensagem;
  aviso.textContent = mensagem || "";
  if (mensagem) {
    controle.setAttribute("aria-invalid", "true");
    controle.setAttribute("aria-describedby", [`${nome}-erro`, controle.getAttribute("aria-describedby")].filter((x) => x && x !== `${nome}-erro`).join(" "));
  } else controle.removeAttribute("aria-invalid");
}

function validar() {
  let primeiro = null;
  for (const nome of CAMPOS_OBRIGATORIOS) {
    const valor = el(nome).value.trim();
    let erro = "";
    if (!valor) erro = "Campo obrigatório.";
    else if (nome === "idade" && !(valor === originalIdade || idadeParaData(valor))) erro = "Use um formato como 2 anos, 8 meses ou 1 ano e 3 meses.";
    marcarErro(nome, erro);
    if (erro && !primeiro) primeiro = nome;
  }
  if (primeiro) el(primeiro).focus();
  return !primeiro;
}

function montarDados() {
  const texto = (n) => el(n).value.trim();
  const dados = {
    nome: texto("nome"),
    especie: el("especie").value,
    sexo: el("sexo").value,
    porte: el("porte").value,
    cor: texto("cor"),
    comportamento: texto("comportamento"),
    descricao: texto("descricao"),
    vacinado: el("vacinado").value === "sim",
    castrado: el("castrado").value === "sim",
    vacinas_detalhes: texto("vacinas_detalhes") || null,
    necessidades_especiais: texto("necessidades_especiais") || null,
    status: el("status").value,
  };
  const raca = texto("raca");
  if (raca || editando) dados.raca = raca || "SRD";
  // Na edição, só reenvia a data se a idade foi alterada (a API devolve texto, não a data).
  if (!editando || texto("idade") !== originalIdade) dados.data_nascimento = idadeParaData(texto("idade"));
  return dados;
}

function preencher(animal) {
  el("nome").value = animal.nome;
  originalIdade = animal.idade || "";
  el("idade").value = originalIdade;
  el("especie").value = animal.especie;
  el("raca").value = animal.raca || "";
  el("porte").value = animal.porte;
  el("cor").value = animal.cor || "";
  el("sexo").value = animal.sexo;
  el("comportamento").value = animal.comportamento || "";
  el("descricao").value = animal.descricao || "";
  el("vacinado").value = animal.vacinado ? "sim" : "nao";
  el("castrado").value = animal.castrado ? "sim" : "nao";
  el("status").value = animal.status;
  el("vacinas_detalhes").value = animal.vacinas_detalhes || "";
  el("necessidades_especiais").value = animal.necessidades_especiais || "";
  fotos.itens = animal.fotos.map((f) => ({ id: f.id, url: f.url, mini: f.miniatura_url }));
  fotos.selecionada = 0;
  document.title = `Editar ${animal.nome} — AmparaPet Admin`;
}

async function salvar(e) {
  e.preventDefault();
  if (!validar()) {
    avisar("Corrija os campos destacados e tente de novo.", "erro");
    return;
  }
  const botao = el("btn-salvar");
  botao.disabled = true;
  botao.textContent = "Salvando…";
  const novas = fotos.itens.filter((f) => f.arquivo).map((f) => f.arquivo);
  let idSalvo = id;
  try {
    if (editando) await api.editarAnimal(id, montarDados());
    else idSalvo = (await api.criarAnimal(montarDados())).id;
  } catch (erro) {
    avisar(erro.message, "erro", 9000);
    botao.disabled = false;
    botao.textContent = "Salvar";
    return;
  }

  if (novas.length) {
    try {
      await api.enviarFotos(idSalvo, novas);
    } catch (erro) {
      // o animal já foi salvo; só as fotos falharam
      avisar(`Os dados foram salvos, mas as fotos não foram enviadas: ${erro.message}`, "erro", 10000);
      botao.disabled = false;
      botao.textContent = "Salvar";
      if (!editando) { avisarNaProximaPagina("Animal cadastrado. Edite-o para tentar enviar as fotos de novo.", "sucesso"); location.href = `animal.html?id=${idSalvo}`; }
      else await recarregar();
      return;
    }
  }
  avisarNaProximaPagina(editando ? "Alterações salvas com sucesso." : "Animal cadastrado com sucesso.");
  location.href = "animais.html";
}

async function recarregar() {
  try {
    const animal = await api.obterAnimalAdmin(id);
    fotos.itens.forEach((f) => f.arquivo && URL.revokeObjectURL(f.url));
    preencher(animal);
    desenharFotos();
  } catch { /* mantém a tela atual */ }
}

async function iniciar() {
  montarFormulario();
  const formulario = el("form-animal");
  const estadoCarga = el("estado-carga");

  if (editando) {
    estadoCarga.innerHTML = `<p class="carregando">Carregando dados do animal…</p>`;
    try {
      preencher(await api.obterAnimalAdmin(id));
    } catch (e) {
      estadoCarga.innerHTML = htmlEstadoErro(
        e.status === 404 ? "Animal não encontrado" : "Não foi possível carregar o animal", e.message,
        `<a class="btn btn--contorno btn--p" href="animais.html">Voltar para a lista</a>`);
      return;
    }
    estadoCarga.innerHTML = "";
  } else {
    el("status").value = "DISPONIVEL"; // novo animal começa disponível, como na API
  }
  formulario.hidden = false;
  desenharFotos();
  iniciarEventosFotos();
  formulario.addEventListener("submit", salvar);
  formulario.addEventListener("input", (e) => {
    if (e.target.id && CAMPOS_OBRIGATORIOS.includes(e.target.id) && e.target.value.trim()) marcarErro(e.target.id, "");
  });
}

iniciar();
