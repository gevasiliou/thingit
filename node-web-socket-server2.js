const WebSocket = require('ws');
const http = require('http');

// Create an HTTP server on port 3000
const httpServer = http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.end('HTTP server\n');
});

// Create a WebSocket server
const wss = new WebSocket.Server({ noServer: true });

// Attach the WebSocket server to the HTTP server
httpServer.on('upgrade', (request, socket, head) => {
  wss.handleUpgrade(request, socket, head, (ws) => {
    wss.emit('connection', ws, request);
  });
});

// Event listener for when a client connects to the WebSocket server
wss.on('connection', (ws) => {
  console.log('WebSocket client connected');

  // Event listener for messages from clients
  ws.on('message', (message) => {
    console.log(`Received message from WebSocket client: ${message}`);
  });

  // Event listener for when a client disconnects
  ws.on('close', () => {
    console.log('WebSocket client disconnected');
  });
});

// Start the HTTP server on port 3000
const httpPort = 3000;
httpServer.listen(httpPort, () => {
  console.log(`HTTP server listening on port ${httpPort}`);
});

// No need to call listen() for the WebSocket server
