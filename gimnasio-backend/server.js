const express = require("express");
const cors = require("cors");
const sqlite3 = require("sqlite3");
const { open } = require("sqlite");

const app = express();
app.use(express.json());
app.use(cors());

let db;

// Conectar a la base de datos SQLite
(async () => {
  db = await open({
    filename: "./gimnasio.db",
    driver: sqlite3.Database,
  });

  // Crear tabla si no existe
  await db.exec(`
    CREATE TABLE IF NOT EXISTS clientes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nombre TEXT NOT NULL,
      cedula TEXT UNIQUE NOT NULL,
      contacto TEXT,
      estado TEXT,
      fecha_ultimo_pago TEXT,
      fecha_vencimiento TEXT
    )
  `);
  

  console.log("📦 Base de datos conectada y lista.");
})();

// ✅ Ruta para obtener todos los clientes
app.get("/api/clientes", async (req, res) => {
  try {
    const clientes = await db.all("SELECT * FROM clientes");
    res.json(clientes);
  } catch (error) {
    res.status(500).json({ error: "Error al obtener clientes" });
  }
});

// ✅ Ruta para obtener un cliente por cédula
app.get("/api/clientes/:cedula", async (req, res) => {
  const { cedula } = req.params;
  try {
    const cliente = await db.get(
      "SELECT nombre, cedula, contacto, estado, fecha_ultimo_pago, fecha_vencimiento FROM clientes WHERE cedula = ?",
      [cedula]
    );
    if (!cliente) {
      return res.status(404).json({ error: "Cliente no encontrado" });
    }
    res.json(cliente);
  } catch (error) {
    res.status(500).json({ error: "Error al buscar cliente" });
  }
});



// ✅ Ruta para agregar un nuevo cliente
app.post("/api/clientes", async (req, res) => {
  const { cedula, nombre, contacto } = req.body;

  try {
    // Verificar si la cédula ya existe
    const clienteExistente = await db.get("SELECT * FROM clientes WHERE cedula = ?", [cedula]);

    if (clienteExistente) {
      return res.status(400).json({ error: "La cédula ya está registrada" });
    }

    // Insertar nuevo cliente
    await db.run(
      "INSERT INTO clientes (cedula, nombre, contacto, fecha_ultimo_pago, fecha_vencimiento) VALUES (?, ?, ?, NULL, NULL)",
      [cedula, nombre, contacto]
    );

    res.json({ mensaje: "Cliente agregado correctamente" });
  } catch (error) {
    res.status(500).json({ error: "Error al agregar cliente" });
  }
});



// ✅ Ruta para actualizar un cliente
app.put("/api/clientes/:cedula", async (req, res) => {
  const { cedula } = req.params;
  const { nombre } = req.body;
  try {
    await db.run("UPDATE clientes SET nombre = ? WHERE cedula = ?", [nombre, cedula]);
    res.json({ mensaje: "Cliente actualizado correctamente" });
  } catch (error) {
    res.status(500).json({ error: "Error al actualizar cliente" });
  }
});

// ✅ Ruta para eliminar un cliente
app.delete("/api/clientes/:cedula", async (req, res) => {
  const { cedula } = req.params;
  try {
    await db.run("DELETE FROM clientes WHERE cedula = ?", [cedula]);
    res.json({ mensaje: "Cliente eliminado correctamente" });
  } catch (error) {
    res.status(500).json({ error: "Error al eliminar cliente" });
  }
});

// ✅ Ruta para registrar un pago
app.post("/api/clientes/:cedula/pago", async (req, res) => {
  const { cedula } = req.params;
  const { fechaPago } = req.body;

  try {
    const cliente = await db.get("SELECT * FROM clientes WHERE cedula = ?", [cedula]);

    if (!cliente) {
      return res.status(404).json({ error: "Cliente no encontrado" });
    }

    // Obtener la fecha de pago
    const fechaPagoDate = new Date(fechaPago);
    const diaPago = fechaPagoDate.getDate();
    const mesPago = fechaPagoDate.getMonth();
    const anioPago = fechaPagoDate.getFullYear();

    // Calcular la nueva fecha de vencimiento (mismo día del mes siguiente)
    const nuevaFechaVencimiento = new Date(anioPago, mesPago + 1, diaPago);

    // Determinar nuevo estado
    const fechaActual = new Date();
    const nuevoEstado = nuevaFechaVencimiento > fechaActual ? "al día" : "pendiente";

    // Actualizar cliente con nueva fecha de pago y estado
    await db.run(
      "UPDATE clientes SET fecha_ultimo_pago = ?, fecha_vencimiento = ?, estado = ? WHERE cedula = ?",
      [fechaPago, nuevaFechaVencimiento.toISOString().split("T")[0], nuevoEstado, cedula]
    );

    // Obtener los datos actualizados del cliente
    const clienteActualizado = await db.get("SELECT * FROM clientes WHERE cedula = ?", [cedula]);

    res.json(clienteActualizado);
  } catch (error) {
    res.status(500).json({ error: "Error al registrar pago" });
  }
});




// Iniciar el servidor en el puerto 5000
const PORT = 5000;
app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
});
