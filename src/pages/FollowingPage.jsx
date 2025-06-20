import React from "react";
import Preloader from "../helper/Preloader";
import MasterLayout from "../layout/MasterLayout";
import DashboardFollowers from "../components/DashboardFollowers";
const FollowingPage = () => {

  return (

    <>
      <MasterLayout>
        {/* Preloader */}
        <Preloader />

        {/* DashboardFollowers */}
        <DashboardFollowers />

      </MasterLayout>

    </>
  );
};

export default FollowingPage;
