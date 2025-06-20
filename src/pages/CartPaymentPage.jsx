import React from "react";
import Preloader from "../helper/Preloader";
import HeaderOne from "../components/HeaderOne";
import BrandSectionOne from "../components/BrandSectionOne";
import FooterOne from "../components/FooterOne";
import BreadcrumbSix from "../components/BreadcrumbSix";
import CartPayment from "../components/CartPayment";


const CartPaymentPage = () => {

  return (

    <>
      {/* Preloader */}
      <Preloader />

      {/* HeaderOne */}
      <HeaderOne />


      {/* BreadcrumbSix */}
      <BreadcrumbSix />

      {/* CartPayment */}
      <CartPayment />

      {/* BrandSectionOne */}
      <BrandSectionOne />


      {/* FooterOne */}
      <FooterOne />
    </>
  );
};

export default CartPaymentPage;
