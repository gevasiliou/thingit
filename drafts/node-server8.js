const net = require('net');
const http = require('http');
const { Server: WebSocketServer } = require('ws');
//const { Server: WebSocketServer } = require('socket.io');
// Create an HTTP server for handling regular HTTP requests
const httpServer = http.createServer((req, res) => {
      res.writeHead(200, {
      'Content-Type': 'text/plain',
      'Access-Control-Allow-Origin': '*' // Allowing access from any origin (CORS)
    });
  //res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.end('HTTP server\n');
});

// Start the HTTP server on port 8080
httpServer.listen(8080, () => {
  console.log('HTTP server listening on port 8080');
});

// Create a WebSocket server
const wss = new WebSocketServer({ server: httpServer });

wss.on('connection', (ws) => {
  console.log('WebSocket connected');

  ws.on('message', (message) => {
    console.log(`Received message from WebSocket client: ${message}`);
  });
});

// Create a TCP server for the "data sender"
const tcpServer = net.createServer((socket) => {
  console.log('Data sender connected');

  socket.on('data', (data) => {
    const jsonData = data.toString(); // Assuming JSON data is received as a string
    console.log('Received data from data sender:', jsonData);

    // Broadcast the received data to all WebSocket clients
    wss.clients.forEach((client) => {
      if (client.readyState === WebSocketServer.OPEN) {
        client.send(jsonData);
      }
    });
  });

  socket.on('end', () => {
    console.log('Data sender disconnected');
  });
});

tcpServer.listen(3000, () => {
  console.log('TCP server listening on port 3000');
});

//https://stackoverflow.com/questions/4388609/nodejs-and-html5-websockets-not-working-together
