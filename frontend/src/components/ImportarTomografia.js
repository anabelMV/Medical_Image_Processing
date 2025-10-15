import React, { useState } from "react";
import { Container, Form, Button, Alert, Spinner, Card, ProgressBar } from "react-bootstrap";
import api from "../utils/axios";

const ImportarTomografia = () => {
  const [archivoZip, setArchivoZip] = useState(null);
  const [mensaje, setMensaje] = useState("");
  const [errores, setErrores] = useState([]);
  const [subiendo, setSubiendo] = useState(false);
  const [progreso, setProgreso] = useState(0);

  const handleFileChange = (e) => {
    setArchivoZip(e.target.files[0]);
    setMensaje("");
    setErrores([]);
    setProgreso(0);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!archivoZip) {
      setMensaje("Selecciona un archivo ZIP con los DICOMs.");
      return;
    }
    setSubiendo(true);
    setMensaje("");
    setErrores([]);
    setProgreso(0);

    const formData = new FormData();
    formData.append("dicoms_zip", archivoZip);
    // No enviamos paciente_id, backend lo extrae de los metadatos

    try {
      const res = await api.post("/api/importar-carpeta-dicoms/", formData, {
        headers: { "Content-Type": "multipart/form-data" },
        onUploadProgress: (progressEvent) => {
          const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setProgreso(percent);
        },
      });

      if (res.data.resultados) {
        const erroresEncontrados = res.data.resultados.filter(r => r.error);
        if (erroresEncontrados.length > 0) {
          setErrores(erroresEncontrados.map(r => `${r.filename}: ${r.error}`));
          setMensaje("Importación completada con errores.");
        } else {
          setMensaje("Importación exitosa y paciente creado/actualizado correctamente.");
          setErrores([]);
        }
      } else {
        setMensaje("Importación exitosa.");
      }

      setArchivoZip(null);
      setProgreso(0);
      // Aquí puedes llamar a una función para refrescar la lista de pacientes o estudios si quieres
    } catch (err) {
      let errorMsg = "Error al importar la tomografía.";
      if (err.response?.data?.error) {
        errorMsg += ` ${err.response.data.error}`;
      }
      setMensaje(errorMsg);
    }
    setSubiendo(false);
  };

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
        <Card
          style={{
            maxWidth: 520,
            margin: "0 auto",
            background: "rgba(124, 94, 255, 0.1)",
            border: "1px solid #7c5eff",
            color: "#4a4a6a",
            boxShadow: "0 6px 20px rgba(124, 94, 255, 0.15)",
            borderRadius: 16,
            transition: "box-shadow 0.3s ease",
          }}
          className="mb-4"
          onMouseEnter={(e) => (e.currentTarget.style.boxShadow = "0 12px 32px rgba(124, 94, 255, 0.25)")}
          onMouseLeave={(e) => (e.currentTarget.style.boxShadow = "0 6px 20px rgba(124, 94, 255, 0.15)")}
        >
          <Card.Body>
            <h2
              style={{
                color: "#7c5eff",
                fontWeight: 700,
                marginBottom: 30,
                textAlign: "center",
                userSelect: "none",
              }}
            >
              Importar Tomografía DICOM (ZIP)
            </h2>
            <Form onSubmit={handleSubmit}>
              <Form.Group className="mb-3" style={{ textAlign: "center" }}>
                <input
                  type="file"
                  accept=".zip"
                  id="zip-upload"
                  style={{ display: "none" }}
                  onChange={handleFileChange}
                  disabled={subiendo}
                />
                <label htmlFor="zip-upload">
                  <Button
                    as="span"
                    variant="outline-primary"
                    style={{
                      background: "transparent",
                      borderColor: "#7c5eff",
                      color: "#7c5eff",
                      fontWeight: 600,
                      fontSize: "1.1rem",
                      padding: "10px 36px",
                      borderRadius: 12,
                      boxShadow: "0 2px 12px rgba(124, 94, 255, 0.12)",
                      transition: "background 0.3s ease, color 0.3s ease, border 0.3s ease",
                      userSelect: "none",
                      cursor: subiendo ? "not-allowed" : "pointer",
                    }}
                    disabled={subiendo}
                    onMouseEnter={(e) => {
                      if (!subiendo) {
                        e.currentTarget.style.backgroundColor = "#7c5eff";
                        e.currentTarget.style.color = "#fff";
                        e.currentTarget.style.borderColor = "#7c5eff";
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!subiendo) {
                        e.currentTarget.style.backgroundColor = "transparent";
                        e.currentTarget.style.color = "#7c5eff";
                        e.currentTarget.style.borderColor = "#7c5eff";
                      }
                    }}
                  >
                    {archivoZip ? `Archivo Seleccionado: ${archivoZip.name}` : "Seleccionar archivo ZIP"}
                  </Button>
                </label>
              </Form.Group>

              {subiendo && (
                <ProgressBar
                  now={progreso}
                  label={`${progreso}%`}
                  variant="primary"
                  style={{
                    backgroundColor: "#dbe4ff",
                    marginTop: 16,
                    marginBottom: 8,
                    height: 20,
                    borderRadius: 12,
                    boxShadow: "inset 0 1px 3px rgba(0,0,0,0.1)",
                  }}
                  animated
                />
              )}

              <Button
                type="submit"
                variant="primary"
                disabled={subiendo}
                style={{
                  marginTop: 24,
                  width: "100%",
                  borderRadius: 12,
                  fontWeight: 600,
                  userSelect: "none",
                  transition: "background-color 0.3s ease",
                }}
                onMouseEnter={(e) => {
                  if (!subiendo) {
                    e.currentTarget.style.backgroundColor = "#5a3db9";
                    e.currentTarget.style.borderColor = "#5a3db9";
                  }
                }}
                onMouseLeave={(e) => {
                  if (!subiendo) {
                    e.currentTarget.style.backgroundColor = "#7c5eff";
                    e.currentTarget.style.borderColor = "#7c5eff";
                  }
                }}
              >
                {subiendo ? (
                  <>
                    <Spinner animation="border" size="sm" style={{ marginRight: 8 }} />
                    Importando...
                  </>
                ) : (
                  "Importar"
                )}
              </Button>
            </Form>

            {mensaje && (
              <Alert
                variant={errores.length > 0 ? "warning" : "success"}
                style={{
                  marginTop: 18,
                  background: "#dbe4ff",
                  color: "#4a4a6a",
                  borderColor: "#7c5eff",
                  borderRadius: 12,
                  userSelect: "none",
                }}
                dismissible
                onClose={() => setMensaje("")}
              >
                {mensaje}
              </Alert>
            )}

            {errores.length > 0 && (
              <Alert
                variant="danger"
                style={{
                  marginTop: 8,
                  background: "#ffd6e8",
                  color: "#7c1a4f",
                  borderColor: "#d46ebf",
                  borderRadius: 12,
                  userSelect: "text",
                }}
              >
                <ul style={{ marginBottom: 0 }}>
                  {errores.map((err, idx) => (
                    <li key={idx}>{err}</li>
                  ))}
                </ul>
              </Alert>
            )}
          </Card.Body>
        </Card>

        <div
          style={{
            textAlign: "center",
            marginTop: 40,
            color: "#6b63c9",
            fontSize: "1.1rem",
            userSelect: "none",
          }}
        >
          <p>
            Sube un archivo ZIP con los archivos DICOM de una tomografía axial computarizada.
            <br />
            El sistema procesará y almacenará automáticamente las imágenes para su análisis.
          </p>
        </div>
      </Container>
    </div>
  );
};

export default ImportarTomografia;
