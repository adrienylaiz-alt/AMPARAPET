import { iniciarSite } from "../layout.js";
import { iniciarCatalogo } from "../catalogo.js";

iniciarSite({ ativo: "animais" });
iniciarCatalogo(document.getElementById("catalogo"), {
  porPagina: 12, sincronizarUrl: true, paginar: true, titulo: "Animais disponíveis:",
});
