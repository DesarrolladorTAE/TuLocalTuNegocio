import React from "react";
import Preloader from "../helper/Preloader";
import MasterLayout from "../layout/MasterLayout";
import DashboardRefund from "../components/DashboardRefund";
const RefundPage = () => {

  return (

    <>
      <MasterLayout>
        {/* Preloader */}
        <Preloader />

        {/* DashboardRefund */}
        <DashboardRefund />

      </MasterLayout>

    </>
  );
};

export default RefundPage;
