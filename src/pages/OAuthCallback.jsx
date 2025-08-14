import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { handleOAuthCallbackFromURL } from "../service";
import axiosClient from "../axiosClient";
import { alertaError } from "../utils/alerts";

export default function OauthCallback() {
  const navigate = useNavigate();

  useEffect(() => {
    const ok = handleOAuthCallbackFromURL();
    if (ok) {
      // setea Authorization por si recargas
      const token = localStorage.getItem("token");
      if (token) axiosClient.defaults.headers.common.Authorization = `Bearer ${token}`;
      navigate("/", { replace: true });
    } else {
      alertaError("No se pudo iniciar sesión con Google.");
      navigate("/login", { replace: true });
    }
  }, [navigate]);

  return null;
}
