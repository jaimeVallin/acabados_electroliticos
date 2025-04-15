import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Alert,
  Button,
  Card,
  Form,
  Row,
  Col,
  Spinner,
  Badge,
  Image,
  Table,
} from "react-bootstrap";
import { supabase } from "../supabase/client";
import * as XLSX from "xlsx";
import logo from "../assets/logo.png";

const ReporteInspeccion = () => {
  const navigate = useNavigate();
  const TIEMPO_AUTOGUARDADO = 60;

  const [numeroEntrada, setNumeroEntrada] = useState(() => {
    const saved = localStorage.getItem("numeroEntrada");
    return saved ? parseInt(saved) : 1;
  });

  const [formData, setFormData] = useState({
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
    const saved = localStorage.getItem("reportesInspeccion");
    return saved ? JSON.parse(saved) : [];
  });

  const [tiempoInactivo, setTiempoInactivo] = useState(0);
  const [guardadoAutomatico, setGuardadoAutomatico] = useState(false);

  const defectos = [
    "MANCHA NEGRA",
    "TORNA SOL",
    "ESCURRIMIENTO",
    "ASPERO",
    "QUEMADURA",
    "OPACO",
    "PUNTO DE CONTACTO",
    "COLOR DESIGUAL",
    "OXIDO",
    "OTRO",
  ];

  useEffect(() => {
    const checkAuth = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) navigate("/login");
    };
    checkAuth();
  }, [navigate]);

  useEffect(() => {
    localStorage.setItem("numeroEntrada", numeroEntrada.toString());
  }, [numeroEntrada]);

  useEffect(() => {
    localStorage.setItem(
      "reportesInspeccion",
      JSON.stringify(historicoReportes)
    );
  }, [historicoReportes]);

  useEffect(() => {
    const total = formData.numerosPieza.reduce(
      (sum, pieza) => sum + (parseInt(pieza.cantidad) || 0),
      0
    );
    setTotalInspeccionadas(total);
  }, [formData.numerosPieza]);

  useEffect(() => {
    const totalDefectos = Object.values(formData.defectos)
      .filter((val) => val !== undefined)
      .reduce((sum, val) => {
        if (Array.isArray(val))
          return sum + val.reduce((s, v) => s + (parseInt(v) || 0), 0);
        return sum + (parseInt(val) || 0);
      }, 0);

    setFormData((prev) => ({
      ...prev,
      totalOK: Math.max(0, totalInspeccionadas - totalDefectos),
    }));
  }, [formData.defectos, totalInspeccionadas]);

  useEffect(() => {
    let intervalo;
    if (formData.numerosPieza[0].numero && !guardadoAutomatico) {
      intervalo = setInterval(() => {
        setTiempoInactivo((prev) => {
          if (prev >= TIEMPO_AUTOGUARDADO) {
            handleSubmit();
            setGuardadoAutomatico(true);
            return 0;
          }
          return prev + 1;
        });
      }, 1000);
    }
    return () => clearInterval(intervalo);
  }, [formData.numerosPieza, guardadoAutomatico]);

  const resetearTemporizador = () => {
    setTiempoInactivo(0);
    setGuardadoAutomatico(false);
  };

  const handleChange = (e) => {
    resetearTemporizador();
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handlePiezaChange = (index, field, value) => {
    resetearTemporizador();
    const newNumerosPieza = [...formData.numerosPieza];
    newNumerosPieza[index][field] = value;
    setFormData((prev) => ({ ...prev, numerosPieza: newNumerosPieza }));
  };

  const agregarPieza = () => {
    resetearTemporizador();
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
    resetearTemporizador();
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
    resetearTemporizador();
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
    e?.preventDefault();
    setError(null);

    try {
      setLoading(true);
      const dataToSend = {
        ...formData,
        numeroEntrada,
        totalInspeccionadas,
        fecha: new Date().toISOString(),
        usuario: (await supabase.auth.getSession()).data.session?.user.email,
      };

      setHistoricoReportes((prev) => [...prev, dataToSend]);
      setNumeroEntrada((prev) => prev + 1);

      setSuccess(true);
      setTiempoInactivo(0);
      setGuardadoAutomatico(false);
      setTimeout(() => setSuccess(false), 3000);

      setFormData({
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

  const cargarReporte = (reporte) => {
    setFormData({
      numerosPieza: reporte.numerosPieza,
      defectos: reporte.defectos,
      totalOK: reporte.totalOK,
      comentarios: reporte.comentarios,
      totalInspeccionadas: reporte.totalInspeccionadas,
    });

    setNumeroEntrada(reporte.numeroEntrada);
    setSelectedDefect(null);
    setSuccess(true);
    setTimeout(() => setSuccess(false), 1500);
  };

  const prepararDatosParaExcel = () => {
    const encabezados = [
      "No.",
      "NÚMERO DE ENTRADA",
      "DEFECTO",
      "MANCHA NEGRA",
      "TORNA SOL",
      "ESCURRIMIENTO",
      "ASPERO",
      "QUEMADURA",
      "OPACO",
      "PUNTO DE CONTACTO",
      "COLOR DESIGUAL",
      "OXIDO",
      "OTRO",
      "CANTIDAD NOK",
      "CANTIDAD OK",
      "TOTAL INSPECCIONADAS",
      "HORA DE SALIDA",
      "FEPI-05",
    ];

    const filas = historicoReportes.map((reporte, index) => [
      index + 1,
      reporte.numeroEntrada,
      "",
      ...defectos.map((defecto) => reporte.defectos[defecto] || "0"),
      Object.values(reporte.defectos).reduce((sum, val) => {
        if (Array.isArray(val))
          return sum + val.reduce((s, v) => s + (parseInt(v) || 0), 0);
        return sum + (parseInt(val) || 0);
      }, 0),
      reporte.totalOK,
      reporte.totalInspeccionadas,
      new Date(reporte.fecha).toLocaleTimeString("es-MX"),
      "1",
    ]);

    return [encabezados, ...filas];
  };

  const exportarAExcel = () => {
    if (historicoReportes.length === 0) {
      setError("No hay reportes para exportar");
      return;
    }

    const wb = XLSX.utils.book_new();
    const datos = prepararDatosParaExcel();

    datos.unshift([], ["Reporte de Inspección 1 Línea 3"], []);

    const ws = XLSX.utils.aoa_to_sheet(datos);

    ws["!cols"] = [
      { width: 5 },
      { width: 15 },
      { width: 15 },
      { width: 12 },
      { width: 12 },
      { width: 12 },
      { width: 10 },
      { width: 10 },
      { width: 10 },
      { width: 15 },
      { width: 15 },
      { width: 10 },
      { width: 10 },
      { width: 12 },
      { width: 12 },
      { width: 15 },
      { width: 12 },
      { width: 10 },
    ];

    XLSX.utils.book_append_sheet(wb, ws, "Reporte Inspección");
    XLSX.writeFile(
      wb,
      `Reporte_Inspeccion_Linea3_${new Date().toISOString().split("T")[0]}.xlsx`
    );
  };

  const limpiarReportes = () => {
    if (
      window.confirm(
        "¿Estás seguro de querer eliminar todos los reportes guardados localmente?"
      )
    ) {
      localStorage.removeItem("reportesInspeccion");
      localStorage.setItem("numeroEntrada", "1");
      setHistoricoReportes([]);
      setNumeroEntrada(1);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    }
  };

  const formatoTiempo = (segundos) => {
    const mins = Math.floor(segundos / 60);
    const secs = segundos % 60;
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  return (
    <Card className="border-primary shadow-lg">
      <Card.Header className="bg-light border-0 py-4">
        <div className="text-center">
          <Image src={logo} alt="Logo" fluid style={{ maxHeight: "80px" }} />
          <h1 className="text-primary mb-3">Reporte de Inspección</h1>
          <div
            className={`h5 ${
              guardadoAutomatico ? "text-success" : "text-warning"
            }`}
          >
            <i
              className={`bi ${
                guardadoAutomatico ? "bi-check-circle" : "bi-clock-history"
              } me-2`}
            />
            {guardadoAutomatico
              ? "Datos autoguardados"
              : `Autoguardado en: ${formatoTiempo(
                  TIEMPO_AUTOGUARDADO - tiempoInactivo
                )}`}
          </div>
        </div>
      </Card.Header>

      <Card.Body className="p-4">
        {error && (
          <Alert variant="danger" dismissible onClose={() => setError(null)}>
            {error}
          </Alert>
        )}
        {success && (
          <Alert variant="success" dismissible>
            Operación exitosa!
          </Alert>
        )}

        <Form onSubmit={handleSubmit}>
          <Card className="mb-4">
            <Card.Body>
              <Row className="g-3">
                <Col md={3}>
                  <Form.Group controlId="numeroEntrada">
                    <Form.Label>Número de Entrada</Form.Label>
                    <Form.Control
                      type="number"
                      value={numeroEntrada}
                      readOnly
                      className="fw-bold fs-5"
                    />
                  </Form.Group>
                </Col>
                <Col md={9}></Col>
              </Row>
            </Card.Body>
          </Card>

          <Card className="mb-4">
            <Card.Body>
              <h4 className="text-primary mb-3">
                <i className="bi bi-box-seam me-2" />
                Piezas Inspeccionadas
              </h4>
              {formData.numerosPieza.map((pieza, index) => (
                <Row key={index} className="mb-3 g-2">
                  <Col md={5}>
                    <Form.Control
                      type="text"
                      placeholder={`Número pieza ${index + 1}`}
                      value={pieza.numero}
                      onChange={(e) =>
                        handlePiezaChange(index, "numero", e.target.value)
                      }
                      required
                    />
                  </Col>
                  <Col md={5}>
                    <Form.Control
                      type="number"
                      placeholder="Cantidad"
                      value={pieza.cantidad}
                      onChange={(e) =>
                        handlePiezaChange(index, "cantidad", e.target.value)
                      }
                      min="1"
                      required
                    />
                  </Col>
                  {index === 0 && formData.numerosPieza.length < 2 && (
                    <Col md={2}>
                      <Button
                        variant="outline-primary"
                        onClick={agregarPieza}
                        className="w-100"
                      >
                        <i className="bi bi-plus-lg me-2" />
                        Pieza
                      </Button>
                    </Col>
                  )}
                </Row>
              ))}
            </Card.Body>
          </Card>

          <Card className="mb-4">
            <Card.Body>
              <h4 className="text-primary mb-3">
                <i className="bi bi-exclamation-triangle me-2" />
                Defectos Detectados
              </h4>
              <div
                className="d-grid gap-2"
                style={{
                  gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
                }}
              >
                {defectos.map((defecto) => (
                  <Button
                    key={defecto}
                    variant={
                      selectedDefect === defecto ? "primary" : "outline-primary"
                    }
                    onClick={() => handleDefectoSelect(defecto)}
                    className="text-truncate"
                  >
                    {defecto}
                  </Button>
                ))}
              </div>
            </Card.Body>
          </Card>

          {selectedDefect && (
            <Card className="mb-4">
              <Card.Body>
                <h5 className="text-center text-primary mb-4">
                  <i className="bi bi-pencil-square me-2" />
                  Cantidad para: {selectedDefect}
                </h5>
                <Row>
                  {formData.numerosPieza.map((_, index) => (
                    <Col key={index} md={6} className="mb-3">
                      <Form.Group>
                        <Form.Label>Pieza {index + 1}</Form.Label>
                        <Form.Control
                          type="number"
                          value={
                            formData.defectos[selectedDefect]?.[index] || "0"
                          }
                          onChange={(e) =>
                            handleDefectoChange(e.target.value, index)
                          }
                          min="0"
                        />
                      </Form.Group>
                      <Form.Group controlId="comentarios">
                        <Form.Label>Comentarios</Form.Label>
                        <Form.Control
                          as="textarea"
                          name="comentarios"
                          value={formData.comentarios}
                          onChange={handleChange}
                          placeholder="Registre observaciones relevantes..."
                          style={{ minHeight: "80px" }}
                        />
                      </Form.Group>
                    </Col>
                  ))}
                </Row>
              </Card.Body>
            </Card>
          )}

          <Row className="g-3 mb-4">
            <Col md={4}>
              <Button
                variant="primary"
                type="submit"
                className="w-100 py-3"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" />
                    Guardando...
                  </>
                ) : (
                  <>
                    <i className="bi bi-save me-2" />
                    Guardar Reporte
                  </>
                )}
              </Button>
            </Col>
            <Col md={4}>
              <Button
                variant="success"
                onClick={exportarAExcel}
                className="w-100 py-3"
                disabled={historicoReportes.length === 0}
              >
                <i className="bi bi-file-earmark-excel me-2" />
                Exportar a Excel
              </Button>
            </Col>
            <Col md={4}>
              <Button
                variant="danger"
                onClick={limpiarReportes}
                className="w-100 py-3"
                disabled={historicoReportes.length === 0}
              >
                <i className="bi bi-trash me-2" />
                Limpiar Todo
              </Button>
            </Col>
          </Row>

          {historicoReportes.length > 0 && (
            <Card className="mt-4">
              <Card.Header className="bg-light">
                <Row className="align-items-center">
                  <Col>
                    <h4 className="mb-0">
                      <i className="bi bi-clock-history me-2" />
                      Historial de Reportes ({historicoReportes.length})
                    </h4>
                  </Col>
                  <Col className="text-end">
                    <Button
                      variant="link"
                      onClick={exportarAExcel}
                      className="text-decoration-none"
                    >
                      <i className="bi bi-download me-2" />
                      Exportar Todo
                    </Button>
                  </Col>
                </Row>
              </Card.Header>
              <Card.Body className="p-0">
                <div
                  className="table-responsive"
                  style={{ maxHeight: "400px" }}
                >
                  <Table striped hover className="mb-0">
                    <thead className="sticky-top bg-light">
                      <tr>
                        <th># Entrada</th>
                        <th>Fecha</th>
                        <th>Total OK</th>
                        <th>Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {historicoReportes.map((reporte, index) => (
                        <tr key={index}>
                          <td className="fw-bold">{reporte.numeroEntrada}</td>
                          <td>
                            {new Date(reporte.fecha).toLocaleDateString(
                              "es-MX"
                            )}
                          </td>
                          <td>
                            <Badge bg="success" className="fs-6">
                              {reporte.totalOK}
                            </Badge>
                          </td>
                          <td>
                            <Button
                              variant="primary"
                              size="sm"
                              onClick={() => cargarReporte(reporte)}
                              className="d-flex align-items-center gap-2"
                            >
                              <i className="bi bi-cloud-arrow-down" />
                              <span>Cargar reporte</span>
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </div>
              </Card.Body>
            </Card>
          )}
        </Form>
      </Card.Body>
    </Card>
  );
};

export default ReporteInspeccion;
