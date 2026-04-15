const express = require("express");
const mysql = require("mysql");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "sendik",
});

db.connect(err => {
  if (err) throw err;
  console.log("Database connected");
});

// UPDATE STATUS PERMOHONAN
app.put("/permohonan/:id", (req, res) => {
  const { status } = req.body;
  const { id } = req.params;

  const sql = "UPDATE permohonan SET status=? WHERE id=?";
  db.query(sql, [status, id], (err) => {
    if (err) return res.status(500).send(err);
    res.send({ status: "success" });
  });
});


// SIMPAN PERMOHONAN
app.post("/permohonan", (req, res) => {
  const data = req.body;

  const sql = `
    INSERT INTO permohonan 
    (tempat, jenis_permohonan, jumlah, keterangan, diterimaoleh, disetujuioleh, diajukanoleh, tanggal, status)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'pending')
  `;

  db.query(sql, [
    data.tempat,
    data.jenis_permohonan,
    data.jumlah,
    data.keterangan,
    data.diterimaoleh,
    data.disetujuioleh,
    data.diajukanoleh,
    data.tanggal
  ], (err) => {
    if (err) return res.status(500).send(err);
    res.send({ status: "success" });
  });
});

// AMBIL DATA UNTUK ADMIN
app.get("/permohonan", (req, res) => {
  db.query("SELECT * FROM permohonan ORDER BY id DESC", (err, result) => {
    if (err) return res.status(500).send(err);
    res.json(result);
  });
});

app.listen(3001, () => {
  console.log("Server running on port 3001");
});
