const Breadcrumb = () => {
  return (
    <section className="breadcrumb breadcrumb-one padding-y-60 section-bg position-relative z-index-1 overflow-hidden">
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
        <div className="row justify-content-center">
          <div className="col-lg-7">
            <div className="breadcrumb-one-content">
              <h3 className="breadcrumb-one-content__title text-center mb-3 text-capitalize">
                Los Mejores Productos en un solo Lugar
              </h3>
              <p className="breadcrumb-one-content__desc text-center text-black-three">
                Explora en las diversas categorias que tenemos para ti, elige en la amplia variedad de Productos que tenemos para ofrecerte.
                Conoce, Compra y Disfruta.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Breadcrumb;
