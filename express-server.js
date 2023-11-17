const express = require('express');

const app = express();
const port = 8080;

// A basic route to test connections
app.get('/', (req, res) => {
  res.send('Hello from Express server!');
});

// Start the Express server
app.listen(port, () => {
  console.log(`Express server listening on port ${port}`);
});
