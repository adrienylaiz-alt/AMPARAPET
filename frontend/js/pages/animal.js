// Página pública de um animal (RF03 / RF06 / RF11).
import * as api from "../api.js";
import { iniciarSite } from "../layout.js";
import { icone } from "../icons.js";
import { avisar, esc, etiquetaStatus, rotulo } from "../ui.js";

iniciarSite({ ativo: "animais" });

const raiz = document.getElementById("detalhe");
const id = Number(new URLSearchParams(location.search).get("id"));

function mensagemVazia(titulo, texto) {
  raiz.setAttribute("aria-busy", "false");
  raiz.innerHTML = `<div class="estado-vazio"><span>${icone("pata")}</span><h1>${esc(titulo)}</h1><p>${esc(texto)}</p>
    <a class="btn btn--verde btn--p" href="animais.html">Ver animais disponíveis</a></div>`;
}

const linhaInfo = (rotuloTexto, valor) => (valor ? `<div><dt>${rotuloTexto}</dt><dd>${esc(valor)}</dd></div>` : "");

function desenhar(animal) {
  document.title = `${animal.nome} — AmparaPet`;
  const femea = animal.sexo === "FEMEA";
  const adotado = animal.status === "ADOTADO";
  const fotos = animal.fotos;
  const selo = (ok, texto) => `<span class="selo-saude ${ok ? "ok" : "nao"}">${icone(ok ? "certo" : "errado")}${texto}</span>`;

  raiz.setAttribute("aria-busy", "false");
  raiz.innerHTML = `
    <a class="voltar" href="animais.html">${icone("setaEsq")} Voltar para os animais</a>
    <div class="detalhe">
      <div class="detalhe__galeria">
        <div class="detalhe__principal">
          ${fotos.length
            ? `<img id="foto-principal" src="${esc(fotos[0].url)}" alt="Foto de ${esc(animal.nome)}">`
            : `<span class="cartao-animal__sem-foto">${icone("pata")}</span>`}
        </div>
        ${fotos.length > 1 ? `<ul class="detalhe__miniaturas">${fotos.map((f, i) =>
          `<li><button type="button" class="${i === 0 ? "ativa" : ""}" data-foto="${esc(f.url)}" aria-label="Ver foto ${i + 1} de ${esc(animal.nome)}"><img src="${esc(f.miniatura_url)}" alt="" loading="lazy"></button></li>`).join("")}</ul>` : ""}
      </div>
      <div class="detalhe__info">
        <div class="detalhe__topo">
          <h1>${esc(animal.nome)}</h1>
          ${etiquetaStatus(animal.status)}
        </div>
        <p class="detalhe__meta">${esc(rotulo("especie", animal.especie))} · ${esc(rotulo("porte", animal.porte))} porte · ${esc(rotulo("sexo", animal.sexo))}${animal.idade ? ` · ${esc(animal.idade)}` : ""}</p>
        <p class="cartao-animal__saude">${selo(animal.castrado, animal.castrado ? (femea ? "Castrada" : "Castrado") : (femea ? "Não castrada" : "Não castrado"))}
          ${selo(animal.vacinado, animal.vacinado ? (femea ? "Vacinada" : "Vacinado") : (femea ? "Não vacinada" : "Não vacinado"))}</p>
        ${animal.descricao ? `<p class="detalhe__descricao">${esc(animal.descricao)}</p>` : ""}
        <dl class="detalhe__dados">
          ${linhaInfo("Raça", animal.raca)}
          ${linhaInfo("Cor", animal.cor)}
          ${linhaInfo("Comportamento", animal.comportamento)}
          ${linhaInfo("Vacinas", animal.vacinas_detalhes)}
          ${linhaInfo("Necessidades especiais", animal.necessidades_especiais)}
        </dl>
        <div class="detalhe__acoes">
          ${adotado
            ? `<p class="detalhe__aviso">${icone("coracao")} ${esc(animal.nome)} já encontrou um lar!</p>`
            : `<button type="button" class="btn btn--verde" id="btn-interesse">${icone("whatsapp")} Tenho interesse</button>`}
          <a class="btn btn--contorno-verde" href="${esc(animal.links.compartilhar_whatsapp)}" target="_blank" rel="noopener">${icone("compartilhar")} Compartilhar</a>
          <button type="button" class="btn btn--contorno-verde" id="btn-copiar">${icone("copiar")} Copiar link</button>
        </div>
      </div>
    </div>`;

  raiz.querySelectorAll("[data-foto]").forEach((botao) => botao.addEventListener("click", () => {
    document.getElementById("foto-principal").src = botao.dataset.foto;
    raiz.querySelectorAll("[data-foto]").forEach((b) => b.classList.toggle("ativa", b === botao));
  }));

  document.getElementById("btn-copiar").addEventListener("click", async () => {
    try {
      await navigator.clipboard.writeText(animal.links.pagina);
      avisar("Link copiado!");
    } catch {
      avisar(`Copie o link: ${animal.links.pagina}`, "sucesso", 10000);
    }
  });

  const interesse = document.getElementById("btn-interesse");
  interesse?.addEventListener("click", async () => {
    interesse.disabled = true;
    try {
      const { whatsapp_url } = await api.registrarInteresse(animal.id);
      if (whatsapp_url) window.open(whatsapp_url, "_blank", "noopener");
      else avisar("O abrigo ainda não cadastrou um WhatsApp. Veja o contato no rodapé da página.", "erro", 8000);
    } catch (e) {
      avisar(e.message, "erro");
    } finally {
      interesse.disabled = false;
    }
  });
}

async function carregar() {
  if (!id) return mensagemVazia("Animal não encontrado", "O endereço está incompleto. Volte à lista e escolha um animal.");
  raiz.innerHTML = `<div class="detalhe detalhe--carregando" aria-hidden="true"><div class="detalhe__principal"></div><div class="detalhe__info"><i></i><i></i><i></i></div></div>`;
  try {
    desenhar(await api.obterAnimal(id));
  } catch (e) {
    if (e.status === 404) mensagemVazia("Animal não encontrado", "Ele pode ter sido removido da lista.");
    else {
      mensagemVazia("Não foi possível carregar", e.message);
    }
  }
}

carregar();
