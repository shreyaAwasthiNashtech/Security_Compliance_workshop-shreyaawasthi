require('dotenv').config();
const express = require('express');
const app = express();
const port = process.env.PORT || 3000;

// const AWS_SECRET_KEY = "AKIAIOSFODNN7EXAMPLE";  

app.get('/', (req, res) => {
  res.send(`Hello DevSecOps! API key (env): ${!!process.env.MY_API_KEY}`);
});

app.listen(port, () => console.log(`App running on http://localhost:${port}`));
