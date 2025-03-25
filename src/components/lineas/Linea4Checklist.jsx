import { Card, Form, Row, Col } from 'react-bootstrap';

const Linea4Checklist = ({ formData, handleChange, handleArrayChange }) => {
  return (
    <>
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
                  placeholder="55 - 90 °C"
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
                  placeholder="100 - 500 amp"
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

      {/* Enjuague 1 */}
      <Card className="mb-4">
        <Card.Header as="h5">Enjuague 1</Card.Header>
        <Card.Body>
          <Form.Group className="mb-3">
            <Form.Label>Nivel</Form.Label>
            <Form.Check
              type="checkbox"
              label="Que tape las piezas"
              checked={formData.enjuagues[0]?.nivel || false}
              onChange={(e) => handleArrayChange('enjuagues', 0, 'nivel', e.target.checked)}
            />
          </Form.Group>
        </Card.Body>
      </Card>

      {/* Activado */}
      <Card className="mb-4">
        <Card.Header as="h5">Activado</Card.Header>
        <Card.Body>
          <Form.Group className="mb-3">
            <Form.Label>Nivel</Form.Label>
            <Form.Check
              type="checkbox"
              label="Que tape las piezas"
              checked={formData.activados[0]?.nivel || false}
              onChange={(e) => handleArrayChange('activados', 0, 'nivel', e.target.checked)}
            />
          </Form.Group>
        </Card.Body>
      </Card>

      {/* Enjuague 2 */}
      <Card className="mb-4">
        <Card.Header as="h5">Enjuague 2</Card.Header>
        <Card.Body>
          <Form.Group className="mb-3">
            <Form.Label>Nivel</Form.Label>
            <Form.Check
              type="checkbox"
              label="Que tape las piezas"
              checked={formData.enjuagues[1]?.nivel || false}
              onChange={(e) => handleArrayChange('enjuagues', 1, 'nivel', e.target.checked)}
            />
          </Form.Group>
        </Card.Body>
      </Card>

      {/* Galvanizado */}
      <Card className="mb-4">
        <Card.Header as="h5">Galvanizado</Card.Header>
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
                  placeholder="17 - 38 °C"
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
                  placeholder="100 a 200 amp"
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
                  placeholder="4.2 - 5.8 PH"
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

      {/* Enjuagues 3, 4 y 5 */}
      {[2, 3, 4].map((index) => (
        <Card key={`enjuague-${index}`} className="mb-4">
          <Card.Header as="h5">Enjuague {index + 1}</Card.Header>
          <Card.Body>
            <Form.Group className="mb-3">
              <Form.Label>Nivel</Form.Label>
              <Form.Check
                type="checkbox"
                label="Que tape las piezas"
                checked={formData.enjuagues[index]?.nivel || false}
                onChange={(e) => handleArrayChange('enjuagues', index, 'nivel', e.target.checked)}
              />
            </Form.Group>
          </Card.Body>
        </Card>
      ))}

      {/* Sello Coldip Black */}
      <Card className="mb-4">
        <Card.Header as="h5">Sello Coldip Black</Card.Header>
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
                  placeholder="19 - 29 °C"
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
                  placeholder="1.8 - 2.3 PH"
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

      {/* Enjuagues 6 y 7 */}
      {[5, 6].map((index) => (
        <Card key={`enjuague-${index}`} className="mb-4">
          <Card.Header as="h5">Enjuague {index + 1}</Card.Header>
          <Card.Body>
            <Form.Group className="mb-3">
              <Form.Label>Nivel</Form.Label>
              <Form.Check
                type="checkbox"
                label="Que tape las piezas"
                checked={formData.enjuagues[index]?.nivel || false}
                onChange={(e) => handleArrayChange('enjuagues', index, 'nivel', e.target.checked)}
              />
            </Form.Group>
          </Card.Body>
        </Card>
      ))}

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
              placeholder="55 - 90 °C"
            />
          </Form.Group>
        </Card.Body>
      </Card>

      {/* Comentarios */}
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

export default Linea4Checklist;