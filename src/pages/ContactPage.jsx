import React from "react";
import Preloader from "../helper/Preloader";
import HeaderOne from "../components/HeaderOne";
// import BrandSectionOne from "../components/BrandSectionOne";
import FooterOne from "../components/FooterOne";
import BreadcrumbEight from "../components/BreadcrumbEight";
import Donation from "../components/Contact";
import NewsletterTwo from "../components/NewsletterTwo";
const ContactPage = () => {

  return (
    <>
      {/* Preloader */}
      <Preloader />

      {/* HeaderOne */}
      <HeaderOne />

      {/* BreadcrumbEight */}
      <BreadcrumbEight />

      {/* Contact */}
      <Donation />


      {/* NewsletterTwo */}
      {/* <NewsletterTwo /> */}


      {/* BrandSectionOne */}
      {/* <BrandSectionOne /> */}


      {/* FooterOne */}
      <FooterOne />
    </>
  );
};

export default ContactPage;
