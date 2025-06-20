import React from "react";
import Preloader from "../helper/Preloader";
import HeaderOne from "../components/HeaderOne";
import BreadcrumbSeven from "../components/BreadcrumbSeven";
import Blog from "../components/Blog";
import BrandSectionOne from "../components/BrandSectionOne";
import FooterOne from "../components/FooterOne";
const BlogPage = () => {

  return (
    <>
      {/* Preloader */}
      <Preloader />

      {/* HeaderOne */}
      <HeaderOne />

      {/* BreadcrumbSeven */}
      <BreadcrumbSeven />

      {/* Blog */}
      <Blog />

      {/* BrandSectionOne */}
      <BrandSectionOne />


      {/* FooterOne */}
      <FooterOne />
    </>
  );
};

export default BlogPage;
