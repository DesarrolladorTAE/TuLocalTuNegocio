import React from "react";
import Preloader from "../helper/Preloader";
import MasterLayout from "../layout/MasterLayout";
import DashboardDownload from "../components/DashboardDownload";
const DownloadPage = () => {

  return (

    <>
      <MasterLayout>
        {/* Preloader */}
        <Preloader />

        {/* DashboardDownload */}
        <DashboardDownload />

      </MasterLayout>

    </>
  );
};

export default DownloadPage;
