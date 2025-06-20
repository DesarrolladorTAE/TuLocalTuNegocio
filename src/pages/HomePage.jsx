import React from "react";
import Preloader from "../helper/Preloader";
import SaleOffer from "../components/SaleOffer";
import HeaderOne from "../components/HeaderOne";
import BannerOne from "../components/BannerOne";
import PopularOne from "../components/PopularOne";
import ArrivalOne from "../components/ArrivalOne";
import FeaturedOne from "../components/FeaturedOne";
import SellingOne from "../components/SellingOne";
import FeaturedAuthor from "../components/FeaturedAuthor";
import PerformanceAuthor from "../components/PerformanceAuthor";
import BlogOne from "../components/BlogOne";
import BecomeSellerOne from "../components/BecomeSellerOne";
import BrandSectionOne from "../components/BrandSectionOne";
import FooterOne from "../components/FooterOne";

const HomePage = () => {
  
  return (
    <section className="change-gradient">
    {/* Preloader */}
    <Preloader />

    {/* SaleOffer */}
    <SaleOffer />

    {/* HeaderOne */}
    <HeaderOne />

    {/* BannerOne */}
    <BannerOne />

    {/* PopularOne */}
    <PopularOne />

    {/* ArrivalOne */}
    <ArrivalOne />

    {/* FeaturedOne */}
    <FeaturedOne />

    {/* SellingOne */}
    <SellingOne />

    {/* FeaturedAuthor */}
    <FeaturedAuthor />

    {/* PerformanceAuthor */}
    <PerformanceAuthor />

    {/* BlogOne */}
    <BlogOne />

    {/* BecomeSellerOne */}
    <BecomeSellerOne />

    {/* BrandSectionOne */}
    <BrandSectionOne />

    {/* FooterOne */}
    <FooterOne />
  </section>
  );
};

export default HomePage;
