// OAuthCallback.jsx
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { handleOAuthCallbackFromURL, getUser } from "../service";

export default function OAuthCallback() {
  const navigate = useNavigate();

  useEffect(() => {
    const ok = handleOAuthCallbackFromURL(); // guarda {token,user}
    if (!ok) return navigate("/login?error=oauth", { replace: true });

    const user = getUser();
    const to = user?.role === 3 ? "/dashboard" : "/";
    navigate(to, { replace: true });
  }, [navigate]);

  return null;
}
