const express = require("express");
const db = require("../database/db");

const router = express.Router();

// Obtener todos los clientes
router.get("/", (req, res) => {
  db.all("SELECT * FROM clientes", [], (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(rows);
  });
});

// Obtener un cliente por cédula
router.get("/:cedula", (req, res) => {
  const { cedula } = req.params;
  db.get("SELECT * FROM clientes WHERE cedula = ?", [cedula], (err, cliente) => {
    if (err) {
      return res.status(500).json({ error: "Error consultando cliente" });
    }
    if (!cliente) {
      return res.status(404).json({ error: "Cliente no encontrado" });
    }

    // Obtener la última fecha de pago
    db.get(
      "SELECT fecha_pago, fecha_vencimiento FROM pagos WHERE cedula = ? ORDER BY id DESC LIMIT 1",
      [cedula],
      (err, pago) => {
        if (err) {
          return res.status(500).json({ error: "Error obteniendo pagos" });
        }

        // Determinar estado de la mensualidad
        const hoy = new Date();
        let estado = "Al día";
        let fechaUltimoPago = "No registra";
        let fechaHasta = "No registra";

        if (pago) {
          fechaUltimoPago = pago.fecha_pago;
          fechaHasta = pago.fecha_vencimiento;
          if (new Date(pago.fecha_vencimiento) < hoy) {
            estado = "Mensualidad vencida";
          }
        } else {
          estado = "No ha realizado pagos";
        }

        res.json({
          ...cliente,
          fecha_ultimo_pago: fechaUltimoPago,
          fecha_vencimiento: fechaHasta,
          estado,
        });
      }
    );
  });
});


//Registrar nueva mensualidad 
router.post("/mensualidad/:cedula", (req, res) => {
  const { cedula } = req.params;
  const { meses } = req.body;
  const hoy = new Date();
  const fechaPago = hoy.toISOString().split("T")[0];

  db.get(
    "SELECT fecha_vencimiento FROM pagos WHERE cedula = ? ORDER BY id DESC LIMIT 1",
    [cedula],
    (err, row) => {
      if (err) {
        return res.status(500).json({ error: "Error obteniendo última mensualidad" });
      }

      let fechaNueva;
      if (row && row.fecha_vencimiento) {
        let fechaActual = new Date(row.fecha_vencimiento);
        fechaActual.setMonth(fechaActual.getMonth() + meses);
        fechaNueva = fechaActual.toISOString().split("T")[0];
      } else {
        hoy.setMonth(hoy.getMonth() + meses);
        fechaNueva = hoy.toISOString().split("T")[0];
      }

      db.run(
        "INSERT INTO pagos (cedula, fecha_pago, fecha_vencimiento) VALUES (?, ?, ?)",
        [cedula, fechaPago, fechaNueva],
        (insertErr) => {
          if (insertErr) {
            return res.status(500).json({ error: "Error registrando pago" });
          }
          res.json({ mensaje: "Pago registrado", fecha_ultimo_pago: fechaPago, fecha_vencimiento: fechaNueva });
        }
      );
    }
  );
});





// Agregar un nuevo cliente
router.post("/", (req, res) => {
  const { nombre, cedula, contacto } = req.body;
  if (!nombre || !cedula) {
    res.status(400).json({ error: "Nombre y cédula son obligatorios" });
    return;
  }

  db.run(
    "INSERT INTO clientes (nombre, cedula, contacto) VALUES (?, ?, ?)",
    [nombre, cedula, contacto],
    function (err) {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      res.json({ id: this.lastID, nombre, cedula, contacto });
    }
  );
});

// Editar un cliente
router.put("/:cedula", (req, res) => {
  const { nombre, contacto } = req.body;
  const { cedula } = req.params;

  db.run(
    "UPDATE clientes SET nombre = ?, contacto = ? WHERE cedula = ?",
    [nombre, contacto, cedula],
    function (err) {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      res.json({ message: "Cliente actualizado correctamente" });
    }
  );
});

// Eliminar un cliente
router.delete("/:cedula", (req, res) => {
  const { cedula } = req.params;

  db.run("DELETE FROM clientes WHERE cedula = ?", [cedula], function (err) {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json({ message: "Cliente eliminado correctamente" });
  });
});

module.exports = router;
