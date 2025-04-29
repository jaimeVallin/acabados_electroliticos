import { useState, useEffect } from 'react';
import { Alert, Button, Card, Form, Image, Row, Col, Table, Badge } from 'react-bootstrap';
import * as XLSX from 'xlsx';
import logo from '../assets/logo.png';
import Linea1Checklist from '../components/lineas/Linea1Checklist.jsx';
import Linea2Checklist from '../components/lineas/Linea2Checklist.jsx';
import Linea3Checklist from '../components/lineas/Linea3Checklist.jsx';
import Linea4Checklist from '../components/lineas/Linea4Checklist.jsx';

const CheckListTinas = () => {
  const TIEMPO_AUTOGUARDADO = 300;
  const lineasDisponibles = ['Línea 1', 'Línea 2', 'Línea 3', 'Línea 4'];
  
  const [lineaSeleccionada, setLineaSeleccionada] = useState(() => {
    const saved = localStorage.getItem('lineaSeleccionada');
    return saved || '';
  });
  
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [tiempoInactivo, setTiempoInactivo] = useState(0);
  const [guardadoAutomatico, setGuardadoAutomatico] = useState(false);
  const [historicoChecklists, setHistoricoChecklists] = useState(() => {
    const saved = localStorage.getItem('checklistsTinas');
    return saved ? JSON.parse(saved) : [];
  });

  const initialFormData = {
    desengraseInmersion: { temperatura: '', nivel: false },
    desengraseElectrolitico: { temperatura: '', amperaje: '', nivel: false },
    galvanizado: { temperatura: '', amperaje: '', ph: '', nivel: false },
    sello: { temperatura: '', ph: '', nivel: false },
    horno: { temperatura: '' },
    comentarios: '',
    enjuagues: Array(10).fill({ nivel: false }),
    activados: Array(3).fill({ nivel: false }),
    preSellos: Array(3).fill({ nivel: false })
  };

  const [formData, setFormData] = useState(() => {
    const saved = localStorage.getItem('formDataTinas');
    return saved ? JSON.parse(saved) : initialFormData;
  });

  useEffect(() => {
    localStorage.setItem('formDataTinas', JSON.stringify(formData));
  }, [formData]);

  useEffect(() => {
    localStorage.setItem('lineaSeleccionada', lineaSeleccionada);
  }, [lineaSeleccionada]);

  useEffect(() => {
    localStorage.setItem('checklistsTinas', JSON.stringify(historicoChecklists));
  }, [historicoChecklists]);

  useEffect(() => {
    let intervalo;
    if (lineaSeleccionada && !guardadoAutomatico) {
      intervalo = setInterval(() => {
        setTiempoInactivo(prev => {
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
  }, [lineaSeleccionada, guardadoAutomatico]);

  const resetearTemporizador = () => {
    setTiempoInactivo(0);
    setGuardadoAutomatico(false);
  };

  const handleChange = (e) => {
    resetearTemporizador();
    const { name, value, type, checked } = e.target;
    
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: { ...prev[parent], [child]: type === 'checkbox' ? checked : value }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      }));
    }
  };

  const handleArrayChange = (arrayName, index, field, value) => {
    resetearTemporizador();
    setFormData(prev => {
      const newArray = [...prev[arrayName]];
      newArray[index] = { ...newArray[index], [field]: value };
      return { ...prev, [arrayName]: newArray };
    });
  };

  const handleSubmit = async (e) => {
    e?.preventDefault();
    setError(null);
    
    if (!lineaSeleccionada) {
      setError('Seleccione una línea');
      return;
    }

    try {
      setLoading(true);
      const datosParaEnviar = {
        linea: lineaSeleccionada,
        ...formData,
        fecha: new Date().toISOString(),
        usuario: "UsuarioActual"
      };
      
      const nuevosChecklists = [...historicoChecklists, datosParaEnviar];
      setHistoricoChecklists(nuevosChecklists);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
      
      if (e?.isTrusted) setFormData(initialFormData);

    } catch (err) {
      setError(err.message || 'Error al guardar');
    } finally {
      setLoading(false);
    }
  };

  const handleLineaChange = (e) => {
    resetearTemporizador(); // <-- Nuevo reset aquí
    setLineaSeleccionada(e.target.value);
  };

  const exportarAExcel = () => {
    if (historicoChecklists.length === 0) {
      setError("No hay datos para exportar");
      return;
    }
  
    const wb = XLSX.utils.book_new();
    const wsData = [];
  
    // Metadatos y encabezado
    wsData.push(
      [],
      [],
      [],
      ["", "", "Check List de Tinas", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "Código:", "", "", "FPR-01"],
      ["", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "Versión:", "", "", "1"],
      ["", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "Acceso:", "", "", "B"],
      ["", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "Página:", "", "", "1 de 4"],
      ["Fecha:", "", "", "", `Línea: ${lineaSeleccionada.replace("Línea ", "")}`, "", "", "", "", "", "", "", "Realizo:", "", "", "", "", "", "", "", "", "", "",],
      ["Proceso", "Especificación", "Rango", "08:00", "", "10:00", "", "12:00", "", "14:00", "", "16:00", "", "18:00", "", "20:00", "", "21:00", "", "22:00", "", "COMENTARIOS"]
    );
  
    // Función para generar filas de OK/NG basadas en los datos
    const generarFilas = (proceso, especificacion, rango, datos) => {
      const filas = [];
      datos.forEach((item, idx) => {
        const row = [
          proceso,
          especificacion,
          rango,
          ...item.horas.flatMap(hora => [hora.ok ? "OK" : "NG", ""]), // Columnas OK/NG por hora
          item.comentario || ""
        ];
        filas.push(row);
        proceso = ""; // Solo mostrar proceso en la primera fila del grupo
      });
      return filas;
    };
  
    // Mapear datos del historial a la estructura del Excel
    historicoChecklists.forEach(item => {
      const horas = ["08:00", "10:00", "12:00", "14:00", "16:00", "18:00", "20:00", "21:00", "22:00"]
        .map(hora => ({ ok: Math.random() > 0.2 })); // Ejemplo: mock de datos
  
      // Añadir procesos (ajustar según estructura real de datos)
      wsData.push(
        ["Desengrase de inmersión", "Temperatura", "55-90°C", ...Array(18).fill(""), item.comentarios],
        ["", "Nivel", "Que tape las piezas", ...horas.flatMap(h => [h.ok ? "OK" : "NG", ""]), ""],
        ["Desengrase Electrolítico", "Temperatura", "55-90°C", ...Array(18).fill(""), ""],
        ["", "Amperaje", "400 a 600 amp", ...Array(18).fill(""), ""],
        ["", "Nivel", "Que tape las piezas", ...horas.flatMap(h => [h.ok ? "OK" : "NG", ""]), ""],
        // ... Repetir para otras secciones
        ["COMENTARIOS GENERALES:", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", item.comentarios]
      );
    });
  
    // Añadir footer
    wsData.push(
      [],
      [ "Este documento es propiedad exclusiva de ACABADOS ELECTROLITICOS DE AGUASCALIENTES S.A. de C.V..." ]
    );
  
    const ws = XLSX.utils.aoa_to_sheet(wsData);
    
    // Ajustar anchos de columnas (relativo al Excel original)
    ws["!cols"] = Array(24).fill().map(() => ({ width: 12 }));
    
    // Combinar celdas para encabezados
    ws["!merges"] = [
      { s: { r: 3, c: 2 }, e: { r: 3, c: 19 } }, // Título "Check List de Tinas"
      { s: { r: 8, c: 0 }, e: { r: 8, c: 2 } }, // Fecha
      { s: { r: 8, c: 4 }, e: { r: 8, c: 10 } }, // Línea
    ];
  
    XLSX.utils.book_append_sheet(wb, ws, "Checklists");
    XLSX.writeFile(wb, `Checklist_Tinas_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  const limpiarDatos = () => {
    if (window.confirm('¿Borrar todos los datos locales?')) {
      localStorage.removeItem('formDataTinas');
      localStorage.removeItem('checklistsTinas');
      localStorage.removeItem('lineaSeleccionada');
      setFormData(initialFormData);
      setHistoricoChecklists([]);
      setLineaSeleccionada('');
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    }
  };

  const renderChecklist = () => {
    const commonProps = { formData, handleChange, handleArrayChange };
    switch(lineaSeleccionada) {
      case 'Línea 1': return <Linea1Checklist {...commonProps} />;
      case 'Línea 2': return <Linea2Checklist {...commonProps} />;
      case 'Línea 3': return <Linea3Checklist {...commonProps} />;
      case 'Línea 4': return <Linea4Checklist {...commonProps} />;
      default: return null;
    }
  };

  const formatoTiempo = (segundos) => {
    const mins = Math.floor(segundos / 60);
    const secs = segundos % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <Card className="border-primary shadow-lg">
      <Card.Header className="bg-light border-0 py-4">
        <div className="text-center">
          <Image src={logo} alt="Logo" fluid style={{ maxHeight: '80px' }} />
          <h1 className="text-primary mb-3">
            <i className="bi bi-clipboard-check me-2" />
            Check-List de Tinas
          </h1>
          {lineaSeleccionada && (
            <div className={`h5 ${guardadoAutomatico ? 'text-success' : 'text-warning'}`}>
              <i className={`bi ${guardadoAutomatico ? 'bi-check-circle' : 'bi-clock-history'} me-2`} />
              {guardadoAutomatico 
                ? 'Datos autoguardados'
                : `Autoguardado en: ${formatoTiempo(TIEMPO_AUTOGUARDADO - tiempoInactivo)}`}
            </div>
          )}
        </div>
      </Card.Header>
      
      <Card.Body className="p-4">
        {error && <Alert variant="danger" dismissible onClose={() => setError(null)}>{error}</Alert>}
        {success && <Alert variant="success" dismissible>Operación exitosa!</Alert>}

        <Form onSubmit={handleSubmit}>
          <Card className="mb-4">
            <Card.Body>
              <Form.Group controlId="lineaProduccion">
                <Form.Label className="fw-bold">Línea de Producción</Form.Label>
                <Form.Select
                  value={lineaSeleccionada}
                  onChange={handleLineaChange} // <-- Nuevo handler aquí
                  className="fs-5"
                  required
                >
                  <option value="">Seleccione una línea</option>
                  {lineasDisponibles.map((linea, index) => (
                    <option key={index} value={linea}>{linea}</option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Card.Body>
          </Card>

          {lineaSeleccionada && (
            <>
              <Card className="mb-4">
                <Card.Body>
                  <h3 className="text-primary mb-4">
                    <i className="bi bi-gear-wide-connected me-2" />
                    {lineaSeleccionada}
                  </h3>
                  {renderChecklist()}
                </Card.Body>
              </Card>

              <Row className="g-3 mb-5">
                <Col md={4}>
                  <Button 
                    variant="primary" 
                    type="submit" 
                    disabled={loading}
                    className="w-100 py-3 fs-5"
                  >
                    {loading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" />
                        Guardando...
                      </>
                    ) : (
                      <>
                        <i className="bi bi-save me-2" />
                        Guardar Manual
                      </>
                    )}
                  </Button>
                </Col>
                <Col md={4}>
                  <Button
                    variant="success"
                    onClick={exportarAExcel}
                    disabled={historicoChecklists.length === 0}
                    className="w-100 py-3 fs-5"
                  >
                    <i className="bi bi-file-earmark-excel me-2" />
                    Exportar Excel
                  </Button>
                </Col>
                <Col md={4}>
                  <Button
                    variant="outline-danger"
                    onClick={limpiarDatos}
                    className="w-100 py-3 fs-5"
                  >
                    <i className="bi bi-trash me-2" />
                    Limpiar Todo
                  </Button>
                </Col>
              </Row>

              

              {historicoChecklists.length > 0 && (
                <Card>
                  <Card.Header className="bg-light">
                    <Row className="align-items-center">
                      <Col>
                        <h4 className="mb-0">
                          <i className="bi bi-archive me-2" />
                          Historial ({historicoChecklists.length})
                        </h4>
                      </Col>
                      <Col className="text-end">
                        <Button 
                          variant="link" 
                          onClick={exportarAExcel}
                          className="text-decoration-none"
                        >
                          <i className="bi bi-download me-2" />
                          Exportar todo
                        </Button>
                      </Col>
                    </Row>
                  </Card.Header>
                  <Card.Body className="p-0">
                    <div className="table-responsive" style={{ maxHeight: '400px' }}>
                      <Table striped hover className="mb-0">
                        <thead className="sticky-top bg-light">
                          <tr>
                            <th>Línea</th>
                            <th>Fecha</th>
                            <th>Hora</th>
                            <th>Acciones</th>
                          </tr>
                        </thead>
                        <tbody>
                          {historicoChecklists.map((item, index) => (
                            <tr key={index}>
                              <td className="fw-bold">{item.linea}</td>
                              <td>{new Date(item.fecha).toLocaleDateString('es-MX')}</td>
                              <td>{new Date(item.fecha).toLocaleTimeString('es-MX')}</td>
                              <td>
                                <Button 
                                  variant="primary"
                                  size="sm"
                                  onClick={() => {
                                    setFormData(item);
                                    setLineaSeleccionada(item.linea);
                                  }}
                                  className="d-flex align-items-center gap-2"
                                >
                                  <i className="bi bi-cloud-arrow-down" />
                                  <span>  Cargar reporte </span>
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
            </>
          )}
        </Form>
      </Card.Body>
    </Card>
  );
};

export default CheckListTinas;