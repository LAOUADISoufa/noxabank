// Point d'entrée de toute l'appli — c'est ici que React prend vie
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";

// On accroche React au div#root dans le index.html
// createRoot c'est la nouvelle façon de faire depuis React 18 (fini ReactDOM.render)
ReactDOM.createRoot(document.getElementById("root")).render(

  // StrictMode n'affiche rien à l'écran, mais en dev il est bavard :
  // il détecte les effets de bord, les dépréciations, les renders suspects...
  // il double les renders exprès pour débusquer les bugs — normal si tu vois des logs en double !
  <React.StrictMode>
    <App />
  </React.StrictMode>

);
