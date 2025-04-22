const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');

const app = express();
const PORT = 5000;

// Enable CORS and JSON parsing
app.use(cors());
app.use(express.json());

// MySQL database connection config
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root', 
  password: 'root@123', 
  database: 'candata'
});

// Connect to DB
db.connect(err => {
  if (err) {
    console.error('MySQL connection error:', err);
  } else {
    console.log('✅ Connected to MySQL Database!');
  }
});

// API endpoint to fetch data from 'can_value'
app.get('/api/can-data', (req, res) => {
  db.query('SELECT * FROM can_value', (err, result) => {
    if (err) {
      console.error('Query error:', err);
      return res.status(500).json({ error: 'Database query failed' });
    }
    res.json(result);
  });
});

// Start the backend server
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
