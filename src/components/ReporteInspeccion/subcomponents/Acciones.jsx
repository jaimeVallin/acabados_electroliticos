import { Button } from 'react-bootstrap';

const Acciones = ({ loading, historicoReportes, exportarAExcel, enviarASupabase, limpiarReportes }) => {
  return (
    <>
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
    </>
  );
};

export default Acciones;