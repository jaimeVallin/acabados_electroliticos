import { useState } from 'react';
import { Alert, Button, Card, Form, Image } from 'react-bootstrap';
import logo from '../assets/logo.png';
import Linea1Checklist from '../components/lineas/Linea1Checklist.jsx';
import Linea2Checklist from '../components/lineas/Linea2Checklist.jsx';
import Linea3Checklist from '../components/lineas/Linea3Checklist.jsx';
import Linea4Checklist from '../components/lineas/Linea4Checklist.jsx';

const CheckListTinas = () => {
  const lineasDisponibles = ['Línea 1', 'Línea 2', 'Línea 3', 'Línea 4'];
  const [lineaSeleccionada, setLineaSeleccionada] = useState('');
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  // Estado inicial común para todas las líneas
  const [formData, setFormData] = useState({
    // Procesos comunes
    desengraseInmersion: { temperatura: '', nivel: false },
    desengraseElectrolitico: { temperatura: '', amperaje: '', nivel: false },
    galvanizado: { temperatura: '', amperaje: '', ph: '', nivel: false },
    sello: { temperatura: '', ph: '', nivel: false },
    horno: { temperatura: '' },
    comentarios: '',
    
    // Arrays para enjuagues y otros procesos repetitivos
    enjuagues: Array(10).fill({ nivel: false }),
    activados: Array(3).fill({ nivel: false }),
    preSellos: Array(3).fill({ nivel: false })
  });

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

  const handleArrayChange = (arrayName, index, field, value) => {
    setFormData(prev => {
      const newArray = [...prev[arrayName]];
      newArray[index] = { ...newArray[index], [field]: value };
      return { ...prev, [arrayName]: newArray };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    
    if (!lineaSeleccionada) {
      setError('Por favor seleccione una línea');
      return;
    }

    try {
      setLoading(true);
      const datosParaEnviar = {
        linea: lineaSeleccionada,
        ...formData
      };
      
      console.log('Datos a enviar:', datosParaEnviar);
      // await supabase.from('checklists').insert([datosParaEnviar]);
      
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError(err.message || 'Error al guardar el checklist');
    } finally {
      setLoading(false);
    }
  };

  const renderChecklist = () => {
    const commonProps = {
      formData,
      handleChange,
      handleArrayChange
    };

    switch(lineaSeleccionada) {
      case 'Línea 1': return <Linea1Checklist {...commonProps} />;
      case 'Línea 2': return <Linea2Checklist {...commonProps} />;
      case 'Línea 3': return <Linea3Checklist {...commonProps} />;
      case 'Línea 4': return <Linea4Checklist {...commonProps} />;
      default: return null;
    }
  };

  return (
    <Card>
      <Card.Body>
        <div className="text-center mb-4">
          <Image src={logo} alt="Logo" fluid style={{ maxHeight: '100px' }} />
        </div>

        <h2 className="text-center mb-4">Check-List de Tinas</h2>
        
        {error && <Alert variant="danger">{error}</Alert>}
        {success && <Alert variant="success">Checklist guardado correctamente!</Alert>}
        
        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-4">
            <Form.Label>Línea</Form.Label>
            <Form.Select
              value={lineaSeleccionada}
              onChange={(e) => setLineaSeleccionada(e.target.value)}
              required
            >
              <option value="">Seleccione una línea</option>
              {lineasDisponibles.map((linea, index) => (
                <option key={index} value={linea}>{linea}</option>
              ))}
            </Form.Select>
          </Form.Group>

          {renderChecklist()}

          {lineaSeleccionada && (
            <Button 
              disabled={loading} 
              className="w-100 mt-3" 
              type="submit"
              size="lg"
            >
              {loading ? 'Guardando...' : 'Guardar Checklist'}
            </Button>
          )}
        </Form>
      </Card.Body>
    </Card>
  );
};

export default CheckListTinas;