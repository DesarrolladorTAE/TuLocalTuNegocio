// src/main.jsx
import React from "react";
import ReactDOM from "react-dom/client";
// import "bootstrap/dist/css/bootstrap.min.css";
// import "bootstrap/dist/js/bootstrap.bundle.min.js";
import "./assets/css/bootstrap.min.css"; // Si es personalizado
import "./assets/css/fontawesome.min.css";
import "./assets/css/line-awesome.min.css";
import "./assets/css/magnific-popup.css";
import "./assets/css/slick.css";
// import "./index.scss";
import App from "./App";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import "./assets/sass/main.scss";




const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
