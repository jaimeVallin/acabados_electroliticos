import { Card, Form, Row, Col } from 'react-bootstrap';

const TotalesForm = ({ formData, handleChange }) => {
  return (
    <Card className="mb-4 shadow-sm">
      <Card.Body>
        <Row>
          <Col md={6}>
            <Form.Group>
              <Form.Label className="fw-bold">Total OK</Form.Label>
              <Form.Control
                type="number"
                name="totalOK"
                value={formData.totalOK}
                onChange={handleChange}
                readOnly
                className="fw-bold"
              />
            </Form.Group>
          </Col>
        </Row>

        <Form.Group className="mt-3">
          <Form.Label>Comentarios</Form.Label>
          <Form.Control
            as="textarea"
            rows={3}
            name="comentarios"
            value={formData.comentarios}
            onChange={handleChange}
            placeholder="Observaciones adicionales..."
          />
        </Form.Group>
      </Card.Body>
    </Card>
  );
};

export default TotalesForm;