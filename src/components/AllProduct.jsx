

import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { fetchCategorias } from "../service";

const AllProduct = () => {
  const [activeButton, setActiveButton] = useState("grid-view");
  const [filter, setFilter] = useState(false);
  const [categorias, setCategorias] = useState([]);
  const [categoriasAll, setCategoriasAll] = useState([]);

  const handleClick = (buttonName) => {
    setActiveButton(buttonName);
  };

  useEffect(() => {
    let cancelled = false;

    // util: baraja y toma N
    const pickRandom = (arr, n) => {
      const a = [...arr];
      for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
      }
      return a.slice(0, n);
    };

    (async () => {
      try {
        const res = await fetchCategorias(); // tu service

        // según cómo devuelve tu service, normaliza:
        const list = Array.isArray(res) ? res : res?.data;

        if (Array.isArray(list) && !cancelled) {
          setCategorias(pickRandom(list, 5));
        }
      } catch (e) {
        console.error("Error cargando categorías:", e);
      }
    })();

    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const res = await fetchCategorias();
        const list = Array.isArray(res) ? res : res?.data;
        if (Array.isArray(list) && !cancelled) {
          setCategoriasAll(list);
        }
      } catch (e) {
        console.error("Error cargando TODAS las categorías:", e);
      }
    })();

    return () => { cancelled = true; };
  }, []);


  <div className="filter-sidebar__item">
    <button
      type="button"
      className="filter-sidebar__button font-16 text-capitalize fw-500"
    >
      Category
    </button>
    <div className="filter-sidebar__content">
      <ul className="filter-sidebar-list">
        <li className="filter-sidebar-list__item">
          <Link to="/" className="filter-sidebar-list__text">
            All Categories
            <span className="qty">{categorias.length}</span>
          </Link>
        </li>

        {categorias.map((cat) => (
          <li key={cat.id} className="filter-sidebar-list__item">
            <Link
              to={`/categoria/${cat.slug || cat.id}`}
              className="filter-sidebar-list__text"
            >
              {cat.name}
              {cat.product_count !== undefined && (
                <span className="qty">{cat.product_count}</span>
              )}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  </div>
  const handleFilter = () => {
    setFilter(!filter);
  };

  return (
    <section className={`all-product padding-y-120 ${activeButton === "list-view" ? "list-view" : ""
      }`}>
      <div className="container container-two">
        <div className="row">
          <div className="col-lg-12">
            <div className="filter-tab gap-3 flx-between">
              <button
                type="button"
                className="filter-tab__button btn btn-outline-light pill d-flex align-items-center"
              >
                <span className="icon icon-left">
                  <img src="assets/images/icons/filter.svg" alt="" />
                </span>
                <span className="font-18 fw-500">Filtros</span>
              </button>
              <ul
                className="nav common-tab nav-pills mb-0 gap-lg-2 gap-1 ms-lg-auto"
                id="pills-tab"
                role="tablist"
              >
                {/* Botón fijo "Todas" */}
                <li className="nav-item" role="presentation">
                  <button
                    className="nav-link active"
                    id="pills-todas-tab"
                    data-bs-toggle="pill"
                    data-bs-target="#pills-todas"
                    type="button"
                    role="tab"
                    aria-selected="true"
                  >
                    Todas
                  </button>
                </li>

                {/* Categorías aleatorias */}
                {categorias.map(cat => (
                  <li className="nav-item" role="presentation" key={cat.id}>
                    <button
                      className="nav-link"
                      id={`pills-${cat.id}-tab`}
                      data-bs-toggle="pill"
                      data-bs-target={`#pills-${cat.id}`}
                      type="button"
                      role="tab"
                      aria-selected="false"
                    >
                      {cat.name}
                    </button>
                  </li>
                ))}
              </ul>
              <div className="list-grid d-flex align-items-center gap-2">
                <button
                  className={`list-grid__button list-button d-sm-flex d-none text-body ${activeButton === "list-view" ? "active" : ""
                    }`}
                  onClick={() => handleClick("list-view")}
                >
                  <i className="las la-list" />
                </button>
                <button
                  className={`list-grid__button grid-button d-sm-flex d-none  text-body ${activeButton === "grid-view" ? "active" : ""
                    }`}
                  onClick={() => handleClick("grid-view")}
                >
                  <i className="las la-border-all" />
                </button>
                <button className="list-grid__button sidebar-btn text-body d-lg-none d-flex" onClick={handleFilter}>
                  <i className="las la-bars" />
                </button>
              </div>
            </div>
            <form action="#" className="filter-form pb-4 d-block">
              <div className="row gy-3">
                <div className="col-sm-4 col-xs-6">
                  <div className="flx-between gap-1">
                    <label htmlFor="tag" className="form-label font-16">
                      Tag
                    </label>
                    <button type="reset" className="text-body font-14">
                      Clear
                    </button>
                  </div>
                  <div className="position-relative">
                    <input
                      type="text"
                      className="common-input border-gray-five common-input--withLeftIcon"
                      id="tag"
                      placeholder="Search By Tag..."
                    />
                    <span className="input-icon input-icon--left">
                      <img src="assets/images/icons/search-two.svg" alt="" />
                    </span>
                  </div>
                </div>
                <div className="col-sm-4 col-xs-6">
                  <div className="flx-between gap-1">
                    <label htmlFor="Price" className="form-label font-16">
                      Price
                    </label>
                    <button type="reset" className="text-body font-14">
                      Clear
                    </button>
                  </div>
                  <div className="position-relative">
                    <input
                      type="text"
                      className="common-input border-gray-five"
                      id="Price"
                      placeholder="$7 - $29"
                    />
                  </div>
                </div>
                <div className="col-sm-4">
                  <div className="flx-between gap-1">
                    <label htmlFor="time" className="form-label font-16">
                      Time Frame
                    </label>
                    <button type="reset" className="text-body font-14">
                      Clear
                    </button>
                  </div>
                  <div className="position-relative select-has-icon">
                    <select id="time" className="common-input border-gray-five" defaultValue={1}>
                      <option value={1}>Now</option>
                      <option value={2}>Yesterday</option>
                      <option value={2}>1 Month Ago</option>
                    </select>
                  </div>
                </div>
              </div>
            </form>
          </div>
          <div className="col-xl-3 col-lg-4">
            {/* ===================== Filter Sidebar Start ============================= */}
            <div className={`filter-sidebar ${filter && "show"}`}>
              <button
                type="button"
                className="filter-sidebar__close p-2 position-absolute end-0 top-0 z-index-1 text-body hover-text-main font-20 d-lg-none d-block"
                onClick={handleFilter}>
                <i className="las la-times" />
              </button>
              <div className="filter-sidebar__item">
                <button
                  type="button"
                  className="filter-sidebar__button font-16 text-capitalize fw-500"
                >
                  Categorias
                </button>

                <div className="filter-sidebar__content">
                  <ul className="filter-sidebar-list">
                    <li className="filter-sidebar-list__item">
                      <Link  className="filter-sidebar-list__text">
                        Todas las Categorias <span className="qty">{categoriasAll.length}</span>
                      </Link>
                    </li>

                    {categoriasAll.map(cat => (
                      <li key={cat.id} className="filter-sidebar-list__item">
                        <Link
                          to={`/categoria/${cat.slug || cat.id}`}
                          className="filter-sidebar-list__text"
                        >
                          {cat.name}
                          {cat.product_count != null && (
                            <span className="qty">{cat.product_count}</span>
                          )}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
            {/* ===================== Filter Sidebar End ============================= */}
          </div>
          <div className="col-xl-9 col-lg-8">
            <div className="tab-content" id="pills-tabContent">
              <div
                className="tab-pane fade show active"
                id="pills-product"
                role="tabpanel"
                aria-labelledby="pills-product-tab"
                tabIndex={0}
              >
                <div className="row gy-4 list-grid-wrapper">
                  <div className="col-xl-4 col-sm-6">
                    <div className="product-item section-bg">
                      <div className="product-item__thumb d-flex">
                        <Link to="/product-details" className="link w-100">
                          <img
                            src="assets/images/thumbs/product-img1.png"
                            alt=""
                            className="cover-img"
                          />
                        </Link>
                        <button
                          type="button"
                          className="product-item__wishlist"
                        >
                          <i className="fas fa-heart" />
                        </button>
                      </div>
                      <div className="product-item__content">
                        <h6 className="product-item__title">
                          <Link to="/product-details" className="link">
                            SaaS dashboard digital products Title here
                          </Link>
                        </h6>
                        <div className="product-item__info flx-between gap-2">
                          <span className="product-item__author">
                            by
                            <Link
                              to="/profile"
                              className="link hover-text-decoration-underline"
                            >
                              themepix
                            </Link>
                          </span>
                          <div className="flx-align gap-2">
                            <h6 className="product-item__price mb-0">$120</h6>
                            <span className="product-item__prevPrice text-decoration-line-through">
                              $259
                            </span>
                          </div>
                        </div>
                        <div className="product-item__bottom flx-between gap-2">
                          <div>
                            <span className="product-item__sales font-14 mb-2">
                              1200 Sales
                            </span>
                            <div className="d-flex align-items-center gap-1">
                              <ul className="star-rating">
                                <li className="star-rating__item font-11">
                                  <i className="fas fa-star" />
                                </li>
                                <li className="star-rating__item font-11">
                                  <i className="fas fa-star" />
                                </li>
                                <li className="star-rating__item font-11">
                                  <i className="fas fa-star" />
                                </li>
                                <li className="star-rating__item font-11">
                                  <i className="fas fa-star" />
                                </li>
                                <li className="star-rating__item font-11">
                                  <i className="fas fa-star" />
                                </li>
                              </ul>
                              <span className="star-rating__text text-heading fw-500 font-14">
                                (16)
                              </span>
                            </div>
                          </div>
                          <Link
                            to="/product-details"
                            className="btn btn-outline-light btn-sm pill"
                          >
                            Live Demo
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="col-xl-4 col-sm-6">
                    <div className="product-item section-bg">
                      <div className="product-item__thumb d-flex">
                        <Link to="/product-details" className="link w-100">
                          <img
                            src="assets/images/thumbs/product-img2.png"
                            alt=""
                            className="cover-img"
                          />
                        </Link>
                        <button
                          type="button"
                          className="product-item__wishlist"
                        >
                          <i className="fas fa-heart" />
                        </button>
                      </div>
                      <div className="product-item__content">
                        <h6 className="product-item__title">
                          <Link to="/product-details" className="link">
                            SaaS dashboard digital products Title here
                          </Link>
                        </h6>
                        <div className="product-item__info flx-between gap-2">
                          <span className="product-item__author">
                            by
                            <Link
                              to="/profile"
                              className="link hover-text-decoration-underline"
                            >
                              themepix
                            </Link>
                          </span>
                          <div className="flx-align gap-2">
                            <h6 className="product-item__price mb-0">$129</h6>
                            <span className="product-item__prevPrice text-decoration-line-through">
                              $236
                            </span>
                          </div>
                        </div>
                        <div className="product-item__bottom flx-between gap-2">
                          <div>
                            <span className="product-item__sales font-14 mb-2">
                              100 Sales
                            </span>
                            <div className="d-flex align-items-center gap-1">
                              <ul className="star-rating">
                                <li className="star-rating__item font-11">
                                  <i className="fas fa-star" />
                                </li>
                                <li className="star-rating__item font-11">
                                  <i className="fas fa-star" />
                                </li>
                                <li className="star-rating__item font-11">
                                  <i className="fas fa-star" />
                                </li>
                                <li className="star-rating__item font-11">
                                  <i className="fas fa-star" />
                                </li>
                                <li className="star-rating__item font-11">
                                  <i className="fas fa-star" />
                                </li>
                              </ul>
                              <span className="star-rating__text text-heading fw-500 font-14">
                                (16)
                              </span>
                            </div>
                          </div>
                          <Link
                            to="/product-details"
                            className="btn btn-outline-light btn-sm pill"
                          >
                            Live Demo
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="col-xl-4 col-sm-6">
                    <div className="product-item section-bg">
                      <div className="product-item__thumb d-flex">
                        <Link to="/product-details" className="link w-100">
                          <img
                            src="assets/images/thumbs/product-img3.png"
                            alt=""
                            className="cover-img"
                          />
                        </Link>
                        <button
                          type="button"
                          className="product-item__wishlist"
                        >
                          <i className="fas fa-heart" />
                        </button>
                      </div>
                      <div className="product-item__content">
                        <h6 className="product-item__title">
                          <Link to="/product-details" className="link">
                            SaaS dashboard digital products Title here
                          </Link>
                        </h6>
                        <div className="product-item__info flx-between gap-2">
                          <span className="product-item__author">
                            by
                            <Link
                              to="/profile"
                              className="link hover-text-decoration-underline"
                            >
                              themepix
                            </Link>
                          </span>
                          <div className="flx-align gap-2">
                            <h6 className="product-item__price mb-0">$79</h6>
                            <span className="product-item__prevPrice text-decoration-line-through">
                              $99
                            </span>
                          </div>
                        </div>
                        <div className="product-item__bottom flx-between gap-2">
                          <div>
                            <span className="product-item__sales font-14 mb-2">
                              900 Sales
                            </span>
                            <div className="d-flex align-items-center gap-1">
                              <ul className="star-rating">
                                <li className="star-rating__item font-11">
                                  <i className="fas fa-star" />
                                </li>
                                <li className="star-rating__item font-11">
                                  <i className="fas fa-star" />
                                </li>
                                <li className="star-rating__item font-11">
                                  <i className="fas fa-star" />
                                </li>
                                <li className="star-rating__item font-11">
                                  <i className="fas fa-star" />
                                </li>
                                <li className="star-rating__item font-11">
                                  <i className="fas fa-star" />
                                </li>
                              </ul>
                              <span className="star-rating__text text-heading fw-500 font-14">
                                (16)
                              </span>
                            </div>
                          </div>
                          <Link
                            to="/product-details"
                            className="btn btn-outline-light btn-sm pill"
                          >
                            Live Demo
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="col-xl-4 col-sm-6">
                    <div className="product-item section-bg">
                      <div className="product-item__thumb d-flex">
                        <Link to="/product-details" className="link w-100">
                          <img
                            src="assets/images/thumbs/product-img4.png"
                            alt=""
                            className="cover-img"
                          />
                        </Link>
                        <button
                          type="button"
                          className="product-item__wishlist"
                        >
                          <i className="fas fa-heart" />
                        </button>
                      </div>
                      <div className="product-item__content">
                        <h6 className="product-item__title">
                          <Link to="/product-details" className="link">
                            SaaS dashboard digital products Title here
                          </Link>
                        </h6>
                        <div className="product-item__info flx-between gap-2">
                          <span className="product-item__author">
                            by
                            <Link
                              to="/profile"
                              className="link hover-text-decoration-underline"
                            >
                              themepix
                            </Link>
                          </span>
                          <div className="flx-align gap-2">
                            <h6 className="product-item__price mb-0">$59</h6>
                            <span className="product-item__prevPrice text-decoration-line-through">
                              $129
                            </span>
                          </div>
                        </div>
                        <div className="product-item__bottom flx-between gap-2">
                          <div>
                            <span className="product-item__sales font-14 mb-2">
                              1225 Sales
                            </span>
                            <div className="d-flex align-items-center gap-1">
                              <ul className="star-rating">
                                <li className="star-rating__item font-11">
                                  <i className="fas fa-star" />
                                </li>
                                <li className="star-rating__item font-11">
                                  <i className="fas fa-star" />
                                </li>
                                <li className="star-rating__item font-11">
                                  <i className="fas fa-star" />
                                </li>
                                <li className="star-rating__item font-11">
                                  <i className="fas fa-star" />
                                </li>
                                <li className="star-rating__item font-11">
                                  <i className="fas fa-star" />
                                </li>
                              </ul>
                              <span className="star-rating__text text-heading fw-500 font-14">
                                (16)
                              </span>
                            </div>
                          </div>
                          <Link
                            to="/product-details"
                            className="btn btn-outline-light btn-sm pill"
                          >
                            Live Demo
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="col-xl-4 col-sm-6">
                    <div className="product-item section-bg">
                      <div className="product-item__thumb d-flex">
                        <Link to="/product-details" className="link w-100">
                          <img
                            src="assets/images/thumbs/product-img5.png"
                            alt=""
                            className="cover-img"
                          />
                        </Link>
                        <button
                          type="button"
                          className="product-item__wishlist"
                        >
                          <i className="fas fa-heart" />
                        </button>
                      </div>
                      <div className="product-item__content">
                        <h6 className="product-item__title">
                          <Link to="/product-details" className="link">
                            SaaS dashboard digital products Title here
                          </Link>
                        </h6>
                        <div className="product-item__info flx-between gap-2">
                          <span className="product-item__author">
                            by
                            <Link
                              to="/profile"
                              className="link hover-text-decoration-underline"
                            >
                              themepix
                            </Link>
                          </span>
                          <div className="flx-align gap-2">
                            <h6 className="product-item__price mb-0">$99</h6>
                            <span className="product-item__prevPrice text-decoration-line-through">
                              $129
                            </span>
                          </div>
                        </div>
                        <div className="product-item__bottom flx-between gap-2">
                          <div>
                            <span className="product-item__sales font-14 mb-2">
                              1300 Sales
                            </span>
                            <div className="d-flex align-items-center gap-1">
                              <ul className="star-rating">
                                <li className="star-rating__item font-11">
                                  <i className="fas fa-star" />
                                </li>
                                <li className="star-rating__item font-11">
                                  <i className="fas fa-star" />
                                </li>
                                <li className="star-rating__item font-11">
                                  <i className="fas fa-star" />
                                </li>
                                <li className="star-rating__item font-11">
                                  <i className="fas fa-star" />
                                </li>
                                <li className="star-rating__item font-11">
                                  <i className="fas fa-star" />
                                </li>
                              </ul>
                              <span className="star-rating__text text-heading fw-500 font-14">
                                (16)
                              </span>
                            </div>
                          </div>
                          <Link
                            to="/product-details"
                            className="btn btn-outline-light btn-sm pill"
                          >
                            Live Demo
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="col-xl-4 col-sm-6">
                    <div className="product-item section-bg">
                      <div className="product-item__thumb d-flex">
                        <Link to="/product-details" className="link w-100">
                          <img
                            src="assets/images/thumbs/product-img6.png"
                            alt=""
                            className="cover-img"
                          />
                        </Link>
                        <button
                          type="button"
                          className="product-item__wishlist"
                        >
                          <i className="fas fa-heart" />
                        </button>
                      </div>
                      <div className="product-item__content">
                        <h6 className="product-item__title">
                          <Link to="/product-details" className="link">
                            SaaS dashboard digital products Title here
                          </Link>
                        </h6>
                        <div className="product-item__info flx-between gap-2">
                          <span className="product-item__author">
                            by
                            <Link
                              to="/profile"
                              className="link hover-text-decoration-underline"
                            >
                              themepix
                            </Link>
                          </span>
                          <div className="flx-align gap-2">
                            <h6 className="product-item__price mb-0">$129</h6>
                            <span className="product-item__prevPrice text-decoration-line-through">
                              $256
                            </span>
                          </div>
                        </div>
                        <div className="product-item__bottom flx-between gap-2">
                          <div>
                            <span className="product-item__sales font-14 mb-2">
                              200 Sales
                            </span>
                            <div className="d-flex align-items-center gap-1">
                              <ul className="star-rating">
                                <li className="star-rating__item font-11">
                                  <i className="fas fa-star" />
                                </li>
                                <li className="star-rating__item font-11">
                                  <i className="fas fa-star" />
                                </li>
                                <li className="star-rating__item font-11">
                                  <i className="fas fa-star" />
                                </li>
                                <li className="star-rating__item font-11">
                                  <i className="fas fa-star" />
                                </li>
                                <li className="star-rating__item font-11">
                                  <i className="fas fa-star" />
                                </li>
                              </ul>
                              <span className="star-rating__text text-heading fw-500 font-14">
                                (16)
                              </span>
                            </div>
                          </div>
                          <Link
                            to="/product-details"
                            className="btn btn-outline-light btn-sm pill"
                          >
                            Live Demo
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="col-xl-4 col-sm-6">
                    <div className="product-item section-bg">
                      <div className="product-item__thumb d-flex">
                        <Link to="/product-details" className="link w-100">
                          <img
                            src="assets/images/thumbs/product-img7.png"
                            alt=""
                            className="cover-img"
                          />
                        </Link>
                        <button
                          type="button"
                          className="product-item__wishlist"
                        >
                          <i className="fas fa-heart" />
                        </button>
                      </div>
                      <div className="product-item__content">
                        <h6 className="product-item__title">
                          <Link to="/product-details" className="link">
                            SaaS dashboard digital products Title here
                          </Link>
                        </h6>
                        <div className="product-item__info flx-between gap-2">
                          <span className="product-item__author">
                            by
                            <Link
                              to="/profile"
                              className="link hover-text-decoration-underline"
                            >
                              themepix
                            </Link>
                          </span>
                          <div className="flx-align gap-2">
                            <h6 className="product-item__price mb-0">$129</h6>
                            <span className="product-item__prevPrice text-decoration-line-through">
                              $259
                            </span>
                          </div>
                        </div>
                        <div className="product-item__bottom flx-between gap-2">
                          <div>
                            <span className="product-item__sales font-14 mb-2">
                              500 Sales
                            </span>
                            <div className="d-flex align-items-center gap-1">
                              <ul className="star-rating">
                                <li className="star-rating__item font-11">
                                  <i className="fas fa-star" />
                                </li>
                                <li className="star-rating__item font-11">
                                  <i className="fas fa-star" />
                                </li>
                                <li className="star-rating__item font-11">
                                  <i className="fas fa-star" />
                                </li>
                                <li className="star-rating__item font-11">
                                  <i className="fas fa-star" />
                                </li>
                                <li className="star-rating__item font-11">
                                  <i className="fas fa-star" />
                                </li>
                              </ul>
                              <span className="star-rating__text text-heading fw-500 font-14">
                                (16)
                              </span>
                            </div>
                          </div>
                          <Link
                            to="/product-details"
                            className="btn btn-outline-light btn-sm pill"
                          >
                            Live Demo
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="col-xl-4 col-sm-6">
                    <div className="product-item section-bg">
                      <div className="product-item__thumb d-flex">
                        <Link to="/product-details" className="link w-100">
                          <img
                            src="assets/images/thumbs/product-img8.png"
                            alt=""
                            className="cover-img"
                          />
                        </Link>
                        <button
                          type="button"
                          className="product-item__wishlist"
                        >
                          <i className="fas fa-heart" />
                        </button>
                      </div>
                      <div className="product-item__content">
                        <h6 className="product-item__title">
                          <Link to="/product-details" className="link">
                            SaaS dashboard digital products Title here
                          </Link>
                        </h6>
                        <div className="product-item__info flx-between gap-2">
                          <span className="product-item__author">
                            by
                            <Link
                              to="/profile"
                              className="link hover-text-decoration-underline"
                            >
                              themepix
                            </Link>
                          </span>
                          <div className="flx-align gap-2">
                            <h6 className="product-item__price mb-0">$79</h6>
                            <span className="product-item__prevPrice text-decoration-line-through">
                              $99
                            </span>
                          </div>
                        </div>
                        <div className="product-item__bottom flx-between gap-2">
                          <div>
                            <span className="product-item__sales font-14 mb-2">
                              2100 Sales
                            </span>
                            <div className="d-flex align-items-center gap-1">
                              <ul className="star-rating">
                                <li className="star-rating__item font-11">
                                  <i className="fas fa-star" />
                                </li>
                                <li className="star-rating__item font-11">
                                  <i className="fas fa-star" />
                                </li>
                                <li className="star-rating__item font-11">
                                  <i className="fas fa-star" />
                                </li>
                                <li className="star-rating__item font-11">
                                  <i className="fas fa-star" />
                                </li>
                                <li className="star-rating__item font-11">
                                  <i className="fas fa-star" />
                                </li>
                              </ul>
                              <span className="star-rating__text text-heading fw-500 font-14">
                                (16)
                              </span>
                            </div>
                          </div>
                          <Link
                            to="/product-details"
                            className="btn btn-outline-light btn-sm pill"
                          >
                            Live Demo
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="col-xl-4 col-sm-6">
                    <div className="product-item section-bg">
                      <div className="product-item__thumb d-flex">
                        <Link to="/product-details" className="link w-100">
                          <img
                            src="assets/images/thumbs/product-img9.png"
                            alt=""
                            className="cover-img"
                          />
                        </Link>
                        <button
                          type="button"
                          className="product-item__wishlist"
                        >
                          <i className="fas fa-heart" />
                        </button>
                      </div>
                      <div className="product-item__content">
                        <h6 className="product-item__title">
                          <Link to="/product-details" className="link">
                            SaaS dashboard digital products Title here
                          </Link>
                        </h6>
                        <div className="product-item__info flx-between gap-2">
                          <span className="product-item__author">
                            by
                            <Link
                              to="/profile"
                              className="link hover-text-decoration-underline"
                            >
                              themepix
                            </Link>
                          </span>
                          <div className="flx-align gap-2">
                            <h6 className="product-item__price mb-0">$79</h6>
                            <span className="product-item__prevPrice text-decoration-line-through">
                              $99
                            </span>
                          </div>
                        </div>
                        <div className="product-item__bottom flx-between gap-2">
                          <div>
                            <span className="product-item__sales font-14 mb-2">
                              2100 Sales
                            </span>
                            <div className="d-flex align-items-center gap-1">
                              <ul className="star-rating">
                                <li className="star-rating__item font-11">
                                  <i className="fas fa-star" />
                                </li>
                                <li className="star-rating__item font-11">
                                  <i className="fas fa-star" />
                                </li>
                                <li className="star-rating__item font-11">
                                  <i className="fas fa-star" />
                                </li>
                                <li className="star-rating__item font-11">
                                  <i className="fas fa-star" />
                                </li>
                                <li className="star-rating__item font-11">
                                  <i className="fas fa-star" />
                                </li>
                              </ul>
                              <span className="star-rating__text text-heading fw-500 font-14">
                                (16)
                              </span>
                            </div>
                          </div>
                          <Link
                            to="/product-details"
                            className="btn btn-outline-light btn-sm pill"
                          >
                            Live Demo
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="col-xl-4 col-sm-6">
                    <div className="product-item section-bg">
                      <div className="product-item__thumb d-flex">
                        <Link to="/product-details" className="link w-100">
                          <img
                            src="assets/images/thumbs/product-img10.png"
                            alt=""
                            className="cover-img"
                          />
                        </Link>
                        <button
                          type="button"
                          className="product-item__wishlist"
                        >
                          <i className="fas fa-heart" />
                        </button>
                      </div>
                      <div className="product-item__content">
                        <h6 className="product-item__title">
                          <Link to="/product-details" className="link">
                            SaaS dashboard digital products Title here
                          </Link>
                        </h6>
                        <div className="product-item__info flx-between gap-2">
                          <span className="product-item__author">
                            by
                            <Link
                              to="/profile"
                              className="link hover-text-decoration-underline"
                            >
                              themepix
                            </Link>
                          </span>
                          <div className="flx-align gap-2">
                            <h6 className="product-item__price mb-0">$79</h6>
                            <span className="product-item__prevPrice text-decoration-line-through">
                              $99
                            </span>
                          </div>
                        </div>
                        <div className="product-item__bottom flx-between gap-2">
                          <div>
                            <span className="product-item__sales font-14 mb-2">
                              2100 Sales
                            </span>
                            <div className="d-flex align-items-center gap-1">
                              <ul className="star-rating">
                                <li className="star-rating__item font-11">
                                  <i className="fas fa-star" />
                                </li>
                                <li className="star-rating__item font-11">
                                  <i className="fas fa-star" />
                                </li>
                                <li className="star-rating__item font-11">
                                  <i className="fas fa-star" />
                                </li>
                                <li className="star-rating__item font-11">
                                  <i className="fas fa-star" />
                                </li>
                                <li className="star-rating__item font-11">
                                  <i className="fas fa-star" />
                                </li>
                              </ul>
                              <span className="star-rating__text text-heading fw-500 font-14">
                                (16)
                              </span>
                            </div>
                          </div>
                          <Link
                            to="/product-details"
                            className="btn btn-outline-light btn-sm pill"
                          >
                            Live Demo
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="col-xl-4 col-sm-6">
                    <div className="product-item section-bg">
                      <div className="product-item__thumb d-flex">
                        <Link to="/product-details" className="link w-100">
                          <img
                            src="assets/images/thumbs/product-img11.png"
                            alt=""
                            className="cover-img"
                          />
                        </Link>
                        <button
                          type="button"
                          className="product-item__wishlist"
                        >
                          <i className="fas fa-heart" />
                        </button>
                      </div>
                      <div className="product-item__content">
                        <h6 className="product-item__title">
                          <Link to="/product-details" className="link">
                            SaaS dashboard digital products Title here
                          </Link>
                        </h6>
                        <div className="product-item__info flx-between gap-2">
                          <span className="product-item__author">
                            by
                            <Link
                              to="/profile"
                              className="link hover-text-decoration-underline"
                            >
                              themepix
                            </Link>
                          </span>
                          <div className="flx-align gap-2">
                            <h6 className="product-item__price mb-0">$79</h6>
                            <span className="product-item__prevPrice text-decoration-line-through">
                              $99
                            </span>
                          </div>
                        </div>
                        <div className="product-item__bottom flx-between gap-2">
                          <div>
                            <span className="product-item__sales font-14 mb-2">
                              2100 Sales
                            </span>
                            <div className="d-flex align-items-center gap-1">
                              <ul className="star-rating">
                                <li className="star-rating__item font-11">
                                  <i className="fas fa-star" />
                                </li>
                                <li className="star-rating__item font-11">
                                  <i className="fas fa-star" />
                                </li>
                                <li className="star-rating__item font-11">
                                  <i className="fas fa-star" />
                                </li>
                                <li className="star-rating__item font-11">
                                  <i className="fas fa-star" />
                                </li>
                                <li className="star-rating__item font-11">
                                  <i className="fas fa-star" />
                                </li>
                              </ul>
                              <span className="star-rating__text text-heading fw-500 font-14">
                                (16)
                              </span>
                            </div>
                          </div>
                          <Link
                            to="/product-details"
                            className="btn btn-outline-light btn-sm pill"
                          >
                            Live Demo
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="col-xl-4 col-sm-6">
                    <div className="product-item section-bg">
                      <div className="product-item__thumb d-flex">
                        <Link to="/product-details" className="link w-100">
                          <img
                            src="assets/images/thumbs/product-img12.png"
                            alt=""
                            className="cover-img"
                          />
                        </Link>
                        <button
                          type="button"
                          className="product-item__wishlist"
                        >
                          <i className="fas fa-heart" />
                        </button>
                      </div>
                      <div className="product-item__content">
                        <h6 className="product-item__title">
                          <Link to="/product-details" className="link">
                            SaaS dashboard digital products Title here
                          </Link>
                        </h6>
                        <div className="product-item__info flx-between gap-2">
                          <span className="product-item__author">
                            by
                            <Link
                              to="/profile"
                              className="link hover-text-decoration-underline"
                            >
                              themepix
                            </Link>
                          </span>
                          <div className="flx-align gap-2">
                            <h6 className="product-item__price mb-0">$79</h6>
                            <span className="product-item__prevPrice text-decoration-line-through">
                              $99
                            </span>
                          </div>
                        </div>
                        <div className="product-item__bottom flx-between gap-2">
                          <div>
                            <span className="product-item__sales font-14 mb-2">
                              2100 Sales
                            </span>
                            <div className="d-flex align-items-center gap-1">
                              <ul className="star-rating">
                                <li className="star-rating__item font-11">
                                  <i className="fas fa-star" />
                                </li>
                                <li className="star-rating__item font-11">
                                  <i className="fas fa-star" />
                                </li>
                                <li className="star-rating__item font-11">
                                  <i className="fas fa-star" />
                                </li>
                                <li className="star-rating__item font-11">
                                  <i className="fas fa-star" />
                                </li>
                                <li className="star-rating__item font-11">
                                  <i className="fas fa-star" />
                                </li>
                              </ul>
                              <span className="star-rating__text text-heading fw-500 font-14">
                                (16)
                              </span>
                            </div>
                          </div>
                          <Link
                            to="/product-details"
                            className="btn btn-outline-light btn-sm pill"
                          >
                            Live Demo
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                {/* Pagination Start */}
                <nav aria-label="Page navigation example">
                  <ul className="pagination common-pagination">
                    <li className="page-item">
                      <Link className="page-link" to="#">
                        1
                      </Link>
                    </li>
                    <li className="page-item">
                      <Link className="page-link" to="#">
                        2
                      </Link>
                    </li>
                    <li className="page-item">
                      <Link className="page-link" to="#">
                        3
                      </Link>
                    </li>
                    <li className="page-item">
                      <Link className="page-link" to="#">
                        4
                      </Link>
                    </li>
                    <li className="page-item">
                      <Link className="page-link" to="#">
                        5
                      </Link>
                    </li>
                    <li className="page-item">
                      <Link
                        className="page-link flx-align gap-2 flex-nowrap"
                        to="#"
                      >
                        Next
                        <span className="icon line-height-1 font-20">
                          <i className="las la-arrow-right" />
                        </span>
                      </Link>
                    </li>
                  </ul>
                </nav>
                {/* Pagination End */}
              </div>
              <div
                className="tab-pane fade"
                id="pills-bestMatch"
                role="tabpanel"
                aria-labelledby="pills-bestMatch-tab"
                tabIndex={0}
              >
                <div className="row gy-4 list-grid-wrapper">
                  <div className="col-xl-4 col-sm-6">
                    <div className="product-item section-bg">
                      <div className="product-item__thumb d-flex">
                        <Link to="/product-details" className="link w-100">
                          <img
                            src="assets/images/thumbs/product-img1.png"
                            alt=""
                            className="cover-img"
                          />
                        </Link>
                        <button
                          type="button"
                          className="product-item__wishlist"
                        >
                          <i className="fas fa-heart" />
                        </button>
                      </div>
                      <div className="product-item__content">
                        <h6 className="product-item__title">
                          <Link to="/product-details" className="link">
                            SaaS dashboard digital products Title here
                          </Link>
                        </h6>
                        <div className="product-item__info flx-between gap-2">
                          <span className="product-item__author">
                            by
                            <Link
                              to="/profile"
                              className="link hover-text-decoration-underline"
                            >
                              themepix
                            </Link>
                          </span>
                          <div className="flx-align gap-2">
                            <h6 className="product-item__price mb-0">$120</h6>
                            <span className="product-item__prevPrice text-decoration-line-through">
                              $259
                            </span>
                          </div>
                        </div>
                        <div className="product-item__bottom flx-between gap-2">
                          <div>
                            <span className="product-item__sales font-14 mb-2">
                              1200 Sales
                            </span>
                            <div className="d-flex align-items-center gap-1">
                              <ul className="star-rating">
                                <li className="star-rating__item font-11">
                                  <i className="fas fa-star" />
                                </li>
                                <li className="star-rating__item font-11">
                                  <i className="fas fa-star" />
                                </li>
                                <li className="star-rating__item font-11">
                                  <i className="fas fa-star" />
                                </li>
                                <li className="star-rating__item font-11">
                                  <i className="fas fa-star" />
                                </li>
                                <li className="star-rating__item font-11">
                                  <i className="fas fa-star" />
                                </li>
                              </ul>
                              <span className="star-rating__text text-heading fw-500 font-14">
                                (16)
                              </span>
                            </div>
                          </div>
                          <Link
                            to="/product-details"
                            className="btn btn-outline-light btn-sm pill"
                          >
                            Live Demo
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="col-xl-4 col-sm-6">
                    <div className="product-item section-bg">
                      <div className="product-item__thumb d-flex">
                        <Link to="/product-details" className="link w-100">
                          <img
                            src="assets/images/thumbs/product-img2.png"
                            alt=""
                            className="cover-img"
                          />
                        </Link>
                        <button
                          type="button"
                          className="product-item__wishlist"
                        >
                          <i className="fas fa-heart" />
                        </button>
                      </div>
                      <div className="product-item__content">
                        <h6 className="product-item__title">
                          <Link to="/product-details" className="link">
                            SaaS dashboard digital products Title here
                          </Link>
                        </h6>
                        <div className="product-item__info flx-between gap-2">
                          <span className="product-item__author">
                            by
                            <Link
                              to="/profile"
                              className="link hover-text-decoration-underline"
                            >
                              themepix
                            </Link>
                          </span>
                          <div className="flx-align gap-2">
                            <h6 className="product-item__price mb-0">$129</h6>
                            <span className="product-item__prevPrice text-decoration-line-through">
                              $236
                            </span>
                          </div>
                        </div>
                        <div className="product-item__bottom flx-between gap-2">
                          <div>
                            <span className="product-item__sales font-14 mb-2">
                              100 Sales
                            </span>
                            <div className="d-flex align-items-center gap-1">
                              <ul className="star-rating">
                                <li className="star-rating__item font-11">
                                  <i className="fas fa-star" />
                                </li>
                                <li className="star-rating__item font-11">
                                  <i className="fas fa-star" />
                                </li>
                                <li className="star-rating__item font-11">
                                  <i className="fas fa-star" />
                                </li>
                                <li className="star-rating__item font-11">
                                  <i className="fas fa-star" />
                                </li>
                                <li className="star-rating__item font-11">
                                  <i className="fas fa-star" />
                                </li>
                              </ul>
                              <span className="star-rating__text text-heading fw-500 font-14">
                                (16)
                              </span>
                            </div>
                          </div>
                          <Link
                            to="/product-details"
                            className="btn btn-outline-light btn-sm pill"
                          >
                            Live Demo
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="col-xl-4 col-sm-6">
                    <div className="product-item section-bg">
                      <div className="product-item__thumb d-flex">
                        <Link to="/product-details" className="link w-100">
                          <img
                            src="assets/images/thumbs/product-img3.png"
                            alt=""
                            className="cover-img"
                          />
                        </Link>
                        <button
                          type="button"
                          className="product-item__wishlist"
                        >
                          <i className="fas fa-heart" />
                        </button>
                      </div>
                      <div className="product-item__content">
                        <h6 className="product-item__title">
                          <Link to="/product-details" className="link">
                            SaaS dashboard digital products Title here
                          </Link>
                        </h6>
                        <div className="product-item__info flx-between gap-2">
                          <span className="product-item__author">
                            by
                            <Link
                              to="/profile"
                              className="link hover-text-decoration-underline"
                            >
                              themepix
                            </Link>
                          </span>
                          <div className="flx-align gap-2">
                            <h6 className="product-item__price mb-0">$79</h6>
                            <span className="product-item__prevPrice text-decoration-line-through">
                              $99
                            </span>
                          </div>
                        </div>
                        <div className="product-item__bottom flx-between gap-2">
                          <div>
                            <span className="product-item__sales font-14 mb-2">
                              900 Sales
                            </span>
                            <div className="d-flex align-items-center gap-1">
                              <ul className="star-rating">
                                <li className="star-rating__item font-11">
                                  <i className="fas fa-star" />
                                </li>
                                <li className="star-rating__item font-11">
                                  <i className="fas fa-star" />
                                </li>
                                <li className="star-rating__item font-11">
                                  <i className="fas fa-star" />
                                </li>
                                <li className="star-rating__item font-11">
                                  <i className="fas fa-star" />
                                </li>
                                <li className="star-rating__item font-11">
                                  <i className="fas fa-star" />
                                </li>
                              </ul>
                              <span className="star-rating__text text-heading fw-500 font-14">
                                (16)
                              </span>
                            </div>
                          </div>
                          <Link
                            to="/product-details"
                            className="btn btn-outline-light btn-sm pill"
                          >
                            Live Demo
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="col-xl-4 col-sm-6">
                    <div className="product-item section-bg">
                      <div className="product-item__thumb d-flex">
                        <Link to="/product-details" className="link w-100">
                          <img
                            src="assets/images/thumbs/product-img4.png"
                            alt=""
                            className="cover-img"
                          />
                        </Link>
                        <button
                          type="button"
                          className="product-item__wishlist"
                        >
                          <i className="fas fa-heart" />
                        </button>
                      </div>
                      <div className="product-item__content">
                        <h6 className="product-item__title">
                          <Link to="/product-details" className="link">
                            SaaS dashboard digital products Title here
                          </Link>
                        </h6>
                        <div className="product-item__info flx-between gap-2">
                          <span className="product-item__author">
                            by
                            <Link
                              to="/profile"
                              className="link hover-text-decoration-underline"
                            >
                              themepix
                            </Link>
                          </span>
                          <div className="flx-align gap-2">
                            <h6 className="product-item__price mb-0">$59</h6>
                            <span className="product-item__prevPrice text-decoration-line-through">
                              $129
                            </span>
                          </div>
                        </div>
                        <div className="product-item__bottom flx-between gap-2">
                          <div>
                            <span className="product-item__sales font-14 mb-2">
                              1225 Sales
                            </span>
                            <div className="d-flex align-items-center gap-1">
                              <ul className="star-rating">
                                <li className="star-rating__item font-11">
                                  <i className="fas fa-star" />
                                </li>
                                <li className="star-rating__item font-11">
                                  <i className="fas fa-star" />
                                </li>
                                <li className="star-rating__item font-11">
                                  <i className="fas fa-star" />
                                </li>
                                <li className="star-rating__item font-11">
                                  <i className="fas fa-star" />
                                </li>
                                <li className="star-rating__item font-11">
                                  <i className="fas fa-star" />
                                </li>
                              </ul>
                              <span className="star-rating__text text-heading fw-500 font-14">
                                (16)
                              </span>
                            </div>
                          </div>
                          <Link
                            to="/product-details"
                            className="btn btn-outline-light btn-sm pill"
                          >
                            Live Demo
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="col-xl-4 col-sm-6">
                    <div className="product-item section-bg">
                      <div className="product-item__thumb d-flex">
                        <Link to="/product-details" className="link w-100">
                          <img
                            src="assets/images/thumbs/product-img5.png"
                            alt=""
                            className="cover-img"
                          />
                        </Link>
                        <button
                          type="button"
                          className="product-item__wishlist"
                        >
                          <i className="fas fa-heart" />
                        </button>
                      </div>
                      <div className="product-item__content">
                        <h6 className="product-item__title">
                          <Link to="/product-details" className="link">
                            SaaS dashboard digital products Title here
                          </Link>
                        </h6>
                        <div className="product-item__info flx-between gap-2">
                          <span className="product-item__author">
                            by
                            <Link
                              to="/profile"
                              className="link hover-text-decoration-underline"
                            >
                              themepix
                            </Link>
                          </span>
                          <div className="flx-align gap-2">
                            <h6 className="product-item__price mb-0">$99</h6>
                            <span className="product-item__prevPrice text-decoration-line-through">
                              $129
                            </span>
                          </div>
                        </div>
                        <div className="product-item__bottom flx-between gap-2">
                          <div>
                            <span className="product-item__sales font-14 mb-2">
                              1300 Sales
                            </span>
                            <div className="d-flex align-items-center gap-1">
                              <ul className="star-rating">
                                <li className="star-rating__item font-11">
                                  <i className="fas fa-star" />
                                </li>
                                <li className="star-rating__item font-11">
                                  <i className="fas fa-star" />
                                </li>
                                <li className="star-rating__item font-11">
                                  <i className="fas fa-star" />
                                </li>
                                <li className="star-rating__item font-11">
                                  <i className="fas fa-star" />
                                </li>
                                <li className="star-rating__item font-11">
                                  <i className="fas fa-star" />
                                </li>
                              </ul>
                              <span className="star-rating__text text-heading fw-500 font-14">
                                (16)
                              </span>
                            </div>
                          </div>
                          <Link
                            to="/product-details"
                            className="btn btn-outline-light btn-sm pill"
                          >
                            Live Demo
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="col-xl-4 col-sm-6">
                    <div className="product-item section-bg">
                      <div className="product-item__thumb d-flex">
                        <Link to="/product-details" className="link w-100">
                          <img
                            src="assets/images/thumbs/product-img6.png"
                            alt=""
                            className="cover-img"
                          />
                        </Link>
                        <button
                          type="button"
                          className="product-item__wishlist"
                        >
                          <i className="fas fa-heart" />
                        </button>
                      </div>
                      <div className="product-item__content">
                        <h6 className="product-item__title">
                          <Link to="/product-details" className="link">
                            SaaS dashboard digital products Title here
                          </Link>
                        </h6>
                        <div className="product-item__info flx-between gap-2">
                          <span className="product-item__author">
                            by
                            <Link
                              to="/profile"
                              className="link hover-text-decoration-underline"
                            >
                              themepix
                            </Link>
                          </span>
                          <div className="flx-align gap-2">
                            <h6 className="product-item__price mb-0">$129</h6>
                            <span className="product-item__prevPrice text-decoration-line-through">
                              $256
                            </span>
                          </div>
                        </div>
                        <div className="product-item__bottom flx-between gap-2">
                          <div>
                            <span className="product-item__sales font-14 mb-2">
                              200 Sales
                            </span>
                            <div className="d-flex align-items-center gap-1">
                              <ul className="star-rating">
                                <li className="star-rating__item font-11">
                                  <i className="fas fa-star" />
                                </li>
                                <li className="star-rating__item font-11">
                                  <i className="fas fa-star" />
                                </li>
                                <li className="star-rating__item font-11">
                                  <i className="fas fa-star" />
                                </li>
                                <li className="star-rating__item font-11">
                                  <i className="fas fa-star" />
                                </li>
                                <li className="star-rating__item font-11">
                                  <i className="fas fa-star" />
                                </li>
                              </ul>
                              <span className="star-rating__text text-heading fw-500 font-14">
                                (16)
                              </span>
                            </div>
                          </div>
                          <Link
                            to="/product-details"
                            className="btn btn-outline-light btn-sm pill"
                          >
                            Live Demo
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="col-xl-4 col-sm-6">
                    <div className="product-item section-bg">
                      <div className="product-item__thumb d-flex">
                        <Link to="/product-details" className="link w-100">
                          <img
                            src="assets/images/thumbs/product-img7.png"
                            alt=""
                            className="cover-img"
                          />
                        </Link>
                        <button
                          type="button"
                          className="product-item__wishlist"
                        >
                          <i className="fas fa-heart" />
                        </button>
                      </div>
                      <div className="product-item__content">
                        <h6 className="product-item__title">
                          <Link to="/product-details" className="link">
                            SaaS dashboard digital products Title here
                          </Link>
                        </h6>
                        <div className="product-item__info flx-between gap-2">
                          <span className="product-item__author">
                            by
                            <Link
                              to="/profile"
                              className="link hover-text-decoration-underline"
                            >
                              themepix
                            </Link>
                          </span>
                          <div className="flx-align gap-2">
                            <h6 className="product-item__price mb-0">$129</h6>
                            <span className="product-item__prevPrice text-decoration-line-through">
                              $259
                            </span>
                          </div>
                        </div>
                        <div className="product-item__bottom flx-between gap-2">
                          <div>
                            <span className="product-item__sales font-14 mb-2">
                              500 Sales
                            </span>
                            <div className="d-flex align-items-center gap-1">
                              <ul className="star-rating">
                                <li className="star-rating__item font-11">
                                  <i className="fas fa-star" />
                                </li>
                                <li className="star-rating__item font-11">
                                  <i className="fas fa-star" />
                                </li>
                                <li className="star-rating__item font-11">
                                  <i className="fas fa-star" />
                                </li>
                                <li className="star-rating__item font-11">
                                  <i className="fas fa-star" />
                                </li>
                                <li className="star-rating__item font-11">
                                  <i className="fas fa-star" />
                                </li>
                              </ul>
                              <span className="star-rating__text text-heading fw-500 font-14">
                                (16)
                              </span>
                            </div>
                          </div>
                          <Link
                            to="/product-details"
                            className="btn btn-outline-light btn-sm pill"
                          >
                            Live Demo
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="col-xl-4 col-sm-6">
                    <div className="product-item section-bg">
                      <div className="product-item__thumb d-flex">
                        <Link to="/product-details" className="link w-100">
                          <img
                            src="assets/images/thumbs/product-img8.png"
                            alt=""
                            className="cover-img"
                          />
                        </Link>
                        <button
                          type="button"
                          className="product-item__wishlist"
                        >
                          <i className="fas fa-heart" />
                        </button>
                      </div>
                      <div className="product-item__content">
                        <h6 className="product-item__title">
                          <Link to="/product-details" className="link">
                            SaaS dashboard digital products Title here
                          </Link>
                        </h6>
                        <div className="product-item__info flx-between gap-2">
                          <span className="product-item__author">
                            by
                            <Link
                              to="/profile"
                              className="link hover-text-decoration-underline"
                            >
                              themepix
                            </Link>
                          </span>
                          <div className="flx-align gap-2">
                            <h6 className="product-item__price mb-0">$79</h6>
                            <span className="product-item__prevPrice text-decoration-line-through">
                              $99
                            </span>
                          </div>
                        </div>
                        <div className="product-item__bottom flx-between gap-2">
                          <div>
                            <span className="product-item__sales font-14 mb-2">
                              2100 Sales
                            </span>
                            <div className="d-flex align-items-center gap-1">
                              <ul className="star-rating">
                                <li className="star-rating__item font-11">
                                  <i className="fas fa-star" />
                                </li>
                                <li className="star-rating__item font-11">
                                  <i className="fas fa-star" />
                                </li>
                                <li className="star-rating__item font-11">
                                  <i className="fas fa-star" />
                                </li>
                                <li className="star-rating__item font-11">
                                  <i className="fas fa-star" />
                                </li>
                                <li className="star-rating__item font-11">
                                  <i className="fas fa-star" />
                                </li>
                              </ul>
                              <span className="star-rating__text text-heading fw-500 font-14">
                                (16)
                              </span>
                            </div>
                          </div>
                          <Link
                            to="/product-details"
                            className="btn btn-outline-light btn-sm pill"
                          >
                            Live Demo
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="col-xl-4 col-sm-6">
                    <div className="product-item section-bg">
                      <div className="product-item__thumb d-flex">
                        <Link to="/product-details" className="link w-100">
                          <img
                            src="assets/images/thumbs/product-img9.png"
                            alt=""
                            className="cover-img"
                          />
                        </Link>
                        <button
                          type="button"
                          className="product-item__wishlist"
                        >
                          <i className="fas fa-heart" />
                        </button>
                      </div>
                      <div className="product-item__content">
                        <h6 className="product-item__title">
                          <Link to="/product-details" className="link">
                            SaaS dashboard digital products Title here
                          </Link>
                        </h6>
                        <div className="product-item__info flx-between gap-2">
                          <span className="product-item__author">
                            by
                            <Link
                              to="/profile"
                              className="link hover-text-decoration-underline"
                            >
                              themepix
                            </Link>
                          </span>
                          <div className="flx-align gap-2">
                            <h6 className="product-item__price mb-0">$79</h6>
                            <span className="product-item__prevPrice text-decoration-line-through">
                              $99
                            </span>
                          </div>
                        </div>
                        <div className="product-item__bottom flx-between gap-2">
                          <div>
                            <span className="product-item__sales font-14 mb-2">
                              2100 Sales
                            </span>
                            <div className="d-flex align-items-center gap-1">
                              <ul className="star-rating">
                                <li className="star-rating__item font-11">
                                  <i className="fas fa-star" />
                                </li>
                                <li className="star-rating__item font-11">
                                  <i className="fas fa-star" />
                                </li>
                                <li className="star-rating__item font-11">
                                  <i className="fas fa-star" />
                                </li>
                                <li className="star-rating__item font-11">
                                  <i className="fas fa-star" />
                                </li>
                                <li className="star-rating__item font-11">
                                  <i className="fas fa-star" />
                                </li>
                              </ul>
                              <span className="star-rating__text text-heading fw-500 font-14">
                                (16)
                              </span>
                            </div>
                          </div>
                          <Link
                            to="/product-details"
                            className="btn btn-outline-light btn-sm pill"
                          >
                            Live Demo
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="col-xl-4 col-sm-6">
                    <div className="product-item section-bg">
                      <div className="product-item__thumb d-flex">
                        <Link to="/product-details" className="link w-100">
                          <img
                            src="assets/images/thumbs/product-img10.png"
                            alt=""
                            className="cover-img"
                          />
                        </Link>
                        <button
                          type="button"
                          className="product-item__wishlist"
                        >
                          <i className="fas fa-heart" />
                        </button>
                      </div>
                      <div className="product-item__content">
                        <h6 className="product-item__title">
                          <Link to="/product-details" className="link">
                            SaaS dashboard digital products Title here
                          </Link>
                        </h6>
                        <div className="product-item__info flx-between gap-2">
                          <span className="product-item__author">
                            by
                            <Link
                              to="/profile"
                              className="link hover-text-decoration-underline"
                            >
                              themepix
                            </Link>
                          </span>
                          <div className="flx-align gap-2">
                            <h6 className="product-item__price mb-0">$79</h6>
                            <span className="product-item__prevPrice text-decoration-line-through">
                              $99
                            </span>
                          </div>
                        </div>
                        <div className="product-item__bottom flx-between gap-2">
                          <div>
                            <span className="product-item__sales font-14 mb-2">
                              2100 Sales
                            </span>
                            <div className="d-flex align-items-center gap-1">
                              <ul className="star-rating">
                                <li className="star-rating__item font-11">
                                  <i className="fas fa-star" />
                                </li>
                                <li className="star-rating__item font-11">
                                  <i className="fas fa-star" />
                                </li>
                                <li className="star-rating__item font-11">
                                  <i className="fas fa-star" />
                                </li>
                                <li className="star-rating__item font-11">
                                  <i className="fas fa-star" />
                                </li>
                                <li className="star-rating__item font-11">
                                  <i className="fas fa-star" />
                                </li>
                              </ul>
                              <span className="star-rating__text text-heading fw-500 font-14">
                                (16)
                              </span>
                            </div>
                          </div>
                          <Link
                            to="/product-details"
                            className="btn btn-outline-light btn-sm pill"
                          >
                            Live Demo
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="col-xl-4 col-sm-6">
                    <div className="product-item section-bg">
                      <div className="product-item__thumb d-flex">
                        <Link to="/product-details" className="link w-100">
                          <img
                            src="assets/images/thumbs/product-img11.png"
                            alt=""
                            className="cover-img"
                          />
                        </Link>
                        <button
                          type="button"
                          className="product-item__wishlist"
                        >
                          <i className="fas fa-heart" />
                        </button>
                      </div>
                      <div className="product-item__content">
                        <h6 className="product-item__title">
                          <Link to="/product-details" className="link">
                            SaaS dashboard digital products Title here
                          </Link>
                        </h6>
                        <div className="product-item__info flx-between gap-2">
                          <span className="product-item__author">
                            by
                            <Link
                              to="/profile"
                              className="link hover-text-decoration-underline"
                            >
                              themepix
                            </Link>
                          </span>
                          <div className="flx-align gap-2">
                            <h6 className="product-item__price mb-0">$79</h6>
                            <span className="product-item__prevPrice text-decoration-line-through">
                              $99
                            </span>
                          </div>
                        </div>
                        <div className="product-item__bottom flx-between gap-2">
                          <div>
                            <span className="product-item__sales font-14 mb-2">
                              2100 Sales
                            </span>
                            <div className="d-flex align-items-center gap-1">
                              <ul className="star-rating">
                                <li className="star-rating__item font-11">
                                  <i className="fas fa-star" />
                                </li>
                                <li className="star-rating__item font-11">
                                  <i className="fas fa-star" />
                                </li>
                                <li className="star-rating__item font-11">
                                  <i className="fas fa-star" />
                                </li>
                                <li className="star-rating__item font-11">
                                  <i className="fas fa-star" />
                                </li>
                                <li className="star-rating__item font-11">
                                  <i className="fas fa-star" />
                                </li>
                              </ul>
                              <span className="star-rating__text text-heading fw-500 font-14">
                                (16)
                              </span>
                            </div>
                          </div>
                          <Link
                            to="/product-details"
                            className="btn btn-outline-light btn-sm pill"
                          >
                            Live Demo
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="col-xl-4 col-sm-6">
                    <div className="product-item section-bg">
                      <div className="product-item__thumb d-flex">
                        <Link to="/product-details" className="link w-100">
                          <img
                            src="assets/images/thumbs/product-img12.png"
                            alt=""
                            className="cover-img"
                          />
                        </Link>
                        <button
                          type="button"
                          className="product-item__wishlist"
                        >
                          <i className="fas fa-heart" />
                        </button>
                      </div>
                      <div className="product-item__content">
                        <h6 className="product-item__title">
                          <Link to="/product-details" className="link">
                            SaaS dashboard digital products Title here
                          </Link>
                        </h6>
                        <div className="product-item__info flx-between gap-2">
                          <span className="product-item__author">
                            by
                            <Link
                              to="/profile"
                              className="link hover-text-decoration-underline"
                            >
                              themepix
                            </Link>
                          </span>
                          <div className="flx-align gap-2">
                            <h6 className="product-item__price mb-0">$79</h6>
                            <span className="product-item__prevPrice text-decoration-line-through">
                              $99
                            </span>
                          </div>
                        </div>
                        <div className="product-item__bottom flx-between gap-2">
                          <div>
                            <span className="product-item__sales font-14 mb-2">
                              2100 Sales
                            </span>
                            <div className="d-flex align-items-center gap-1">
                              <ul className="star-rating">
                                <li className="star-rating__item font-11">
                                  <i className="fas fa-star" />
                                </li>
                                <li className="star-rating__item font-11">
                                  <i className="fas fa-star" />
                                </li>
                                <li className="star-rating__item font-11">
                                  <i className="fas fa-star" />
                                </li>
                                <li className="star-rating__item font-11">
                                  <i className="fas fa-star" />
                                </li>
                                <li className="star-rating__item font-11">
                                  <i className="fas fa-star" />
                                </li>
                              </ul>
                              <span className="star-rating__text text-heading fw-500 font-14">
                                (16)
                              </span>
                            </div>
                          </div>
                          <Link
                            to="/product-details"
                            className="btn btn-outline-light btn-sm pill"
                          >
                            Live Demo
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                {/* Pagination Start */}
                <nav aria-label="Page navigation example">
                  <ul className="pagination common-pagination">
                    <li className="page-item">
                      <Link className="page-link" to="#">
                        1
                      </Link>
                    </li>
                    <li className="page-item">
                      <Link className="page-link" to="#">
                        2
                      </Link>
                    </li>
                    <li className="page-item">
                      <Link className="page-link" to="#">
                        3
                      </Link>
                    </li>
                    <li className="page-item">
                      <Link className="page-link" to="#">
                        4
                      </Link>
                    </li>
                    <li className="page-item">
                      <Link className="page-link" to="#">
                        5
                      </Link>
                    </li>
                    <li className="page-item">
                      <Link
                        className="page-link flx-align gap-2 flex-nowrap"
                        to="#"
                      >
                        Next
                        <span className="icon line-height-1 font-20">
                          <i className="las la-arrow-right" />
                        </span>
                      </Link>
                    </li>
                  </ul>
                </nav>
                {/* Pagination End */}
              </div>
              <div
                className="tab-pane fade"
                id="pills-bestRating"
                role="tabpanel"
                aria-labelledby="pills-bestRating-tab"
                tabIndex={0}
              >
                <div className="row gy-4 list-grid-wrapper">
                  <div className="col-xl-4 col-sm-6">
                    <div className="product-item section-bg">
                      <div className="product-item__thumb d-flex">
                        <Link to="/product-details" className="link w-100">
                          <img
                            src="assets/images/thumbs/product-img1.png"
                            alt=""
                            className="cover-img"
                          />
                        </Link>
                        <button
                          type="button"
                          className="product-item__wishlist"
                        >
                          <i className="fas fa-heart" />
                        </button>
                      </div>
                      <div className="product-item__content">
                        <h6 className="product-item__title">
                          <Link to="/product-details" className="link">
                            SaaS dashboard digital products Title here
                          </Link>
                        </h6>
                        <div className="product-item__info flx-between gap-2">
                          <span className="product-item__author">
                            by
                            <Link
                              to="/profile"
                              className="link hover-text-decoration-underline"
                            >
                              themepix
                            </Link>
                          </span>
                          <div className="flx-align gap-2">
                            <h6 className="product-item__price mb-0">$120</h6>
                            <span className="product-item__prevPrice text-decoration-line-through">
                              $259
                            </span>
                          </div>
                        </div>
                        <div className="product-item__bottom flx-between gap-2">
                          <div>
                            <span className="product-item__sales font-14 mb-2">
                              1200 Sales
                            </span>
                            <div className="d-flex align-items-center gap-1">
                              <ul className="star-rating">
                                <li className="star-rating__item font-11">
                                  <i className="fas fa-star" />
                                </li>
                                <li className="star-rating__item font-11">
                                  <i className="fas fa-star" />
                                </li>
                                <li className="star-rating__item font-11">
                                  <i className="fas fa-star" />
                                </li>
                                <li className="star-rating__item font-11">
                                  <i className="fas fa-star" />
                                </li>
                                <li className="star-rating__item font-11">
                                  <i className="fas fa-star" />
                                </li>
                              </ul>
                              <span className="star-rating__text text-heading fw-500 font-14">
                                (16)
                              </span>
                            </div>
                          </div>
                          <Link
                            to="/product-details"
                            className="btn btn-outline-light btn-sm pill"
                          >
                            Live Demo
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="col-xl-4 col-sm-6">
                    <div className="product-item section-bg">
                      <div className="product-item__thumb d-flex">
                        <Link to="/product-details" className="link w-100">
                          <img
                            src="assets/images/thumbs/product-img2.png"
                            alt=""
                            className="cover-img"
                          />
                        </Link>
                        <button
                          type="button"
                          className="product-item__wishlist"
                        >
                          <i className="fas fa-heart" />
                        </button>
                      </div>
                      <div className="product-item__content">
                        <h6 className="product-item__title">
                          <Link to="/product-details" className="link">
                            SaaS dashboard digital products Title here
                          </Link>
                        </h6>
                        <div className="product-item__info flx-between gap-2">
                          <span className="product-item__author">
                            by
                            <Link
                              to="/profile"
                              className="link hover-text-decoration-underline"
                            >
                              themepix
                            </Link>
                          </span>
                          <div className="flx-align gap-2">
                            <h6 className="product-item__price mb-0">$129</h6>
                            <span className="product-item__prevPrice text-decoration-line-through">
                              $236
                            </span>
                          </div>
                        </div>
                        <div className="product-item__bottom flx-between gap-2">
                          <div>
                            <span className="product-item__sales font-14 mb-2">
                              100 Sales
                            </span>
                            <div className="d-flex align-items-center gap-1">
                              <ul className="star-rating">
                                <li className="star-rating__item font-11">
                                  <i className="fas fa-star" />
                                </li>
                                <li className="star-rating__item font-11">
                                  <i className="fas fa-star" />
                                </li>
                                <li className="star-rating__item font-11">
                                  <i className="fas fa-star" />
                                </li>
                                <li className="star-rating__item font-11">
                                  <i className="fas fa-star" />
                                </li>
                                <li className="star-rating__item font-11">
                                  <i className="fas fa-star" />
                                </li>
                              </ul>
                              <span className="star-rating__text text-heading fw-500 font-14">
                                (16)
                              </span>
                            </div>
                          </div>
                          <Link
                            to="/product-details"
                            className="btn btn-outline-light btn-sm pill"
                          >
                            Live Demo
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="col-xl-4 col-sm-6">
                    <div className="product-item section-bg">
                      <div className="product-item__thumb d-flex">
                        <Link to="/product-details" className="link w-100">
                          <img
                            src="assets/images/thumbs/product-img3.png"
                            alt=""
                            className="cover-img"
                          />
                        </Link>
                        <button
                          type="button"
                          className="product-item__wishlist"
                        >
                          <i className="fas fa-heart" />
                        </button>
                      </div>
                      <div className="product-item__content">
                        <h6 className="product-item__title">
                          <Link to="/product-details" className="link">
                            SaaS dashboard digital products Title here
                          </Link>
                        </h6>
                        <div className="product-item__info flx-between gap-2">
                          <span className="product-item__author">
                            by
                            <Link
                              to="/profile"
                              className="link hover-text-decoration-underline"
                            >
                              themepix
                            </Link>
                          </span>
                          <div className="flx-align gap-2">
                            <h6 className="product-item__price mb-0">$79</h6>
                            <span className="product-item__prevPrice text-decoration-line-through">
                              $99
                            </span>
                          </div>
                        </div>
                        <div className="product-item__bottom flx-between gap-2">
                          <div>
                            <span className="product-item__sales font-14 mb-2">
                              900 Sales
                            </span>
                            <div className="d-flex align-items-center gap-1">
                              <ul className="star-rating">
                                <li className="star-rating__item font-11">
                                  <i className="fas fa-star" />
                                </li>
                                <li className="star-rating__item font-11">
                                  <i className="fas fa-star" />
                                </li>
                                <li className="star-rating__item font-11">
                                  <i className="fas fa-star" />
                                </li>
                                <li className="star-rating__item font-11">
                                  <i className="fas fa-star" />
                                </li>
                                <li className="star-rating__item font-11">
                                  <i className="fas fa-star" />
                                </li>
                              </ul>
                              <span className="star-rating__text text-heading fw-500 font-14">
                                (16)
                              </span>
                            </div>
                          </div>
                          <Link
                            to="/product-details"
                            className="btn btn-outline-light btn-sm pill"
                          >
                            Live Demo
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="col-xl-4 col-sm-6">
                    <div className="product-item section-bg">
                      <div className="product-item__thumb d-flex">
                        <Link to="/product-details" className="link w-100">
                          <img
                            src="assets/images/thumbs/product-img4.png"
                            alt=""
                            className="cover-img"
                          />
                        </Link>
                        <button
                          type="button"
                          className="product-item__wishlist"
                        >
                          <i className="fas fa-heart" />
                        </button>
                      </div>
                      <div className="product-item__content">
                        <h6 className="product-item__title">
                          <Link to="/product-details" className="link">
                            SaaS dashboard digital products Title here
                          </Link>
                        </h6>
                        <div className="product-item__info flx-between gap-2">
                          <span className="product-item__author">
                            by
                            <Link
                              to="/profile"
                              className="link hover-text-decoration-underline"
                            >
                              themepix
                            </Link>
                          </span>
                          <div className="flx-align gap-2">
                            <h6 className="product-item__price mb-0">$59</h6>
                            <span className="product-item__prevPrice text-decoration-line-through">
                              $129
                            </span>
                          </div>
                        </div>
                        <div className="product-item__bottom flx-between gap-2">
                          <div>
                            <span className="product-item__sales font-14 mb-2">
                              1225 Sales
                            </span>
                            <div className="d-flex align-items-center gap-1">
                              <ul className="star-rating">
                                <li className="star-rating__item font-11">
                                  <i className="fas fa-star" />
                                </li>
                                <li className="star-rating__item font-11">
                                  <i className="fas fa-star" />
                                </li>
                                <li className="star-rating__item font-11">
                                  <i className="fas fa-star" />
                                </li>
                                <li className="star-rating__item font-11">
                                  <i className="fas fa-star" />
                                </li>
                                <li className="star-rating__item font-11">
                                  <i className="fas fa-star" />
                                </li>
                              </ul>
                              <span className="star-rating__text text-heading fw-500 font-14">
                                (16)
                              </span>
                            </div>
                          </div>
                          <Link
                            to="/product-details"
                            className="btn btn-outline-light btn-sm pill"
                          >
                            Live Demo
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="col-xl-4 col-sm-6">
                    <div className="product-item section-bg">
                      <div className="product-item__thumb d-flex">
                        <Link to="/product-details" className="link w-100">
                          <img
                            src="assets/images/thumbs/product-img5.png"
                            alt=""
                            className="cover-img"
                          />
                        </Link>
                        <button
                          type="button"
                          className="product-item__wishlist"
                        >
                          <i className="fas fa-heart" />
                        </button>
                      </div>
                      <div className="product-item__content">
                        <h6 className="product-item__title">
                          <Link to="/product-details" className="link">
                            SaaS dashboard digital products Title here
                          </Link>
                        </h6>
                        <div className="product-item__info flx-between gap-2">
                          <span className="product-item__author">
                            by
                            <Link
                              to="/profile"
                              className="link hover-text-decoration-underline"
                            >
                              themepix
                            </Link>
                          </span>
                          <div className="flx-align gap-2">
                            <h6 className="product-item__price mb-0">$99</h6>
                            <span className="product-item__prevPrice text-decoration-line-through">
                              $129
                            </span>
                          </div>
                        </div>
                        <div className="product-item__bottom flx-between gap-2">
                          <div>
                            <span className="product-item__sales font-14 mb-2">
                              1300 Sales
                            </span>
                            <div className="d-flex align-items-center gap-1">
                              <ul className="star-rating">
                                <li className="star-rating__item font-11">
                                  <i className="fas fa-star" />
                                </li>
                                <li className="star-rating__item font-11">
                                  <i className="fas fa-star" />
                                </li>
                                <li className="star-rating__item font-11">
                                  <i className="fas fa-star" />
                                </li>
                                <li className="star-rating__item font-11">
                                  <i className="fas fa-star" />
                                </li>
                                <li className="star-rating__item font-11">
                                  <i className="fas fa-star" />
                                </li>
                              </ul>
                              <span className="star-rating__text text-heading fw-500 font-14">
                                (16)
                              </span>
                            </div>
                          </div>
                          <Link
                            to="/product-details"
                            className="btn btn-outline-light btn-sm pill"
                          >
                            Live Demo
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="col-xl-4 col-sm-6">
                    <div className="product-item section-bg">
                      <div className="product-item__thumb d-flex">
                        <Link to="/product-details" className="link w-100">
                          <img
                            src="assets/images/thumbs/product-img6.png"
                            alt=""
                            className="cover-img"
                          />
                        </Link>
                        <button
                          type="button"
                          className="product-item__wishlist"
                        >
                          <i className="fas fa-heart" />
                        </button>
                      </div>
                      <div className="product-item__content">
                        <h6 className="product-item__title">
                          <Link to="/product-details" className="link">
                            SaaS dashboard digital products Title here
                          </Link>
                        </h6>
                        <div className="product-item__info flx-between gap-2">
                          <span className="product-item__author">
                            by
                            <Link
                              to="/profile"
                              className="link hover-text-decoration-underline"
                            >
                              themepix
                            </Link>
                          </span>
                          <div className="flx-align gap-2">
                            <h6 className="product-item__price mb-0">$129</h6>
                            <span className="product-item__prevPrice text-decoration-line-through">
                              $256
                            </span>
                          </div>
                        </div>
                        <div className="product-item__bottom flx-between gap-2">
                          <div>
                            <span className="product-item__sales font-14 mb-2">
                              200 Sales
                            </span>
                            <div className="d-flex align-items-center gap-1">
                              <ul className="star-rating">
                                <li className="star-rating__item font-11">
                                  <i className="fas fa-star" />
                                </li>
                                <li className="star-rating__item font-11">
                                  <i className="fas fa-star" />
                                </li>
                                <li className="star-rating__item font-11">
                                  <i className="fas fa-star" />
                                </li>
                                <li className="star-rating__item font-11">
                                  <i className="fas fa-star" />
                                </li>
                                <li className="star-rating__item font-11">
                                  <i className="fas fa-star" />
                                </li>
                              </ul>
                              <span className="star-rating__text text-heading fw-500 font-14">
                                (16)
                              </span>
                            </div>
                          </div>
                          <Link
                            to="/product-details"
                            className="btn btn-outline-light btn-sm pill"
                          >
                            Live Demo
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="col-xl-4 col-sm-6">
                    <div className="product-item section-bg">
                      <div className="product-item__thumb d-flex">
                        <Link to="/product-details" className="link w-100">
                          <img
                            src="assets/images/thumbs/product-img7.png"
                            alt=""
                            className="cover-img"
                          />
                        </Link>
                        <button
                          type="button"
                          className="product-item__wishlist"
                        >
                          <i className="fas fa-heart" />
                        </button>
                      </div>
                      <div className="product-item__content">
                        <h6 className="product-item__title">
                          <Link to="/product-details" className="link">
                            SaaS dashboard digital products Title here
                          </Link>
                        </h6>
                        <div className="product-item__info flx-between gap-2">
                          <span className="product-item__author">
                            by
                            <Link
                              to="/profile"
                              className="link hover-text-decoration-underline"
                            >
                              themepix
                            </Link>
                          </span>
                          <div className="flx-align gap-2">
                            <h6 className="product-item__price mb-0">$129</h6>
                            <span className="product-item__prevPrice text-decoration-line-through">
                              $259
                            </span>
                          </div>
                        </div>
                        <div className="product-item__bottom flx-between gap-2">
                          <div>
                            <span className="product-item__sales font-14 mb-2">
                              500 Sales
                            </span>
                            <div className="d-flex align-items-center gap-1">
                              <ul className="star-rating">
                                <li className="star-rating__item font-11">
                                  <i className="fas fa-star" />
                                </li>
                                <li className="star-rating__item font-11">
                                  <i className="fas fa-star" />
                                </li>
                                <li className="star-rating__item font-11">
                                  <i className="fas fa-star" />
                                </li>
                                <li className="star-rating__item font-11">
                                  <i className="fas fa-star" />
                                </li>
                                <li className="star-rating__item font-11">
                                  <i className="fas fa-star" />
                                </li>
                              </ul>
                              <span className="star-rating__text text-heading fw-500 font-14">
                                (16)
                              </span>
                            </div>
                          </div>
                          <Link
                            to="/product-details"
                            className="btn btn-outline-light btn-sm pill"
                          >
                            Live Demo
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="col-xl-4 col-sm-6">
                    <div className="product-item section-bg">
                      <div className="product-item__thumb d-flex">
                        <Link to="/product-details" className="link w-100">
                          <img
                            src="assets/images/thumbs/product-img8.png"
                            alt=""
                            className="cover-img"
                          />
                        </Link>
                        <button
                          type="button"
                          className="product-item__wishlist"
                        >
                          <i className="fas fa-heart" />
                        </button>
                      </div>
                      <div className="product-item__content">
                        <h6 className="product-item__title">
                          <Link to="/product-details" className="link">
                            SaaS dashboard digital products Title here
                          </Link>
                        </h6>
                        <div className="product-item__info flx-between gap-2">
                          <span className="product-item__author">
                            by
                            <Link
                              to="/profile"
                              className="link hover-text-decoration-underline"
                            >
                              themepix
                            </Link>
                          </span>
                          <div className="flx-align gap-2">
                            <h6 className="product-item__price mb-0">$79</h6>
                            <span className="product-item__prevPrice text-decoration-line-through">
                              $99
                            </span>
                          </div>
                        </div>
                        <div className="product-item__bottom flx-between gap-2">
                          <div>
                            <span className="product-item__sales font-14 mb-2">
                              2100 Sales
                            </span>
                            <div className="d-flex align-items-center gap-1">
                              <ul className="star-rating">
                                <li className="star-rating__item font-11">
                                  <i className="fas fa-star" />
                                </li>
                                <li className="star-rating__item font-11">
                                  <i className="fas fa-star" />
                                </li>
                                <li className="star-rating__item font-11">
                                  <i className="fas fa-star" />
                                </li>
                                <li className="star-rating__item font-11">
                                  <i className="fas fa-star" />
                                </li>
                                <li className="star-rating__item font-11">
                                  <i className="fas fa-star" />
                                </li>
                              </ul>
                              <span className="star-rating__text text-heading fw-500 font-14">
                                (16)
                              </span>
                            </div>
                          </div>
                          <Link
                            to="/product-details"
                            className="btn btn-outline-light btn-sm pill"
                          >
                            Live Demo
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="col-xl-4 col-sm-6">
                    <div className="product-item section-bg">
                      <div className="product-item__thumb d-flex">
                        <Link to="/product-details" className="link w-100">
                          <img
                            src="assets/images/thumbs/product-img9.png"
                            alt=""
                            className="cover-img"
                          />
                        </Link>
                        <button
                          type="button"
                          className="product-item__wishlist"
                        >
                          <i className="fas fa-heart" />
                        </button>
                      </div>
                      <div className="product-item__content">
                        <h6 className="product-item__title">
                          <Link to="/product-details" className="link">
                            SaaS dashboard digital products Title here
                          </Link>
                        </h6>
                        <div className="product-item__info flx-between gap-2">
                          <span className="product-item__author">
                            by
                            <Link
                              to="/profile"
                              className="link hover-text-decoration-underline"
                            >
                              themepix
                            </Link>
                          </span>
                          <div className="flx-align gap-2">
                            <h6 className="product-item__price mb-0">$79</h6>
                            <span className="product-item__prevPrice text-decoration-line-through">
                              $99
                            </span>
                          </div>
                        </div>
                        <div className="product-item__bottom flx-between gap-2">
                          <div>
                            <span className="product-item__sales font-14 mb-2">
                              2100 Sales
                            </span>
                            <div className="d-flex align-items-center gap-1">
                              <ul className="star-rating">
                                <li className="star-rating__item font-11">
                                  <i className="fas fa-star" />
                                </li>
                                <li className="star-rating__item font-11">
                                  <i className="fas fa-star" />
                                </li>
                                <li className="star-rating__item font-11">
                                  <i className="fas fa-star" />
                                </li>
                                <li className="star-rating__item font-11">
                                  <i className="fas fa-star" />
                                </li>
                                <li className="star-rating__item font-11">
                                  <i className="fas fa-star" />
                                </li>
                              </ul>
                              <span className="star-rating__text text-heading fw-500 font-14">
                                (16)
                              </span>
                            </div>
                          </div>
                          <Link
                            to="/product-details"
                            className="btn btn-outline-light btn-sm pill"
                          >
                            Live Demo
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="col-xl-4 col-sm-6">
                    <div className="product-item section-bg">
                      <div className="product-item__thumb d-flex">
                        <Link to="/product-details" className="link w-100">
                          <img
                            src="assets/images/thumbs/product-img10.png"
                            alt=""
                            className="cover-img"
                          />
                        </Link>
                        <button
                          type="button"
                          className="product-item__wishlist"
                        >
                          <i className="fas fa-heart" />
                        </button>
                      </div>
                      <div className="product-item__content">
                        <h6 className="product-item__title">
                          <Link to="/product-details" className="link">
                            SaaS dashboard digital products Title here
                          </Link>
                        </h6>
                        <div className="product-item__info flx-between gap-2">
                          <span className="product-item__author">
                            by
                            <Link
                              to="/profile"
                              className="link hover-text-decoration-underline"
                            >
                              themepix
                            </Link>
                          </span>
                          <div className="flx-align gap-2">
                            <h6 className="product-item__price mb-0">$79</h6>
                            <span className="product-item__prevPrice text-decoration-line-through">
                              $99
                            </span>
                          </div>
                        </div>
                        <div className="product-item__bottom flx-between gap-2">
                          <div>
                            <span className="product-item__sales font-14 mb-2">
                              2100 Sales
                            </span>
                            <div className="d-flex align-items-center gap-1">
                              <ul className="star-rating">
                                <li className="star-rating__item font-11">
                                  <i className="fas fa-star" />
                                </li>
                                <li className="star-rating__item font-11">
                                  <i className="fas fa-star" />
                                </li>
                                <li className="star-rating__item font-11">
                                  <i className="fas fa-star" />
                                </li>
                                <li className="star-rating__item font-11">
                                  <i className="fas fa-star" />
                                </li>
                                <li className="star-rating__item font-11">
                                  <i className="fas fa-star" />
                                </li>
                              </ul>
                              <span className="star-rating__text text-heading fw-500 font-14">
                                (16)
                              </span>
                            </div>
                          </div>
                          <Link
                            to="/product-details"
                            className="btn btn-outline-light btn-sm pill"
                          >
                            Live Demo
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="col-xl-4 col-sm-6">
                    <div className="product-item section-bg">
                      <div className="product-item__thumb d-flex">
                        <Link to="/product-details" className="link w-100">
                          <img
                            src="assets/images/thumbs/product-img11.png"
                            alt=""
                            className="cover-img"
                          />
                        </Link>
                        <button
                          type="button"
                          className="product-item__wishlist"
                        >
                          <i className="fas fa-heart" />
                        </button>
                      </div>
                      <div className="product-item__content">
                        <h6 className="product-item__title">
                          <Link to="/product-details" className="link">
                            SaaS dashboard digital products Title here
                          </Link>
                        </h6>
                        <div className="product-item__info flx-between gap-2">
                          <span className="product-item__author">
                            by
                            <Link
                              to="/profile"
                              className="link hover-text-decoration-underline"
                            >
                              themepix
                            </Link>
                          </span>
                          <div className="flx-align gap-2">
                            <h6 className="product-item__price mb-0">$79</h6>
                            <span className="product-item__prevPrice text-decoration-line-through">
                              $99
                            </span>
                          </div>
                        </div>
                        <div className="product-item__bottom flx-between gap-2">
                          <div>
                            <span className="product-item__sales font-14 mb-2">
                              2100 Sales
                            </span>
                            <div className="d-flex align-items-center gap-1">
                              <ul className="star-rating">
                                <li className="star-rating__item font-11">
                                  <i className="fas fa-star" />
                                </li>
                                <li className="star-rating__item font-11">
                                  <i className="fas fa-star" />
                                </li>
                                <li className="star-rating__item font-11">
                                  <i className="fas fa-star" />
                                </li>
                                <li className="star-rating__item font-11">
                                  <i className="fas fa-star" />
                                </li>
                                <li className="star-rating__item font-11">
                                  <i className="fas fa-star" />
                                </li>
                              </ul>
                              <span className="star-rating__text text-heading fw-500 font-14">
                                (16)
                              </span>
                            </div>
                          </div>
                          <Link
                            to="/product-details"
                            className="btn btn-outline-light btn-sm pill"
                          >
                            Live Demo
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="col-xl-4 col-sm-6">
                    <div className="product-item section-bg">
                      <div className="product-item__thumb d-flex">
                        <Link to="/product-details" className="link w-100">
                          <img
                            src="assets/images/thumbs/product-img12.png"
                            alt=""
                            className="cover-img"
                          />
                        </Link>
                        <button
                          type="button"
                          className="product-item__wishlist"
                        >
                          <i className="fas fa-heart" />
                        </button>
                      </div>
                      <div className="product-item__content">
                        <h6 className="product-item__title">
                          <Link to="/product-details" className="link">
                            SaaS dashboard digital products Title here
                          </Link>
                        </h6>
                        <div className="product-item__info flx-between gap-2">
                          <span className="product-item__author">
                            by
                            <Link
                              to="/profile"
                              className="link hover-text-decoration-underline"
                            >
                              themepix
                            </Link>
                          </span>
                          <div className="flx-align gap-2">
                            <h6 className="product-item__price mb-0">$79</h6>
                            <span className="product-item__prevPrice text-decoration-line-through">
                              $99
                            </span>
                          </div>
                        </div>
                        <div className="product-item__bottom flx-between gap-2">
                          <div>
                            <span className="product-item__sales font-14 mb-2">
                              2100 Sales
                            </span>
                            <div className="d-flex align-items-center gap-1">
                              <ul className="star-rating">
                                <li className="star-rating__item font-11">
                                  <i className="fas fa-star" />
                                </li>
                                <li className="star-rating__item font-11">
                                  <i className="fas fa-star" />
                                </li>
                                <li className="star-rating__item font-11">
                                  <i className="fas fa-star" />
                                </li>
                                <li className="star-rating__item font-11">
                                  <i className="fas fa-star" />
                                </li>
                                <li className="star-rating__item font-11">
                                  <i className="fas fa-star" />
                                </li>
                              </ul>
                              <span className="star-rating__text text-heading fw-500 font-14">
                                (16)
                              </span>
                            </div>
                          </div>
                          <Link
                            to="/product-details"
                            className="btn btn-outline-light btn-sm pill"
                          >
                            Live Demo
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                {/* Pagination Start */}
                <nav aria-label="Page navigation example">
                  <ul className="pagination common-pagination">
                    <li className="page-item">
                      <Link className="page-link" to="#">
                        1
                      </Link>
                    </li>
                    <li className="page-item">
                      <Link className="page-link" to="#">
                        2
                      </Link>
                    </li>
                    <li className="page-item">
                      <Link className="page-link" to="#">
                        3
                      </Link>
                    </li>
                    <li className="page-item">
                      <Link className="page-link" to="#">
                        4
                      </Link>
                    </li>
                    <li className="page-item">
                      <Link className="page-link" to="#">
                        5
                      </Link>
                    </li>
                    <li className="page-item">
                      <Link
                        className="page-link flx-align gap-2 flex-nowrap"
                        to="#"
                      >
                        Next
                        <span className="icon line-height-1 font-20">
                          <i className="las la-arrow-right" />
                        </span>
                      </Link>
                    </li>
                  </ul>
                </nav>
                {/* Pagination End */}
              </div>
              <div
                className="tab-pane fade"
                id="pills-trending"
                role="tabpanel"
                aria-labelledby="pills-trending-tab"
                tabIndex={0}
              >
                <div className="row gy-4 list-grid-wrapper">
                  <div className="col-xl-4 col-sm-6">
                    <div className="product-item section-bg">
                      <div className="product-item__thumb d-flex">
                        <Link to="/product-details" className="link w-100">
                          <img
                            src="assets/images/thumbs/product-img1.png"
                            alt=""
                            className="cover-img"
                          />
                        </Link>
                        <button
                          type="button"
                          className="product-item__wishlist"
                        >
                          <i className="fas fa-heart" />
                        </button>
                      </div>
                      <div className="product-item__content">
                        <h6 className="product-item__title">
                          <Link to="/product-details" className="link">
                            SaaS dashboard digital products Title here
                          </Link>
                        </h6>
                        <div className="product-item__info flx-between gap-2">
                          <span className="product-item__author">
                            by
                            <Link
                              to="/profile"
                              className="link hover-text-decoration-underline"
                            >
                              themepix
                            </Link>
                          </span>
                          <div className="flx-align gap-2">
                            <h6 className="product-item__price mb-0">$120</h6>
                            <span className="product-item__prevPrice text-decoration-line-through">
                              $259
                            </span>
                          </div>
                        </div>
                        <div className="product-item__bottom flx-between gap-2">
                          <div>
                            <span className="product-item__sales font-14 mb-2">
                              1200 Sales
                            </span>
                            <div className="d-flex align-items-center gap-1">
                              <ul className="star-rating">
                                <li className="star-rating__item font-11">
                                  <i className="fas fa-star" />
                                </li>
                                <li className="star-rating__item font-11">
                                  <i className="fas fa-star" />
                                </li>
                                <li className="star-rating__item font-11">
                                  <i className="fas fa-star" />
                                </li>
                                <li className="star-rating__item font-11">
                                  <i className="fas fa-star" />
                                </li>
                                <li className="star-rating__item font-11">
                                  <i className="fas fa-star" />
                                </li>
                              </ul>
                              <span className="star-rating__text text-heading fw-500 font-14">
                                (16)
                              </span>
                            </div>
                          </div>
                          <Link
                            to="/product-details"
                            className="btn btn-outline-light btn-sm pill"
                          >
                            Live Demo
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="col-xl-4 col-sm-6">
                    <div className="product-item section-bg">
                      <div className="product-item__thumb d-flex">
                        <Link to="/product-details" className="link w-100">
                          <img
                            src="assets/images/thumbs/product-img2.png"
                            alt=""
                            className="cover-img"
                          />
                        </Link>
                        <button
                          type="button"
                          className="product-item__wishlist"
                        >
                          <i className="fas fa-heart" />
                        </button>
                      </div>
                      <div className="product-item__content">
                        <h6 className="product-item__title">
                          <Link to="/product-details" className="link">
                            SaaS dashboard digital products Title here
                          </Link>
                        </h6>
                        <div className="product-item__info flx-between gap-2">
                          <span className="product-item__author">
                            by
                            <Link
                              to="/profile"
                              className="link hover-text-decoration-underline"
                            >
                              themepix
                            </Link>
                          </span>
                          <div className="flx-align gap-2">
                            <h6 className="product-item__price mb-0">$129</h6>
                            <span className="product-item__prevPrice text-decoration-line-through">
                              $236
                            </span>
                          </div>
                        </div>
                        <div className="product-item__bottom flx-between gap-2">
                          <div>
                            <span className="product-item__sales font-14 mb-2">
                              100 Sales
                            </span>
                            <div className="d-flex align-items-center gap-1">
                              <ul className="star-rating">
                                <li className="star-rating__item font-11">
                                  <i className="fas fa-star" />
                                </li>
                                <li className="star-rating__item font-11">
                                  <i className="fas fa-star" />
                                </li>
                                <li className="star-rating__item font-11">
                                  <i className="fas fa-star" />
                                </li>
                                <li className="star-rating__item font-11">
                                  <i className="fas fa-star" />
                                </li>
                                <li className="star-rating__item font-11">
                                  <i className="fas fa-star" />
                                </li>
                              </ul>
                              <span className="star-rating__text text-heading fw-500 font-14">
                                (16)
                              </span>
                            </div>
                          </div>
                          <Link
                            to="/product-details"
                            className="btn btn-outline-light btn-sm pill"
                          >
                            Live Demo
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="col-xl-4 col-sm-6">
                    <div className="product-item section-bg">
                      <div className="product-item__thumb d-flex">
                        <Link to="/product-details" className="link w-100">
                          <img
                            src="assets/images/thumbs/product-img3.png"
                            alt=""
                            className="cover-img"
                          />
                        </Link>
                        <button
                          type="button"
                          className="product-item__wishlist"
                        >
                          <i className="fas fa-heart" />
                        </button>
                      </div>
                      <div className="product-item__content">
                        <h6 className="product-item__title">
                          <Link to="/product-details" className="link">
                            SaaS dashboard digital products Title here
                          </Link>
                        </h6>
                        <div className="product-item__info flx-between gap-2">
                          <span className="product-item__author">
                            by
                            <Link
                              to="/profile"
                              className="link hover-text-decoration-underline"
                            >
                              themepix
                            </Link>
                          </span>
                          <div className="flx-align gap-2">
                            <h6 className="product-item__price mb-0">$79</h6>
                            <span className="product-item__prevPrice text-decoration-line-through">
                              $99
                            </span>
                          </div>
                        </div>
                        <div className="product-item__bottom flx-between gap-2">
                          <div>
                            <span className="product-item__sales font-14 mb-2">
                              900 Sales
                            </span>
                            <div className="d-flex align-items-center gap-1">
                              <ul className="star-rating">
                                <li className="star-rating__item font-11">
                                  <i className="fas fa-star" />
                                </li>
                                <li className="star-rating__item font-11">
                                  <i className="fas fa-star" />
                                </li>
                                <li className="star-rating__item font-11">
                                  <i className="fas fa-star" />
                                </li>
                                <li className="star-rating__item font-11">
                                  <i className="fas fa-star" />
                                </li>
                                <li className="star-rating__item font-11">
                                  <i className="fas fa-star" />
                                </li>
                              </ul>
                              <span className="star-rating__text text-heading fw-500 font-14">
                                (16)
                              </span>
                            </div>
                          </div>
                          <Link
                            to="/product-details"
                            className="btn btn-outline-light btn-sm pill"
                          >
                            Live Demo
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="col-xl-4 col-sm-6">
                    <div className="product-item section-bg">
                      <div className="product-item__thumb d-flex">
                        <Link to="/product-details" className="link w-100">
                          <img
                            src="assets/images/thumbs/product-img4.png"
                            alt=""
                            className="cover-img"
                          />
                        </Link>
                        <button
                          type="button"
                          className="product-item__wishlist"
                        >
                          <i className="fas fa-heart" />
                        </button>
                      </div>
                      <div className="product-item__content">
                        <h6 className="product-item__title">
                          <Link to="/product-details" className="link">
                            SaaS dashboard digital products Title here
                          </Link>
                        </h6>
                        <div className="product-item__info flx-between gap-2">
                          <span className="product-item__author">
                            by
                            <Link
                              to="/profile"
                              className="link hover-text-decoration-underline"
                            >
                              themepix
                            </Link>
                          </span>
                          <div className="flx-align gap-2">
                            <h6 className="product-item__price mb-0">$59</h6>
                            <span className="product-item__prevPrice text-decoration-line-through">
                              $129
                            </span>
                          </div>
                        </div>
                        <div className="product-item__bottom flx-between gap-2">
                          <div>
                            <span className="product-item__sales font-14 mb-2">
                              1225 Sales
                            </span>
                            <div className="d-flex align-items-center gap-1">
                              <ul className="star-rating">
                                <li className="star-rating__item font-11">
                                  <i className="fas fa-star" />
                                </li>
                                <li className="star-rating__item font-11">
                                  <i className="fas fa-star" />
                                </li>
                                <li className="star-rating__item font-11">
                                  <i className="fas fa-star" />
                                </li>
                                <li className="star-rating__item font-11">
                                  <i className="fas fa-star" />
                                </li>
                                <li className="star-rating__item font-11">
                                  <i className="fas fa-star" />
                                </li>
                              </ul>
                              <span className="star-rating__text text-heading fw-500 font-14">
                                (16)
                              </span>
                            </div>
                          </div>
                          <Link
                            to="/product-details"
                            className="btn btn-outline-light btn-sm pill"
                          >
                            Live Demo
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="col-xl-4 col-sm-6">
                    <div className="product-item section-bg">
                      <div className="product-item__thumb d-flex">
                        <Link to="/product-details" className="link w-100">
                          <img
                            src="assets/images/thumbs/product-img5.png"
                            alt=""
                            className="cover-img"
                          />
                        </Link>
                        <button
                          type="button"
                          className="product-item__wishlist"
                        >
                          <i className="fas fa-heart" />
                        </button>
                      </div>
                      <div className="product-item__content">
                        <h6 className="product-item__title">
                          <Link to="/product-details" className="link">
                            SaaS dashboard digital products Title here
                          </Link>
                        </h6>
                        <div className="product-item__info flx-between gap-2">
                          <span className="product-item__author">
                            by
                            <Link
                              to="/profile"
                              className="link hover-text-decoration-underline"
                            >
                              themepix
                            </Link>
                          </span>
                          <div className="flx-align gap-2">
                            <h6 className="product-item__price mb-0">$99</h6>
                            <span className="product-item__prevPrice text-decoration-line-through">
                              $129
                            </span>
                          </div>
                        </div>
                        <div className="product-item__bottom flx-between gap-2">
                          <div>
                            <span className="product-item__sales font-14 mb-2">
                              1300 Sales
                            </span>
                            <div className="d-flex align-items-center gap-1">
                              <ul className="star-rating">
                                <li className="star-rating__item font-11">
                                  <i className="fas fa-star" />
                                </li>
                                <li className="star-rating__item font-11">
                                  <i className="fas fa-star" />
                                </li>
                                <li className="star-rating__item font-11">
                                  <i className="fas fa-star" />
                                </li>
                                <li className="star-rating__item font-11">
                                  <i className="fas fa-star" />
                                </li>
                                <li className="star-rating__item font-11">
                                  <i className="fas fa-star" />
                                </li>
                              </ul>
                              <span className="star-rating__text text-heading fw-500 font-14">
                                (16)
                              </span>
                            </div>
                          </div>
                          <Link
                            to="/product-details"
                            className="btn btn-outline-light btn-sm pill"
                          >
                            Live Demo
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="col-xl-4 col-sm-6">
                    <div className="product-item section-bg">
                      <div className="product-item__thumb d-flex">
                        <Link to="/product-details" className="link w-100">
                          <img
                            src="assets/images/thumbs/product-img6.png"
                            alt=""
                            className="cover-img"
                          />
                        </Link>
                        <button
                          type="button"
                          className="product-item__wishlist"
                        >
                          <i className="fas fa-heart" />
                        </button>
                      </div>
                      <div className="product-item__content">
                        <h6 className="product-item__title">
                          <Link to="/product-details" className="link">
                            SaaS dashboard digital products Title here
                          </Link>
                        </h6>
                        <div className="product-item__info flx-between gap-2">
                          <span className="product-item__author">
                            by
                            <Link
                              to="/profile"
                              className="link hover-text-decoration-underline"
                            >
                              themepix
                            </Link>
                          </span>
                          <div className="flx-align gap-2">
                            <h6 className="product-item__price mb-0">$129</h6>
                            <span className="product-item__prevPrice text-decoration-line-through">
                              $256
                            </span>
                          </div>
                        </div>
                        <div className="product-item__bottom flx-between gap-2">
                          <div>
                            <span className="product-item__sales font-14 mb-2">
                              200 Sales
                            </span>
                            <div className="d-flex align-items-center gap-1">
                              <ul className="star-rating">
                                <li className="star-rating__item font-11">
                                  <i className="fas fa-star" />
                                </li>
                                <li className="star-rating__item font-11">
                                  <i className="fas fa-star" />
                                </li>
                                <li className="star-rating__item font-11">
                                  <i className="fas fa-star" />
                                </li>
                                <li className="star-rating__item font-11">
                                  <i className="fas fa-star" />
                                </li>
                                <li className="star-rating__item font-11">
                                  <i className="fas fa-star" />
                                </li>
                              </ul>
                              <span className="star-rating__text text-heading fw-500 font-14">
                                (16)
                              </span>
                            </div>
                          </div>
                          <Link
                            to="/product-details"
                            className="btn btn-outline-light btn-sm pill"
                          >
                            Live Demo
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="col-xl-4 col-sm-6">
                    <div className="product-item section-bg">
                      <div className="product-item__thumb d-flex">
                        <Link to="/product-details" className="link w-100">
                          <img
                            src="assets/images/thumbs/product-img7.png"
                            alt=""
                            className="cover-img"
                          />
                        </Link>
                        <button
                          type="button"
                          className="product-item__wishlist"
                        >
                          <i className="fas fa-heart" />
                        </button>
                      </div>
                      <div className="product-item__content">
                        <h6 className="product-item__title">
                          <Link to="/product-details" className="link">
                            SaaS dashboard digital products Title here
                          </Link>
                        </h6>
                        <div className="product-item__info flx-between gap-2">
                          <span className="product-item__author">
                            by
                            <Link
                              to="/profile"
                              className="link hover-text-decoration-underline"
                            >
                              themepix
                            </Link>
                          </span>
                          <div className="flx-align gap-2">
                            <h6 className="product-item__price mb-0">$129</h6>
                            <span className="product-item__prevPrice text-decoration-line-through">
                              $259
                            </span>
                          </div>
                        </div>
                        <div className="product-item__bottom flx-between gap-2">
                          <div>
                            <span className="product-item__sales font-14 mb-2">
                              500 Sales
                            </span>
                            <div className="d-flex align-items-center gap-1">
                              <ul className="star-rating">
                                <li className="star-rating__item font-11">
                                  <i className="fas fa-star" />
                                </li>
                                <li className="star-rating__item font-11">
                                  <i className="fas fa-star" />
                                </li>
                                <li className="star-rating__item font-11">
                                  <i className="fas fa-star" />
                                </li>
                                <li className="star-rating__item font-11">
                                  <i className="fas fa-star" />
                                </li>
                                <li className="star-rating__item font-11">
                                  <i className="fas fa-star" />
                                </li>
                              </ul>
                              <span className="star-rating__text text-heading fw-500 font-14">
                                (16)
                              </span>
                            </div>
                          </div>
                          <Link
                            to="/product-details"
                            className="btn btn-outline-light btn-sm pill"
                          >
                            Live Demo
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="col-xl-4 col-sm-6">
                    <div className="product-item section-bg">
                      <div className="product-item__thumb d-flex">
                        <Link to="/product-details" className="link w-100">
                          <img
                            src="assets/images/thumbs/product-img8.png"
                            alt=""
                            className="cover-img"
                          />
                        </Link>
                        <button
                          type="button"
                          className="product-item__wishlist"
                        >
                          <i className="fas fa-heart" />
                        </button>
                      </div>
                      <div className="product-item__content">
                        <h6 className="product-item__title">
                          <Link to="/product-details" className="link">
                            SaaS dashboard digital products Title here
                          </Link>
                        </h6>
                        <div className="product-item__info flx-between gap-2">
                          <span className="product-item__author">
                            by
                            <Link
                              to="/profile"
                              className="link hover-text-decoration-underline"
                            >
                              themepix
                            </Link>
                          </span>
                          <div className="flx-align gap-2">
                            <h6 className="product-item__price mb-0">$79</h6>
                            <span className="product-item__prevPrice text-decoration-line-through">
                              $99
                            </span>
                          </div>
                        </div>
                        <div className="product-item__bottom flx-between gap-2">
                          <div>
                            <span className="product-item__sales font-14 mb-2">
                              2100 Sales
                            </span>
                            <div className="d-flex align-items-center gap-1">
                              <ul className="star-rating">
                                <li className="star-rating__item font-11">
                                  <i className="fas fa-star" />
                                </li>
                                <li className="star-rating__item font-11">
                                  <i className="fas fa-star" />
                                </li>
                                <li className="star-rating__item font-11">
                                  <i className="fas fa-star" />
                                </li>
                                <li className="star-rating__item font-11">
                                  <i className="fas fa-star" />
                                </li>
                                <li className="star-rating__item font-11">
                                  <i className="fas fa-star" />
                                </li>
                              </ul>
                              <span className="star-rating__text text-heading fw-500 font-14">
                                (16)
                              </span>
                            </div>
                          </div>
                          <Link
                            to="/product-details"
                            className="btn btn-outline-light btn-sm pill"
                          >
                            Live Demo
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="col-xl-4 col-sm-6">
                    <div className="product-item section-bg">
                      <div className="product-item__thumb d-flex">
                        <Link to="/product-details" className="link w-100">
                          <img
                            src="assets/images/thumbs/product-img9.png"
                            alt=""
                            className="cover-img"
                          />
                        </Link>
                        <button
                          type="button"
                          className="product-item__wishlist"
                        >
                          <i className="fas fa-heart" />
                        </button>
                      </div>
                      <div className="product-item__content">
                        <h6 className="product-item__title">
                          <Link to="/product-details" className="link">
                            SaaS dashboard digital products Title here
                          </Link>
                        </h6>
                        <div className="product-item__info flx-between gap-2">
                          <span className="product-item__author">
                            by
                            <Link
                              to="/profile"
                              className="link hover-text-decoration-underline"
                            >
                              themepix
                            </Link>
                          </span>
                          <div className="flx-align gap-2">
                            <h6 className="product-item__price mb-0">$79</h6>
                            <span className="product-item__prevPrice text-decoration-line-through">
                              $99
                            </span>
                          </div>
                        </div>
                        <div className="product-item__bottom flx-between gap-2">
                          <div>
                            <span className="product-item__sales font-14 mb-2">
                              2100 Sales
                            </span>
                            <div className="d-flex align-items-center gap-1">
                              <ul className="star-rating">
                                <li className="star-rating__item font-11">
                                  <i className="fas fa-star" />
                                </li>
                                <li className="star-rating__item font-11">
                                  <i className="fas fa-star" />
                                </li>
                                <li className="star-rating__item font-11">
                                  <i className="fas fa-star" />
                                </li>
                                <li className="star-rating__item font-11">
                                  <i className="fas fa-star" />
                                </li>
                                <li className="star-rating__item font-11">
                                  <i className="fas fa-star" />
                                </li>
                              </ul>
                              <span className="star-rating__text text-heading fw-500 font-14">
                                (16)
                              </span>
                            </div>
                          </div>
                          <Link
                            to="/product-details"
                            className="btn btn-outline-light btn-sm pill"
                          >
                            Live Demo
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="col-xl-4 col-sm-6">
                    <div className="product-item section-bg">
                      <div className="product-item__thumb d-flex">
                        <Link to="/product-details" className="link w-100">
                          <img
                            src="assets/images/thumbs/product-img10.png"
                            alt=""
                            className="cover-img"
                          />
                        </Link>
                        <button
                          type="button"
                          className="product-item__wishlist"
                        >
                          <i className="fas fa-heart" />
                        </button>
                      </div>
                      <div className="product-item__content">
                        <h6 className="product-item__title">
                          <Link to="/product-details" className="link">
                            SaaS dashboard digital products Title here
                          </Link>
                        </h6>
                        <div className="product-item__info flx-between gap-2">
                          <span className="product-item__author">
                            by
                            <Link
                              to="/profile"
                              className="link hover-text-decoration-underline"
                            >
                              themepix
                            </Link>
                          </span>
                          <div className="flx-align gap-2">
                            <h6 className="product-item__price mb-0">$79</h6>
                            <span className="product-item__prevPrice text-decoration-line-through">
                              $99
                            </span>
                          </div>
                        </div>
                        <div className="product-item__bottom flx-between gap-2">
                          <div>
                            <span className="product-item__sales font-14 mb-2">
                              2100 Sales
                            </span>
                            <div className="d-flex align-items-center gap-1">
                              <ul className="star-rating">
                                <li className="star-rating__item font-11">
                                  <i className="fas fa-star" />
                                </li>
                                <li className="star-rating__item font-11">
                                  <i className="fas fa-star" />
                                </li>
                                <li className="star-rating__item font-11">
                                  <i className="fas fa-star" />
                                </li>
                                <li className="star-rating__item font-11">
                                  <i className="fas fa-star" />
                                </li>
                                <li className="star-rating__item font-11">
                                  <i className="fas fa-star" />
                                </li>
                              </ul>
                              <span className="star-rating__text text-heading fw-500 font-14">
                                (16)
                              </span>
                            </div>
                          </div>
                          <Link
                            to="/product-details"
                            className="btn btn-outline-light btn-sm pill"
                          >
                            Live Demo
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="col-xl-4 col-sm-6">
                    <div className="product-item section-bg">
                      <div className="product-item__thumb d-flex">
                        <Link to="/product-details" className="link w-100">
                          <img
                            src="assets/images/thumbs/product-img11.png"
                            alt=""
                            className="cover-img"
                          />
                        </Link>
                        <button
                          type="button"
                          className="product-item__wishlist"
                        >
                          <i className="fas fa-heart" />
                        </button>
                      </div>
                      <div className="product-item__content">
                        <h6 className="product-item__title">
                          <Link to="/product-details" className="link">
                            SaaS dashboard digital products Title here
                          </Link>
                        </h6>
                        <div className="product-item__info flx-between gap-2">
                          <span className="product-item__author">
                            by
                            <Link
                              to="/profile"
                              className="link hover-text-decoration-underline"
                            >
                              themepix
                            </Link>
                          </span>
                          <div className="flx-align gap-2">
                            <h6 className="product-item__price mb-0">$79</h6>
                            <span className="product-item__prevPrice text-decoration-line-through">
                              $99
                            </span>
                          </div>
                        </div>
                        <div className="product-item__bottom flx-between gap-2">
                          <div>
                            <span className="product-item__sales font-14 mb-2">
                              2100 Sales
                            </span>
                            <div className="d-flex align-items-center gap-1">
                              <ul className="star-rating">
                                <li className="star-rating__item font-11">
                                  <i className="fas fa-star" />
                                </li>
                                <li className="star-rating__item font-11">
                                  <i className="fas fa-star" />
                                </li>
                                <li className="star-rating__item font-11">
                                  <i className="fas fa-star" />
                                </li>
                                <li className="star-rating__item font-11">
                                  <i className="fas fa-star" />
                                </li>
                                <li className="star-rating__item font-11">
                                  <i className="fas fa-star" />
                                </li>
                              </ul>
                              <span className="star-rating__text text-heading fw-500 font-14">
                                (16)
                              </span>
                            </div>
                          </div>
                          <Link
                            to="/product-details"
                            className="btn btn-outline-light btn-sm pill"
                          >
                            Live Demo
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="col-xl-4 col-sm-6">
                    <div className="product-item section-bg">
                      <div className="product-item__thumb d-flex">
                        <Link to="/product-details" className="link w-100">
                          <img
                            src="assets/images/thumbs/product-img12.png"
                            alt=""
                            className="cover-img"
                          />
                        </Link>
                        <button
                          type="button"
                          className="product-item__wishlist"
                        >
                          <i className="fas fa-heart" />
                        </button>
                      </div>
                      <div className="product-item__content">
                        <h6 className="product-item__title">
                          <Link to="/product-details" className="link">
                            SaaS dashboard digital products Title here
                          </Link>
                        </h6>
                        <div className="product-item__info flx-between gap-2">
                          <span className="product-item__author">
                            by
                            <Link
                              to="/profile"
                              className="link hover-text-decoration-underline"
                            >
                              themepix
                            </Link>
                          </span>
                          <div className="flx-align gap-2">
                            <h6 className="product-item__price mb-0">$79</h6>
                            <span className="product-item__prevPrice text-decoration-line-through">
                              $99
                            </span>
                          </div>
                        </div>
                        <div className="product-item__bottom flx-between gap-2">
                          <div>
                            <span className="product-item__sales font-14 mb-2">
                              2100 Sales
                            </span>
                            <div className="d-flex align-items-center gap-1">
                              <ul className="star-rating">
                                <li className="star-rating__item font-11">
                                  <i className="fas fa-star" />
                                </li>
                                <li className="star-rating__item font-11">
                                  <i className="fas fa-star" />
                                </li>
                                <li className="star-rating__item font-11">
                                  <i className="fas fa-star" />
                                </li>
                                <li className="star-rating__item font-11">
                                  <i className="fas fa-star" />
                                </li>
                                <li className="star-rating__item font-11">
                                  <i className="fas fa-star" />
                                </li>
                              </ul>
                              <span className="star-rating__text text-heading fw-500 font-14">
                                (16)
                              </span>
                            </div>
                          </div>
                          <Link
                            to="/product-details"
                            className="btn btn-outline-light btn-sm pill"
                          >
                            Live Demo
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                {/* Pagination Start */}
                <nav aria-label="Page navigation example">
                  <ul className="pagination common-pagination">
                    <li className="page-item">
                      <Link className="page-link" to="#">
                        1
                      </Link>
                    </li>
                    <li className="page-item">
                      <Link className="page-link" to="#">
                        2
                      </Link>
                    </li>
                    <li className="page-item">
                      <Link className="page-link" to="#">
                        3
                      </Link>
                    </li>
                    <li className="page-item">
                      <Link className="page-link" to="#">
                        4
                      </Link>
                    </li>
                    <li className="page-item">
                      <Link className="page-link" to="#">
                        5
                      </Link>
                    </li>
                    <li className="page-item">
                      <Link
                        className="page-link flx-align gap-2 flex-nowrap"
                        to="#"
                      >
                        Next
                        <span className="icon line-height-1 font-20">
                          <i className="las la-arrow-right" />
                        </span>
                      </Link>
                    </li>
                  </ul>
                </nav>
                {/* Pagination End */}
              </div>
              <div
                className="tab-pane fade"
                id="pills-bestOffers"
                role="tabpanel"
                aria-labelledby="pills-bestOffers-tab"
                tabIndex={0}
              >
                <div className="row gy-4 list-grid-wrapper">
                  <div className="col-xl-4 col-sm-6">
                    <div className="product-item section-bg">
                      <div className="product-item__thumb d-flex">
                        <Link to="/product-details" className="link w-100">
                          <img
                            src="assets/images/thumbs/product-img1.png"
                            alt=""
                            className="cover-img"
                          />
                        </Link>
                        <button
                          type="button"
                          className="product-item__wishlist"
                        >
                          <i className="fas fa-heart" />
                        </button>
                      </div>
                      <div className="product-item__content">
                        <h6 className="product-item__title">
                          <Link to="/product-details" className="link">
                            SaaS dashboard digital products Title here
                          </Link>
                        </h6>
                        <div className="product-item__info flx-between gap-2">
                          <span className="product-item__author">
                            by
                            <Link
                              to="/profile"
                              className="link hover-text-decoration-underline"
                            >
                              themepix
                            </Link>
                          </span>
                          <div className="flx-align gap-2">
                            <h6 className="product-item__price mb-0">$120</h6>
                            <span className="product-item__prevPrice text-decoration-line-through">
                              $259
                            </span>
                          </div>
                        </div>
                        <div className="product-item__bottom flx-between gap-2">
                          <div>
                            <span className="product-item__sales font-14 mb-2">
                              1200 Sales
                            </span>
                            <div className="d-flex align-items-center gap-1">
                              <ul className="star-rating">
                                <li className="star-rating__item font-11">
                                  <i className="fas fa-star" />
                                </li>
                                <li className="star-rating__item font-11">
                                  <i className="fas fa-star" />
                                </li>
                                <li className="star-rating__item font-11">
                                  <i className="fas fa-star" />
                                </li>
                                <li className="star-rating__item font-11">
                                  <i className="fas fa-star" />
                                </li>
                                <li className="star-rating__item font-11">
                                  <i className="fas fa-star" />
                                </li>
                              </ul>
                              <span className="star-rating__text text-heading fw-500 font-14">
                                (16)
                              </span>
                            </div>
                          </div>
                          <Link
                            to="/product-details"
                            className="btn btn-outline-light btn-sm pill"
                          >
                            Live Demo
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="col-xl-4 col-sm-6">
                    <div className="product-item section-bg">
                      <div className="product-item__thumb d-flex">
                        <Link to="/product-details" className="link w-100">
                          <img
                            src="assets/images/thumbs/product-img2.png"
                            alt=""
                            className="cover-img"
                          />
                        </Link>
                        <button
                          type="button"
                          className="product-item__wishlist"
                        >
                          <i className="fas fa-heart" />
                        </button>
                      </div>
                      <div className="product-item__content">
                        <h6 className="product-item__title">
                          <Link to="/product-details" className="link">
                            SaaS dashboard digital products Title here
                          </Link>
                        </h6>
                        <div className="product-item__info flx-between gap-2">
                          <span className="product-item__author">
                            by
                            <Link
                              to="/profile"
                              className="link hover-text-decoration-underline"
                            >
                              themepix
                            </Link>
                          </span>
                          <div className="flx-align gap-2">
                            <h6 className="product-item__price mb-0">$129</h6>
                            <span className="product-item__prevPrice text-decoration-line-through">
                              $236
                            </span>
                          </div>
                        </div>
                        <div className="product-item__bottom flx-between gap-2">
                          <div>
                            <span className="product-item__sales font-14 mb-2">
                              100 Sales
                            </span>
                            <div className="d-flex align-items-center gap-1">
                              <ul className="star-rating">
                                <li className="star-rating__item font-11">
                                  <i className="fas fa-star" />
                                </li>
                                <li className="star-rating__item font-11">
                                  <i className="fas fa-star" />
                                </li>
                                <li className="star-rating__item font-11">
                                  <i className="fas fa-star" />
                                </li>
                                <li className="star-rating__item font-11">
                                  <i className="fas fa-star" />
                                </li>
                                <li className="star-rating__item font-11">
                                  <i className="fas fa-star" />
                                </li>
                              </ul>
                              <span className="star-rating__text text-heading fw-500 font-14">
                                (16)
                              </span>
                            </div>
                          </div>
                          <Link
                            to="/product-details"
                            className="btn btn-outline-light btn-sm pill"
                          >
                            Live Demo
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="col-xl-4 col-sm-6">
                    <div className="product-item section-bg">
                      <div className="product-item__thumb d-flex">
                        <Link to="/product-details" className="link w-100">
                          <img
                            src="assets/images/thumbs/product-img3.png"
                            alt=""
                            className="cover-img"
                          />
                        </Link>
                        <button
                          type="button"
                          className="product-item__wishlist"
                        >
                          <i className="fas fa-heart" />
                        </button>
                      </div>
                      <div className="product-item__content">
                        <h6 className="product-item__title">
                          <Link to="/product-details" className="link">
                            SaaS dashboard digital products Title here
                          </Link>
                        </h6>
                        <div className="product-item__info flx-between gap-2">
                          <span className="product-item__author">
                            by
                            <Link
                              to="/profile"
                              className="link hover-text-decoration-underline"
                            >
                              themepix
                            </Link>
                          </span>
                          <div className="flx-align gap-2">
                            <h6 className="product-item__price mb-0">$79</h6>
                            <span className="product-item__prevPrice text-decoration-line-through">
                              $99
                            </span>
                          </div>
                        </div>
                        <div className="product-item__bottom flx-between gap-2">
                          <div>
                            <span className="product-item__sales font-14 mb-2">
                              900 Sales
                            </span>
                            <div className="d-flex align-items-center gap-1">
                              <ul className="star-rating">
                                <li className="star-rating__item font-11">
                                  <i className="fas fa-star" />
                                </li>
                                <li className="star-rating__item font-11">
                                  <i className="fas fa-star" />
                                </li>
                                <li className="star-rating__item font-11">
                                  <i className="fas fa-star" />
                                </li>
                                <li className="star-rating__item font-11">
                                  <i className="fas fa-star" />
                                </li>
                                <li className="star-rating__item font-11">
                                  <i className="fas fa-star" />
                                </li>
                              </ul>
                              <span className="star-rating__text text-heading fw-500 font-14">
                                (16)
                              </span>
                            </div>
                          </div>
                          <Link
                            to="/product-details"
                            className="btn btn-outline-light btn-sm pill"
                          >
                            Live Demo
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="col-xl-4 col-sm-6">
                    <div className="product-item section-bg">
                      <div className="product-item__thumb d-flex">
                        <Link to="/product-details" className="link w-100">
                          <img
                            src="assets/images/thumbs/product-img4.png"
                            alt=""
                            className="cover-img"
                          />
                        </Link>
                        <button
                          type="button"
                          className="product-item__wishlist"
                        >
                          <i className="fas fa-heart" />
                        </button>
                      </div>
                      <div className="product-item__content">
                        <h6 className="product-item__title">
                          <Link to="/product-details" className="link">
                            SaaS dashboard digital products Title here
                          </Link>
                        </h6>
                        <div className="product-item__info flx-between gap-2">
                          <span className="product-item__author">
                            by
                            <Link
                              to="/profile"
                              className="link hover-text-decoration-underline"
                            >
                              themepix
                            </Link>
                          </span>
                          <div className="flx-align gap-2">
                            <h6 className="product-item__price mb-0">$59</h6>
                            <span className="product-item__prevPrice text-decoration-line-through">
                              $129
                            </span>
                          </div>
                        </div>
                        <div className="product-item__bottom flx-between gap-2">
                          <div>
                            <span className="product-item__sales font-14 mb-2">
                              1225 Sales
                            </span>
                            <div className="d-flex align-items-center gap-1">
                              <ul className="star-rating">
                                <li className="star-rating__item font-11">
                                  <i className="fas fa-star" />
                                </li>
                                <li className="star-rating__item font-11">
                                  <i className="fas fa-star" />
                                </li>
                                <li className="star-rating__item font-11">
                                  <i className="fas fa-star" />
                                </li>
                                <li className="star-rating__item font-11">
                                  <i className="fas fa-star" />
                                </li>
                                <li className="star-rating__item font-11">
                                  <i className="fas fa-star" />
                                </li>
                              </ul>
                              <span className="star-rating__text text-heading fw-500 font-14">
                                (16)
                              </span>
                            </div>
                          </div>
                          <Link
                            to="/product-details"
                            className="btn btn-outline-light btn-sm pill"
                          >
                            Live Demo
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="col-xl-4 col-sm-6">
                    <div className="product-item section-bg">
                      <div className="product-item__thumb d-flex">
                        <Link to="/product-details" className="link w-100">
                          <img
                            src="assets/images/thumbs/product-img5.png"
                            alt=""
                            className="cover-img"
                          />
                        </Link>
                        <button
                          type="button"
                          className="product-item__wishlist"
                        >
                          <i className="fas fa-heart" />
                        </button>
                      </div>
                      <div className="product-item__content">
                        <h6 className="product-item__title">
                          <Link to="/product-details" className="link">
                            SaaS dashboard digital products Title here
                          </Link>
                        </h6>
                        <div className="product-item__info flx-between gap-2">
                          <span className="product-item__author">
                            by
                            <Link
                              to="/profile"
                              className="link hover-text-decoration-underline"
                            >
                              themepix
                            </Link>
                          </span>
                          <div className="flx-align gap-2">
                            <h6 className="product-item__price mb-0">$99</h6>
                            <span className="product-item__prevPrice text-decoration-line-through">
                              $129
                            </span>
                          </div>
                        </div>
                        <div className="product-item__bottom flx-between gap-2">
                          <div>
                            <span className="product-item__sales font-14 mb-2">
                              1300 Sales
                            </span>
                            <div className="d-flex align-items-center gap-1">
                              <ul className="star-rating">
                                <li className="star-rating__item font-11">
                                  <i className="fas fa-star" />
                                </li>
                                <li className="star-rating__item font-11">
                                  <i className="fas fa-star" />
                                </li>
                                <li className="star-rating__item font-11">
                                  <i className="fas fa-star" />
                                </li>
                                <li className="star-rating__item font-11">
                                  <i className="fas fa-star" />
                                </li>
                                <li className="star-rating__item font-11">
                                  <i className="fas fa-star" />
                                </li>
                              </ul>
                              <span className="star-rating__text text-heading fw-500 font-14">
                                (16)
                              </span>
                            </div>
                          </div>
                          <Link
                            to="/product-details"
                            className="btn btn-outline-light btn-sm pill"
                          >
                            Live Demo
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="col-xl-4 col-sm-6">
                    <div className="product-item section-bg">
                      <div className="product-item__thumb d-flex">
                        <Link to="/product-details" className="link w-100">
                          <img
                            src="assets/images/thumbs/product-img6.png"
                            alt=""
                            className="cover-img"
                          />
                        </Link>
                        <button
                          type="button"
                          className="product-item__wishlist"
                        >
                          <i className="fas fa-heart" />
                        </button>
                      </div>
                      <div className="product-item__content">
                        <h6 className="product-item__title">
                          <Link to="/product-details" className="link">
                            SaaS dashboard digital products Title here
                          </Link>
                        </h6>
                        <div className="product-item__info flx-between gap-2">
                          <span className="product-item__author">
                            by
                            <Link
                              to="/profile"
                              className="link hover-text-decoration-underline"
                            >
                              themepix
                            </Link>
                          </span>
                          <div className="flx-align gap-2">
                            <h6 className="product-item__price mb-0">$129</h6>
                            <span className="product-item__prevPrice text-decoration-line-through">
                              $256
                            </span>
                          </div>
                        </div>
                        <div className="product-item__bottom flx-between gap-2">
                          <div>
                            <span className="product-item__sales font-14 mb-2">
                              200 Sales
                            </span>
                            <div className="d-flex align-items-center gap-1">
                              <ul className="star-rating">
                                <li className="star-rating__item font-11">
                                  <i className="fas fa-star" />
                                </li>
                                <li className="star-rating__item font-11">
                                  <i className="fas fa-star" />
                                </li>
                                <li className="star-rating__item font-11">
                                  <i className="fas fa-star" />
                                </li>
                                <li className="star-rating__item font-11">
                                  <i className="fas fa-star" />
                                </li>
                                <li className="star-rating__item font-11">
                                  <i className="fas fa-star" />
                                </li>
                              </ul>
                              <span className="star-rating__text text-heading fw-500 font-14">
                                (16)
                              </span>
                            </div>
                          </div>
                          <Link
                            to="/product-details"
                            className="btn btn-outline-light btn-sm pill"
                          >
                            Live Demo
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="col-xl-4 col-sm-6">
                    <div className="product-item section-bg">
                      <div className="product-item__thumb d-flex">
                        <Link to="/product-details" className="link w-100">
                          <img
                            src="assets/images/thumbs/product-img7.png"
                            alt=""
                            className="cover-img"
                          />
                        </Link>
                        <button
                          type="button"
                          className="product-item__wishlist"
                        >
                          <i className="fas fa-heart" />
                        </button>
                      </div>
                      <div className="product-item__content">
                        <h6 className="product-item__title">
                          <Link to="/product-details" className="link">
                            SaaS dashboard digital products Title here
                          </Link>
                        </h6>
                        <div className="product-item__info flx-between gap-2">
                          <span className="product-item__author">
                            by
                            <Link
                              to="/profile"
                              className="link hover-text-decoration-underline"
                            >
                              themepix
                            </Link>
                          </span>
                          <div className="flx-align gap-2">
                            <h6 className="product-item__price mb-0">$129</h6>
                            <span className="product-item__prevPrice text-decoration-line-through">
                              $259
                            </span>
                          </div>
                        </div>
                        <div className="product-item__bottom flx-between gap-2">
                          <div>
                            <span className="product-item__sales font-14 mb-2">
                              500 Sales
                            </span>
                            <div className="d-flex align-items-center gap-1">
                              <ul className="star-rating">
                                <li className="star-rating__item font-11">
                                  <i className="fas fa-star" />
                                </li>
                                <li className="star-rating__item font-11">
                                  <i className="fas fa-star" />
                                </li>
                                <li className="star-rating__item font-11">
                                  <i className="fas fa-star" />
                                </li>
                                <li className="star-rating__item font-11">
                                  <i className="fas fa-star" />
                                </li>
                                <li className="star-rating__item font-11">
                                  <i className="fas fa-star" />
                                </li>
                              </ul>
                              <span className="star-rating__text text-heading fw-500 font-14">
                                (16)
                              </span>
                            </div>
                          </div>
                          <Link
                            to="/product-details"
                            className="btn btn-outline-light btn-sm pill"
                          >
                            Live Demo
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="col-xl-4 col-sm-6">
                    <div className="product-item section-bg">
                      <div className="product-item__thumb d-flex">
                        <Link to="/product-details" className="link w-100">
                          <img
                            src="assets/images/thumbs/product-img8.png"
                            alt=""
                            className="cover-img"
                          />
                        </Link>
                        <button
                          type="button"
                          className="product-item__wishlist"
                        >
                          <i className="fas fa-heart" />
                        </button>
                      </div>
                      <div className="product-item__content">
                        <h6 className="product-item__title">
                          <Link to="/product-details" className="link">
                            SaaS dashboard digital products Title here
                          </Link>
                        </h6>
                        <div className="product-item__info flx-between gap-2">
                          <span className="product-item__author">
                            by
                            <Link
                              to="/profile"
                              className="link hover-text-decoration-underline"
                            >
                              themepix
                            </Link>
                          </span>
                          <div className="flx-align gap-2">
                            <h6 className="product-item__price mb-0">$79</h6>
                            <span className="product-item__prevPrice text-decoration-line-through">
                              $99
                            </span>
                          </div>
                        </div>
                        <div className="product-item__bottom flx-between gap-2">
                          <div>
                            <span className="product-item__sales font-14 mb-2">
                              2100 Sales
                            </span>
                            <div className="d-flex align-items-center gap-1">
                              <ul className="star-rating">
                                <li className="star-rating__item font-11">
                                  <i className="fas fa-star" />
                                </li>
                                <li className="star-rating__item font-11">
                                  <i className="fas fa-star" />
                                </li>
                                <li className="star-rating__item font-11">
                                  <i className="fas fa-star" />
                                </li>
                                <li className="star-rating__item font-11">
                                  <i className="fas fa-star" />
                                </li>
                                <li className="star-rating__item font-11">
                                  <i className="fas fa-star" />
                                </li>
                              </ul>
                              <span className="star-rating__text text-heading fw-500 font-14">
                                (16)
                              </span>
                            </div>
                          </div>
                          <Link
                            to="/product-details"
                            className="btn btn-outline-light btn-sm pill"
                          >
                            Live Demo
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="col-xl-4 col-sm-6">
                    <div className="product-item section-bg">
                      <div className="product-item__thumb d-flex">
                        <Link to="/product-details" className="link w-100">
                          <img
                            src="assets/images/thumbs/product-img9.png"
                            alt=""
                            className="cover-img"
                          />
                        </Link>
                        <button
                          type="button"
                          className="product-item__wishlist"
                        >
                          <i className="fas fa-heart" />
                        </button>
                      </div>
                      <div className="product-item__content">
                        <h6 className="product-item__title">
                          <Link to="/product-details" className="link">
                            SaaS dashboard digital products Title here
                          </Link>
                        </h6>
                        <div className="product-item__info flx-between gap-2">
                          <span className="product-item__author">
                            by
                            <Link
                              to="/profile"
                              className="link hover-text-decoration-underline"
                            >
                              themepix
                            </Link>
                          </span>
                          <div className="flx-align gap-2">
                            <h6 className="product-item__price mb-0">$79</h6>
                            <span className="product-item__prevPrice text-decoration-line-through">
                              $99
                            </span>
                          </div>
                        </div>
                        <div className="product-item__bottom flx-between gap-2">
                          <div>
                            <span className="product-item__sales font-14 mb-2">
                              2100 Sales
                            </span>
                            <div className="d-flex align-items-center gap-1">
                              <ul className="star-rating">
                                <li className="star-rating__item font-11">
                                  <i className="fas fa-star" />
                                </li>
                                <li className="star-rating__item font-11">
                                  <i className="fas fa-star" />
                                </li>
                                <li className="star-rating__item font-11">
                                  <i className="fas fa-star" />
                                </li>
                                <li className="star-rating__item font-11">
                                  <i className="fas fa-star" />
                                </li>
                                <li className="star-rating__item font-11">
                                  <i className="fas fa-star" />
                                </li>
                              </ul>
                              <span className="star-rating__text text-heading fw-500 font-14">
                                (16)
                              </span>
                            </div>
                          </div>
                          <Link
                            to="/product-details"
                            className="btn btn-outline-light btn-sm pill"
                          >
                            Live Demo
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="col-xl-4 col-sm-6">
                    <div className="product-item section-bg">
                      <div className="product-item__thumb d-flex">
                        <Link to="/product-details" className="link w-100">
                          <img
                            src="assets/images/thumbs/product-img10.png"
                            alt=""
                            className="cover-img"
                          />
                        </Link>
                        <button
                          type="button"
                          className="product-item__wishlist"
                        >
                          <i className="fas fa-heart" />
                        </button>
                      </div>
                      <div className="product-item__content">
                        <h6 className="product-item__title">
                          <Link to="/product-details" className="link">
                            SaaS dashboard digital products Title here
                          </Link>
                        </h6>
                        <div className="product-item__info flx-between gap-2">
                          <span className="product-item__author">
                            by
                            <Link
                              to="/profile"
                              className="link hover-text-decoration-underline"
                            >
                              themepix
                            </Link>
                          </span>
                          <div className="flx-align gap-2">
                            <h6 className="product-item__price mb-0">$79</h6>
                            <span className="product-item__prevPrice text-decoration-line-through">
                              $99
                            </span>
                          </div>
                        </div>
                        <div className="product-item__bottom flx-between gap-2">
                          <div>
                            <span className="product-item__sales font-14 mb-2">
                              2100 Sales
                            </span>
                            <div className="d-flex align-items-center gap-1">
                              <ul className="star-rating">
                                <li className="star-rating__item font-11">
                                  <i className="fas fa-star" />
                                </li>
                                <li className="star-rating__item font-11">
                                  <i className="fas fa-star" />
                                </li>
                                <li className="star-rating__item font-11">
                                  <i className="fas fa-star" />
                                </li>
                                <li className="star-rating__item font-11">
                                  <i className="fas fa-star" />
                                </li>
                                <li className="star-rating__item font-11">
                                  <i className="fas fa-star" />
                                </li>
                              </ul>
                              <span className="star-rating__text text-heading fw-500 font-14">
                                (16)
                              </span>
                            </div>
                          </div>
                          <Link
                            to="/product-details"
                            className="btn btn-outline-light btn-sm pill"
                          >
                            Live Demo
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="col-xl-4 col-sm-6">
                    <div className="product-item section-bg">
                      <div className="product-item__thumb d-flex">
                        <Link to="/product-details" className="link w-100">
                          <img
                            src="assets/images/thumbs/product-img11.png"
                            alt=""
                            className="cover-img"
                          />
                        </Link>
                        <button
                          type="button"
                          className="product-item__wishlist"
                        >
                          <i className="fas fa-heart" />
                        </button>
                      </div>
                      <div className="product-item__content">
                        <h6 className="product-item__title">
                          <Link to="/product-details" className="link">
                            SaaS dashboard digital products Title here
                          </Link>
                        </h6>
                        <div className="product-item__info flx-between gap-2">
                          <span className="product-item__author">
                            by
                            <Link
                              to="/profile"
                              className="link hover-text-decoration-underline"
                            >
                              themepix
                            </Link>
                          </span>
                          <div className="flx-align gap-2">
                            <h6 className="product-item__price mb-0">$79</h6>
                            <span className="product-item__prevPrice text-decoration-line-through">
                              $99
                            </span>
                          </div>
                        </div>
                        <div className="product-item__bottom flx-between gap-2">
                          <div>
                            <span className="product-item__sales font-14 mb-2">
                              2100 Sales
                            </span>
                            <div className="d-flex align-items-center gap-1">
                              <ul className="star-rating">
                                <li className="star-rating__item font-11">
                                  <i className="fas fa-star" />
                                </li>
                                <li className="star-rating__item font-11">
                                  <i className="fas fa-star" />
                                </li>
                                <li className="star-rating__item font-11">
                                  <i className="fas fa-star" />
                                </li>
                                <li className="star-rating__item font-11">
                                  <i className="fas fa-star" />
                                </li>
                                <li className="star-rating__item font-11">
                                  <i className="fas fa-star" />
                                </li>
                              </ul>
                              <span className="star-rating__text text-heading fw-500 font-14">
                                (16)
                              </span>
                            </div>
                          </div>
                          <Link
                            to="/product-details"
                            className="btn btn-outline-light btn-sm pill"
                          >
                            Live Demo
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="col-xl-4 col-sm-6">
                    <div className="product-item section-bg">
                      <div className="product-item__thumb d-flex">
                        <Link to="/product-details" className="link w-100">
                          <img
                            src="assets/images/thumbs/product-img12.png"
                            alt=""
                            className="cover-img"
                          />
                        </Link>
                        <button
                          type="button"
                          className="product-item__wishlist"
                        >
                          <i className="fas fa-heart" />
                        </button>
                      </div>
                      <div className="product-item__content">
                        <h6 className="product-item__title">
                          <Link to="/product-details" className="link">
                            SaaS dashboard digital products Title here
                          </Link>
                        </h6>
                        <div className="product-item__info flx-between gap-2">
                          <span className="product-item__author">
                            by
                            <Link
                              to="/profile"
                              className="link hover-text-decoration-underline"
                            >
                              themepix
                            </Link>
                          </span>
                          <div className="flx-align gap-2">
                            <h6 className="product-item__price mb-0">$79</h6>
                            <span className="product-item__prevPrice text-decoration-line-through">
                              $99
                            </span>
                          </div>
                        </div>
                        <div className="product-item__bottom flx-between gap-2">
                          <div>
                            <span className="product-item__sales font-14 mb-2">
                              2100 Sales
                            </span>
                            <div className="d-flex align-items-center gap-1">
                              <ul className="star-rating">
                                <li className="star-rating__item font-11">
                                  <i className="fas fa-star" />
                                </li>
                                <li className="star-rating__item font-11">
                                  <i className="fas fa-star" />
                                </li>
                                <li className="star-rating__item font-11">
                                  <i className="fas fa-star" />
                                </li>
                                <li className="star-rating__item font-11">
                                  <i className="fas fa-star" />
                                </li>
                                <li className="star-rating__item font-11">
                                  <i className="fas fa-star" />
                                </li>
                              </ul>
                              <span className="star-rating__text text-heading fw-500 font-14">
                                (16)
                              </span>
                            </div>
                          </div>
                          <Link
                            to="/product-details"
                            className="btn btn-outline-light btn-sm pill"
                          >
                            Live Demo
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                {/* Pagination Start */}
                <nav aria-label="Page navigation example">
                  <ul className="pagination common-pagination">
                    <li className="page-item">
                      <Link className="page-link" to="#">
                        1
                      </Link>
                    </li>
                    <li className="page-item">
                      <Link className="page-link" to="#">
                        2
                      </Link>
                    </li>
                    <li className="page-item">
                      <Link className="page-link" to="#">
                        3
                      </Link>
                    </li>
                    <li className="page-item">
                      <Link className="page-link" to="#">
                        4
                      </Link>
                    </li>
                    <li className="page-item">
                      <Link className="page-link" to="#">
                        5
                      </Link>
                    </li>
                    <li className="page-item">
                      <Link
                        className="page-link flx-align gap-2 flex-nowrap"
                        to="#"
                      >
                        Next
                        <span className="icon line-height-1 font-20">
                          <i className="las la-arrow-right" />
                        </span>
                      </Link>
                    </li>
                  </ul>
                </nav>
                {/* Pagination End */}
              </div>
              <div
                className="tab-pane fade"
                id="pills-bestSelling"
                role="tabpanel"
                aria-labelledby="pills-bestSelling-tab"
                tabIndex={0}
              >
                <div className="row gy-4 list-grid-wrapper">
                  <div className="col-xl-4 col-sm-6">
                    <div className="product-item section-bg">
                      <div className="product-item__thumb d-flex">
                        <Link to="/product-details" className="link w-100">
                          <img
                            src="assets/images/thumbs/product-img1.png"
                            alt=""
                            className="cover-img"
                          />
                        </Link>
                        <button
                          type="button"
                          className="product-item__wishlist"
                        >
                          <i className="fas fa-heart" />
                        </button>
                      </div>
                      <div className="product-item__content">
                        <h6 className="product-item__title">
                          <Link to="/product-details" className="link">
                            SaaS dashboard digital products Title here
                          </Link>
                        </h6>
                        <div className="product-item__info flx-between gap-2">
                          <span className="product-item__author">
                            by
                            <Link
                              to="/profile"
                              className="link hover-text-decoration-underline"
                            >
                              themepix
                            </Link>
                          </span>
                          <div className="flx-align gap-2">
                            <h6 className="product-item__price mb-0">$120</h6>
                            <span className="product-item__prevPrice text-decoration-line-through">
                              $259
                            </span>
                          </div>
                        </div>
                        <div className="product-item__bottom flx-between gap-2">
                          <div>
                            <span className="product-item__sales font-14 mb-2">
                              1200 Sales
                            </span>
                            <div className="d-flex align-items-center gap-1">
                              <ul className="star-rating">
                                <li className="star-rating__item font-11">
                                  <i className="fas fa-star" />
                                </li>
                                <li className="star-rating__item font-11">
                                  <i className="fas fa-star" />
                                </li>
                                <li className="star-rating__item font-11">
                                  <i className="fas fa-star" />
                                </li>
                                <li className="star-rating__item font-11">
                                  <i className="fas fa-star" />
                                </li>
                                <li className="star-rating__item font-11">
                                  <i className="fas fa-star" />
                                </li>
                              </ul>
                              <span className="star-rating__text text-heading fw-500 font-14">
                                (16)
                              </span>
                            </div>
                          </div>
                          <Link
                            to="/product-details"
                            className="btn btn-outline-light btn-sm pill"
                          >
                            Live Demo
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="col-xl-4 col-sm-6">
                    <div className="product-item section-bg">
                      <div className="product-item__thumb d-flex">
                        <Link to="/product-details" className="link w-100">
                          <img
                            src="assets/images/thumbs/product-img2.png"
                            alt=""
                            className="cover-img"
                          />
                        </Link>
                        <button
                          type="button"
                          className="product-item__wishlist"
                        >
                          <i className="fas fa-heart" />
                        </button>
                      </div>
                      <div className="product-item__content">
                        <h6 className="product-item__title">
                          <Link to="/product-details" className="link">
                            SaaS dashboard digital products Title here
                          </Link>
                        </h6>
                        <div className="product-item__info flx-between gap-2">
                          <span className="product-item__author">
                            by
                            <Link
                              to="/profile"
                              className="link hover-text-decoration-underline"
                            >
                              themepix
                            </Link>
                          </span>
                          <div className="flx-align gap-2">
                            <h6 className="product-item__price mb-0">$129</h6>
                            <span className="product-item__prevPrice text-decoration-line-through">
                              $236
                            </span>
                          </div>
                        </div>
                        <div className="product-item__bottom flx-between gap-2">
                          <div>
                            <span className="product-item__sales font-14 mb-2">
                              100 Sales
                            </span>
                            <div className="d-flex align-items-center gap-1">
                              <ul className="star-rating">
                                <li className="star-rating__item font-11">
                                  <i className="fas fa-star" />
                                </li>
                                <li className="star-rating__item font-11">
                                  <i className="fas fa-star" />
                                </li>
                                <li className="star-rating__item font-11">
                                  <i className="fas fa-star" />
                                </li>
                                <li className="star-rating__item font-11">
                                  <i className="fas fa-star" />
                                </li>
                                <li className="star-rating__item font-11">
                                  <i className="fas fa-star" />
                                </li>
                              </ul>
                              <span className="star-rating__text text-heading fw-500 font-14">
                                (16)
                              </span>
                            </div>
                          </div>
                          <Link
                            to="/product-details"
                            className="btn btn-outline-light btn-sm pill"
                          >
                            Live Demo
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="col-xl-4 col-sm-6">
                    <div className="product-item section-bg">
                      <div className="product-item__thumb d-flex">
                        <Link to="/product-details" className="link w-100">
                          <img
                            src="assets/images/thumbs/product-img3.png"
                            alt=""
                            className="cover-img"
                          />
                        </Link>
                        <button
                          type="button"
                          className="product-item__wishlist"
                        >
                          <i className="fas fa-heart" />
                        </button>
                      </div>
                      <div className="product-item__content">
                        <h6 className="product-item__title">
                          <Link to="/product-details" className="link">
                            SaaS dashboard digital products Title here
                          </Link>
                        </h6>
                        <div className="product-item__info flx-between gap-2">
                          <span className="product-item__author">
                            by
                            <Link
                              to="/profile"
                              className="link hover-text-decoration-underline"
                            >
                              themepix
                            </Link>
                          </span>
                          <div className="flx-align gap-2">
                            <h6 className="product-item__price mb-0">$79</h6>
                            <span className="product-item__prevPrice text-decoration-line-through">
                              $99
                            </span>
                          </div>
                        </div>
                        <div className="product-item__bottom flx-between gap-2">
                          <div>
                            <span className="product-item__sales font-14 mb-2">
                              900 Sales
                            </span>
                            <div className="d-flex align-items-center gap-1">
                              <ul className="star-rating">
                                <li className="star-rating__item font-11">
                                  <i className="fas fa-star" />
                                </li>
                                <li className="star-rating__item font-11">
                                  <i className="fas fa-star" />
                                </li>
                                <li className="star-rating__item font-11">
                                  <i className="fas fa-star" />
                                </li>
                                <li className="star-rating__item font-11">
                                  <i className="fas fa-star" />
                                </li>
                                <li className="star-rating__item font-11">
                                  <i className="fas fa-star" />
                                </li>
                              </ul>
                              <span className="star-rating__text text-heading fw-500 font-14">
                                (16)
                              </span>
                            </div>
                          </div>
                          <Link
                            to="/product-details"
                            className="btn btn-outline-light btn-sm pill"
                          >
                            Live Demo
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="col-xl-4 col-sm-6">
                    <div className="product-item section-bg">
                      <div className="product-item__thumb d-flex">
                        <Link to="/product-details" className="link w-100">
                          <img
                            src="assets/images/thumbs/product-img4.png"
                            alt=""
                            className="cover-img"
                          />
                        </Link>
                        <button
                          type="button"
                          className="product-item__wishlist"
                        >
                          <i className="fas fa-heart" />
                        </button>
                      </div>
                      <div className="product-item__content">
                        <h6 className="product-item__title">
                          <Link to="/product-details" className="link">
                            SaaS dashboard digital products Title here
                          </Link>
                        </h6>
                        <div className="product-item__info flx-between gap-2">
                          <span className="product-item__author">
                            by
                            <Link
                              to="/profile"
                              className="link hover-text-decoration-underline"
                            >
                              themepix
                            </Link>
                          </span>
                          <div className="flx-align gap-2">
                            <h6 className="product-item__price mb-0">$59</h6>
                            <span className="product-item__prevPrice text-decoration-line-through">
                              $129
                            </span>
                          </div>
                        </div>
                        <div className="product-item__bottom flx-between gap-2">
                          <div>
                            <span className="product-item__sales font-14 mb-2">
                              1225 Sales
                            </span>
                            <div className="d-flex align-items-center gap-1">
                              <ul className="star-rating">
                                <li className="star-rating__item font-11">
                                  <i className="fas fa-star" />
                                </li>
                                <li className="star-rating__item font-11">
                                  <i className="fas fa-star" />
                                </li>
                                <li className="star-rating__item font-11">
                                  <i className="fas fa-star" />
                                </li>
                                <li className="star-rating__item font-11">
                                  <i className="fas fa-star" />
                                </li>
                                <li className="star-rating__item font-11">
                                  <i className="fas fa-star" />
                                </li>
                              </ul>
                              <span className="star-rating__text text-heading fw-500 font-14">
                                (16)
                              </span>
                            </div>
                          </div>
                          <Link
                            to="/product-details"
                            className="btn btn-outline-light btn-sm pill"
                          >
                            Live Demo
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="col-xl-4 col-sm-6">
                    <div className="product-item section-bg">
                      <div className="product-item__thumb d-flex">
                        <Link to="/product-details" className="link w-100">
                          <img
                            src="assets/images/thumbs/product-img5.png"
                            alt=""
                            className="cover-img"
                          />
                        </Link>
                        <button
                          type="button"
                          className="product-item__wishlist"
                        >
                          <i className="fas fa-heart" />
                        </button>
                      </div>
                      <div className="product-item__content">
                        <h6 className="product-item__title">
                          <Link to="/product-details" className="link">
                            SaaS dashboard digital products Title here
                          </Link>
                        </h6>
                        <div className="product-item__info flx-between gap-2">
                          <span className="product-item__author">
                            by
                            <Link
                              to="/profile"
                              className="link hover-text-decoration-underline"
                            >
                              themepix
                            </Link>
                          </span>
                          <div className="flx-align gap-2">
                            <h6 className="product-item__price mb-0">$99</h6>
                            <span className="product-item__prevPrice text-decoration-line-through">
                              $129
                            </span>
                          </div>
                        </div>
                        <div className="product-item__bottom flx-between gap-2">
                          <div>
                            <span className="product-item__sales font-14 mb-2">
                              1300 Sales
                            </span>
                            <div className="d-flex align-items-center gap-1">
                              <ul className="star-rating">
                                <li className="star-rating__item font-11">
                                  <i className="fas fa-star" />
                                </li>
                                <li className="star-rating__item font-11">
                                  <i className="fas fa-star" />
                                </li>
                                <li className="star-rating__item font-11">
                                  <i className="fas fa-star" />
                                </li>
                                <li className="star-rating__item font-11">
                                  <i className="fas fa-star" />
                                </li>
                                <li className="star-rating__item font-11">
                                  <i className="fas fa-star" />
                                </li>
                              </ul>
                              <span className="star-rating__text text-heading fw-500 font-14">
                                (16)
                              </span>
                            </div>
                          </div>
                          <Link
                            to="/product-details"
                            className="btn btn-outline-light btn-sm pill"
                          >
                            Live Demo
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="col-xl-4 col-sm-6">
                    <div className="product-item section-bg">
                      <div className="product-item__thumb d-flex">
                        <Link to="/product-details" className="link w-100">
                          <img
                            src="assets/images/thumbs/product-img6.png"
                            alt=""
                            className="cover-img"
                          />
                        </Link>
                        <button
                          type="button"
                          className="product-item__wishlist"
                        >
                          <i className="fas fa-heart" />
                        </button>
                      </div>
                      <div className="product-item__content">
                        <h6 className="product-item__title">
                          <Link to="/product-details" className="link">
                            SaaS dashboard digital products Title here
                          </Link>
                        </h6>
                        <div className="product-item__info flx-between gap-2">
                          <span className="product-item__author">
                            by
                            <Link
                              to="/profile"
                              className="link hover-text-decoration-underline"
                            >
                              themepix
                            </Link>
                          </span>
                          <div className="flx-align gap-2">
                            <h6 className="product-item__price mb-0">$129</h6>
                            <span className="product-item__prevPrice text-decoration-line-through">
                              $256
                            </span>
                          </div>
                        </div>
                        <div className="product-item__bottom flx-between gap-2">
                          <div>
                            <span className="product-item__sales font-14 mb-2">
                              200 Sales
                            </span>
                            <div className="d-flex align-items-center gap-1">
                              <ul className="star-rating">
                                <li className="star-rating__item font-11">
                                  <i className="fas fa-star" />
                                </li>
                                <li className="star-rating__item font-11">
                                  <i className="fas fa-star" />
                                </li>
                                <li className="star-rating__item font-11">
                                  <i className="fas fa-star" />
                                </li>
                                <li className="star-rating__item font-11">
                                  <i className="fas fa-star" />
                                </li>
                                <li className="star-rating__item font-11">
                                  <i className="fas fa-star" />
                                </li>
                              </ul>
                              <span className="star-rating__text text-heading fw-500 font-14">
                                (16)
                              </span>
                            </div>
                          </div>
                          <Link
                            to="/product-details"
                            className="btn btn-outline-light btn-sm pill"
                          >
                            Live Demo
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="col-xl-4 col-sm-6">
                    <div className="product-item section-bg">
                      <div className="product-item__thumb d-flex">
                        <Link to="/product-details" className="link w-100">
                          <img
                            src="assets/images/thumbs/product-img7.png"
                            alt=""
                            className="cover-img"
                          />
                        </Link>
                        <button
                          type="button"
                          className="product-item__wishlist"
                        >
                          <i className="fas fa-heart" />
                        </button>
                      </div>
                      <div className="product-item__content">
                        <h6 className="product-item__title">
                          <Link to="/product-details" className="link">
                            SaaS dashboard digital products Title here
                          </Link>
                        </h6>
                        <div className="product-item__info flx-between gap-2">
                          <span className="product-item__author">
                            by
                            <Link
                              to="/profile"
                              className="link hover-text-decoration-underline"
                            >
                              themepix
                            </Link>
                          </span>
                          <div className="flx-align gap-2">
                            <h6 className="product-item__price mb-0">$129</h6>
                            <span className="product-item__prevPrice text-decoration-line-through">
                              $259
                            </span>
                          </div>
                        </div>
                        <div className="product-item__bottom flx-between gap-2">
                          <div>
                            <span className="product-item__sales font-14 mb-2">
                              500 Sales
                            </span>
                            <div className="d-flex align-items-center gap-1">
                              <ul className="star-rating">
                                <li className="star-rating__item font-11">
                                  <i className="fas fa-star" />
                                </li>
                                <li className="star-rating__item font-11">
                                  <i className="fas fa-star" />
                                </li>
                                <li className="star-rating__item font-11">
                                  <i className="fas fa-star" />
                                </li>
                                <li className="star-rating__item font-11">
                                  <i className="fas fa-star" />
                                </li>
                                <li className="star-rating__item font-11">
                                  <i className="fas fa-star" />
                                </li>
                              </ul>
                              <span className="star-rating__text text-heading fw-500 font-14">
                                (16)
                              </span>
                            </div>
                          </div>
                          <Link
                            to="/product-details"
                            className="btn btn-outline-light btn-sm pill"
                          >
                            Live Demo
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="col-xl-4 col-sm-6">
                    <div className="product-item section-bg">
                      <div className="product-item__thumb d-flex">
                        <Link to="/product-details" className="link w-100">
                          <img
                            src="assets/images/thumbs/product-img8.png"
                            alt=""
                            className="cover-img"
                          />
                        </Link>
                        <button
                          type="button"
                          className="product-item__wishlist"
                        >
                          <i className="fas fa-heart" />
                        </button>
                      </div>
                      <div className="product-item__content">
                        <h6 className="product-item__title">
                          <Link to="/product-details" className="link">
                            SaaS dashboard digital products Title here
                          </Link>
                        </h6>
                        <div className="product-item__info flx-between gap-2">
                          <span className="product-item__author">
                            by
                            <Link
                              to="/profile"
                              className="link hover-text-decoration-underline"
                            >
                              themepix
                            </Link>
                          </span>
                          <div className="flx-align gap-2">
                            <h6 className="product-item__price mb-0">$79</h6>
                            <span className="product-item__prevPrice text-decoration-line-through">
                              $99
                            </span>
                          </div>
                        </div>
                        <div className="product-item__bottom flx-between gap-2">
                          <div>
                            <span className="product-item__sales font-14 mb-2">
                              2100 Sales
                            </span>
                            <div className="d-flex align-items-center gap-1">
                              <ul className="star-rating">
                                <li className="star-rating__item font-11">
                                  <i className="fas fa-star" />
                                </li>
                                <li className="star-rating__item font-11">
                                  <i className="fas fa-star" />
                                </li>
                                <li className="star-rating__item font-11">
                                  <i className="fas fa-star" />
                                </li>
                                <li className="star-rating__item font-11">
                                  <i className="fas fa-star" />
                                </li>
                                <li className="star-rating__item font-11">
                                  <i className="fas fa-star" />
                                </li>
                              </ul>
                              <span className="star-rating__text text-heading fw-500 font-14">
                                (16)
                              </span>
                            </div>
                          </div>
                          <Link
                            to="/product-details"
                            className="btn btn-outline-light btn-sm pill"
                          >
                            Live Demo
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="col-xl-4 col-sm-6">
                    <div className="product-item section-bg">
                      <div className="product-item__thumb d-flex">
                        <Link to="/product-details" className="link w-100">
                          <img
                            src="assets/images/thumbs/product-img9.png"
                            alt=""
                            className="cover-img"
                          />
                        </Link>
                        <button
                          type="button"
                          className="product-item__wishlist"
                        >
                          <i className="fas fa-heart" />
                        </button>
                      </div>
                      <div className="product-item__content">
                        <h6 className="product-item__title">
                          <Link to="/product-details" className="link">
                            SaaS dashboard digital products Title here
                          </Link>
                        </h6>
                        <div className="product-item__info flx-between gap-2">
                          <span className="product-item__author">
                            by
                            <Link
                              to="/profile"
                              className="link hover-text-decoration-underline"
                            >
                              themepix
                            </Link>
                          </span>
                          <div className="flx-align gap-2">
                            <h6 className="product-item__price mb-0">$79</h6>
                            <span className="product-item__prevPrice text-decoration-line-through">
                              $99
                            </span>
                          </div>
                        </div>
                        <div className="product-item__bottom flx-between gap-2">
                          <div>
                            <span className="product-item__sales font-14 mb-2">
                              2100 Sales
                            </span>
                            <div className="d-flex align-items-center gap-1">
                              <ul className="star-rating">
                                <li className="star-rating__item font-11">
                                  <i className="fas fa-star" />
                                </li>
                                <li className="star-rating__item font-11">
                                  <i className="fas fa-star" />
                                </li>
                                <li className="star-rating__item font-11">
                                  <i className="fas fa-star" />
                                </li>
                                <li className="star-rating__item font-11">
                                  <i className="fas fa-star" />
                                </li>
                                <li className="star-rating__item font-11">
                                  <i className="fas fa-star" />
                                </li>
                              </ul>
                              <span className="star-rating__text text-heading fw-500 font-14">
                                (16)
                              </span>
                            </div>
                          </div>
                          <Link
                            to="/product-details"
                            className="btn btn-outline-light btn-sm pill"
                          >
                            Live Demo
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="col-xl-4 col-sm-6">
                    <div className="product-item section-bg">
                      <div className="product-item__thumb d-flex">
                        <Link to="/product-details" className="link w-100">
                          <img
                            src="assets/images/thumbs/product-img10.png"
                            alt=""
                            className="cover-img"
                          />
                        </Link>
                        <button
                          type="button"
                          className="product-item__wishlist"
                        >
                          <i className="fas fa-heart" />
                        </button>
                      </div>
                      <div className="product-item__content">
                        <h6 className="product-item__title">
                          <Link to="/product-details" className="link">
                            SaaS dashboard digital products Title here
                          </Link>
                        </h6>
                        <div className="product-item__info flx-between gap-2">
                          <span className="product-item__author">
                            by
                            <Link
                              to="/profile"
                              className="link hover-text-decoration-underline"
                            >
                              themepix
                            </Link>
                          </span>
                          <div className="flx-align gap-2">
                            <h6 className="product-item__price mb-0">$79</h6>
                            <span className="product-item__prevPrice text-decoration-line-through">
                              $99
                            </span>
                          </div>
                        </div>
                        <div className="product-item__bottom flx-between gap-2">
                          <div>
                            <span className="product-item__sales font-14 mb-2">
                              2100 Sales
                            </span>
                            <div className="d-flex align-items-center gap-1">
                              <ul className="star-rating">
                                <li className="star-rating__item font-11">
                                  <i className="fas fa-star" />
                                </li>
                                <li className="star-rating__item font-11">
                                  <i className="fas fa-star" />
                                </li>
                                <li className="star-rating__item font-11">
                                  <i className="fas fa-star" />
                                </li>
                                <li className="star-rating__item font-11">
                                  <i className="fas fa-star" />
                                </li>
                                <li className="star-rating__item font-11">
                                  <i className="fas fa-star" />
                                </li>
                              </ul>
                              <span className="star-rating__text text-heading fw-500 font-14">
                                (16)
                              </span>
                            </div>
                          </div>
                          <Link
                            to="/product-details"
                            className="btn btn-outline-light btn-sm pill"
                          >
                            Live Demo
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="col-xl-4 col-sm-6">
                    <div className="product-item section-bg">
                      <div className="product-item__thumb d-flex">
                        <Link to="/product-details" className="link w-100">
                          <img
                            src="assets/images/thumbs/product-img11.png"
                            alt=""
                            className="cover-img"
                          />
                        </Link>
                        <button
                          type="button"
                          className="product-item__wishlist"
                        >
                          <i className="fas fa-heart" />
                        </button>
                      </div>
                      <div className="product-item__content">
                        <h6 className="product-item__title">
                          <Link to="/product-details" className="link">
                            SaaS dashboard digital products Title here
                          </Link>
                        </h6>
                        <div className="product-item__info flx-between gap-2">
                          <span className="product-item__author">
                            by
                            <Link
                              to="/profile"
                              className="link hover-text-decoration-underline"
                            >
                              themepix
                            </Link>
                          </span>
                          <div className="flx-align gap-2">
                            <h6 className="product-item__price mb-0">$79</h6>
                            <span className="product-item__prevPrice text-decoration-line-through">
                              $99
                            </span>
                          </div>
                        </div>
                        <div className="product-item__bottom flx-between gap-2">
                          <div>
                            <span className="product-item__sales font-14 mb-2">
                              2100 Sales
                            </span>
                            <div className="d-flex align-items-center gap-1">
                              <ul className="star-rating">
                                <li className="star-rating__item font-11">
                                  <i className="fas fa-star" />
                                </li>
                                <li className="star-rating__item font-11">
                                  <i className="fas fa-star" />
                                </li>
                                <li className="star-rating__item font-11">
                                  <i className="fas fa-star" />
                                </li>
                                <li className="star-rating__item font-11">
                                  <i className="fas fa-star" />
                                </li>
                                <li className="star-rating__item font-11">
                                  <i className="fas fa-star" />
                                </li>
                              </ul>
                              <span className="star-rating__text text-heading fw-500 font-14">
                                (16)
                              </span>
                            </div>
                          </div>
                          <Link
                            to="/product-details"
                            className="btn btn-outline-light btn-sm pill"
                          >
                            Live Demo
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="col-xl-4 col-sm-6">
                    <div className="product-item section-bg">
                      <div className="product-item__thumb d-flex">
                        <Link to="/product-details" className="link w-100">
                          <img
                            src="assets/images/thumbs/product-img12.png"
                            alt=""
                            className="cover-img"
                          />
                        </Link>
                        <button
                          type="button"
                          className="product-item__wishlist"
                        >
                          <i className="fas fa-heart" />
                        </button>
                      </div>
                      <div className="product-item__content">
                        <h6 className="product-item__title">
                          <Link to="/product-details" className="link">
                            SaaS dashboard digital products Title here
                          </Link>
                        </h6>
                        <div className="product-item__info flx-between gap-2">
                          <span className="product-item__author">
                            by
                            <Link
                              to="/profile"
                              className="link hover-text-decoration-underline"
                            >
                              themepix
                            </Link>
                          </span>
                          <div className="flx-align gap-2">
                            <h6 className="product-item__price mb-0">$79</h6>
                            <span className="product-item__prevPrice text-decoration-line-through">
                              $99
                            </span>
                          </div>
                        </div>
                        <div className="product-item__bottom flx-between gap-2">
                          <div>
                            <span className="product-item__sales font-14 mb-2">
                              2100 Sales
                            </span>
                            <div className="d-flex align-items-center gap-1">
                              <ul className="star-rating">
                                <li className="star-rating__item font-11">
                                  <i className="fas fa-star" />
                                </li>
                                <li className="star-rating__item font-11">
                                  <i className="fas fa-star" />
                                </li>
                                <li className="star-rating__item font-11">
                                  <i className="fas fa-star" />
                                </li>
                                <li className="star-rating__item font-11">
                                  <i className="fas fa-star" />
                                </li>
                                <li className="star-rating__item font-11">
                                  <i className="fas fa-star" />
                                </li>
                              </ul>
                              <span className="star-rating__text text-heading fw-500 font-14">
                                (16)
                              </span>
                            </div>
                          </div>
                          <Link
                            to="/product-details"
                            className="btn btn-outline-light btn-sm pill"
                          >
                            Live Demo
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                {/* Pagination Start */}
                <nav aria-label="Page navigation example">
                  <ul className="pagination common-pagination">
                    <li className="page-item">
                      <Link className="page-link" to="#">
                        1
                      </Link>
                    </li>
                    <li className="page-item">
                      <Link className="page-link" to="#">
                        2
                      </Link>
                    </li>
                    <li className="page-item">
                      <Link className="page-link" to="#">
                        3
                      </Link>
                    </li>
                    <li className="page-item">
                      <Link className="page-link" to="#">
                        4
                      </Link>
                    </li>
                    <li className="page-item">
                      <Link className="page-link" to="#">
                        5
                      </Link>
                    </li>
                    <li className="page-item">
                      <Link
                        className="page-link flx-align gap-2 flex-nowrap"
                        to="#"
                      >
                        Next
                        <span className="icon line-height-1 font-20">
                          <i className="las la-arrow-right" />
                        </span>
                      </Link>
                    </li>
                  </ul>
                </nav>
                {/* Pagination End */}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AllProduct;
