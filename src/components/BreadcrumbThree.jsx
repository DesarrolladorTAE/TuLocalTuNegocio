import { useEffect, useState } from "react";

function formatoFechaRegistro(iso) {
  if (!iso) return "";
  const fecha = new Date(iso);
  const dia = fecha.toLocaleDateString("es-MX", { day: "numeric" });
  const mes = fecha.toLocaleDateString("es-MX", { month: "long" });
  const anio = fecha.toLocaleDateString("es-MX", { year: "numeric" });
  return `Se registró el ${dia} de ${mes} del ${anio}`;
}

const BreadcrumbThree = () => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const localUser = localStorage.getItem("user");
    if (localUser) {
      try {
        setUser(JSON.parse(localUser));
      } catch (err) {
        console.error("Error leyendo usuario:", err);
      }
    }
  }, []);

  return (
    <section className="breadcrumb-three section-bg position-relative z-index-1 overflow-hidden">
      <img
        src="assets/images/gradients/breadcrumb-gradient-bg.png"
        alt=""
        className="bg--gradient"
      />
      <img
        src="assets/images/shapes/element-moon3.png"
        alt=""
        className="element one"
      />
      <img
        src="assets/images/shapes/element-moon1.png"
        alt=""
        className="element three"
      />
      <div className="container container-two">
        <div className="breadcrumb-three-content border-bottom border-color">
          <div className="breadcrumb-three-content__inner">
            <div className="breadcrumb-three-content__left">
              <div className="flx-between align-items-end gap-3">
                <div className="author-profile d-flex gap-2 flex-column">
                  <div className="author-profile__thumb flex-shrink-0">
                    <img
                      src="assets/images/thumbs/author-profile.png"
                      alt=""
                    />
                  </div>
                  <div className="author-profile__info">
                    {/* Nombre del usuario */}
                    <h5 className="author-profile__name mb-2">
                      {user?.name || "Usuario"}
                    </h5>

                    {/* Fecha de registro */}
                    <span className="author-profile__membership font-14">
                      {user?.created_at
                        ? formatoFechaRegistro(user.created_at)
                        : ""}
                    </span>
                  </div>
                </div>
                <div className="breadcrumb-three-content__right flex-shrink-0 d-flex align-items-center gap-4 gap-lg-5">
                  <div className="author-rating">
                    <span className="author-rating__text text-heading fw-500 mb-2">
                      Calificación del autor
                    </span>
                    <div className="d-flex align-items-center gap-1">
                      <ul className="star-rating">
                        {[...Array(5)].map((_, i) => (
                          <li key={i} className="star-rating__item font-11">
                            <i className="fas fa-star" />
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                  <div className="sales">
                    <span className="sales__text mb-1 text-heading fw-500">
                      Sales
                    </span>
                    <h5 className="sales__amount mb-0">15,830</h5>
                  </div>
                </div>
              </div>
            </div>
          </div>

            <ul
              className="nav tab-bordered nav-pills mt-4"
              id="pills-tabbs"
              role="tablist"
            >
              <li className="nav-item" role="presentation">
                <button
                  className="nav-link active"
                  id="pills-profile-tab"
                  data-bs-toggle="pill"
                  data-bs-target="#pills-profile"
                  type="button"
                  role="tab"
                  aria-controls="pills-profile"
                  aria-selected="true"
                >
                  Perfil
                </button>
              </li>
              <li className="nav-item" role="presentation">
                <button
                  className="nav-link"
                  id="pills-portfolio-tab"
                  data-bs-toggle="pill"
                  data-bs-target="#pills-portfolio"
                  type="button"
                  role="tab"
                  aria-controls="pills-portfolio"
                  aria-selected="false"
                >
                  Productos{" "}
                </button>
              </li>
              
              <li className="nav-item" role="presentation">
                <button
                  className="nav-link"
                  id="pills-Settingss-tab"
                  data-bs-toggle="pill"
                  data-bs-target="#pills-Settingss"
                  type="button"
                  role="tab"
                  aria-controls="pills-Settingss"
                  aria-selected="false"
                >
                  Nuevo Producto{" "}
                </button>
              </li>
              <li className="nav-item" role="presentation">
                <button
                  className="nav-link"
                  id="pills-hiddenItem-tab"
                  data-bs-toggle="pill"
                  data-bs-target="#pills-hiddenItem"
                  type="button"
                  role="tab"
                  aria-controls="pills-hiddenItem"
                  aria-selected="false"
                >
                  Opiniones{" "}
                </button>
              </li>
              <li className="nav-item" role="presentation">
                <button
                  className="nav-link"
                  id="pills-refunded-tab"
                  data-bs-toggle="pill"
                  data-bs-target="#pills-refunded"
                  type="button"
                  role="tab"
                  aria-controls="pills-refunded"
                  aria-selected="false"
                >
                  Localidades{" "}
                </button>
              </li>
              

              
            </ul>
          </div>
        </div>
      </section>
      
    );
}

export default BreadcrumbThree;