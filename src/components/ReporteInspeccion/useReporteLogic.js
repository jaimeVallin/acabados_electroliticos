import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../supabase/client';
import * as XLSX from 'xlsx';

export const useReporteLogic = () => {
  const navigate = useNavigate();

  // Estados principales
  const [numeroReporte, setNumeroReporte] = useState(() => {
    const saved = localStorage.getItem('numeroReporte');
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
    const saved = localStorage.getItem('reportesInspeccion');
    return saved ? JSON.parse(saved) : [];
  });

  const [tiempoInactivo, setTiempoInactivo] = useState(0);
  const [guardadoAutomatico, setGuardadoAutomatico] = useState(false);

  const defectos = [
    "MANCHA NEGRA",
    "TORNA SOL",
    "ESCURRIMIENTO",
    "ASPERO",
    "QUEIMADURA",
    "OPACO",
    "PUNTO DE CONTACTO",
    "COLOR DESIGUAL",
    "OXIDO",
    "OTRO",
  ];

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) navigate("/login");
    };
    checkAuth();
  }, [navigate]);

  useEffect(() => {
    localStorage.setItem('numeroReporte', numeroReporte.toString());
  }, [numeroReporte]);

  useEffect(() => {
    localStorage.setItem('reportesInspeccion', JSON.stringify(historicoReportes));
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
      .filter(val => val !== undefined)
      .reduce((sum, val) => {
        if (Array.isArray(val)) return sum + val.reduce((s, v) => s + (parseInt(v) || 0), 0);
        return sum + (parseInt(val) || 0);
      }, 0);

    setFormData(prev => ({ ...prev, totalOK: Math.max(0, totalInspeccionadas - totalDefectos) }));
  }, [formData.defectos, totalInspeccionadas]);

  useEffect(() => {
    let intervalo;
    if (formData.numerosPieza[0].numero && !guardadoAutomatico) {
      intervalo = setInterval(() => {
        setTiempoInactivo(prev => {
          if (prev >= 60) {
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
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handlePiezaChange = (index, field, value) => {
    resetearTemporizador();
    const newNumerosPieza = [...formData.numerosPieza];
    newNumerosPieza[index][field] = value;
    setFormData(prev => ({ ...prev, numerosPieza: newNumerosPieza }));
  };

  const agregarPieza = () => {
    resetearTemporizador();
    if (formData.numerosPieza.length < 2) {
      setFormData(prev => ({
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
      setFormData(prev => ({
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

    setFormData(prev => ({
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
        numeroReporte,
        totalInspeccionadas,
        fecha: new Date().toISOString(),
        usuario: (await supabase.auth.getSession()).data.session?.user.email,
      };

      setHistoricoReportes(prev => [...prev, dataToSend]);
      setNumeroReporte(prev => prev + 1);
      
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

  const enviarASupabase = async () => {
    try {
      setLoading(true);
      if (historicoReportes.length === 0) {
        throw new Error("No hay reportes para enviar");
      }

      const { error } = await supabase
        .from("reportes_inspeccion")
        .insert(historicoReportes);

      if (error) throw error;

      localStorage.removeItem('reportesInspeccion');
      setHistoricoReportes([]);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
      
    } catch (err) {
      setError(err.message || "Error al enviar reportes a Supabase");
    } finally {
      setLoading(false);
    }
  };

  const prepararDatosParaExcel = () => {
    const encabezados = [
      "No.",
      "NÚMERO DE REPORTE",
      "DEFECTO",
      "MANCHA NEGRA",  
      "TORNA SOL",  
      "ESCURRIMIENTO",  
      "ASPERO",  
      "QUEIMADURA",  
      "OPACO",  
      "PUNTO DE CONTACTO",  
      "COLOR DESIGUAL",  
      "OXIDO",  
      "OTRO",  
      "CANTIDAD NOK",  
      "CANTIDAD OK",  
      "TOTAL INSPECCIONADAS",  
      "HORA DE SALIDA",  
      "FEPI-05"
    ];

    const filas = historicoReportes.map((reporte, index) => {
      return [
        index + 1,
        reporte.numeroReporte,
        "",
        reporte.defectos["MANCHA NEGRA"] || "0",
        reporte.defectos["TORNA SOL"] || "0",
        reporte.defectos["ESCURRIMIENTO"] || "0",
        reporte.defectos["ASPERO"] || "0",
        reporte.defectos["QUEIMADURA"] || "0",
        reporte.defectos["OPACO"] || "0",
        reporte.defectos["PUNTO DE CONTACTO"] || "0",
        reporte.defectos["COLOR DESIGUAL"] || "0",
        reporte.defectos["OXIDO"] || "0",
        reporte.defectos["OTRO"] || "0",
        Object.values(reporte.defectos).reduce((sum, val) => {
          if (Array.isArray(val)) return sum + val.reduce((s, v) => s + (parseInt(v) || 0), 0);
          return sum + (parseInt(val) || 0);
        }, 0),
        reporte.totalOK,
        reporte.totalInspeccionadas,
        new Date(reporte.fecha).toLocaleTimeString('es-MX'),
        "1"
      ];
    });

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
    
    if (!ws["!cols"]) ws["!cols"] = [];
    const anchosColumnas = [5, 15, 15, 12, 12, 12, 10, 10, 10, 15, 15, 10, 10, 12, 12, 15, 12, 10];
    anchosColumnas.forEach((width, i) => {
      ws["!cols"][i] = { width };
    });
    
    ws["!merges"] = [
      { s: { r: 1, c: 0 }, e: { r: 1, c: 17 } },
      { s: { r: 3, c: 0 }, e: { r: 4, c: 0 } },
      { s: { r: 3, c: 1 }, e: { r: 4, c: 1 } },
      { s: { r: 3, c: 2 }, e: { r: 4, c: 2 } }
    ];

    if (!ws["A2"].s) ws["A2"].s = {};
    ws["A2"].s = {
      font: { sz: 16, bold: true },
      alignment: { horizontal: "center" }
    };

    for (let c = 0; c < datos[3].length; c++) {
      const cell = XLSX.utils.encode_cell({r: 3, c});
      if (!ws[cell]) ws[cell] = {};
      if (!ws[cell].s) ws[cell].s = {};
      ws[cell].s = {
        font: { bold: true, color: { rgb: "FFFFFF" } },
        fill: { fgColor: { rgb: "4472C4" } },
        alignment: { horizontal: "center", vertical: "center" }
      };
    }

    XLSX.utils.book_append_sheet(wb, ws, "Reporte Inspección");
    XLSX.writeFile(wb, `Reporte_Inspeccion_Linea3_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  const limpiarReportes = () => {
    if (window.confirm("¿Estás seguro de querer eliminar todos los reportes guardados localmente?")) {
      localStorage.removeItem('reportesInspeccion');
      localStorage.setItem('numeroReporte', '1');
      setHistoricoReportes([]);
      setNumeroReporte(1);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    }
  };

  return {
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
  };
};