import React from "react";
import Preloader from "../helper/Preloader";
import HeaderOne from "../components/HeaderOne";
import Breadcrumb from "../components/Breadcrumb";
import AllProduct from "../components/AllProduct";
import FooterOne from "../components/FooterOne";



const AllProductPage = () => {

  return (

    <>
      {/* Preloader */}
      <Preloader />

      {/* HeaderOne */}
      <HeaderOne />

      {/* AllProduct */}
      <AllProduct />

      {/* ResourceOne
      <div className="resource-style-two">
        <ResourceOne />
      </div> */}

      {/* Breadcrumb */}
      <Breadcrumb />
      {/* BrandSectionOne */}

      {/* <BrandSectionOne /> */}


      {/* FooterOne */}
      <FooterOne />
    </>
  );
};

export default AllProductPage;
