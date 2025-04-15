import { Button } from "react-bootstrap";
import Container from "react-bootstrap/Container";
import Nav from "react-bootstrap/Nav";
import Navbar from "react-bootstrap/Navbar";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthProvider";

const NavBar = () => {
  const { auth, signOut, user } = useAuth();

  // Extrae el nombre de usuario del email (parte antes del @)
  const getUsername = () => {
    if (!user?.email) return "Usuario";
    return user.email.split("@")[0];
  };

  // Maneja el cierre de sesión
  const handleLogout = async (e) => {
    e.preventDefault();
    try {
      await signOut();
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
    }
  };

  return (
    <Navbar collapseOnSelect expand="lg" bg="dark" variant="dark" className="shadow">
      <Container fluid>
        <Navbar.Brand as={Link} to="/" className="me-4">
          {/* Puedes agregar tu logo aquí */}
          <span className="fw-bold">Sistema AEA</span>
        </Navbar.Brand>
        
        <Navbar.Toggle aria-controls="main-navbar" />
        
        <Navbar.Collapse id="main-navbar">
          {/* Menú principal */}
          <Nav className="me-auto">
            {auth ? (
              // Menú para usuarios autenticados
              <>
                <Nav.Link as={Link} to="/checklist-tinas" className="mx-2">
                  <Button variant="outline-light" size="sm" className="px-3">
                    <i className="bi bi-clipboard-check me-2"></i>
                    Checklist Tinas
                  </Button>
                </Nav.Link>
                <Nav.Link as={Link} to="/reporte-inspeccion" className="mx-2">
                  <Button variant="outline-light" size="sm" className="px-3">
                    <i className="bi bi-file-earmark-text me-2"></i>
                    Reportes
                  </Button>
                </Nav.Link>
              </>
            ) : (
              // Menú para usuarios no autenticados
              <Nav.Link as={Link} to="/login" className="mx-2">
                <Button variant="outline-primary" size="sm">
                  Iniciar Sesión
                </Button>
              </Nav.Link>
              /*
              Opción de registro comentada según requerimiento
              <Nav.Link as={Link} to="/register" className="mx-2">
                <Button variant="outline-secondary" size="sm">
                  Registrarse
                </Button>
              </Nav.Link>
              */
            )}
          </Nav>

          {/* Sección de usuario */}
          {auth && (
            <Nav className="align-items-center">
              <Navbar.Text className="me-3 text-light">
                <i className="bi bi-person-circle me-2"></i>
                <span className="fw-semibold">{getUsername()}</span>
              </Navbar.Text>
              <Button 
                variant="outline-danger" 
                onClick={handleLogout}
                size="sm"
                className="px-3"
              >
                <i className="bi bi-box-arrow-right me-2"></i>
                Salir
              </Button>
            </Nav>
          )}
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default NavBar;