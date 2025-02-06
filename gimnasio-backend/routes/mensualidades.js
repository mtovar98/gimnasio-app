const express = require("express");
const db = require("../database/db");

const router = express.Router();

// Obtener mensualidades de un cliente por cédula
router.get("/:cedula", (req, res) => {
  const { cedula } = req.params;

  db.get("SELECT id FROM clientes WHERE cedula = ?", [cedula], (err, cliente) => {
    if (err || !cliente) {
      res.status(404).json({ message: "Cliente no encontrado" });
      return;
    }

    db.all(
      "SELECT * FROM mensualidades WHERE cliente_id = ? ORDER BY fecha_pago DESC",
      [cliente.id],
      (err, rows) => {
        if (err) {
          res.status(500).json({ error: err.message });
          return;
        }
        res.json(rows);
      }
    );
  });
});

// Agregar una nueva mensualidad a un cliente
router.post("/", (req, res) => {
  const { cedula, fecha_pago } = req.body;

  db.get("SELECT id FROM clientes WHERE cedula = ?", [cedula], (err, cliente) => {
    if (err || !cliente) {
      res.status(404).json({ message: "Cliente no encontrado" });
      return;
    }

    db.run(
      "INSERT INTO mensualidades (cliente_id, fecha_pago, estado) VALUES (?, ?, 'Al día')",
      [cliente.id, fecha_pago],
      function (err) {
        if (err) {
          res.status(500).json({ error: err.message });
          return;
        }
        res.json({ message: "Mensualidad agregada correctamente" });
      }
    );
  });
});

// Actualizar estado de una mensualidad
router.put("/:id", (req, res) => {
  const { estado } = req.body;
  const { id } = req.params;

  db.run(
    "UPDATE mensualidades SET estado = ? WHERE id = ?",
    [estado, id],
    function (err) {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      res.json({ message: "Estado de mensualidad actualizado" });
    }
  );
});

module.exports = router;
