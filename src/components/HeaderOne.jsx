import { useEffect, useState } from "react";
import ThemeToggle from "./ThemeToggle";
import { Link, NavLink, useNavigate, useLocation } from "react-router-dom";
// 👇 desde el service que hicimos
import {
  isAuthenticated,
  getUser,
  onAuthChange,
  logout as doLogout,
  fetchCategorias,
} from "../service";

const HeaderOne = () => {
  const [active, setActive] = useState(false);
  const [scroll, setScroll] = useState(false);
  const [categorias, setCategorias] = useState([]);
  const navigate = useNavigate();
  const location = useLocation();



  useEffect(() => {
    (async () => {
      try {
        const data = await fetchCategorias();
        // Tomar solo las primeras 30
        setCategorias(data.slice(0, 30));
      } catch (e) {
        console.error("Error cargando categorías:", e);
      }
    })();
  }, []);

  const categoriasEnFilas = [];
  for (let i = 0; i < categorias.length; i += 10) {
    categoriasEnFilas.push(categorias.slice(i, i + 10));
  }

  // 👇 auth state
  const [auth, setAuth] = useState({
    isAuth: isAuthenticated(),
    user: getUser(),
  });

  useEffect(() => {
    // suscríbete a cambios del service (login/logout)
    const off = onAuthChange(({ token, user }) =>
      setAuth({ isAuth: !!token, user })
    );
    return off;
  }, []);

  const handleLogout = async () => {
    await doLogout()
    navigate("/login", { replace: true })
  };

  useEffect(() => {
    var offCanvasNav = document.getElementById("offcanvas-navigation");
    var menuExpand = offCanvasNav.querySelectorAll(
      ".has-submenu > .nav-menu__link"
    );
    var numMenuExpand = menuExpand.length;

    function sideMenuExpand() {
      if (this.parentElement.classList.contains("active") === true) {
        this.parentElement.classList.remove("active");
      } else {
        for (let i = 0; i < numMenuExpand; i++) {
          menuExpand[i].parentElement.classList.remove("active");
        }
        this.parentElement.classList.add("active");
      }
    }

    for (let i = 0; i < numMenuExpand; i++) {
      menuExpand[i].addEventListener("click", sideMenuExpand);
    }
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      if (window.pageYOffset < 150) {
        setScroll(false);
      } else {
        setScroll(true);
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const mobileMenu = () => {
    setActive(!active);
  };

  return (
    <>
      <div className="overlay"></div>
      <div className={`side-overlay ${active && "show"}`}></div>
      {/* ==================== Header Start Here ==================== */}
      <header className={`header ${scroll ? "fixed-header" : ""} `}>
        <div className="container container-full">
          <nav className="header-inner flx-between">
            {/* Logo Start */}
            <div className="logo">
              <Link to="/" className="link white-version">
                <img
                  src="/assets/images/logo/logo.png"
                  alt="Logo"
                  style={{ height: "100px", width: "auto" }}
                />
              </Link>
              <Link to="/" className="link dark-version">
                <img
                  src="/assets/images/logo/white-logo-two.png"
                  alt="Logo"
                  style={{ height: "100px", width: "auto" }}
                />
              </Link>
            </div>
            {/* Logo End  */}
            {/* Menu Start  */}
            <div className="header-menu d-lg-block d-none">
              <ul className="nav-menu flx-align">
                <li className="nav-menu__item">
                  <NavLink to="/" className="nav-menu__link">
                    Inicio
                  </NavLink>
                </li>
                <li className="nav-menu__item">
                  <NavLink to="/all-product" className="nav-menu__link">
                    Productos
                  </NavLink>
                </li>
                {/* Header One - Categorías fijas */}
                <li className="nav-menu__item has-mega-cats">
                  <span className="nav-menu__link">Categorías</span>

                  <div className="mega-cats-panel">
                    <div className="mega-cats-head">
                      <span className="title">Explora categorías</span>
                      <a href="/all-product" className="view-all">
                        Ver todas
                      </a>
                    </div>

                    {/* 3 filas x 10 columnas: simplemente renderiza los 30 items */}
                    <ul className="mega-cats-grid">
                      {categorias.slice(0, 30).map((cat) => (
                        <li key={cat.id} className="mega-cats-item">
                          <Link
                            to={`/all-product?cat=${cat.id}`}
                            className="mega-cats-link"
                          >
                            {cat.name}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                </li>

                {/* <li className="nav-menu__item">
                  <NavLink to="/blog" className="nav-menu__link">
                    Vendedores
                  </NavLink>
                </li> */}

                <li className="nav-menu__item">
                  <NavLink to="/contact" className="nav-menu__link">
                    Contactanos
                  </NavLink>
                </li>
              </ul>
            </div>
            {/* Menu End  */}
            {/* Header Right start */}
            <div className="header-right flx-align">
              {/* <Link
                to="/cart"
                className="header-right__button cart-btn position-relative"
              >
                <img
                  src="/assets/images/icons/cart.svg"
                  alt=""
                  className="white-version"
                />
                <img
                  src="/assets/images/icons/cart-white.svg"
                  alt=""
                  className="dark-version"
                />
                <span className="qty-badge font-12">0</span>
              </Link> */}
              {/* Light Dark Mode */}
              <ThemeToggle />
              {/* Light Dark Mode */}
              {/* ...dentro de header-right__inner (versión desktop) */}
              <div className="header-right__inner gap-3 flx-align d-lg-flex d-none">
                {!auth.isAuth ? (
                  <Link to="/register" className="btn btn-main pill">
                    <span className="icon-left icon">
                      <img src="/assets/images/icons/user.svg" alt="" />
                    </span>
                    Crea una Cuenta
                  </Link>
                ) : (
                  <div className="dropdown">
                    <button
                      className="btn btn-outline-light pill dropdown-toggle"
                      type="button"
                      data-bs-toggle="dropdown"
                      aria-expanded="false"
                    >
                      {auth.user?.name || auth.user?.email || "Mi cuenta"}
                    </button>
                    <ul className="dropdown-menu dropdown-menu-end">
                      <li>
                        <Link className="dropdown-item" to="/profile">
                          Mi Perfil
                        </Link>
                      </li>

                      <li>
                        <hr className="dropdown-divider" />
                      </li>
                      <li>
                        <button
                          className="dropdown-item text-danger"
                          onClick={handleLogout}
                        >
                          Cerrar sesión
                        </button>
                      </li>
                    </ul>
                  </div>
                )}
              </div>

              <button
                type="button"
                className="toggle-mobileMenu d-lg-none"
                onClick={mobileMenu}
              >
                <i className="las la-bars" />
              </button>
            </div>
            {/* Header Right End  */}
          </nav>
        </div>
      </header>
      {location.pathname === '/' && (
        <div className="mega-cats-bar">
          <div className="container">
            <div className="mega-cats-head">
              <span className="title">Explora categorías</span>
              <a href="/all-product" className="view-all">
                Ver todas
              </a>
            </div>
            <ul className="mega-cats-grid">
              {categorias.slice(0, 30).map((cat) => (
                <li key={cat.id} className="mega-cats-item">
                  <Link
                    to={`/all-product?cat=${cat.id}`}
                    className="mega-cats-link"
                  >
                    {cat.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}


      {/* ==================== Header End Here ==================== */}

      <div className={`mobile-menu d-lg-none d-block ${active && "active"}`}>
        <button
          type="button"
          className="close-button text-body hover-text-main"
          onClick={mobileMenu}
        >
          <i className="las la-times" />
        </button>
        <div className="mobile-menu__inner">
          <Link to="/" className="mobile-menu__logo">
            <img
              src="/assets/images/logo/logo.png"
              alt="Logo"
              className="white-version"
            />
            <img
              src="/assets/images/logo/white-logo-two.png"
              alt="Logo"
              className="dark-version"
            />
          </Link>
          <div className="mobile-menu__menu">
            <ul
              className="nav-menu flx-align nav-menu--mobile"
              id="offcanvas-navigation"
            >
              <li className="nav-menu__item">
                <NavLink to="/" className="nav-menu__link">
                  Inicio
                </NavLink>
              </li>
              <li className="nav-menu__item">
                <NavLink to="/all-product" className="nav-menu__link">
                  Productos
                </NavLink>
              </li>
              <li className="nav-menu__item has-submenu">
                <span className="nav-menu__link">Categorías</span>
                <div className="nav-submenu mega-menu">
                  {categoriasEnFilas.map((fila, idx) => (
                    <ul key={idx} className="nav-submenu__col">
                      {fila.map((cat) => (
                        <li key={cat.id} className="nav-submenu__item">
                          <a
                            href={`/all-product/${cat.slug}`}
                            className="nav-submenu__link"
                          >
                            {cat.name}
                          </a>
                        </li>
                      ))}
                    </ul>
                  ))}
                </div>
              </li>

              <li className="nav-menu__item">
                <NavLink to="/contact" className="nav-menu__link">
                  Contact
                </NavLink>
              </li>
            </ul>
            <div className="header-right__inner d-lg-none my-3 gap-1 d-flex flx-align">
              {!auth.isAuth ? (
                <Link to="/register" className="btn btn-main pill w-100">
                  <span className="icon-left icon">
                    <img src="/assets/images/icons/user.svg" alt="" />
                  </span>
                  Crea una Cuenta
                </Link>
              ) : (
                <div className="dropdown w-100">
                  <button
                    className="btn btn-outline-light pill dropdown-toggle w-100 text-start"
                    type="button"
                    data-bs-toggle="dropdown"
                    aria-expanded="false"
                  >
                    {auth.user?.name || auth.user?.email || "Mi cuenta"}
                  </button>
                  <ul className="dropdown-menu w-100">
                    <li>
                      <Link className="dropdown-item" to="/profile">
                        Mi Perfil
                      </Link>
                    </li>
                    <li>
                      <button
                        className="dropdown-item text-danger"
                        onClick={handleLogout}
                      >
                        Cerrar sesión
                      </button>
                    </li>
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default HeaderOne;
