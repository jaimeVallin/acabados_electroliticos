import { useEffect, useRef, useState } from "react";
import { Alert, Button, Card, Form, Spinner } from "react-bootstrap";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthProvider";
import { supabase } from '../supabase/client';

const Login = () => {
  const emailRef = useRef(null);
  const passwordRef = useRef(null);
  const [errorMsg, setErrorMsg] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  // Limpieza de sesión residual al cargar la página
  useEffect(() => {
    const cleanUpSession = async () => {
      try {
        await supabase.auth.signOut();
        localStorage.removeItem(`sb-${supabase.supabaseUrl}-auth-token`);
      } catch (error) {
        console.error("Error al limpiar sesión:", error);
      }
    };
    cleanUpSession();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setErrorMsg("");
      setLoading(true);
      
      // Validación de campos vacíos
      if (!passwordRef.current?.value || !emailRef.current?.value) {
        setErrorMsg("Por favor complete todos los campos");
        return;
      }

      // Formatear el email agregando @aea.com si no está presente
      let userEmail = emailRef.current.value.trim();
      if (!userEmail.endsWith('@aea.com')) {
        userEmail = userEmail.split('@')[0] + '@aea.com';
      }

      // Autenticación con Supabase
      const { error } = await supabase.auth.signInWithPassword({
        email: userEmail,
        password: passwordRef.current.value
      });

      if (error) {
        setErrorMsg(error.message || "Credenciales incorrectas");
      } else {
        navigate("/");
      }
    } catch (error) {
      setErrorMsg("Error al iniciar sesión");
      console.error("Error de autenticación:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="d-flex align-items-center justify-content-center min-vh-100 bg-light">
      <Card className="w-100 shadow-sm border-0" style={{ maxWidth: '450px' }}>
        <Card.Body className="p-4 p-md-5">
          <div className="text-center mb-4">
            <h2 className="fw-bold">Iniciar Sesión</h2>
            <p className="text-muted">Ingrese sus credenciales para acceder</p>
          </div>
          
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3" controlId="formEmail">
              <Form.Label>Usuario</Form.Label>
              <Form.Control 
                type="text" 
                ref={emailRef} 
                required 
                placeholder="Ingrese su nombre de usuario"
                onBlur={(e) => {
                  // Limpiar cualquier @ que el usuario haya ingresado
                  if (e.target.value.includes('@')) {
                    e.target.value = e.target.value.split('@')[0];
                  }
                }}
              />
              <Form.Text className="text-muted">
                Se agregará automáticamente @aea.com
              </Form.Text>
            </Form.Group>

            <Form.Group className="mb-4" controlId="formPassword">
              <Form.Label>Contraseña</Form.Label>
              <Form.Control 
                type="password" 
                ref={passwordRef} 
                required 
                placeholder="Ingrese su contraseña" 
              />
            </Form.Group>

            {errorMsg && (
              <Alert 
                variant="danger" 
                onClose={() => setErrorMsg("")} 
                dismissible
                className="mt-3"
              >
                {errorMsg}
              </Alert>
            )}

            <div className="d-grid gap-2 mt-4">
              <Button 
                variant="primary" 
                type="submit" 
                disabled={loading}
                size="lg"
              >
                {loading ? (
                  <>
                    <Spinner
                      as="span"
                      animation="border"
                      size="sm"
                      role="status"
                      aria-hidden="true"
                      className="me-2"
                    />
                    Iniciando...
                  </>
                ) : (
                  "Iniciar Sesión"
                )}
              </Button>
            </div>
          </Form>

          <div className="text-center mt-4 pt-3 border-top">
            <Link to="/passwordreset" className="text-decoration-none">
              ¿Olvidó su contraseña?
            </Link>
          </div>

          {/*
          <div className="text-center mt-3">
            ¿Nuevo usuario?{' '}
            <Link to="/register" className="fw-bold text-decoration-none">
              Regístrese aquí
            </Link>
          </div>
          */}
        </Card.Body>
      </Card>
    </div>
  );
};

export default Login;