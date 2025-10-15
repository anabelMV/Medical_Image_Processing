import React, { useEffect, useState } from "react";
import { Container, Table, Button, Spinner, Alert } from "react-bootstrap";
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

const agruparPorPaciente = (archivos) => {
  const pacientes = {};
  archivos.forEach((archivo) => {
    const nombrePaciente = archivo.paciente
      ? (() => {
          const parsed = parseNombreDicom(archivo.paciente.nombre);
          return `${parsed.nombre} ${parsed.apellidos} `.trim();
        })()
      : "Sin paciente";
    if (!pacientes[nombrePaciente]) pacientes[nombrePaciente] = [];
    pacientes[nombrePaciente].push(archivo);
  });
  return pacientes;
};

const EstudiosNiftiPage = () => {
  const [archivos, setArchivos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [procesando, setProcesando] = useState({});
  const [mensajeExito, setMensajeExito] = useState("");

  useEffect(() => {
    fetchArchivos();
    // eslint-disable-next-line
  }, []);

  const fetchArchivos = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await api.get(`/api/archivos-nifti/`);
      setArchivos(res.data);
    } catch (err) {
      setError("Error al cargar los archivos NIfTI.");
    }
    setLoading(false);
  };

  const ejecutarProceso = async (niftiId, tipoProceso) => {
    setProcesando((prev) => ({ ...prev, [niftiId]: true }));
    setError("");
    setMensajeExito("");
    try {
      await api.post(
        `/api/archivos-nifti/${niftiId}/procesar/`,
        { tipo_proceso: tipoProceso },
        { headers: { "Content-Type": "application/json" } }
      );
      setMensajeExito(
        `Proceso "${
          tipoProceso === "reduccion_ruido"
            ? "Reducción de Ruido"
            : "Remoción de Hueso"
        }" ejecutado con éxito.`
      );
      await fetchArchivos();
    } catch (err) {
      const msg = err.response?.data?.error || "Error al ejecutar el proceso";
      setError(msg);
    }
    setProcesando((prev) => ({ ...prev, [niftiId]: false }));
  };

  const eliminarArchivo = async (archivoId) => {
    if (
      !window.confirm(
        "¿Seguro que deseas eliminar este archivo NIfTI? Esta acción no se puede deshacer."
      )
    )
      return;
    setError("");
    setMensajeExito("");
    try {
      await api.delete(`/api/archivos-nifti/${archivoId}/`);
      setArchivos((prev) => prev.filter((a) => a.id !== archivoId));
    } catch {
      setError("Error al eliminar el archivo.");
    }
  };

  const archivosPorPaciente = agruparPorPaciente(archivos);

  return (
    <Container
      style={{
        marginTop: 56,
        fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
        color: "#4a4a6a",
      }}
    >
      <h2
        style={{
          color: "#7c5eff",
          fontWeight: 700,
          marginBottom: 24,
          userSelect: "none",
        }}
      >
        Estudios NIfTI por Paciente
      </h2>

      {error && (
        <Alert
          variant="danger"
          onClose={() => setError("")}
          dismissible
          style={{ borderRadius: 12, userSelect: "none" }}
        >
          {error}
        </Alert>
      )}

      {mensajeExito && (
        <Alert
          variant="success"
          onClose={() => setMensajeExito("")}
          dismissible
          style={{ borderRadius: 12, userSelect: "none" }}
        >
          {mensajeExito}
        </Alert>
      )}

      {loading ? (
        <div style={{ textAlign: "center", userSelect: "none" }}>
          <Spinner animation="border" variant="primary" />
        </div>
      ) : Object.keys(archivosPorPaciente).length === 0 ? (
        <p style={{ color: "#6b63c9", userSelect: "none" }}>
          No hay archivos NIfTI registrados.
        </p>
      ) : (
        Object.entries(archivosPorPaciente).map(
          ([nombrePaciente, archivosPaciente]) => (
            <div key={nombrePaciente} style={{ marginBottom: 40 }}>
              <h4
                style={{
                  color: "#6b63c9",
                  marginBottom: 16,
                  userSelect: "none",
                  fontWeight: 700,
                  borderBottom: "2px solid #dbe4ff",
                  paddingBottom: 4,
                  letterSpacing: 0.5,
                }}
              >
                {nombrePaciente}
              </h4>
              <Table
                bordered
                hover
                responsive
                style={{
                  background: "rgba(124, 94, 255, 0.08)",
                  borderRadius: 16,
                  borderColor: "#7c5eff",
                  color: "#4a4a6a",
                  userSelect: "text",
                  minWidth: 700,
                }}
              >
                <thead>
                  <tr>
                    <th>Fecha subida</th>
                    <th>Descripción</th>
                    <th>Archivo NIfTI</th>
                    <th>Procesos</th>
                    <th>Resultados</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {archivosPaciente.map((archivo) => {
                    const urlRuido = archivo.resultados?.find(
                      (r) => r.tipo_proceso === "reduccion_ruido"
                    )?.archivo_resultado;
                    const urlHueso = archivo.resultados?.find(
                      (r) => r.tipo_proceso === "remocion_hueso"
                    )?.archivo_resultado;
                    return (
                      <tr key={archivo.id}>
                        <td>{new Date(archivo.fecha_subida).toLocaleString()}</td>
                        <td>{archivo.descripcion || "-"}</td>
                        <td>
                          <a
                            href={getUrlCompleta(archivo.archivo)}
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
                            Descargar
                          </a>
                        </td>
                        <td>
                          <Button
                            size="sm"
                            variant="primary"
                            disabled={procesando[archivo.id]}
                            onClick={() =>
                              ejecutarProceso(archivo.id, "reduccion_ruido")
                            }
                            style={{
                              marginRight: 5,
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
                                e.currentTarget.style.backgroundColor = "#0d6efd";
                                e.currentTarget.style.borderColor = "#0d6efd";
                                e.currentTarget.style.color = "#fff";
                              }
                            }}
                          >
                            {procesando[archivo.id] ? (
                              <Spinner as="span" animation="border" size="sm" />
                            ) : (
                              "Reducir Ruido"
                            )}
                          </Button>
                          <Button
                            size="sm"
                            variant="secondary"
                            disabled={procesando[archivo.id]}
                            onClick={() =>
                              ejecutarProceso(archivo.id, "remocion_hueso")
                            }
                            style={{
                              borderRadius: 12,
                              fontWeight: 600,
                              userSelect: "none",
                              transition: "background-color 0.3s ease",
                            }}
                            onMouseEnter={(e) => {
                              if (!e.currentTarget.disabled) {
                                e.currentTarget.style.backgroundColor = "#6c757d";
                                e.currentTarget.style.borderColor = "#6c757d";
                                e.currentTarget.style.color = "#fff";
                              }
                            }}
                            onMouseLeave={(e) => {
                              if (!e.currentTarget.disabled) {
                                e.currentTarget.style.backgroundColor = "#6e757d";
                                e.currentTarget.style.borderColor = "#6e757d";
                                e.currentTarget.style.color = "#fff";
                              }
                            }}
                          >
                            {procesando[archivo.id] ? (
                              <Spinner as="span" animation="border" size="sm" />
                            ) : (
                              "Remover Hueso"
                            )}
                          </Button>
                        </td>
                        <td>
                          {urlRuido && (
                            <a
                              href={getUrlCompleta(urlRuido)}
                              target="_blank"
                              rel="noopener noreferrer"
                              style={{ marginRight: 10, color: "#7c5eff" }}
                            >
                              Descargar Ruido Reducido
                            </a>
                          )}
                          {urlHueso && (
                            <a
                              href={getUrlCompleta(urlHueso)}
                              target="_blank"
                              rel="noopener noreferrer"
                              style={{ color: "#7c5eff" }}
                            >
                              Descargar Hueso Removido
                            </a>
                          )}
                        </td>
                        <td>
                          <Button
                            size="sm"
                            variant="outline-danger"
                            onClick={() => eliminarArchivo(archivo.id)}
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
                    );
                  })}
                </tbody>
              </Table>
            </div>
          )
        )
      )}
    </Container>
  );
};

export default EstudiosNiftiPage;
