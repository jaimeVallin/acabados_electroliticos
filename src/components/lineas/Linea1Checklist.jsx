import { useState, useRef } from 'react';
import { Card, Form, Row, Col, Button } from "react-bootstrap";

const Linea1Checklist = ({ formData, handleChange, handleArrayChange }) => {
  // Crear referencias para todos los campos interactivos
  const desengraseTempRef = useRef(null);
  const desengraseNivelRef = useRef(null);
  const electroTempRef = useRef(null);
  const electroAmpRef = useRef(null);
  const electroNivelRef = useRef(null);
  const enjuagueRefs = Array(4).fill().map(() => useRef(null));
  const activadoRef = useRef(null);
  const galvanizadoTempRef = useRef(null);
  const galvanizadoAmpRef = useRef(null);
  const galvanizadoPhRef = useRef(null);
  const galvanizadoNivelRef = useRef(null);
  const preSelloRef = useRef(null);
  const selloTempRef = useRef(null);
  const selloPhRef = useRef(null);
  const selloNivelRef = useRef(null);
  const hornoTempRef = useRef(null);
  const comentariosRef = useRef(null);

  // Estilo para los botones toggle
  const toggleStyle = (isActive) => ({
    minWidth: '120px',
    height: '40px',
    whiteSpace: 'nowrap',
    backgroundColor: isActive ? '#0d6efd' : '#f8f9fa',
    color: isActive ? 'white' : '#212529',
    border: '1px solid #ced4da',
    margin: '2px'
  });

  // Manejador genérico para tecla Enter
  const handleKeyPress = (e, nextRef) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      nextRef.current?.focus();
    }
  };

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
                  ref={desengraseTempRef}
                  type="text"
                  name="desengraseInmersion.temperatura"
                  value={formData.desengraseInmersion.temperatura}
                  onChange={handleChange}
                  onKeyPress={(e) => handleKeyPress(e, desengraseNivelRef)}
                />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Nivel</Form.Label>
                <div className="d-flex">
                  <Button
                    ref={desengraseNivelRef}
                    variant="outline-primary"
                    style={toggleStyle(formData.desengraseInmersion.nivel)}
                    onClick={() => handleChange({
                      target: {
                        name: "desengraseInmersion.nivel",
                        type: "checkbox",
                        checked: !formData.desengraseInmersion.nivel
                      }
                    })}
                    onKeyPress={(e) => handleKeyPress(e, electroTempRef)}
                  >
                    {formData.desengraseInmersion.nivel ? '✅ Piezas tapadas' : 'Que tape las piezas'}
                  </Button>
                </div>
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
                  ref={electroTempRef}
                  type="text"
                  name="desengraseElectrolitico.temperatura"
                  value={formData.desengraseElectrolitico.temperatura}
                  onChange={handleChange}
                  onKeyPress={(e) => handleKeyPress(e, electroAmpRef)}
                />
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Group className="mb-3">
                <Form.Label>Amperaje (Amp)</Form.Label>
                <Form.Control
                  ref={electroAmpRef}
                  type="text"
                  name="desengraseElectrolitico.amperaje"
                  value={formData.desengraseElectrolitico.amperaje}
                  onChange={handleChange}
                  onKeyPress={(e) => handleKeyPress(e, electroNivelRef)}
                />
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Group className="mb-3">
                <Form.Label>Nivel</Form.Label>
                <div className="d-flex">
                  <Button
                    ref={electroNivelRef}
                    variant="outline-primary"
                    style={toggleStyle(formData.desengraseElectrolitico.nivel)}
                    onClick={() => handleChange({
                      target: {
                        name: "desengraseElectrolitico.nivel",
                        type: "checkbox",
                        checked: !formData.desengraseElectrolitico.nivel
                      }
                    })}
                    onKeyPress={(e) => handleKeyPress(e, enjuagueRefs[0])}
                  >
                    {formData.desengraseElectrolitico.nivel ? '✅ Piezas tapadas' : 'Que tape las piezas'}
                  </Button>
                </div>
              </Form.Group>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* Enjuagues */}
      {[0, 1, 2, 3].map((index) => (
        <Card key={`enjuague-${index}`} className="mb-4">
          <Card.Header as="h5">Enjuague {index + 1}</Card.Header>
          <Card.Body>
            <Form.Group className="mb-3">
              <Form.Label>Nivel</Form.Label>
              <div className="d-flex">
                <Button
                  ref={enjuagueRefs[index]}
                  variant="outline-primary"
                  style={toggleStyle(formData.enjuagues[index]?.nivel || false)}
                  onClick={() => handleArrayChange(
                    "enjuagues",
                    index,
                    "nivel",
                    !formData.enjuagues[index]?.nivel
                  )}
                  onKeyPress={(e) => {
                    if (index < 3) {
                      handleKeyPress(e, enjuagueRefs[index + 1]);
                    } else {
                      handleKeyPress(e, activadoRef);
                    }
                  }}
                >
                  {(formData.enjuagues[index]?.nivel) ? '✅ Piezas tapadas' : 'Que tape las piezas'}
                </Button>
              </div>
            </Form.Group>
          </Card.Body>
        </Card>
      ))}

      {/* Activado */}
      <Card className="mb-4">
        <Card.Header as="h5">Activado</Card.Header>
        <Card.Body>
          <Form.Group className="mb-3">
            <Form.Label>Nivel</Form.Label>
            <div className="d-flex">
              <Button
                ref={activadoRef}
                variant="outline-primary"
                style={toggleStyle(formData.activados[0]?.nivel || false)}
                onClick={() => handleArrayChange(
                  "activados",
                  0,
                  "nivel",
                  !formData.activados[0]?.nivel
                )}
                onKeyPress={(e) => handleKeyPress(e, galvanizadoTempRef)}
              >
                {(formData.activados[0]?.nivel) ? '✅ Piezas tapadas' : 'Que tape las piezas'}
              </Button>
            </div>
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
            ref={galvanizadoTempRef}
            type="text"
            name="galvanizado.temperatura"
            value={formData.galvanizado.temperatura}
            onChange={handleChange}
            onKeyPress={(e) => handleKeyPress(e, galvanizadoAmpRef)}
          />
        </Form.Group>
      </Col>
      <Col md={3}>
        <Form.Group className="mb-3">
          <Form.Label>Amperaje (Amp)</Form.Label>
          <Form.Control
            ref={galvanizadoAmpRef}
            type="text"
            name="galvanizado.amperaje"
            value={formData.galvanizado.amperaje}
            onChange={handleChange}
            onKeyPress={(e) => handleKeyPress(e, galvanizadoPhRef)}
          />
        </Form.Group>
      </Col>
      <Col md={3}>
        <Form.Group className="mb-3">
          <Form.Label>PH</Form.Label>
          <Form.Control
            ref={galvanizadoPhRef}
            type="text"
            name="galvanizado.ph"
            value={formData.galvanizado.ph}
            onChange={handleChange}
            onKeyPress={(e) => handleKeyPress(e, galvanizadoNivelRef)}
          />
        </Form.Group> {/* Aquí estaba el error - cambiado de </Form-group> a </Form.Group> */}
      </Col>
      <Col md={3}>
        <Form.Group className="mb-3">
          <Form.Label>Nivel</Form.Label>
          <div className="d-flex">
            <Button
              ref={galvanizadoNivelRef}
              variant="outline-primary"
              style={toggleStyle(formData.galvanizado.nivel)}
              onClick={() => handleChange({
                target: {
                  name: "galvanizado.nivel",
                  type: "checkbox",
                  checked: !formData.galvanizado.nivel
                }
              })}
              onKeyPress={(e) => handleKeyPress(e, preSelloRef)}
            >
              {formData.galvanizado.nivel ? '✅ Piezas tapadas' : 'Que tape las piezas'}
            </Button>
          </div>
        </Form.Group>
      </Col>
    </Row>
  </Card.Body>
