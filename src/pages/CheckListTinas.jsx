import { useState } from "react";
import { Alert, Button, Card, Form, Row, Col, Image  } from "react-bootstrap";
import logo from '../assets/logo.png'; 
// import { supabase } from '../supabaseClient';

const CheckListTinas = () => {
  // Opciones para el dropdown de líneas
  const lineasDisponibles = [
    "Línea 1",
    "Línea 2",
    "Línea 3",
    "Línea 4"
  ];

  const [formData, setFormData] = useState({
    linea: "",
    desengrase: {
      temperatura: "",
      amperaje: "",
      nivel: false
    },
    enjuague1: {
      nivel: false
    },
    activado: {
      nivel: false
    },
    enjuague2: {
      nivel: false
    },
    galvanizado: {
      temperatura: "",
      amperaje: "",
      ph: "",
      nivel: false
    },
    enjuague3: {
      nivel: false
    },
    enjuague4: {
      nivel: false
    },
    enjuague5: {
      nivel: false
    },
    selloColdip: {
      temperatura: "",
      ph: "",
      nivel: false
    },
    enjuague6: {
      nivel: false
    },
    enjuague7: {
      nivel: false
    },
    horno: {
      temperatura: ""
    },
    comentarios: ""
  });

  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: type === 'checkbox' ? checked : value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    
    if (!formData.linea) {
      setError('Por favor seleccione una línea');
      return;
    }

    try {
      setLoading(true);
      const { error: supabaseError } = await supabase
        .from("checklists")
        .insert([formData]);
      
      if (supabaseError) throw supabaseError;
      
      setSuccess(true);
      // Resetear formulario
      setFormData({
        linea: "",
        desengrase: {
          temperatura: "",
          amperaje: "",
          nivel: false
        },
        enjuague1: {
          nivel: false
        },
        activado: {
          nivel: false
        },
        enjuague2: {
          nivel: false
        },
        galvanizado: {
          temperatura: "",
          amperaje: "",
          ph: "",
          nivel: false
        },
        enjuague3: {
          nivel: false
        },
        enjuague4: {
          nivel: false
        },
        enjuague5: {
          nivel: false
        },
        selloColdip: {
          temperatura: "",
          ph: "",
          nivel: false
        },
        enjuague6: {
          nivel: false
        },
        enjuague7: {
          nivel: false
        },
        horno: {
          temperatura: ""
        },
        comentarios: ""
      });
      
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError(err.message || 'Error al guardar el checklist');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <Card.Body>
          {/* Logo agregado aquí */}
          <div className="text-center mb-4">
          <Image 
            src={logo} 
            alt="Logo de la empresa" 
            fluid 
            style={{ maxHeight: '300px' }} 
          />
        </div>

        <h2 className="text-center mb-4">Check-List de Tinas</h2>
        
        {error && <Alert variant="danger">{error}</Alert>}
        {success && <Alert variant="success">Checklist guardado correctamente!</Alert>}
        
        <Form onSubmit={handleSubmit}>
          {/* Selección de Línea */}
          <Form.Group className="mb-4">
            <Form.Label>Línea</Form.Label>
            <Form.Select
              name="linea"
              value={formData.linea}
              onChange={handleChange}
              required
            >
              <option value="">Seleccione una línea</option>
              {lineasDisponibles.map((linea, index) => (
                <option key={index} value={linea}>{linea}</option>
              ))}
            </Form.Select>
          </Form.Group>

          {/* Proceso: Desengrase Electrolítico */}
          <Card className="mb-4">
            <Card.Header as="h5">Desengrase Electrolítico</Card.Header>
            <Card.Body>
              <Row>
                <Col md={4}>
                  <Form.Group className="mb-3">
                    <Form.Label>Temperatura (°C)</Form.Label>
                    <Form.Control
                      type="text"
                      name="desengrase.temperatura"
                      value={formData.desengrase.temperatura}
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
                      name="desengrase.amperaje"
                      value={formData.desengrase.amperaje}
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
                      name="desengrase.nivel"
                      checked={formData.desengrase.nivel}
                      onChange={handleChange}
                    />
                  </Form.Group>
                </Col>
              </Row>
            </Card.Body>
          </Card>

          {/* Proceso: Enjuague 1 */}
          <Card className="mb-4">
            <Card.Header as="h5">Enjuague 1</Card.Header>
            <Card.Body>
              <Form.Group className="mb-3">
                <Form.Label>Nivel</Form.Label>
                <Form.Check
                  type="checkbox"
                  label="Que tape las piezas"
                  name="enjuague1.nivel"
                  checked={formData.enjuague1.nivel}
                  onChange={handleChange}
                />
              </Form.Group>
            </Card.Body>
          </Card>

          {/* Proceso: Activado */}
          <Card className="mb-4">
            <Card.Header as="h5">Activado</Card.Header>
            <Card.Body>
              <Form.Group className="mb-3">
                <Form.Label>Nivel</Form.Label>
                <Form.Check
                  type="checkbox"
                  label="Que tape las piezas"
                  name="activado.nivel"
                  checked={formData.activado.nivel}
                  onChange={handleChange}
                />
              </Form.Group>
            </Card.Body>
          </Card>

          {/* Proceso: Enjuague 2 */}
          <Card className="mb-4">
            <Card.Header as="h5">Enjuague 2</Card.Header>
            <Card.Body>
              <Form.Group className="mb-3">
                <Form.Label>Nivel</Form.Label>
                <Form.Check
                  type="checkbox"
                  label="Que tape las piezas"
                  name="enjuague2.nivel"
                  checked={formData.enjuague2.nivel}
                  onChange={handleChange}
                />
              </Form.Group>
            </Card.Body>
          </Card>

          {/* Proceso: Galvanizado */}
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

          {/* Procesos: Enjuagues 3, 4 y 5 */}
          {[3, 4, 5].map((num) => (
            <Card key={num} className="mb-4">
              <Card.Header as="h5">Enjuague {num}</Card.Header>
              <Card.Body>
                <Form.Group className="mb-3">
                  <Form.Label>Nivel</Form.Label>
                  <Form.Check
                    type="checkbox"
                    label="Que tape las piezas"
                    name={`enjuague${num}.nivel`}
                    checked={formData[`enjuague${num}`].nivel}
                    onChange={handleChange}
                  />
                </Form.Group>
              </Card.Body>
            </Card>
          ))}

          {/* Proceso: Sello Coldip Black */}
          <Card className="mb-4">
            <Card.Header as="h5">Sello Coldip Black</Card.Header>
            <Card.Body>
              <Row>
                <Col md={4}>
                  <Form.Group className="mb-3">
                    <Form.Label>Temperatura (°C)</Form.Label>
                    <Form.Control
                      type="text"
                      name="selloColdip.temperatura"
                      value={formData.selloColdip.temperatura}
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
                      name="selloColdip.ph"
                      value={formData.selloColdip.ph}
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
                      name="selloColdip.nivel"
                      checked={formData.selloColdip.nivel}
                      onChange={handleChange}
                    />
                  </Form.Group>
                </Col>
              </Row>
            </Card.Body>
          </Card>

          {/* Procesos: Enjuagues 6 y 7 */}
          {[6, 7].map((num) => (
            <Card key={num} className="mb-4">
              <Card.Header as="h5">Enjuague {num}</Card.Header>
              <Card.Body>
                <Form.Group className="mb-3">
                  <Form.Label>Nivel</Form.Label>
                  <Form.Check
                    type="checkbox"
                    label="Que tape las piezas"
                    name={`enjuague${num}.nivel`}
                    checked={formData[`enjuague${num}`].nivel}
                    onChange={handleChange}
                  />
                </Form.Group>
              </Card.Body>
            </Card>
          ))}

          {/* Proceso: Horno */}
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

          <Button 
            disabled={loading} 
            className="w-100" 
            type="submit"
            size="lg"
          >
            {loading ? 'Guardando...' : 'Guardar Checklist'}
          </Button>
        </Form>
      </Card.Body>
    </Card>
  );
};

export default CheckListTinas;