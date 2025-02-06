import React, { useState } from "react";
import axios from "axios";

function Clientes() {
  const [cedula, setCedula] = useState("");
  const [cliente, setCliente] = useState(null);
  const [error, setError] = useState("");
  const [acceso, setAcceso] = useState(false);
  const [password, setPassword] = useState("");
  const [fechaPago, setFechaPago] = useState("");

  // Estados para agregar un nuevo cliente
  const [nuevoNombre, setNuevoNombre] = useState("");
  const [nuevoCedula, setNuevoCedula] = useState("");
  const [nuevoContacto, setNuevoContacto] = useState("");

  // Verificar contraseña antes de acceder
  const verificarContraseña = () => {
    if (password === "1234") {
      setAcceso(true);
    } else {
      alert("Contraseña incorrecta");
    }
  };

  // Buscar cliente por cédula
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

  // Registrar un nuevo pago
  const registrarPago = async () => {
    if (!cliente) return alert("Busca un cliente antes de registrar el pago");

    try {
      const response = await axios.post(`http://localhost:5000/api/clientes/${cliente.cedula}/pago`, {
        fechaPago: fechaPago,
      });
      alert("Pago registrado correctamente");
      setCliente(response.data);
      setFechaPago("");
    } catch (error) {
      alert("Error al registrar el pago");
    }
  };

  // Agregar un nuevo cliente
  const agregarCliente = async () => {
    if (!nuevoNombre || !nuevoCedula || !nuevoContacto) {
      return alert("Todos los campos son obligatorios");
    }

    try {
      await axios.post("http://localhost:5000/api/clientes", {
        nombre: nuevoNombre,
        cedula: nuevoCedula,
        contacto: nuevoContacto,
      });

      alert("Cliente agregado correctamente");
      setNuevoNombre("");
      setNuevoCedula("");
      setNuevoContacto("");
    } catch (error) {
      alert("Error al agregar cliente");
    }
  };

  // Pantalla de ingreso de contraseña
  if (!acceso) {
    return (
      <div style={{ padding: "20px", textAlign: "center" }}>
        <h2>Ingrese la Contraseña</h2>
        <input
          type="password"
          placeholder="Contraseña"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button onClick={verificarContraseña}>Ingresar</button>
      </div>
    );
  }

  // Pantalla de gestión de clientes
  return (
    <div style={{ padding: "20px", textAlign: "center" }}>
      <h2>Gestión de Clientes</h2>

      {/* Buscar Cliente */}
      <input
        type="text"
        placeholder="Ingrese cédula"
        value={cedula}
        onChange={(e) => setCedula(e.target.value)}
      />
      <button onClick={buscarCliente}>Buscar</button>

      {error && <p style={{ color: "red" }}>{error}</p>}

      {cliente && (
        <div>
          <h3>{cliente.nombre}</h3>
          <p>Cédula: {cliente.cedula}</p>
          <p>Contacto: {cliente.contacto}</p>
          <p>Estado: <strong>{cliente.estado}</strong></p>
          <p>Último pago: {cliente.fecha_ultimo_pago || "No registra"}</p>
          <p>Hasta cuándo tiene pago: {cliente.fecha_vencimiento || "No registra"}</p>

          {/* Campo para agregar un nuevo pago */}
          <h3>Registrar Nuevo Pago</h3>
          <input
            type="date"
            value={fechaPago}
            onChange={(e) => setFechaPago(e.target.value)}
          />
          <button onClick={registrarPago}>Registrar Pago</button>
        </div>
      )}

      {/* Formulario para agregar un nuevo cliente */}
      <div>
      <h2>Agregar Nuevo Cliente</h2>
      <input
        type="text"
        placeholder="Nombre"
        value={nuevoNombre}
        onChange={(e) => setNuevoNombre(e.target.value)}
      />
      <br></br>
      <input
        type="text"
        placeholder="Cédula"
        value={nuevoCedula}
        onChange={(e) => setNuevoCedula(e.target.value)}
      />
      <br></br>
      <input
        type="text"
        placeholder="Contacto"
        value={nuevoContacto}
        onChange={(e) => setNuevoContacto(e.target.value)}
      />
      <br></br>
      <button onClick={agregarCliente}>Agregar Cliente</button>
      </div>
    </div>
  );
}

export default Clientes;
