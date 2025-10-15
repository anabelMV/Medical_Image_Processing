import React from "react";
import { Container, Row, Col, Card, Button } from "react-bootstrap";
import { useNavigate } from "react-router-dom";

const curiosidades = [
  "El hematoma subdural crónico (HSDC) afecta principalmente a adultos mayores de 65 años con una incidencia de 5-14 casos por 100,000 habitantes/año.",
  "La tomografía axial computarizada (TAC) es fundamental para confirmar el diagnóstico y planificar el tratamiento del HSDC.",
  "La inteligencia artificial mejora hasta un 40% la precisión en la detección de hematomas comparado con la evaluación humana tradicional.",
  "El cálculo volumétrico tradicional mediante la fórmula ABC/2 presenta una variabilidad interobservador del 15-20%, que puede derivar en errores de planificación.",
  "La aplicación de algoritmos de IA en el procesamiento de imágenes radiológicas permite una segmentación más precisa y eficiente del HSDC.",
  "La selección del tratamiento quirúrgico o conservador depende de variables como el volumen del hematoma y el desplazamiento de la línea media."
];

const HomePage = () => {
  const navigate = useNavigate();

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #f5f7ff 0%, #dbe4ff 100%)",
        color: "#4a4a6a",
        paddingTop: 120,
        paddingBottom: 60,
        fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif"
      }}
    >
      <Container>
        <Row className="justify-content-center mb-5">
          <Col md={8} className="text-center">
            <h1
              style={{
                fontWeight: 700,
                fontSize: "3.2rem",
                color: "#7c5eff",
                userSelect: "none"
              }}
            >
              HSDC Studio
            </h1>
            <p
              style={{
                fontSize: "1.3rem",
                color: "#6b63c9",
                marginTop: 20,
                lineHeight: 1.5
              }}
            >
              Plataforma inteligente para el análisis y gestión de tomografías DICOM
              en hematomas subdurales crónicos.
            </p>
            <div className="mt-4">
              <Button
                variant="outline-primary"
                size="lg"
                style={{
                  borderRadius: 12,
                  borderColor: "#7c5eff",
                  color: "#7c5eff",
                  fontWeight: 600,
                  marginRight: 15,
                  transition: "all 0.3s ease",
                  userSelect: "none"
                }}
                onClick={() => navigate("/pacientes")}
                onMouseEnter={e => {
                  e.currentTarget.style.backgroundColor = "#7c5eff";
                  e.currentTarget.style.color = "#fff";
                  e.currentTarget.style.borderColor = "#7c5eff";
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.backgroundColor = "transparent";
                  e.currentTarget.style.color = "#7c5eff";
                  e.currentTarget.style.borderColor = "#7c5eff";
                }}
              >
                Explorar Pacientes
              </Button>
              <Button
                variant="primary"
                size="lg"
                style={{
                  borderRadius: 12,
                  backgroundColor: "#7c5eff",
                  borderColor: "#7c5eff",
                  color: "#fff",
                  fontWeight: 600,
                  transition: "background-color 0.3s ease",
                  userSelect: "none"
                }}
                onClick={() => navigate("/importar")}
                onMouseEnter={e => {
                  e.currentTarget.style.backgroundColor = "#5a3db9";
                  e.currentTarget.style.borderColor = "#5a3db9";
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.backgroundColor = "#7c5eff";
                  e.currentTarget.style.borderColor = "#7c5eff";
                }}
              >
                Importar DICOM
              </Button>
            </div>
          </Col>
        </Row>

        <Row className="justify-content-center mt-5">
          <Col md={10}>
            <h3 style={{ color: "#6b63c9", marginBottom: 25, userSelect: "none" }}>
              Sobre el HSDC
            </h3>
            <Row>
              {curiosidades.map((curio, idx) => (
                <Col md={6} lg={4} key={idx} className="mb-4">
                  <Card
                    style={{
                      background: "rgba(124, 94, 255, 0.1)",
                      border: "1px solid #7c5eff",
                      color: "#4a4a6a",
                      minHeight: 160,
                      borderRadius: 16,
                      transition: "transform 0.3s ease, box-shadow 0.3s ease",
                      cursor: "default",
                      userSelect: "text"
                    }}
                    className="h-100"
                    onMouseOver={(e) => {
                      e.currentTarget.style.transform = "translateY(-6px)";
                      e.currentTarget.style.boxShadow = "0 12px 24px rgba(124, 94, 255, 0.2)";
                    }}
                    onMouseOut={(e) => {
                      e.currentTarget.style.transform = "translateY(0)";
                      e.currentTarget.style.boxShadow = "0 5px 15px rgba(124, 94, 255, 0.1)";
                    }}
                  >
                    <Card.Body className="d-flex align-items-center">
                      <Card.Text style={{ fontSize: "1.05rem", lineHeight: 1.4 }}>
                        {curio}
                      </Card.Text>
                    </Card.Body>
                  </Card>
                </Col>
              ))}
            </Row>
          </Col>
        </Row>

        <Row className="justify-content-center mt-5">
          <Col md={8} className="text-center">
            <p style={{ color: "#6b63c9", fontSize: "1.1rem", userSelect: "none" }}>
              Proyecto de apoyo al diagnóstico y tratamiento del hematoma subdural crónico,
              integrando ciencia, salud e inteligencia artificial.
            </p>
            <p
              style={{
                color: "#5a3db9",
                fontSize: "0.9rem",
                marginTop: 20,
                userSelect: "none"
              }}
            >
              © 2025 HSDC Studio | Universidad de Camagüey
            </p>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default HomePage;
