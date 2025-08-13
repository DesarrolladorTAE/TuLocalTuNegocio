import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

import Preloader from "../helper/Preloader";
import HeaderOne from "../components/HeaderOne";
import BrandSectionOne from "../components/BrandSectionOne";
import FooterOne from "../components/FooterOne";
import BreadcrumbThree from "../components/BreadcrumbThree";
import Profile from "../components/Profile";

import { getMe, productosPorVendedor } from "../service";

const getCachedUser = () => {
  try {
    const raw = localStorage.getItem("user");
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

const ProfilePage = () => {
  const { id } = useParams();
  const isVendorView = Boolean(id);

  const [loading, setLoading] = useState(true);
  const [person, setPerson] = useState(getCachedUser()); // ← pinta algo desde el inicio si hay caché
  const [products, setProducts] = useState([]);
  const [error, setError] = useState("");
  // const [me, setMe] = useState(null);

  useEffect(() => {
    let cancel = false;
    (async () => {
      try {
        setLoading(true);
        setError("");

        if (isVendorView) {
          const res = await productosPorVendedor(id);
          if (cancel) return;
          setPerson(res?.vendor ?? null);
          setProducts(Array.isArray(res?.products) ? res.products : []);
        } else {
          // primero pinta caché (ya lo hicimos al iniciar el state)
          const me = await getMe({ cache: true });
          if (cancel) return;
          setPerson(me);
          setProducts([]);
        }
      } catch (e) {
        if (!cancel) {
          // si falla /me (500), al menos deja el caché si existe
          const cached = getCachedUser();
          if (cached) setPerson(cached);
          setError(e?.message || "No se pudo cargar el perfil.");
        }
      } finally {
        if (!cancel) setLoading(false);
      }
    })();
    return () => {
      cancel = true;
    };
  }, [id, isVendorView]);

  return (
    <>
      {loading && <Preloader />}

      <HeaderOne />
      <BreadcrumbThree
        entity={person}
        showNewProduct={!isVendorView}
        isVendorView={isVendorView}

      />

      <Profile
        user={person}
        mode={isVendorView ? "vendor" : "me"}
        products={isVendorView ? products : undefined}
      />

      {error && (
        <div className="container container-two">
          <div className="alert alert-warning mt-3">{error}</div>
        </div>
      )}

      <BrandSectionOne />
      <FooterOne />
    </>
  );
};

export default ProfilePage;
