const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");

const app = express();
const port = 4000;

// Konfigurasi koneksi database
const mysql = require('mysql2');
require('dotenv').config();

const db = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
});

module.exports = db;

// Pastikan koneksi database berhasil
db.connect((err) => {
  if (err) {
    console.log("Error connecting to the database:", err);
    process.exit(1); // Hentikan aplikasi jika gagal koneksi
  }
  console.log("Connected to the database");
});

// Middleware untuk parsing JSON dan mengatasi masalah CORS
app.use(express.json());
app.use(cors());

// General Route untuk menampilkan file HTML
app.get("/", (req, res) => {
  res.sendFile(__dirname + "/index.html"); // File index.html harus berada di root direktori
});

// GET Method
app.get("/api/users", (req, res) => {
  db.query("SELECT * FROM users", (err, results) => {
    if (err) {
      console.log("Query Error:", err);
      return res.status(500).json({ error: "Something went wrong" });
    }
    res.json(results);
  });
});

// POST Method
app.post("/api/users", (req, res) => {
  const { name, age } = req.body;

  // Validasi input data
  if (!name || typeof name !== "string") {
    return res.status(400).json({ error: "Invalid 'name'. It must be a non-empty string." });
  }
  if (!age || !Number.isInteger(age)) {
    return res.status(400).json({ error: "Invalid 'age'. It must be an integer." });
  }

  console.log("Data received:", req.body); // Log untuk debug

  const query = "INSERT INTO users (name, age) VALUES (?, ?)";
  db.query(query, [name, age], (err, results) => {
    if (err) {
      console.log("Query Error:", err);
      return res.status(500).json({ error: "Something went wrong" });
    }
    console.log("New user added with ID:", results.insertId); // Log ID user yang baru ditambahkan
    res.status(201).json({ id: results.insertId, name, age });
  });
});

// PUT Method
app.put("/api/users/:id", (req, res) => {
  const { id } = req.params;
  const { name, age } = req.body;

  const query = "UPDATE users SET name = ?, age = ? WHERE id = ?";
  db.query(query, [name, age, id], (err, results) => {
    if (err) {
      console.log("Query Error:", err);
      return res.status(500).json({ error: "Something went wrong" });
    }
    if (results.affectedRows === 0) {
      return res.status(404).json({ error: "User not found" });
    }
    res.json({ id, name, age });
  });
});

// DELETE Method
app.delete("/api/users/:id", (req, res) => {
  const { id } = req.params;
  const query = "DELETE FROM users WHERE id = ?";
  db.query(query, [id], (err, results) => {
    if (err) {
      console.log("Query Error:", err);
      return res.status(500).json({ error: "Something went wrong" });
    }
    if (results.affectedRows === 0) {
      return res.status(404).json({ error: "User not found" });
    }
    res.json({ message: "User deleted" });
  });
});

// Jalankan server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
