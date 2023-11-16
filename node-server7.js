const net = require('net');
const WebSocket = require('ws');

// Create a WebSocket server for web clients
const wss = new WebSocket.Server({ port: 8080 }); // Adjust the port number

// Array to store connected WebSocket clients
const clients = [];

wss.on('connection', (ws) => {
  clients.push(ws);

  ws.on('close', () => {
    // Remove disconnected clients
    clients.splice(clients.indexOf(ws), 1);
  });
});

// Create a TCP server for the "data sender"
const tcpServer = net.createServer((socket) => {
  console.log('Data sender connected');

  socket.on('data', (data) => {
    const jsonData = data.toString(); // Assuming JSON data is received as a string
    console.log('Received data from data sender:', jsonData);

    // Broadcast the received data to all WebSocket clients
    clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
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
