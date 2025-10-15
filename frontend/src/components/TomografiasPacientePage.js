import React, { useEffect, useState } from "react";
import {
  Container,
  Table,
  Button,
  Alert,
  Modal,
  Form,
  Spinner,
} from "react-bootstrap";
import { useParams, useNavigate } from "react-router-dom";
import api from "../utils/axios";

const baseURL = "http://localhost:8000";
const getUrlCompleta = (url) => {
  if (!url) return null;
  if (url.startsWith("http")) return url;
  return baseURL + url;
};

const parseNombreDicom = (str) => {
  if (!str) return { nombre: "", apellidos: "" };
  let [apellidosRaw, nombreRaw] = str.split("^");
  if (!nombreRaw && str.includes(".")) {
    [apellidosRaw, nombreRaw] = str.split(".");
  }
  const capitalize = (s) =>
    s ? s.charAt(0).toUpperCase() + s.slice(1).toLowerCase() : "";
  const apellidos = apellidosRaw
    ? apellidosRaw
        .split(" ")
        .map((w) => capitalize(w))
        .join(" ")
    : "";
  const nombre = capitalize(nombreRaw);
  return { nombre, apellidos };
};

const formatearDescripcion = (desc) => {
  if (!desc) return "Sin descripción";
  let texto = desc.includes("^") ? desc.split("^")[0] : desc;
  texto = texto.replace(/\s*\(.*?\)\s*/g, "").trim();
  return texto.charAt(0).toUpperCase() + texto.slice(1).toLowerCase();
};

