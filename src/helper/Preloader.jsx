import { useEffect, useState } from "react";
// import Snackbar from "@mui/material/Snackbar";
// import Alert from "@mui/material/Alert";

const Preloader = () => {
  const [active, setActive] = useState(true);
  // const [sessionExpired, setSessionExpired] = useState(false);

  useEffect(() => {
    // Simula la verificación del token en localStorage
    // const token = localStorage.getItem("token");
    // if (!token) {
    //   setSessionExpired(true);
    //   setTimeout(() => {
    //     window.location.href = "/login";
    //   }, 3000);
    // }
    setTimeout(() => {
      setActive(false);
    }, 500);
  }, []);

  // const [countdown, setCountdown] = useState(3);

  // useEffect(() => {
  //   if (sessionExpired) {
  //     const interval = setInterval(() => {
  //       setCountdown((prev) => prev > 0 ? prev - 1 : 0);
  //     }, 1000);
  //     return () => clearInterval(interval);
  //   }
  // }, [sessionExpired]);

  return (
    <>
      {active ? (
        <div className="loader-mask">
          <div className="loader">
            <div></div>
            <div></div>
          </div>
        </div>
      ) : (
        <div></div>
      )}
      {/* <Snackbar
        open={sessionExpired}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
        autoHideDuration={6000}
      >
        <Alert severity="error" sx={{ width: "100%" }}>
          La sesión ha expirado. Serás redirigido al login en {countdown} segundos.
        </Alert>
      </Snackbar> */}
    </>
  );
};

export default Preloader;
