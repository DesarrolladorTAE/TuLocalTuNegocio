import { useState } from "react";
import { Link } from "react-router-dom";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
} from "@mui/material";

const FooterOne = () => {
  const [openTC, setOpenTC] = useState(false);
  const [openPrivacidad, setOpenPrivacidad] = useState(false);

  return (
    <>
      <footer className="footer-section">
        <img src="/assets/images/shapes/pattern.png" alt="" className="bg-pattern" />
        <img src="/assets/images/shapes/element1.png" alt="" className="element one" />
        <img src="/assets/images/shapes/element2.png" alt="" className="element two" />
        <img src="/assets/images/gradients/footer-gradient.png" alt="" className="bg--gradient" />
        <div className="container container-two">
          <div className="row gy-5">
            <div className="col-xl-3 col-sm-6">
              <div className="footer-widget">
                <div className="footer-widget__logo">
                  <Link to="/">
                    <img src="/assets/images/logo/white-logo-two.png" alt="TuLocalTuNego" />
                  </Link>
                </div>
                <p className="footer-widget__desc">
                  TuLocalTuNego: el lugar donde los negocios locales pueden mostrar, vender y
                  promocionar sus productos y servicios en línea sin necesidad de conocimientos
                  técnicos avanzados.
                </p>
                <div className="footer-widget__social">
                  <ul className="social-icon-list">
                    <li className="social-icon-list__item">
                      <a href="https://www.facebook.com" className="social-icon-list__link flx-center" target="_blank" rel="noreferrer">
                        <i className="fab fa-facebook-f" />
                      </a>
                    </li>
                    <li className="social-icon-list__item">
                      <a href="https://www.twitter.com" className="social-icon-list__link flx-center" target="_blank" rel="noreferrer">
                        <i className="fab fa-twitter" />
                      </a>
                    </li>
                    <li className="social-icon-list__item">
                      <a href="https://www.linkedin.com" className="social-icon-list__link flx-center" target="_blank" rel="noreferrer">
                        <i className="fab fa-linkedin-in" />
                      </a>
                    </li>
                    <li className="social-icon-list__item">
                      <a href="https://www.pinterest.com" className="social-icon-list__link flx-center" target="_blank" rel="noreferrer">
                        <i className="fab fa-pinterest-p" />
                      </a>
                    </li>
                    <li className="social-icon-list__item">
                      <a href="https://www.youtube.com" className="social-icon-list__link flx-center" target="_blank" rel="noreferrer">
                        <i className="fab fa-youtube" />
                      </a>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="col-xl-3 col-sm-6 col-xs-6 ps-xl-5">
              <div className="footer-widget">
                <h5 className="footer-widget__title text-white">Acceso Rápido</h5>
                <ul className="footer-lists">
                  <li className="footer-lists__item">
                    <Link to="/all-product" className="footer-lists__link">Productos</Link>
                  </li>
                  <li className="footer-lists__item">
                    <Link to="/profile" className="footer-lists__link">Mi Perfil</Link>
                  </li>
                  <li className="footer-lists__item">
                    <Link to="/login" className="footer-lists__link">Inicio de Sesión</Link>
                  </li>
                  <li className="footer-lists__item">
                    <Link to="/register" className="footer-lists__link">Registro</Link>
                  </li>
                  <li className="footer-lists__item">
                    <Link to="/donaciones" className="footer-lists__link">Contáctanos</Link>
                  </li>
                </ul>
              </div>
            </div>

            <div className="col-xl-4 col-sm-6">
              <div className="footer-widget">
                <h5 className="footer-widget__title text-white">Donaciones</h5>
                <p className="footer-widget__desc">
                  Ayúdanos a seguir mejorando para ti. Puedes contribuir con lo que gustes.
                </p>
                <form action="/donaciones" className="mt-4 subscribe-box d-flex align-items-center flex-column gap-2">
                  <button type="submit" className="btn btn-main btn-lg w-100 pill">
                    Donar Ahora
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </footer>

      {/* bottom Footer */}
      <div className="bottom-footer">
        <div className="container container-two">
          <div className="bottom-footer__inner flx-between gap-3">
            <p className="bottom-footer__text font-14">
              Copyright © {new Date().getFullYear()} TuLocalTuNego - Desarrollado por{" "}
              <a
                href="https://tecnologiasadministrativas.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-decoration-underline"
              >
                TAE ⚙️
              </a>.
            </p>

            <div className="footer-links">
              <button
                onClick={() => setOpenTC(true)}
                className="footer-link font-14 btn-as-link"
                type="button"
              >
                Términos y Condiciones
              </button>
              <button
                onClick={() => setOpenPrivacidad(true)}
                className="footer-link font-14 btn-as-link"
                type="button"
              >
                Políticas de Privacidad
              </button>
              <Link to="/donaciones" className="footer-link font-14">Contacto</Link>
            </div>
          </div>
        </div>
      </div>

      {/* Modal Términos y Condiciones */}
      <Dialog
        open={openTC}
        onClose={() => setOpenTC(false)}
        maxWidth="md"
        fullWidth
        keepMounted
        scroll="paper"
      >
        <DialogTitle>Términos y Condiciones</DialogTitle>
        <DialogContent dividers sx={{ maxHeight: "70vh" }}>
          <Typography variant="body2" paragraph>
            Bienvenido a Tulocaltunego.com. Estos Términos y Condiciones regulan el uso del portal por parte de los USUARIOS.
            Al registrarte o utilizar los servicios aceptas lo aquí dispuesto.
          </Typography>
          <Typography variant="body2" paragraph component="div">
            <ul className="mb-0">
              <li>Servicios gratuitos por 6 meses; después, inscripción desde $120 MXN por categoría.</li>
              <li>Debes proporcionar datos personales verídicos y mantenerlos actualizados.</li>
              <li>No se garantiza la veracidad del contenido publicado por usuarios; actúa con prudencia.</li>
              <li>Prohibido publicar contenido ilícito, engañoso, ofensivo o que infrinja derechos.</li>
              <li>Respeta la propiedad intelectual; no reproduzcas ni explotes contenidos sin autorización.</li>
            </ul>
          </Typography>
          <Typography variant="body2">
            Si deseas, podemos mostrar aquí la versión completa del documento.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenTC(false)}>Cerrar</Button>
        </DialogActions>
      </Dialog>

      {/* Modal Aviso de Privacidad */}
      <Dialog
        open={openPrivacidad}
        onClose={() => setOpenPrivacidad(false)}
        maxWidth="md"
        fullWidth
        keepMounted
        scroll="paper"
      >
        <DialogTitle>Aviso de Privacidad</DialogTitle>
        <DialogContent dividers sx={{ maxHeight: "70vh" }}>
          <Typography variant="body2" paragraph>
            Somos responsables del uso y protección de tus datos conforme a la Ley Federal de Protección de Datos Personales.
          </Typography>
          <Typography variant="body2" paragraph component="div">
            <strong>Fines:</strong>
            <ul className="mb-0">
              <li>Registro en la plataforma, procesamiento de servicios y pagos.</li>
              <li>Atención a clientes y soporte.</li>
              <li>Envío de promociones y novedades (opt-in).</li>
            </ul>
          </Typography>
          <Typography variant="body2" paragraph>
            Puedes ejercer tus derechos ARCO o revocar consentimiento escribiendo a{" "}
            <a href="mailto:contacto@tulocaltunego.com">contacto@tulocaltunego.com</a>.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenPrivacidad(false)}>Cerrar</Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default FooterOne;
