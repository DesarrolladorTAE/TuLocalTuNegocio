import { Link } from "react-router-dom";

const BreadcrumbTwo = ({ product }) => {
    const categoryName = product?.category?.name || "-";
    const categoryId = product?.category?.id;
    const productName = product?.name || "-";
    const vendorName = product?.vendor?.name || "-";
    const price = typeof product?.price !== "undefined"
        ? new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN" }).format(Number(product.price || 0))
        : "-";
    const stock = typeof product?.stock !== "undefined" ? `${product.stock} piezas existentes` : "-";
    const description = product?.description || "Sin descripción.";

    return (
        <section className="breadcrumb border-bottom p-0 d-block section-bg position-relative z-index-1">
            <div className="breadcrumb-two">
                <img
                    src="/assets/images/gradients/breadcrumb-gradient-bg.png"
                    alt=""
                    className="bg--gradient"
                />
                <div className="container container-two">
                    <div className="row justify-content-center">
                        <div className="col-lg-12">
                            <div className="breadcrumb-two-content">
                                {/* Breadcrumb: Productos > Categoría > Nombre */}
                                <ul className="breadcrumb-list flx-align gap-2 mb-2">
                                    <li className="breadcrumb-list__item font-14 text-body">
                                        <Link
                                            to="/all-product"
                                            className="breadcrumb-list__link text-body hover-text-main"
                                        >
                                            Productos
                                        </Link>
                                    </li>

                                    <li className="breadcrumb-list__item font-14 text-body">
                                        <span className="breadcrumb-list__icon font-10">
                                            <i className="fas fa-chevron-right" />
                                        </span>
                                    </li>

                                    <li className="breadcrumb-list__item font-14 text-body">
                                        <Link
                                            to={categoryId ? `/all-product?cat=${categoryId}` : "#"}
                                            className="breadcrumb-list__link text-body hover-text-main"
                                        >
                                            {categoryName}
                                        </Link>
                                    </li>


                                    <li className="breadcrumb-list__item font-14 text-body">
                                        <span className="breadcrumb-list__icon font-10">
                                            <i className="fas fa-chevron-right" />
                                        </span>
                                    </li>

                                    <li className="breadcrumb-list__item font-14 text-body">
                                        <span className="breadcrumb-list__text">{productName}</span>
                                    </li>
                                </ul>

                                {/* Título */}
                                <h3 className="breadcrumb-two-content__title mb-3 text-capitalize">
                                    {productName}
                                </h3>

                                {/* Info: By vendedor | Precio | Stock | 5 estrellas fija */}
                                <div className="breadcrumb-content flx-align gap-3">
                                    <div className="breadcrumb-content__item text-heading fw-500 flx-align gap-2">
                                        <span className="text">
                                            Por{" "}
                                            <Link to="#" className="link text-main fw-600">
                                                {vendorName}
                                            </Link>
                                        </span>
                                    </div>

                                    <div className="breadcrumb-content__item text-heading fw-500 flx-align gap-2">
                                        <span className="icon">
                                            <img
                                                src="assets/images/icons/cart-icon.svg"
                                                alt=""
                                                className="white-version"
                                            />
                                            <img
                                                src="assets/images/icons/cart-white.svg"
                                                alt=""
                                                className="dark-version w-20"
                                            />
                                        </span>
                                        <span className="text">{stock}</span>
                                    </div>

                                    <div className="breadcrumb-content__item text-heading fw-500 flx-align gap-2">
                                        <span className="icon">
                                            <img
                                                src="assets/images/icons/check-icon.svg"
                                                alt=""
                                                className="white-version"
                                            />
                                            <img
                                                src="assets/images/icons/check-icon-white.svg"
                                                alt=""
                                                className="dark-version"
                                            />
                                        </span>
                                    </div>

                                    {/* Calificación fija 5.0 */}
                                    <div className="breadcrumb-content__item text-heading fw-500 flx-align gap-2">
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
                                        <span className="star-rating__text text-body"> 5.0</span>
                                    </div>
                                </div>

                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Tabs: solo Product Details y Rating; se quita Comments */}
            <div className="container container-two">
                <div className="breadcrumb-tab flx-wrap align-items-start gap-lg-4 gap-2">
                    <ul className="nav tab-bordered nav-pills" id="pills-tab" role="tablist">
                        <li className="nav-item" role="presentation">
                            <button
                                className="nav-link active"
                                id="pills-product-details-tab"
                                data-bs-toggle="pill"
                                data-bs-target="#pills-product-details"
                                type="button"
                                role="tab"
                                aria-controls="pills-product-details"
                                aria-selected="true"
                            >
                                Detalles del Producto
                                
                            </button>
                        </li>


                    </ul>

                    {/* Social share se deja igual */}
                    <div className="social-share">
                        <button type="button" className="social-share__button">
                            <img src="assets/images/icons/share-icon.svg" alt="" />
                        </button>
                        <div className="social-share__icons">
                            <ul className="social-icon-list colorful-style">
                                <li className="social-icon-list__item">
                                    <Link
                                        to="https://www.facebook.com"
                                        className="social-icon-list__link text-body flex-center"
                                    >
                                        <i className="fab fa-facebook-f" />
                                    </Link>
                                </li>
                                <li className="social-icon-list__item">
                                    <Link
                                        to="https://www.twitter.com"
                                        className="social-icon-list__link text-body flex-center"
                                    >
                                        <i className="fab fa-linkedin-in" />
                                    </Link>
                                </li>
                                <li className="social-icon-list__item">
                                    <Link
                                        to="https://www.google.com"
                                        className="social-icon-list__link text-body flex-center"
                                    >
                                        <i className="fab fa-twitter" />
                                    </Link>
                                </li>
                            </ul>
                        </div>
                    </div>

                </div>
            </div>
        </section>
    );
};

export default BreadcrumbTwo;
