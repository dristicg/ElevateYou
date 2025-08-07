const express = require('express');
const cors = require('cors');
const pool = require('./db');
require('dotenv').config();
const multer = require('multer');

const app = express();
app.use(cors());
app.use(express.json());

const authRoutes = require('./auth.routes');
app.use('/api/auth', authRoutes);

app.get('/test-db', async (req, res) => {
  try {
    const result = await pool.query('SELECT NOW()');
    res.json(result.rows[0]);
  } catch (err) {
    console.error("❌ DB query failed:", err);
    res.status(500).send('DB connection failed');
  }
});

app.listen(process.env.PORT, () => {
  console.log(`✅ Server running on port ${process.env.PORT}`);
});



//// set up multer storage 

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/'); // Ensure this folder exists or create it
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + '-' + file.originalname);
  }
});

const upload = multer({ storage: storage });

// resume upload route

app.post('/upload-resume', upload.single('resume'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }

  res.status(200).json({
    message: 'Resume uploaded successfully',
    filename: req.file.filename,
    path: req.file.path
  });
});
