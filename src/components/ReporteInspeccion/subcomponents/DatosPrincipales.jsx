import { Card, Form, Row, Col } from 'react-bootstrap';

const DatosPrincipales = ({ numeroReporte }) => {
  return (
    <Card className="mb-4 shadow-sm">
      <Card.Body>
        <h4 className="mb-3 text-primary">Datos principales</h4>
        <Row>
          <Col md={6}>
            <Form.Group>
              <Form.Label>Número de reporte</Form.Label>
              <Form.Control
                type="text"
                value={numeroReporte}
                readOnly
                plaintext
                className="fw-bold"
              />
            </Form.Group>
          </Col>
        </Row>
      </Card.Body>
    </Card>
  );
};

export default DatosPrincipales;