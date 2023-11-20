const WebSocket = require('ws');
const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const port = 3000;
// Create a WebSocket server for web clients
const wss = new WebSocket.Server({ port: 8080 }); // Adjust the port number

// Array to store connected WebSocket clients
const clients = [];

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

function sendToAllClients(data) {
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(data));
    }
  });
}

wss.on('connection', (ws, req) => {
  const clientIP = req.connection.remoteAddress;
  clients.push(ws);  
  console.log(`[websock-srv]: WebSocket Client connected from ${clientIP}`);

  ws.on('close', () => {
    // Remove disconnected clients
    clients.splice(clients.indexOf(ws), 1);
  });

  ws.on('message', (message) => {
    console.log(`[websock-srv]: Received message from WebSocket client ${clientIP}: ${message}`);
  });

});

app.post('/', (req, res) => {
  // Extract the payload from the request body
  const payload = req.body;

  console.log('[restapi] Remote IP ', req.ip, ' - Data Received with POST:', payload);

  // Your processing logic here
  sendToAllClients(payload);
  res.status(200).send('Data received successfully');
});

app.get('/', (req, res) => {
  // Extract the data from the URL query parameters
  const queryData = req.query;

  console.log('[restapi] Remote IP ',req.ip,' - Data received from URL query with GET:', queryData);

  // Your processing logic here for URL query parameters
  sendToAllClients(queryData);
  res.status(200).send('URL data received successfully');
});



// Start the REST API server
app.listen(port, () => {
  console.log(`Rest API Server running on port ${port}`);
});
