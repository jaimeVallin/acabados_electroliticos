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
    galvanizado2: { temperatura: '', amperaje: '', ph: '', nivel: false },
    sello: { temperatura: '', ph: '', nivel: false },
    selloColdipBlack: { temperatura: '', ph: '', nivel: false },
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
    resetearTemporizador();
    setLineaSeleccionada(e.target.value);
  };

  const generarHojaExcel = (lineaNum) => {
    const lineaData = historicoChecklists.filter(item => item.linea === `Línea ${lineaNum}`);
    const wsData = [];
    
    // Encabezado
    wsData.push(
      ["", "", "", "", `Línea: ${lineaNum}`, "", "", "", "", "", "", "", "", "Realizo:", "", "", "", "", "", "", "", "", ""],
      ["Proceso", "Especificación", "Rango", "08:00:00", "", "10:00:00", "", "12:00:00", "", "14:00:00", "", "16:00:00", "", "18:00:00", "", "20:00:00", "", "21:00:00", "", "22:00:00", "", "COMENTARIOS"],
      Array(22).fill("")
    );

    // Procesos según línea
    const procesos = {
      1: [
        ["Desengrase de inmersión", "Temperatura", "55-90°C"],
        ["", "Nivel", "Que tape las piezas"],
        ["Desengrase Electrolítico", "Temperatura", "55-90°C"],
        ["", "Amperaje", "400 a 600 amp"],
        ["", "Nivel", "Que tape las piezas"],
        ["Enjuague", "Nivel", ""],
        ["Enjuague", "Nivel", ""],
        ["Activado", "Nivel", ""],
        ["Enjuague", "Nivel", ""],
        ["Enjuague", "Nivel", ""],
        ["Galvanizado", "Temperatura", "17-38°C"],
        ["", "PH", "4.2-5.8"],
        ["", "Amperaje", "100 a 400 amp"],
        ["", "Nivel", "Que tape las piezas"],
        ["Enjuague", "Nivel", ""],
        ["Pre-sello", "Nivel", ""],
        ["Sello", "Temperatura", "17-29°C"],
        ["", "PH", "1.5-3.0"],
        ["", "Nivel", "Que tape las piezas"],
        ["Enjuague", "Nivel", ""],
        ["Enjuague", "Nivel", ""],
        ["Horno", "Temperatura", "50-90°C"]
      ],
      2: [
        ["Desengrase de inmersión", "Temperatura", "55-90°C"],
        ["", "Nivel", "Que tape las piezas"],
        ["Desengrase Electrolítico", "Temperatura", "55-90°C"],
        ["", "Amperaje", "400 a 600 amp"],
        ["", "Nivel", "Que tape las piezas"],
        ["Enjuague", "Nivel", ""],
        ["Enjuague", "Nivel", ""],
        ["Activado", "Nivel", ""],
        ["Enjuague", "Nivel", ""],
        ["Enjuague", "Nivel", ""],
        ["Galvanizado", "Temperatura", "17-38°C"],
        ["", "PH", "4.2-5.8"],
        ["", "Amperaje", "100 a 400 amp"],
        ["", "Nivel", "Que tape las piezas"],
        ["Enjuague", "Nivel", ""],
        ["Enjuague", "Nivel", ""],
        ["Pre-sello", "Nivel", ""],
        ["Sello", "Temperatura", "17-29°C"],
        ["", "PH", "1.5-3.0"],
        ["", "Nivel", "Que tape las piezas"],
        ["Enjuague", "Nivel", ""],
        ["Enjuague", "Nivel", ""],
        ["Enjuague", "Nivel", ""],
        ["Horno", "Temperatura", "50-90°C"]
      ],
      3: [
        ["Desengrase de inmersión", "Temperatura", "55-90°C"],
        ["", "Nivel", "Que tape las piezas"],
        ["Desengrase Electrolítico", "Temperatura", "55-90°C"],
        ["", "Amperaje", "400 a 600 amp"],
        ["", "Nivel", "Que tape las piezas"],
        ["Enjuague", "Nivel", ""],
        ["Enjuague", "Nivel", ""],
        ["", "Nivel", ""],
        ["Enjuague", "Nivel", ""],
        ["Enjuague", "Nivel", ""],
        ["Galvanizado 1", "Temperatura", "17-38°C"],
        ["", "PH", "4.2-5.8"],
        ["", "Amperaje", "100 a 400 amp"],
        ["", "Nivel", "Que tape las piezas"],
        ["Galvanizado 2", "Temperatura", "17-38°C"],
        ["", "PH", "4.2-5.8"],
        ["", "Amperaje", "100 a 400 amp"],
        ["", "Nivel", "Que tape las piezas"],
        ["Enjuague", "Nivel", ""],
        ["Pre-sello", "Nivel", ""],
        ["Sello", "Temperatura", "17-29°C"],
        ["", "PH", "1.5-3.0"],
        ["", "Nivel", "Que tape las piezas"],
        ["Enjuague", "Nivel", ""],
        ["Enjuague", "Nivel", ""],
        ["Horno", "Temperatura", "50-90°C"]
      ],
      4: [
        ["Desengrase Electrolítico", "Temperatura", "55-90°C"],
        ["", "Amperaje", "400 a 600 amp"],
        ["", "Nivel", "Que tape las piezas"],
        ["Enjuague", "Nivel", ""],
        ["Activado", "Nivel", ""],
        ["Enjuague", "Nivel", ""],
        ["Galvanizado", "Temperatura", "17-38°C"],
        ["", "PH", "4.2-5.8"],
        ["", "Amperaje", "100 a 400 amp"],
        ["", "Nivel", "Que tape las piezas"],
        ["Enjuague", "Nivel", ""],
        ["Enjuague", "Nivel", ""],
        ["Enjuague", "Nivel", ""],
        ["Sello Coldip Black", "Temperatura", "17-29°C"],
        ["", "PH", "1.5-3.0"],
        ["", "Nivel", "Que tape las piezas"],
        ["Enjuague", "Nivel", ""],
        ["Enjuague", "Nivel", ""],
        ["Horno", "Temperatura", "50-90°C"]
      ]
    };

    // Agregar procesos
    procesos[lineaNum].forEach(proceso => {
      wsData.push([...proceso, ...Array(19).fill("")]);
    });

    // Agregar datos
    lineaData.forEach(item => {
      const horas = ["08:00", "10:00", "12:00", "14:00", "16:00", "18:00", "20:00", "21:00", "22:00"];
      
      // Mapeo de campos a posiciones en Excel
      const mapeoCampos = {
        1: {
          'desengraseInmersion.temperatura': 3,
          'desengraseInmersion.nivel': 4,
          'desengraseElectrolitico.temperatura': 5,
          'desengraseElectrolitico.amperaje': 6,
          'desengraseElectrolitico.nivel': 7,
          'enjuagues.0.nivel': 8,
          'enjuagues.1.nivel': 9,
          'activados.0.nivel': 10,
          'enjuagues.2.nivel': 11,
          'enjuagues.3.nivel': 12,
          'galvanizado.temperatura': 13,
          'galvanizado.ph': 14,
          'galvanizado.amperaje': 15,
          'galvanizado.nivel': 16,
          'enjuagues.4.nivel': 17,
          'preSellos.0.nivel': 18,
          'sello.temperatura': 19,
          'sello.ph': 20,
          'sello.nivel': 21,
          'enjuagues.5.nivel': 22,
          'enjuagues.6.nivel': 23,
          'horno.temperatura': 24
        },
        // ... (mapeos similares para líneas 2, 3 y 4)
      };

      horas.forEach((hora, horaIdx) => {
        const colExcel = 3 + (horaIdx * 2);
        
        Object.entries(mapeoCampos[lineaNum]).forEach(([campo, fila]) => {
          const [seccion, propiedad] = campo.includes('.') ? 
            campo.split('.') : [campo, ''];
          
          let valor;
          if (seccion.includes('enjuagues') || seccion.includes('activados') || seccion.includes('preSellos')) {
            const [arrayName, index, prop] = campo.split('.');
            valor = item[arrayName][index][prop];
          } else {
            valor = item[seccion][propiedad];
          }

          if (typeof valor === 'boolean') {
            wsData[fila][colExcel] = valor ? "OK" : "NG";
          } else if (valor) {
            wsData[fila][colExcel] = valor;
          }
        });
      });

      // Comentarios
      wsData[wsData.length - 1][22] = item.comentarios;
    });

    // Footer
    wsData.push(
      Array(22).fill(""),
      ["Este documento es propiedad exclusiva de ACABADOS ELECTROLITICOS DE AGUASCALIENTES S.A. de C.V..."]
    );

    const ws = XLSX.utils.aoa_to_sheet(wsData);
    
    // Configurar merges
    const mergesComunes = [
      { s: { r: 0, c: 4 }, e: { r: 0, c: 10 } }, // Línea
      { s: { r: 0, c: 13 }, e: { r: 0, c: 21 } } // Realizo
    ];

    // Merges específicos por proceso
    procesos[lineaNum].forEach((proceso, idx) => {
      if (proceso[0] !== "") {
        mergesComunes.push({ s: { r: idx + 3, c: 0 }, e: { r: idx + 3, c: 2 } });
      }
    });

    ws["!merges"] = mergesComunes;
    ws["!cols"] = Array(22).fill().map(() => ({ width: 14 }));

    return ws;
  };

  const exportarAExcel = () => {
    if (historicoChecklists.length === 0) {
      setError("No hay datos para exportar");
      return;
    }

    const wb = XLSX.utils.book_new();
    
    // Crear hoja para cada línea
    [1, 2, 3, 4].forEach(lineaNum => {
      const ws = generarHojaExcel(lineaNum);
      XLSX.utils.book_append_sheet(wb, ws, `Check List Linea ${lineaNum}`);
    });

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
            <div className={`h5 ${guardadoAutomatico ? 'text-success' : 'text-danger'}`}>
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
                  onChange={handleLineaChange}
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