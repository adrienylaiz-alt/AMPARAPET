// Login administrativo: usa POST /api/auth/login e guarda o token devolvido pela API.
import * as api from "../api.js";
import { icone, logo } from "../icons.js";
import { montarRodape } from "../layout.js";
import { mostrarAvisoPendente } from "../ui.js";

document.querySelector(".login__logo").innerHTML = logo();
document.getElementById("ic-email").innerHTML = icone("usuarios");
document.getElementById("ic-senha").innerHTML = icone("cadeado");
montarRodape(document.getElementById("rodape"));
mostrarAvisoPendente();

const form = document.getElementById("form-login");
const email = document.getElementById("email");
const senha = document.getElementById("senha");
const erro = document.getElementById("erro-login");
const entrar = document.getElementById("btn-entrar");
const olho = document.getElementById("btn-olho");

// Quem já tem uma sessão válida vai direto para o painel.
if (api.obterToken()) {
  api.usuarioLogado().then(() => location.replace("index.html")).catch(() => api.limparToken());
}

function mostrarSenha(visivel) {
  senha.type = visivel ? "text" : "password";
  olho.innerHTML = icone(visivel ? "olhoRiscado" : "olho");
  olho.setAttribute("aria-pressed", String(visivel));
  olho.setAttribute("aria-label", visivel ? "Ocultar senha" : "Mostrar senha");
}
mostrarSenha(false);
olho.addEventListener("click", () => mostrarSenha(senha.type === "password"));

document.getElementById("btn-esqueceu").addEventListener("click", (e) => {
  const dica = document.getElementById("dica-senha");
  dica.hidden = !dica.hidden;
  e.currentTarget.setAttribute("aria-expanded", String(!dica.hidden));
});

function mostrarErro(mensagem, campo) {
  erro.textContent = mensagem;
  erro.hidden = false;
  document.getElementById("campo-email").classList.toggle("campo--invalido", campo === "email" || campo === "ambos");
  document.getElementById("campo-senha").classList.toggle("campo--invalido", campo === "senha" || campo === "ambos");
}

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  erro.hidden = true;
  if (!email.value.trim()) { mostrarErro("Informe o seu e-mail.", "email"); email.focus(); return; }
  if (!senha.value) { mostrarErro("Informe a sua senha.", "senha"); senha.focus(); return; }

  entrar.disabled = true;
  entrar.textContent = "Entrando…";
  try {
    const resposta = await api.entrar(email.value.trim(), senha.value);
    api.guardarToken(resposta.token, document.getElementById("lembrar").checked);
    location.href = "index.html";
  } catch (err) {
    mostrarErro(err.message, err.status === 401 ? "ambos" : null);
    entrar.disabled = false;
    entrar.textContent = "Entrar";
    if (err.status === 401) { senha.value = ""; senha.focus(); }
  }
});
