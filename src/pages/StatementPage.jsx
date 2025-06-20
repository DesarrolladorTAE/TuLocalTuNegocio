import React from "react";
import Preloader from "../helper/Preloader";
import MasterLayout from "../layout/MasterLayout";
import DashboardStatement from "../components/DashboardStatement";
const StatementPage = () => {

  return (

    <>
      <MasterLayout>
        {/* Preloader */}
        <Preloader />

        {/* DashboardStatement */}
        <DashboardStatement />

      </MasterLayout>

    </>
  );
};

export default StatementPage;
