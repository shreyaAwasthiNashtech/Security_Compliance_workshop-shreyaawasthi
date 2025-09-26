const express = require('express');
const app = express();
const port = process.env.PORT || 3001;

app.get('/', (req, res) => {
  res.send(`<html><body><h1>day2 Custom App</h1><div>Try /user?id=123 or /search?q=hello</div></body></html>`);
});

// Simulated injection risk (no DB here, echo only)
app.get('/user', (req, res) => {
  const id = req.query.id || '';
  // BAD: directly echoing user input (simulates unsafe usage)
  res.send(`<html><body><h1>User lookup</h1><div>Fetching user with id: ${id}</div></body></html>`);
});

// Reflected XSS endpoint
app.get('/search', (req, res) => {
  const q = req.query.q || '';
  // BAD: reflected XSS - unescaped user input displayed in HTML
  res.send(`<html><body><h1>Search results</h1><div>Results for: ${q}</div></body></html>`);
});

app.listen(port, () => {
  console.log(`day2 custom app listening at http://localhost:${port}`);
});
