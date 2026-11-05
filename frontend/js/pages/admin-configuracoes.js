// Configurações: dados do abrigo (GET/PUT /api/admin/abrigo), troca de senha (PUT /api/auth/senha)
// e cadastro de novos administradores (POST /api/admin/usuarios).
import * as api from "../api.js";
import { iniciarAdmin } from "../layout.js";
import { avisar, esc, htmlEstadoErro } from "../ui.js";

const main = await iniciarAdmin("configuracoes");

const CAMPOS_ABRIGO = [
  ["nome_abrigo", "Nome do abrigo", "input"],
  ["endereco", "Endereço", "input"],
  ["cidade", "Cidade", "input"],
  ["horario_funcionamento", "Horário de funcionamento", "input"],
  ["whatsapp", "WhatsApp", "input", "Só números, com DDI e DDD. Ex.: 5543999998888"],
  ["instagram", "Instagram", "input", "Endereço do perfil ou @usuario"],
  ["como_adotar", "Como adotar (texto)", "textarea"],
  ["documentos_adocao", "Documentos exigidos", "textarea"],
  ["mensagem_interesse", "Mensagem do WhatsApp", "textarea", "Variáveis: {nome}, {id} e {link}"],
  ["url_pagina_animal", "Endereço da página do animal", "input", "Use {id} no lugar do código. Ex.: http://localhost:5500/animal.html?id={id}"],
];

main.innerHTML = `
  <h1 class="admin__titulo">Configurações</h1>
  <section class="cartao-form" aria-labelledby="t-abrigo">
    <h2 id="t-abrigo">Dados do abrigo</h2>
    <p class="campo__ajuda cartao-form__intro">Aparecem no rodapé do site e nos links de WhatsApp.</p>
    <form id="form-abrigo" novalidate class="form-config" hidden>
      ${CAMPOS_ABRIGO.map(([nome, rotulo, tipo, ajuda]) => `<div class="campo ${tipo === "textarea" ? "campo--largo" : ""}">
        <label for="ab-${nome}">${rotulo}</label>
        ${tipo === "textarea" ? `<textarea id="ab-${nome}" rows="4"></textarea>` : `<input type="text" id="ab-${nome}"${nome === "whatsapp" ? ' inputmode="numeric" maxlength="13"' : ""}>`}
        ${ajuda ? `<span class="campo__ajuda">${esc(ajuda)}</span>` : ""}
        <span class="campo__erro" id="ab-${nome}-erro" role="alert" hidden></span>
      </div>`).join("")}
      <div class="form-acoes form-acoes--largo"><button type="submit" class="btn btn--acao btn--grande" id="btn-abrigo">Salvar dados do abrigo</button></div>
    </form>
    <div id="estado-abrigo" aria-live="polite"><p class="carregando">Carregando…</p></div>
  </section>

  <section class="cartao-form" aria-labelledby="t-senha">
    <h2 id="t-senha">Alterar senha</h2>
    <form id="form-senha" novalidate class="form-config form-config--senha">
      <div class="campo"><label for="senha-atual">Senha atual</label><input type="password" id="senha-atual" autocomplete="current-password"><span class="campo__erro" id="senha-atual-erro" role="alert" hidden></span></div>
      <div class="campo"><label for="senha-nova">Nova senha</label><input type="password" id="senha-nova" autocomplete="new-password" aria-describedby="senha-nova-ajuda"><span class="campo__ajuda" id="senha-nova-ajuda">De 8 a 72 caracteres.</span><span class="campo__erro" id="senha-nova-erro" role="alert" hidden></span></div>
      <div class="campo"><label for="senha-confirma">Confirmar nova senha</label><input type="password" id="senha-confirma" autocomplete="new-password"><span class="campo__erro" id="senha-confirma-erro" role="alert" hidden></span></div>
      <div class="form-acoes form-acoes--largo"><button type="submit" class="btn btn--acao btn--grande" id="btn-senha">Alterar senha</button></div>
    </form>
  </section>

  <section class="cartao-form" aria-labelledby="t-adm">
    <h2 id="t-adm">Novo administrador</h2>
    <p class="campo__ajuda cartao-form__intro">O novo administrador terá o mesmo acesso que você ao painel.</p>
    <form id="form-adm" novalidate class="form-config">
      <div class="campo"><label for="adm-nome">Nome</label><input type="text" id="adm-nome" autocomplete="off"><span class="campo__erro" id="adm-nome-erro" role="alert" hidden></span></div>
      <div class="campo"><label for="adm-email">E-mail</label><input type="email" id="adm-email" autocomplete="off" autocapitalize="off" spellcheck="false"><span class="campo__erro" id="adm-email-erro" role="alert" hidden></span></div>
      <div class="campo"><label for="adm-senha">Senha</label><input type="password" id="adm-senha" autocomplete="new-password" aria-describedby="adm-senha-ajuda"><span class="campo__ajuda" id="adm-senha-ajuda">De 8 a 72 caracteres.</span><span class="campo__erro" id="adm-senha-erro" role="alert" hidden></span></div>
      <div class="campo"><label for="adm-confirma">Confirmar senha</label><input type="password" id="adm-confirma" autocomplete="new-password"><span class="campo__erro" id="adm-confirma-erro" role="alert" hidden></span></div>
      <div class="form-acoes form-acoes--largo"><button type="submit" class="btn btn--acao btn--grande" id="btn-adm">Cadastrar administrador</button></div>
    </form>
  </section>`;

function erroCampo(idCampo, mensagem) {
  const aviso = document.getElementById(`${idCampo}-erro`);
  aviso.textContent = mensagem || "";
  aviso.hidden = !mensagem;
  document.getElementById(idCampo).closest(".campo").classList.toggle("campo--invalido", Boolean(mensagem));
  if (mensagem) document.getElementById(idCampo).setAttribute("aria-invalid", "true");
  else document.getElementById(idCampo).removeAttribute("aria-invalid");
}

