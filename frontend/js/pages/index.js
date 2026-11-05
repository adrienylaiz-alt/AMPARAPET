import { iniciarSite } from "../layout.js";
import { iniciarCatalogo } from "../catalogo.js";
import { icone } from "../icons.js";

iniciarSite({ ativo: "inicio" });

document.getElementById("hero-cta").innerHTML = `${icone("pata")} Ver animais disponíveis ${icone("setaDir")}`;
document.querySelector(".hero__coracao").innerHTML = icone("coracao");

// Passos de "Como adotar?" (textos do Figma)
const PASSOS = [
  ["pata", "1. Escolha um animal", "Navegue pela nossa lista e encontre seu companheiro"],
  ["whatsapp", "2. Entre em contato", "Fale conosco pelo WhatsApp para demonstrar interesse"],
  ["casa", "3. Agende uma visita", "Conheça o animal e tire todas as suas dúvidas"],
  ["coracao", "4. Finalize a adoção", "Com a documentação em dia, o novo membro da família pode ir para casa!"],
];
document.getElementById("como-passos").innerHTML = PASSOS.map(([ic, titulo, texto], i) =>
  `<li class="como__passo"><span class="como__icone">${icone(ic)}</span><h3>${titulo}</h3><p>${texto}</p></li>${i < PASSOS.length - 1 ? `<li class="como__seta" aria-hidden="true">${icone("setaDir")}</li>` : ""}`).join("");

iniciarCatalogo(document.getElementById("catalogo"), { porPagina: 8, linkVerTodos: true });