</Card>

      {/* Pre-Sello */}
      <Card className="mb-4">
        <Card.Header as="h5">Pre-Sello</Card.Header>
        <Card.Body>
          <Form.Group className="mb-3">
            <Form.Label>Nivel</Form.Label>
            <div className="d-flex">
              <Button
                ref={preSelloRef}
                variant="outline-primary"
                style={toggleStyle(formData.preSellos[0]?.nivel || false)}
                onClick={() => handleArrayChange(
                  "preSellos",
                  0,
                  "nivel",
                  !formData.preSellos[0]?.nivel
                )}
                onKeyPress={(e) => handleKeyPress(e, selloTempRef)}
              >
                {(formData.preSellos[0]?.nivel) ? '✅ Piezas tapadas' : 'Que tape las piezas'}
              </Button>
            </div>
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
                  ref={selloTempRef}
                  type="text"
                  name="sello.temperatura"
                  value={formData.sello.temperatura}
                  onChange={handleChange}
                  onKeyPress={(e) => handleKeyPress(e, selloPhRef)}
                />
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Group className="mb-3">
                <Form.Label>PH</Form.Label>
                <Form.Control
                  ref={selloPhRef}
                  type="text"
                  name="sello.ph"
                  value={formData.sello.ph}
                  onChange={handleChange}
                  onKeyPress={(e) => handleKeyPress(e, selloNivelRef)}
                />
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Group className="mb-3">
                <Form.Label>Nivel</Form.Label>
                <div className="d-flex">
                  <Button
                    ref={selloNivelRef}
                    variant="outline-primary"
                    style={toggleStyle(formData.sello.nivel)}
                    onClick={() => handleChange({
                      target: {
                        name: "sello.nivel",
                        type: "checkbox",
                        checked: !formData.sello.nivel
                      }
                    })}
                    onKeyPress={(e) => handleKeyPress(e, hornoTempRef)}
                  >
                    {formData.sello.nivel ? '✅ Piezas tapadas' : 'Que tape las piezas'}
                  </Button>
                </div>
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
              ref={hornoTempRef}
              type="text"
              name="horno.temperatura"
              value={formData.horno.temperatura}
              onChange={handleChange}
              onKeyPress={(e) => handleKeyPress(e, comentariosRef)}
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
              ref={comentariosRef}
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

export default Linea1Checklist;