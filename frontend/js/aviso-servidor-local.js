// Aviso quando a página é aberta direto do disco (file://).
// Os módulos ES (js/pages/*.js) e a API só funcionam por um servidor HTTP, então mostramos como abrir o projeto.
// Script clássico de propósito: precisa rodar mesmo quando os módulos são bloqueados pelo navegador.
(function () {
  if (location.protocol !== "file:") return;

  function mostrar() {
    var aviso = document.createElement("div");
    aviso.setAttribute("role", "alert");
    aviso.style.cssText = "position:fixed;left:0;right:0;top:0;z-index:2000;padding:12px 16px;" +
      "background:#b3261e;color:#fff;font:600 14px/1.5 system-ui,sans-serif;text-align:center";
    aviso.innerHTML = "Esta página precisa ser aberta por um servidor local, não pelo arquivo (file://). " +
      "Na pasta do projeto rode <code>python -m http.server 5500</code> e acesse " +
      "<code>http://localhost:5500</code> (ou use a extensão Live Server do VS Code).";
    // No <html> (e não no <body>): as páginas do admin recriam o conteúdo do <body> ao iniciar.
    document.documentElement.appendChild(aviso);
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", mostrar);
  else mostrar();
})();
