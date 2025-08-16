import React from "react";
import Preloader from "../helper/Preloader";
import MasterLayout from "../layout/MasterLayout";
import DashboardCategorias from "../components/DashboardCategorias";
const CategoriasPage = () => {

  return (

    <>
      <MasterLayout>
        {/* Preloader */}
        <Preloader />

        {/* DashboardFollowing */}
        <DashboardCategorias />

      </MasterLayout>

    </>
  );
};

export default CategoriasPage;
