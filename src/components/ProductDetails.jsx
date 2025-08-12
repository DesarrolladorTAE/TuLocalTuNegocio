import { Link } from "react-router-dom";
import MoreItems from "./MoreItems"; // ajusta la ruta si está en otra carpeta

const money = (v) => {
  const n = Number(v ?? 0);
  return n.toLocaleString("es-MX", {
    style: "currency",
    currency: "MXN",
    maximumFractionDigits: 2,
  });
};

/** Util: fecha legible */
const niceDate = (iso) => {
  if (!iso) return "-";
  const d = new Date(iso);
  return d.toLocaleDateString("es-MX", {
    year: "numeric",
    month: "short",
    day: "2-digit",
  });
};

const ProductDetails = ({ product }) => {
  if (!product) return null;

  const mainImg =
    product.images?.find((i) => Number(i.is_main) === 1)?.img_url ||
    product.images?.[0]?.img_url ||
    "/assets/images/nuevas/imagendefault.png";

  const screenshots = (product.images || []).map((i) => i.img_url);
  const vendor = product.vendor || {};
  const category = product.category || {};

  return (
    <div className="product-details mt-32 padding-b-120">
      <div className="container container-two">
        <div className="row gy-4">
          <div className="col-lg-8">
            <div className="tab-content" id="pills-tabContent">
              <div
                className="tab-pane fade show active"
                id="pills-product-details"
                role="tabpanel"
                aria-labelledby="pills-product-details-tab"
                tabIndex={0}
              >
                {/* Product Details Content Start */}
                <div className="product-details">
                  <div className="product-details__thumb">
                    <img src={mainImg} alt={product.name} />
                  </div>

                  <div className="product-details__buttons flx-align justify-content-center gap-3">
                    {/* Si tienes una ruta de preview, colócala aquí */}
                    <Link
                      to="#"
                      className="btn btn-main d-inline-flex align-items-center gap-2 pill px-sm-5 justify-content-center"
                    >
                      Ver producto
                      <img src="/assets/images/icons/eye-outline.svg" alt="" />
                    </Link>

                    <Link
                      to="#"
                      className="screenshot-btn btn btn-white pill px-sm-5"
                      data-images={JSON.stringify(screenshots)}
                    >
                      Imágenes
                    </Link>
                  </div>

                  <h1 className="mt-4">{product.name}</h1>
                  <p className="product-details__desc">
                    {product.description || "Sin descripción."}
                  </p>

                  <div className="product-details__item">
                    <h5 className="product-details__title mb-3">
                      Detalles del producto
                    </h5>
                    <ul className="product-list">
                      <li className="product-list__item">
                        <strong>Categoría:</strong> {category.name || "-"}
                      </li>
                      <li className="product-list__item">
                        <strong>Stock:</strong> {product.stock ?? 0}
                      </li>
                      <li className="product-list__item">
                        <strong>Estatus:</strong> {product.status}
                      </li>
                    </ul>
                  </div>

                  {category?.image_url && (
                    <div className="product-details__item">
                      <h5 className="product-details__title mb-3">Categoría</h5>
                      <div className="d-flex align-items-center gap-3">
                        <img
                          src={category.image_url}
                          alt={category.name}
                          style={{
                            width: 80,
                            height: 80,
                            objectFit: "cover",
                            borderRadius: 8,
                          }}
                        />
                        <div>
                          <div className="fw-600">{category.name}</div>
                          <div className="text-body">{category.slug}</div>
                        </div>
                      </div>
                    </div>
                  )}

                  {vendor?.id && (
                    <div className="product-details__item">
                      <h5 className="product-details__title mb-3">Vendedor</h5>
                      <div className="d-flex align-items-center gap-3">
                        <img
                          src={
                            vendor.avatar_url ||
                            "/assets/images/thumbs/author-details-img.png"
                          }
                          alt={vendor.name}
                          style={{
                            width: 64,
                            height: 64,
                            objectFit: "cover",
                            borderRadius: "50%",
                          }}
                        />
                        <div>
                          <div className="fw-600">{vendor.name}</div>
                          <div className="text-body">{vendor.email}</div>
                          {vendor.phone && (
                            <div className="text-body">{vendor.phone}</div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                  <MoreItems
                    vendorId={vendor?.id}
                    currentProductId={product.id}
                  />
                </div>
                {/* Product Details Content End */}
              </div>

             
            </div>
          </div>
          <div className="col-lg-4">
            {/* ======================= Product Sidebar Start ========================= */}
            <div className="product-sidebar section-bg">
              <div className="product-sidebar__top position-relative flx-between gap-1">
                <h6 className="product-sidebar__title mb-0">
                  {money(product.price)}
                </h6>
              </div>

              <ul className="sidebar-list mt-3">
                <li className="sidebar-list__item flx-align gap-2 font-14 fw-300 mb-2">
                  <span className="icon">
                    <img src="/assets/images/icons/check-cirlce.svg" alt="" />
                  </span>
                  <span className="text">Producto verificado</span>
                </li>
                <li className="sidebar-list__item flx-align gap-2 font-14 fw-300 mb-2">
                  <span className="icon">
                    <img src="/assets/images/icons/check-cirlce.svg" alt="" />
                  </span>
                  <span className="text">En stock: {product.stock ?? 0}</span>
                </li>
                <li className="sidebar-list__item flx-align gap-2 font-14 fw-300">
                  <span className="icon">
                    <img src="/assets/images/icons/check-cirlce.svg" alt="" />
                  </span>
                  <span className="text">
                    Categoría: {category.name || "-"}
                  </span>
                </li>
              </ul>

              <button
                type="button"
                className="btn btn-main d-flex w-100 justify-content-center align-items-center gap-2 pill px-sm-5 mt-32"
              >
                <img src="/assets/images/icons/add-to-cart.svg" alt="" />
                Agregar al carrito
              </button>

              {/* Author Details Start */}
              {vendor?.id && (
                <div className="author-details mt-4">
                  <div className="d-flex align-items-center gap-2">
                    <div className="author-details__thumb flex-shrink-0">
                      <img
                        src={
                          vendor.avatar_url ||
                          "/assets/images/thumbs/author-details-img.png"
                        }
                        alt={vendor.name}
                      />
                    </div>
                    <div className="author-details__content">
                      <h6 className="author-details__name font-18 mb-2">
                        <span className="link hover-text-main">
                          {vendor.name}
                        </span>
                      </h6>
                      <span className="d-flex align-items-center gap-1">
                        <span className="star-rating">
                          <span className="star-rating__item font-11">
                            <i className="fas fa-star" />
                          </span>
                          <span className="star-rating__item font-11">
                            <i className="fas fa-star" />
                          </span>
                          <span className="star-rating__item font-11">
                            <i className="fas fa-star" />
                          </span>
                          <span className="star-rating__item font-11">
                            <i className="fas fa-star" />
                          </span>
                          <span className="star-rating__item font-11">
                            <i className="fas fa-star" />
                          </span>
                        </span>
                        <span className="star-rating__text text-body">
                          {" "}
                          5.0
                        </span>
                      </span>
                    </div>
                  </div>
                  <Link
                    to="#"
                    className="btn btn-outline-light w-100 pill mt-32"
                  >
                    Ver perfil del vendedor
                  </Link>
                </div>
              )}
              {/* Author Details End */}

              {/* Meta Attribute List Start */}
              <ul className="meta-attribute mt-4">
                <li className="meta-attribute__item">
                  <span className="name">Última actualización</span>
                  <span className="details">
                    {niceDate(product.updated_at)}
                  </span>
                </li>
                <li className="meta-attribute__item">
                  <span className="name">Publicado</span>
                  <span className="details">
                    {niceDate(product.created_at)}
                  </span>
                </li>
              </ul>
              {/* Meta Attribute List End */}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetails;
