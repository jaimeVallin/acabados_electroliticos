import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Alert, Button, Card, Form, Image, Row, Col } from "react-bootstrap";
import { supabase } from "../supabase/client";
import logo from "../assets/logo.png";
import * as XLSX from 'xlsx';

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
  const [historicoReportes, setHistoricoReportes] = useState(() => {
    const saved = localStorage.getItem('reportesInspeccion');
    return saved ? JSON.parse(saved) : [];
  });

  // Lista de defectos actualizada para coincidir exactamente con la imagen
  const defectos = [
    "DIVISIDAD O DESPRENDIMIENTO",
    "MANCHA BLANCA",
    "MANCHA NEGRA",
    "MANCHA TORNASOL",
    "ESCURRIMIENTO",
    "ASPERO",
    "QUEÑADURA",
    "OPACO",
    "PUNTO DE CONTACTO",
    "COLOR DESIGUAL",
    "OXIDO",
    "OTRO",
  ];

  // Actualizar localStorage cuando cambie historicoReportes
  useEffect(() => {
    localStorage.setItem('reportesInspeccion', JSON.stringify(historicoReportes));
  }, [historicoReportes]);

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

  const handleDefectoSelect = (defecto) => {
    setSelectedDefect(defecto);

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

      // Guardar en localStorage
      setHistoricoReportes(prev => [...prev, dataToSend]);
      
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
      
      // Resetear el formulario
      setFormData({
        numeroEntrada: "",
        numerosPieza: [{ numero: "", cantidad: "" }],
        defectos: {},
        totalOK: 0,
        comentarios: "",
      });
      setSelectedDefect(null);
      
    } catch (err) {
      setError(err.message || "Error al guardar el reporte");
    } finally {
      setLoading(false);
    }
  };

  const enviarASupabase = async () => {
    try {
      setLoading(true);
      
      if (historicoReportes.length === 0) {
        throw new Error("No hay reportes para enviar");
      }

      const { error } = await supabase
        .from("reportes_inspeccion")
        .insert(historicoReportes);

      if (error) throw error;

      // Limpiar después de enviar
      localStorage.removeItem('reportesInspeccion');
      setHistoricoReportes([]);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
      
    } catch (err) {
      setError(err.message || "Error al enviar reportes a Supabase");
    } finally {
      setLoading(false);
    }
  };

  const prepararDatosParaExcel = () => {
    // Encabezados exactos como en la imagen
    const encabezados = [
      "No.",
      "DE ENTRADA",
      "DIFÍCIL AYO DE SPRENDIMIENTO",
      "MANCHA BLANCA",
      "MANCHA NEGRA",
      "MANCHA TORNASOL",
      "ESCURRIMIENTO",
      "ASPERO",
      "QUEÑADURA",
      "OPACO",
      "PUNTO DE CONTACTO",
      "COLOR DESIGUAL",
      "OXIDO",
      "OTRO",
      "CANTIDAD NO",
      "CANTIDAD OK",
      "TOTAL ISFECCIONADAS",
      "HORA DE SALIDA",
      "REÁLEO",
      "PERIODO",
      "RESERVACIONES"
    ];

    // Datos de cada reporte
    const filas = historicoReportes.map((reporte, index) => {
      return [
        index + 1, // No.
        reporte.numeroEntrada, // DE ENTRADA
        "", // DIFÍCIL AYO DE SPRENDIMIENTO (vacío)
        reporte.defectos["MANCHA BLANCA"] || "0",
        reporte.defectos["MANCHA NEGRA"] || "0",
        reporte.defectos["MANCHA TORNASOL"] || "0",
        reporte.defectos["ESCURRIMIENTO"] || "0",
        reporte.defectos["ASPERO"] || "0",
        reporte.defectos["QUEÑADURA"] || "0",
        reporte.defectos["OPACO"] || "0",
        reporte.defectos["PUNTO DE CONTACTO"] || "0",
        reporte.defectos["COLOR DESIGUAL"] || "0",
        reporte.defectos["OXIDO"] || "0",
        reporte.defectos["OTRO"] || "0",
        // CANTIDAD NO (suma de defectos)
        Object.values(reporte.defectos).reduce((sum, val) => {
          if (Array.isArray(val)) return sum + val.reduce((s, v) => s + (parseInt(v) || 0), 0);
          return sum + (parseInt(val) || 0);
        }, 0),
        reporte.totalOK,
        reporte.totalInspeccionadas,
        new Date(reporte.fecha).toLocaleTimeString('es-MX'),
        reporte.usuario.split('@')[0], // REÁLEO
        "", // PERIODO (vacío)
        reporte.comentarios // RESERVACIONES
      ];
    });

    return [encabezados, ...filas];
  };

  const exportarAExcel = () => {
    if (historicoReportes.length === 0) {
      setError("No hay reportes para exportar");
      return;
    }

    const wb = XLSX.utils.book_new();
    const datos = prepararDatosParaExcel();
    const ws = XLSX.utils.aoa_to_sheet(datos);
    
    // Ajustar anchos de columna
    if (!ws["!cols"]) ws["!cols"] = [];
    datos[0].forEach((_, i) => {
      ws["!cols"][i] = { width: 15 };
    });
    
    // Combinar celdas para el título (similar a la imagen)
    ws["!merges"] = [
      { s: { r: 0, c: 0 }, e: { r: 0, c: 20 } } // Combina toda la primera fila
    ];
    
    XLSX.utils.book_append_sheet(wb, ws, "Reporte Inspección");
    XLSX.writeFile(wb, `Reporte_Inspeccion_Linea3_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  const limpiarReportes = () => {
    if (window.confirm("¿Estás seguro de querer eliminar todos los reportes guardados localmente?")) {
      localStorage.removeItem('reportesInspeccion');
      setHistoricoReportes([]);
    }
  };

  return (
    <Card className="border-primary">
      <Card.Header className="bg-transparent border-0">
        <div className="text-center">
          <Image src={logo} alt="Logo" fluid style={{ maxHeight: "80px" }} />
          <h2 className="mt-2">Reporte de Inspección</h2>
          <div className="d-flex justify-content-center gap-2 mt-2">
            <span className="badge bg-primary">
              Reportes guardados: {historicoReportes.length}
            </span>
          </div>
        </div>
      </Card.Header>

      <Card.Body>
        {error && <Alert variant="danger">{error}</Alert>}
        {success && (
          <Alert variant="success">Operación realizada correctamente!</Alert>
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

          {/* Sección Defectos */}
          <Card className="mb-4 shadow-sm">
            <Card.Body>
              <h4 className="mb-3 text-primary">
                Seleccione el defecto observado
              </h4>
              <div className="d-flex flex-wrap gap-2">
                {defectos.map((defecto) => (
                  <Button
                    key={defecto}
                    variant={
                      selectedDefect === defecto ? "primary" : "outline-primary"
                    }
                    className="flex-grow-1 text-truncate"
                    onClick={() => handleDefectoSelect(defecto)}
                    style={{
                      minWidth: "150px",
                      height: "60px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      whiteSpace: "normal",
                    }}
                  >
                    {defecto}
                  </Button>
                ))}
              </div>
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

          <div className="d-flex gap-2 mt-3">
            <Button 
              variant="success" 
              onClick={exportarAExcel}
              className="flex-grow-1 py-3"
              disabled={historicoReportes.length === 0}
            >
              Exportar a Excel ({historicoReportes.length})
            </Button>

            <Button 
              variant="warning" 
              onClick={enviarASupabase}
              className="flex-grow-1 py-3"
              disabled={historicoReportes.length === 0 || loading}
            >
              {loading ? "Enviando..." : "Enviar a Supabase"}
            </Button>
          </div>

          <Button 
            variant="danger" 
            onClick={limpiarReportes}
            className="w-100 py-2 mt-2"
            disabled={historicoReportes.length === 0}
          >
            Limpiar Reportes Locales
          </Button>
        </Form>
      </Card.Body>
    </Card>
  );
};

export default ReporteInspeccion;