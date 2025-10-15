import React, { useEffect, useState } from "react";
import { Container, Button, Table, Form, Alert, Spinner } from "react-bootstrap";
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

const ArchivosNiftiPage = () => {
  const { id } = useParams(); // id del paciente
  const navigate = useNavigate();

  const [paciente, setPaciente] = useState(null);
  const [archivos, setArchivos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [file, setFile] = useState(null);
  const [descripcion, setDescripcion] = useState("");
  const [uploading, setUploading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    fetchPaciente();
    fetchArchivos();
    // eslint-disable-next-line
  }, [id]);

  const fetchPaciente = async () => {
    try {
      const res = await api.get(`/api/pacientes/${id}/`);
      setPaciente(res.data);
    } catch {
      setError("Error al cargar paciente.");
    }
  };

  const fetchArchivos = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await api.get(`/api/archivos-nifti/?paciente=${id}`);
      setArchivos(res.data);
    } catch {
      setError("Error al cargar archivos NIfTI.");
    }
    setLoading(false);
  };

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
    setSuccessMessage("");
    setError("");
  };

  const subirArchivo = async () => {
    if (!file) {
      setError("Seleccione un archivo NIfTI para subir.");
      return;
    }
    setUploading(true);
    setError("");
    setSuccessMessage("");
    const formData = new FormData();
    formData.append("archivo", file);
    formData.append("paciente", id);
    formData.append("descripcion", descripcion);

    try {
      await api.post("/api/archivos-nifti/", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setSuccessMessage("Archivo NIfTI subido correctamente.");
      setFile(null);
      setDescripcion("");
      await fetchArchivos();
    } catch (err) {
      setError("Error al subir archivo.");
    } finally {
      setUploading(false);
    }
  };

  const eliminarArchivo = async (archivoId) => {
    if (
      !window.confirm(
        "¿Seguro que deseas eliminar este archivo? Esta acción no se puede deshacer."
      )
    )
      return;
    setLoading(true);
    setError("");
    try {
      await api.delete(`/api/archivos-nifti/${archivoId}/`);
      await fetchArchivos();
    } catch {
      setError("Error al eliminar archivo.");
    }
    setLoading(false);
  };

  const { nombre, apellidos } = paciente
    ? parseNombreDicom(paciente.nombre)
    : { nombre: "", apellidos: "" };
  const nombreCompleto = `${nombre} ${apellidos}`.trim();

  return (
    <Container
      style={{
        marginTop: 60,
        fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
        color: "#4a4a6a",
      }}
    >
      <Button
        variant="outline-primary"
        onClick={() => navigate(-1)}
        style={{
          marginBottom: 20,
          borderRadius: 12,
          fontWeight: 600,
          transition: "background-color 0.3s ease, color 0.3s ease",
          userSelect: "none",
        }}
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
          marginBottom: 30,
          userSelect: "none",
          color: "#7c5eff",
          fontWeight: 700,
        }}
      >
        Archivos NIfTI de {nombreCompleto || "Paciente"}
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

     <Form.Group controlId="formFileNifti" style={{ maxWidth: 400, marginBottom: 24 }}>
  <Form.Label
    style={{
      fontWeight: 600,
      color: "#7c5eff",
      fontSize: 18,
      marginBottom: 8,
      letterSpacing: 0.2,
      userSelect: "none"
    }}
  >
    <span role="img" aria-label="NIfTI">🧠</span> Seleccionar archivo NIfTI
  </Form.Label>
  <div
    style={{
      position: "relative",
      border: "2px dashed #7c5eff",
      borderRadius: 12,
      padding: 24,
      background: "#f5f7ff",
      textAlign: "center",
      cursor: uploading ? "not-allowed" : "pointer",
      transition: "border-color 0.2s"
    }}
    onClick={() => !uploading && document.getElementById("input-nifti-file").click()}
    onDragOver={e => {
      e.preventDefault();
      e.currentTarget.style.borderColor = "#5a3db9";
    }}
    onDragLeave={e => {
      e.preventDefault();
      e.currentTarget.style.borderColor = "#7c5eff";
    }}
    onDrop={e => {
      e.preventDefault();
      if (!uploading) {
        const file = e.dataTransfer.files[0];
        if (file) handleFileChange({ target: { files: [file] } });
      }
      e.currentTarget.style.borderColor = "#7c5eff";
    }}
  >
    <Form.Control
      id="input-nifti-file"
      type="file"
      accept=".nii,.nii.gz"
      onChange={handleFileChange}
      style={{
        display: "none"
      }}
      disabled={uploading}
    />
    <div style={{ pointerEvents: "none" }}>
      <span style={{ fontSize: 32, color: "#7c5eff" }}>📂</span>
      <div style={{ margin: "12px 0 4px 0", fontWeight: 500 }}>
        {file ? file.name : "Arrastra aquí o haz clic para seleccionar"}
      </div>
      <small style={{ color: "#6b63c9" }}>
        Solo archivos <b>.nii</b> o <b>.nii.gz</b>
      </small>
    </div>
  </div>
