const net = require('net');
const WebSocket = require('ws');

// Create a WebSocket server for web clients
const wss = new WebSocket.Server({ port: 8080 }); // Adjust the port number

// Array to store connected WebSocket clients
const clients = [];

wss.on('connection', (ws) => {
  clients.push(ws);  //ws is the WebSocket Client, push is the method to fill the clients array
  console.log('[websock-srv]: WebSocket connected');

  ws.on('close', () => {
    // Remove disconnected clients
    clients.splice(clients.indexOf(ws), 1);
  });

  ws.on('message', (message) => {
    console.log(`[websock-srv]: Received message from WebSocket client: ${message}`);
  });

});

// Create a TCP server for the "data sender"
const tcpServer = net.createServer((socket) => {
  console.log('[tcp-srv]: Data sender connected');

  socket.on('data', (data) => {
    const jsonData = data.toString(); // Assuming JSON data is received as a string
    console.log('[tcp-srv]: Received data from data sender:', jsonData);

    // Broadcast the received data to all WebSocket clients
    clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(jsonData);
      }
    });
  });

  socket.on('end', () => {
    console.log('[tcp-srv]: Data sender disconnected');
  });
});

tcpServer.listen(3000, () => {
  console.log('TCP server listening on port 3000');
});
