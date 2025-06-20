import React from "react";
import Preloader from "../helper/Preloader";
import HeaderOne from "../components/HeaderOne";
import BrandSectionOne from "../components/BrandSectionOne";
import FooterOne from "../components/FooterOne";
import BlogDetailsSidebar from "../components/BlogDetailsSidebar";
const BlogDetailsSidebarPage = () => {

  return (
    <>
      {/* Preloader */}
      <Preloader />

      {/* HeaderOne */}
      <HeaderOne />

      {/* BlogDetailsSidebar */}
      <BlogDetailsSidebar />


      {/* BrandSectionOne */}
      <BrandSectionOne />


      {/* FooterOne */}
      <FooterOne />
    </>
  );
};

export default BlogDetailsSidebarPage;
