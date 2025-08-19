import { useMemo, useState } from "react";
import {
  Box,
  Typography,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  TextField,
  Chip,
  Link as MLink,
  Button
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";

/**
 * Contenido resumido y estructurado de:
 *  - 1755134353960_Términos y Condiciones.pdf
 */
const TERMINOS_PDF = "/documentos/TérminosyCondiciones.pdf";
function openPDF(path) {
  const url = encodeURI(path); // maneja espacios y acentos
  window.open(url, "_blank", "noopener,noreferrer");
}

const SECTIONS = [
  {
    id: "introduccion",
    title: "Introducción y Aceptación",
    content: [
      "El uso de Tulocaltunego.com implica la aceptación plena de los Términos y Condiciones.",
      "Puede haber condiciones particulares por sección; si no estás de acuerdo, no uses esa sección.",
    ],
  },
  {
    id: "objeto",
    title: "Objeto",
    content: [
      "El portal permite anunciar/ofertar bienes y servicios y buscar oportunidades de compra.",
      "Tulocaltunego.com puede modificar presentación, configuración y contenido sin previo aviso.",
    ],
  },
  {
    id: "uso-portal",
    title: "Uso del Portal y Servicios",
    content: [
      "6 meses de servicios gratuitos.",
      "Después del periodo gratuito: inscripción por categoría: $120 MXN / 6 meses o $250 MXN / 12 meses.",
      "Registro con datos personales verídicos y obligación de mantenerlos actualizados.",
    ],
  },
  {
    id: "obligaciones-licitas",
    title: "Uso Correcto y Lícito",
    content: [
      "Actuar conforme a la ley, moral, buenas costumbres y orden público.",
      "Prohibido usar el sitio para actividades ilícitas o que violen propiedad intelectual y otras leyes.",
    ],
  },
  {
    id: "medios-contenido",
    title: "Medios para Obtención de Contenido (Prohibiciones)",
    content: [
      "Prohibido difundir contenidos racistas, xenófobos o de apología de delitos.",
      "Prohibido introducir malware/virus o enviar spam/cadenas.",
      "Prohibido suplantar identidades o violar derechos de autor y datos personales.",
    ],
  },
  {
    id: "propiedad-intelectual",
    title: "Propiedad Intelectual e Industrial",
    content: [
      "Marcas y signos distintivos son de Tulocaltunego.com o terceros.",
      "No se concede derecho de explotación; uso solo personal/no comercial.",
      "Se autorizan marcas de agua en contenidos publicados para evitar usos no consentidos.",
      "Reportes de infracción: contacto@tulocaltunego.com",
    ],
  },
  {
    id: "uso-contenido",
    title: "Uso Correcto del Contenido (Buenas Prácticas)",
    content: [
      "Anuncios: información precisa (estado, características, defectos) y fotos reales.",
      "Comunicación respetuosa y respuesta ágil a consultas.",
      "No copiar contenidos de otros usuarios sin consentimiento.",
      "Publicar solo artículos permitidos por políticas y leyes locales/federales.",
    ],
  },
  {
    id: "responsabilidad",
    title: "Responsabilidad por Daños y Perjuicios",
    content: [
      "El usuario es responsable del cumplimiento de estos términos.",
      "Si Tulocaltunego.com es sancionado por causa imputable al usuario, podrá repetir contra él.",
    ],
  },
  {
    id: "privacidad",
    title: "Políticas de Privacidad (Referencia)",
    content: [
      "El uso de datos personales se detalla en el Aviso de Privacidad.",
      "Análisis/estudios, envío de información/promociones y notificaciones del servicio.",
    ],
  },
  {
    id: "duracion",
    title: "Duración y Terminación",
    content: [
      "El portal tiene duración indefinida, pero puede suspenderse o terminarse sin previo aviso.",
    ],
  },
  {
    id: "otras",
    title: "Otras Disposiciones",
    content: [
      "Soporte probatorio de versiones impresas/electrónicas.",
      "Ley aplicable y jurisdicción: Tribunales competentes en Ciudad de México.",
    ],
  },
  {
    id: "derechos",
    title: "Derechos Reservados",
    content: ["Todo derecho no conferido queda reservado a Tulocaltunego.com."],
  },
  {
    id: "fallecimiento",
    title: "En Caso de Fallecimiento",
    content: [
      "Beneficios de la cuenta no son transferibles; se cancela la cuenta y beneficios.",
    ],
  },
  {
    id: "uso-imagen",
    title: "Uso de Imagen",
    content: [
      "Se concede derecho para producción y difusión de imagen/voz del usuario sin regalías, con fines de confianza/comercial.",
    ],
  },
  {
    id: "modificaciones-datos",
    title: "Modificaciones de Datos",
    content: [
      "Usuarios registrados pueden modificar datos (incluido correo si no está tomado).",
      "Responsabilidad de mantener la información actualizada.",
    ],
  },
  {
    id: "disponibilidad",
    title: "Disponibilidad y Continuidad",
    content: [
      "No se garantiza disponibilidad/continuidad por causas técnicas o de fuerza mayor.",
      "El portal no participa en transacciones entre usuarios; actúa como intermediario de publicación.",
      "Recomendación: actuar con prudencia y sentido común en operaciones.",
    ],
  },
  {
    id: "menores",
    title: "Menores de Edad",
    content: [
      "Menores requieren autorización de padres/tutores, quienes son responsables de sus actos.",
      "Algunas secciones pueden ser solo para mayores de 18 años.",
    ],
  },
  {
    id: "rechazo-anuncio",
    title: "Derecho a Rechazar Anuncios",
    content: [
      "Se puede rechazar/eliminar anuncios a discreción (retrasos, errores, causas fuera de control, etc.).",
      "No hay revisión previa obligatoria del contenido.",
    ],
  },
];

export default function TerminosCondicionesContent() {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    if (!query.trim()) return SECTIONS;
    const q = query.toLowerCase();
    return SECTIONS.filter(
      (s) =>
        s.title.toLowerCase().includes(q) ||
        s.content.some((p) => p.toLowerCase().includes(q))
    );
  }, [query]);

  return (
    <Box className="container">
      {/* Header */}
      <div className="row">
        <div className="col-12">
          <Typography variant="h6" gutterBottom>
            TÉRMINOS Y CONDICIONES — Tulocaltunego.com
          </Typography>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            Resumen navegable para lectura rápida. Para la versión íntegra, consulta el PDF original.
          </Typography>
          <div className="d-flex gap-2 flex-wrap mb-3">
            <Chip label="6 meses gratis" />
            <Chip label="$120/6 meses por categoría" />
            <Chip label="$250/12 meses por categoría" />
            <Chip label="Jurisdicción: CDMX" />
          </div>
        </div>
      </div>

      {/* Buscador */}
      <div className="d-flex flex-row align-items-center gap-2 mt-3">
        <div className="col-md-6">
          <TextField
            size="small"
            fullWidth
            label="Buscar en el documento"
            placeholder="Ej. propiedad intelectual, anuncios, menores…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
        <Button
          variant="contained"
          color="error"
          startIcon={<PictureAsPdfIcon />}
          onClick={() => openPDF(TERMINOS_PDF)}
        >
          Aviso de Privacidad
        </Button>
      </div>

      {/* Contenido */}
      <div className="row">
        <div className="col-12">
          {filtered.map((sec) => (
            <Accordion key={sec.id} disableGutters>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography variant="subtitle1" fontWeight={600}>
                  {sec.title}
                </Typography>
              </AccordionSummary>
              <AccordionDetails>
                <ul className="mb-0">
                  {sec.content.map((p, i) => (
                    <li key={i}>
                      <Typography variant="body2">{p}</Typography>
                    </li>
                  ))}
                </ul>
              </AccordionDetails>
            </Accordion>
          ))}

          {filtered.length === 0 && (
            <Typography variant="body2" color="text.secondary" className="mt-3">
              No se encontraron coincidencias para “{query}”.
            </Typography>
          )}
        </div>
      </div>

      <Box mt={2}>
        <Typography variant="caption" color="text.secondary">
          Correo de contacto:{" "}
          <MLink href="mailto:contacto@tulocaltunego.com">
            contacto@tulocaltunego.com
          </MLink>
        </Typography>
      </Box>
    </Box>
  );
}
