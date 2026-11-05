import { iniciarSite } from "../layout.js";
import { icone } from "../icons.js";

iniciarSite({ ativo: "como-adotar" });
document.getElementById("adotar-cta").innerHTML = `${icone("pata")} Adotar`;
