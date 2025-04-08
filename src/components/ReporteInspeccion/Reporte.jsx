import { useReporteLogic } from './useReporteLogic';
import Cabecera from './subcomponents/Cabecera';
import DatosPrincipales from './subcomponents/DatosPrincipales';
import PiezasForm from './subcomponents/PiezasForm';
import DefectosForm from './subcomponents/DefectosForm';
import DefectoSeleccionado from './subcomponents/DefectoSeleccionado';
import TotalesForm from './subcomponents/TotalesForm';
import Acciones from './subcomponents/Acciones';
import { Card, Alert, Form } from 'react-bootstrap';

const Reporte = () => {
  const {
    formData,
    numeroReporte,
    tiempoInactivo,
    guardadoAutomatico,
    historicoReportes,
    error,
    success,
    loading,
    selectedDefect,
    totalInspeccionadas,
    defectos,
    handleChange,
    handlePiezaChange,
    agregarPieza,
    handleDefectoSelect,
    handleDefectoChange,
    handleSubmit,
    exportarAExcel,
    enviarASupabase,
    limpiarReportes
  } = useReporteLogic();

  return (
    <Card className="border-primary">
      <Cabecera 
        numeroReporte={numeroReporte}
        tiempoInactivo={tiempoInactivo}
        guardadoAutomatico={guardadoAutomatico}
        historicoReportes={historicoReportes}
        formData={formData}
      />
      
      <Card.Body>
        {error && <Alert variant="danger">{error}</Alert>}
        {success && <Alert variant="success">Operación realizada correctamente!</Alert>}

        <Form onSubmit={handleSubmit}>
          <DatosPrincipales numeroReporte={numeroReporte} />
          <PiezasForm 
            formData={formData} 
            handlePiezaChange={handlePiezaChange}
            agregarPieza={agregarPieza}
            totalInspeccionadas={totalInspeccionadas}
          />
          <DefectosForm 
            defectos={defectos}
            selectedDefect={selectedDefect}
            handleDefectoSelect={handleDefectoSelect}
          />
          
          {selectedDefect && (
            <DefectoSeleccionado 
              selectedDefect={selectedDefect}
              formData={formData}
              handleDefectoChange={handleDefectoChange}
            />
          )}

          <TotalesForm 
            formData={formData} 
            handleChange={handleChange} 
          />
          <Acciones 
            loading={loading}
            historicoReportes={historicoReportes}
            exportarAExcel={exportarAExcel}
            enviarASupabase={enviarASupabase}
            limpiarReportes={limpiarReportes}
          />
        </Form>
      </Card.Body>
    </Card>
  );
};

export default Reporte;