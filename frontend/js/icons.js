// Ícones SVG inline. Os de contorno herdam a cor do texto (currentColor).
const contorno = (corpo) =>
  `<svg class="icone" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">${corpo}</svg>`;
const solido = (corpo, vb = "0 0 24 24") =>
  `<svg class="icone" viewBox="${vb}" fill="currentColor" aria-hidden="true" focusable="false">${corpo}</svg>`;

const PATA = `<ellipse cx="5.2" cy="11.2" rx="2.1" ry="2.8"/><ellipse cx="9.6" cy="5.8" rx="2.1" ry="2.9"/><ellipse cx="14.4" cy="5.8" rx="2.1" ry="2.9"/><ellipse cx="18.8" cy="11.2" rx="2.1" ry="2.8"/><path d="M12 11c-3.2 0-6.2 3.6-6.2 6.4 0 2 1.6 2.8 3.1 2.8 1.2 0 2-.6 3.1-.6s1.9.6 3.1.6c1.5 0 3.1-.8 3.1-2.8C18.2 14.6 15.200 11 12 11z"/>`;
const CORACAO = `<path d="M12 21.500S3 15.800 3 9.600A4.800 4.800 0 0 1 12 7.200 4.800 4.800 0 0 1 21 9.600c0 6.200-9 11.900-9 11.900z"/>`;

