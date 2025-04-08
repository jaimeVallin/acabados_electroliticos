import { Card, Form, Row, Col } from 'react-bootstrap';

const DefectoSeleccionado = ({ selectedDefect, formData, handleDefectoChange }) => {
  return (
    <Card className="mb-4 shadow-sm">
      <Card.Body>
        <h4 className="mb-3 text-primary text-center">
          Cantidad para defecto: {selectedDefect}
        </h4>
        <Row>
          <Col md={6} className="mx-auto">
            <Card className="h-100">
              <Card.Body>
                {formData.numerosPieza.length > 1 ? (
                  <Row>
                    {formData.numerosPieza.map((_, index) => (
                      <Col key={index} className="text-center mb-3">
                        <Form.Label>Pieza {index + 1}</Form.Label>
                        <Form.Control
                          type="number"
                          value={formData.defectos[selectedDefect]?.[index] || "0"}
                          onChange={(e) => handleDefectoChange(e.target.value, index)}
                          min="0"
                          className="text-center"
                        />
                      </Col>
                    ))}
                  </Row>
                ) : (
                  <div className="text-center">
                    <Form.Control
                      type="number"
                      value={formData.defectos[selectedDefect] || "0"}
                      onChange={(e) => handleDefectoChange(e.target.value)}
                      min="0"
                      style={{ maxWidth: "150px", margin: "0 auto" }}
                    />
                  </div>
                )}
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Card.Body>
    </Card>
  );
};

export default DefectoSeleccionado;