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
 *  - 1755134376480_Aviso de Privacidad.pdf
 */
const PRIVACIDAD_PDF = "/documentos/AvisodePrivacidad.pdf";

function openPDF(path) {
    const url = encodeURI(path); // maneja espacios y acentos
    window.open(url, "_blank", "noopener,noreferrer");
}
const SECTIONS = [
    {
        id: "responsable",
        title: "Responsable y Contacto",
        content: [
            "Responsable: Ángel Álvarez Urrutia en representación de Tulocaltunego.com.",
            "Correo: contacto@tulocaltunego.com",
        ],
    },
    {
        id: "recoleccion",
        title: "¿Cuándo recopilamos datos?",
        content: ["Al registrarte en la plataforma."],
    },
    {
        id: "fines",
        title: "Fines del Tratamiento",
        content: [
            "Registro en el sistema y operación del servicio.",
            "Procesamiento de pagos.",
            "Recomendaciones de productos.",
            "Atención a clientes y soporte (quejas/sugerencias).",
            "Historial de movimientos.",
            "Promociones y novedades (opt‑in).",
        ],
    },
    {
        id: "datos",
        title: "Datos Personales Tratados",
        content: [
            "Nombre de usuario, nombre completo, edad, domicilio.",
            "Teléfono, correo electrónico.",
            "Datos bancarios (cuenta o tarjeta), proporcionados y almacenados a potestad del usuario.",
        ],
    },
    {
        id: "transferencias",
        title: "Transferencias",
        content: [
            "No se comparten datos con terceros, salvo por orden de autoridad competente.",
            "Protección conforme a la LFPDPPP.",
        ],
    },
    {
        id: "arco",
        title: "Derechos ARCO",
        content: [
            "Acceso, Rectificación, Cancelación (baja efectiva en 15 días; resguardo 18 meses), Oposición.",
            "Solicitud mediante Plataforma Nacional de Transparencia.",
            "Respuesta en 5 días hábiles por el medio indicado (correo o teléfono).",
        ],
    },
    {
        id: "revocacion",
        title: "Revocación del Consentimiento / Limitación",
        content: [
            "Solicita por correo a contacto@tulocaltunego.com.",
            "No siempre es posible concluir de inmediato (obligaciones legales).",
            "En ciertos casos, revocar implica no poder seguir prestando el servicio.",
            "Respuesta en 5 días hábiles por el medio indicado (correo o teléfono).",
        ],
    },
    {
        id: "cambios",
        title: "Cambios al Aviso",
        content: [
            "Puede modificarse por cambios legales, necesidades del servicio o prácticas de privacidad.",
            "Se mantendrá informado al titular sobre actualizaciones.",
        ],
    },
];

export default function AvisoPrivacidadContent() {
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
                        AVISO DE PRIVACIDAD — Tulocaltunego.com
                    </Typography>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                        Resumen navegable para lectura rápida. Para la versión íntegra, consulta el PDF original.
                    </Typography>
                    <div className="d-flex gap-2 flex-wrap mb-3">
                        <Chip label="LFPDPPP (México)" />
                        <Chip label="ARCO: Acceso/Rectificación/Cancelación/Oposición" />
                        <Chip label="Respuesta en 5 días hábiles" />
                        <Chip label="Resguardo 18 meses tras cancelación" />
                    </div>
                </div>
            </div>

            {/* Buscador */}
            <div className="d-flex flex-row align-items-center gap-2 mt-3">
                <div className="flex-grow-1">
                    <TextField
                        size="small"
                        fullWidth
                        label="Buscar en el documento"
                        placeholder="Ej. ARCO, transferencias, datos bancarios…"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                    />
                </div>
                <Button
                    variant="contained"
                    color="error"
                    startIcon={<PictureAsPdfIcon />}
                    onClick={() => openPDF(PRIVACIDAD_PDF)}
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
                    Consulta la LFPDPPP:{" "}
                    <MLink
                        href="https://www.diputados.gob.mx/LeyesBiblio/pdf/LFPDPPP.pdf"
                        target="_blank"
                        rel="noopener"
                    >
                        Texto vigente
                    </MLink>
                    {" · "}
                    Plataforma Nacional de Transparencia:{" "}
                    <MLink
                        href="https://www.plataformadetransparencia.org.mx/"
                        target="_blank"
                        rel="noopener"
                    >
                        Solicitudes ARCO
                    </MLink>
                </Typography>
                <br />
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
