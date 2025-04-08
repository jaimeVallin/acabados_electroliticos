import { Card, Button } from 'react-bootstrap';

const DefectosForm = ({ defectos, selectedDefect, handleDefectoSelect }) => {
  return (
    <Card className="mb-4 shadow-sm">
      <Card.Body>
        <h4 className="mb-3 text-primary">Seleccione el defecto observado</h4>
        <div className="d-flex flex-wrap gap-2">
          {defectos.map((defecto) => (
            <Button
              key={defecto}
              variant={selectedDefect === defecto ? "primary" : "outline-primary"}
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
  );
};

export default DefectosForm;