import React from "react";
import Preloader from "../helper/Preloader";
import MasterLayout from "../layout/MasterLayout";
import DashboardFollowing from "../components/DashboardFollowing";
const FollowerPage = () => {

  return (

    <>
      <MasterLayout>
        {/* Preloader */}
        <Preloader />

        {/* DashboardFollowing */}
        <DashboardFollowing />

      </MasterLayout>

    </>
  );
};

export default FollowerPage;
