import React, { useEffect } from "react";
import { Container, Card, Button, Form } from "react-bootstrap";
import { useAuth } from "../context/AuthProvider";
import { useNavigate } from "react-router-dom";

const CheckListTinas = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate("/login");
    }
  }, [user, navigate]);

  return (
    <Container className="mt-4 d-flex justify-content-center">
      <Card style={{ width: "80%", maxWidth: "600px" }} className="shadow p-4">
        <h3 className="text-center mb-4">Check-list de Tinas</h3>
        <Form>
          <Form.Group className="mb-3">
            <Form.Label className="fw-bold">Nombre del Inspector</Form.Label>
            <Form.Control type="text" placeholder="Ingrese su nombre" />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label className="fw-bold">Fecha</Form.Label>
            <Form.Control type="date" />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label className="fw-bold">Hora</Form.Label>
            <Form.Control type="time" />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label className="fw-bold">Ubicación</Form.Label>
            <Form.Control type="text" placeholder="Ingrese la ubicación" />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label className="fw-bold">Temperatura (°C)</Form.Label>
            <Form.Control type="number" placeholder="Ingrese la temperatura" />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label className="fw-bold">Observaciones</Form.Label>
            <Form.Control as="textarea" rows={3} placeholder="Ingrese observaciones" />
          </Form.Group>
          <div className="text-center">
            <Button variant="primary" type="submit" className="w-100">Enviar</Button>
          </div>
        </Form>
      </Card>
    </Container>
  );
};

export default CheckListTinas;