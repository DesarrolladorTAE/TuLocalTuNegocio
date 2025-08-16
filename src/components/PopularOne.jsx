import { useEffect, useState, useMemo } from "react";
import { Link } from "react-router-dom";
import Slider from "react-slick";
import { fetchCategorias } from "../service"; // <-- tu función existente

const DEFAULT_CAT_IMG = "/assets/images/nuevas/imagendefault.png"; // ← pon aquí tu imagen por defecto

const PopularOne = () => {
  const [cats, setCats] = useState([]);
  const [loading, setLoading] = useState(true);

  function SampleNextArrow(props) {
    const { className, onClick } = props;
    return (
      <button className={className} onClick={onClick}>
        <i className="las la-arrow-right" />
      </button>
    );
  }
  function SamplePrevArrow(props) {
    const { className, onClick } = props;
    return (
      <button className={className} onClick={onClick}>
        <i className="las la-arrow-left" />
      </button>
    );
  }

  const settings = useMemo(
    () => ({
      dots: false,
      arrows: true,
      infinite: true,
      speed: 1000,
      slidesToShow: 6,
      slidesToScroll: 1,
      initialSlide: 0,
      nextArrow: <SampleNextArrow />,
      prevArrow: <SamplePrevArrow />,
      responsive: [
        {
          breakpoint: 1400,
          settings: {
            slidesToShow: 5,
            slidesToScroll: 3,
            infinite: true,
            dots: true,
          },
        },
        {
          breakpoint: 992,
          settings: {
            slidesToShow: 4,
            slidesToScroll: 2,
            initialSlide: 2,
            arrows: false,
          },
        },
        {
          breakpoint: 768,
          settings: {
            slidesToShow: 3,
            slidesToScroll: 1,
            arrows: false,
          },
        },
      ],
    }),
    []
  );

  // Helper para resolver imagen con fallback (acepta varias claves posibles)
  const getCatImage = (cat = {}) => {
    const img =
      cat.img_url ||
      cat.image_url ||
      cat.image ||
      cat.icon_url ||
      cat.icon ||
      null;
    return img && String(img).trim() !== "" ? img : DEFAULT_CAT_IMG;
  };

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const data = await fetchCategorias(); // ← array de categorías
        if (!mounted) return;

        // Normaliza mínimamente lo que necesitamos
        const normalized = Array.isArray(data)
          ? data.map((c) => ({
            id: c.id ?? c._id ?? Math.random().toString(36).slice(2),
            name: c.name || c.title || "Sin nombre",
            slug: c.slug || (c.name ? c.name.toLowerCase().replace(/\s+/g, "-") : "categoria"),
            imageSrc: getCatImage(c),
            qty: c.products_count ?? c.qty ?? null, // si algún día viene el conteo
            updated_at: c.updated_at, // si algún día viene el conteo
          }))
          : [];

        setCats(normalized);
      } catch (e) {
        setCats([]);
        console.error("Error cargando categorías:", e);
      } finally {
        setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  if (loading) {
    return (
      <section className="popular padding-y-120 overflow-hidden">
        <div className="container container-two">
          <div className="section-heading style-left mb-64">
            <h5 className="section-heading__title">Popular Categories</h5>
          </div>
          <div className="text-center text-muted">Cargando categorías…</div>
        </div>
      </section>
    );
  }

  if (!cats.length) {
    return (
      <section className="popular padding-y-120 overflow-hidden">
        <div className="container container-two">
          <div className="section-heading style-left mb-64">
            <h5 className="section-heading__title">Popular Categories</h5>
          </div>
          <div className="text-center text-muted">No hay categorías para mostrar.</div>
        </div>
      </section>
    );
  }
  const bust = (url, version) => {
    if (!url) return "";
    const v = version ? new Date(version).getTime() : Date.now();
    return `${url}${url.includes("?") ? "&" : "?"}v=${v}`;
  };
  return (
    <section className="popular padding-y-120 overflow-hidden">
      <div className="container container-two">
        <div className="section-heading style-left mb-64">
          <h5 className="section-heading__title">Todas Las Categorias</h5>
        </div>

        <div className="popular-slider arrow-style-two row gy-4">
          <Slider {...settings}>
            {cats.map((cat) => (
              <div key={cat.id}>
                <Link
                  to={`/all-product?cat=${encodeURIComponent(cat.id)}`}
                  className="popular-item w-100"
                >
                  <span className="popular-item__icon">
                    <img
                      src={bust(cat.imageSrc, cat.updated_at)}
                      alt={cat.name} />
                  </span>
                  <h6 className="popular-item__title font-18">{cat.name}</h6>
                  {cat.qty !== null ? (
                    <span className="popular-item__qty text-body">
                      {new Intl.NumberFormat("es-MX").format(cat.qty)}
                    </span>
                  ) : (
                    <span className="popular-item__qty text-body">&nbsp;</span> // mantiene altura
                  )}
                </Link>
              </div>
            ))}
          </Slider>
        </div>

        <div className="popular__button text-center">
          <Link
            to="/all-product"
            className="font-18 fw-600 text-heading hover-text-main text-decoration-underline font-heading"
          >
            Explora mas ...
          </Link>
        </div>
      </div>
    </section>
  );
};

export default PopularOne;
