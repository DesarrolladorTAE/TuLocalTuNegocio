import React from "react";
import Preloader from "../helper/Preloader";
import HeaderOne from "../components/HeaderOne";
import BreadcrumbTwo from "../components/BreadcrumbTwo";
import ProductDetails from "../components/ProductDetails";
import BrandSectionOne from "../components/BrandSectionOne";
import FooterOne from "../components/FooterOne";

const ProductDetailsPage = () => {

  return (

    <>
      {/* Preloader */}
      <Preloader />

      {/* HeaderOne */}
      <HeaderOne />

      {/* BreadcrumbTwo */}
      <BreadcrumbTwo />


      {/* ProductDetails */}
      <ProductDetails />


      {/* BrandSectionOne */}

      <BrandSectionOne />


      {/* FooterOne */}
      <FooterOne />
    </>
  );
};

export default ProductDetailsPage;