export const ICONES = {
  pata: solido(PATA),
  coracao: solido(CORACAO),
  casa: solido(`<path d="M12 2.500 1.500 12H5v9h5.500v-6h3v6H19v-9h3.500z"/>`),
  zap: solido(`<path d="M13 2 4 14h7l-1 8 9-12h-7z"/>`),
  whatsapp: contorno(`<path d="M3 21l1.700-5A9 9 0 1 1 8 19.300z"/><path d="M9 8.500c0 3.500 3 6.500 6.500 6.500l1.200-1.600-2.300-1.100-1 .9c-1-.4-2-1.400-2.400-2.400l.9-1-1.100-2.300z" fill="currentColor" stroke-width="1"/>`),
  telefone: contorno(`<path d="M5 4h3.500l2 5-2.300 1.400a11 11 0 0 0 5.400 5.400L15 13.500l5 2V19a2 2 0 0 1-2 2A15.500 15.500 0 0 1 3 6a2 2 0 0 1 2-2z"/>`),
  facebook: solido(`<path d="M5 3h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4.500v-7H17l.5-3h-3V9.300c0-.8.4-1.300 1.400-1.300h1.700V5.400A18 18 0 0 0 15 5.300c-2.300 0-3.800 1.400-3.800 3.900V11H8.500v3h2.700v7H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2z"/>`),
  instagram: contorno(`<rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.500" cy="6.500" r="1" fill="currentColor" stroke="none"/>`),
  local: solido(`<path d="M12 22s7.500-6.800 7.500-12.500a7.500 7.500 0 0 0-15 0C4.500 15.200 12 22 12 22zm0-9.500a3 3 0 1 1 0-6 3 3 0 0 1 0 6z" fill-rule="evenodd"/>`),
  email: contorno(`<rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/>`),
  busca: contorno(`<circle cx="11" cy="11" r="7"/><path d="m21 21-4.300-4.300"/>`),
  olho: contorno(`<path d="M2 12s3.500-7 10-7 10 7 10 7-3.500 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>`),
  olhoRiscado: contorno(`<path d="M9.900 4.200A10 10 0 0 1 12 5c6.500 0 10 7 10 7a17 17 0 0 1-2.600 3.600M6.600 6.600A17 17 0 0 0 2 12s3.500 7 10 7a10 10 0 0 0 5.400-1.600"/><path d="m2 2 20 20"/><path d="M9.900 9.900a3 3 0 0 0 4.200 4.200"/>`),
  lapis: contorno(`<path d="M17 3a2.800 2.800 0 0 1 4 4L7.500 20.500 2 22l1.500-5.500z"/>`),
  lixeira: contorno(`<path d="M3 6h18M8 6V4h8v2M6 6l1 14h10l1-14M10 11v5M14 11v5"/>`),
  mais: contorno(`<path d="M12 5v14M5 12h14"/>`),
  fechar: contorno(`<path d="M18 6 6 18M6 6l12 12"/>`),
  setaDir: contorno(`<path d="M5 12h14m-6-6 6 6-6 6"/>`),
  setaEsq: contorno(`<path d="M19 12H5m6-6-6 6 6 6"/>`),
  chevBaixo: contorno(`<path d="m6 9 6 6 6-6"/>`),
  chevEsq: contorno(`<path d="m15 18-6-6 6-6"/>`),
  chevDir: contorno(`<path d="m9 18 6-6-6-6"/>`),
  chevDuplo: contorno(`<path d="m7 7 5 5 5-5M7 13l5 5 5-5"/>`),
  menu: contorno(`<path d="M4 6h16M4 12h16M4 18h16"/>`),
  inicio: contorno(`<path d="M3 11 12 3l9 8"/><path d="M5 10v10h14V10"/><path d="M10 20v-6h4v6"/>`),
  painel: contorno(`<rect x="3" y="3" width="7" height="9" rx="1.500"/><rect x="14" y="3" width="7" height="5" rx="1.500"/><rect x="14" y="12" width="7" height="9" rx="1.500"/><rect x="3" y="16" width="7" height="5" rx="1.500"/>`),
  animais: contorno(`<circle cx="6" cy="6" r="1.800"/><circle cx="12" cy="4" r="1.800"/><circle cx="18" cy="6" r="1.800"/><circle cx="4.500" cy="12" r="1.600"/><path d="M12 10c-3 0-6 3.500-6 6.200 0 1.800 1.300 2.800 3 2.800 1 0 1.800-.5 3-.5s2 .5 3 .5c1.700 0 3-1 3-2.800C18 13.500 15 10 12 10z"/>`),
  cadastrar: contorno(`<rect x="3" y="4" width="14" height="16" rx="2"/><path d="M7 9h6M7 13h6M7 17h3"/><path d="M19 3v6M16 6h6"/>`),
  relatorios: contorno(`<rect x="3" y="4" width="18" height="16" rx="2"/><path d="M3 9h18M9 9v11"/>`),
  engrenagem: contorno(`<circle cx="12" cy="12" r="3"/><path d="M19.400 15a1.700 1.700 0 0 0 .3 1.800l.1.100a2 2 0 1 1-2.800 2.800l-.1-.1a1.700 1.700 0 0 0-1.800-.3 1.700 1.700 0 0 0-1 1.500V21a2 2 0 1 1-4 0v-.1a1.700 1.700 0 0 0-1.100-1.500 1.700 1.700 0 0 0-1.800.3l-.1.100a2 2 0 1 1-2.800-2.800l.1-.1a1.700 1.700 0 0 0 .3-1.800 1.700 1.700 0 0 0-1.500-1H3a2 2 0 1 1 0-4h.1a1.700 1.700 0 0 0 1.500-1.100 1.700 1.700 0 0 0-.3-1.800l-.1-.1a2 2 0 1 1 2.800-2.800l.1.100a1.700 1.700 0 0 0 1.800.3h.1a1.700 1.700 0 0 0 1-1.500V3a2 2 0 1 1 4 0v.1a1.700 1.700 0 0 0 1 1.500 1.700 1.700 0 0 0 1.800-.3l.1-.1a2 2 0 1 1 2.800 2.800l-.1.100a1.700 1.700 0 0 0-.3 1.800v.1a1.700 1.700 0 0 0 1.500 1H21a2 2 0 1 1 0 4h-.1a1.700 1.700 0 0 0-1.500 1z"/>`),
  sair: contorno(`<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><path d="m16 17 5-5-5-5M21 12H9"/>`),
  usuario: contorno(`<circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/>`),
  usuarios: contorno(`<circle cx="9" cy="8" r="3.500"/><path d="M2.500 20a6.500 6.500 0 0 1 13 0"/><path d="M16 4.500a3.500 3.500 0 0 1 0 7M18.500 14.500A6.500 6.500 0 0 1 21.500 20"/>`),
  cadeado: contorno(`<rect x="4" y="11" width="16" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4M12 15v2"/>`),
  camera: contorno(`<path d="M3 8a2 2 0 0 1 2-2h2l2-2h6l2 2h2a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><circle cx="12" cy="13" r="3.500"/>`),
  funil: contorno(`<path d="M3 4h18l-7 9v6l-4 2v-8z"/>`),
  relogio: contorno(`<circle cx="12" cy="12" r="9.500"/><path d="M12 6v6l3.500 2"/>`),
  selo: contorno(`<path d="M12 2.500l2.400 1.600 2.900-.2 1.200 2.600 2.500 1.500-.6 2.800 1.100 2.700-1.800 2.200-.2 2.900-2.800.8L12 21.500l-2.700-1.700-2.800-.8-.2-2.900L4.500 13.900l1.100-2.700L5 8.400l2.500-1.500L8.700 4.300l2.900.2z"/><path d="m8.500 12 2.500 2.500 4.500-5"/>`),
  lista: contorno(`<path d="M9 6h12M9 12h12M9 18h12M4 6h.01M4 12h.01M4 18h.01" stroke-width="3"/>`),
  certo: contorno(`<circle cx="12" cy="12" r="9.500"/><path d="m8 12.500 3 3 5-6"/>`),
  errado: contorno(`<circle cx="12" cy="12" r="9.500"/><path d="m9 9 6 6M15 9l-6 6"/>`),
  atualizar: contorno(`<path d="M21 12a9 9 0 0 1-15.500 6.200M3 12a9 9 0 0 1 15.500-6.200"/><path d="M18.500 2v4h-4M5.500 22v-4h4"/>`),
  compartilhar: contorno(`<circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><path d="m8.700 10.500 6.600-4M8.700 13.500l6.600 4"/>`),
  copiar: contorno(`<rect x="9" y="9" width="12" height="12" rx="2"/><path d="M5 15a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2"/>`),
  estrela: contorno(`<path d="m12 3 2.800 5.700 6.200.9-4.500 4.400 1.100 6.200L12 17.200 6.400 20.200l1.100-6.200L3 9.600l6.200-.9z"/>`),
  cao: solido(`<path d="M7 3.500 3 6v6.500l3.500 1.500L7 11zM17 3.500 21 6v6.500L17.500 14 17 11z"/><path d="M7.500 3h9v9.500a4.500 4.500 0 0 1-9 0z"/><circle cx="10" cy="9" r="1" fill="#fff"/><circle cx="14" cy="9" r="1" fill="#fff"/><ellipse cx="12" cy="13" rx="1.600" ry="1.100" fill="#fff"/>`),
  gato: solido(`<path d="M3.500 2.500 8.500 6h7l5-3.500V13a8.500 8.500 0 0 1-17 0z"/><ellipse cx="9" cy="11" rx="1.200" ry="1.600" fill="#fff"/><ellipse cx="15" cy="11" rx="1.200" ry="1.600" fill="#fff"/><path d="M11 14.500h2l-1 1.200z" fill="#fff"/>`),
};

