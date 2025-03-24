import React, { useState } from "react";
import { supabase } from "../supabaseClient"; 

const CheckListTinas = () => {
  const [formData, setFormData] = useState({
    line: "",
    temperature: "",
    amperage: "",
    level: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.line || !formData.temperature || !formData.amperage || !formData.level) {
      alert("Por favor, completa todos los campos");
      return;
    }
    try {
      const { data, error } = await supabase
        .from("checklists")
        .insert([formData]);
      if (error) throw error;
      console.log("Datos guardados:", data);
      alert("Checklist guardado correctamente");
    } catch (error) {
      console.error("Error al guardar:", error.message);
      alert("Error al guardar el checklist");
    }
  };

  return (
    <div>
      <h1>Check-List de tinas</h1>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Línea</label>
          <input
            type="text"
            name="line"
            value={formData.line}
            onChange={handleChange}
            placeholder="Seleccionar Línea"
          />
        </div>
        <div>
          <label>Temperatura</label>
          <input
            type="text"
            name="temperature"
            value={formData.temperature}
            onChange={handleChange}
            placeholder="55 - 90 °C"
          />
        </div>
        <div>
          <label>Amperaje</label>
          <input
            type="text"
            name="amperage"
            value={formData.amperage}
            onChange={handleChange}
            placeholder="100 - 500 amp"
          />
        </div>
        <div>
          <label>Nivel</label>
          <input
            type="text"
            name="level"
            value={formData.level}
            onChange={handleChange}
            placeholder="Que tape las piezas"
          />
        </div>
        <button type="submit">Guardar</button>
      </form>
    </div>
  );
};

export default CheckListTinas;