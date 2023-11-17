const WebSocket = require('ws');
const http = require('http');

// Create an HTTP server
const server = http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.end('WebSocket server\n');
});

// Create a WebSocket server by passing the HTTP server instance
const wss = new WebSocket.Server({ server });

// Event listener for when a client connects to the WebSocket server
wss.on('connection', (ws) => {
  console.log('Client connected');

  // Event listener for messages from clients
  ws.on('message', (message) => {
    console.log(`Received message: ${message}`);

    // Broadcast the received message to all connected clients
    wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(message);
      }
    });
  });

  // Event listener for when a client disconnects
  ws.on('close', () => {
    console.log('Client disconnected');
  });
});

// Start the server on port 3000
const port = 8890;
server.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