export function icone(nome) {
  return ICONES[nome] || "";
}

// ---------- Logotipo ----------

// As imagens são resolvidas a partir deste módulo (js/icons.js), então o caminho vale para qualquer página.
const LOGO_COLORIDA = new URL("../assets/img/logo.png", import.meta.url).href;
const LOGO_BRANCA = new URL("../assets/img/Logo_branca.png", import.meta.url).href;

/**
 * Marca da AmparaPet. Por padrão é só a imagem: o nome "AmparaPet" ao lado dela é montado pela navbar e pela
 * barra lateral (ver .cabecalho__logo e .lateral__logo em base.css).
 * @param {{claro?: boolean, tagline?: boolean}} opcoes
 *   claro: versão branca para fundos escuros;
 *   tagline: versão do rodapé, com o nome "AmparaPet" e o slogan pequeno logo abaixo dele (ver .rodape .logo em base.css).
 */
export function logo({ claro = false, tagline = false } = {}) {
  const imagem = claro ? LOGO_BRANCA : LOGO_COLORIDA;
  const texto = tagline
    ? `<span class="logo__texto">
        <span class="logo__nome"><span class="logo__ampara">Ampara</span><span class="logo__pet">Pet</span></span>
        <span class="logo__slogan">Mais amor, menos abandono.</span>
      </span>`
    : "";
  // Com o nome escrito ao lado, a imagem é decorativa (alt vazio): o leitor de tela não repete "AmparaPet".
  return `<span class="logo${claro ? " logo--claro" : ""}">
    <img class="logo__imagem" src="${imagem}" alt="${tagline ? "" : "AmparaPet"}">
    ${texto}
  </span>`;
}
