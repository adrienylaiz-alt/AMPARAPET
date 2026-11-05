// Camada de acesso à API do AmparaPet. Nenhuma página chama fetch() diretamente.
import { API_URL } from "./config.js";

const CHAVE_TOKEN = "amparapet_token";

// ---------- Sessão ----------
// "Lembrar de mim" guarda o token em localStorage; sem ele, só vale enquanto a aba estiver aberta.

export function obterToken() {
  try {
    return localStorage.getItem(CHAVE_TOKEN) || sessionStorage.getItem(CHAVE_TOKEN);
  } catch {
    return null;
  }
}

export function guardarToken(token, lembrar) {
  limparToken();
  try {
    (lembrar ? localStorage : sessionStorage).setItem(CHAVE_TOKEN, token);
  } catch { /* armazenamento bloqueado: o login só vale até recarregar */ }
}

export function limparToken() {
  try {
    localStorage.removeItem(CHAVE_TOKEN);
    sessionStorage.removeItem(CHAVE_TOKEN);
  } catch { /* ignorado */ }
}

// ---------- Requisições ----------

export class ErroApi extends Error {
  constructor(mensagem, status) {
    super(mensagem);
    this.status = status;
  }
}

function mensagemDeErro(dados, resp) {
  let msg = dados && dados.detail;
  if (Array.isArray(msg)) {
    msg = msg.map((e) => `${(e.loc || []).slice(1).join(".")}: ${e.msg}`).join("\n");
  }
  return msg || resp.statusText || "Erro inesperado";
}

function montarUrl(caminho, params) {
  const url = new URL(API_URL + caminho);
  for (const [chave, valor] of Object.entries(params || {})) {
    for (const v of [].concat(valor)) {
      if (v !== undefined && v !== null && v !== "") url.searchParams.append(chave, v);
    }
  }
  return url;
}

async function requisitar(caminho, { metodo = "GET", params, json, formulario, autenticado = false } = {}) {
  const headers = {};
  if (autenticado) {
    const token = obterToken();
    if (token) headers.Authorization = `Bearer ${token}`;
  }
  let body;
  if (json !== undefined) {
    headers["Content-Type"] = "application/json";
    body = JSON.stringify(json);
  } else if (formulario) {
    body = formulario; // o navegador define o multipart/form-data com o boundary
  }

  let resp;
  try {
    resp = await fetch(montarUrl(caminho, params), { method: metodo, headers, body });
  } catch {
    throw new ErroApi(`Não foi possível conectar à API (${API_URL}). Verifique se ela está ligada.`, 0);
  }
  if (resp.status === 204) return null;
  const dados = await resp.json().catch(() => null);
  if (!resp.ok) {
    // sessão expirada ou token inválido: volta para o login
    if (resp.status === 401 && autenticado && !caminho.startsWith("/api/auth/login")) {
      limparToken();
      sessionStorage.setItem("amparapet_flash", JSON.stringify({ tipo: "erro", msg: "Sua sessão expirou. Entre novamente." }));
      location.href = new URL("login.html", location.href.replace(/[^/]*$/, "")).href;
    }
    throw new ErroApi(mensagemDeErro(dados, resp), resp.status);
  }
  return dados;
}

const publico = (caminho, opcoes) => requisitar(caminho, opcoes);
const admin = (caminho, opcoes) => requisitar(caminho, { ...opcoes, autenticado: true });

// ---------- Público ----------

export const listarAnimais = (params) => publico("/api/animais", { params });
export const obterAnimal = (id) => publico(`/api/animais/${id}`);
export const registrarInteresse = (id) => publico(`/api/animais/${id}/interesse`, { metodo: "POST" });
export const obterAbrigo = () => publico("/api/abrigo");

// ---------- Autenticação ----------

export const entrar = (email, senha) => publico("/api/auth/login", { metodo: "POST", json: { email, senha } });
export const usuarioLogado = () => admin("/api/auth/eu");
export const sair = () => admin("/api/auth/logout", { metodo: "POST" });
export const trocarSenha = (senha_atual, senha_nova) =>
  admin("/api/auth/senha", { metodo: "PUT", json: { senha_atual, senha_nova } });

// ---------- Administração ----------

export const obterPainel = () => admin("/api/admin/painel");
export const listarAnimaisAdmin = (params) => admin("/api/admin/animais", { params });
export const obterAnimalAdmin = (id) => admin(`/api/admin/animais/${id}`);
export const criarAnimal = (dados) => admin("/api/admin/animais", { metodo: "POST", json: dados });
export const editarAnimal = (id, dados) => admin(`/api/admin/animais/${id}`, { metodo: "PATCH", json: dados });
export const excluirAnimal = (id) => admin(`/api/admin/animais/${id}`, { metodo: "DELETE" });

export function enviarFotos(id, arquivos) {
  const formulario = new FormData();
  arquivos.forEach((arquivo) => formulario.append("fotos", arquivo));
  return admin(`/api/admin/animais/${id}/fotos`, { metodo: "POST", formulario });
}
export const reordenarFotos = (id, ids) =>
  admin(`/api/admin/animais/${id}/fotos/ordem`, { metodo: "PUT", json: { ids } });
export const removerFoto = (fotoId) => admin(`/api/admin/fotos/${fotoId}`, { metodo: "DELETE" });

export const obterAbrigoAdmin = () => admin("/api/admin/abrigo");
export const salvarAbrigo = (dados) => admin("/api/admin/abrigo", { metodo: "PUT", json: dados });

// Cadastra um administrador (todos têm o mesmo acesso). Envia só os três campos que a rota aceita.
export const criarUsuario = ({ nome, email, senha }) =>
  admin("/api/admin/usuarios", { metodo: "POST", json: { nome, email, senha } });
