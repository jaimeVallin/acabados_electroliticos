import { Card, Image } from 'react-bootstrap';
import logo from '../../../assets/logo.png';

const Cabecera = ({ contadorReportes, tiempoInactivo, guardadoAutomatico, historicoReportes, formData }) => {
  return (
    <Card.Header className="bg-transparent border-0">
      <div className="text-center">
        <Image src={logo} alt="Logo" fluid style={{ maxHeight: "20%" }} />
        <h2 className="mt-2">Reporte de Inspección</h2>
        <div className="d-flex justify-content-center gap-3 mt-2">
          <span className="badge bg-primary">
            Reporte #: {contadorReportes}
          </span>
          {formData.numerosPieza[0].numero && !guardadoAutomatico && (
            <span className={`badge ${60 - tiempoInactivo <= 10 ? 'bg-danger' : 'bg-warning'}`}>
              Guardado automático en: {60 - tiempoInactivo}s
            </span>
          )}
          <span className="badge bg-primary">
            Reportes guardados: {historicoReportes.length}
          </span>
        </div>
      </div>
    </Card.Header>
  );
};

export default Cabecera;