import Swal from 'sweetalert2';

// 💜 Color principal personalizado
const colorPrincipal = '#6f0e77ff'; // morado
const colorError = '#d63031';
const colorConfirm = '#00b894';

/**
 * Alerta de éxito (con callback opcional)
 */
export const alertaSuccess = (mensaje, callback = null) => {
  Swal.fire({
    icon: 'success',
    title: '¡Éxito!',
    text: mensaje,
    confirmButtonText: 'Aceptar',
    confirmButtonColor: colorPrincipal,
    background: colorPrincipal,
    color: '#fff',
  }).then(() => {
    if (callback) callback();
  });
};

/**
 * Alerta de error
 */
export const alertaError = (mensaje, detalle) => {
  const texto = mensaje + ': ' + detalle;
  Swal.fire({
    icon: 'error',
    title: 'Error',
    text: texto,
    confirmButtonText: 'Aceptar',
    confirmButtonColor: colorError,
    background: colorPrincipal,
    color: '#fff',
  });
};


/**
 * Alerta de confirmación con dos botones (Sí / Cancelar)
 */
export const alertaConfirmacion = (mensaje, onConfirm) => {
  Swal.fire({
    title: '¿Estás seguro?',
    text: mensaje,
    icon: 'question',
    showCancelButton: true,
    confirmButtonText: 'Sí, continuar',
    cancelButtonText: 'Cancelar',
    confirmButtonColor: colorConfirm,
    cancelButtonColor: colorError,
    background: '#1e1e2f',
    color: '#fff',
  }).then((result) => {
    if (result.isConfirmed) {
      onConfirm();
    }
  });
};
