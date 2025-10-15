import React, { useEffect, useState } from "react";
import {
  Container,
  Table,
  Button,
  Spinner,
  Alert,
  Modal,
  Form,
} from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import api from "../utils/axios";

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

const PacientesList = () => {
  const [pacientes, setPacientes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [showEdit, setShowEdit] = useState(false);
  const [editData, setEditData] = useState({});
  const [formErrors, setFormErrors] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    fetchPacientes();
    // eslint-disable-next-line
  }, []);

  const fetchPacientes = async () => {
    setLoading(true);
    setError("");
    setSuccessMsg("");
    try {
      const res = await api.get("/api/pacientes/");
      setPacientes(res.data);
    } catch (err) {
      setError("Error al cargar los pacientes.");
    }
    setLoading(false);
  };

  const abrirEditar = (paciente) => {
    const { nombre, apellidos } = parseNombreDicom(paciente.nombre);
    setEditData({
      ...paciente,
      nombre,
      apellidos,
      hospital: paciente.hospital || "",
      fecha_nacimiento: paciente.fecha_nacimiento || "",
      sexo: paciente.sexo || "",
      edad: paciente.edad || "",
    });
    setFormErrors({});
    setShowEdit(true);
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditData((prev) => ({ ...prev, [name]: value }));

    // Validar campo en tiempo real
    validarCampo(name, value);
  };

  const validarCampo = (name, value) => {
    let error = "";

    if (["nombre", "apellidos", "hospital", "sexo"].includes(name)) {
      if (!value.trim()) error = "Este campo es obligatorio.";
    }

    if (name === "fecha_nacimiento") {
      if (!value.trim()) {
        error = "Este campo es obligatorio.";
      } else if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
        error = "Formato de fecha inválido (YYYY-MM-DD).";
      } else {
        const date = new Date(value);
        if (isNaN(date.getTime())) error = "Fecha inválida.";
      }
    }

    if (name === "edad") {
      if (!value.trim()) {
        error = "Este campo es obligatorio.";
      } else if (!/^\d+$/.test(value) || Number(value) <= 0 || Number(value) > 120) {
        error = "Edad debe ser un número entre 1 y 120.";
      }
    }

    setFormErrors((prev) => ({ ...prev, [name]: error }));
  };

  const validarFormulario = () => {
    const campos = ["nombre", "apellidos", "hospital", "sexo", "fecha_nacimiento", "edad"];
    let valid = true;
    let nuevosErrores = {};

    campos.forEach((campo) => {
      const valor = editData[campo] || "";
      validarCampo(campo, valor);
      if (!valor.trim()) {
        nuevosErrores[campo] = "Este campo es obligatorio.";
        valid = false;
      }
    });

    setFormErrors(nuevosErrores);
    return valid && Object.values(formErrors).every((e) => e === "");
  };

  const guardarEdicion = async () => {
    if (!validarFormulario()) return;

    setLoading(true);
    setError("");
    setSuccessMsg("");
    try {
      const nombreDicom =
        (editData.apellidos || "").toUpperCase() +
        "^" +
        (editData.nombre || "").toUpperCase();

      await api.put(`/api/pacientes/${editData.id}/`, {
        ...editData,
        nombre: nombreDicom,
      });
      setShowEdit(false);
      setSuccessMsg("Paciente actualizado correctamente.");
      await fetchPacientes();
    } catch {
      setError("Error al guardar los datos.");
    }
    setLoading(false);
  };

  const eliminarPaciente = async (paciente) => {
    if (
      window.confirm(
        `¿Seguro que deseas eliminar al paciente ${paciente.nombre}? Esta acción no se puede deshacer.`
      )
    ) {
      setLoading(true);
      setError("");
      setSuccessMsg("");
      try {
        await api.delete(`/api/pacientes/${paciente.id}/`);
        setSuccessMsg("Paciente eliminado correctamente.");
        await fetchPacientes();
      } catch {
        setError("Error al eliminar el paciente.");
      }
      setLoading(false);
    }
  };

  const verTomografias = (paciente) => {
    navigate(`/pacientes/${paciente.id}/tomografias`);
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
        <h2
          style={{
            color: "#7c5eff",
            fontWeight: 700,
            marginBottom: 32,
            userSelect: "none",
          }}
        >
          Pacientes
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
        {successMsg && (
          <Alert
            variant="success"
            style={{ borderRadius: 12, userSelect: "none" }}
            dismissible
            onClose={() => setSuccessMsg("")}
          >
            {successMsg}
          </Alert>
        )}
        {loading ? (
          <div style={{ textAlign: "center", marginTop: 60 }}>
            <Spinner animation="border" variant="primary" />
          </div>
        ) : pacientes.length === 0 ? (
          <div
            style={{
              textAlign: "center",
              marginTop: 60,
              color: "#6b63c9",
              userSelect: "none",
            }}
          >
            No hay pacientes registrados.
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <Table
              bordered
              hover
              responsive
              style={{
                background: "rgba(124, 94, 255, 0.1)",
                color: "#4a4a6a",
                borderColor: "#7c5eff",
                borderRadius: 16,
                tableLayout: "fixed",
                wordBreak: "break-word",
                userSelect: "text",
                minWidth: 750,
              }}
            >
              <thead>
                <tr>
                  <th style={{ width: "13%" }}>Nombre</th>
                  <th style={{ width: "17%" }}>Apellidos</th>
                  <th style={{ width: "17%" }}>Hospital</th>
                  <th style={{ width: "8%" }}>Edad</th>
                  <th style={{ width: "13%" }}>Fecha Nacimiento</th>
                  <th style={{ width: "8%" }}>Sexo</th>
                  <th style={{ width: "14%" }}>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {pacientes.map((p) => {
                  const { nombre, apellidos } = parseNombreDicom(p.nombre);
                  return (
                    <tr key={p.id} style={{ userSelect: "text" }}>
                      <td style={{ overflow: "hidden", textOverflow: "ellipsis" }}>
                        {nombre}
                      </td>
                      <td style={{ overflow: "hidden", textOverflow: "ellipsis" }}>
                        {apellidos}
                      </td>
                      <td style={{ overflow: "hidden", textOverflow: "ellipsis" }}>
                        {p.hospital || "-"}
                      </td>
                      <td>{p.edad || "-"}</td>
                      <td>{p.fecha_nacimiento ? p.fecha_nacimiento : "-"}</td>
                      <td>{p.sexo || "-"}</td>
                      <td>
                        <div
                          style={{
                            display: "flex",
                            flexWrap: "wrap",
                            gap: 8,
                            justifyContent: "center",
                          }}
                        >
                          <Button
                            variant="outline-primary"
                            size="sm"
                            style={{
                              borderRadius: 12,
                              fontWeight: 600,
                              flex: "1 1 auto",
                              minWidth: 90,
                              transition:
                                "background-color 0.3s ease, color 0.3s ease",
                            }}
                            onClick={() => abrirEditar(p)}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.backgroundColor = "#7c5eff";
                              e.currentTarget.style.color = "#fff";
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.backgroundColor = "transparent";
                              e.currentTarget.style.color = "#0d6efd";
                            }}
                          >
                            Editar
                          </Button>
                          <Button
                            variant="outline-primary"
                            size="sm"
                            style={{
                              borderRadius: 12,
                              fontWeight: 600,
                              flex: "1 1 auto",
                              minWidth: 90,
                              transition:
                                "background-color 0.3s ease, color 0.3s ease",
                            }}
                            onClick={() => verTomografias(p)}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.backgroundColor = "#7c5eff";
                              e.currentTarget.style.color = "#fff";
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.backgroundColor = "transparent";
                              e.currentTarget.style.color = "#0d6efd";
                            }}
                          >
                            Ver Tomografías
                          </Button>
                          <Button
                            variant="outline-primary"
                            size="sm"
                            style={{
                              borderRadius: 12,
                              fontWeight: 600,
                              flex: "1 1 auto",
                              minWidth: 90,
                              transition:
                                "background-color 0.3s ease, color 0.3s ease",
                            }}
                            onClick={() => navigate(`/pacientes/${p.id}/nifti`)}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.backgroundColor = "#7c5eff";
                              e.currentTarget.style.color = "#fff";
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.backgroundColor = "transparent";
                              e.currentTarget.style.color = "#0d6efd";
                            }}
                          >
                            Archivos NIfTI
                          </Button>
                          <Button
                            variant="outline-danger"
                            size="sm"
                            style={{
                              borderRadius: 12,
                              fontWeight: 600,
                              flex: "1 1 auto",
                              minWidth: 90,
                              transition:
                                "background-color 0.3s ease, color 0.3s ease",
                            }}
                            onClick={() => eliminarPaciente(p)}
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
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </Table>
          </div>
        )}

        {/* Modal para editar paciente */}
        <Modal
          show={showEdit}
          onHide={() => setShowEdit(false)}
          centered
          backdrop="static"
          keyboard={false}
        >
          <Modal.Header closeButton>
            <Modal.Title>Editar Paciente</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form noValidate>
              <Form.Group className="mb-3" controlId="formNombre">
                <Form.Label>Nombre</Form.Label>
                <Form.Control
                  name="nombre"
                  value={editData.nombre || ""}
                  onChange={handleEditChange}
                  placeholder="Nombre"
                  autoComplete="off"
                  isInvalid={!!formErrors.nombre}
                />
                <Form.Control.Feedback type="invalid">
                  {formErrors.nombre}
                </Form.Control.Feedback>
              </Form.Group>
              <Form.Group className="mb-3" controlId="formApellidos">
                <Form.Label>Apellidos</Form.Label>
                <Form.Control
                  name="apellidos"
                  value={editData.apellidos || ""}
                  onChange={handleEditChange}
                  placeholder="Apellidos"
                  autoComplete="off"
                  isInvalid={!!formErrors.apellidos}
                />
                <Form.Control.Feedback type="invalid">
                  {formErrors.apellidos}
                </Form.Control.Feedback>
              </Form.Group>
              <Form.Group className="mb-3" controlId="formHospital">
                <Form.Label>Hospital</Form.Label>
                <Form.Control
                  name="hospital"
                  value={editData.hospital || ""}
                  onChange={handleEditChange}
                  placeholder="Hospital"
                  autoComplete="off"
                  isInvalid={!!formErrors.hospital}
                />
                <Form.Control.Feedback type="invalid">
                  {formErrors.hospital}
                </Form.Control.Feedback>
              </Form.Group>
              <Form.Group className="mb-3" controlId="formEdad">
                <Form.Label>Edad</Form.Label>
                <Form.Control
                  name="edad"
                  value={editData.edad || ""}
                  onChange={handleEditChange}
                  placeholder="Edad"
                  autoComplete="off"
                  isInvalid={!!formErrors.edad}
                />
                <Form.Control.Feedback type="invalid">
                  {formErrors.edad}
                </Form.Control.Feedback>
              </Form.Group>
              <Form.Group className="mb-3" controlId="formFechaNacimiento">
                <Form.Label>Fecha Nacimiento</Form.Label>
                <Form.Control
                  type="text"
                  name="fecha_nacimiento"
                  value={editData.fecha_nacimiento || ""}
                  onChange={handleEditChange}
                  placeholder="YYYY-MM-DD"
                  autoComplete="off"
                  isInvalid={!!formErrors.fecha_nacimiento}
                />
                <Form.Control.Feedback type="invalid">
                  {formErrors.fecha_nacimiento}
                </Form.Control.Feedback>
              </Form.Group>
              <Form.Group className="mb-3" controlId="formSexo">
                <Form.Label>Sexo</Form.Label>
                <Form.Control
                  name="sexo"
                  value={editData.sexo || ""}
                  onChange={handleEditChange}
                  placeholder="Sexo"
                  autoComplete="off"
                  isInvalid={!!formErrors.sexo}
                />
                <Form.Control.Feedback type="invalid">
                  {formErrors.sexo}
                </Form.Control.Feedback>
              </Form.Group>
            </Form>
          </Modal.Body>
          <Modal.Footer>
            <Button
              variant="outline-secondary"
              onClick={() => setShowEdit(false)}
              style={{ borderRadius: 12, fontWeight: 600 }}
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button
              variant="primary"
              onClick={guardarEdicion}
              style={{ borderRadius: 12, fontWeight: 600 }}
              disabled={loading || Object.values(formErrors).some((e) => e)}
            >
              {loading ? (
                <>
                  <Spinner animation="border" size="sm" style={{ marginRight: 8 }} />
                  Guardando...
                </>
              ) : (
                "Guardar"
              )}
            </Button>
          </Modal.Footer>
        </Modal>
      </Container>
    </div>
  );
};

export default PacientesList;
