import { Card, Form, Row, Col, Button } from 'react-bootstrap';

const PiezasForm = ({ formData, handlePiezaChange, agregarPieza, totalInspeccionadas }) => {
  return (
    <Card className="mb-4 shadow-sm">
      <Card.Body>
        <h4 className="mb-3 text-primary">Piezas inspeccionadas</h4>
        {formData.numerosPieza.map((pieza, index) => (
          <Row key={index} className="mb-3">
            <Col md={5}>
              <Form.Group>
                <Form.Label>Número de pieza {index + 1}</Form.Label>
                <Form.Control
                  type="text"
                  value={pieza.numero}
                  onChange={(e) => handlePiezaChange(index, "numero", e.target.value)}
                  required
                />
              </Form.Group>
            </Col>
            <Col md={5}>
              <Form.Group>
                <Form.Label>Cantidad</Form.Label>
                <Form.Control
                  type="number"
                  value={pieza.cantidad}
                  onChange={(e) => handlePiezaChange(index, "cantidad", e.target.value)}
                  min="1"
                  required
                />
              </Form.Group>
            </Col>
            {index === 0 && formData.numerosPieza.length < 2 && (
              <Col md={2} className="d-flex align-items-end">
                <Button
                  variant="outline-primary"
                  onClick={agregarPieza}
                  className="mb-3 w-100"
                >
                  + Agregar
                </Button>
              </Col>
            )}
          </Row>
        ))}

        <Row className="mt-3">
          <Col md={6}>
            <Form.Group>
              <Form.Label className="fw-bold">Total piezas inspeccionadas</Form.Label>
              <Form.Control
                type="number"
                value={totalInspeccionadas}
                readOnly
                className="fw-bold"
              />
            </Form.Group>
          </Col>
        </Row>
      </Card.Body>
    </Card>
  );
};

export default PiezasForm;