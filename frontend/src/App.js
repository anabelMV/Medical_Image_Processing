import React from "react";
import { BrowserRouter as Router, Route, Routes, Navigate } from "react-router-dom";
import AppNavbar from "./components/AppNavbar";
import HomePage from "./components/HomePage";
import PacientesList from "./components/PacientesList";
import TomografiasPacientePage from "./components/TomografiasPacientePage";
import ImportarTomografia from "./components/ImportarTomografia";
import ArchivosNiftiPage from "./pages/ArchivosNiftiPage";
import EstudiosNiftiPage from "./pages/EstudiosNiftPage";

// Si tienes otras páginas de estudios, puedes importarlas aquí

function App() {
  return (
    <Router>
      <AppNavbar />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/importar" element={<ImportarTomografia />} />
        <Route path="/pacientes" element={<PacientesList />} />
        {/* Nueva ruta: página de tomografías de un paciente */}
        <Route path="/pacientes/:id/tomografias" element={<TomografiasPacientePage />} />
        <Route path="/pacientes/:id/nifti" element={<ArchivosNiftiPage />} />
        <Route path="/estudios-nifti" element={<EstudiosNiftiPage />} />
        
        {/* Redirección por defecto a Home si no existe la ruta */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}

export default App;
