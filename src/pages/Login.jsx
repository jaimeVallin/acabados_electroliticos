import { useEffect, useRef, useState } from "react";
import { Alert, Button, Card, Form } from "react-bootstrap";
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

  // Limpieza de sesión residual al cargar la página de login
  useEffect(() => {
    const cleanUpSession = async () => {
      try {
        await supabase.auth.signOut();
        localStorage.removeItem(`sb-${supabase.supabaseUrl}-auth-token`);
      } catch (error) {
        console.error("Error cleaning session:", error);
      }
    };
    cleanUpSession();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setErrorMsg("");
      setLoading(true);
      
      if (!passwordRef.current?.value || !emailRef.current?.value) {
        setErrorMsg("Please fill in the fields");
        return;
      }

      const { error } = await supabase.auth.signInWithPassword({
        email: emailRef.current.value,
        password: passwordRef.current.value
      });

      if (error) {
        setErrorMsg(error.message);
      } else {
        navigate("/");
      }
    } catch (error) {
      setErrorMsg("Email or Password Incorrect");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="d-flex align-items-center justify-content-center" style={{ minHeight: "100vh" }}>
      <Card style={{ width: '400px' }}>
        <Card.Body>
          <h2 className="text-center mb-4">Login</h2>
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3" id="email">
              <Form.Label>Email</Form.Label>
              <Form.Control type="email" ref={emailRef} required />
            </Form.Group>
            <Form.Group className="mb-3" id="password">
              <Form.Label>Password</Form.Label>
              <Form.Control type="password" ref={passwordRef} required />
            </Form.Group>
            {errorMsg && (
              <Alert variant="danger" onClose={() => setErrorMsg("")} dismissible>
                {errorMsg}
              </Alert>
            )}
            <div className="text-center mt-4">
              <Button disabled={loading} type="submit" className="w-50">
                {loading ? 'Loading...' : 'Login'}
              </Button>
            </div>
          </Form>
          <div className="w-100 text-center mt-3">
            New User? <Link to="/register">Register</Link>
          </div>
          <div className="w-100 text-center mt-2">
            Forgot Password? <Link to="/passwordreset">Click Here</Link>
          </div>
        </Card.Body>
      </Card>
    </div>
  );
};

export default Login;