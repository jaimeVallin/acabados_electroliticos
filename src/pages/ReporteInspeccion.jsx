import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../supabase/client";
import {
  Alert,
  Button,
  Card,
  Form,
  Row,
  Col,
  Badge,
  Image,
  Table,
} from "react-bootstrap";
import * as XLSX from "xlsx";
import logo from "../assets/logo.png";

const ReporteInspeccion = () => {
  const navigate = useNavigate();
  const TIEMPO_AUTOGUARDADO = 60;
  const hayInternet = () => {
    return window.navigator.onLine;
  };

  const [numeroEntrada, setNumeroEntrada] = useState(() => {
    const saved = localStorage.getItem("numeroEntrada");
    return saved ? parseInt(saved) : 1;
  });

  const [formData, setFormData] = useState({
    numerosPieza: [{ numero: "", cantidad: "", metadata: null }],
    defectos: {},
    totalOK: 0,
    comentarios: "",
  });

  const [productos, setProductos] = useState([]);
  const [busqueda, setBusqueda] = useState("");
  const [busquedaActiva, setBusquedaActiva] = useState(false);
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
  "BURBUJA O DESPRENDIMIENTO",
  "MANCHA BLANCA",
  "MANCHA NEGRA",
  "MANCHA TORNASOL",
  "ESCURRIMIENTO",
  "ASPERO",
  "QUEMADURA",
  "OPACO",
  "PUNTO DE CONTACTO",
  "COLOR DESIGUAL",
  "OXIDO",
  "OTRO"
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

  useEffect(() => {
    const buscarProductos = () => {
      if (!busquedaActiva || busqueda.length < 2) {
        setProductos([]);
        return;
      }

      const productosCache =
        JSON.parse(localStorage.getItem("productos_cache")) || [];
      const searchTerm = busqueda.toLowerCase();

      // Búsqueda offline en todos los campos
      const resultados = productosCache.filter((producto) => {
        return Object.values(producto).some((value) =>
          String(value).toLowerCase().includes(searchTerm)
        );
      });

      setProductos(resultados.slice(0, 10)); // Limitar a 10 resultados
    };
    const debounce = setTimeout(buscarProductos, 300);
    return () => clearTimeout(debounce);
  }, [busqueda, busquedaActiva, supabase]);
  useEffect(() => {
    // Guardar productos en localStorage cada 5 min por si hay conexión intermitente
    const interval = setInterval(async () => {
      if (hayInternet()) {
        const { data: nuevosProductos } = await supabase
          .from("productos")
          .select("*");

        localStorage.setItem(
          "productos_cache",
          JSON.stringify(nuevosProductos)
        );
      }
    }, 300000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const productosIniciales =
      JSON.parse(localStorage.getItem("productos_cache")) || [];
    setProductos(productosIniciales);
  }, []);

  const resetearTemporizador = () => {
    setTiempoInactivo(0);
    setGuardadoAutomatico(false);
  };

  const handleSeleccionProducto = (index, value) => {
    const productoSeleccionado = productos.find((p) => p.producto_id === value);

    console.log("Producto seleccionado:", productoSeleccionado); // Debug 1

    if (productoSeleccionado) {
      const nuevosNumerosPieza = [...formData.numerosPieza];
      nuevosNumerosPieza[index] = {
        ...nuevosNumerosPieza[index],
        numero: productoSeleccionado.producto_id,
        metadata: {
          cliente_id: productoSeleccionado.cliente_id,
          combinado_id: productoSeleccionado.combinado_id,
          descripcion: productoSeleccionado.descripcion,
          numero_parte: productoSeleccionado.producto_id // Nuevo campo
        },
      };

      console.log("Nuevos datos de pieza:", nuevosNumerosPieza[index]); // Debug 2

      setFormData((prev) => ({
        ...prev,
        numerosPieza: nuevosNumerosPieza,
      }));
    }
  };

  const handleChange = (e) => {
    resetearTemporizador();
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handlePiezaChange = (index, field, value) => {
    resetearTemporizador();
    const newNumerosPieza = [...formData.numerosPieza];

    if (field === "numero") {
      handleSeleccionProducto(index, value);
      newNumerosPieza[index][field] = value;
    } else {
      newNumerosPieza[index][field] = value;
    }

    setFormData((prev) => ({ ...prev, numerosPieza: newNumerosPieza }));
  };

  const agregarPieza = () => {
    resetearTemporizador();
    if (formData.numerosPieza.length < 2) {
      setFormData((prev) => ({
        ...prev,
        numerosPieza: [
          ...prev.numerosPieza,
          { numero: "", cantidad: "", metadata: null },
        ],
        defectos: Object.fromEntries(
          Object.entries(prev.defectos).map(([key, val]) => [
            key,
            val !== undefined
              ? Array.isArray(val)
                ? [...val, ""]
                : [val, ""]
              : undefined,
          ])
        ),
      }));
    }
  };

  const eliminarPieza = (index) => {
    resetearTemporizador();
    const nuevasPiezas = formData.numerosPieza.filter((_, i) => i !== index);

    setFormData((prev) => ({
      ...prev,
      numerosPieza: nuevasPiezas,
      defectos: Object.fromEntries(
        Object.entries(prev.defectos).map(([key, val]) => [
          key,
          Array.isArray(val) ? val.filter((_, i) => i !== index) : val,
        ])
      ),
    }));
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
              ? Array(prev.numerosPieza.length).fill("")
              : "",
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
    const fechaActual = new Date();

      setLoading(true);
      const dataToSend = {
        ...formData,
        numeroEntrada,
        totalInspeccionadas,
        totalNG,
        fecha: new Date().toISOString(),
        horaSalida: fechaActual.toLocaleTimeString('es-MX'),
        usuario: (await supabase.auth.getSession()).data.session?.user.email,
        
      };

      setHistoricoReportes((prev) => [...prev, dataToSend]);
      setNumeroEntrada((prev) => prev + 1);

      setSuccess(true);
      setTiempoInactivo(0);
      setGuardadoAutomatico(false);
      setTimeout(() => setSuccess(false), 3000);

      setFormData({
        numerosPieza: [{ numero: "", cantidad: "", metadata: null }],
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
  const totalNG = Object.values(formData.defectos).reduce(
    (sum, val) => sum + (parseInt(val) || 0),
    0
  );

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
    // Definir estructura de defectos según columnas del Excel
    const columnasDefectos = [
      "BURBUJA O DESPRENDIMIENTO",
      "MANCHA BLANCA", 
      "MANCHA NEGRA",
      "MANCHA TORNASOL",
      "ESCURRIMIENTO",
      "ASPERO",
      "QUEMADURA",
      "OPACO",
      "PUNTO DE CONTACTO",
      "COLOR DESIGUAL",
      "OXIDO",
      "OTRO"
    ];
  
    // Generar filas base (15 registros como en el template)
    const filasBase = Array.from({ length: 15 }, (_, i) => ({
      numeroEntrada: i + 1,
      datos: null
    }));
  
    // Mapear reportes a las filas correspondientes
    historicoReportes.forEach((reporte, index) => {
      if (index < 15) {
        const defectosMapeados = columnasDefectos.map(defecto => {
          const valorDefecto = reporte.defectos[defecto];
          
          if (valorDefecto === undefined) return "0";
          if (Array.isArray(valorDefecto)) return valorDefecto.join(", ");
          return valorDefecto;
        });
    
        filasBase[index] = {
          numeroEntrada: reporte.numeroEntrada,
          datos: {
            ...reporte,
            defectosMapeados
          }
        };
      }
    });
  
    // Crear estructura exacta del Excel
    const datos = [
      ["", "", "", "Reporte de Inspección 1 Linea 3", ...Array(14).fill(""), "CODIGO", "FPR-05"],
      ["", "", "", "", ...Array(14).fill(""), "VERSION", "1"],
      ["", "", "", "", ...Array(14).fill(""), "ACESSO", "B"],
      ["", "", "", "", ...Array(14).fill(""), "PAGINA", "1 de 7"],
      [
        "No. DE ENTRADA", 
        "", 
        "NUMERO DE PARTE", 
        "DEFECTO", 
        ...columnasDefectos, 
        "CANTIDAD NG", 
        "CANTIDAD OK", 
        "TOTAL ISPECCIONADAS", 
        "FECHA", 
        "HORA DE SALIDA", 
        "OBSERVACIONES"
      ],
      ...filasBase.map((fila, index) => [
        fila.datos?.numeroEntrada || index + 1,
        "",
        fila.datos?.numerosPieza[0]?.numero || "",
        "",
        ...(fila.datos?.defectosMapeados || Array(12).fill("0")),
        "",
        fila.datos?.totalOK || "0",
        fila.datos?.totalInspeccionadas || "0",
        fila.datos?.fecha ? new Date(fila.datos.fecha).toLocaleDateString("es-MX") : "",
        "",
        fila.datos?.horaSalida || "",
        fila.datos?.comentarios || ""
      ]),
      ["", ...Array(19).fill("")],
      ["", ...Array(19).fill("")],
      ["", ...Array(19).fill("")]
    ];
  
    return datos;
  };
  
  // Modificar la función de exportación
  const exportarAExcel = () => {
    const datos = prepararDatosParaExcel();
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.aoa_to_sheet(datos);
    
    // Ajustar anchos de columnas
    ws["!cols"] = [
      { width: 10 }, // No. Entrada
      { width: 5 },  // Espacio
      { width: 15 }, // Número de parte
      { width: 15 }, // Defecto
      ...Array(12).fill({ width: 12 }), // Columnas de defectos
      { width: 12 }, // CANTIDAD NG
      { width: 12 }, // CANTIDAD OK
      { width: 18 }, // TOTAL INSPECCIONADAS
      { width: 15 }, // FECHA
      { width: 15 }, // HORA DE SALIDA
      { width: 25 }  // OBSERVACIONES
    ];
  
    // Fusionar celdas para encabezados
    ws["!merges"] = [
      { s: { r: 0, c: 3 }, e: { r: 0, c: 17 } }, // Título principal
      { s: { r: 4, c: 3 }, e: { r: 4, c: 14 } }  // Encabezado DEFECTO
    ];
  
    XLSX.utils.book_append_sheet(wb, ws, "Reporte Insp 1 Linea 3 pag 1");
    XLSX.writeFile(wb, `FPR-05_Reporte_Inspeccion_VER.1_${new Date().toISOString().split('T')[0]}.xlsx`);
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

  const defectoTieneDatos = (defecto) => {
    const valorDefecto = formData.defectos[defecto];
    if (!valorDefecto) return false;
    
    if (Array.isArray(valorDefecto)) {
      return valorDefecto.some(v => parseInt(v) > 0);
    }
    return parseInt(valorDefecto) > 0;
  };

  return (
    <Card className="border-primary shadow-lg">
      <Card.Header className="bg-light border-0 py-4">
        <div className="text-center">
          <Image src={logo} alt="Logo" fluid style={{ maxHeight: "80px" }} />
          <h1 className="text-primary mb-3">Reporte de Inspección</h1>
          <div
            className={`h5 ${
              guardadoAutomatico ? "text-success" : "text-danger"
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
              {formData.numerosPieza.map((pieza, index) => {
                console.log(`Renderizando pieza ${index}:`, pieza); // Debug 3

                return (
                  <div key={index} className="mb-4">
                    <Row className="g-2">
                      <Col md={5}>
                        <Form.Control
                          type="text"
                          placeholder="Buscar producto"
                          value={pieza.numero}
                          onChange={(e) => {
                            setBusqueda(e.target.value);
                            handlePiezaChange(index, "numero", e.target.value);
                          }}
                          onFocus={() => setBusquedaActiva(true)}
                          onBlur={() =>
                            setTimeout(() => setBusquedaActiva(false), 200)
                          }
                          list={`productos-list-${index}`}
                          autoComplete="off"
                          required
                        />
                        <datalist id={`productos-list-${index}`}>
                          {productos.map((producto) => (
                            <option
                              key={producto.id}
                              value={producto.producto_id}
                            >
                              {producto.cliente_id} - {producto.descripcion}
                            </option>
                          ))}
                        </datalist>
                      </Col>

                      {/* Sección de metadata - Versión corregida */}
                      <Col md={5}>
                        {pieza.metadata && (
                          <Card className="mb-2 border-primary">
                            <Card.Body className="p-2">
                              <Row>
                                <Col md={6}>
                                  <Form.Label className="small text-muted">
                                    Cliente
                                  </Form.Label>
                                  <Form.Control
                                    plaintext
                                    readOnly
                                    value={pieza.metadata.cliente_id}
                                    className="fw-bold text-primary"
                                  />
                                </Col>
                                <Col md={6}>
                                  <Form.Label className="small text-muted">
                                    Descripción
                                  </Form.Label>
                                  <Form.Control
                                    plaintext
                                    readOnly
                                    value={pieza.metadata.descripcion}
                                    className="fw-bold text-dark"
                                  />
                                </Col>
                              </Row>
                            </Card.Body>
                          </Card>
                        )}
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

                    {index > 0 && (
                      <Button
                        variant="link"
                        size="sm"
                        className="text-danger mt-2"
                        onClick={() => eliminarPieza(index)}
                      >
                        <i className="bi bi-trash" /> Eliminar pieza
                      </Button>
                    )}
                  </div>
                );
              })}
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
      {defectos.map((defecto) => {
        const tieneDatos = formData.defectos[defecto] && 
          (Array.isArray(formData.defectos[defecto]) 
            ? formData.defectos[defecto].some(v => parseInt(v) > 0)
            : parseInt(formData.defectos[defecto]) > 0);
            
        return (
          <Button
            key={defecto}
            variant={
              selectedDefect === defecto || tieneDatos
                ? "primary"
                : "outline-primary"
            }
            onClick={() => handleDefectoSelect(defecto)}
            className="text-truncate"
          >
            {defecto}
            {tieneDatos && (
              <span className="ms-2">
                <i className="bi bi-check-circle-fill" />
              </span>
            )}
          </Button>
        );
      })}
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
                            formData.defectos[selectedDefect]?.[index] || ""
                          }
                          onChange={(e) =>
                            handleDefectoChange(e.target.value, index)
                          }
                          min="0"
                        />
                      </Form.Group>
                    </Col>
                  ))}
                </Row>
              </Card.Body>
            </Card>
          )}

          <Card className="mb-4">
            <Card.Body>
              <Form.Group controlId="comentarios">
                <Form.Label>Comentarios</Form.Label>
                <Form.Control
                  as="textarea"
                  name="comentarios"
                  value={formData.comentarios}
                  onChange={handleChange}
                  placeholder="Registre observaciones relevantes..."
                  style={{ minHeight: "100px" }}
                />
              </Form.Group>
            </Card.Body>
          </Card>

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
                        <th>Total N/G</th>
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
                            <Badge bg="danger" className="fs-6">
                              {reporte.totalInspeccionadas - reporte.totalOK }
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