</Form.Group>

      <Form.Group
        controlId="formDescripcion"
        className="mb-3"
        style={{ maxWidth: 400 }}
      >
        <Form.Label>Descripción</Form.Label>
        <Form.Control
          type="text"
          placeholder="Ingrese una descripción"
          value={descripcion}
          onChange={(e) => setDescripcion(e.target.value)}
          style={{ borderRadius: 8 }}
          disabled={uploading}
        />
      </Form.Group>

      <Button
        onClick={subirArchivo}
        disabled={uploading}
        variant="primary"
        style={{
          borderRadius: 12,
          fontWeight: 600,
          userSelect: "none",
          transition: "background-color 0.3s ease",
          maxWidth: 400,
          width: "100%",
          marginBottom: 30,
        }}
        onMouseEnter={(e) => {
          if (!uploading) {
            e.currentTarget.style.backgroundColor = "#5a3db9";
            e.currentTarget.style.borderColor = "#5a3db9";
          }
        }}
        onMouseLeave={(e) => {
          if (!uploading) {
            e.currentTarget.style.backgroundColor = "#7c5eff";
            e.currentTarget.style.borderColor = "#7c5eff";
          }
        }}
      >
        {uploading ? (
          <>
            <Spinner
              animation="border"
              size="sm"
              style={{ marginRight: 8 }}
              as="span"
            />
            Subiendo...
          </>
        ) : (
          "Subir Archivo"
        )}
      </Button>

      {loading ? (
        <div style={{ textAlign: "center" }}>
          <Spinner animation="border" variant="primary" />
        </div>
      ) : archivos.length === 0 ? (
        <p style={{ color: "#6b63c9", userSelect: "none" }}>
          No hay archivos NIfTI registrados.
        </p>
      ) : (
        <Table
          striped
          bordered
          hover
          responsive
          style={{
            background: "rgba(124, 94, 255, 0.1)",
            borderRadius: 16,
            borderColor: "#7c5eff",
            color: "#4a4a6a",
            userSelect: "text",
          }}
        >
          <thead>
            <tr>
              <th>Descripción</th>
              <th>Fecha subida</th>
              <th>Archivo</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {archivos.map((a) => {
              const nombreArchivo = a.archivo ? a.archivo.split("/").pop() : "";
              return (
                <tr key={a.id}>
                  <td>{a.descripcion || "-"}</td>
                  <td>{new Date(a.fecha_subida).toLocaleString()}</td>
                  <td>
                    <a
                      href={getUrlCompleta(a.archivo)}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ color: "#7c5eff", textDecoration: "none" }}
                      onMouseEnter={(e) =>
                        (e.currentTarget.style.textDecoration = "underline")
                      }
                      onMouseLeave={(e) =>
                        (e.currentTarget.style.textDecoration = "none")
                      }
                    >
                      Descargar {nombreArchivo ? `(${nombreArchivo})` : ""}
                    </a>
                  </td>
                  <td>
                    <Button
                      variant="outline-danger"
                      size="sm"
                      onClick={() => eliminarArchivo(a.id)}
                      style={{
                        borderRadius: 12,
                        fontWeight: 600,
                        transition: "background-color 0.3s ease, color 0.3s ease",
                        userSelect: "none",
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
              );
            })}
          </tbody>
        </Table>
      )}
    </Container>
  );
};

export default ArchivosNiftiPage;
