import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function App() {
  const [cedula, setCedula] = useState("");
  const [cliente, setCliente] = useState(null);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const buscarCliente = async () => {
    setError("");
    try {
      const response = await axios.get(`http://localhost:5000/api/clientes/${cedula}`);
      setCliente(response.data);
    } catch (error) {
      setCliente(null);
      setError("Cliente no encontrado");
    }
  };

  return (
    <div style={{ padding: "20px", textAlign: "center" }}>
      <h2>Consulta de Clientes</h2>
      <input
        type="text"
        placeholder="Ingrese cédula"
        value={cedula}
        onChange={(e) => setCedula(e.target.value)}
      />
      <button onClick={buscarCliente}>Buscar</button>
      <button onClick={() => navigate("/clientes")}>Administrar Clientes</button>

      {error && <p style={{ color: "red" }}>{error}</p>}

      {cliente && (
        <div>
          <h3>{cliente.nombre}</h3>
          <p>Cédula: {cliente.cedula}</p>
          <p>Contacto: {cliente.contacto}</p>
          <p>Estado: <strong>{cliente.estado}</strong></p>
          <p>Último pago: {cliente.fecha_ultimo_pago || "No registra"}</p>
          <p>Hasta cuándo tiene pago: {cliente.fecha_vencimiento || "No registra"}</p>
        </div>
      )}
    </div>
  );
}

export default App;
