const net = require('net');
const WebSocket = require('ws');

// Create a WebSocket server for web clients
const wss = new WebSocket.Server({ port: 8080 }); // Adjust the port number

// Array to store connected WebSocket clients
const clients = [];

wss.on('connection', (ws, req) => {
  const clientIP = req.connection.remoteAddress;
  clients.push(ws);  
  console.log(`[websock-srv]: WebSocket Client connected from ${clientIP}`);

//wss.on('connection', (ws) => {
//  clients.push(ws);  
//  console.log('[websock-srv]: WebSocket Client connected');
//  console.log(ws);  //this will print a ton of ws client info - maybe usefull for debuging
// clients.push(ws) : ws is the WebSocket Client, push is the method to fill the clients array

  ws.on('close', () => {
    // Remove disconnected clients
    clients.splice(clients.indexOf(ws), 1);
  });

  ws.on('message', (message) => {
    console.log(`[websock-srv]: Received message from WebSocket client ${clientIP}: ${message}`);
  });

});

// Create a TCP server for the "data sender"
const tcpServer = net.createServer((socket) => {
  const TCPClientIP = socket.remoteAddress;
  console.log(`[tcp-srv]: Data sender connected ${TCPClientIP}`);

  socket.on('data', (data) => {
    const jsonData = data.toString(); // Assuming JSON data is received as a string
    console.log(`[tcp-srv]: Received data from data sender ${TCPClientIP}:`, jsonData);

    // Broadcast the received data to all WebSocket clients
    clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(jsonData);
      }
    });
  });

  socket.on('end', () => {
    console.log(`[tcp-srv]: Data sender ${TCPClientIP} disconnected`);
  });
});

tcpServer.listen(3000, () => {
  console.log('TCP server listening on port 3000');
});
