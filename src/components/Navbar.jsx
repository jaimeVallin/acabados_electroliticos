import { Button } from "react-bootstrap";
import Container from "react-bootstrap/Container";
import Nav from "react-bootstrap/Nav";
import Navbar from "react-bootstrap/Navbar";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthProvider";


const NavBar = () => {
  const { auth, signOut, user } = useAuth();

  // Función para extraer el nombre antes del @
  const getUsername = () => {
    if (!user?.email) return "Usuario";
    return user.email.split("@")[0];
  };

  const handleLogout = async (e) => {
    e.preventDefault();
    try {
      const { error } = await signOut();
      console.log(error);
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <Navbar collapseOnSelect expand="lg" bg="dark" variant="dark">
      <Container>
        <Navbar.Toggle aria-controls="responsive-navbar-nav" />
        <Navbar.Collapse id="responsive-navbar-nav">
          <Nav className="me-auto">
            {!auth && (
              <>
                <Nav.Link as={Link} to="/login">
                  Iniciar Sesión
                </Nav.Link>
                <Nav.Link as={Link} to="/register">
                  Registrarse
                </Nav.Link>
              </>
            )}
            {auth && (
              <>
                <Nav.Link as={Link} to="/checklist-tinas">
                  <Button variant="outline-light" size="sm">
                    Checklist de Tinas
                  </Button>
                </Nav.Link>
                <Nav.Link as={Link} to="/reporte-inspeccion">
                  <Button variant="outline-light" size="sm">
                    Reporte de Inspección
                  </Button>
                </Nav.Link>
              </>
            )}
          </Nav>
          <Nav>
            {auth && (
              <>
                <Navbar.Text className="me-3">
                  <strong>{getUsername()}</strong>
                </Navbar.Text>
                <Button variant="outline-danger" onClick={handleLogout}>
                  Cerrar Sesión
                </Button>
              </>
            )}
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default NavBar;
