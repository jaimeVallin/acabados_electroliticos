import { useEffect } from 'react';
import { Container } from "react-bootstrap";
import { Route, Routes } from "react-router-dom";
import AuthRoute from "./components/AuthRoute";
import NavBar from "./components/Navbar";
import Home from "./pages/Home";
import Login from "./pages/Login";
import PasswordReset from "./pages/PasswordReset";
import Register from "./pages/Register";
import UpdatePassword from "./pages/UpdatePassword";
import CheckListTinas from './pages/CheckListTinas';
import ReporteInspeccion from './pages/ReporteInspeccion';
// import ReporteInspeccion from './components/ReporteInspeccion/Reporte';
import { supabase } from './supabase/client';

const App = () => {
  // Efecto para manejar el cierre de sesión al cerrar la aplicación
  useEffect(() => {
    const handleBeforeUnload = async () => {
      try {
        await supabase.auth.signOut();
        // Limpieza de tokens de autenticación
        localStorage.removeItem(`sb-${supabase.supabaseUrl}-auth-token`);
        sessionStorage.removeItem(`sb-${supabase.supabaseUrl}-auth-token`);
      } catch (error) {
        console.error("Error al cerrar sesión:", error);
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, []);

  return (
    <>
      <NavBar />
      <Container
        className="d-flex align-items-center justify-content-center"
        style={{ minHeight: "100vh", minWidth: "100vw" }}>
        <div className="w-100" style={{ maxWidth: "700px" }}>
          <Routes>
            {/* Rutas protegidas */}
            <Route element={<AuthRoute />}>
              <Route path="/" element={<ReporteInspeccion />} />
              <Route path="/checklist-tinas" element={<CheckListTinas />} />
              <Route path="/reporte-inspeccion" element={<ReporteInspeccion />} />
            </Route>
            
            {/* Rutas públicas */}
            <Route path="/register" element={<Register />} />
            <Route path="/login" element={<Login />} />
            <Route path="/passwordreset" element={<PasswordReset />} />
            <Route path="/update-password" element={<UpdatePassword />} />
            
            
          </Routes>
        </div>
      </Container>
    </>
  );
};

export default App;