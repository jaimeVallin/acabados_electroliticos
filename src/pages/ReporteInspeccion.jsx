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
  // Hook para navegación entre rutas
  const navigate = useNavigate();
  
  // Constante para el tiempo de autoguardado (60 segundos)
  const TIEMPO_AUTOGUARDADO = 60;
  
  // Función para verificar conexión a internet
  const hayInternet = () => {
    return window.navigator.onLine;
  };

  // Estado para el número de entrada (persistente en localStorage)
  const [numeroEntrada, setNumeroEntrada] = useState(() => {
    const saved = localStorage.getItem("numeroEntrada");
    return saved ? parseInt(saved) : 1;
  });

  // Estado principal del formulario
  const [formData, setFormData] = useState({
    numerosPieza: [{ numero: "", cantidad: "", metadata: null }], // Array de piezas
    defectos: {}, // Objeto para almacenar defectos
    totalOK: 0, // Total de piezas OK
    comentarios: "", // Comentarios adicionales
  });
  
  // Estados para gestión de la UI y datos
  const [editandoReporte, setEditandoReporte] = useState(null); // ID del reporte en edición
  const [productos, setProductos] = useState([]); // Lista de productos disponibles
  const [busqueda, setBusqueda] = useState(""); // Término de búsqueda
  const [busquedaActiva, setBusquedaActiva] = useState(false); // Flag para búsqueda activa
  const [totalInspeccionadas, setTotalInspeccionadas] = useState(0); // Total de piezas inspeccionadas
  const [error, setError] = useState(null); // Mensajes de error
  const [success, setSuccess] = useState(false); // Mensajes de éxito
  const [loading, setLoading] = useState(false); // Estado de carga
  const [selectedDefect, setSelectedDefect] = useState(null); // Defecto seleccionado actualmente
  
  // Historial de reportes (persistente en localStorage)
  const [historicoReportes, setHistoricoReportes] = useState(() => {
    const saved = localStorage.getItem("reportesInspeccion");
    return saved ? JSON.parse(saved) : [];
  });
  
  // Estados para el autoguardado
  const [tiempoInactivo, setTiempoInactivo] = useState(0);
  const [guardadoAutomatico, setGuardadoAutomatico] = useState(false);
  
  // Lista de defectos predefinidos
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
    "OTRO",
  ];

  // Efecto para verificar autenticación al cargar el componente
  useEffect(() => {
    const checkAuth = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) navigate("/login");
    };
    checkAuth();
  }, [navigate]);

  // Efecto para persistir número de entrada en localStorage
  useEffect(() => {
    localStorage.setItem("numeroEntrada", numeroEntrada.toString());
  }, [numeroEntrada]);

  // Efecto para persistir historial de reportes en localStorage
  useEffect(() => {
    localStorage.setItem(
      "reportesInspeccion",
      JSON.stringify(historicoReportes)
    );
  }, [historicoReportes]);

  // Efecto para calcular total de piezas inspeccionadas
  useEffect(() => {
    const total = formData.numerosPieza.reduce(
      (sum, pieza) => sum + (parseInt(pieza.cantidad) || 0),
      0
    );
    setTotalInspeccionadas(total);
  }, [formData.numerosPieza]);

  // Efecto para calcular total de piezas OK
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

  // Efecto para manejar el autoguardado después de inactividad
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

  // Efecto para búsqueda de productos con debounce
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

  // Efecto para actualizar caché de productos cada 5 minutos
  useEffect(() => {
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

  // Efecto para cargar productos iniciales desde caché
  useEffect(() => {
    const productosIniciales =
      JSON.parse(localStorage.getItem("productos_cache")) || [];
    setProductos(productosIniciales);
  }, []);

  // Función para reiniciar temporizador de inactividad
  const resetearTemporizador = () => {
    setTiempoInactivo(0);
    setGuardadoAutomatico(false);
  };

  // Maneja la selección de un producto para una pieza
  const handleSeleccionProducto = (index, value) => {
    const productoSeleccionado = productos.find((p) => p.combinado_id  === value);

    if (productoSeleccionado) {
      const nuevosNumerosPieza = [...formData.numerosPieza];
      nuevosNumerosPieza[index] = {
        ...nuevosNumerosPieza[index],
        numero: productoSeleccionado.combinado_id,
        metadata: {
          cliente_id: productoSeleccionado.cliente_id,
          combinado_id: productoSeleccionado.combinado_id,
          descripcion: productoSeleccionado.descripcion,
          numero_parte: productoSeleccionado.producto_id,
        },
      };

      setFormData((prev) => ({
        ...prev,
        numerosPieza: nuevosNumerosPieza,
      }));
    }
  };

  // Maneja cambios en campos del formulario principal
  const handleChange = (e) => {
    resetearTemporizador();
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Maneja cambios en los campos de piezas
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

  // Agrega una nueva pieza al formulario
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

  // Elimina una pieza del formulario
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

  // Maneja la selección de un defecto
  const handleDefectoSelect = (defecto) => {
    setSelectedDefect(defecto);
    if (!formData.defectos[defecto]) {
      setFormData((prev) => ({
        ...prev,
        defectos: {
          ...prev.defectos,
          [defecto]: prev.numerosPieza.length > 1 
            ? Array(prev.numerosPieza.length).fill("") 
            : "", // Valor único para 1 pieza
        },
      }));
    }
  };

  // Maneja cambios en los valores de defectos
  const handleDefectoChange = (value, piezaIndex = 0) => {
    resetearTemporizador();
    if (!selectedDefect) return;

    // Validar que sea un número válido (entero positivo) o cadena vacía
    const numericValue = value === "" ? "" : Math.max(0, parseInt(value) || 0);

    setFormData((prev) => ({
      ...prev,
      defectos: {
        ...prev.defectos,
        [selectedDefect]: Array.isArray(prev.defectos[selectedDefect])
          ? prev.defectos[selectedDefect].map((v, i) =>
              i === piezaIndex ? numericValue : v
            )
          : numericValue,
      },
    }));
  };

  // Maneja el envío del formulario
  const handleSubmit = async (e) => {
    e?.preventDefault();
    setError(null);

    try {
      setLoading(true);
      const fechaActual = new Date();

      // Prepara los datos para guardar
      const dataToSend = {
        ...formData,
        numeroEntrada: editandoReporte || numeroEntrada,
        totalInspeccionadas,
        totalOK: formData.totalOK,
        comentarios: formData.comentarios,
        fecha: fechaActual.toISOString(),
        horaSalida: fechaActual.toLocaleTimeString("es-MX", {
          hour: "2-digit",
          minute: "2-digit",
        }),
      };

      if (editandoReporte) {
        // Actualizar reporte existente
        setHistoricoReportes((prev) =>
          prev.map((reporte) =>
            reporte.numeroEntrada === editandoReporte ? dataToSend : reporte
          )
        );
        setSuccess(true);
        setTimeout(() => setSuccess(false), 3000);
      } else {
        // Crear nuevo reporte
        setHistoricoReportes((prev) => [...prev, dataToSend]);
        setNumeroEntrada((prev) => prev + 1);

        // Limpiar formulario
        setFormData({
          numerosPieza: [{ numero: "", cantidad: "", metadata: null }],
          defectos: {},
          totalOK: 0,
          comentarios: "",
        });
        setSuccess(true);
        setTimeout(() => setSuccess(false), 3000);
      }

      // Resetear estados de autoguardado
      setTiempoInactivo(0);
      setGuardadoAutomatico(false);
      setSelectedDefect(null);
      setEditandoReporte(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Carga un reporte existente para edición
  const cargarReporte = (reporte) => {
    setFormData({
      numerosPieza: reporte.numerosPieza,
      defectos: reporte.defectos,
      totalOK: reporte.totalOK,
      comentarios: reporte.comentarios,
      totalInspeccionadas: reporte.totalInspeccionadas,
    });

    setEditandoReporte(reporte.numeroEntrada);
    setSelectedDefect(null);
    setSuccess(true);
    setTimeout(() => setSuccess(false), 1500);
  };

  // Prepara los datos para exportar a Excel
  const prepararDatosParaExcel = () => {
    const defectosColumns = [
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
      "OTRO",
    ];

    // 1. Cabecera del reporte
    const datos = [
      [
        "",
        "",
        "",
        "Reporte de Inspección",
        ...Array(14).fill(""),
        Array(15).fill(""),
        "HORA DE SALIDA",
        "OBSERVACIONES",
      ],
      Array(20).fill(""), // Fila vacía
      Array(20).fill(""), // Fila vacía
      [
        "No. DE ENTRADA",
        "",
        "NUMERO DE PARTE",
        "DEFECTO",
        ...defectosColumns,
        "CANTIDAD NG",
        "CANTIDAD OK",
        "TOTAL ISPECCIONADAS",
      ],
    ];

    // 2. Llenar datos (15 filas)
    for (let i = 0; i < 15; i++) {
      const reporte = historicoReportes[i] || {};
      const defectosData = defectosColumns.map((defecto) => {
        if (!reporte.defectos || !reporte.defectos[defecto]) return "";
        return Array.isArray(reporte.defectos[defecto])
          ? reporte.defectos[defecto][0] || ""
          : reporte.defectos[defecto];
      });

      datos.push([
        reporte.numeroEntrada || i + 1,
        "",
        reporte.numerosPieza?.[0]?.numero || "",
        "", // Celda DEFECTO vacía
        ...defectosData,
        reporte.totalInspeccionadas - (reporte.totalOK || 0),
        reporte.totalOK || "",
        reporte.totalInspeccionadas || "",
        reporte.horaSalida || "",
        reporte.comentarios || "",
      ]);
    }

    // 3. Añadir filas vacías finales
    datos.push(Array(20).fill(""));
    datos.push(Array(20).fill(""));

    return datos;
  };

  // Exporta los datos a Excel
  const exportarAExcel = () => {
    const datos = prepararDatosParaExcel();
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.aoa_to_sheet(datos);

    // Configurar anchos de columnas
    ws["!cols"] = [
      { width: 12 }, // No. Entrada
      { width: 2 }, // Espacio
      { width: 18 }, // Número de parte
      { width: 10 }, // Defecto (columna vacía)
      ...Array(12).fill({ width: 14 }), // Columnas de defectos
      { width: 12 }, // CANTIDAD NG
      { width: 12 }, // CANTIDAD OK
      { width: 18 }, // TOTAL ISPECCIONADAS
      { width: 15 }, // Vacía
      { width: 14 }, // HORA DE SALIDA
      { width: 25 }, // OBSERVACIONES
    ];

    // Fusionar celdas para el título
    ws["!merges"] = [
      { s: { r: 0, c: 3 }, e: { r: 0, c: 16 } }, // Título "Reporte de Inspección"
    ];

    XLSX.utils.book_append_sheet(wb, ws, "Reporte Insp 1 Linea 3 pag 1");
    XLSX.writeFile(
      wb,
      `Reporte_Inspeccion_${new Date().toISOString().split("T")[0]}.xlsx`
    );
  };

  // Limpia todos los reportes guardados
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
      setEditandoReporte(null);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    }
  };

  // Formatea segundos a MM:SS
  const formatoTiempo = (segundos) => {
    const mins = Math.floor(segundos / 60);
    const secs = segundos % 60;
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  // Verifica si un defecto tiene datos
  const defectoTieneDatos = (defecto) => {
    const valorDefecto = formData.defectos[defecto];
    if (!valorDefecto) return false;

    if (Array.isArray(valorDefecto)) {
      return valorDefecto.some((v) => parseInt(v) > 0);
    }
    return parseInt(valorDefecto) > 0;
  };

  // Renderizado del componente
  return (
    <Card className="border-primary shadow-lg">
      {/* Cabecera con logo y título */}
      <Card.Header className="bg-light border-0 py-4">
        <div className="text-center">
          <Image src={logo} alt="Logo" fluid style={{ maxHeight: "80px" }} />
          <h1 className="text-primary mb-3">Reporte de Inspección</h1>
          {/* Indicador de autoguardado */}
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

      {/* Cuerpo principal del formulario */}
      <Card.Body className="p-4">
        {/* Alertas de error/éxito */}
        {error && (
          <Alert variant="danger" dismissible onClose={() => setError(null)}>
            {error}
          </Alert>
        )}
        {success && (
          <Alert variant="success" dismissible>
            {guardadoAutomatico
              ? "Reporte autoguardado con éxito!"
              : "Reporte guardado con éxito!"}
          </Alert>
        )}

        <Form onSubmit={handleSubmit}>
          {/* Sección de número de entrada */}
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

          {/* Sección de piezas inspeccionadas */}
          <Card className="mb-4">
            <Card.Body>
              <h4 className="text-primary mb-3">
                <i className="bi bi-box-seam me-2" />
                Piezas Inspeccionadas
              </h4>
              {formData.numerosPieza.map((pieza, index) => (
                <div key={index} className="mb-4">
                  <Row className="g-2">
                    {/* Campo de búsqueda de producto */}
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

                    {/* Metadata del producto seleccionado */}
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

                    {/* Botón para agregar pieza (solo en primera fila) */}
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

                  {/* Botón para eliminar pieza (solo en piezas adicionales) */}
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
              ))}
            </Card.Body>
          </Card>

          {/* Sección de defectos */}
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
                  const tieneDatos = defectoTieneDatos(defecto);

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

          {/* Sección para ingresar cantidades de defectos seleccionados */}
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

          {/* Sección de comentarios */}
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

          {/* Botones principales */}
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
                    {editandoReporte ? "Actualizar Reporte" : "Guardar Reporte"}
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

          {/* Historial de reportes */}
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
                              {reporte.totalInspeccionadas - reporte.totalOK}
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