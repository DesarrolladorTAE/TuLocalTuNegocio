import React from "react";
import Preloader from "../helper/Preloader";
import MasterLayout from "../layout/MasterLayout";
import ProfileInner from "../components/ProfileInner";
const DashboardProfilePage = () => {

  return (

    <>
      <MasterLayout>
        {/* Preloader */}
        <Preloader />

        {/* ProfileInner */}
        <ProfileInner />

      </MasterLayout>

    </>
  );
};

export default DashboardProfilePage;
