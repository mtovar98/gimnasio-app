const sqlite3 = require("sqlite3").verbose();

const db = new sqlite3.Database("./database/gimnasio.db", (err) => {
  if (err) {
    console.error("Error al conectar con la base de datos:", err.message);
  } else {
    console.log("Conectado a la base de datos SQLite.");
  }
});

db.serialize(() => {
  db.run(
    `CREATE TABLE IF NOT EXISTS clientes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nombre TEXT NOT NULL,
      cedula TEXT UNIQUE NOT NULL,
      contacto TEXT,
      fecha_vencimiento TEXT
    )`,
    (err) => {
      if (err) {
        console.error("Error creando tabla:", err);
      } else {
        console.log("Tabla de clientes creada correctamente.");
      }
    }
  );

  db.run(
    `CREATE TABLE IF NOT EXISTS pagos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      cedula TEXT NOT NULL,
      fecha_pago TEXT NOT NULL,
      fecha_vencimiento TEXT NOT NULL,
      FOREIGN KEY (cedula) REFERENCES clientes (cedula)
    )`,
    (err) => {
      if (err) {
        console.error("Error creando tabla de pagos:", err);
      } else {
        console.log("Tabla de pagos creada correctamente.");
      }
    }
  );
  

  db.run(
    `CREATE TABLE IF NOT EXISTS mensualidades (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      cliente_id INTEGER,
      fecha_pago TEXT NOT NULL,
      estado TEXT NOT NULL DEFAULT 'Al día',
      FOREIGN KEY (cliente_id) REFERENCES clientes (id) ON DELETE CASCADE
    )`
  );
});

module.exports = db;
