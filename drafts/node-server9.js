const net = require('net');
// Create an HTTP server for handling regular HTTP requests
const http = require('http');

// Array to store connected HTTP clients
const httpClients = [];


// Create a TCP server for the "data sender"
const tcpServer = net.createServer((socket) => {
  console.log('Data sender connected');

  socket.on('data', (data) => {
    const jsonData = data.toString(); // Assuming JSON data is received as a string
    console.log('Received data from data sender:', jsonData);

    // Broadcast the received data to all connected HTTP clients (if available)
    if (httpClients.length > 0) {
      httpClients.forEach((client) => {
        client.write(jsonData); // Write data to connected HTTP clients
      });
    }
  });

  socket.on('end', () => {
    console.log('Data sender disconnected');
  });
});

tcpServer.listen(3000, () => {
  console.log('TCP server listening on port 3000');
});


const httpServer = http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.end('HTTP server\n');
});

httpServer.listen(8080, () => {
  console.log('HTTP server listening on port 8080');
});

// Store connected HTTP clients
httpServer.on('connection', (client) => {
  console.log('HTTP client connected');
  httpClients.push(client);

  client.on('close', () => {
    console.log('HTTP client disconnected');
    httpClients.splice(httpClients.indexOf(client), 1);
  });
});
