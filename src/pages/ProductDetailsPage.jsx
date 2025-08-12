import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { mostrarProducto } from "../service";
import Preloader from "../helper/Preloader";
import HeaderOne from "../components/HeaderOne";
import BreadcrumbTwo from "../components/BreadcrumbTwo";
import ProductDetails from "../components/ProductDetails";
import BrandSectionOne from "../components/BrandSectionOne";
import FooterOne from "../components/FooterOne";


const ProductDetailsPage = () => {
  const { id } = useParams(); // 👈 viene desde /product-details/:id
  const [loading, setLoading] = useState(true);
  const [product, setProduct] = useState(null);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const data = await mostrarProducto(id);
        setProduct(data);
      } catch (error) {
        console.error(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  if (loading) return <Preloader />;

  return (

    <>
      {/* Preloader */}
      <Preloader />

      <HeaderOne />


      <BreadcrumbTwo/>

      {/* Pasamos los datos del producto como prop */}
      <ProductDetails product={product} />

      {/* BrandSectionOne */}

      <BrandSectionOne />


      {/* FooterOne */}
      <FooterOne />
    </>
  );
};

export default ProductDetailsPage;
