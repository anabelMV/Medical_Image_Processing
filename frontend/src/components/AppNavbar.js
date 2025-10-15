import React from "react";
import { Navbar, Nav, Container } from "react-bootstrap";
import { Link, useLocation } from "react-router-dom";
import { FaFileImport, FaUserInjured, FaFolderOpen } from "react-icons/fa";

const AppNavbar = () => {
  const location = useLocation();

  // Determina si estamos en la página de inicio para cambiar el estilo
  const isHomePage = location.pathname === "/";

  // Colores base para el navbar y enlaces
  const baseBgColor = isHomePage ? "rgba(255, 255, 255, 0.8)" : "linear-gradient(90deg, #e6e8ff 0%, #cfcfff 100%)";
  const baseTextColor = "#4a4a6a";
  const activeTextColor = "#7c5eff";
  const inactiveTextColor = "#a0a0c0";

  // Estilos para Nav.Link
  const navLinkStyle = (path) => ({
    color: location.pathname === path ? activeTextColor : baseTextColor,
    fontWeight: location.pathname === path ? 600 : 400,
    marginRight: 15,
    borderRadius: 12,
    padding: "6px 12px",
    transition: "color 0.3s ease, font-weight 0.3s ease",
    display: "flex",
    alignItems: "center",
    gap: "8px",
    cursor: "pointer",
    userSelect: "none"
  });

  return (
    <Navbar
      expand="lg"
      style={{
        background: baseBgColor,
        boxShadow: isHomePage ? "none" : "0 2px 6px rgba(0,0,0,0.1)",
        position: isHomePage ? "absolute" : "relative",
        width: "100%",
        zIndex: 1000,
        borderRadius: 16,
        backdropFilter: isHomePage ? "blur(8px)" : "none"
      }}
      variant="light"
    >
      <Container>
        <Navbar.Brand
          as={Link}
          to="/"
          style={{
            fontWeight: 700,
            color: "#7c5eff",
            fontSize: "1.6rem",
            userSelect: "none",
            transition: "color 0.3s ease",
            cursor: "pointer"
          }}
          onMouseEnter={e => e.currentTarget.style.color = "#5a3db9"}
          onMouseLeave={e => e.currentTarget.style.color = "#7c5eff"}
        >
          HSDC Studio
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="ms-auto">
            <Nav.Link
              as={Link}
              to="/importar"
              style={navLinkStyle("/importar")}
              onMouseEnter={e => e.currentTarget.style.color = activeTextColor}
              onMouseLeave={e => e.currentTarget.style.color = location.pathname === "/importar" ? activeTextColor : baseTextColor}
            >
              <FaFileImport size={18} />
              Importar
            </Nav.Link>
            <Nav.Link
              as={Link}
              to="/pacientes"
              style={navLinkStyle("/pacientes")}
              onMouseEnter={e => e.currentTarget.style.color = activeTextColor}
              onMouseLeave={e => e.currentTarget.style.color = location.pathname === "/pacientes" ? activeTextColor : baseTextColor}
            >
              <FaUserInjured size={18} />
              Pacientes
            </Nav.Link>
            <Nav.Link
              as={Link}
              to="/estudios-nifti"
              style={navLinkStyle("/estudios-nifti")}
              onMouseEnter={e => e.currentTarget.style.color = activeTextColor}
              onMouseLeave={e => e.currentTarget.style.color = location.pathname === "/estudios-nifti" ? activeTextColor : baseTextColor}
            >
              <FaFolderOpen size={18} />
              Estudios
            </Nav.Link>
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default AppNavbar;
