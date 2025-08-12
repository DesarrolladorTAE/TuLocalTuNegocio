import { Link } from "react-router-dom";

const FooterOne = () => {
  return (
    <>
      <footer className="footer-section">
        <img
          src="/assets/images/shapes/pattern.png"
          alt=""
          className="bg-pattern"
        />
        <img
          src="/assets/images/shapes/element1.png"
          alt=""
          className="element one"
        />
        <img
          src="/assets/images/shapes/element2.png"
          alt=""
          className="element two"
        />
        <img
          src="/assets/images/gradients/footer-gradient.png"
          alt=""
          className="bg--gradient"
        />
        <div className="container container-two">
          <div className="row gy-5">
            <div className="col-xl-3 col-sm-6">
              <div className="footer-widget">
                <div className="footer-widget__logo">
                  <Link to="/">
                    <img src="/assets/images/logo/white-logo-two.png" alt="" />
                  </Link>
                </div>
                <p className="footer-widget__desc">
                  TuLocalTuNego  el lugar donde los negocios locales puedan 
                  mostrar, vender y promocionar sus productos y servicios en línea, 
                  sin necesidad de conocimientos técnicos avanzados.
                </p>
                <div className="footer-widget__social">
                  <ul className="social-icon-list">
                    <li className="social-icon-list__item">
                      <Link
                        to="https://www.facebook.com"
                        className="social-icon-list__link flx-center"
                      >
                        <i className="fab fa-facebook-f" />
                      </Link>
                    </li>
                    <li className="social-icon-list__item">
                      <Link
                        to="https://www.twitter.com"
                        className="social-icon-list__link flx-center"
                      >
                        <i className="fab fa-twitter" />
                      </Link>
                    </li>
                    <li className="social-icon-list__item">
                      <Link
                        to="https://www.linkedin.com"
                        className="social-icon-list__link flx-center"
                      >
                        <i className="fab fa-linkedin-in" />
                      </Link>
                    </li>
                    <li className="social-icon-list__item">
                      <Link
                        to="https://www.pinterest.com"
                        className="social-icon-list__link flx-center"
                      >
                        <i className="fab fa-pinterest-p" />
                      </Link>
                    </li>
                    <li className="social-icon-list__item">
                      <Link
                        to="https://www.pinterest.com"
                        className="social-icon-list__link flx-center"
                      >
                        <i className="fab fa-youtube" />
                      </Link>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="col-xl-3 col-sm-6 col-xs-6 ps-xl-5">
              <div className="footer-widget">
                <h5 className="footer-widget__title text-white">
                  Acceso Rapido
                </h5>
                <ul className="footer-lists">
                  <li className="footer-lists__item">
                    <Link to="/all-product" className="footer-lists__link">
                      Productos
                    </Link>
                  </li>
                  <li className="footer-lists__item">
                    <Link to="/profile" className="footer-lists__link">
                      Mi Perfil
                    </Link>
                  </li>

                  <li className="footer-lists__item">
                    <Link to="/login" className="footer-lists__link">
                      Inicio de Sesión{" "}
                    </Link>
                  </li>
                  <li className="footer-lists__item">
                    <Link to="/register" className="footer-lists__link">
                      Registro
                    </Link>
                  </li>
                  <li className="footer-lists__item">
                    <Link to="/contact" className="footer-lists__link">
                      Contactanos
                    </Link>
                  </li>
                </ul>
              </div>
            </div>
            <div className="col-xl-4 col-sm-6">
              <div className="footer-widget">
                <h5 className="footer-widget__title text-white">Donaciones</h5>
                <p className="footer-widget__desc">
                  Ayudanos a seguir mejorando para ti, puedes contribuir con lo
                  que gustes.
                </p>
                <form
                  action="#"
                  className="mt-4 subscribe-box d-flex align-items-center flex-column gap-2"
                >
                  <button
                    type="submit"
                    className="btn btn-main btn-lg w-100 pill"
                  >
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
              Copyright © 2025 TuLocalTuNego - Desarrollado por{" "}
              <a
                href="https://tecnologiasadministrativas.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-decoration-underline"
              >
                TAE ⚙️
              </a>
              .
            </p>

            <div className="footer-links">
              <Link to="#" className="footer-link font-14">
                Terminos y Condiciones
              </Link>
              <Link to="#" className="footer-link font-14">
                Politicas de Privacidad
              </Link>
              <Link to="/contact" className="footer-link font-14">
                Contacto
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default FooterOne;
