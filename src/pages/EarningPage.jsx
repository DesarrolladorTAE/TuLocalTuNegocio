import React from "react";
import Preloader from "../helper/Preloader";
import MasterLayout from "../layout/MasterLayout";
import DashboardEarning from "../components/DashboardEarning";
const EarningPage = () => {

  return (

    <>
      <MasterLayout>
        {/* Preloader */}
        <Preloader />

        {/* DashboardEarning */}
        <DashboardEarning />

      </MasterLayout>

    </>
  );
};

export default EarningPage;
