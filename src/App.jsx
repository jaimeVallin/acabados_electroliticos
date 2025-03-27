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



const App = () => {
  return (
    <>
      <NavBar />
      <Container
        className="d-flex align-items-center justify-content-center"
        style={{ minHeight: "100vh", minWidth: "100vw" }}>
        <div className="w-100" style={{ maxWidth: "700px" }}>
          <Routes>
            <Route element={<AuthRoute />}>
              <Route path="/" element={<CheckListTinas />} />
              <Route path="/checklist-tinas" element={<CheckListTinas />} />
              <Route path="/reporte-inspeccion" element={<ReporteInspeccion />} />
            </Route>
            <Route path="/register" element={<Register />} />
            <Route path="/login" element={<Login />} />
            <Route path="/passwordreset" element={<PasswordReset />} />
            <Route path="/update-password" element={<UpdatePassword />} />
            {/* Para ir al CheckListTinas */}
            <Route path="/checklist-tinas" element={<CheckListTinas />} />
            {/* Para ir al inspección */}
            <Route path="/reporte-inspeccion" element={<ReporteInspeccion />} />
          </Routes>
        </div>
      </Container>
    </>
  );
};

export default App;