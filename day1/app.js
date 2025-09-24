require('dotenv').config();
const express = require('express');
const app = express();
const port = process.env.PORT || 3000;

// Use environment variables for secrets
const API_KEY = process.env.API_KEY || "default-key";
const DB_PASSWORD = process.env.DB_PASSWORD || "default-pass";

const AWS_SECRET_KEY = "AKIAIOSFODNN7EXAMPLE";

app.get('/', (req, res) => {
  res.json({
    message: "Hello from DevSecOps Node.js app!",
    apiKey: API_KEY ? "Loaded from env" : "Not set"
  });
});

app.listen(port, () => {
  console.log(`App running on http://localhost:${port}`);
});