// ---------- Dados do abrigo ----------

const formAbrigo = document.getElementById("form-abrigo");

async function carregarAbrigo() {
  const estado = document.getElementById("estado-abrigo");
  try {
    const abrigo = await api.obterAbrigoAdmin();
    for (const [nome] of CAMPOS_ABRIGO) document.getElementById(`ab-${nome}`).value = abrigo[nome] ?? "";
    formAbrigo.hidden = false;
    estado.innerHTML = "";
  } catch (e) {
    estado.innerHTML = htmlEstadoErro("Não foi possível carregar", e.message,
      `<button type="button" class="btn btn--contorno btn--p">Tentar de novo</button>`);
    estado.querySelector("button").addEventListener("click", carregarAbrigo);
  }
}

formAbrigo.addEventListener("submit", async (e) => {
  e.preventDefault();
  const dados = Object.fromEntries(CAMPOS_ABRIGO.map(([nome]) => [nome, document.getElementById(`ab-${nome}`).value.trim()]));
  erroCampo("ab-whatsapp", /^(\d{12,13})?$/.test(dados.whatsapp) ? "" : "Use só números, com DDI e DDD (12 ou 13 dígitos). Ex.: 5543999998888");
  if (!/^(\d{12,13})?$/.test(dados.whatsapp)) { document.getElementById("ab-whatsapp").focus(); return; }
  const botao = document.getElementById("btn-abrigo");
  botao.disabled = true;
  botao.textContent = "Salvando…";
  try {
    await api.salvarAbrigo(dados);
    avisar("Dados do abrigo salvos.");
  } catch (erro) {
    avisar(erro.message, "erro", 9000);
  } finally {
    botao.disabled = false;
    botao.textContent = "Salvar dados do abrigo";
  }
});

// ---------- Senha ----------

document.getElementById("form-senha").addEventListener("submit", async (e) => {
  e.preventDefault();
  const atual = document.getElementById("senha-atual").value;
  const nova = document.getElementById("senha-nova").value;
  const confirma = document.getElementById("senha-confirma").value;
  const erros = {
    "senha-atual": atual ? "" : "Informe a senha atual.",
    "senha-nova": nova.length >= 8 && nova.length <= 72 ? "" : "A nova senha precisa ter de 8 a 72 caracteres.",
    "senha-confirma": confirma === nova ? "" : "As senhas não conferem.",
  };
  Object.entries(erros).forEach(([campo, msg]) => erroCampo(campo, msg));
  const primeiro = Object.entries(erros).find(([, msg]) => msg);
  if (primeiro) { document.getElementById(primeiro[0]).focus(); return; }

  const botao = document.getElementById("btn-senha");
  botao.disabled = true;
  botao.textContent = "Alterando…";
  try {
    await api.trocarSenha(atual, nova);
    e.target.reset();
    avisar("Senha alterada. As outras sessões abertas foram encerradas.");
  } catch (erro) {
    if (erro.status === 400) erroCampo("senha-atual", erro.message);
    else avisar(erro.message, "erro", 9000);
  } finally {
    botao.disabled = false;
    botao.textContent = "Alterar senha";
  }
});

// ---------- Novo administrador ----------

const EMAIL_VALIDO = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const CAMPOS_ADM = ["adm-nome", "adm-email", "adm-senha", "adm-confirma"];
const formAdm = document.getElementById("form-adm");

formAdm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const nome = document.getElementById("adm-nome").value.trim();
  const email = document.getElementById("adm-email").value.trim();
  const senha = document.getElementById("adm-senha").value; // sem trim: espaços podem fazer parte da senha
  const confirma = document.getElementById("adm-confirma").value;
  // A API conta caracteres (não unidades UTF-16), então o front também: [...texto].length.
  const tamanhoSenha = [...senha].length;
  const erros = {
    "adm-nome": !nome ? "Informe o nome." : [...nome].length > 100 ? "O nome pode ter no máximo 100 caracteres." : "",
    "adm-email": !email ? "Informe o e-mail." : EMAIL_VALIDO.test(email) ? "" : "Informe um e-mail válido.",
    "adm-senha": tamanhoSenha < 8 || tamanhoSenha > 72 ? "A senha precisa ter de 8 a 72 caracteres."
      // o bcrypt do back-end recusa mais de 72 bytes, e letras com acento ocupam mais de um byte
      : new TextEncoder().encode(senha).length > 72 ? "A senha é longa demais. Use menos caracteres (letras com acento ocupam mais espaço)." : "",
    "adm-confirma": !confirma ? "Confirme a senha." : confirma === senha ? "" : "As senhas não conferem.",
  };
  Object.entries(erros).forEach(([campo, msg]) => erroCampo(campo, msg));
  const primeiro = Object.entries(erros).find(([, msg]) => msg);
  if (primeiro) { document.getElementById(primeiro[0]).focus(); return; }

  const botao = document.getElementById("btn-adm");
  botao.disabled = true;
  botao.textContent = "Cadastrando…";
  try {
    await api.criarUsuario({ nome, email, senha });
    formAdm.reset();
    CAMPOS_ADM.forEach((campo) => erroCampo(campo, ""));
    avisar("Administrador cadastrado.");
  } catch (erro) {
    if (erro.status === 409) {
      erroCampo("adm-email", erro.message);
      document.getElementById("adm-email").focus();
    } else {
      avisar(erro.message, "erro", 9000);
    }
  } finally {
    botao.disabled = false;
    botao.textContent = "Cadastrar administrador";
  }
});

carregarAbrigo();
