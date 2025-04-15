import { useRef, useState } from "react";
import { Alert, Button, Card, Form } from "react-bootstrap";
import { Link } from "react-router-dom";
import { supabase } from "../supabase/client";

const Register = () => {
  const emailRef = useRef(null);
  const passwordRef = useRef(null);
  const confirmPasswordRef = useRef(null);
  const [errorMsg, setErrorMsg] = useState("");
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);

  const register = (email, password) =>
    supabase.auth.signUp({ email, password });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (
      !passwordRef.current?.value ||
      !emailRef.current?.value ||
      !confirmPasswordRef.current?.value
    ) {
      setErrorMsg("Please fill all the fields");
      return;
    }
    if (passwordRef.current.value !== confirmPasswordRef.current.value) {
      setErrorMsg("Passwords don't match");
      return;
    }
    try {
      setErrorMsg("");
      setLoading(true);
      
      // Obtener el username y agregar '@aea.com'
      let username = emailRef.current.value.trim();
      // Eliminar cualquier @ y dominio que haya podido ingresar el usuario
      username = username.split('@')[0];
      const userEmail = `${username}@aea.com`;

      const { data, error } = await register(
        userEmail,
        passwordRef.current.value
      );
      if (!error && data) {
        setMsg(
          "Registration Successful. Check your email to confirm your account"
        );
        // Limpiar el formulario después de registro exitoso
        emailRef.current.value = "";
        passwordRef.current.value = "";
        confirmPasswordRef.current.value = "";
      }
    } catch (error) {
      setErrorMsg("Error in Creating Account");
    }
    setLoading(false);
  };

  return (
    <div className="d-flex align-items-center justify-content-center min-vh-100 p-3 bg-light">
      <Card className="w-100 shadow" style={{ maxWidth: '400px' }}>
        <Card.Body className="p-4">
          <h2 className="text-center mb-4">Register</h2>
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3" id="email">
              <Form.Label>Username</Form.Label>
              <Form.Control 
                type="text" 
                ref={emailRef} 
                required 
                placeholder="Enter your username"
                onBlur={(e) => {
                  // Limpiar cualquier @ que el usuario pueda haber ingresado
                  if (e.target.value.includes('@')) {
                    e.target.value = e.target.value.split('@')[0];
                  }
                }}
              />
              <Form.Text className="text-muted">
                Your email will be username@aea.com
              </Form.Text>
            </Form.Group>
            <Form.Group className="mb-3" id="password">
              <Form.Label>Password</Form.Label>
              <Form.Control type="password" ref={passwordRef} required />
            </Form.Group>
            <Form.Group className="mb-3" id="confirm-password">
              <Form.Label>Confirm Password</Form.Label>
              <Form.Control type="password" ref={confirmPasswordRef} required />
            </Form.Group>
            {errorMsg && (
              <Alert
                variant="danger"
                onClose={() => setErrorMsg("")}
                dismissible
              >
                {errorMsg}
              </Alert>
            )}
            {msg && (
              <Alert variant="success" onClose={() => setMsg("")} dismissible>
                {msg}
              </Alert>
            )}
            <div className="text-center mt-2">
              <Button disabled={loading} type="submit" className="w-50">
                {loading ? 'Processing...' : 'Register'}
              </Button>
            </div>
          </Form>
          <div className="w-100 text-center mt-3">
            Already a User? <Link to={"/login"}>Login</Link>
          </div>
        </Card.Body>
      </Card>
    </div>
  );
};

export default Register;