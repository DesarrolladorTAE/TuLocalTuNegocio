import React from "react";
import Preloader from "../helper/Preloader";
import HeaderOne from "../components/HeaderOne";
import BrandSectionOne from "../components/BrandSectionOne";
import FooterOne from "../components/FooterOne";
import BreadcrumbFive from "../components/BreadcrumbFive";
import CartPersonal from "../components/CartPersonal";


const CartPersonalPage = () => {

  return (

    <>
      {/* Preloader */}
      <Preloader />

      {/* HeaderOne */}
      <HeaderOne />


      {/* BreadcrumbFive */}
      <BreadcrumbFive />

      {/* CartPersonal */}
      <CartPersonal />

      {/* BrandSectionOne */}
      <BrandSectionOne />


      {/* FooterOne */}
      <FooterOne />
    </>
  );
};

export default CartPersonalPage;
