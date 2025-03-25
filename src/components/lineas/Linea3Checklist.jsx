import { Card, Form, Row, Col } from "react-bootstrap";

const Linea3Checklist = ({ formData, handleChange, handleArrayChange }) => {
  return (
    <>
      {/* Desengrase de Inmersión */}
      <Card className="mb-4">
        <Card.Header as="h5">Desengrase de Inmersión</Card.Header>
        <Card.Body>
          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Temperatura (°C)</Form.Label>
                <Form.Control
                  type="text"
                  name="desengraseInmersion.temperatura"
                  value={formData.desengraseInmersion.temperatura}
                  onChange={handleChange}
                />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Nivel</Form.Label>
                <Form.Check
                  type="checkbox"
                  label="Que tape las piezas"
                  name="desengraseInmersion.nivel"
                  checked={formData.desengraseInmersion.nivel}
                  onChange={handleChange}
                />
              </Form.Group>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* Desengrase Electrolítico */}
      <Card className="mb-4">
        <Card.Header as="h5">Desengrase Electrolítico</Card.Header>
        <Card.Body>
          <Row>
            <Col md={4}>
              <Form.Group className="mb-3">
                <Form.Label>Temperatura (°C)</Form.Label>
                <Form.Control
                  type="text"
                  name="desengraseElectrolitico.temperatura"
                  value={formData.desengraseElectrolitico.temperatura}
                  onChange={handleChange}
                />
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Group className="mb-3">
                <Form.Label>Amperaje (Amp)</Form.Label>
                <Form.Control
                  type="text"
                  name="desengraseElectrolitico.amperaje"
                  value={formData.desengraseElectrolitico.amperaje}
                  onChange={handleChange}
                />
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Group className="mb-3">
                <Form.Label>Nivel</Form.Label>
                <Form.Check
                  type="checkbox"
                  label="Que tape las piezas"
                  name="desengraseElectrolitico.nivel"
                  checked={formData.desengraseElectrolitico.nivel}
                  onChange={handleChange}
                />
              </Form.Group>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* Enjuagues (4 enjuagues iniciales) */}
      {[0, 1, 2, 3].map((index) => (
        <Card key={`enjuague-${index}`} className="mb-4">
          <Card.Header as="h5">Enjuague {index + 1}</Card.Header>
          <Card.Body>
            <Form.Group className="mb-3">
              <Form.Label>Nivel</Form.Label>
              <Form.Check
                type="checkbox"
                label="Que tape las piezas"
                checked={formData.enjuagues[index]?.nivel || false}
                onChange={(e) =>
                  handleArrayChange(
                    "enjuagues",
                    index,
                    "nivel",
                    e.target.checked
                  )
                }
              />
            </Form.Group>
          </Card.Body>
        </Card>
      ))}

      {/* Galvanizado 1 */}
      <Card className="mb-4">
        <Card.Header as="h5">Galvanizado 1</Card.Header>
        <Card.Body>
          <Row>
            <Col md={3}>
              <Form.Group className="mb-3">
                <Form.Label>Temperatura (°C)</Form.Label>
                <Form.Control
                  type="text"
                  name="galvanizado.temperatura"
                  value={formData.galvanizado.temperatura}
                  onChange={handleChange}
                />
              </Form.Group>
            </Col>
            <Col md={3}>
              <Form.Group className="mb-3">
                <Form.Label>Amperaje (Amp)</Form.Label>
                <Form.Control
                  type="text"
                  name="galvanizado.amperaje"
                  value={formData.galvanizado.amperaje}
                  onChange={handleChange}
                />
              </Form.Group>
            </Col>
            <Col md={3}>
              <Form.Group className="mb-3">
                <Form.Label>PH</Form.Label>
                <Form.Control
                  type="text"
                  name="galvanizado.ph"
                  value={formData.galvanizado.ph}
                  onChange={handleChange}
                />
              </Form.Group>
            </Col>
            <Col md={3}>
              <Form.Group className="mb-3">
                <Form.Label>Nivel</Form.Label>
                <Form.Check
                  type="checkbox"
                  label="Que tape las piezas"
                  name="galvanizado.nivel"
                  checked={formData.galvanizado.nivel}
                  onChange={handleChange}
                />
              </Form.Group>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* Galvanizado 2 */}
      <Card className="mb-4">
        <Card.Header as="h5">Galvanizado 2</Card.Header>
        <Card.Body>
          <Row>
            <Col md={4}>
              <Form.Group className="mb-3">
                <Form.Label>Temperatura (°C)</Form.Label>
                <Form.Control
                  type="text"
                  name="galvanizado2.temperatura"
                  value={formData.galvanizado2?.temperatura || ""}
                  onChange={handleChange}
                />
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Group className="mb-3">
                <Form.Label>Amperaje (Amp)</Form.Label>
                <Form.Control
                  type="text"
                  name="galvanizado2.amperaje"
                  value={formData.galvanizado2?.amperaje || ""}
                  onChange={handleChange}
                />
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Group className="mb-3">
                <Form.Label>Nivel</Form.Label>
                <Form.Check
                  type="checkbox"
                  label="Que tape las piezas"
                  name="galvanizado2.nivel"
                  checked={formData.galvanizado2?.nivel || false}
                  onChange={handleChange}
                />
              </Form.Group>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* Enjuague post-galvanizado */}
      <Card className="mb-4">
        <Card.Header as="h5">Enjuague Post-Galvanizado</Card.Header>
        <Card.Body>
          <Form.Group className="mb-3">
            <Form.Label>Nivel</Form.Label>
            <Form.Check
              type="checkbox"
              label="Que tape las piezas"
              checked={formData.enjuagues[4]?.nivel || false}
              onChange={(e) =>
                handleArrayChange("enjuagues", 4, "nivel", e.target.checked)
              }
            />
          </Form.Group>
        </Card.Body>
      </Card>

      {/* Pre-Sello */}
      <Card className="mb-4">
        <Card.Header as="h5">Pre-Sello</Card.Header>
        <Card.Body>
          <Form.Group className="mb-3">
            <Form.Label>Nivel</Form.Label>
            <Form.Check
              type="checkbox"
              label="Que tape las piezas"
              checked={formData.preSellos[0]?.nivel || false}
              onChange={(e) =>
                handleArrayChange("preSellos", 0, "nivel", e.target.checked)
              }
            />
          </Form.Group>
        </Card.Body>
      </Card>

      {/* Sello */}
      <Card className="mb-4">
        <Card.Header as="h5">Sello</Card.Header>
        <Card.Body>
          <Row>
            <Col md={4}>
              <Form.Group className="mb-3">
                <Form.Label>Temperatura (°C)</Form.Label>
                <Form.Control
                  type="text"
                  name="sello.temperatura"
                  value={formData.sello.temperatura}
                  onChange={handleChange}
                />
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Group className="mb-3">
                <Form.Label>PH</Form.Label>
                <Form.Control
                  type="text"
                  name="sello.ph"
                  value={formData.sello.ph}
                  onChange={handleChange}
                />
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Group className="mb-3">
                <Form.Label>Nivel</Form.Label>
                <Form.Check
                  type="checkbox"
                  label="Que tape las piezas"
                  name="sello.nivel"
                  checked={formData.sello.nivel}
                  onChange={handleChange}
                />
              </Form.Group>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* Horno */}
      <Card className="mb-4">
        <Card.Header as="h5">Horno</Card.Header>
        <Card.Body>
          <Form.Group className="mb-3">
            <Form.Label>Temperatura (°C)</Form.Label>
            <Form.Control
              type="text"
              name="horno.temperatura"
              value={formData.horno.temperatura}
              onChange={handleChange}
            />
          </Form.Group>
        </Card.Body>
      </Card>

      <Card className="mb-4">
        <Card.Header as="h5">Comentarios</Card.Header>
        <Card.Body>
          <Form.Group className="mb-3">
            <Form.Control
              as="textarea"
              rows={3}
              name="comentarios"
              value={formData.comentarios}
              onChange={handleChange}
              placeholder="Ingrese cualquier comentario adicional"
            />
          </Form.Group>
        </Card.Body>
      </Card>
    </>
  );
};

export default Linea3Checklist;