const TomografiasPacientePage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [paciente, setPaciente] = useState(null);
  const [tomografias, setTomografias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showImportModal, setShowImportModal] = useState(false);
  const [zipFile, setZipFile] = useState(null);
  const [importError, setImportError] = useState("");
  const [importLoading, setImportLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    fetchPaciente();
    // eslint-disable-next-line
  }, [id]);

  const fetchPaciente = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await api.get(`/api/pacientes/${id}/`);
      setPaciente(res.data);
      setTomografias(res.data.tomografias || []);
    } catch (err) {
      setError("Error al cargar el paciente.");
    }
    setLoading(false);
  };

  const abrirCarpetaDicom = (t) => {
    window.electronAPI.abrirDicom(
      (t.dicoms || []).map((d) => getUrlCompleta(d.archivo))
    );
  };

  const handleZipChange = (e) => {
    setZipFile(e.target.files[0]);
    setImportError("");
    setSuccessMessage("");
  };

  const importarZip = async () => {
    if (!zipFile) {
      setImportError("Debe seleccionar un archivo ZIP.");
      return;
    }
    setImportLoading(true);
    setImportError("");
    setSuccessMessage("");
    const formData = new FormData();
    formData.append("dicoms_zip", zipFile);
    formData.append("paciente_id", paciente.id);

    try {
      await api.post("/api/importar-carpeta-dicoms/", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setShowImportModal(false);
      setZipFile(null);

      const nombreFormateado = parseNombreDicom(paciente.nombre);
      setSuccessMessage(
        `Tomografía importada correctamente para ${nombreFormateado.nombre} ${nombreFormateado.apellidos}`
      );

      await fetchPaciente();
    } catch (error) {
      setImportError(
        "Error al importar el ZIP: " +
          (error.response?.data?.error || error.message)
      );
    } finally {
      setImportLoading(false);
    }
  };

  const eliminarTomografia = async (tid) => {
    if (
      !window.confirm(
        "¿Seguro que deseas eliminar esta tomografía? Esta acción no se puede deshacer."
      )
    )
      return;
    setLoading(true);
    setError("");
    try {
      await api.delete(`/api/tomografias/${tid}/`);
      await fetchPaciente();
    } catch (err) {
      setError("Error al eliminar la tomografía.");
    }
    setLoading(false);
  };

  const { nombre, apellidos } = paciente
    ? parseNombreDicom(paciente.nombre)
    : { nombre: "", apellidos: "" };
  const nombreCompleto = `${nombre} ${apellidos}`.trim();

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #f5f7ff 0%, #dbe4ff 100%)",
        color: "#4a4a6a",
        paddingTop: 80,
        paddingBottom: 60,
        fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
      }}
    >
      <Container>
        <Button
          variant="outline-primary"
          style={{
            marginBottom: 24,
            borderRadius: 12,
            fontWeight: 600,
            transition: "background-color 0.3s ease, color 0.3s ease",
            userSelect: "none",
          }}
          onClick={() => navigate(-1)}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = "#7c5eff";
            e.currentTarget.style.color = "#fff";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = "transparent";
            e.currentTarget.style.color = "#0d6efd";
          }}
        >
          ← Volver a Pacientes
        </Button>
        <h2
          style={{
            color: "#7c5eff",
            fontWeight: 700,
            marginBottom: 18,
            userSelect: "none",
          }}
        >
          Tomografías de {nombreCompleto || "Paciente"}
        </h2>

        {error && (
          <Alert
            variant="danger"
            style={{ borderRadius: 12, userSelect: "none" }}
            dismissible
            onClose={() => setError("")}
          >
            {error}
          </Alert>
        )}
        {successMessage && (
          <Alert
            variant="success"
            style={{ borderRadius: 12, userSelect: "none" }}
            dismissible
            onClose={() => setSuccessMessage("")}
          >
            {successMessage}
          </Alert>
        )}

        <Button
          size="sm"
          variant="primary"
          style={{
            fontWeight: 600,
            marginBottom: 16,
            borderRadius: 12,
            userSelect: "none",
            transition: "background-color 0.3s ease",
          }}
          onClick={() => setShowImportModal(true)}
          disabled={importLoading}
          onMouseEnter={(e) => {
            if (!importLoading) {
              e.currentTarget.style.backgroundColor = "#5a3db9";
              e.currentTarget.style.borderColor = "#5a3db9";
            }
          }}
          onMouseLeave={(e) => {
            if (!importLoading) {
              e.currentTarget.style.backgroundColor = "#7c5eff";
              e.currentTarget.style.borderColor = "#7c5eff";
            }
          }}
        >
          {importLoading ? (
            <>
              <Spinner
                as="span"
                animation="border"
                size="sm"
                style={{ marginRight: 8 }}
              />
              Importando...
            </>
          ) : (
            "Importar ZIP de Tomografía"
          )}
        </Button>

        {loading ? (
          <div style={{ textAlign: "center", marginTop: 60, userSelect: "none" }}>
            <Spinner animation="border" variant="primary" />
            <div style={{ marginTop: 8 }}>Cargando tomografías...</div>
          </div>
        ) : (
          <Table
            bordered
            hover
            responsive
            style={{
              background: "rgba(124, 94, 255, 0.1)",
              color: "#4a4a6a",
              borderColor: "#7c5eff",
              borderRadius: 16,
              userSelect: "text",
            }}
          >
            <thead>
              <tr>
                <th>Descripción</th>
                <th>Fecha Estudio</th>
                <th>Modalidad</th>
                <th>Archivos DICOM</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {tomografias.length === 0 && (
                <tr>
                  <td colSpan={5} style={{ textAlign: "center" }}>
                    No hay tomografías registradas.
                  </td>
                </tr>
              )}
              {tomografias.map((t) => (
                <tr key={t.id}>
                  <td>{formatearDescripcion(t.descripcion)}</td>
                  <td>{t.fecha_estudio || "-"}</td>
                  <td>{t.modalidad || "-"}</td>
                  <td>{t.dicoms?.length > 0 ? `${t.dicoms.length} archivo(s)` : "Sin archivos"}</td>
                  <td>
                    <Button
                      size="sm"
                      variant="info"
                      onClick={() => abrirCarpetaDicom(t)}
                      disabled={!t.dicoms || t.dicoms.length === 0}
                      style={{
                        marginRight: 8,
                        borderRadius: 12,
                        fontWeight: 600,
                        userSelect: "none",
                        transition: "background-color 0.3s ease",
                      }}
                      onMouseEnter={(e) => {
                        if (!e.currentTarget.disabled) {
                          e.currentTarget.style.backgroundColor = "#5a3db9";
                          e.currentTarget.style.borderColor = "#5a3db9";
                          e.currentTarget.style.color = "#fff";
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!e.currentTarget.disabled) {
                          e.currentTarget.style.backgroundColor = "#0dcaf0";
                          e.currentTarget.style.borderColor = "#0dcaf0";
                          e.currentTarget.style.color = "#fff";
                        }
                      }}
                    >
                      Abrir Tomografía DICOM
                    </Button>
                    <Button
                      size="sm"
                      variant="outline-danger"
                      onClick={() => eliminarTomografia(t.id)}
                      style={{
                        borderRadius: 12,
                        fontWeight: 600,
                        userSelect: "none",
                        transition: "background-color 0.3s ease, color 0.3s ease",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = "#dc3545";
                        e.currentTarget.style.color = "#fff";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = "transparent";
                        e.currentTarget.style.color = "#dc3545";
                      }}
                    >
                      Eliminar
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        )}

        {/* Modal para importar ZIP */}
        <Modal
          show={showImportModal}
          onHide={() => setShowImportModal(false)}
          centered
          backdrop="static"
          keyboard={false}
        >
          <Modal.Header closeButton>
            <Modal.Title>Importar ZIP de Tomografía</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form>
              <Form.Group>
                <Form.Label>Archivo ZIP con DICOMs</Form.Label>
                <Form.Control
                  type="file"
                  accept=".zip"
                  onChange={handleZipChange}
                  disabled={importLoading}
                  style={{ borderRadius: 8 }}
                />
              </Form.Group>
              {importError && (
                <Alert
                  variant="danger"
                  className="mt-2"
                  style={{ borderRadius: 12 }}
                >
                  {importError}
                </Alert>
              )}
            </Form>
          </Modal.Body>
          <Modal.Footer>
            <Button
              variant="outline-secondary"
              onClick={() => setShowImportModal(false)}
              disabled={importLoading}
              style={{ borderRadius: 12, fontWeight: 600 }}
            >
              Cancelar
            </Button>
            <Button
              variant="primary"
              onClick={importarZip}
              disabled={importLoading}
              style={{ borderRadius: 12, fontWeight: 600 }}
            >
              {importLoading ? (
                <>
                  <Spinner
                    as="span"
                    animation="border"
                    size="sm"
                    style={{ marginRight: 8 }}
                  />
                  Importando...
                </>
              ) : (
                "Importar"
              )}
            </Button>
          </Modal.Footer>
        </Modal>
      </Container>
    </div>
  );
};

export default TomografiasPacientePage;
