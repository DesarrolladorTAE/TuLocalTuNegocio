import React from "react";
import Preloader from "../helper/Preloader";
import HeaderOne from "../components/HeaderOne";
import BrandSectionOne from "../components/BrandSectionOne";
import FooterOne from "../components/FooterOne";
import BlogDetails from "../components/BlogDetails";
const BlogDetailsPage = () => {

  return (
    <>
      {/* Preloader */}
      <Preloader />

      {/* HeaderOne */}
      <HeaderOne />


      {/* BlogDetails */}
      <BlogDetails />

      {/* BrandSectionOne */}
      <BrandSectionOne />


      {/* FooterOne */}
      <FooterOne />
    </>
  );
};

export default BlogDetailsPage;
