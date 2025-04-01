import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Alert, Button, Card, Form, Image, Row, Col } from "react-bootstrap";
import { supabase } from "../supabase/client";
import logo from "../assets/logo.png";

const ReporteInspeccion = () => {
  const navigate = useNavigate();

  // Verificar sesión al cargar
  useEffect(() => {
    const checkAuth = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) navigate("/login");
    };
    checkAuth();
  }, [navigate]);

  // Estados
  const [formData, setFormData] = useState({
    numeroEntrada: "",
    numerosPieza: [{ numero: "", cantidad: "" }],
    defectos: {},
    totalOK: 0,
    comentarios: "",
  });

  const [totalInspeccionadas, setTotalInspeccionadas] = useState(0);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedDefect, setSelectedDefect] = useState(null);

  // Lista de defectos
  const defectos = [
    "Burbuja o Desprendimiento",
    "Mancha blanca",
    "Mancha negra",
    "Mancha Tomasol",
    "Escurrimiento",
    "Aspero",
    "Quemadura",
    "Opaco",
    "Punto de Contacto",
    "Color Desigual",
    "Oxido",
    "Otro",
  ];

  // Calcula total inspeccionado
  useEffect(() => {
    const total = formData.numerosPieza.reduce(
      (sum, pieza) => sum + (parseInt(pieza.cantidad) || 0),
      0
    );
    setTotalInspeccionadas(total);
  }, [formData.numerosPieza]);

  // Calcula total OK
  useEffect(() => {
    const totalDefectos = Object.values(formData.defectos)
      .filter((val) => val !== undefined)
      .reduce((sum, val) => {
        if (Array.isArray(val)) {
          return sum + val.reduce((s, v) => s + (parseInt(v) || 0), 0);
        }
        return sum + (parseInt(val) || 0);
      }, 0);

    setFormData((prev) => ({
      ...prev,
      totalOK: Math.max(0, totalInspeccionadas - totalDefectos),
    }));
  }, [formData.defectos, totalInspeccionadas]);

  // Handlers
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handlePiezaChange = (index, field, value) => {
    const newNumerosPieza = [...formData.numerosPieza];
    newNumerosPieza[index][field] = value;
    setFormData((prev) => ({ ...prev, numerosPieza: newNumerosPieza }));
  };

  const agregarPieza = () => {
    if (formData.numerosPieza.length < 2) {
      setFormData((prev) => ({
        ...prev,
        numerosPieza: [...prev.numerosPieza, { numero: "", cantidad: "" }],
        defectos: Object.fromEntries(
          Object.entries(prev.defectos).map(([key, val]) => [
            key,
            val !== undefined
              ? Array.isArray(val)
                ? [...val, "0"]
                : [val, "0"]
              : undefined,
          ])
        ),
      }));
    }
  };

  // Modificado para mantener los valores existentes
  const handleDefectoSelect = (defecto) => {
    setSelectedDefect(defecto);

    // Si el defecto ya existe en el estado, no lo sobrescribimos
    if (!formData.defectos[defecto]) {
      setFormData((prev) => ({
        ...prev,
        defectos: {
          ...prev.defectos,
          [defecto]:
            prev.numerosPieza.length > 1
              ? Array(prev.numerosPieza.length).fill("0")
              : "0",
        },
      }));
    }
  };

  const handleDefectoChange = (value, piezaIndex = 0) => {
    if (!selectedDefect) return;

    setFormData((prev) => ({
      ...prev,
      defectos: {
        ...prev.defectos,
        [selectedDefect]: Array.isArray(prev.defectos[selectedDefect])
          ? prev.defectos[selectedDefect].map((v, i) =>
              i === piezaIndex ? value : v
            )
          : value,
      },
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    try {
      setLoading(true);
      const dataToSend = {
        ...formData,
        totalInspeccionadas,
        fecha: new Date().toISOString(),
        usuario: (await supabase.auth.getSession()).data.session?.user.email,
      };

      const { error } = await supabase
        .from("reportes_inspeccion")
        .insert([dataToSend]);

      if (error) throw error;

      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError(err.message || "Error al guardar el reporte");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="border-primary">
      <Card.Header className="bg-transparent border-0">
        <div className="text-center">
          <Image src={logo} alt="Logo" fluid style={{ maxHeight: "80px" }} />
          <h2 className="mt-2">Reporte de Inspección</h2>
        </div>
      </Card.Header>

      <Card.Body>
        {error && <Alert variant="danger">{error}</Alert>}
        {success && (
          <Alert variant="success">Reporte guardado correctamente!</Alert>
        )}

        <Form onSubmit={handleSubmit}>
          {/* Sección Datos Principales */}
          <Card className="mb-4 shadow-sm">
            <Card.Body>
              <h4 className="mb-3 text-primary">Datos principales</h4>
              <Row>
                <Col md={6}>
                  <Form.Group>
                    <Form.Label>Número de entrada</Form.Label>
                    <Form.Control
                      type="text"
                      name="numeroEntrada"
                      value={formData.numeroEntrada}
                      onChange={handleChange}
                      required
                    />
                  </Form.Group>
                </Col>
              </Row>
            </Card.Body>
          </Card>

          {/* Sección Piezas */}
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
                        onChange={(e) =>
                          handlePiezaChange(index, "numero", e.target.value)
                        }
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
                        onChange={(e) =>
                          handlePiezaChange(index, "cantidad", e.target.value)
                        }
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
                    <Form.Label className="fw-bold">
                      Total piezas inspeccionadas
                    </Form.Label>
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

          {/* Sección Defectos (radio buttons) */}
          <Card className="mb-4 shadow-sm">
            <Card.Body>
              <h4 className="mb-3 text-primary">
                Seleccione el defecto observado
              </h4>
              <Row>
                {[...Array(3)].map((_, colIndex) => (
                  <Col md={4} key={colIndex}>
                    {defectos
                      .slice(colIndex * 4, colIndex * 4 + 4)
                      .map((defecto) => (
                        <Form.Check
                          key={defecto}
                          type="radio"
                          id={`defecto-${defecto}`}
                          name="defectos-radio"
                          label={defecto}
                          checked={selectedDefect === defecto}
                          onChange={() => handleDefectoSelect(defecto)}
                          className="my-2 ps-4"
                        />
                      ))}
                  </Col>
                ))}
              </Row>
            </Card.Body>
          </Card>

          {/* Card para mostrar el defecto seleccionado */}
          {selectedDefect && (
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
                                  value={
                                    formData.defectos[selectedDefect]?.[
                                      index
                                    ] || "0"
                                  }
                                  onChange={(e) =>
                                    handleDefectoChange(e.target.value, index)
                                  }
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
                              onChange={(e) =>
                                handleDefectoChange(e.target.value)
                              }
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
          )}

          {/* Totales y Comentarios */}
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

          <Button
            variant="primary"
            type="submit"
            className="w-100 py-3 fw-bold"
            disabled={loading}
          >
            {loading ? "Guardando..." : "Guardar Reporte"}
          </Button>
        </Form>
      </Card.Body>
    </Card>
  );
};

export default ReporteInspeccion;
