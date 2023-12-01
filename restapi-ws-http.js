const express = require('express');
const bodyParser = require('body-parser');
const http = require('http');
const WebSocket = require('ws');
const path = require('path');

const app = express();
const httpPort = 8888;
const expressPort = 3000;
const wsPort = 8080;


// Create a WebSocket server for web clients
const wss = new WebSocket.Server({ port: wsPort });

// Create an HTTP server using Node's HTTP module
const httpServer = http.createServer(app);

// Serve static files
app.use(express.static(path.join(__dirname))); // Serve files to browsers from the current directory

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

// Start the HTTP server on port 8888
httpServer.listen(httpPort, () => {
  console.log(`HTTP Server running on port ${httpPort}`);
});

// Start the Express server on port 3000
app.listen(expressPort, () => {
  console.log(`Express Server running on port ${expressPort}`);
});

// Start the WebSocket server on port 8080
wss.on('listening', () => {
  console.log(`WebSocket Server running on port ${wsPort}`);
});
