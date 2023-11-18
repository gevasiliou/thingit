// This is a pure restapi that only prints on terminal data received by POST or GET
const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const port = 3000;

// Middleware to parse incoming request bodies
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.post('/', (req, res) => {
  const payload = req.body;
  console.log('[restapi] Remote IP ',req.ip,' - Data Received by POST:', payload);
  res.status(200).send('Data received successfully');
});

app.get('/', (req, res) => {
  const queryData = req.query;
  console.log('[restapi] Remote IP ',req.ip,' - Data received from URL query with GET:', queryData);
  res.status(200).send('URL data received successfully');
});


// Start the server
app.listen(port, () => {
  console.log(`Rest API Server running on port ${port}`);
});
