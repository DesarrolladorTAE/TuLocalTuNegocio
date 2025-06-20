import React from "react";
import Preloader from "../helper/Preloader";
import HeaderOne from "../components/HeaderOne";
import BrandSectionOne from "../components/BrandSectionOne";
import FooterOne from "../components/FooterOne";
import BreadcrumbThree from "../components/BreadcrumbThree";
import Profile from "../components/Profile";

const ProfilePage = () => {

  return (

    <>
      {/* Preloader */}
      <Preloader />

      {/* HeaderOne */}
      <HeaderOne />

      {/* BreadcrumbThree */}
      <BreadcrumbThree />


      {/* Profile */}
      <Profile />


      {/* BrandSectionOne */}
      <BrandSectionOne />


      {/* FooterOne */}
      <FooterOne />
    </>
  );
};

export default ProfilePage;
